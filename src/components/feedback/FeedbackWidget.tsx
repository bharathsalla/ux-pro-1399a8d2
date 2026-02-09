import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ThumbsUp, Award, Heart, Sparkles, Globe } from "lucide-react";

interface FeedbackWidgetProps {
  onComplete: () => void;
}

type EmojiReaction = "like" | "clap" | "love";

export default function FeedbackWidget({ onComplete }: FeedbackWidgetProps) {
  const { profile, user, refreshProfile } = useAuthContext();
  const [feedbackText, setFeedbackText] = useState("");
  const [selectedReaction, setSelectedReaction] = useState<EmojiReaction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = feedbackText.trim().length > 0 || selectedReaction !== null;

  const handleSubmit = async () => {
    if (!canSubmit) {
      setError("Please share your feedback or select a reaction to continue.");
      return;
    }
    if (!user || !profile) return;

    setLoading(true);

    const { error: insertError } = await supabase.from("feedback_and_testimonials").insert({
      user_id: user.id,
      user_name: profile.name,
      user_country: profile.country,
      user_avatar_url: profile.avatar_url,
      feedback_text: feedbackText.trim() || `Reacted with ${selectedReaction}`,
      reactions_breakdown: selectedReaction ? { [selectedReaction]: 1 } : {},
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

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const reactions: { type: EmojiReaction; icon: typeof ThumbsUp; label: string }[] = [
    { type: "like", icon: ThumbsUp, label: "Like" },
    { type: "clap", icon: Award, label: "Clap" },
    { type: "love", icon: Heart, label: "Love" },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-xl"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4"
          >
            <Sparkles className="h-8 w-8 text-primary" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            We'd love your feedback 💙
          </h1>
          <p className="text-muted-foreground">
            You've explored the product. Share your thoughts to continue.
          </p>
        </div>

        {/* LinkedIn-style Card */}
        <Card className="border border-border shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {profile ? getInitials(profile.name) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{profile?.name || "User"}</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Globe className="h-3 w-3" />
                  <span>{profile?.country || "Unknown"}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Feedback textarea */}
            <div className="space-y-2">
              <Textarea
                value={feedbackText}
                onChange={(e) => {
                  setFeedbackText(e.target.value);
                  setError("");
                }}
                placeholder="Share your thoughts and experience with UX Pro..."
                rows={4}
                className="resize-none text-base"
              />
            </div>

            {/* Reaction buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground mr-2">React:</span>
              {reactions.map(({ type, icon: Icon, label }) => (
                <Button
                  key={type}
                  variant={selectedReaction === type ? "default" : "outline"}
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    setSelectedReaction(selectedReaction === type ? null : type);
                    setError("");
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>

            {/* Error message */}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {/* Submit button */}
            <Button
              onClick={handleSubmit}
              className="w-full"
              size="lg"
              disabled={loading || !canSubmit}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                "Submit Feedback"
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Your feedback helps us improve and is shared with the community.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
