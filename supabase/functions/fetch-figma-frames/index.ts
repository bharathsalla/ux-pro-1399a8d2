import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function parseFigmaUrl(url: string): { fileKey: string; nodeId?: string } | null {
  const patterns = [/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      const fileKey = match[1];
      const urlObj = new URL(url);
      const nodeId = urlObj.searchParams.get("node-id") || undefined;
      return { fileKey, nodeId };
    }
  }
  return null;
}

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
}

function extractFrames(node: FigmaNode): { id: string; name: string }[] {
  const frames: { id: string; name: string }[] = [];
  if (node.type === "CANVAS" && node.children) {
    for (const child of node.children) {
      if (
        child.type === "FRAME" ||
        child.type === "COMPONENT" ||
        child.type === "COMPONENT_SET" ||
        child.type === "SECTION"
      ) {
        frames.push({ id: child.id, name: child.name });
      }
    }
  } else if (node.children) {
    for (const child of node.children) {
      frames.push(...extractFrames(child));
    }
  }
  return frames;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(
  url: string,
  headers: Record<string, string>,
  maxRetries = 3
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, { headers });

    if (response.status === 429) {
      if (attempt < maxRetries) {
        // Exponential backoff: 2s, 4s, 8s
        const waitMs = Math.pow(2, attempt + 1) * 1000;
        console.log(`Rate limited (429). Retrying in ${waitMs}ms (attempt ${attempt + 1}/${maxRetries})`);
        await delay(waitMs);
        continue;
      }
    }

    return response;
  }

  // Should not reach here, but just in case
  return await fetch(url, { headers });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { figmaUrl } = await req.json();

    if (!figmaUrl) {
      return new Response(
        JSON.stringify({ error: "figmaUrl is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const FIGMA_ACCESS_TOKEN = Deno.env.get("FIGMA_ACCESS_TOKEN");
    if (!FIGMA_ACCESS_TOKEN) {
      return new Response(
        JSON.stringify({ error: "FIGMA_ACCESS_TOKEN is not configured. Please add your Figma token." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const parsed = parseFigmaUrl(figmaUrl);
    if (!parsed) {
      return new Response(
        JSON.stringify({ error: "Invalid Figma URL. Please provide a valid Figma file or design link." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { fileKey } = parsed;
    const figmaHeaders = { "X-Figma-Token": FIGMA_ACCESS_TOKEN };

    // 1. Fetch file structure
    console.log("Fetching Figma file:", fileKey);
    const fileResponse = await fetchWithRetry(
      `https://api.figma.com/v1/files/${fileKey}?depth=2`,
      figmaHeaders
    );

    if (!fileResponse.ok) {
      const errorText = await fileResponse.text();
      console.error("Figma API error:", fileResponse.status, errorText);
      if (fileResponse.status === 403) {
        return new Response(
          JSON.stringify({ error: "Access denied. Make sure your Figma token has access to this file." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (fileResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Figma API rate limit reached. Please wait a minute and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: `Figma API error: ${fileResponse.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fileData = await fileResponse.json();
    const fileName = fileData.name || "Untitled";

    // 2. Extract all top-level frames from all pages
    const allFrames: { id: string; name: string }[] = [];
    if (fileData.document?.children) {
      for (const page of fileData.document.children) {
        allFrames.push(...extractFrames(page));
      }
    }

    if (allFrames.length === 0) {
      return new Response(
        JSON.stringify({ error: "No frames found in this Figma file." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Limit to max 12 frames to reduce API pressure
    const framesToExport = allFrames.slice(0, 12);

    // 3. Export frames as images — single request with all IDs at scale=1
    // If that fails, fall back to batches of 4
    const allImages: Record<string, string> = {};
    const allNodeIds = framesToExport.map((f) => f.id).join(",");

    console.log(`Exporting ${framesToExport.length} frames as images (single request)`);

    // Wait 500ms after file fetch to avoid rate limiting
    await delay(500);

    const singleResponse = await fetchWithRetry(
      `https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(allNodeIds)}&format=png&scale=1`,
      figmaHeaders
    );

    if (singleResponse.ok) {
      const imageData = await singleResponse.json();
      Object.assign(allImages, imageData.images || {});
    } else if (singleResponse.status === 429) {
      // Rate limited even after retries
      return new Response(
        JSON.stringify({ error: "Figma API rate limit reached. Please wait a minute and try again." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Single request failed (likely render timeout) — fall back to batches
      console.log("Single request failed, falling back to batches");
      const BATCH_SIZE = 4;

      for (let i = 0; i < framesToExport.length; i += BATCH_SIZE) {
        if (i > 0) await delay(1500); // 1.5s delay between batches

        const batch = framesToExport.slice(i, i + BATCH_SIZE);
        const nodeIds = batch.map((f) => f.id).join(",");

        console.log(`Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} frames`);

        const batchResponse = await fetchWithRetry(
          `https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(nodeIds)}&format=png&scale=1`,
          figmaHeaders
        );

        if (batchResponse.ok) {
          const batchData = await batchResponse.json();
          Object.assign(allImages, batchData.images || {});
        } else if (batchResponse.status === 429) {
          return new Response(
            JSON.stringify({ error: "Figma API rate limit reached. Please wait a minute and try again." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } else {
          console.error(`Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`, batchResponse.status);
          // Continue with remaining batches
        }
      }
    }

    // 4. Build response
    const frames = framesToExport
      .map((frame) => ({
        id: frame.id,
        name: frame.name,
        nodeId: frame.id,
        imageUrl: allImages[frame.id] || null,
      }))
      .filter((f) => f.imageUrl !== null);

    console.log(`Successfully extracted ${frames.length} frames from "${fileName}"`);

    return new Response(
      JSON.stringify({
        fileName,
        fileKey,
        frames,
        totalFrames: allFrames.length,
        exportedFrames: frames.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("fetch-figma-frames error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
