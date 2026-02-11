import { useState, useCallback, useEffect } from "react";
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

import { useAuditDesign } from "@/hooks/useAuditDesign";
import { useAuthContext } from "@/contexts/AuthContext";
import { useAuditLimit } from "@/hooks/useAuditLimit";

import { toast } from "sonner";
import { Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadedImage {
  base64: string;
  previewUrl: string;
  file: File;
}

const Index = () => {
  const { user } = useAuthContext();
  const { showLimitPopup, checkAndIncrement, dismissPopup, remainingToday } = useAuditLimit(user?.id ?? null, "audit");
  
  // Restore step & persona from sessionStorage so Back navigation works
  const [step, setStep] = useState<AuditStep>(() => {
    const saved = sessionStorage.getItem('fixux_step');
    return (saved === 'config' ? 'config' : 'persona') as AuditStep;
  });
  const [selectedPersona, setSelectedPersona] = useState<PersonaId | null>(() => {
    return (sessionStorage.getItem('fixux_persona') as PersonaId) || null;
  });
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);

  // Multi-screen state
  const [isMultiScreen, setIsMultiScreen] = useState(false);
  const [figmaFrames, setFigmaFrames] = useState<FigmaFrame[]>([]);
  const [screenResults, setScreenResults] = useState<ScreenAuditResult[]>([]);
  const [completedScreens, setCompletedScreens] = useState(0);

  const { runAudit, runMultiScreenAudit } = useAuditDesign();


  // Persist step & persona to sessionStorage
  useEffect(() => {
    if (step === 'config' && selectedPersona) {
      sessionStorage.setItem('fixux_step', 'config');
      sessionStorage.setItem('fixux_persona', selectedPersona);
    } else if (step === 'persona') {
      sessionStorage.removeItem('fixux_step');
      sessionStorage.removeItem('fixux_persona');
    }
  }, [step, selectedPersona]);

  const handlePersonaSelect = useCallback((id: PersonaId) => {
    setSelectedPersona(id);
    setStep('config');
  }, []);

  const handleConfigStart = useCallback(async (cfg: AuditConfig, base64: string, previewUrl: string) => {
    if (!selectedPersona) return;
    // Check daily limit before running audit
    if (user) {
      const allowed = checkAndIncrement();
      if (!allowed) return;
    }
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
  }, [selectedPersona, runAudit, user, checkAndIncrement]);

  const handleMultiImageStart = useCallback(async (cfg: AuditConfig, images: UploadedImage[]) => {
    if (!selectedPersona) return;
    // Check daily limit before running audit
    if (user) {
      const allowed = checkAndIncrement();
      if (!allowed) return;
    }
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
  }, [selectedPersona, runAudit, user, checkAndIncrement]);

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
    sessionStorage.removeItem('fixux_step');
    sessionStorage.removeItem('fixux_persona');
  }, []);

  const handleBack = useCallback(() => {
    setStep('persona');
    setSelectedPersona(null);
  }, []);

  return (
    <div className="min-h-screen bg-background">


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

      {/* Daily Limit Popup */}
      <AnimatePresence>
        {showLimitPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={dismissPopup}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-background border border-border rounded-lg p-8 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-5">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Daily Limit Reached</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-2">
                You've used your <strong className="text-foreground">2 free audits</strong> for today.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                We appreciate your enthusiasm! Your audit quota will reset tomorrow. Come back then to continue improving your designs.
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-6 p-3 bg-muted/50 rounded-md">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Each day you get <strong className="text-foreground">2 audits</strong> to review your designs</span>
              </div>
              <Button onClick={dismissPopup} className="w-full" size="lg">
                Got it, I'll come back tomorrow
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
