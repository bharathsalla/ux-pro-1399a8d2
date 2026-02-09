import { motion, AnimatePresence } from "framer-motion";
import {
  X, Upload, Sparkles, LayoutDashboard, Target,
  MessageSquare, Mail, HelpCircle, ArrowRight,
  CheckCircle2, Zap, Shield, Users, Globe,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LinkThumbnail } from "./LinkThumbnail";
import { StarRating } from "@/components/StarRating";
import { getAvatarUrl } from "@/lib/avatar";
import auditFlowImg from "@/assets/platform-audit-flow.jpg";
import reportPreviewImg from "@/assets/platform-report-preview.jpg";

export type SectionId = "flowcheck" | "testimonials" | "contact" | "why-free";

interface SectionOverlayProps {
  activeSection: SectionId | null;
  onClose: () => void;
}

const sectionMeta: Record<SectionId, { title: string; subtitle: string; icon: typeof Target }> = {
  flowcheck: { title: "FlowCheck", subtitle: "AI-Powered Functional Feedback", icon: Target },
  testimonials: { title: "Testimonials", subtitle: "What Our Users Say", icon: MessageSquare },
  contact: { title: "Contact Us", subtitle: "Get In Touch", icon: Mail },
  "why-free": { title: "Why It Is Free", subtitle: "Our Mission & Vision", icon: HelpCircle },
};

