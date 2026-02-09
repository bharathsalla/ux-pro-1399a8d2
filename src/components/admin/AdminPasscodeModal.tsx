import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAdminContext } from "@/contexts/AdminContext";
import { Loader2, ShieldCheck, ShieldX } from "lucide-react";

interface AdminPasscodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AdminPasscodeModal({ open, onOpenChange, onSuccess }: AdminPasscodeModalProps) {
  const { verifyAdmin } = useAdminContext();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    setError("");

    const isValid = await verifyAdmin();

    if (isValid) {
      setError("");
      setLoading(false);
      onSuccess();
      onOpenChange(false);
    } else {
      setError("You do not have admin access. Contact the site owner.");
      setLoading(false);
    }
  };

  const handleClose = () => {
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
            Click verify to check if your account has admin privileges.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
            <Button className="flex-1" disabled={loading} onClick={handleVerify}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Access"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
