import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminContext } from "@/contexts/AdminContext";
import { Loader2, ShieldCheck, ShieldX } from "lucide-react";

interface AdminPasscodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AdminPasscodeModal({ open, onOpenChange, onSuccess }: AdminPasscodeModalProps) {
  const { verifyPasscode } = useAdminContext();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passcode.trim()) {
      setError("Please enter the admin passcode.");
      return;
    }

    setLoading(true);
    const result = await verifyPasscode(passcode);

    if (result.success) {
      setPasscode("");
      setError("");
      setLoading(false);
      onSuccess();
      onOpenChange(false);
    } else {
      setError(result.error || "This area is restricted to administrators.");
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPasscode("");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Admin Access
          </DialogTitle>
          <DialogDescription>
            Enter the 6-digit admin passcode to access the dashboard.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="passcode">Passcode</Label>
            <Input
              id="passcode"
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value.replace(/\D/g, ""));
                setError("");
              }}
              placeholder="••••••"
              className="text-center text-lg tracking-widest"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <ShieldX className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
