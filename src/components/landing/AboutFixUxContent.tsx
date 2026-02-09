import { motion } from "framer-motion";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/StarRating";
import { LinkThumbnail } from "@/components/landing/LinkThumbnail";
import { getAvatarUrl } from "@/lib/avatar";
import { useAuthContext } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ThumbsUp, Award, Heart, Link2, AlertCircle, Globe, CheckCircle2 } from "lucide-react";
import creatorAvatar from "@/assets/creator-avatar.png";

type EmojiReaction = "like" | "clap" | "love";

const PROFILE_PLATFORMS = [
  { label: "LinkedIn", placeholder: "https://linkedin.com/in/..." },
  { label: "Medium", placeholder: "https://medium.com/@..." },
  { label: "Behance", placeholder: "https://behance.net/..." },
  { label: "Dribbble", placeholder: "https://dribbble.com/..." },
  { label: "GitHub", placeholder: "https://github.com/..." },
  { label: "Portfolio", placeholder: "https://your-site.com" },
];

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function AboutFixUxContent() {
  return (
    <article>
      {/* Kicker */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-[11px] tracking-[0.2em] uppercase text-primary font-medium mb-5"
      >
        About
      </motion.p>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 }}
        className="text-4xl md:text-[3.2rem] font-extrabold text-foreground leading-[1.08] mb-8"
      >
        About Fix UX
      </motion.h1>

      {/* Lead */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="text-[1.15rem] md:text-[1.3rem] text-muted-foreground leading-[1.7] mb-16"
      >
        Fix UX is a free platform that gives designers instant, structured feedback — without waiting for peers, seniors, or reviews.
      </motion.p>

      {/* What is Fix UX */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="mb-16 space-y-5"
      >
        <p className="text-[14px] text-muted-foreground leading-[1.7]">
          Designers often work independently or within fast-moving teams where timely feedback isn't always available. Fix UX bridges that gap.
        </p>
        <p className="text-[14px] text-muted-foreground leading-[1.7]">
          Simply upload your screen, and the platform analyses it across three critical dimensions:
        </p>
        <ul className="space-y-2 pl-1">
          {["Usability", "User Experience principles", "Functional clarity"].map((item) => (
            <li key={item} className="flex items-center gap-3 text-[14px] text-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-[14px] text-muted-foreground leading-[1.7]">
          Whether you're a junior designer learning fundamentals, a mid-level designer refining workflows, or a senior designer validating decisions, Fix UX helps you think sharper, iterate faster, and design with confidence.
        </p>
        <p className="text-[14px] text-foreground font-medium leading-[1.7]">
          The platform is completely free, unlimited, and built to support the global design community.
        </p>
      </motion.div>

      {/* Why Fix UX Exists */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className="mb-16"
      >
        <h2 className="text-2xl font-bold text-foreground mb-6">Why Fix UX Exists</h2>
        <div className="space-y-5">
          <p className="text-[14px] text-muted-foreground leading-[1.7]">
            Fix UX was created to solve a simple but widespread problem: <strong className="text-foreground">designers need feedback before it's too late</strong> — not after approval cycles.
          </p>
          <p className="text-[14px] text-muted-foreground leading-[1.7]">
            Waiting for reviews slows progress. Feedback can be subjective. Access to experienced designers isn't always possible.
          </p>
          <p className="text-[14px] text-muted-foreground leading-[1.7]">
            Fix UX offers objective, principle-driven insights that help designers improve their work early — before opinions, bias, or deadlines take over.
          </p>
          <p className="text-[14px] text-foreground font-medium leading-[1.7]">
            This product exists to give back to the design community and help designers grow through clarity, not guesswork.
          </p>
        </div>
      </motion.div>

      {/* Who It's For */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-16"
      >
        <h2 className="text-2xl font-bold text-foreground mb-6">Who It's For</h2>
        <div className="space-y-4">
          {[
            { role: "Junior Designers", desc: "Learning fundamentals and building confidence in their design decisions." },
            { role: "Mid-Level Designers", desc: "Refining workflows, catching blind spots, and leveling up craft." },
            { role: "Senior Designers", desc: "Validating decisions quickly and stress-testing complex interfaces." },
            { role: "Product Managers", desc: "Evaluating UX quality before development handoff." },
            { role: "Founders & Startups", desc: "Getting professional UX feedback without hiring a consultant." },
          ].map((item) => (
            <div key={item.role} className="flex items-baseline gap-3">
              <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0 mt-[7px]" />
              <p className="text-[14px] text-muted-foreground leading-[1.7]">
                <strong className="text-foreground font-semibold">{item.role}</strong> — {item.desc}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* About the Creator */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
        className="mb-16"
      >
        <h2 className="text-2xl font-bold text-foreground mb-6">About the Creator</h2>
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-28 h-28 shrink-0 border border-border overflow-hidden">
            <img
              src={creatorAvatar}
              alt="Bharath Salla"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-4">
            <p className="text-[14px] text-muted-foreground leading-[1.7]">
              <strong className="text-foreground">Bharath Salla</strong> is a Senior Product Designer with 12+ years of experience designing enterprise B2B platforms, analytics tools, and complex operational systems across healthcare, fintech, telecom, and AI-driven products.
            </p>
            <p className="text-[14px] text-muted-foreground leading-[1.7]">
              He specialises in simplifying dense data, multi-step workflows, and large-scale systems into intuitive, scalable user experiences. Bharath has worked closely with engineering, data, and product teams in highly regulated, high-impact environments — where clarity and usability directly affect business outcomes.
            </p>
            <p className="text-[14px] text-muted-foreground leading-[1.7]">
              Having mentored designers and worked across all experience levels, Bharath saw first-hand how difficult it is to get timely, unbiased feedback. Fix UX was built from that experience — to help designers improve faster, independently, and confidently.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Feedback Request + Widget */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-foreground mb-3">Your Feedback Matters</h2>
        <p className="text-[14px] text-muted-foreground leading-[1.7] mb-8">
          Fix UX is continuously evolving, and community feedback plays a huge role in shaping what comes next.
          If something feels unclear, incomplete, or could be better — please share it. Every insight helps improve the platform for designers around the world.
        </p>
        <InlineFeedbackWidget />
      </motion.div>
    </article>
  );
}

/* ─── Inline Feedback Widget (embedded in About page) ─── */
function InlineFeedbackWidget() {
  const { profile, user, refreshProfile } = useAuthContext();
  const [feedbackText, setFeedbackText] = useState("");
  const [profileLink, setProfileLink] = useState("");
  const [selectedReaction, setSelectedReaction] = useState<EmojiReaction | null>(null);
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const hasContent = feedbackText.trim().length > 0 || selectedReaction !== null;
  const hasValidLink = isValidUrl(profileLink.trim());
  const canSubmit = hasContent && hasValidLink;

  if (!user || !profile) {
    return (
      <div className="border border-border p-6 text-center">
        <p className="text-sm text-muted-foreground">Please log in to share your feedback.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="border border-primary/20 bg-primary/5 p-8 text-center">
        <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-3" />
        <p className="text-foreground font-semibold mb-1">Thank you for your feedback! 💙</p>
        <p className="text-sm text-muted-foreground">Your feedback will appear after admin approval.</p>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!hasContent) {
      setError("Please share your feedback or select a reaction.");
      return;
    }
    if (!hasValidLink) {
      setError("Please provide a valid profile link to continue.");
      return;
    }

    setLoading(true);

    const { error: insertError } = await supabase.from("feedback_and_testimonials").insert({
      user_id: user.id,
      user_name: profile.name,
      user_country: profile.country,
      user_avatar_url: profile.avatar_url,
      feedback_text: feedbackText.trim() || `Reacted with ${selectedReaction}`,
      reactions_breakdown: selectedReaction ? { [selectedReaction]: 1 } : {},
      profile_link: profileLink.trim(),
      rating,
    });

    if (insertError) {
      toast.error("Failed to submit feedback");
      setLoading(false);
      return;
    }

    await supabase.from("profiles").update({ has_submitted_feedback: true }).eq("id", user.id);
    await refreshProfile();
    setLoading(false);
    setSubmitted(true);
    toast.success("Thank you for your feedback! 💙");
  };

  const reactions: { type: EmojiReaction; icon: typeof ThumbsUp; label: string }[] = [
    { type: "like", icon: ThumbsUp, label: "Like" },
    { type: "clap", icon: Award, label: "Clap" },
    { type: "love", icon: Heart, label: "Love" },
  ];

  return (
    <div className="border border-border bg-card p-6 space-y-5">
      {/* User info */}
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={getAvatarUrl(profile.name, profile.avatar_url)} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {profile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-foreground">{profile.name}</p>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Globe className="w-2.5 h-2.5" />
            {profile.country}
          </div>
        </div>
      </div>

      {/* Textarea */}
      <Textarea
        value={feedbackText}
        onChange={(e) => { setFeedbackText(e.target.value); setError(""); }}
        placeholder="Share your thoughts and experience with Fix UX..."
        rows={3}
        className="resize-none text-sm"
      />

      {/* Profile Link */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Link2 className="h-4 w-4 text-primary" />
          Your Profile Link
          <span className="text-destructive">*</span>
        </label>
        <Input
          value={profileLink}
          onChange={(e) => { setProfileLink(e.target.value); setError(""); }}
          placeholder="https://linkedin.com/in/your-profile"
          className="text-sm"
          type="url"
        />
        <div className="flex flex-wrap gap-1.5">
          {PROFILE_PLATFORMS.map((p) => (
            <span
              key={p.label}
              className="text-[10px] px-2 py-0.5 bg-surface-2 border border-border text-muted-foreground cursor-pointer hover:text-foreground hover:border-primary/30 transition-colors"
              onClick={() => { if (!profileLink) setProfileLink(p.placeholder); }}
            >
              {p.label}
            </span>
          ))}
        </div>
        {profileLink && !hasValidLink && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Please enter a valid URL
          </p>
        )}
        {hasValidLink && <LinkThumbnail url={profileLink.trim()} compact className="mt-2" />}
      </div>

      {/* Star Rating */}
      <div className="space-y-2 pt-3 border-t border-border">
        <label className="text-sm font-semibold text-foreground">Your Rating</label>
        <StarRating rating={rating} onChange={(r) => { setRating(r); setError(""); }} />
      </div>

      {/* Reactions */}
      <div className="flex items-center gap-2 pt-3 border-t border-border">
        <span className="text-sm text-muted-foreground mr-2">React:</span>
        {reactions.map(({ type, icon: Icon, label }) => (
          <Button
            key={type}
            variant={selectedReaction === type ? "default" : "outline"}
            size="sm"
            className="gap-1.5"
            onClick={() => { setSelectedReaction(selectedReaction === type ? null : type); setError(""); }}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </p>
      )}

      {/* Submit */}
      <Button onClick={handleSubmit} className="w-full" size="lg" disabled={loading || !canSubmit}>
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" />Submitting...</>
        ) : (
          "Submit Feedback"
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Your feedback will be shared with the community upon admin approval.
      </p>
    </div>
  );
}
