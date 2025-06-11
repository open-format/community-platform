"use client";

import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cx } from "class-variance-authority";
import { DataTablePagination } from "./data-table-pagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  // Server-side pagination props
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  totalCount?: number;
  manualPagination?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  sorting,
  onSortingChange,
  pagination,
  onPaginationChange,
  totalCount,
  manualPagination = false,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange,
    // Pagination configuration
    manualPagination,
    onPaginationChange,
    pageCount: manualPagination && totalCount ? Math.ceil(totalCount / (pagination?.pageSize || 10)) : undefined,
    state: {
      sorting,
      pagination,
    },
  });

  if (!data.length) {
    return (
      <div className="rounded-md border w-full overflow-hidden bg-muted/50">
        <div className="h-24 flex flex-col items-center justify-center text-center px-4 space-y-1">
          <p className="text-lg font-semibold">No recommendations found</p>
          <p className="text-sm text-muted-foreground">
            Reward recommendations are updated daily at midnight. Check back soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border w-full overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cx(
                    "font-medium px-4 py-0 h-1",
                    header.id === "contributorName" && "w-full",
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="px-4 py-2">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <DataTablePagination table={table} totalCount={totalCount} />
    </div>
  );
}
