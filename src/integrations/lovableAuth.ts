import { createLovableAuth } from "@lovable.dev/cloud-auth-js";
import { supabase } from "@/integrations/supabase/client";

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

function getOAuthBrokerUrl() {
  // Lovable-hosted preview/published domains have the broker mounted at /~oauth.
  // Custom domains use the hosted broker endpoint which requires `project_id`.
  const host = window.location.hostname;
  const isLovableHosted = host.endsWith("lovable.app");
  return isLovableHosted ? "/~oauth/initiate" : "https://oauth.lovable.app/initiate";
}

const OAUTH_BROKER_URL = getOAuthBrokerUrl();
const NEEDS_PROJECT_ID = OAUTH_BROKER_URL.startsWith("https://oauth.lovable.app");

const lovableAuth = createLovableAuth({
  oauthBrokerUrl: OAUTH_BROKER_URL,
});

export const lovable = {
  auth: {
    signInWithOAuth: async (provider: "google" | "apple", opts?: SignInOptions) => {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID as string | undefined;

      if (NEEDS_PROJECT_ID && !projectId) {
        return { error: new Error("OAuth configuration error: missing project_id") };
      }

      const result = await lovableAuth.signInWithOAuth(provider, {
        redirect_uri: opts?.redirect_uri,
        extraParams: {
          ...(NEEDS_PROJECT_ID ? { project_id: projectId } : {}),
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
