import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Verify HMAC-signed admin token
async function verifyAdminToken(token: string, secret: string): Promise<boolean> {
  if (!token || !secret) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [expiryStr, sigHex] = parts;
  const expiry = Number(expiryStr);
  if (isNaN(expiry) || Date.now() > expiry) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const expectedSig = await crypto.subtle.sign("HMAC", key, encoder.encode(expiryStr));
  const expectedHex = Array.from(new Uint8Array(expectedSig)).map(b => b.toString(16).padStart(2, "0")).join("");

  if (sigHex.length !== expectedHex.length) return false;
  let result = 0;
  for (let i = 0; i < sigHex.length; i++) {
    result |= sigHex.charCodeAt(i) ^ expectedHex.charCodeAt(i);
  }
  return result === 0;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, action, feedbackId, updates } = await req.json();

    const ADMIN_PASSCODE = Deno.env.get("ADMIN_PASSCODE");
    if (!ADMIN_PASSCODE || !token || !(await verifyAdminToken(token, ADMIN_PASSCODE))) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!feedbackId || !action) {
      return new Response(JSON.stringify({ error: "feedbackId and action required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    if (action === "approve") {
      const { error } = await supabaseAdmin
        .from("feedback_and_testimonials")
        .update({ is_approved: updates?.is_approved ?? true })
        .eq("id", feedbackId);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      const { error } = await supabaseAdmin
        .from("feedback_and_testimonials")
        .delete()
        .eq("id", feedbackId);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("admin-update-feedback error:", e);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
