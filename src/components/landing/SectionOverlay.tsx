import { motion, AnimatePresence } from "framer-motion";
import { X, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LinkThumbnail } from "./LinkThumbnail";
import { StarRating } from "@/components/StarRating";
import { getAvatarUrl } from "@/lib/avatar";
import { FixUxLogo } from "@/components/FixUxLogo";
import auditFlowImg from "@/assets/platform-audit-flow.jpg";
import reportPreviewImg from "@/assets/platform-report-preview.jpg";

export type SectionId = "flowcheck" | "testimonials" | "contact" | "why-free";

interface SectionOverlayProps {
  activeSection: SectionId | null;
  onClose: () => void;
}

export function SectionOverlay({ activeSection, onClose }: SectionOverlayProps) {
  if (!activeSection) return null;

  return (
    <AnimatePresence mode="wait">
      {activeSection && (
        <motion.div
          key={activeSection}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-background overflow-y-auto"
        >
          {/* Minimal header */}
          <header className="sticky top-0 z-10 bg-background border-b border-border">
            <div className="max-w-[680px] mx-auto px-6 py-4 flex items-center justify-between">
              <FixUxLogo size="sm" />
              <button
                onClick={onClose}
                className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                Close <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </header>

          {/* Centered editorial content column */}
          <main className="max-w-[680px] mx-auto px-6 py-16 md:py-24">
            {activeSection === "flowcheck" && <FlowCheckContent />}
            {activeSection === "testimonials" && <TestimonialsContent />}
            {activeSection === "contact" && <ContactContent />}
            {activeSection === "why-free" && <WhyFreeContent />}
          </main>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ────────────────────────────────────────────
   FlowCheck — editorial long-form
   ──────────────────────────────────────────── */
function FlowCheckContent() {
  return (
    <article>
      {/* Kicker */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-[11px] tracking-[0.2em] uppercase text-primary font-medium mb-5"
      >
        Functional Feedback
      </motion.p>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 }}
        className="text-4xl md:text-[3.2rem] font-extrabold text-foreground leading-[1.08] mb-8"
      >
        FlowCheck
      </motion.h1>

      {/* Lead paragraph */}
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="text-[1.15rem] md:text-[1.3rem] text-muted-foreground leading-[1.7] mb-16"
      >
        FlowCheck analyzes your product screens for missing functionality,
        workflow gaps, and business risks — not visual styling. Think of it
        as a senior Product Strategist reviewing every screen you ship.
      </motion.p>

      {/* Screenshot 1 */}
      <motion.figure
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="mb-16 -mx-6 md:mx-0"
      >
        <div className="border border-border overflow-hidden">
          <img src={auditFlowImg} alt="Upload and analyze your product screens" className="w-full block" />
        </div>
        <figcaption className="mt-3 text-[12px] text-muted-foreground leading-relaxed">
          Upload up to 5 product screens — dashboards, forms, listings, or admin panels.
          The AI adapts to your domain automatically.
        </figcaption>
      </motion.figure>

      {/* Section: How it works */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className="mb-16"
      >
        <h2 className="text-2xl font-bold text-foreground mb-8">How it works</h2>

        <div className="space-y-10">
          {[
            {
              num: "01",
              title: "Upload your screen",
              body: "Drop a single screenshot or up to five screens for multi-page analysis. The AI accepts any fidelity — wireframes, MVPs, or production designs.",
            },
            {
              num: "02",
              title: "AI analyzes functionality",
              body: "The engine scans for functional gaps, missing actions, workflow inefficiencies, and business risks. It adapts to your product domain automatically.",
            },
            {
              num: "03",
              title: "Two-column report",
              body: "Left column shows your screen with dashed gap annotations. Right column provides severity-tagged issue cards with industry standards and recommended fixes.",
            },
            {
              num: "04",
              title: "Actionable recommendations",
              body: "Each gap includes concrete solutions, user-value impact, and business risk — prioritized as Critical, Major, or Minor.",
            },
          ].map((step) => (
            <div key={step.num} className="flex gap-6">
              <span className="text-[11px] font-bold text-primary tracking-wide mt-1 shrink-0">
                {step.num}
              </span>
              <div>
                <h3 className="text-base font-semibold text-foreground mb-1.5">{step.title}</h3>
                <p className="text-[14px] text-muted-foreground leading-[1.7]">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Screenshot 2 */}
      <motion.figure
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-16 -mx-6 md:mx-0"
      >
        <div className="border border-border overflow-hidden">
          <img src={reportPreviewImg} alt="Two-column functional feedback report" className="w-full block" />
        </div>
        <figcaption className="mt-3 text-[12px] text-muted-foreground leading-relaxed">
          Interactive report — click any card to highlight the corresponding gap on your design.
        </figcaption>
      </motion.figure>

      {/* What it detects */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
      >
        <h2 className="text-2xl font-bold text-foreground mb-6">What it detects</h2>
        <ul className="space-y-4">
          {[
            ["Missing features", "Actions users expect but can't perform on your screen."],
            ["Enterprise readiness", "Scalability, compliance, and role-based access gaps."],
            ["Workflow gaps", "Manual steps that should be automated for better UX."],
            ["Business impact", "Every finding tied to real user problems and revenue risk."],
          ].map(([title, desc]) => (
            <li key={title} className="flex items-baseline gap-3">
              <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0 mt-[7px]" />
              <p className="text-[14px] text-muted-foreground leading-[1.7]">
                <strong className="text-foreground font-semibold">{title}</strong> — {desc}
              </p>
            </li>
          ))}
        </ul>
      </motion.div>
    </article>
  );
}

/* ────────────────────────────────────────────
   Testimonials — 3-column cards
   ──────────────────────────────────────────── */
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

function TestimonialsContent() {
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
    <article>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-[11px] tracking-[0.2em] uppercase text-primary font-medium mb-5"
      >
        Community
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 }}
        className="text-4xl md:text-[3.2rem] font-extrabold text-foreground leading-[1.08] mb-8"
      >
        Testimonials
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="text-[1.15rem] text-muted-foreground leading-[1.7] mb-14"
      >
        Real feedback from designers, founders, and product managers
        who use FixUx in their daily workflows.
      </motion.p>

      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground animate-pulse">
          Loading…
        </div>
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

              <p className="text-[13px] text-foreground leading-[1.65] flex-1 mt-4 mb-5">
                "{t.feedback_text}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={getAvatarUrl(t.user_name, t.user_avatar_url)} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {initials(t.user_name)}
                  </AvatarFallback>
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
  );
}

/* ────────────────────────────────────────────
   Contact — minimal editorial
   ──────────────────────────────────────────── */
function ContactContent() {
  return (
    <article>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-[11px] tracking-[0.2em] uppercase text-primary font-medium mb-5"
      >
        Get in Touch
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 }}
        className="text-4xl md:text-[3.2rem] font-extrabold text-foreground leading-[1.08] mb-8"
      >
        Contact Us
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="text-[1.15rem] text-muted-foreground leading-[1.7] mb-14"
      >
        Have questions, feature requests, or want to collaborate?
        We'd love to hear from you.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="space-y-10"
      >
        <div className="border-l-2 border-primary pl-6 space-y-2">
          <p className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground font-medium">Email</p>
          <a
            href="mailto:bhrathuxdesigner@gmail.com"
            className="text-[1.1rem] text-foreground underline underline-offset-4 decoration-border hover:decoration-primary hover:text-primary transition-colors"
          >
            bhrathuxdesigner@gmail.com
          </a>
          <p className="text-[13px] text-muted-foreground">We typically respond within 24 hours.</p>
        </div>

        <div className="border-l-2 border-border pl-6 space-y-2">
          <p className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground font-medium">Social</p>
          <div className="flex items-center gap-5">
            <a href="#" className="text-[14px] text-muted-foreground underline underline-offset-4 decoration-border hover:text-foreground hover:decoration-foreground transition-colors">
              𝕏 Twitter
            </a>
            <a href="#" className="text-[14px] text-muted-foreground underline underline-offset-4 decoration-border hover:text-foreground hover:decoration-foreground transition-colors">
              LinkedIn
            </a>
          </div>
        </div>
      </motion.div>
    </article>
  );
}

/* ────────────────────────────────────────────
   Why Free — editorial prose
   ──────────────────────────────────────────── */
function WhyFreeContent() {
  return (
    <article>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-[11px] tracking-[0.2em] uppercase text-primary font-medium mb-5"
      >
        Our Mission
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 }}
        className="text-4xl md:text-[3.2rem] font-extrabold text-foreground leading-[1.08] mb-8"
      >
        Why It Is Free
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="text-[1.15rem] text-muted-foreground leading-[1.7] mb-14"
      >
        We believe every designer, product manager, and startup founder
        deserves access to professional-grade functional feedback —
        regardless of budget.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="space-y-12"
      >
        {[
          {
            title: "Community Driven",
            body: "Your feedback helps us improve the AI engine for everyone. Every audit makes the system smarter, more accurate, and better calibrated for real-world product screens. You're not just using a tool — you're shaping it.",
          },
          {
            title: "Open Approach",
            body: "We're building in public and value transparency over profit. Quality feedback tools have traditionally been locked behind expensive consulting engagements. We think that model is broken.",
          },
          {
            title: "Premium Coming Soon",
            body: "Advanced features like team reports, API access, design-system integration, and custom scoring frameworks will be available as paid options. The core audit experience remains free.",
          },
        ].map((section) => (
          <div key={section.title} className="border-l-2 border-primary pl-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">{section.title}</h3>
            <p className="text-[14px] text-muted-foreground leading-[1.7]">{section.body}</p>
          </div>
        ))}
      </motion.div>

      {/* Pull quote */}
      <motion.blockquote
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-16 border-t border-b border-border py-10"
      >
        <p className="text-[1.2rem] md:text-[1.4rem] text-foreground leading-[1.6] italic text-center">
          "Great products are built on great feedback. We're making
          that feedback accessible to everyone."
        </p>
      </motion.blockquote>
    </article>
  );
}
