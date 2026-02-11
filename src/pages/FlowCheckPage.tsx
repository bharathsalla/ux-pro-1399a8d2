import { useNavigate } from "react-router-dom";
import { FixUxLogo } from "@/components/FixUxLogo";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import auditFlowImg from "@/assets/platform-audit-flow.jpg";
import reportPreviewImg from "@/assets/platform-report-preview.jpg";

export default function FlowCheckPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background page-parallax">
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
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[11px] tracking-[0.2em] uppercase text-primary font-medium mb-5"
          >
            Functional Feedback
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 }}
            className="text-4xl md:text-[3.2rem] font-extrabold text-foreground leading-[1.08] mb-8"
          >
            FlowCheck
          </motion.h1>

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

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-foreground mb-8">How it works</h2>
            <div className="space-y-10">
              {[
                { num: "01", title: "Upload your screen", body: "Drop a single screenshot or up to five screens for multi-page analysis. The AI accepts any fidelity — wireframes, MVPs, or production designs." },
                { num: "02", title: "AI analyzes functionality", body: "The engine scans for functional gaps, missing actions, workflow inefficiencies, and business risks. It adapts to your product domain automatically." },
                { num: "03", title: "Two-column report", body: "Left column shows your screen with dashed gap annotations. Right column provides severity-tagged issue cards with industry standards and recommended fixes." },
                { num: "04", title: "Actionable recommendations", body: "Each gap includes concrete solutions, user-value impact, and business risk — prioritized as Critical, Major, or Minor." },
              ].map((step) => (
                <div key={step.num} className="flex gap-6">
                  <span className="text-[11px] font-bold text-primary tracking-wide mt-1 shrink-0">{step.num}</span>
                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-1.5">{step.title}</h3>
                    <p className="text-[14px] text-muted-foreground leading-[1.7]">{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

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
      </main>
    </div>
  );
}
