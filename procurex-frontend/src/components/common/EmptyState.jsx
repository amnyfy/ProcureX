export default function EmptyState({
  icon: Icon,
  title = "Nothing here yet",
  description,
  action,
}) {
  return (
    <div className="fade-in flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-brand-200 bg-white px-6 py-14 text-center">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-500">
          <Icon size={22} />
        </div>
      )}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-brand-900">{title}</h3>
        {description && (
          <p className="max-w-sm text-sm text-slate-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
