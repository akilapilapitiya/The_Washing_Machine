import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { InboxIcon } from "lucide-react";

/**
 * DataTable — shared table component for all portal listing pages.
 *
 * @param {Array<{key: string, label: string, className?: string, render?: (row) => ReactNode}>} columns
 * @param {Array<object>} data
 * @param {string} keyField        - field name used as React key for each row
 * @param {React.ElementType} [emptyIcon]   - Lucide icon component for the empty state
 * @param {string} [emptyTitle]    - heading text for empty state
 * @param {string} [emptySubtitle] - description text for empty state
 * @param {React.ReactNode} [emptyAction]   - optional CTA button for empty state
 * @param {string} [className]     - optional extra className on the outer Card
 */
const DataTable = ({
  columns = [],
  data = [],
  keyField = "id",
  emptyIcon: EmptyIcon = InboxIcon,
  emptyTitle = "Nothing here yet",
  emptySubtitle = "Records will appear here once available.",
  emptyAction = null,
  className = "",
}) => {
  if (data.length === 0) {
    return (
      <Card className={`border-dashed border-2 py-24 bg-transparent border-gray-200 ${className}`}>
        <CardContent className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="p-4 bg-gray-100 rounded-full text-gray-300">
            <EmptyIcon size={48} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-black text-gray-900">{emptyTitle}</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">{emptySubtitle}</p>
          </div>
          {emptyAction && <div>{emptyAction}</div>}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-gray-200 shadow-sm overflow-hidden bg-white ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-4 text-[10px] font-black uppercase tracking-wider text-gray-400 ${col.headerClassName ?? ""}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((row) => (
              <tr
                key={row[keyField]}
                className="hover:bg-gray-50/50 transition-colors group"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-6 py-4 ${col.className ?? ""}`}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default DataTable;
