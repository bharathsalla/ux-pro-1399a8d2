import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft, Globe, ThumbsUp, Award, Heart, MessageCircle,
  Loader2, LogOut, Check, X, ShieldCheck, ShieldX, Trash2,
} from "lucide-react";
import { LinkThumbnail } from "@/components/landing/LinkThumbnail";
import { StarRating } from "@/components/StarRating";
import { useNavigate } from "react-router-dom";
import { useAdminContext } from "@/contexts/AdminContext";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { getAvatarUrl } from "@/lib/avatar";

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
  profile_link: string;
  is_approved: boolean;
  rating: number;
}

interface AnalyticsData {
  totalFeedbacks: number;
  totalReactions: number;
  totalComments: number;
  approvedCount: number;
  pendingCount: number;
  countryDistribution: Record<string, number>;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { exitAdminMode, adminPasscode } = useAdminContext();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!adminPasscode) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.functions.invoke("admin-fetch-feedback", {
      body: { passcode: adminPasscode },
    });

    if (error || !data?.feedbacks) {
      console.error("Failed to fetch feedback:", error);
      setLoading(false);
      return;
    }

    const items = data.feedbacks as FeedbackItem[];
    setFeedbacks(items);

    const countryDist: Record<string, number> = {};
    let totalReactions = 0;
    let totalComments = 0;
    let approvedCount = 0;

    items.forEach((fb) => {
      if (fb.user_country) {
        countryDist[fb.user_country] = (countryDist[fb.user_country] || 0) + 1;
      }
      totalReactions += fb.likes_count;
      totalComments += fb.comments_count;
      if (fb.is_approved) approvedCount++;
    });

    setAnalytics({
      totalFeedbacks: items.length,
      totalReactions,
      totalComments,
      approvedCount,
      pendingCount: items.length - approvedCount,
      countryDistribution: countryDist,
    });

    setLoading(false);
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    if (!adminPasscode) return;

    const { data, error } = await supabase.functions.invoke("admin-update-feedback", {
      body: {
        passcode: adminPasscode,
        action: "approve",
        feedbackId: id,
        updates: { is_approved: !currentStatus },
      },
    });

    if (error || !data?.success) {
      toast.error("Failed to update approval status");
      return;
    }

    setFeedbacks((prev) =>
      prev.map((fb) => (fb.id === id ? { ...fb, is_approved: !currentStatus } : fb))
    );

    setAnalytics((prev) => {
      if (!prev) return prev;
      const delta = currentStatus ? -1 : 1;
      return {
        ...prev,
        approvedCount: prev.approvedCount + delta,
        pendingCount: prev.pendingCount - delta,
      };
    });

    toast.success(currentStatus ? "Testimonial unapproved" : "Testimonial approved ✓");
  };

  const deleteFeedback = async (id: string) => {
    if (!window.confirm("Delete this testimonial permanently?")) return;
    if (!adminPasscode) return;

    const fb = feedbacks.find((f) => f.id === id);

    const { data, error } = await supabase.functions.invoke("admin-update-feedback", {
      body: {
        passcode: adminPasscode,
        action: "delete",
        feedbackId: id,
      },
    });

    if (error || !data?.success) {
      toast.error("Failed to delete");
      return;
    }

    setFeedbacks((prev) => prev.filter((f) => f.id !== id));
    setAnalytics((prev) => {
      if (!prev || !fb) return prev;
      return {
        ...prev,
        totalFeedbacks: prev.totalFeedbacks - 1,
        approvedCount: fb.is_approved ? prev.approvedCount - 1 : prev.approvedCount,
        pendingCount: fb.is_approved ? prev.pendingCount : prev.pendingCount - 1,
      };
    });
    toast.success("Testimonial deleted");
  };

  const handleExit = () => {
    exitAdminMode();
    navigate("/");
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const filteredFeedbacks = feedbacks.filter((fb) => {
    if (filter === "approved") return fb.is_approved;
    if (filter === "pending") return !fb.is_approved;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleExit}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Exit
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Testimonial Management</h1>
              <p className="text-xs text-muted-foreground">Curate trusted reviews for your product</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleExit}>
            <LogOut className="h-4 w-4 mr-1" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Analytics Cards */}
        {analytics && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8"
          >
            {[
              { label: "Total", value: analytics.totalFeedbacks, color: "text-foreground" },
              { label: "Approved", value: analytics.approvedCount, color: "text-score-high" },
              { label: "Pending", value: analytics.pendingCount, color: "text-score-medium" },
              { label: "Reactions", value: analytics.totalReactions, color: "text-foreground" },
              { label: "Countries", value: Object.keys(analytics.countryDistribution).length, color: "text-foreground" },
            ].map((stat) => (
              <Card key={stat.label} className="border-border">
                <CardContent className="pt-5 pb-4">
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {/* Filter bar */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-[11px] tracking-[0.1em] uppercase text-muted-foreground mr-2 font-medium">Filter</span>
          {(["all", "approved", "pending"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 text-xs font-medium border transition-all capitalize ${
                filter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/30"
              }`}
            >
              {f === "all"
                ? `All (${feedbacks.length})`
                : f === "approved"
                ? `Approved (${analytics?.approvedCount || 0})`
                : `Pending (${analytics?.pendingCount || 0})`}
            </button>
          ))}
        </div>

        {/* Country Distribution */}
        {analytics && Object.keys(analytics.countryDistribution).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <p className="text-[11px] tracking-[0.1em] uppercase text-muted-foreground font-medium mb-3">Regions</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(analytics.countryDistribution)
                .sort((a, b) => b[1] - a[1])
                .map(([country, count]) => (
                  <span
                    key={country}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted text-[12px] border border-border"
                  >
                    <Globe className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium text-foreground">{country || "Unknown"}</span>
                    <span className="text-muted-foreground">({count})</span>
                  </span>
                ))}
            </div>
          </motion.div>
        )}

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-5">
            <p className="text-[11px] tracking-[0.1em] uppercase text-muted-foreground font-medium">
              Testimonials · {filteredFeedbacks.length}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFeedbacks.map((fb, index) => {
              const breakdown = fb.reactions_breakdown as Record<string, number>;
              return (
                <motion.div
                  key={fb.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * index }}
                >
                  <Card
                    className={`border transition-all h-full ${
                      fb.is_approved ? "border-score-high/30 bg-score-high/[0.02]" : "border-border"
                    }`}
                  >
                    <CardContent className="p-5 flex flex-col h-full">
                      {/* Category badges */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {fb.rating >= 4 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-score-high/10 text-score-high border border-score-high/20">
                            ⭐ Top Rated
                          </span>
                        )}
                        {fb.rating <= 2 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-destructive/10 text-destructive border border-destructive/20">
                            ⚠️ Low Rating
                          </span>
                        )}
                        {(breakdown?.like || 0) > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                            👍 Liked
                          </span>
                        )}
                        {(breakdown?.clap || 0) > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-score-medium/10 text-score-medium border border-score-medium/20">
                            👏 Clapped
                          </span>
                        )}
                        {(breakdown?.love || 0) > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-accent text-accent-foreground border border-border">
                            ❤️ Loved
                          </span>
                        )}
                        {fb.comments_count > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                            💬 {fb.comments_count} comment{fb.comments_count !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>

                      {/* Header */}
                      <div className="flex items-start gap-3 mb-4">
                        <Avatar className="h-11 w-11">
                          <AvatarImage src={getAvatarUrl(fb.user_name, fb.user_avatar_url)} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(fb.user_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground">{fb.user_name}</p>
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Globe className="h-3 w-3" />
                            <span>{fb.user_country || "Unknown"}</span>
                            <span className="mx-0.5">·</span>
                            <span>
                              {formatDistanceToNow(new Date(fb.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <div className="mt-1">
                            <StarRating rating={fb.rating || 5} readonly size="sm" />
                          </div>
                        </div>
                        {/* Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold ${
                            fb.is_approved
                              ? "bg-score-high/10 text-score-high border border-score-high/20"
                              : "bg-score-medium/10 text-score-medium border border-score-medium/20"
                          }`}
                        >
                          {fb.is_approved ? (
                            <ShieldCheck className="w-3 h-3" />
                          ) : (
                            <ShieldX className="w-3 h-3" />
                          )}
                          {fb.is_approved ? "Live" : "Pending"}
                        </span>
                      </div>

                      {/* Text */}
                      <p className="text-[13px] text-foreground mb-4 leading-relaxed flex-1">
                        "{fb.feedback_text}"
                      </p>

                      {/* Profile link */}
                      {fb.profile_link && (
                        <div className="mb-3">
                          <LinkThumbnail url={fb.profile_link} compact />
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between border-t border-border pt-3 mt-auto">
                        <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {breakdown?.like || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            {breakdown?.clap || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {breakdown?.love || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {fb.comments_count}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="gap-1 text-xs h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deleteFeedback(fb.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant={fb.is_approved ? "outline" : "default"}
                            className="gap-1 text-xs h-7"
                            onClick={() => toggleApproval(fb.id, fb.is_approved)}
                          >
                            {fb.is_approved ? (
                              <>
                                <X className="w-3 h-3" />
                                Revoke
                              </>
                            ) : (
                              <>
                                <Check className="w-3 h-3" />
                                Approve
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {filteredFeedbacks.length === 0 && (
              <div className="text-center py-16 text-muted-foreground col-span-2">
                <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No {filter !== "all" ? filter : ""} testimonials yet.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
