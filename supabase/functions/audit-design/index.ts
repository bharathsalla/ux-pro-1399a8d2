import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PERSONA_PROMPTS: Record<string, string> = {
  solo: `You are a senior product designer doing a quick pre-handoff quality check. Focus on: spacing/grid alignment (8pt grid), typography hierarchy, button consistency, contrast ratios, auto-layout issues. Use practical design language.`,
  lead: `You are a UX Lead reviewing a junior designer's work. Focus on: naming conventions, component detachment, padding consistency, typography scale, design token usage, cross-screen consistency. Be structured and detailed.`,
  a11y: `You are an accessibility specialist doing a WCAG compliance audit. Focus on: contrast ratios (4.5:1 minimum for AA), touch target sizes (44px minimum), text sizing (minimum 12px), color-only meaning, focus states, screen reader compatibility. Weight accessibility issues 40% higher.`,
  founder: `You are advising a startup founder. Translate UX issues into business language. Focus on: visual consistency, mobile readiness, user trust signals, CTA prominence, overall "does this look professional?" Use simple, jargon-free language.`,
  consultant: `You are a UX consultant conducting a formal heuristic evaluation using Nielsen's 10 heuristics. Focus on: visibility of system status, error prevention, consistency, cognitive load, conversion clarity, interaction patterns. Be formal and thorough.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, personaId, fidelity, purpose } = await req.json();

    if (!imageBase64 || !personaId) {
      return new Response(
        JSON.stringify({ error: "imageBase64 and personaId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const personaContext = PERSONA_PROMPTS[personaId] || PERSONA_PROMPTS.solo;

    const systemPrompt = `${personaContext}

You are analyzing a UI/UX design screenshot. Perform a thorough audit and return your findings as a JSON object.

CRITICAL INSTRUCTIONS FOR POSITIONING:
- For each issue, estimate where on the image (as a percentage from 0-100 for both x and y) the problem area is located.
- x=0 is the left edge, x=100 is the right edge
- y=0 is the top edge, y=100 is the bottom edge
- Be as accurate as possible — look at the actual UI elements in the screenshot.

Design context: Fidelity level is "${fidelity || 'high-fidelity'}", purpose is "${purpose || 'review'}".

You MUST respond with ONLY a valid JSON object (no markdown, no backticks, no explanation) in this exact format:
{
  "overallScore": <number 0-100>,
  "summary": "<one sentence summary>",
  "riskLevel": "<Low|Medium|High>",
  "categories": [
    {
      "name": "<category name>",
      "score": <number 0-100>,
      "icon": "<single emoji>",
      "issues": [
        {
          "id": "<unique id>",
          "title": "<short title>",
          "description": "<what's wrong>",
          "severity": "<critical|warning|info>",
          "category": "<category>",
          "suggestion": "<how to fix>",
          "x": <number 0-100 percent position>,
          "y": <number 0-100 percent position>
        }
      ]
    }
  ]
}

Return 3-6 categories with 1-3 issues each. Every issue MUST have x and y coordinates pointing to the relevant area on the design. Be specific and actionable.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this design screenshot and provide a detailed UX audit with positioned sticky notes for each issue found.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/png;base64,${imageBase64}`,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";

    // Strip markdown code fences if present
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let auditResult;
    try {
      auditResult = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse audit results", raw: content }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(auditResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("audit-design error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
