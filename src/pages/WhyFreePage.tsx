import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { FixUxLogo } from "@/components/FixUxLogo";
import whyFreeAvatarImg from "@/assets/why-free-avatar.png";

export default function WhyFreePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-[680px] mx-auto px-6 py-4 flex items-center justify-between">
          <FixUxLogo size="sm" />
          <button
            onClick={() => navigate(-1)}
            className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>
      </header>

      <main className="max-w-[680px] mx-auto px-6 py-16 md:py-24">
        <article>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] tracking-[0.2em] uppercase text-primary font-medium mb-5">
            Our Mission
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }} className="text-4xl md:text-[3.2rem] font-extrabold text-foreground leading-[1.08] mb-10">
            Why It Is Free
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="flex flex-col md:flex-row gap-8 items-center mb-14"
          >
            <div className="w-56 h-56 md:w-64 md:h-64 shrink-0 border-2 border-dashed border-primary/30 overflow-hidden">
              <img src={whyFreeAvatarImg} alt="Why it is free" className="w-full h-full object-cover" />
            </div>
            <p className="flex-1 text-[1.15rem] text-muted-foreground leading-[1.7]">
              We believe every designer, product manager, and startup founder
              deserves access to professional-grade functional feedback —
              regardless of budget.
            </p>
          </motion.div>

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
                body: "We're building in public and value transparency over profit. Our roadmap, improvements, and learnings are shared openly with the community.",
              },
              {
                title: "Premium Coming Soon",
                body: "Advanced features like team reports, API access, and priority processing will be available as paid tiers. Free access to core audits will always remain.",
              },
            ].map((item) => (
              <div key={item.title}>
                <h2 className="text-lg font-bold text-foreground mb-2">{item.title}</h2>
                <p className="text-[14px] text-muted-foreground leading-[1.7]">{item.body}</p>
              </div>
            ))}
          </motion.div>
        </article>
      </main>
    </div>
  );
}
