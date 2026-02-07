import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { type PersonaId, type AuditConfig, type AuditStep, type AuditResult } from "@/types/audit";
import PersonaSelect from "@/components/PersonaSelect";
import AuditConfigScreen from "@/components/AuditConfigScreen";
import AuditRunning from "@/components/AuditRunning";
import ImageAuditResults from "@/components/ImageAuditResults";
import { useAuditDesign } from "@/hooks/useAuditDesign";
import { toast } from "sonner";

const Index = () => {
  const [step, setStep] = useState<AuditStep>('persona');
  const [selectedPersona, setSelectedPersona] = useState<PersonaId | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const { runAudit } = useAuditDesign();

  const handlePersonaSelect = useCallback((id: PersonaId) => {
    setSelectedPersona(id);
    setStep('config');
  }, []);

  const handleConfigStart = useCallback(async (cfg: AuditConfig, imageBase64: string, previewUrl: string) => {
    if (!selectedPersona) return;
    setImagePreviewUrl(previewUrl);
    setStep('running');

    const result = await runAudit(imageBase64, selectedPersona, cfg);

    if (result) {
      setAuditResult(result);
      setStep('results');
    } else {
      toast.error("Audit failed. Please try again.");
      setStep('config');
    }
  }, [selectedPersona, runAudit]);

  const handleRestart = useCallback(() => {
    setStep('persona');
    setSelectedPersona(null);
    setImagePreviewUrl(null);
    setAuditResult(null);
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
        {step === 'results' && selectedPersona && auditResult && imagePreviewUrl && (
          <ImageAuditResults
            key="results"
            personaId={selectedPersona}
            result={auditResult}
            imageUrl={imagePreviewUrl}
            onRestart={handleRestart}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
