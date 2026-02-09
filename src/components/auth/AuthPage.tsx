import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ManualRegisterForm from "./ManualRegisterForm";
import LoginForm from "./LoginForm";
import SocialAuthButtons from "./SocialAuthButtons";
import AdminPasscodeModal from "@/components/admin/AdminPasscodeModal";
import { FixUxLogo } from "@/components/FixUxLogo";
import { ShieldCheck, User } from "lucide-react";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [mode, setMode] = useState<"user" | "admin">("user");
  const [showAdminPasscode, setShowAdminPasscode] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      {/* User / Admin mode selector — top-right */}
      <div className="fixed top-4 right-4 z-50 flex rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <button
          onClick={() => setMode("user")}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
            mode === "user"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <User className="h-4 w-4" />
          User
        </button>
        <button
          onClick={() => {
            setMode("admin");
            setShowAdminPasscode(true);
          }}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
            mode === "admin"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          Admin
        </button>
      </div>

      {/* Admin Passcode Modal */}
      <AdminPasscodeModal
        open={showAdminPasscode}
        onOpenChange={(open) => {
          setShowAdminPasscode(open);
          if (!open) setMode("user");
        }}
        onSuccess={() => {}}
      />

      {/* User auth flow */}
      {mode === "user" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8 flex flex-col items-center gap-2">
            <FixUxLogo size="lg" />
            <p className="text-muted-foreground">
              AI-powered UX audit for your designs
            </p>
          </div>

          <Card className="border border-border shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-center">Welcome</CardTitle>
              <CardDescription className="text-center">
                Sign in or create an account to continue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <p className="text-sm font-medium text-muted-foreground text-center">
                    If you registered manually, sign in with your credentials
                  </p>
                  <LoginForm />
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">or</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground text-center">
                    Continue with your social account
                  </p>
                  <SocialAuthButtons />
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <ManualRegisterForm onSuccess={() => setActiveTab("login")} />
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">or register with</span>
                    </div>
                  </div>
                  <SocialAuthButtons />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Admin mode — show prompt to enter passcode */}
      {mode === "admin" && !showAdminPasscode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <ShieldCheck className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Admin Access</h2>
          <p className="text-muted-foreground mb-6">Enter the admin passcode to continue.</p>
          <button
            onClick={() => setShowAdminPasscode(true)}
            className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Enter Passcode
          </button>
        </motion.div>
      )}
    </div>
  );
}
