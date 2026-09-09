// Maps common tender status values to a color treatment. Falls back to a
// neutral style for any status value the backend returns that we don't
// explicitly recognize, so this never breaks on unexpected data.
const STATUS_STYLES = {
  open: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  published: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  draft: "bg-slate-100 text-slate-600 ring-slate-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  under_review: "bg-amber-50 text-amber-700 ring-amber-200",
  closed: "bg-slate-100 text-slate-500 ring-slate-200",
  awarded: "bg-brand-50 text-brand-700 ring-brand-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
  expired: "bg-red-50 text-red-700 ring-red-200",
};

function formatLabel(status) {
  if (!status) return "Unknown";
  return status
    .toString()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function StatusBadge({ status }) {
  const key = status?.toString().toLowerCase();
  const style = STATUS_STYLES[key] || "bg-slate-100 text-slate-600 ring-slate-200";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {formatLabel(status)}
    </span>
  );
}
