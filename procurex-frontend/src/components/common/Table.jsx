/**
 * Generic table.
 * columns: [{ key, header, render?: (row) => node, className? }]
 * rows: array of data objects, each needs a unique `id` (or pass getRowId).
 */
export default function Table({ columns, rows, getRowId = (row) => row.id, onRowClick }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/70 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-100 text-sm">
        <thead className="bg-slate-50/80">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${col.className || ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr
              key={getRowId(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`transition-colors ${
                onRowClick ? "cursor-pointer hover:bg-brand-50/60" : ""
              }`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`whitespace-nowrap px-4 py-3.5 text-slate-700 ${col.className || ""}`}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
