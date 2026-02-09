import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface FeedbackModalProps {
  open: boolean;
  onComplete: () => void;
}

export default function FeedbackModal({ open, onComplete }: FeedbackModalProps) {
  const { profile, user, refreshProfile } = useAuthContext();
  const [feedbackText, setFeedbackText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!feedbackText.trim()) {
      setError("Please share your feedback before continuing.");
      return;
    }
    if (!user || !profile) return;

    setLoading(true);

    const { error: insertError } = await supabase.from("feedback_and_testimonials").insert({
      user_id: user.id,
      user_name: profile.name,
      user_country: profile.country,
      user_avatar_url: profile.avatar_url,
      feedback_text: feedbackText.trim(),
    });

    if (insertError) {
      toast.error("Failed to submit feedback");
      setLoading(false);
      return;
    }

    // Update profile
    await supabase
      .from("profiles")
      .update({ has_submitted_feedback: true })
      .eq("id", user.id);

    await refreshProfile();
    setLoading(false);
    toast.success("Thank you for your feedback! 💙");
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-lg [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            We'd love your feedback 💙
          </DialogTitle>
          <DialogDescription className="text-center">
            You've explored the product. Please share your experience to continue.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Your feedback</Label>
            <Textarea
              value={feedbackText}
              onChange={(e) => {
                setFeedbackText(e.target.value);
                setError("");
              }}
              placeholder="Tell us what you think about UX Pro..."
              rows={4}
              className="resize-none"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <Button onClick={handleSubmit} className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Feedback"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
