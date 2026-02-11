import { createLovableAuth } from "@lovable.dev/cloud-auth-js";
import { supabase } from "@/integrations/supabase/client";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

function getOAuthBrokerUrl() {
  // Lovable-hosted preview/published domains have the broker mounted at /~oauth.
  // Custom domains may not, so we fall back to the hosted broker endpoint.
  const host = window.location.hostname;
  const isLovableHosted = host.endsWith("lovable.app");
  return isLovableHosted ? "/~oauth/initiate" : "https://oauth.lovable.app/initiate";
}

const lovableAuth = createLovableAuth({
  oauthBrokerUrl: getOAuthBrokerUrl(),
});

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: "google" | "apple", opts?: SignInOptions) => {
      const result = await lovableAuth.signInWithOAuth(provider, {
        redirect_uri: opts?.redirect_uri,
        extraParams: {
          ...opts?.extraParams,
        },
      });

      if (result.redirected) {
        return result;
      }

      if (result.error) {
        return result;
      }

      try {
        await supabase.auth.setSession(result.tokens);
      } catch (e) {
        return { error: e instanceof Error ? e : new Error(String(e)) };
      }

      return result;
    },
  },
};
