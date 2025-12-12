import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function PrivacyBadge() {
  return (
    <Badge className="gap-1 border-accent/40 text-slate-100">
      <ShieldCheck className="h-3.5 w-3.5 text-accent" />
      No storage • In‑memory compare
    </Badge>
  );
}

