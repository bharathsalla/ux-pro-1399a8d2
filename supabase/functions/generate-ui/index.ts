import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ROLE_FOCUS: Record<string, string> = {
  "ux-designer":
    "Focus on visual hierarchy, spacing, typography, color theory, and user flow. Prioritize aesthetics, interaction patterns, and micro-interactions.",
  "product-manager":
    "Focus on feature completeness, user stories coverage, and business requirements. Ensure all discussed features are represented with realistic data.",
  developer:
    "Focus on semantic HTML, clean code structure, accessibility attributes, responsive design patterns, and component reusability.",
  "qa-engineer":
    "Focus on edge cases, error states, form validations, loading states, and testable UI components with clear data attributes.",
  stakeholder:
    "Focus on high-level visual impact, brand alignment, key metrics display, and executive-friendly presentation.",
};

function tryParseJSON(content: string): Record<string, unknown> | null {
  let cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch { /* noop */ }
  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    try {
      return JSON.parse(cleaned.substring(jsonStart, jsonEnd + 1));
    } catch { /* noop */ }
  }
  try {
    cleaned = cleaned.replace(/,\s*([\]}])/g, "$1");
    return JSON.parse(cleaned);
  } catch { /* noop */ }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript, role } = await req.json();

    if (!transcript) {
      return new Response(
        JSON.stringify({ error: "Transcript is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const roleFocus = ROLE_FOCUS[role] || ROLE_FOCUS["ux-designer"];

    const prompt = `You are a senior UI engineer and product designer. Convert the following meeting transcript into a functional, polished UI draft.

## Your Role Focus
${roleFocus}

## Instructions
1. Carefully analyze the transcript to understand what UI/product is being discussed
2. Generate production-quality HTML, CSS, and JavaScript code for a UI screen that matches the discussion
3. Summarize the key points of the meeting in 2-3 sentences
4. Extract meeting metadata (participants mentioned, estimated duration, key topics)
5. Provide 3-5 actionable suggestions categorized as Improvement, Insight, or Action Item

## Code Quality Requirements
- Use modern CSS (flexbox, grid, custom properties, subtle gradients)
- Clean semantic HTML5 with proper accessibility attributes
- Vanilla JavaScript for interactivity (event listeners, DOM manipulation)
- Include realistic sample data that matches the transcript context
- Visually polished with good typography (system fonts), spacing, and a professional color palette
- Fully responsive design
- Include hover states, transitions, and micro-interactions
- Use a cohesive design system (consistent border-radius, shadows, spacing scale)

## Response Format
Return ONLY a valid JSON object with this exact structure:
{
  "summary": "A 2-3 sentence summary of the meeting discussion and the UI that was built",
  "html": "The complete HTML body content (no <html>, <head>, or <body> wrapper tags)",
  "css": "Complete CSS styles including a minimal reset, layout, components, responsive breakpoints, and hover states",
  "js": "JavaScript for interactivity. Use DOMContentLoaded. Return empty string if no JS needed.",
  "suggestions": [
    {
      "title": "Short actionable title",
      "description": "Detailed 1-2 sentence description of the suggestion",
      "category": "Improvement"
    }
  ],
  "meetingMeta": {
    "participants": ["Name 1", "Name 2"],
    "duration": "Estimated meeting duration (e.g. '45 minutes')",
    "topics": ["Topic 1", "Topic 2", "Topic 3"]
  }
}

CRITICAL: Return ONLY the JSON object. No markdown fences, no backticks, no trailing text.

## Meeting Transcript
${transcript}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402 || response.status === 403) {
        return new Response(
          JSON.stringify({ error: "API quota exceeded. Please check your Gemini API key billing." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const parsed = tryParseJSON(content);
    if (!parsed) {
      console.error("Failed to parse Gemini response. Length:", content.length);
      throw new Error("Failed to parse AI response. Please try again.");
    }

    // Validate & normalise
    const result = {
      summary: (parsed.summary as string) || "No summary available",
      html: (parsed.html as string) || "<p>No HTML generated</p>",
      css: (parsed.css as string) || "",
      js: (parsed.js as string) || "",
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      meetingMeta: (parsed.meetingMeta as Record<string, unknown>) || {
        participants: [],
        duration: "Unknown",
        topics: [],
      },
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-ui error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
