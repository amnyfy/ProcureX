export default function Select({
  label,
  id,
  error,
  hint,
  required,
  options = [],
  placeholder = "Select…",
  className = "",
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-brand-900">
          {label}
          {required && <span className="ml-0.5 text-accent-600">*</span>}
        </label>
      )}
      <select
        id={id}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-brand-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 ${
          error ? "border-red-400 focus:border-red-500 focus:ring-red-100" : "border-slate-200"
        } ${className}`}
        {...props}
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : (
        hint && <p className="text-xs text-slate-400">{hint}</p>
      )}
    </div>
  );
}
