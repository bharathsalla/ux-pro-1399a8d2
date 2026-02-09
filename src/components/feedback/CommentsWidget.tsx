import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, MessageCircle, Trash2, Globe, ThumbsUp, Heart, Award } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FeedbackItem {
  id: string;
  user_name: string;
  user_country: string;
  user_avatar_url: string | null;
  feedback_text: string;
  likes_count: number;
  comments_count: number;
  reactions_breakdown: Record<string, number>;
  created_at: string;
}

interface CommentItem {
  id: string;
  feedback_id: string;
  user_id: string;
  user_name: string;
  user_country: string;
  user_avatar_url: string | null;
  comment_text: string;
  created_at: string;
}

interface UserReaction {
  id: string;
  feedback_id: string;
  reaction_type: "like" | "clap" | "love";
}

interface CommentsWidgetProps {
  requireComment?: boolean;
  onCommentComplete?: () => void;
}

export default function CommentsWidget({ requireComment, onCommentComplete }: CommentsWidgetProps) {
  const { user, profile, refreshProfile } = useAuthContext();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [comments, setComments] = useState<Record<string, CommentItem[]>>({});
  const [userReactions, setUserReactions] = useState<UserReaction[]>([]);
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [loadingComment, setLoadingComment] = useState<string | null>(null);
  const [loadingReaction, setLoadingReaction] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
    if (user) fetchUserReactions();
  }, [user]);

  const fetchFeedbacks = async () => {
    const { data, error } = await supabase
      .from("feedback_and_testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setFeedbacks(data as unknown as FeedbackItem[]);
      // Auto-expand first feedback if comments are required
      if (requireComment && data.length > 0) {
        setExpandedFeedback(data[0].id);
        fetchComments(data[0].id);
      }
    }
    setLoading(false);
  };

  const fetchUserReactions = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("reactions")
      .select("*")
      .eq("user_id", user.id);

    if (data) setUserReactions(data as unknown as UserReaction[]);
  };

  const fetchComments = async (feedbackId: string) => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("feedback_id", feedbackId)
      .order("created_at", { ascending: true });

    if (data) {
      setComments((prev) => ({ ...prev, [feedbackId]: data as unknown as CommentItem[] }));
    }
  };

  const toggleExpand = (feedbackId: string) => {
    if (expandedFeedback === feedbackId) {
      setExpandedFeedback(null);
    } else {
      setExpandedFeedback(feedbackId);
      if (!comments[feedbackId]) {
        fetchComments(feedbackId);
      }
    }
  };

  const handleReaction = async (feedbackId: string, type: "like" | "clap" | "love") => {
    if (!user) return;
    setLoadingReaction(feedbackId);

    const existing = userReactions.find((r) => r.feedback_id === feedbackId);

    if (existing) {
      if (existing.reaction_type === type) {
        // Remove reaction
        await supabase.from("reactions").delete().eq("id", existing.id);
        setUserReactions((prev) => prev.filter((r) => r.id !== existing.id));
      } else {
        // Update reaction
        await supabase
          .from("reactions")
          .update({ reaction_type: type })
          .eq("id", existing.id);
        setUserReactions((prev) =>
          prev.map((r) => (r.id === existing.id ? { ...r, reaction_type: type } : r))
        );
      }
    } else {
      // Create reaction
      const { data } = await supabase
        .from("reactions")
        .insert({
          feedback_id: feedbackId,
          user_id: user.id,
          reaction_type: type,
        })
        .select()
        .single();

      if (data) {
        setUserReactions((prev) => [...prev, data as unknown as UserReaction]);
      }
    }

    // Refresh feedbacks to get updated counts
    fetchFeedbacks();
    setLoadingReaction(null);
  };

  const handleComment = async (feedbackId: string) => {
    const text = commentText[feedbackId]?.trim();
    if (!text || !user || !profile) return;

    setLoadingComment(feedbackId);

    const { error } = await supabase.from("comments").insert({
      feedback_id: feedbackId,
      user_id: user.id,
      user_name: profile.name,
      user_country: profile.country,
      user_avatar_url: profile.avatar_url,
      comment_text: text,
    });

    if (error) {
      toast.error("Failed to post comment");
      setLoadingComment(null);
      return;
    }

    // Update has_commented
    if (!profile.has_commented) {
      await supabase
        .from("profiles")
        .update({ has_commented: true })
        .eq("id", user.id);
      await refreshProfile();
    }

    setCommentText((prev) => ({ ...prev, [feedbackId]: "" }));
    fetchComments(feedbackId);
    fetchFeedbacks();
    setLoadingComment(null);

    if (requireComment && onCommentComplete) {
      toast.success("Thank you for your comment! You now have full access.");
      onCommentComplete();
    }
  };

  const handleDeleteComment = async (commentId: string, feedbackId: string) => {
    await supabase.from("comments").delete().eq("id", commentId);
    fetchComments(feedbackId);
    fetchFeedbacks();
    toast.success("Comment deleted");
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const getUserReaction = (feedbackId: string) =>
    userReactions.find((r) => r.feedback_id === feedbackId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No feedback yet. Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {requireComment && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center mb-6">
          <p className="text-sm font-medium text-foreground">
            💬 Please comment on at least one feedback below to continue using the app.
          </p>
        </div>
      )}

      {feedbacks.map((fb, index) => {
        const reaction = getUserReaction(fb.id);
        const isExpanded = expandedFeedback === fb.id;
        const fbComments = comments[fb.id] || [];
        const breakdown = fb.reactions_breakdown as Record<string, number>;

        return (
          <motion.div
            key={fb.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="border border-border overflow-hidden">
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={fb.user_avatar_url || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(fb.user_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground">{fb.user_name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Globe className="h-3 w-3" />
                      <span>{fb.user_country}</span>
                      <span>·</span>
                      <span>{formatDistanceToNow(new Date(fb.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>

                {/* Feedback text */}
                <p className="text-sm text-foreground mb-3 leading-relaxed">{fb.feedback_text}</p>

                {/* Reactions */}
                <div className="flex items-center gap-2 border-t border-border pt-3">
                  <Button
                    variant={reaction?.reaction_type === "like" ? "default" : "ghost"}
                    size="sm"
                    className="h-8 gap-1 text-xs"
                    onClick={() => handleReaction(fb.id, "like")}
                    disabled={loadingReaction === fb.id}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    {(breakdown?.like || 0) > 0 && <span>{breakdown.like}</span>}
                  </Button>
                  <Button
                    variant={reaction?.reaction_type === "clap" ? "default" : "ghost"}
                    size="sm"
                    className="h-8 gap-1 text-xs"
                    onClick={() => handleReaction(fb.id, "clap")}
                    disabled={loadingReaction === fb.id}
                  >
                    <Award className="h-3.5 w-3.5" />
                    {(breakdown?.clap || 0) > 0 && <span>{breakdown.clap}</span>}
                  </Button>
                  <Button
                    variant={reaction?.reaction_type === "love" ? "default" : "ghost"}
                    size="sm"
                    className="h-8 gap-1 text-xs"
                    onClick={() => handleReaction(fb.id, "love")}
                    disabled={loadingReaction === fb.id}
                  >
                    <Heart className="h-3.5 w-3.5" />
                    {(breakdown?.love || 0) > 0 && <span>{breakdown.love}</span>}
                  </Button>
                  <div className="flex-1" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                    onClick={() => toggleExpand(fb.id)}
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    {fb.comments_count > 0 && <span>{fb.comments_count}</span>}
                    <span>{isExpanded ? "Hide" : "Comment"}</span>
                  </Button>
                </div>

                {/* Comments section */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 border-t border-border pt-3 space-y-3"
                  >
                    {fbComments.map((c) => (
                      <div key={c.id} className="flex items-start gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={c.user_avatar_url || ""} />
                          <AvatarFallback className="text-[10px] bg-muted">
                            {getInitials(c.user_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-muted rounded-lg p-2">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-semibold">{c.user_name}</span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <Globe className="h-2.5 w-2.5" />
                              {c.user_country}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              · {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-xs mt-0.5">{c.comment_text}</p>
                        </div>
                        {c.user_id === user?.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteComment(c.id, fb.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}

                    {/* Comment input */}
                    <div className="flex items-start gap-2">
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={profile?.avatar_url || ""} />
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                          {profile ? getInitials(profile.name) : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Textarea
                          value={commentText[fb.id] || ""}
                          onChange={(e) =>
                            setCommentText((prev) => ({ ...prev, [fb.id]: e.target.value }))
                          }
                          placeholder="Write a comment..."
                          rows={2}
                          className="text-xs min-h-[60px] resize-none"
                        />
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleComment(fb.id)}
                          disabled={!commentText[fb.id]?.trim() || loadingComment === fb.id}
                        >
                          {loadingComment === fb.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            "Post"
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
