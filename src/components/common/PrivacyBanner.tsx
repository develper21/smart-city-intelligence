import { ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PrivacyBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-4 py-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0" />
          <p className="text-sm text-foreground">
            <span className="font-medium">Privacy Protected:</span>{" "}
            <span className="text-muted-foreground">
              All faces are automatically anonymized using AI to protect citizen privacy. 
              Data is encrypted and access is strictly controlled.
            </span>
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 flex-shrink-0"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
