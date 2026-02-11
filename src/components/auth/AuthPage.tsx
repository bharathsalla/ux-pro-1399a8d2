import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ManualRegisterForm from "./ManualRegisterForm";
import LoginForm from "./LoginForm";
import SocialAuthButtons from "./SocialAuthButtons";
import AdminPasscodeModal from "@/components/admin/AdminPasscodeModal";
import { FixUxLogo } from "@/components/FixUxLogo";
import { ShieldCheck, User, CheckCircle2, ArrowRight, Sparkles, Zap, Shield } from "lucide-react";
import loginIllustration from "@/assets/login-illustration.png";

const features = [
  { icon: Zap, text: "AI-powered UX audits in seconds" },
  { icon: Shield, text: "60+ design principles analyzed" },
  { icon: Sparkles, text: "Transcript-to-UI generation" },
  { icon: CheckCircle2, text: "Actionable fix suggestions" },
];

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [mode, setMode] = useState<"user" | "admin">("user");
  const [showAdminPasscode, setShowAdminPasscode] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Admin Passcode Modal */}
      <AdminPasscodeModal
        open={showAdminPasscode}
        onOpenChange={(open) => {
          setShowAdminPasscode(open);
          if (!open) setMode("user");
        }}
        onSuccess={() => {}}
      />

      {/* ═══ Left Branding Panel ═══ */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative overflow-hidden bg-primary">
        {/* Star/cross pattern — white on green */}
        <div
          className="absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16">
          {/* Top: Logo */}
          <div>
            <div className="mb-16">
              <FixUxLogo size="sm" />
            </div>

            {/* Illustration above text */}
            <img
              src={loginIllustration}
              alt="FixUx character"
              className="w-56 xl:w-64 h-auto object-contain mb-10"
            />

            {/* Headline */}
            <h1 className="text-3xl xl:text-4xl font-extrabold text-primary-foreground leading-[1.15] tracking-tight mb-6">
              Build better
              <br />
              interfaces, faster.
            </h1>
            <p className="text-primary-foreground/70 text-sm leading-relaxed max-w-sm mb-10">
              Join thousands of designers and developers using AI to ship polished, user-tested products.
            </p>

            {/* Feature list */}
            <div className="space-y-3.5">
              {features.map((f, i) => (
                <motion.div
                  key={f.text}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-7 h-7 rounded-md bg-primary-foreground/10 border border-primary-foreground/20 flex items-center justify-center shrink-0">
                    <f.icon className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                  <span className="text-sm text-primary-foreground/90 font-medium">{f.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <p className="text-[10px] text-primary-foreground/50 uppercase tracking-[0.2em] font-medium mt-10">
            Free to use · No credit card
          </p>
        </div>
      </div>

      {/* ═══ Right Auth Panel ═══ */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 sm:px-10 py-5 border-b border-border">
          <div className="lg:hidden">
            <FixUxLogo size="sm" />
          </div>
          <div className="hidden lg:block" />

          {/* User/Admin toggle */}
          <div className="flex border border-border overflow-hidden">
            <button
              onClick={() => setMode("user")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-wide transition-colors ${
                mode === "user"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <User className="h-3 w-3" /> User
            </button>
            <button
              onClick={() => {
                setMode("admin");
                setShowAdminPasscode(true);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-wide transition-colors ${
                mode === "admin"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <ShieldCheck className="h-3 w-3" /> Admin
            </button>
          </div>
        </div>

        {/* Auth form area */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-10">
          {mode === "user" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-[420px]"
            >
              {/* Header */}
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-extrabold text-foreground tracking-tight mb-1.5">
                  {activeTab === "login" ? "Welcome back" : "Create account"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {activeTab === "login"
                    ? "Sign in to continue to FixUx"
                    : "Get started with your free account"}
                </p>
              </div>

              {/* Auth card with premium glassmorphism */}
              <motion.div
                whileHover={{ rotateX: -1, rotateY: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                style={{ transformStyle: "preserve-3d" }}
                className="relative rounded-2xl border border-border/50 p-6 sm:p-7 overflow-hidden"
              >
                {/* Card background layers */}
                <div className="absolute inset-0 bg-card/80 backdrop-blur-xl" />
                <div
                  className="absolute inset-0 opacity-60"
                  style={{
                    background: `radial-gradient(ellipse 100% 80% at 0% 0%, hsl(var(--primary) / 0.06) 0%, transparent 50%),
                      radial-gradient(ellipse 80% 60% at 100% 100%, hsl(var(--primary) / 0.04) 0%, transparent 50%)`,
                  }}
                />
                {/* Shimmer border top */}
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{
                    background: `linear-gradient(90deg, transparent, hsl(var(--primary) / 0.3), transparent)`,
                  }}
                />

                <div className="relative z-10 space-y-5">
                  {/* Social first */}
                  <SocialAuthButtons />

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/60" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-[0.15em]">
                      <span className="bg-card/80 px-3 text-muted-foreground font-medium backdrop-blur-sm">
                        or continue with email
                      </span>
                    </div>
                  </div>

                  {/* Tabs */}
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-5 h-9">
                      <TabsTrigger value="login" className="text-xs font-semibold uppercase tracking-wide">
                        Sign In
                      </TabsTrigger>
                      <TabsTrigger value="register" className="text-xs font-semibold uppercase tracking-wide">
                        Register
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                      <LoginForm />
                    </TabsContent>

                    <TabsContent value="register">
                      <ManualRegisterForm onSuccess={() => setActiveTab("login")} />
                    </TabsContent>
                  </Tabs>
                </div>
              </motion.div>

              {/* Trust badges */}
              <div className="mt-6 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" /> SSL Encrypted
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Free Forever
                </span>
              </div>

              {/* Footer text */}
              <p className="mt-4 text-center text-[11px] text-muted-foreground leading-relaxed">
                By continuing, you agree to our Terms of Service
                <br />
                and Privacy Policy.
              </p>
            </motion.div>
          )}

          {mode === "admin" && !showAdminPasscode && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-5 bg-primary/10 border border-primary/20 flex items-center justify-center">
                <ShieldCheck className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-extrabold text-foreground mb-2">Admin Access</h2>
              <p className="text-muted-foreground text-sm mb-6">Enter the admin passcode to continue.</p>
              <button
                onClick={() => setShowAdminPasscode(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                Enter Passcode <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="px-6 sm:px-10 py-4 border-t border-border">
          <p className="text-[10px] text-muted-foreground text-center tracking-wide">
            © 2025 FixUx · AI-powered design tools
          </p>
        </div>
      </div>
    </div>
  );
}
