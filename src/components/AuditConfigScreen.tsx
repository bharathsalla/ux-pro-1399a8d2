import { useState } from "react";
import { motion } from "framer-motion";
import { type PersonaId, type AuditConfig, personas } from "@/types/audit";
import ImageUpload from "./ImageUpload";
import SiteNav from "@/components/SiteNav";

interface UploadedImage {
  base64: string;
  previewUrl: string;
  file: File;
}

interface AuditConfigScreenProps {
  personaId: PersonaId;
  onStart: (config: AuditConfig, imageBase64: string, imagePreviewUrl: string) => void;
  onStartMultiImage?: (config: AuditConfig, images: UploadedImage[]) => void;
  onBack: () => void;
}

const fidelityOptions = [
  { value: "wireframe" as const, label: "Wireframe", desc: "Low-fidelity sketch" },
  { value: "mvp" as const, label: "MVP", desc: "Functional prototype" },
  { value: "high-fidelity" as const, label: "High-Fidelity", desc: "Production-ready" },
];

const purposeOptions: Record<PersonaId, { value: AuditConfig["purpose"]; label: string }[]> = {
  solo: [
    { value: "pre-handoff", label: "Pre-Handoff Check" },
    { value: "portfolio", label: "Portfolio Polish" },
    { value: "review", label: "Self Review" },
  ],
  lead: [
    { value: "review", label: "Team Review" },
    { value: "pre-handoff", label: "Pre-Handoff Gate" },
    { value: "stakeholder", label: "Quality Report" },
  ],
  a11y: [
    { value: "review", label: "Compliance Check" },
    { value: "pre-handoff", label: "Pre-Launch Audit" },
    { value: "stakeholder", label: "Accessibility Report" },
  ],
  founder: [
    { value: "stakeholder", label: "Stakeholder Review" },
    { value: "pre-handoff", label: "Dev Readiness" },
    { value: "review", label: "Quick Check" },
  ],
  consultant: [
    { value: "stakeholder", label: "Client Report" },
    { value: "review", label: "Heuristic Evaluation" },
    { value: "pre-handoff", label: "Formal Audit" },
  ],
};

type ExtInputMode = "single" | "multi";




const AuditConfigScreen = ({ personaId, onStart, onStartMultiImage, onBack }: AuditConfigScreenProps) => {
  const persona = personas.find((p) => p.id === personaId)!;
  
  const [inputMode, setInputMode] = useState<ExtInputMode>("single");
  const [fidelity, setFidelity] = useState<AuditConfig["fidelity"]>("high-fidelity");
  const [purpose, setPurpose] = useState<AuditConfig["purpose"]>(purposeOptions[personaId][0].value);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const handleImageSelect = (base64: string, previewUrl: string) => {
    setImageBase64(base64);
    setImagePreviewUrl(previewUrl);
  };

  const canStartSingle = inputMode === "single" && !!imageBase64;
  const canStartMulti = inputMode === "multi" && uploadedImages.length > 0;
  const canStart = canStartSingle || canStartMulti;

  const handleStart = () => {
    const config: AuditConfig = {
      fidelity,
      purpose,
      frameCount: inputMode === "multi" ? uploadedImages.length : 1,
    };

    if (canStartSingle && imagePreviewUrl) {
      onStart(config, imageBase64!, imagePreviewUrl);
    } else if (canStartMulti && onStartMultiImage) {
      onStartMultiImage(config, uploadedImages);
    }
  };

  const getButtonLabel = () => {
    if (!canStart) {
      if (inputMode === "multi") return "Upload images to start";
      return "Upload a design to start";
    }
    if (inputMode === "multi")
      return `Audit ${uploadedImages.length} Image${uploadedImages.length > 1 ? "s" : ""} →`;
    return "Run AI Audit →";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="min-h-screen bg-background"
    >
      {/* ═══ Dual Navigation ═══ */}
      <SiteNav />

      {/* ═══ Main Content ═══ */}
      <div
        className="flex flex-col items-center justify-center px-6 py-12"
        style={{ minHeight: "calc(100vh - 96px)" }}
      >
        <div className="max-w-lg w-full">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">{persona.icon}</span>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{persona.title} Mode</h2>
              <p className="text-sm text-muted-foreground">{persona.subtitle}</p>
            </div>
          </div>

          {/* Input Mode Toggle */}
          <div className="mb-6">
            <div className="flex border border-border bg-card p-1 gap-1">
              <button
                onClick={() => setInputMode("single")}
                className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                  inputMode === "single"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                📸 Single
              </button>
              <button
                onClick={() => setInputMode("multi")}
                className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                  inputMode === "multi"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                🖼️ Multi (5)
              </button>
            </div>
          </div>

          {/* Input Area */}
          <div className="mb-8">
            {inputMode === "single" ? (
              <ImageUpload onImageSelect={handleImageSelect} previewUrl={imagePreviewUrl} />
            ) : (
              <ImageUpload
                onImageSelect={() => {}}
                onMultiImageSelect={setUploadedImages}
                previewUrl={null}
                multiMode={true}
                uploadedImages={uploadedImages}
              />
            )}
          </div>

          {/* Fidelity */}
          <div className="mb-8">
            <label className="text-sm font-semibold text-foreground mb-3 block">Design Fidelity</label>
            <div className="grid grid-cols-3 gap-3">
              {fidelityOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFidelity(opt.value)}
                  className={`p-3 border text-left transition-all ${
                    fidelity === opt.value
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-muted-foreground"
                  }`}
                >
                  <div className="text-sm font-medium">{opt.label}</div>
                  <div className="text-xs opacity-70 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Purpose */}
          <div className="mb-8">
            <label className="text-sm font-semibold text-foreground mb-3 block">Audit Purpose</label>
            <div className="flex flex-wrap gap-2">
              {purposeOptions[personaId].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPurpose(opt.value)}
                  className={`px-4 py-2 text-sm border transition-all ${
                    purpose === opt.value
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-muted-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Start */}
          <motion.button
            whileHover={canStart ? { scale: 1.02 } : undefined}
            whileTap={canStart ? { scale: 0.98 } : undefined}
            onClick={handleStart}
            disabled={!canStart}
            className={`w-full py-4 font-semibold text-lg transition-all ${
              canStart
                ? "bg-primary text-primary-foreground glow-primary hover:brightness-110"
                : "bg-surface-3 text-muted-foreground cursor-not-allowed"
            }`}
          >
            {getButtonLabel()}
          </motion.button>
        </div>
      </div>

      {/* Navigation now uses routes instead of overlay */}
    </motion.div>
  );
};

export default AuditConfigScreen;
