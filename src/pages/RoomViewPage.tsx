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
  Loader2,
  Maximize2,
  Minimize2,
  ExternalLink,
  MousePointer2,
  Square,
  X,
  Eye,
  Sparkles,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ShareRoomModal from "@/components/rooms/ShareRoomModal";

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
  rect_w: number | null;
  rect_h: number | null;
  is_resolved: boolean;
  created_at: string;
}

type AnnotationMode = "pin" | "rect";

interface RectSelection {
  x: number;
  y: number;
  w: number;
  h: number;
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
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Commenting
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(null);
  const [pendingRect, setPendingRect] = useState<RectSelection | null>(null);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activePin, setActivePin] = useState<number | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [annotationMode, setAnnotationMode] = useState<AnnotationMode>("pin");

  // Rectangle drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null);

  // Figma commenting overlay
  const [figmaCommentMode, setFigmaCommentMode] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const isExpired = room ? room.is_expired || new Date(room.expires_at) <= new Date() : false;
  const isOwner = user?.id === room?.creator_id;
  const nextPinNumber = comments.filter((c) => c.pin_number !== null && !c.parent_id).length + 1;

  useEffect(() => {
    if (roomId) fetchRoom();
  }, [roomId]);

  useEffect(() => {
    if (room && (!room.is_private || passcodeVerified || isOwner)) {
      fetchComments();
      const channel = supabase
        .channel(`room-comments-${roomId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "room_comments", filter: `room_id=eq.${roomId}` }, () => {
          fetchComments();
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [room, passcodeVerified, roomId, isOwner]);

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

  const getPercentCoords = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  };

  // Pin mode click
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isExpired || !nameSet || annotationMode !== "pin" || isDrawing) return;
    const coords = getPercentCoords(e);
    setPendingPin(coords);
    setPendingRect(null);
    setCommentText("");
  };

  // Rectangle drawing handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isExpired || !nameSet || annotationMode !== "rect") return;
    e.preventDefault();
    const coords = getPercentCoords(e);
    setDrawStart(coords);
    setDrawCurrent(coords);
    setIsDrawing(true);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !drawStart) return;
    const coords = getPercentCoords(e);
    setDrawCurrent(coords);
  }, [isDrawing, drawStart]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !drawStart || !drawCurrent) return;
    setIsDrawing(false);

    const x = Math.min(drawStart.x, drawCurrent.x);
    const y = Math.min(drawStart.y, drawCurrent.y);
    const w = Math.abs(drawCurrent.x - drawStart.x);
    const h = Math.abs(drawCurrent.y - drawStart.y);

    // Minimum 2% dimension to count as a valid rectangle
    if (w < 2 && h < 2) {
      setDrawStart(null);
      setDrawCurrent(null);
      return;
    }

    setPendingRect({ x, y, w, h });
    setPendingPin(null);
    setCommentText("");
    setDrawStart(null);
    setDrawCurrent(null);
  }, [isDrawing, drawStart, drawCurrent]);

  // Figma overlay click for pins
  const handleFigmaOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isExpired || !nameSet || !figmaCommentMode) return;
    const coords = getPercentCoords(e);
    setPendingPin(coords);
    setPendingRect(null);
    setCommentText("");
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    if (!pendingPin && !pendingRect) return;
    setSubmitting(true);

    const insertData: any = {
      room_id: roomId!,
      reviewer_name: reviewerName || "Anonymous",
      reviewer_id: user?.id || null,
      comment_text: commentText.trim(),
      pin_number: nextPinNumber,
    };

    if (pendingRect) {
      insertData.pin_x = pendingRect.x;
      insertData.pin_y = pendingRect.y;
      insertData.rect_w = pendingRect.w;
      insertData.rect_h = pendingRect.h;
    } else if (pendingPin) {
      insertData.pin_x = pendingPin.x;
      insertData.pin_y = pendingPin.y;
    }

    await supabase.from("room_comments").insert(insertData);
    setPendingPin(null);
    setPendingRect(null);
    setCommentText("");
    setSubmitting(false);
    if (figmaCommentMode) setFigmaCommentMode(false);
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
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    return d > 0 ? `${d}d ${h}h` : `${h}h`;
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const topLevelComments = comments.filter((c) => !c.parent_id);
  const getReplies = (parentId: string) => comments.filter((c) => c.parent_id === parentId);
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  const getFigmaEmbedUrl = (url: string) => {
    if (url.includes("figma.com")) {
      return `https://www.figma.com/embed?embed_host=fixux&url=${encodeURIComponent(url)}`;
    }
    return null;
  };

  const isRect = (c: Comment) => c.rect_w != null && c.rect_h != null && c.rect_w > 0;

  // Drawing preview rectangle
  const drawingRect = isDrawing && drawStart && drawCurrent
    ? {
        x: Math.min(drawStart.x, drawCurrent.x),
        y: Math.min(drawStart.y, drawCurrent.y),
        w: Math.abs(drawCurrent.x - drawStart.x),
        h: Math.abs(drawCurrent.y - drawStart.y),
      }
    : null;

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
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm">
          <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-xl">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-2xl mb-6">
              <Lock className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Private Review Room</h2>
            <p className="text-sm text-muted-foreground mb-6">Enter the passcode to access this room.</p>
            <Input
              value={passcodeInput}
              onChange={(e) => setPasscodeInput(e.target.value)}
              placeholder="Enter passcode"
              className="mb-4 text-center text-sm h-12"
              onKeyDown={(e) => e.key === "Enter" && verifyPasscode()}
            />
            <Button onClick={verifyPasscode} className="w-full h-11 font-bold">Enter Room</Button>
          </div>
          <p className="text-center text-[11px] text-muted-foreground mt-4">Ask the room creator for the passcode.</p>
        </motion.div>
      </div>
    );
  }

  // Name entry
  if (!nameSet) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm">
          <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-xl">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-1">{room?.title}</h2>
            <p className="text-sm text-muted-foreground mb-6">Enter your name to start reviewing.</p>
            <Input
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="Your name"
              className="mb-4 text-sm h-12"
              onKeyDown={(e) => e.key === "Enter" && reviewerName.trim() && setNameSet(true)}
            />
            <Button onClick={() => setNameSet(true)} className="w-full h-11 font-bold" disabled={!reviewerName.trim()}>
              Start Reviewing
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const figmaEmbed = room?.preview_url ? getFigmaEmbedUrl(room.preview_url) : null;
  const hasImage = !!room?.image_url;
  const hasFigma = !!figmaEmbed && !hasImage;

  // Render pin/rect annotations overlay
  const renderAnnotations = () => (
    <>
      {/* Existing rectangle annotations */}
      {topLevelComments
        .filter((c) => c.pin_x != null && c.pin_y != null && isRect(c))
        .map((c) => (
          <button
            key={c.id}
            className={`absolute border-[3px] border-dashed rounded-md transition-all duration-200 ${
              c.is_resolved
                ? "border-primary/40 bg-primary/5"
                : activePin === c.pin_number
                ? "border-destructive bg-destructive/10 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                : "border-destructive/70 bg-destructive/5 hover:bg-destructive/10"
            }`}
            style={{
              left: `${c.pin_x}%`,
              top: `${c.pin_y}%`,
              width: `${c.rect_w}%`,
              height: `${c.rect_h}%`,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setActivePin(activePin === c.pin_number ? null : c.pin_number);
              document.getElementById(`comment-${c.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          >
            <span className={`absolute -top-3 -left-3 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-background shadow-md ${
              c.is_resolved ? "bg-primary/70 text-primary-foreground" : "bg-destructive text-destructive-foreground"
            }`}>
              {c.pin_number}
            </span>
          </button>
        ))}

      {/* Existing pin annotations (no rectangle) */}
      {topLevelComments
        .filter((c) => c.pin_x != null && c.pin_y != null && !isRect(c))
        .map((c) => (
          <button
            key={c.id}
            className={`absolute w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold -translate-x-1/2 -translate-y-1/2 transition-all duration-200 shadow-lg border-2 border-background ${
              c.is_resolved
                ? "bg-primary/70 text-primary-foreground"
                : activePin === c.pin_number
                ? "bg-destructive text-destructive-foreground scale-125 ring-4 ring-destructive/20"
                : "bg-destructive text-destructive-foreground hover:scale-110"
            }`}
            style={{ left: `${c.pin_x}%`, top: `${c.pin_y}%` }}
            onClick={(e) => {
              e.stopPropagation();
              setActivePin(activePin === c.pin_number ? null : c.pin_number);
              document.getElementById(`comment-${c.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          >
            {c.pin_number}
          </button>
        ))}

      {/* Drawing preview */}
      {drawingRect && (
        <div
          className="absolute border-[3px] border-dashed border-primary bg-primary/10 rounded-md pointer-events-none animate-pulse"
          style={{
            left: `${drawingRect.x}%`,
            top: `${drawingRect.y}%`,
            width: `${drawingRect.w}%`,
            height: `${drawingRect.h}%`,
          }}
        />
      )}

      {/* Pending rectangle */}
      {pendingRect && (
        <div
          className="absolute border-[3px] border-dashed border-primary bg-primary/10 rounded-md"
          style={{
            left: `${pendingRect.x}%`,
            top: `${pendingRect.y}%`,
            width: `${pendingRect.w}%`,
            height: `${pendingRect.h}%`,
          }}
        >
          <span className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold border-2 border-background shadow-md animate-pulse">
            {nextPinNumber}
          </span>
        </div>
      )}

      {/* Pending pin */}
      {pendingPin && !pendingRect && (
        <div
          className="absolute w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[11px] font-bold -translate-x-1/2 -translate-y-1/2 animate-pulse ring-4 ring-primary/20 border-2 border-background"
          style={{ left: `${pendingPin.x}%`, top: `${pendingPin.y}%` }}
        >
          {nextPinNumber}
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky Header — Refined glassmorphism */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 shadow-sm" style={{ backdropFilter: "blur(20px) saturate(1.4)", WebkitBackdropFilter: "blur(20px) saturate(1.4)" }}>
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-2.5 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-xl hover:bg-muted/60" onClick={() => navigate("/rooms")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-foreground truncate leading-tight">{room?.title}</h1>
              {room?.is_private && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-destructive/10 text-destructive border border-destructive/20">
                  <Lock className="h-2.5 w-2.5" />
                  Private
                </span>
              )}
            </div>
            {room?.description && (
              <p className="text-[11px] text-muted-foreground truncate mt-0.5 max-w-md">{room.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Annotation mode toggle for images */}
            {hasImage && !isExpired && nameSet && (
              <div className="flex items-center bg-muted/60 rounded-lg p-0.5 gap-0.5 border border-border/30">
                <button
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-200 ${
                    annotationMode === "pin"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  }`}
                  onClick={() => setAnnotationMode("pin")}
                >
                  <MousePointer2 className="h-3 w-3" />
                  Pin
                </button>
                <button
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-200 ${
                    annotationMode === "rect"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  }`}
                  onClick={() => setAnnotationMode("rect")}
                >
                  <Square className="h-3 w-3" />
                  Area
                </button>
              </div>
            )}

            {/* Figma comment toggle */}
            {hasFigma && !isExpired && nameSet && (
              <Button
                variant={figmaCommentMode ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs gap-1.5 rounded-lg"
                onClick={() => {
                  setFigmaCommentMode(!figmaCommentMode);
                  setPendingPin(null);
                }}
              >
                <MessageCircle className="h-3 w-3" />
                {figmaCommentMode ? "Done" : "Comment"}
              </Button>
            )}

            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border ${
              isExpired ? "bg-destructive/5 text-destructive border-destructive/20" : "bg-primary/5 text-primary border-primary/20"
            }`}>
              <Clock className="h-3 w-3" />
              {isExpired ? "Expired" : getTimeRemaining()}
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 rounded-lg" onClick={() => setShowShareModal(true)}>
              <Copy className="h-3 w-3" />
              Share
            </Button>
          </div>
        </div>
      </header>

      {isExpired && (
        <div className="bg-destructive/5 border-b border-destructive/15 px-6 py-2.5 text-center text-[11px] text-destructive font-semibold flex items-center justify-center gap-2">
          <Clock className="h-3 w-3" />
          This room has expired. Comments are disabled and data will be permanently deleted soon.
        </div>
      )}

      {/* Main Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Design Area */}
        <div className="flex-1 relative overflow-auto bg-gradient-to-b from-muted/10 to-muted/30">
          {/* Figma iframe preview with overlay */}
          {hasFigma ? (
            <div className="relative w-full h-full min-h-[60vh]">
              <iframe
                src={figmaEmbed!}
                className="w-full h-full border-0 min-h-[60vh]"
                title={room?.title}
                allowFullScreen
                style={{ pointerEvents: figmaCommentMode ? "none" : "auto" }}
              />

              {/* Comment overlay on Figma */}
              {figmaCommentMode && (
                <div
                  className="absolute inset-0 cursor-crosshair z-10"
                  onClick={handleFigmaOverlayClick}
                >
                  {renderAnnotations()}
                </div>
              )}

              {/* Show annotations when not in comment mode too */}
              {!figmaCommentMode && (
                <div className="absolute inset-0 pointer-events-none z-10">
                  {topLevelComments
                    .filter((c) => c.pin_x != null && c.pin_y != null && !isRect(c))
                    .map((c) => (
                      <div
                        key={c.id}
                        className={`absolute w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold -translate-x-1/2 -translate-y-1/2 shadow-lg border-2 border-background pointer-events-auto cursor-pointer ${
                          c.is_resolved
                            ? "bg-primary/70 text-primary-foreground"
                            : "bg-destructive text-destructive-foreground hover:scale-110"
                        } transition-all`}
                        style={{ left: `${c.pin_x}%`, top: `${c.pin_y}%` }}
                        onClick={() => {
                          setActivePin(activePin === c.pin_number ? null : c.pin_number);
                          document.getElementById(`comment-${c.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                        }}
                      >
                        {c.pin_number}
                      </div>
                    ))}
                </div>
              )}

              <div className="absolute top-3 right-3 flex gap-2 z-20">
                {figmaCommentMode && (
                  <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-[10px] font-bold animate-pulse shadow-md">
                    Click anywhere to place a comment pin
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs bg-background/90 backdrop-blur-md rounded-lg border-border/50 shadow-sm"
                  onClick={() => setIsFullscreen(true)}
                >
                  <Maximize2 className="h-3 w-3" />
                  Fullscreen
                </Button>
              </div>
              {room?.preview_url && (
                <a href={room.preview_url} target="_blank" rel="noopener noreferrer" className="absolute bottom-3 right-3 z-20">
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs bg-background/90 backdrop-blur-md rounded-lg border-border/50 shadow-sm">
                    <ExternalLink className="h-3 w-3" />
                    Open in Figma
                  </Button>
                </a>
              )}
            </div>
          ) : (
            /* Image with pins/rectangles */
            <div className="p-4 lg:p-6 flex items-start justify-center min-h-[60vh]">
              <div
                ref={imageRef}
                className={`relative max-w-full select-none ${
                  annotationMode === "rect" ? "cursor-crosshair" : "cursor-crosshair"
                }`}
                onClick={annotationMode === "pin" ? handleImageClick : undefined}
                onMouseDown={annotationMode === "rect" ? handleMouseDown : undefined}
                onMouseMove={annotationMode === "rect" ? handleMouseMove : undefined}
                onMouseUp={annotationMode === "rect" ? handleMouseUp : undefined}
              >
                {room?.image_url ? (
                  <>
                    <img
                      src={room.image_url}
                      alt={room?.title}
                      className="max-w-full max-h-[80vh] object-contain rounded-xl border border-border/30 shadow-lg select-none"
                      draggable={false}
                    />
                    {/* Bottom toolbar */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <div className="bg-background/90 backdrop-blur-md rounded-lg px-3 py-1.5 text-[11px] text-muted-foreground font-medium shadow-sm border border-border/30">
                        {annotationMode === "pin" ? "Click to place a pin" : "Drag to select an area"}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 text-xs bg-background/90 backdrop-blur-md rounded-lg border-border/30 shadow-sm hover:bg-background"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsFullscreen(true);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                        Preview Full
                      </Button>
                    </div>
                  </>
                ) : room?.preview_url ? (
                  <div className="w-full max-w-2xl bg-card border border-border/50 rounded-2xl p-12 text-center shadow-sm">
                    <ExternalLink className="h-10 w-10 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-3">Preview URL</p>
                    <a href={room.preview_url} target="_blank" rel="noopener noreferrer" className="text-primary underline text-sm break-all font-medium">
                      {room.preview_url}
                    </a>
                  </div>
                ) : (
                  <div className="w-96 h-64 bg-card border border-border/50 rounded-2xl flex items-center justify-center shadow-sm">
                    <p className="text-sm text-muted-foreground">No design uploaded</p>
                  </div>
                )}

                {room?.image_url && renderAnnotations()}
              </div>
            </div>
          )}
          {/* Inline comment input */}
          <AnimatePresence>
            {(pendingPin || pendingRect) && !isExpired && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-6 left-6 right-6 lg:left-1/4 lg:right-1/4 bg-card border border-border/50 rounded-2xl shadow-2xl p-5 z-20"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                      {getInitials(reviewerName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-foreground">{reviewerName}</span>
                      {pendingRect && (
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold">
                          Area #{nextPinNumber}
                        </span>
                      )}
                      {pendingPin && !pendingRect && (
                        <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-semibold">
                          Pin #{nextPinNumber}
                        </span>
                      )}
                    </div>
                    <Textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add your feedback..."
                      rows={2}
                      className="text-sm resize-none min-h-[60px]"
                      autoFocus
                    />
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setPendingPin(null); setPendingRect(null); }}>
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

        {/* Comments Sidebar */}
        <div className="w-full lg:w-[380px] border-t lg:border-t-0 lg:border-l border-border/30 bg-card/80 flex flex-col" style={{ backdropFilter: "blur(8px)" }}>
          <div className="px-5 py-3.5 border-b border-border/30 shrink-0 bg-card">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center border border-primary/10">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-[13px] font-bold text-foreground leading-tight">Comments</h2>
                {!isExpired && (
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                    {hasImage
                      ? annotationMode === "pin"
                        ? "Click on the design to pin feedback"
                        : "Drag on the design to select an area"
                      : hasFigma
                      ? "Toggle Comment mode to annotate"
                      : "Click on the design to leave feedback"}
                  </p>
                )}
              </div>
              <span className="text-[11px] font-bold text-muted-foreground bg-muted/80 px-2.5 py-1 rounded-md border border-border/30">
                {topLevelComments.length}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {topLevelComments.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-muted/60 to-muted/30 flex items-center justify-center mx-auto mb-4 border border-border/30">
                  <Sparkles className="h-7 w-7 text-muted-foreground/25" />
                </div>
                <p className="text-xs font-bold text-foreground mb-1">No comments yet</p>
                <p className="text-[11px] text-muted-foreground/60 max-w-[200px] mx-auto leading-relaxed">
                  {hasImage ? "Click or drag on the design to leave your first feedback." : "Click Comment to start annotating."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/20">
                {topLevelComments.map((c) => {
                  const replies = getReplies(c.id);
                  const isActive = activePin === c.pin_number;
                  const isRectComment = isRect(c);

                  return (
                    <div
                      key={c.id}
                      id={`comment-${c.id}`}
                      className={`px-4 py-3.5 transition-all duration-200 cursor-pointer ${
                        isActive 
                          ? "bg-primary/5 border-l-2 border-l-primary" 
                          : "hover:bg-muted/20 border-l-2 border-l-transparent"
                      }`}
                      onClick={() => setActivePin(isActive ? null : c.pin_number)}
                    >
                      <div className="flex items-start gap-2.5">
                        {c.pin_number != null && (
                          <span
                            className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shadow-sm ${
                              c.is_resolved
                                ? "bg-primary/10 text-primary border border-primary/20"
                                : "bg-destructive/10 text-destructive border border-destructive/20"
                            }`}
                          >
                            {c.pin_number}
                          </span>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[12px] font-bold text-foreground">{c.reviewer_name}</span>
                            {isRectComment && (
                              <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-semibold border border-primary/15">
                                Area
                              </span>
                            )}
                            <span className="text-[10px] text-muted-foreground/70 ml-auto">
                              {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className={`text-[12px] text-foreground/90 leading-relaxed ${c.is_resolved ? "line-through opacity-40" : ""}`}>
                            {c.comment_text}
                          </p>

                          <div className="flex items-center gap-2.5 mt-2.5">
                            {!isExpired && (
                              <button
                                className="text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-muted/50"
                                onClick={(e) => { e.stopPropagation(); setReplyTo(replyTo === c.id ? null : c.id); }}
                              >
                                Reply
                              </button>
                            )}
                            {isOwner && !c.is_resolved && !isExpired && (
                              <button
                                className="text-[10px] font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5 px-1.5 py-0.5 rounded hover:bg-primary/5"
                                onClick={(e) => { e.stopPropagation(); resolveComment(c.id); }}
                              >
                                <Check className="h-2.5 w-2.5" /> Resolve
                              </button>
                            )}
                            {c.is_resolved && (
                              <span className="text-[10px] font-semibold text-primary flex items-center gap-0.5 px-1.5 py-0.5 bg-primary/5 rounded-md">
                                <Check className="h-2.5 w-2.5" /> Resolved
                              </span>
                            )}
                            {(isOwner || c.reviewer_id === user?.id) && (
                              <button
                                className="text-[10px] font-semibold text-muted-foreground hover:text-destructive transition-colors ml-auto px-1.5 py-0.5 rounded hover:bg-destructive/5"
                                onClick={(e) => { e.stopPropagation(); deleteComment(c.id); }}
                              >
                                Delete
                              </button>
                            )}
                          </div>

                          {replies.length > 0 && (
                            <div className="mt-3 ml-1 pl-3 border-l-2 border-border/40 space-y-2.5">
                              {replies.map((r) => (
                                <div key={r.id} className="py-1">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="text-[11px] font-bold text-foreground">{r.reviewer_name}</span>
                                    <span className="text-[10px] text-muted-foreground/60">
                                      {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                                    </span>
                                  </div>
                                  <p className="text-[12px] text-foreground/90 leading-relaxed">{r.comment_text}</p>
                                  {(isOwner || r.reviewer_id === user?.id) && (
                                    <button className="text-[10px] font-semibold text-muted-foreground hover:text-destructive mt-1 transition-colors" onClick={(e) => { e.stopPropagation(); deleteComment(r.id); }}>
                                      Delete
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {replyTo === c.id && (
                            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-2.5" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-2">
                                <Input
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Write a reply..."
                                  className="text-xs h-8 flex-1 rounded-lg"
                                  onKeyDown={(e) => e.key === "Enter" && submitReply(c.id)}
                                />
                                <Button
                                  size="sm"
                                  className="h-8 w-8 p-0 rounded-lg"
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
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 flex flex-col gap-0 rounded-xl overflow-hidden">
          <DialogHeader className="px-4 py-2.5 border-b border-border/30 shrink-0 flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-sm font-bold text-foreground">{room?.title}</DialogTitle>
            <div className="flex items-center gap-2">
              {hasImage && !isExpired && nameSet && (
                <div className="flex items-center bg-muted/60 rounded-lg p-0.5 gap-0.5 border border-border/30">
                  <button
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-semibold transition-all ${
                      annotationMode === "pin" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                    }`}
                    onClick={() => setAnnotationMode("pin")}
                  >
                    <MousePointer2 className="h-3 w-3" />
                    Pin
                  </button>
                  <button
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-semibold transition-all ${
                      annotationMode === "rect" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                    }`}
                    onClick={() => setAnnotationMode("rect")}
                  >
                    <Square className="h-3 w-3" />
                    Area
                  </button>
                </div>
              )}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-auto flex items-center justify-center bg-gradient-to-b from-muted/10 to-muted/30 p-4">
            {figmaEmbed && !hasImage ? (
              <iframe
                src={figmaEmbed}
                className="w-full h-full border-0 rounded-lg"
                title={room?.title}
                allowFullScreen
              />
            ) : room?.image_url ? (
              <div
                className="relative max-w-full"
                onClick={annotationMode === "pin" ? handleImageClick : undefined}
                onMouseDown={annotationMode === "rect" ? handleMouseDown : undefined}
                onMouseMove={annotationMode === "rect" ? handleMouseMove : undefined}
                onMouseUp={annotationMode === "rect" ? handleMouseUp : undefined}
              >
                <img
                  src={room.image_url}
                  alt={room?.title}
                  className="max-w-full max-h-[85vh] object-contain rounded-lg select-none"
                  draggable={false}
                />
                {renderAnnotations()}
              </div>
            ) : null}
          </div>

          {/* Floating comment input in fullscreen */}
          <AnimatePresence>
            {(pendingPin || pendingRect) && !isExpired && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-6 left-1/4 right-1/4 bg-card border border-border/30 rounded-xl shadow-2xl p-4 z-30"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                      {getInitials(reviewerName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add your feedback..."
                      rows={2}
                      className="text-sm resize-none min-h-[60px] rounded-lg"
                      autoFocus
                    />
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" className="h-7 text-xs rounded-lg" onClick={() => { setPendingPin(null); setPendingRect(null); }}>
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="h-7 text-xs gap-1 rounded-lg"
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
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && room && (
          <ShareRoomModal
            room={{ id: room.id, title: room.title, is_private: room.is_private, passcode: room.passcode }}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
