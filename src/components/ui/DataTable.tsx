import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type Align = "start" | "center" | "end";

export type Column<T> = {
  key: string;
  header: string;
  align?: Align;
  width?: string;
  render: (row: T) => ReactNode;
};

const alignClass: Record<Align, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  className?: string;
};

export function DataTable<T>({ columns, rows, rowKey, className }: DataTableProps<T>) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse text-start">
        <thead>
          <tr className="border-b border-outline-variant/20 font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn("py-4 px-2 font-normal", alignClass[col.align ?? "start"])}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="font-body-md text-sm">
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors duration-300"
            >
              {columns.map((col) => (
                <td key={col.key} className={cn("py-5 px-2 text-primary", alignClass[col.align ?? "start"])}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
