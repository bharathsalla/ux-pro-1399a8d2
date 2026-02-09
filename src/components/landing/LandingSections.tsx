import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Upload, Sparkles, LayoutDashboard, Target, Shield, HelpCircle, MessageSquare, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Globe, Link2, ExternalLink } from "lucide-react";

const sectionIds = ["how-it-works", "functional-feedback", "testimonials", "contact", "why-free"];

interface SectionNavProps {
  activeSection: string;
}

export function SectionNav({ activeSection }: SectionNavProps) {
  const navItems = [
    { id: "how-it-works", label: "How It Works", icon: LayoutDashboard },
    { id: "functional-feedback", label: "Functional Feedback", icon: Target },
    { id: "testimonials", label: "Testimonials", icon: MessageSquare },
    { id: "contact", label: "Contact Us", icon: Mail },
    { id: "why-free", label: "Why Free", icon: HelpCircle },
  ];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex flex-wrap gap-1.5 justify-center">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => scrollTo(item.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border transition-all ${
            activeSection === item.id
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/30"
          }`}
        >
          <item.icon className="w-3 h-3" />
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function HowItWorksSection() {
  const steps = [
    {
      icon: Upload,
      title: "Upload Your Screen",
      description: "Upload 1–5 product screenshots. Our AI accepts dashboards, forms, listings, admin panels, and more.",
    },
    {
      icon: Sparkles,
      title: "AI Analyzes Functionality",
      description: "Our AI identifies functional gaps, missing features, workflow inefficiencies, and business risks — not visual styling.",
    },
    {
      icon: LayoutDashboard,
      title: "Two-Column Report",
      description: "Left side: your screen with dashed gap annotations. Right side: detailed issue descriptions with severity and industry standards.",
    },
    {
      icon: Target,
      title: "Actionable Recommendations",
      description: "Each gap comes with concrete, implementable solutions including user value and business impact.",
    },
  ];

  return (
    <section id="how-it-works" className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-primary" />
          How It Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border p-5 relative group hover:border-primary/30 transition-all"
            >
              <div className="absolute top-3 right-3 text-3xl font-extrabold text-border/50 group-hover:text-primary/10 transition-colors">
                {i + 1}
              </div>
              <div className="w-10 h-10 bg-primary/10 flex items-center justify-center mb-3">
                <step.icon className="w-5 h-5 text-primary" />
              </div>
              <h4 className="text-sm font-bold text-foreground mb-1.5">{step.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export function FunctionalFeedbackSection() {
  const highlights = [
    { label: "Missing Features", desc: "Identify actions users expect but can't perform." },
    { label: "Workflow Gaps", desc: "Catch manual steps that should be automated." },
    { label: "Business Impact", desc: "Every gap is tied to user problems and business risks." },
    { label: "Enterprise Ready", desc: "Scalability, compliance, and role-based checks." },
  ];

  return (
    <section id="functional-feedback" className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Functional Feedback
          <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary border border-primary/20 font-semibold uppercase tracking-wider">
            AI
          </span>
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-xl">
          Not UI critique. Deep product strategy analysis — missing features, workflow gaps, enterprise readiness & business value mapped to your actual screens.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {highlights.map((h, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-3 p-4 bg-card border border-border hover:border-primary/20 transition-all"
            >
              <span className="w-6 h-6 bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {i + 1}
              </span>
              <div>
                <h5 className="text-sm font-semibold text-foreground">{h.label}</h5>
                <p className="text-xs text-muted-foreground mt-0.5">{h.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Two-column preview illustration */}
        <div className="bg-surface-2 border border-border p-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-3">
            Report Preview
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-1/2 bg-card border border-border p-4 min-h-[120px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-full max-w-[200px] mx-auto border-2 border-dashed border-primary/30 p-6">
                  <p className="text-xs text-muted-foreground">Your screen with</p>
                  <p className="text-sm font-bold text-primary">dashed gap annotations</p>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 space-y-2">
              {["Critical", "Major", "Minor"].map((sev, i) => (
                <div key={sev} className="bg-card border border-border p-3 flex items-center gap-2">
                  <span className={`w-5 h-5 flex items-center justify-center text-[10px] font-bold text-primary-foreground ${
                    i === 0 ? "bg-destructive" : i === 1 ? "bg-score-medium" : "bg-primary"
                  }`}>
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-xs font-medium text-foreground">{sev} gap identified</p>
                    <p className="text-[10px] text-muted-foreground">Impact + industry standard + fix</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

interface Testimonial {
  id: string;
  user_name: string;
  user_country: string;
  user_avatar_url: string | null;
  feedback_text: string;
  profile_link: string;
  created_at: string;
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApproved = async () => {
      const { data } = await supabase
        .from("feedback_and_testimonials")
        .select("id, user_name, user_country, user_avatar_url, feedback_text, profile_link, created_at")
        .eq("is_approved", true)
        .order("created_at", { ascending: false })
        .limit(6);
      
      if (data) setTestimonials(data as Testimonial[]);
      setLoading(false);
    };
    fetchApproved();
  }, []);

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const getDomainFromUrl = (url: string): string => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  return (
    <section id="testimonials" className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Testimonials
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-muted-foreground text-sm">Loading testimonials...</div>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border">
            <MessageSquare className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No approved testimonials yet. Be the first!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border p-4 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={t.user_avatar_url || ""} />
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
                <p className="text-xs text-foreground leading-relaxed flex-1 mb-3">"{t.feedback_text}"</p>
                {t.profile_link && (
                  <a
                    href={t.profile_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[10px] text-primary hover:underline"
                  >
                    <Link2 className="w-3 h-3" />
                    {getDomainFromUrl(t.profile_link)}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}

export function ContactSection() {
  return (
    <section id="contact" className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-card border border-border p-8 text-center"
      >
        <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
        <h3 className="text-xl font-bold text-foreground mb-2">Contact Us</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
          Have questions, feature requests, or want to collaborate? Reach out to us.
        </p>
        <a
          href="mailto:hello@uxpro.dev"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all"
        >
          <Mail className="w-4 h-4" />
          hello@uxpro.dev
        </a>
      </motion.div>
    </section>
  );
}

export function WhyFreeSection() {
  return (
    <section id="why-free" className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          Why Is It Free?
        </h3>
        <div className="bg-card border border-border p-6 space-y-4">
          <p className="text-sm text-foreground leading-relaxed">
            We believe every designer, product manager, and startup founder deserves access to professional-grade functional feedback — regardless of budget.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { title: "Community Driven", desc: "Your feedback helps us improve the AI engine for everyone." },
              { title: "Open Approach", desc: "We're building in public and value transparency over profit." },
              { title: "Premium Coming Soon", desc: "Advanced features like team reports and API access will be paid." },
            ].map((item, i) => (
              <div key={i} className="p-3 bg-surface-2 border border-border">
                <h5 className="text-xs font-bold text-foreground mb-1">{item.title}</h5>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
