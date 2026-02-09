import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Globe, ThumbsUp, Award, Heart, MessageCircle, Loader2, LogOut, ExternalLink, Check, X, Link2, ShieldCheck, ShieldX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminContext } from "@/contexts/AdminContext";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

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
  const { exitAdminMode } = useAdminContext();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: feedbackData } = await supabase
      .from("feedback_and_testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (feedbackData) {
      const items = feedbackData as unknown as FeedbackItem[];
      setFeedbacks(items);

      const countryDist: Record<string, number> = {};
      let totalReactions = 0;
      let totalComments = 0;
      let approvedCount = 0;

      items.forEach((fb) => {
        countryDist[fb.user_country] = (countryDist[fb.user_country] || 0) + 1;
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
    }
    setLoading(false);
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("feedback_and_testimonials")
      .update({ is_approved: !currentStatus })
      .eq("id", id);

    if (error) {
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

  const handleExit = () => {
    exitAdminMode();
    navigate("/");
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const getDomainFromUrl = (url: string): string => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

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
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleExit}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Exit Admin
            </Button>
            <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleExit}>
            <LogOut className="h-4 w-4 mr-1" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Analytics Cards */}
        {analytics && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
          >
            <Card>
              <CardContent className="pt-6">
                <p className="text-2xl font-bold text-foreground">{analytics.totalFeedbacks}</p>
                <p className="text-sm text-muted-foreground">Total Feedbacks</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-2xl font-bold text-score-high">{analytics.approvedCount}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-2xl font-bold text-score-medium">{analytics.pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-2xl font-bold text-foreground">{analytics.totalReactions}</p>
                <p className="text-sm text-muted-foreground">Reactions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-2xl font-bold text-foreground">
                  {Object.keys(analytics.countryDistribution).length}
                </p>
                <p className="text-sm text-muted-foreground">Countries</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Filter bar */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm text-muted-foreground mr-2">Filter:</span>
          {(["all", "approved", "pending"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium border transition-all capitalize ${
                filter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/30"
              }`}
            >
              {f === "all" ? `All (${feedbacks.length})` : f === "approved" ? `Approved (${analytics?.approvedCount || 0})` : `Pending (${analytics?.pendingCount || 0})`}
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
            <h2 className="text-lg font-semibold mb-4 text-foreground">Country Distribution</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(analytics.countryDistribution)
                .sort((a, b) => b[1] - a[1])
                .map(([country, count]) => (
                  <span
                    key={country}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-muted text-sm border border-border"
                  >
                    <Globe className="h-3 w-3" />
                    {country}: {count}
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
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            Testimonials ({filteredFeedbacks.length})
          </h2>
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
                  <Card className={`border transition-all h-full ${
                    fb.is_approved ? "border-score-high/30" : "border-border"
                  }`}>
                    <CardContent className="p-4 flex flex-col h-full">
                      {/* Header with avatar */}
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
                            <span>
                              {formatDistanceToNow(new Date(fb.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        {/* Approval status badge */}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold ${
                          fb.is_approved
                            ? "bg-score-high/10 text-score-high border border-score-high/20"
                            : "bg-score-medium/10 text-score-medium border border-score-medium/20"
                        }`}>
                          {fb.is_approved ? <ShieldCheck className="w-3 h-3" /> : <ShieldX className="w-3 h-3" />}
                          {fb.is_approved ? "Approved" : "Pending"}
                        </span>
                      </div>

                      {/* Feedback text */}
                      <p className="text-sm text-foreground mb-3 leading-relaxed flex-1">{fb.feedback_text}</p>

                      {/* Profile link with thumbnail */}
                      {fb.profile_link && (
                        <a
                          href={fb.profile_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 bg-surface-2 border border-border mb-3 hover:border-primary/30 transition-colors group"
                        >
                          <div className="w-8 h-8 bg-card border border-border flex items-center justify-center shrink-0">
                            <Link2 className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                              {getDomainFromUrl(fb.profile_link)}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {fb.profile_link}
                            </p>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        </a>
                      )}

                      {/* Reactions */}
                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3.5 w-3.5" />
                            {breakdown?.like || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="h-3.5 w-3.5" />
                            {breakdown?.clap || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3.5 w-3.5" />
                            {breakdown?.love || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3.5 w-3.5" />
                            {fb.comments_count}
                          </span>
                        </div>
                        {/* Approve/Reject buttons */}
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
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {filteredFeedbacks.length === 0 && (
              <div className="text-center py-12 text-muted-foreground col-span-2">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No {filter !== "all" ? filter : ""} feedback yet.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
