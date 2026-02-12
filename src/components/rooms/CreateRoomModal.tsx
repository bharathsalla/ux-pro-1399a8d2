import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { X, Upload, Lock, Globe, AlertTriangle, Loader2, Image as ImageIcon } from "lucide-react";

interface CreateRoomModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateRoomModal({ onClose, onCreated }: CreateRoomModalProps) {
  const { user } = useAuthContext();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [expiryDays, setExpiryDays] = useState(7);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!user || !title.trim()) {
      toast.error("Please enter a room title");
      return;
    }
    if (isPrivate && !passcode.trim()) {
      toast.error("Private rooms require a passcode");
      return;
    }

    setSubmitting(true);

    let imageUrl: string | null = null;

    // Upload image if provided
    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("room-images")
        .upload(path, imageFile);

      if (uploadError) {
        toast.error("Failed to upload image");
        setSubmitting(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("room-images")
        .getPublicUrl(path);
      imageUrl = urlData.publicUrl;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    const { error } = await supabase.from("review_rooms").insert({
      creator_id: user.id,
      title: title.trim(),
      description: description.trim(),
      image_url: imageUrl,
      preview_url: previewUrl.trim() || null,
      is_private: isPrivate,
      passcode: isPrivate ? passcode.trim() : null,
      expiry_days: expiryDays,
      expires_at: expiresAt.toISOString(),
    } as any);

    if (error) {
      toast.error("Failed to create room");
      setSubmitting(false);
      return;
    }

    toast.success("Review room created!");
    onCreated();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="relative w-full max-w-lg bg-background border border-border rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Create Review Room</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Room Title *
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Homepage Redesign Review"
              className="text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief context for reviewers..."
              rows={2}
              className="text-sm resize-none"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Design Image
            </Label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {imagePreview ? (
              <div className="relative rounded-md overflow-hidden border border-border">
                <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-cover" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-md py-8 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
              >
                <Upload className="h-6 w-6" />
                <span className="text-xs font-medium">Click to upload design image</span>
                <span className="text-[10px]">PNG, JPG up to 10MB</span>
              </button>
            )}
          </div>

          {/* OR Preview URL */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Or Paste URL (Figma / Website)
            </Label>
            <Input
              value={previewUrl}
              onChange={(e) => setPreviewUrl(e.target.value)}
              placeholder="https://..."
              className="text-sm"
            />
          </div>

          {/* Public / Private Toggle */}
          <div className="flex items-center justify-between p-3 rounded-md bg-muted/50 border border-border">
            <div className="flex items-center gap-2">
              {isPrivate ? (
                <Lock className="h-4 w-4 text-destructive" />
              ) : (
                <Globe className="h-4 w-4 text-primary" />
              )}
              <div>
                <p className="text-sm font-medium text-foreground">
                  {isPrivate ? "Private Room" : "Public Room"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {isPrivate ? "Passcode required to enter" : "Anyone with the link can review"}
                </p>
              </div>
            </div>
            <Switch checked={isPrivate} onCheckedChange={setIsPrivate} />
          </div>

          {/* Passcode */}
          {isPrivate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-1.5"
            >
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Room Passcode *
              </Label>
              <Input
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter a passcode"
                className="text-sm"
              />
            </motion.div>
          )}

          {/* Expiry */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Auto-Delete After
            </Label>
            <div className="flex items-center gap-2">
              {[3, 7, 14].map((d) => (
                <button
                  key={d}
                  onClick={() => setExpiryDays(d)}
                  className={`px-4 py-2 text-xs font-semibold rounded-md border transition-colors ${
                    expiryDays === d
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {d} days
                </button>
              ))}
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/5 border border-destructive/20 text-xs text-muted-foreground">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <span>All rooms auto-delete after expiry. Data is not stored permanently.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !title.trim()}>
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Create Room
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
