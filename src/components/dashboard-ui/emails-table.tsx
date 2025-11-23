"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";

type Email = {
  id: string;
  to: string;
  subject: string;
  status: "sent" | "failed" | "pending";
  sentAt: Date;
  attachments: number;
};

// Mock data - replace with actual data fetching
const mockEmails: Email[] = [
  {
    id: "1",
    to: "customer@example.com",
    subject: "Re: Product Inquiry",
    status: "sent",
    sentAt: new Date("2024-01-15T10:30:00"),
    attachments: 2,
  },
  {
    id: "2",
    to: "support@example.com",
    subject: "Order Confirmation #12345",
    status: "sent",
    sentAt: new Date("2024-01-14T15:20:00"),
    attachments: 1,
  },
  {
    id: "3",
    to: "user@example.com",
    subject: "Welcome to AI Helpdesk",
    status: "failed",
    sentAt: new Date("2024-01-13T09:15:00"),
    attachments: 0,
  },
  {
    id: "4",
    to: "client@example.com",
    subject: "Invoice #INV-2024-001",
    status: "pending",
    sentAt: new Date("2024-01-12T14:45:00"),
    attachments: 3,
  },
];

export function EmailsTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<Email>[]>(
    () => [
      {
        accessorKey: "to",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2"
            >
              To
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("to")}</div>
        ),
      },
      {
        accessorKey: "subject",
        header: "Subject",
        cell: ({ row }) => (
          <div className="max-w-[300px] truncate">{row.getValue("subject")}</div>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2"
            >
              Status
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                status === "sent"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  : status === "failed"
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          );
        },
      },
      {
        accessorKey: "sentAt",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-8 px-2"
            >
              Sent At
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const date = row.getValue("sentAt") as Date;
          return (
            <div className="text-sm text-muted-foreground">
              {date.toLocaleDateString()} {date.toLocaleTimeString()}
            </div>
          );
        },
      },
      {
        accessorKey: "attachments",
        header: "Attachments",
        cell: ({ row }) => {
          const count = row.getValue("attachments") as number;
          return (
            <div className="text-sm text-muted-foreground">
              {count} {count === 1 ? "file" : "files"}
            </div>
          );
        },
      },
    ],
    []
  );

  const [data] = useState(() => [...mockEmails]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sent Emails</CardTitle>
        <CardDescription>
          View and manage all emails that have been sent through the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search emails..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="p-4 align-middle">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No emails found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {table.getRowModel().rows.length} of {data.length} emails
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

