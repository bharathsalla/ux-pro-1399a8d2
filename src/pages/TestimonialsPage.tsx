import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "@/components/StarRating";
import { getAvatarUrl } from "@/lib/avatar";
import { LinkThumbnail } from "@/components/landing/LinkThumbnail";
import { FixUxLogo } from "@/components/FixUxLogo";

interface Testimonial {
  id: string;
  user_name: string;
  user_country: string;
  user_avatar_url: string | null;
  feedback_text: string;
  profile_link: string;
  rating: number;
  created_at: string;
}

export default function TestimonialsPage() {
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("feedback_and_testimonials")
        .select("id, user_name, user_country, user_avatar_url, feedback_text, profile_link, rating, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      if (data) setTestimonials(data as Testimonial[]);
      setLoading(false);
    };
    load();
  }, []);

  const initials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-[680px] mx-auto px-6 py-4 flex items-center justify-between">
          <FixUxLogo size="sm" />
          <button
            onClick={() => navigate("/")}
            className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>
      </header>

      <main className="max-w-[680px] mx-auto px-6 py-16 md:py-24">
        <article>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] tracking-[0.2em] uppercase text-primary font-medium mb-5">
            Community
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }} className="text-4xl md:text-[3.2rem] font-extrabold text-foreground leading-[1.08] mb-8">
            Testimonials
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="text-[1.15rem] text-muted-foreground leading-[1.7] mb-14">
            Real feedback from designers, founders, and product managers who use FixUx in their daily workflows.
          </motion.p>

          {loading ? (
            <div className="py-16 text-center text-sm text-muted-foreground animate-pulse">Loading…</div>
          ) : testimonials.length === 0 ? (
            <div className="py-16 text-center border border-border">
              <p className="text-sm text-muted-foreground">No testimonials yet. Be the first to share.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 -mx-6 md:mx-0">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 + i * 0.03 }}
                  className="bg-card border border-border p-5 flex flex-col"
                >
                  <StarRating rating={t.rating || 5} readonly size="sm" />
                  <p className="text-[13px] text-foreground leading-[1.65] flex-1 mt-4 mb-5">"{t.feedback_text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={getAvatarUrl(t.user_name, t.user_avatar_url)} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials(t.user_name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate">{t.user_name}</p>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Globe className="w-2.5 h-2.5" />
                        {t.user_country}
                      </div>
                    </div>
                  </div>
                  {t.profile_link && (
                    <div className="mt-3">
                      <LinkThumbnail url={t.profile_link} compact />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </article>
      </main>
    </div>
  );
}
