import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countries } from "@/data/countries";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CountryModalProps {
  open: boolean;
}

export default function CountryModal({ open }: CountryModalProps) {
  const { user, updateProfileCountry } = useAuthContext();
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!country) {
      setError("Country is required to continue.");
      return;
    }
    if (!user) return;

    setLoading(true);
    const { error: updateError } = await updateProfileCountry(user.id, country);
    setLoading(false);

    if (updateError) {
      toast.error(updateError);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Select your country 🌍
          </DialogTitle>
          <DialogDescription className="text-center">
            To continue, please select your country. This is required.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Country</Label>
            <Select
              value={country}
              onValueChange={(val) => {
                setCountry(val);
                setError("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <Button onClick={handleSubmit} className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
