import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  ArrowLeft,
  Clock,
  Copy,
  Lock,
  Send,
  Check,
  MessageCircle,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Room {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  preview_url: string | null;
  is_private: boolean;
  passcode: string | null;
  expiry_days: number;
  expires_at: string;
  is_expired: boolean;
  created_at: string;
  creator_id: string;
}

interface Comment {
  id: string;
  room_id: string;
  parent_id: string | null;
  reviewer_name: string;
  reviewer_id: string | null;
  comment_text: string;
  pin_x: number | null;
  pin_y: number | null;
  pin_number: number | null;
  is_resolved: boolean;
  created_at: string;
}

export default function RoomViewPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuthContext();
  const imageRef = useRef<HTMLDivElement>(null);

  const [room, setRoom] = useState<Room | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [passcodeVerified, setPasscodeVerified] = useState(false);
  const [reviewerName, setReviewerName] = useState("");
  const [nameSet, setNameSet] = useState(false);

  // Commenting state
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(null);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activePin, setActivePin] = useState<number | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const isExpired = room ? room.is_expired || new Date(room.expires_at) <= new Date() : false;
  const isOwner = user?.id === room?.creator_id;
  const nextPinNumber = comments.filter((c) => c.pin_number !== null && !c.parent_id).length + 1;

  useEffect(() => {
    if (roomId) fetchRoom();
  }, [roomId]);

  useEffect(() => {
    if (room && (!room.is_private || passcodeVerified)) {
      fetchComments();
      // Subscribe to realtime
      const channel = supabase
        .channel(`room-comments-${roomId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "room_comments", filter: `room_id=eq.${roomId}` }, () => {
          fetchComments();
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [room, passcodeVerified, roomId]);

  useEffect(() => {
    if (user && profile) {
      setReviewerName(profile.name || "");
      setNameSet(true);
    }
  }, [user, profile]);

  const fetchRoom = async () => {
    const { data, error } = await supabase
      .from("review_rooms")
      .select("*")
      .eq("id", roomId!)
      .maybeSingle();

    if (error || !data) {
      toast.error("Room not found");
      navigate("/rooms");
      return;
    }
    setRoom(data as unknown as Room);
    if (!(data as any).is_private) setPasscodeVerified(true);
    setLoading(false);
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from("room_comments")
      .select("*")
      .eq("room_id", roomId!)
      .order("created_at", { ascending: true });

    if (data) setComments(data as unknown as Comment[]);
  };

  const verifyPasscode = () => {
    if (passcodeInput === room?.passcode) {
      setPasscodeVerified(true);
      toast.success("Access granted!");
    } else {
      toast.error("Incorrect passcode");
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isExpired || !nameSet) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPendingPin({ x, y });
    setCommentText("");
  };

  const submitComment = async () => {
    if (!commentText.trim() || !pendingPin) return;
    setSubmitting(true);

    await supabase.from("room_comments").insert({
      room_id: roomId!,
      reviewer_name: reviewerName || "Anonymous",
      reviewer_id: user?.id || null,
      comment_text: commentText.trim(),
      pin_x: pendingPin.x,
      pin_y: pendingPin.y,
      pin_number: nextPinNumber,
    } as any);

    setPendingPin(null);
    setCommentText("");
    setSubmitting(false);
  };

  const submitReply = async (parentId: string) => {
    if (!replyText.trim()) return;
    setSubmitting(true);

    await supabase.from("room_comments").insert({
      room_id: roomId!,
      parent_id: parentId,
      reviewer_name: reviewerName || "Anonymous",
      reviewer_id: user?.id || null,
      comment_text: replyText.trim(),
    } as any);

    setReplyTo(null);
    setReplyText("");
    setSubmitting(false);
  };

  const resolveComment = async (commentId: string) => {
    await supabase.from("room_comments").update({ is_resolved: true } as any).eq("id", commentId);
    fetchComments();
  };

  const deleteComment = async (commentId: string) => {
    await supabase.from("room_comments").delete().eq("id", commentId);
    fetchComments();
  };

  const getTimeRemaining = () => {
    if (!room) return "";
    const diff = new Date(room.expires_at).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const topLevelComments = comments.filter((c) => !c.parent_id);
  const getReplies = (parentId: string) => comments.filter((c) => c.parent_id === parentId);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Passcode gate
  if (room?.is_private && !passcodeVerified && !isOwner) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm bg-card border border-border rounded-lg p-8 text-center shadow-lg"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 bg-destructive/10 rounded-full mb-5">
            <Lock className="h-7 w-7 text-destructive" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-1">Private Review Room</h2>
          <p className="text-sm text-muted-foreground mb-6">Enter the passcode to access this room.</p>
          <Input
            value={passcodeInput}
            onChange={(e) => setPasscodeInput(e.target.value)}
            placeholder="Passcode"
            className="mb-4 text-center text-sm"
            onKeyDown={(e) => e.key === "Enter" && verifyPasscode()}
          />
          <Button onClick={verifyPasscode} className="w-full">
            Enter Room
          </Button>
        </motion.div>
      </div>
    );
  }

  // Name entry for non-logged-in reviewers
  if (!nameSet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm bg-card border border-border rounded-lg p-8 text-center shadow-lg"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mb-5">
            <MessageCircle className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-1">{room?.title}</h2>
          <p className="text-sm text-muted-foreground mb-6">Enter your name to start reviewing.</p>
          <Input
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            placeholder="Your name"
            className="mb-4 text-sm"
            onKeyDown={(e) => e.key === "Enter" && reviewerName.trim() && setNameSet(true)}
          />
          <Button onClick={() => setNameSet(true)} className="w-full" disabled={!reviewerName.trim()}>
            Start Reviewing
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 border-b border-border" style={{ backdropFilter: "blur(12px)" }}>
        <div className="max-w-[1600px] mx-auto px-4 py-2.5 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/rooms")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-foreground truncate">{room?.title}</h1>
            {room?.description && (
              <p className="text-[11px] text-muted-foreground truncate">{room.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground shrink-0">
            <Clock className="h-3 w-3" />
            <span>{isExpired ? "Expired" : getTimeRemaining()}</span>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={copyLink}>
            <Copy className="h-3 w-3" />
            Share
          </Button>
        </div>
      </header>

      {isExpired && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 text-center text-xs text-destructive font-medium">
          This room has expired. Comments are disabled and will be permanently deleted soon.
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Image area */}
        <div className="flex-1 relative overflow-auto p-4 flex items-start justify-center bg-muted/30">
          <div
            ref={imageRef}
            className="relative cursor-crosshair max-w-full"
            onClick={handleImageClick}
          >
            {room?.image_url ? (
              <img
                src={room.image_url}
                alt={room.title}
                className="max-w-full max-h-[80vh] object-contain rounded-md border border-border shadow-sm select-none"
                draggable={false}
              />
            ) : room?.preview_url ? (
              <div className="w-full max-w-2xl bg-card border border-border rounded-md p-8 text-center">
                <p className="text-sm text-muted-foreground mb-2">Preview URL</p>
                <a
                  href={room.preview_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline text-sm break-all"
                >
                  {room.preview_url}
                </a>
              </div>
            ) : (
              <div className="w-96 h-64 bg-card border border-border rounded-md flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No design uploaded</p>
              </div>
            )}

            {/* Existing pins */}
            {topLevelComments
              .filter((c) => c.pin_x !== null && c.pin_y !== null)
              .map((c) => (
                <button
                  key={c.id}
                  className={`absolute w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 shadow-lg ${
                    c.is_resolved
                      ? "bg-primary/60 text-primary-foreground"
                      : activePin === c.pin_number
                      ? "bg-destructive text-destructive-foreground scale-125 ring-2 ring-destructive/30"
                      : "bg-destructive text-destructive-foreground hover:scale-110"
                  }`}
                  style={{ left: `${c.pin_x}%`, top: `${c.pin_y}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePin(activePin === c.pin_number ? null : c.pin_number);
                    // Scroll to comment
                    document.getElementById(`comment-${c.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                  }}
                >
                  {c.pin_number}
                </button>
              ))}

            {/* Pending pin */}
            {pendingPin && (
              <div
                className="absolute w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[11px] font-bold transform -translate-x-1/2 -translate-y-1/2 animate-pulse ring-4 ring-primary/20"
                style={{ left: `${pendingPin.x}%`, top: `${pendingPin.y}%` }}
              >
                {nextPinNumber}
              </div>
            )}
          </div>

          {/* Inline comment input for pending pin */}
          <AnimatePresence>
            {pendingPin && !isExpired && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-4 left-4 right-4 lg:left-1/4 lg:right-1/4 bg-card border border-border rounded-lg shadow-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                      {getInitials(reviewerName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add your feedback..."
                      rows={2}
                      className="text-sm resize-none min-h-[60px]"
                      autoFocus
                    />
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setPendingPin(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={submitComment}
                        disabled={!commentText.trim() || submitting}
                      >
                        {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                        Post
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Comments sidebar */}
        <div className="w-full lg:w-[380px] border-t lg:border-t-0 lg:border-l border-border bg-card overflow-y-auto">
          <div className="p-4 border-b border-border">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Comments
              <span className="text-xs font-normal text-muted-foreground">({topLevelComments.length})</span>
            </h2>
            {!isExpired && room?.image_url && (
              <p className="text-[11px] text-muted-foreground mt-1">
                Click anywhere on the design to add a comment pin.
              </p>
            )}
          </div>

          <div className="divide-y divide-border">
            {topLevelComments.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-3 opacity-40" />
                <p className="text-xs">No comments yet. Click on the design to start.</p>
              </div>
            ) : (
              topLevelComments.map((c) => {
                const replies = getReplies(c.id);
                const isActive = activePin === c.pin_number;

                return (
                  <div
                    key={c.id}
                    id={`comment-${c.id}`}
                    className={`p-4 transition-colors duration-200 ${
                      isActive ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Pin badge */}
                      {c.pin_number && (
                        <button
                          className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                            c.is_resolved
                              ? "bg-primary/20 text-primary"
                              : "bg-destructive/10 text-destructive"
                          }`}
                          onClick={() => setActivePin(isActive ? null : c.pin_number)}
                        >
                          {c.pin_number}
                        </button>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs font-semibold text-foreground">{c.reviewer_name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className={`text-xs text-foreground leading-relaxed ${c.is_resolved ? "line-through opacity-60" : ""}`}>
                          {c.comment_text}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-2">
                          {!isExpired && (
                            <button
                              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                              onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
                            >
                              Reply
                            </button>
                          )}
                          {isOwner && !c.is_resolved && !isExpired && (
                            <button
                              className="text-[10px] text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5"
                              onClick={() => resolveComment(c.id)}
                            >
                              <Check className="h-2.5 w-2.5" />
                              Resolve
                            </button>
                          )}
                          {c.is_resolved && (
                            <span className="text-[10px] text-primary flex items-center gap-0.5">
                              <Check className="h-2.5 w-2.5" />
                              Resolved
                            </span>
                          )}
                          {(isOwner || c.reviewer_id === user?.id) && (
                            <button
                              className="text-[10px] text-destructive hover:text-destructive/80 transition-colors"
                              onClick={() => deleteComment(c.id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>

                        {/* Replies */}
                        {replies.length > 0 && (
                          <div className="mt-3 ml-2 pl-3 border-l-2 border-border space-y-2.5">
                            {replies.map((r) => (
                              <div key={r.id}>
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="text-[11px] font-semibold text-foreground">{r.reviewer_name}</span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                                <p className="text-xs text-foreground">{r.comment_text}</p>
                                {(isOwner || r.reviewer_id === user?.id) && (
                                  <button
                                    className="text-[10px] text-destructive mt-1"
                                    onClick={() => deleteComment(r.id)}
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply input */}
                        {replyTo === c.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-2"
                          >
                            <div className="flex items-center gap-2">
                              <Input
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write a reply..."
                                className="text-xs h-8 flex-1"
                                onKeyDown={(e) => e.key === "Enter" && submitReply(c.id)}
                              />
                              <Button
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => submitReply(c.id)}
                                disabled={!replyText.trim() || submitting}
                              >
                                <Send className="h-3 w-3" />
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
