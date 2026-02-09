import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Globe, ThumbsUp, Award, Heart, MessageCircle, Loader2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAdminContext } from "@/contexts/AdminContext";
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

interface AnalyticsData {
  totalFeedbacks: number;
  totalReactions: number;
  totalComments: number;
  countryDistribution: Record<string, number>;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { exitAdminMode } = useAdminContext();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

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

      // Calculate analytics
      const countryDist: Record<string, number> = {};
      let totalReactions = 0;
      let totalComments = 0;

      items.forEach((fb) => {
        countryDist[fb.user_country] = (countryDist[fb.user_country] || 0) + 1;
        totalReactions += fb.likes_count;
        totalComments += fb.comments_count;
      });

      setAnalytics({
        totalFeedbacks: items.length,
        totalReactions,
        totalComments,
        countryDistribution: countryDist,
      });
    }
    setLoading(false);
  };

  const handleExit = () => {
    exitAdminMode();
    navigate("/");
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

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
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <Card>
              <CardContent className="pt-6">
                <p className="text-2xl font-bold text-foreground">{analytics.totalFeedbacks}</p>
                <p className="text-sm text-muted-foreground">Total Feedbacks</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-2xl font-bold text-foreground">{analytics.totalReactions}</p>
                <p className="text-sm text-muted-foreground">Total Reactions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-2xl font-bold text-foreground">{analytics.totalComments}</p>
                <p className="text-sm text-muted-foreground">Total Comments</p>
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
                    className="inline-flex items-center gap-1 px-3 py-1 bg-muted rounded-full text-sm"
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
          <h2 className="text-lg font-semibold mb-4 text-foreground">All Testimonials</h2>
          <div className="space-y-4">
            {feedbacks.map((fb, index) => {
              const breakdown = fb.reactions_breakdown as Record<string, number>;
              return (
                <motion.div
                  key={fb.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <Card className="border border-border">
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
                            <span>
                              {formatDistanceToNow(new Date(fb.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Feedback text */}
                      <p className="text-sm text-foreground mb-3 leading-relaxed">{fb.feedback_text}</p>

                      {/* Reactions */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-border pt-3">
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
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {feedbacks.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No feedback yet.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
