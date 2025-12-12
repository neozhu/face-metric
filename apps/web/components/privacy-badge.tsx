import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function PrivacyBadge() {
  return (
    <Badge className="gap-1 border-border/70 bg-card/60 text-slate-100 shadow-[0_0_0_1px_rgba(30,41,59,0.35)] backdrop-blur">
      <ShieldCheck className="h-3.5 w-3.5 text-accent" />
      Privacy-first • In-memory only • Nothing saved
    </Badge>
  );
}
