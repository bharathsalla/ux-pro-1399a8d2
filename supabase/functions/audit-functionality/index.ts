import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function tryParseJSON(content: string): Record<string, unknown> | null {
  let cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  try { return JSON.parse(cleaned); } catch { /* noop */ }
  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}");
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    try { return JSON.parse(cleaned.substring(jsonStart, jsonEnd + 1)); } catch { /* noop */ }
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
    const { imageBase64, imageUrl, screenName } = await req.json();

    if (!imageBase64 && !imageUrl) {
      return new Response(
        JSON.stringify({ error: "Either imageBase64 or imageUrl is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const screenContext = screenName ? `Screen: "${screenName}".` : "";

    const systemPrompt = `You are a senior Product Strategist, UX Architect, and Domain Expert combined.

Your task is to generate FUNCTIONAL FEEDBACK for uploaded product screens or flows.

This is NOT UI feedback, NOT visual critique, and NOT regulatory/accessibility audits.

Your analysis must focus on:
• Missing functionality
• Weak or incomplete workflows
• Inefficient user actions
• Scalability and enterprise-readiness
• Business value gaps
• Industry-standard feature expectations

You must think from:
• User experience perspective
• Business and operational perspective
• Domain and industry norms
• Product maturity (MVP vs enterprise-grade)

${screenContext}

RESPONSIBILITIES:
1. SCREEN & DOMAIN UNDERSTANDING
   - Identify what the screen represents (dashboard, listing, detail view, form, workflow step, admin panel, etc.)
   - Infer the product domain (e.g., healthcare, fintech, SaaS, logistics, HR, analytics, e-commerce).
   - Detect key entities, data types, actions, terminology, and user roles.

2. FUNCTIONAL GAP ANALYSIS (CORE TASK)
   Identify:
   - Missing features users would expect on this screen
   - Actions users may want but cannot perform
   - Manual steps that could be automated
   - Filtering, sorting, grouping, bulk actions that are absent
   - Contextual actions that should exist but don't
   - Cross-screen or cross-role dependencies that are not supported

3. BUSINESS & EXPERIENCE IMPACT
   For every issue, explain what user problem this creates and what business risk or inefficiency it causes.

4. SOLUTION RECOMMENDATIONS
   For each functional gap, propose a concrete, implementable solution.

5. POSITIVE FUNCTIONAL OBSERVATIONS
   Call out what is functionally strong or well thought-out.

IMPORTANT RULES:
• Do NOT comment on colors, fonts, spacing, or visual styling.
• Do NOT give generic UX advice.
• Think like someone reviewing a real production product.
• Be precise, professional, and actionable.

Respond with ONLY valid JSON in this exact structure:
{
  "screenType": "<what this screen is, e.g. Dashboard, Settings, Listing>",
  "productDomain": "<inferred domain, e.g. Healthcare, Fintech, SaaS>",
  "primaryUserRole": "<e.g. Admin, End User, Manager>",
  "coreGoal": "<what the user is trying to accomplish>",
  "verdict": "good" | "mixed" | "bad",
  "score": <number 0-100>,
  "summary": "<2-3 sentence functional overview>",
  "strengths": [
    {
      "title": "<strength name>",
      "detail": "<why this is effective>"
    }
  ],
  "gaps": [
    {
      "issue": "<what is missing or weak>",
      "impact": "<user/business impact>",
      "industryExpectation": "<what is standard in this domain>",
      "severity": "critical" | "major" | "minor"
    }
  ],
  "recommendations": [
    {
      "feature": "<feature name>",
      "description": "<what it does>",
      "integration": "<how it fits the current screen>",
      "userValue": "<benefit to users>",
      "businessValue": "<benefit to business>"
    }
  ],
  "enterpriseReadiness": {
    "scalability": "<concern or positive note>",
    "compliance": "<audit/compliance note if applicable>",
    "roleGaps": "<role-based or workflow gaps>"
  }
}

CRITICAL: Return ONLY valid JSON. No markdown. No backticks. 2-5 items per array.`;

    const imageContent = imageBase64
      ? { type: "image_url", image_url: { url: `data:image/png;base64,${imageBase64}` } }
      : { type: "image_url", image_url: { url: imageUrl } };

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
                { type: "text", text: "Analyze the FUNCTIONALITY of this product screen. Focus on missing features, workflow gaps, and business value — NOT visual design." },
                imageContent,
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Functionality analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    const result = tryParseJSON(content);
    if (!result) {
      return new Response(
        JSON.stringify({
          verdict: "mixed",
          score: 50,
          summary: "Analysis could not be completed. Please try again.",
          screenType: "Unknown",
          productDomain: "Unknown",
          primaryUserRole: "Unknown",
          coreGoal: "Unknown",
          strengths: [],
          gaps: [],
          recommendations: [],
          enterpriseReadiness: { scalability: "N/A", compliance: "N/A", roleGaps: "N/A" },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("audit-functionality error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
