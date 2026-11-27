import React from 'react';

interface Column<T> {
  header: string;
  accessor?: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  renderMobileCard?: (row: T) => React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No records found',
  renderMobileCard,
}: DataTableProps<T>) {
  return (
    <div className="w-full rounded-xl border border-ifaqa-plum/10 bg-white shadow-luxury-card overflow-hidden">
      {/* Mobile stacked card view when provided */}
      {renderMobileCard && (
        <div className="md:hidden divide-y divide-ifaqa-plum/10">
          {data.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-[#5A6962]">
              {emptyMessage}
            </div>
          ) : (
            data.map((row) => (
              <div key={keyExtractor(row)} className="p-4">
                {renderMobileCard(row)}
              </div>
            ))
          )}
        </div>
      )}

      {/* Desktop table (also mobile fallback if renderMobileCard omitted) */}
      <div className={renderMobileCard ? 'hidden md:block overflow-x-auto' : 'overflow-x-auto'}>
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-ifaqa-plum/10 bg-ifaqa-cashmere/70 text-xs font-medium text-[#5A6962]">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-4 py-3 font-medium whitespace-nowrap ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ifaqa-plum/10">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-sm text-[#5A6962]"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  className="hover:bg-ifaqa-linen transition-colors"
                >
                  {columns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      className={`px-4 py-3.5 text-ifaqa-plum align-middle ${col.className || ''}`}
                    >
                      {typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : col.accessor
                        ? (row[col.accessor] as unknown as React.ReactNode)
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
