import React from "react";
import { Loader2 } from "lucide-react";

/**
 * PageLoader — full-height centered spinner for page-level loading states.
 * Usage: `if (loading) return <PageLoader />;`
 */
export const PageLoader = ({ message = "Loading..." }) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
    <Loader2 className="h-8 w-8 animate-spin text-red-600" />
    <p className="text-sm font-medium text-gray-400 uppercase tracking-widest">
      {message}
    </p>
  </div>
);

/**
 * TableLoader — a table row spinner for use inside <tbody>.
 * Usage: `{loading && <TableLoader colSpan={5} />}`
 */
export const TableLoader = ({ colSpan = 5, message = "Loading..." }) => (
  <tr>
    <td colSpan={colSpan} className="px-6 py-20 text-center">
      <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto mb-3" />
      <p className="text-sm font-semibold text-gray-400">{message}</p>
    </td>
  </tr>
);

export default PageLoader;
