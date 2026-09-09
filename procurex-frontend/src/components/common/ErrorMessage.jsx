import { AlertTriangle, X } from "lucide-react";

export default function ErrorMessage({ message, onDismiss, className = "" }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`fade-in flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 ${className}`}
    >
      <AlertTriangle size={18} className="mt-0.5 shrink-0" />
      <p className="flex-1 leading-relaxed">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded p-0.5 text-red-500 hover:bg-red-100"
          aria-label="Dismiss error"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
