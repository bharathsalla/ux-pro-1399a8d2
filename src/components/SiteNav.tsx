import { useNavigate } from "react-router-dom";
import { FixUxLogo } from "@/components/FixUxLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import HeaderProfile from "@/components/auth/HeaderProfile";

const navItems = [
  { path: "/flowcheck", label: "FlowCheck" },
  { path: "/testimonials", label: "Testimonials" },
  { path: "/about", label: "About" },
  { path: "/contact", label: "Contact" },
  { path: "/why-it-is-free", label: "Why Free" },
];

interface SiteNavProps {
  onLogoClick?: () => void;
  announcementText?: string;
  rightSlot?: React.ReactNode;
}

export default function SiteNav({
  onLogoClick,
  announcementText = "Free AI-powered UX audits & transcript-to-UI generation · No credit card required",
  rightSlot,
}: SiteNavProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* Row 1: Dark announcement banner */}
      <div className="bg-foreground border-b border-muted-foreground/20">
        <div className="max-w-[1400px] mx-auto px-6 py-2 flex items-center justify-center">
          <p className="text-[11px] text-background/80 tracking-wide font-medium">
            {announcementText}
          </p>
        </div>
      </div>

      {/* Row 2: Main navigation */}
      <header className="sticky top-0 z-40 bg-background/95 border-b border-border" style={{ backdropFilter: "blur(12px)" }}>
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center">
          {/* Logo */}
          <button
            onClick={onLogoClick || (() => navigate("/"))}
            className="flex items-center mr-8 shrink-0"
          >
            <FixUxLogo size="sm" />
          </button>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="px-3.5 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors relative group tracking-wide uppercase"
              >
                {item.label}
                <span className="absolute bottom-0 left-3.5 right-3.5 h-[1.5px] bg-foreground scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-3">
            {rightSlot}
            <ThemeToggle />
            <HeaderProfile />
          </div>
        </div>
      </header>
    </>
  );
}
