import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { FixUxLogo } from "@/components/FixUxLogo";
import contactAvatarImg from "@/assets/contact-avatar.png";

export default function ContactPage() {
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
            Get in Touch
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }} className="text-4xl md:text-[3.2rem] font-extrabold text-foreground leading-[1.08] mb-10">
            Contact Us
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="flex flex-col md:flex-row gap-8 items-center mb-14"
          >
            <div className="w-56 h-56 md:w-64 md:h-64 shrink-0 border-2 border-dashed border-primary/30 overflow-hidden">
              <img src={contactAvatarImg} alt="Contact us" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 space-y-4">
              <p className="text-[1.15rem] text-muted-foreground leading-[1.7]">
                Have questions, feature requests, or want to collaborate? We'd love to hear from you.
              </p>
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
            </div>
          </motion.div>
        </article>
      </main>
    </div>
  );
}
