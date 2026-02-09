import { useState } from "react";
import { motion } from "framer-motion";
import { type PersonaId, type AuditConfig, personas } from "@/types/audit";
import { Target, MessageSquare, Mail, HelpCircle } from "lucide-react";
import ImageUpload from "./ImageUpload";
import { SectionOverlay, type SectionId } from "./landing/SectionOverlay";

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

const navItems: { id: SectionId; label: string; icon: typeof Target }[] = [
  { id: "flowcheck", label: "FlowCheck", icon: Target },
  { id: "testimonials", label: "Testimonials", icon: MessageSquare },
  { id: "contact", label: "Contact Us", icon: Mail },
  { id: "why-free", label: "Why Free", icon: HelpCircle },
];

const AuditConfigScreen = ({ personaId, onStart, onStartMultiImage, onBack }: AuditConfigScreenProps) => {
  const persona = personas.find((p) => p.id === personaId)!;
  const [inputMode, setInputMode] = useState<ExtInputMode>("single");
  const [fidelity, setFidelity] = useState<AuditConfig["fidelity"]>("high-fidelity");
  const [purpose, setPurpose] = useState<AuditConfig["purpose"]>(purposeOptions[personaId][0].value);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

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
      className="min-h-screen"
    >
      {/* Navigation Header */}
      <header className="sticky top-0 z-20 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xl">{persona.icon}</span>
              <span className="text-sm font-semibold text-foreground hidden sm:block">{persona.title}</span>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-surface-2 border border-transparent hover:border-border transition-all"
              >
                <item.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div
        className="flex flex-col items-center justify-center px-4 py-12"
        style={{ minHeight: "calc(100vh - 52px)" }}
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

      {/* Section Overlay */}
      <SectionOverlay activeSection={activeSection} onClose={() => setActiveSection(null)} />
    </motion.div>
  );
};

export default AuditConfigScreen;
