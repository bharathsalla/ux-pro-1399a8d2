import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { FixUxLogo } from "@/components/FixUxLogo";
import AboutFixUxContent from "@/components/landing/AboutFixUxContent";

export default function AboutPage() {
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
        <AboutFixUxContent />
      </main>
    </div>
  );
}
