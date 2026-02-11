import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { lovable } from "@/integrations/lovableAuth";
import { toast } from "sonner";

export default function SocialAuthButtons() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading("google");

    try {
      // Use Lovable Cloud OAuth broker flow (works on lovable.app + custom domains).
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });

      if (result?.error) {
        toast.error(result.error.message || "Google sign-in failed");
        setLoading(null);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Google sign-in failed. Please try again.";
      toast.error(message);
      setLoading(null);
    }
  };

  // Button hidden; login logic kept intact for future re-enable.
  return null;
}