export function SectionOverlay({ activeSection, onClose }: SectionOverlayProps) {
  if (!activeSection) return null;

  const meta = sectionMeta[activeSection];

  return (
    <AnimatePresence mode="wait">
      {activeSection && (
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-background overflow-y-auto"
        >
          <header className="sticky top-0 z-10 bg-card/95 backdrop-blur-md border-b border-border">
            <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 flex items-center justify-center">
                  <meta.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">{meta.title}</h2>
                  <p className="text-xs text-muted-foreground">{meta.subtitle}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 border border-border hover:bg-surface-2 hover:border-primary/30 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          <div className="max-w-5xl mx-auto px-6 py-10">
            {activeSection === "flowcheck" && <FlowCheckContent />}
            {activeSection === "testimonials" && <TestimonialsContent />}
            {activeSection === "contact" && <ContactContent />}
            {activeSection === "why-free" && <WhyFreeContent />}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── FlowCheck Section ─── */
function FlowCheckContent() {
  const steps = [
    {
      icon: Upload,
      title: "Upload Your Screen",
      description: "Upload 1–5 product screenshots. Our AI accepts dashboards, forms, listings, admin panels, and more.",
      detail: "Supports Single and Multi-screen modes for comprehensive analysis.",
    },
    {
      icon: Sparkles,
      title: "AI Analyzes Functionality",
      description: "Our AI identifies functional gaps, missing features, workflow inefficiencies, and business risks — not visual styling.",
      detail: "Domain-aware analysis adapts to your product type automatically.",
    },
    {
      icon: LayoutDashboard,
      title: "Two-Column Report",
      description: "Left side: your screen with dashed gap annotations. Right side: detailed issue descriptions with severity and industry standards.",
      detail: "Interactive linked annotations — click a card, see the gap highlighted.",
    },
    {
      icon: Target,
      title: "Actionable Recommendations",
      description: "Each gap comes with concrete, implementable solutions including user value and business impact.",
      detail: "Prioritized by severity: Critical → Major → Minor.",
    },
  ];

  const highlights = [
    { icon: Zap, label: "Missing Features", desc: "Identify actions users expect but can't perform on your screen." },
    { icon: Shield, label: "Enterprise Readiness", desc: "Scalability, compliance, and role-based access checks." },
    { icon: Users, label: "Workflow Gaps", desc: "Catch manual steps that should be automated for better UX." },
    { icon: CheckCircle2, label: "Business Impact", desc: "Every gap is tied to real user problems and business risks." },
  ];

  return (
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl mx-auto"
      >
        <h3 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3">
          Functional Feedback,{" "}
          <span className="text-gradient-primary">Not UI Critique</span>
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          FlowCheck analyzes your screens for missing functionality, workflow gaps, and business risks.
          It acts as a senior Product Strategist reviewing your product.
        </p>
      </motion.div>

      {/* Platform Screenshot — Audit Flow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="border border-border overflow-hidden shadow-lg"
      >
        <div className="bg-card border-b border-border px-4 py-2 flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-destructive/60" />
            <span className="w-3 h-3 rounded-full bg-score-medium/60" />
            <span className="w-3 h-3 rounded-full bg-score-high/60" />
          </div>
          <span className="text-xs text-muted-foreground ml-2">UX Audit Pro — Upload & Analyze</span>
        </div>
        <img src={auditFlowImg} alt="Platform audit flow" className="w-full" />
      </motion.div>

      {/* Steps */}
      <div>
        <h4 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-primary" />
          How It Works
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="bg-card border border-border p-5 relative group hover:border-primary/30 transition-all"
            >
              <div className="absolute top-3 right-3 text-3xl font-extrabold text-border/50 group-hover:text-primary/10 transition-colors">
                {i + 1}
              </div>
              <div className="w-10 h-10 bg-primary/10 flex items-center justify-center mb-3">
                <step.icon className="w-5 h-5 text-primary" />
              </div>
              <h5 className="text-sm font-bold text-foreground mb-1">{step.title}</h5>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">{step.description}</p>
              <p className="text-[10px] text-primary/80 font-medium flex items-center gap-1">
                <ArrowRight className="w-3 h-3" />
                {step.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Report Preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="border border-border overflow-hidden shadow-lg"
      >
        <div className="bg-card border-b border-border px-4 py-2 flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-destructive/60" />
            <span className="w-3 h-3 rounded-full bg-score-medium/60" />
            <span className="w-3 h-3 rounded-full bg-score-high/60" />
          </div>
          <span className="text-xs text-muted-foreground ml-2">FlowCheck — Two-Column Report</span>
        </div>
        <img src={reportPreviewImg} alt="Two-column functional feedback report" className="w-full" />
      </motion.div>

      {/* Highlights */}
      <div>
        <h4 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          What FlowCheck Detects
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {highlights.map((h, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="flex items-start gap-3 p-4 bg-card border border-border hover:border-primary/20 transition-all"
            >
              <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0">
                <h.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h5 className="text-sm font-semibold text-foreground">{h.label}</h5>
                <p className="text-xs text-muted-foreground mt-0.5">{h.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Testimonials Section ─── */
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
    const fetchApproved = async () => {
      const { data } = await supabase
        .from("feedback_and_testimonials")
        .select("id, user_name, user_country, user_avatar_url, feedback_text, profile_link, rating, created_at")
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(12);

      if (data) setTestimonials(data as Testimonial[]);
      setLoading(false);
    };
    fetchApproved();
  }, []);

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl mx-auto"
      >
        <h3 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3">
          Trusted by{" "}
          <span className="text-gradient-primary">Real Product Teams</span>
        </h3>
        <p className="text-muted-foreground">
          See what designers, founders, and product managers are saying about UX Audit Pro.
        </p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-pulse text-muted-foreground text-sm">Loading testimonials...</div>
        </div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No testimonials yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border p-4 flex flex-col hover:border-primary/20 transition-all"
            >
              <StarRating rating={t.rating || 5} readonly size="sm" />
              <p className="text-xs text-foreground leading-relaxed flex-1 my-3">"{t.feedback_text}"</p>
              <div className="flex items-center gap-3 mt-auto pt-3 border-t border-border">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={getAvatarUrl(t.user_name, t.user_avatar_url)} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(t.user_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{t.user_name}</p>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Globe className="w-2.5 h-2.5" />
                    {t.user_country}
                  </div>
                </div>
              </div>
              {t.profile_link && <LinkThumbnail url={t.profile_link} compact />}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Contact Section ─── */
function ContactContent() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl mx-auto"
      >
        <h3 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3">
          Let's{" "}
          <span className="text-gradient-primary">Connect</span>
        </h3>
        <p className="text-muted-foreground">
          Have questions, feature requests, or want to collaborate? We'd love to hear from you.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-md mx-auto bg-card border border-border p-8 text-center"
      >
        <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
        <h4 className="text-lg font-bold text-foreground mb-2">Email Us</h4>
        <p className="text-sm text-muted-foreground mb-6">We typically respond within 24 hours.</p>
        <a
          href="mailto:hello@uxpro.dev"
          className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all"
        >
          <Mail className="w-4 h-4" />
          hello@uxpro.dev
        </a>
      </motion.div>
    </div>
  );
}

/* ─── Why Free Section ─── */
function WhyFreeContent() {
  const reasons = [
    {
      icon: Users,
      title: "Community Driven",
      desc: "Your feedback helps us improve the AI engine for everyone. Every audit makes the system smarter.",
    },
    {
      icon: Shield,
      title: "Open Approach",
      desc: "We're building in public and value transparency over profit. Quality feedback tools should be accessible.",
    },
    {
      icon: Zap,
      title: "Premium Coming Soon",
      desc: "Advanced features like team reports, API access, and custom scoring will be available as paid options.",
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl mx-auto"
      >
        <h3 className="text-2xl md:text-3xl font-extrabold text-foreground mb-3">
          Professional Tools,{" "}
          <span className="text-gradient-primary">Zero Cost</span>
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          We believe every designer, product manager, and startup founder deserves access to
          professional-grade functional feedback — regardless of budget.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
        {reasons.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="bg-card border border-border p-6 text-center hover:border-primary/20 transition-all"
          >
            <div className="w-12 h-12 bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <r.icon className="w-6 h-6 text-primary" />
            </div>
            <h5 className="text-sm font-bold text-foreground mb-2">{r.title}</h5>
            <p className="text-xs text-muted-foreground leading-relaxed">{r.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
