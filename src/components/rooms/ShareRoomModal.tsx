import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  X,
  Copy,
  Check,
  Lock,
  Globe,
  ExternalLink,
  Users,
  Send,
  Loader2,
  AlertTriangle,
  Share2,
  Mail,
} from "lucide-react";

interface ShareRoomModalProps {
  room: {
    id: string;
    title: string;
    is_private: boolean;
    passcode: string | null;
  };
  onClose: () => void;
}

type ShareTab = "external" | "internal";

export default function ShareRoomModal({ room, onClose }: ShareRoomModalProps) {
  const { user, profile } = useAuthContext();
  const [tab, setTab] = useState<ShareTab>("external");
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [passcodeForShare, setPasscodeForShare] = useState(room.passcode || "");
  const [sending, setSending] = useState(false);
  const [sentEmails, setSentEmails] = useState<string[]>([]);

  const roomUrl = `${window.location.origin}${window.location.pathname}#/room/${room.id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToTwitter = () => {
    const text = `Check out this design review room: "${room.title}"${room.is_private ? " (Passcode required)" : ""}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(roomUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(roomUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleInternalShare = async () => {
    if (!email.trim() || !user) return;
    const trimmed = email.trim().toLowerCase();

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSending(true);

    // Check if user exists in FixUX
    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", trimmed)
      .maybeSingle();

    // Check if already shared
    const { data: existingShare } = await supabase
      .from("room_shares")
      .select("id")
      .eq("room_id", room.id)
      .eq("shared_to_email", trimmed)
      .maybeSingle();

    if (existingShare) {
      toast.error("Already shared with this user");
      setSending(false);
      return;
    }

    const { error } = await supabase.from("room_shares").insert({
      room_id: room.id,
      shared_by: user.id,
      shared_to_email: trimmed,
      shared_to_user: targetProfile?.id || null,
      status: "pending",
      passcode: room.is_private ? passcodeForShare || null : null,
    } as any);

    if (error) {
      toast.error("Failed to share room");
    } else {
      toast.success(
        targetProfile
          ? `Shared with ${trimmed}! They'll see it in their rooms.`
          : `Invite sent! ${trimmed} will need to register on FixUX first.`
      );
      setSentEmails((prev) => [...prev, trimmed]);
      setEmail("");
    }
    setSending(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="relative w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Share2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Share Room</h2>
              <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">{room.title}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex bg-muted rounded-xl p-1 gap-1">
            <button
              onClick={() => setTab("external")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                tab === "external"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              External Share
            </button>
            <button
              onClick={() => setTab("internal")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                tab === "internal"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              FixUX Community
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {tab === "external" ? (
            <>
              {/* Room Type Badge */}
              <div className={`flex items-center gap-2.5 p-3.5 rounded-xl border ${
                room.is_private
                  ? "bg-destructive/5 border-destructive/20"
                  : "bg-primary/5 border-primary/20"
              }`}>
                {room.is_private ? (
                  <Lock className="h-4 w-4 text-destructive shrink-0" />
                ) : (
                  <Globe className="h-4 w-4 text-primary shrink-0" />
                )}
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {room.is_private ? "Private Room" : "Public Room"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {room.is_private
                      ? "Reviewers will need a passcode to enter."
                      : "Anyone with the link can review directly."}
                  </p>
                </div>
              </div>

              {/* Passcode Display */}
              {room.is_private && room.passcode && (
                <div className="bg-muted/50 border border-border rounded-xl p-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Room Passcode
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono font-bold text-foreground tracking-wider">
                      {room.passcode}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 text-xs gap-1"
                      onClick={() => {
                        navigator.clipboard.writeText(room.passcode!);
                        toast.success("Passcode copied!");
                      }}
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-[10px] text-destructive font-medium mt-2 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Share this passcode along with the link
                  </p>
                </div>
              )}

              {/* Copy Link */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Share Link
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    value={roomUrl}
                    readOnly
                    className="text-xs h-10 font-mono bg-muted/30"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <Button
                    variant={copied ? "default" : "outline"}
                    size="sm"
                    className="h-10 px-4 text-xs gap-1.5 shrink-0"
                    onClick={copyLink}
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>

              {/* Social Share */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Share to Social
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-10 text-xs gap-1.5 font-semibold"
                    onClick={shareToTwitter}
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Twitter / X
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-10 text-xs gap-1.5 font-semibold"
                    onClick={shareToLinkedIn}
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    LinkedIn
                  </Button>
                </div>
              </div>

              {/* External notice */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/50 border border-border text-[11px] text-muted-foreground leading-relaxed">
                <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0 mt-0.5" />
                <span>
                  External reviewers will need to{" "}
                  <strong className="text-foreground">register or log in</strong> on FixUX to access this room.
                  {room.is_private && (
                    <> They'll also need the <strong className="text-foreground">passcode</strong> shown above.</>
                  )}
                </span>
              </div>
            </>
          ) : (
            <>
              {/* Internal Share */}
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-primary/5 border border-primary/20">
                <Users className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-foreground">Share within FixUX Community</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Share directly with registered FixUX members. They'll see a notification in their rooms.
                  </p>
                </div>
              </div>

              {/* Email input */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Recipient's Email
                </p>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="colleague@email.com"
                      className="text-xs h-10 pl-9"
                      onKeyDown={(e) => e.key === "Enter" && handleInternalShare()}
                    />
                  </div>
                  <Button
                    size="sm"
                    className="h-10 px-4 text-xs gap-1.5 shrink-0"
                    onClick={handleInternalShare}
                    disabled={!email.trim() || sending}
                  >
                    {sending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    Share
                  </Button>
                </div>
              </div>

              {/* Passcode for private rooms */}
              {room.is_private && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Include Passcode
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        value={passcodeForShare}
                        onChange={(e) => setPasscodeForShare(e.target.value)}
                        placeholder="Enter room passcode"
                        className="text-xs h-10 pl-9 font-mono tracking-wider"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3 text-destructive" />
                    This passcode will be visible on the recipient's dashboard
                  </p>
                </div>
              )}

              {/* Sent list */}
              {sentEmails.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Shared With
                  </p>
                  <div className="space-y-1.5">
                    {sentEmails.map((e, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10"
                      >
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="text-xs text-foreground font-medium flex-1">{e}</span>
                        <span className="text-[10px] text-primary font-semibold">Sent</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info about non-registered users */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/50 border border-border text-[11px] text-muted-foreground leading-relaxed">
                <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0 mt-0.5" />
                <span>
                  If the recipient isn't registered on FixUX, they'll need to{" "}
                  <strong className="text-foreground">create an account</strong> first. The room will appear in their dashboard once they sign up with the same email.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-muted/30">
          <p className="text-[10px] text-center text-muted-foreground">
            Shared by <strong>{profile?.name || "you"}</strong> · Room auto-deletes on expiry
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
