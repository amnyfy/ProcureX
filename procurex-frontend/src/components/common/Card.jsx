export default function Card({
  children,
  className = "",
  padded = true,
  as: Tag = "div",
  ...props
}) {
  return (
    <Tag
      className={`rounded-xl border border-slate-200/70 bg-white shadow-sm ${
        padded ? "p-5 sm:p-6" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-base font-semibold text-brand-950">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
