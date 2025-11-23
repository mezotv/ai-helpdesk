"use client"

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Email {
  id: string
  to: string
  subject: string
  status: "sent" | "failed" | "pending"
  sentAt: string
}

const columns: ColumnDef<Email>[] = [
  {
    accessorKey: "to",
    header: "To",
  },
  {
    accessorKey: "subject",
    header: "Subject",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            status === "sent"
              ? "bg-green-500/10 text-green-500"
              : status === "failed"
                ? "bg-red-500/10 text-red-500"
                : "bg-yellow-500/10 text-yellow-500"
          }`}
        >
          {status}
        </span>
      )
    },
  },
  {
    accessorKey: "sentAt",
    header: "Sent At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("sentAt"))
      return date.toLocaleString()
    },
  },
]

// Mock data - replace with real data from your API
const mockEmails: Email[] = [
  {
    id: "1",
    to: "customer@example.com",
    subject: "Welcome to our service",
    status: "sent",
    sentAt: new Date().toISOString(),
  },
  {
    id: "2",
    to: "support@example.com",
    subject: "Question about billing",
    status: "pending",
    sentAt: new Date().toISOString(),
  },
  {
    id: "3",
    to: "user@example.com",
    subject: "Account verification",
    status: "failed",
    sentAt: new Date().toISOString(),
  },
]

interface EmailsTableProps {
  emails?: Email[]
}

export function EmailsTable({ emails = mockEmails }: EmailsTableProps) {
  const table = useReactTable({
    data: emails,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No emails found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()} page(s)
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

