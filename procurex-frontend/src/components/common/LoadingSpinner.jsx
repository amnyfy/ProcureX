import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ label = "Loading…", size = 20, className = "" }) {
  return (
    <div className={`flex items-center gap-2 text-brand-600 ${className}`}>
      <Loader2 size={size} className="spin-slow" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
