import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  type PersonaId,
  type AuditConfig,
  type AuditStep,
  type AuditResult,
  type FigmaFrame,
  type ScreenAuditResult,
} from "@/types/audit";
import PersonaSelect from "@/components/PersonaSelect";
import AuditConfigScreen from "@/components/AuditConfigScreen";
import AuditRunning from "@/components/AuditRunning";
import ImageAuditResults from "@/components/ImageAuditResults";
import MultiScreenResults from "@/components/MultiScreenResults";
import HeaderProfile from "@/components/auth/HeaderProfile";
import CountryModal from "@/components/auth/CountryModal";
import FeedbackWidget from "@/components/feedback/FeedbackWidget";
import CommentsWidget from "@/components/feedback/CommentsWidget";
import AdminPasscodeModal from "@/components/admin/AdminPasscodeModal";
import { useAuditDesign } from "@/hooks/useAuditDesign";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAdminContext } from "@/contexts/AdminContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MessageCircle, ShieldCheck } from "lucide-react";

interface UploadedImage {
  base64: string;
  previewUrl: string;
  file: File;
}

const Index = () => {
  const { profile, user, loading: authLoading } = useAuthContext();
  const { isAdmin } = useAdminContext();
  const [step, setStep] = useState<AuditStep>('persona');
  const [selectedPersona, setSelectedPersona] = useState<PersonaId | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  // Multi-screen state
  const [isMultiScreen, setIsMultiScreen] = useState(false);
  const [figmaFrames, setFigmaFrames] = useState<FigmaFrame[]>([]);
  const [screenResults, setScreenResults] = useState<ScreenAuditResult[]>([]);
  const [completedScreens, setCompletedScreens] = useState(0);

  // Engagement gate state
  const [showCommentsGate, setShowCommentsGate] = useState(false);
  
  // Admin modal state
  const [showAdminModal, setShowAdminModal] = useState(false);

  const { runAudit, runMultiScreenAudit } = useAuditDesign();

  // Determine engagement gates
  const needsCountry = !!profile && !profile.country;
  const needsFeedback = !!profile && profile.login_count > 1 && !profile.has_submitted_feedback;
  const needsComment = !!profile && profile.has_submitted_feedback && !profile.has_commented && profile.login_count > 1;

  // Show the right gate
  const shouldShowFeedbackWidget = needsFeedback && !showCommentsGate;
  const shouldShowCommentsGate = needsComment || showCommentsGate;

  const handlePersonaSelect = useCallback((id: PersonaId) => {
    setSelectedPersona(id);
    setStep('config');
  }, []);

  const handleConfigStart = useCallback(async (cfg: AuditConfig, base64: string, previewUrl: string) => {
    if (!selectedPersona) return;
    setIsMultiScreen(false);
    setImagePreviewUrl(previewUrl);
    setImageBase64(base64);
    setStep('running');

    const result = await runAudit(base64, selectedPersona, cfg);

    if (result) {
      setAuditResult(result);
      setStep('results');
    } else {
      toast.error("Audit failed. Please try again.");
      setStep('config');
    }
  }, [selectedPersona, runAudit]);

  const handleMultiImageStart = useCallback(async (cfg: AuditConfig, images: UploadedImage[]) => {
    if (!selectedPersona) return;
    setIsMultiScreen(true);

    const frames: FigmaFrame[] = images.map((img, idx) => ({
      id: `upload-${idx}`,
      name: `Image ${idx + 1}`,
      nodeId: `upload-${idx}`,
      imageUrl: img.previewUrl,
    }));
    setFigmaFrames(frames);

    const initialResults: ScreenAuditResult[] = images.map((img, idx) => ({
      screenName: `Image ${idx + 1}`,
      screenImageUrl: img.previewUrl,
      result: null,
      isLoading: true,
    }));
    setScreenResults(initialResults);
    setCompletedScreens(0);
    setStep('results');

    for (let i = 0; i < images.length; i++) {
      try {
        const result = await runAudit(images[i].base64, selectedPersona, cfg);
        setScreenResults((prev) => {
          const next = [...prev];
          next[i] = {
            screenName: `Image ${i + 1}`,
            screenImageUrl: images[i].previewUrl,
            result: result,
            isLoading: false,
            error: result ? null : "Audit failed",
          };
          return next;
        });
      } catch (e) {
        setScreenResults((prev) => {
          const next = [...prev];
          next[i] = {
            screenName: `Image ${i + 1}`,
            screenImageUrl: images[i].previewUrl,
            result: null,
            isLoading: false,
            error: e instanceof Error ? e.message : "Failed",
          };
          return next;
        });
      }
      setCompletedScreens((prev) => prev + 1);
    }
  }, [selectedPersona, runAudit]);

  const handleFigmaStart = useCallback(async (cfg: AuditConfig, frames: FigmaFrame[]) => {
    if (!selectedPersona) return;
    setIsMultiScreen(true);
    setFigmaFrames(frames);

    const initialResults: ScreenAuditResult[] = frames.map((f) => ({
      screenName: f.name,
      screenImageUrl: f.imageUrl,
      result: null,
      isLoading: true,
    }));
    setScreenResults(initialResults);
    setCompletedScreens(0);
    setStep('results');

    await runMultiScreenAudit(frames, selectedPersona, cfg, (index, screenResult) => {
      setScreenResults((prev) => {
        const next = [...prev];
        next[index] = { ...screenResult, isLoading: false };
        return next;
      });
      setCompletedScreens((prev) => prev + 1);
    });
  }, [selectedPersona, runMultiScreenAudit]);

  const handleRestart = useCallback(() => {
    setStep('persona');
    setSelectedPersona(null);
    setImagePreviewUrl(null);
    setImageBase64(null);
    setAuditResult(null);
    setIsMultiScreen(false);
    setFigmaFrames([]);
    setScreenResults([]);
    setCompletedScreens(0);
  }, []);

  const handleBack = useCallback(() => {
    setStep('persona');
    setSelectedPersona(null);
  }, []);

  // Show comments gate after feedback submission
  const handleFeedbackComplete = () => {
    setShowCommentsGate(true);
  };

  const handleCommentComplete = () => {
    setShowCommentsGate(false);
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Country modal for social auth users
  if (needsCountry) {
    return (
      <div className="min-h-screen bg-background">
        <CountryModal open={true} />
      </div>
    );
  }

  // Feedback widget gate (second login)
  if (shouldShowFeedbackWidget) {
    return <FeedbackWidget onComplete={handleFeedbackComplete} />;
  }

  // Comments gate
  if (shouldShowCommentsGate) {
    return (
      <div className="min-h-screen bg-background">
        <HeaderProfile />
        <div className="max-w-3xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2 text-foreground">Join the conversation 💬</h2>
            <p className="text-muted-foreground">
              Comment on at least one feedback below to continue using the app.
            </p>
          </motion.div>
          <CommentsWidget requireComment onCommentComplete={handleCommentComplete} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HeaderProfile />

      {/* Admin modal */}
      <AdminPasscodeModal
        open={showAdminModal}
        onOpenChange={setShowAdminModal}
        onSuccess={() => {}}
      />

      {/* Admin access button */}
      {user && (
        <div className="fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdminModal(true)}
            className="gap-1"
          >
            <ShieldCheck className="h-4 w-4" />
            Admin
          </Button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 'persona' && (
          <PersonaSelect key="persona" onSelect={handlePersonaSelect} />
        )}
        {step === 'config' && selectedPersona && (
          <AuditConfigScreen
            key="config"
            personaId={selectedPersona}
            onStart={handleConfigStart}
            onStartMultiImage={handleMultiImageStart}
            onStartFigma={handleFigmaStart}
            onBack={handleBack}
          />
        )}
        {step === 'running' && selectedPersona && (
          <AuditRunning
            key="running"
            personaId={selectedPersona}
            onComplete={() => {}}
          />
        )}
        {step === 'results' && selectedPersona && !isMultiScreen && auditResult && imagePreviewUrl && (
          <ImageAuditResults
            key="results-single"
            personaId={selectedPersona}
            result={auditResult}
            imageUrl={imagePreviewUrl}
            imageBase64={imageBase64 || undefined}
            onRestart={handleRestart}
          />
        )}
        {step === 'results' && selectedPersona && isMultiScreen && (
          <MultiScreenResults
            key="results-multi"
            personaId={selectedPersona}
            screens={screenResults}
            totalScreens={figmaFrames.length}
            completedScreens={completedScreens}
            onRestart={handleRestart}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
