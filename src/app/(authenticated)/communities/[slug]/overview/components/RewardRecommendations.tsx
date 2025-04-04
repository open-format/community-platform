"use client"

import { startTransition, useState } from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, Loader2, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useConfetti } from "@/contexts/confetti-context";


const data: RewardRecommendation[] = [
  {
    "id": "1a2b3c4d-5678-90ab-cdef-1234567890ab",
    "communityId": "community_xyz",
    "contributorName": "Jane Doe",
    "walletAddress": "0x123abc456def789ghi012jkl345mno678pqr",
    "platform": "discord",
    "rewardId": "reward_001",
    "points": 150,
    "metadataUri": "ipfs://metadatauri123",
    "status": "pending",
    "createdAt": new Date( "2025-03-27T12:34:56Z" ),
    "updatedAt": new Date( "2025-03-27T12:34:56Z" ),
    "processedAt": null,
    "error": null
  },
  {
    "id": "9f8e7d6c-5432-10ba-fedc-9987654321ba",
    "communityId": "community_abc",
    "contributorName": "Pepe Vega",
    "walletAddress": "0xabc987def654ghi321jkl012mno345pqr678",
    "platform": "telegram",
    "rewardId": "reward_002",
    "points": 55,
    "metadataUri": "ipfs://metadatauri456",
    "status": "pending",
    "createdAt": new Date( "2025-03-26T09:21:00Z" ),
    "updatedAt": new Date( "2025-03-26T09:21:00Z" ),
    "processedAt": null,
    "error": null
  },
  {
    "id": "9f8e7d6c-5432-10ba-fedc-0987654321ba",
    "communityId": "community_abc",
    "contributorName": "John Smith",
    "walletAddress": "0xabc987def654ghi321jkl012mno345pqr678",
    "platform": "telegram",
    "rewardId": "reward_002",
    "points": 75,
    "metadataUri": "ipfs://metadatauri456",
    "status": "pending",
    "createdAt": new Date( "2025-03-26T09:21:00Z" ),
    "updatedAt": new Date( "2025-03-26T09:21:00Z" ),
    "processedAt": null,
    "error": null
  },
  {
    "id": "9f8e7d6c-5932-10ba-fedc-0987654321ba",
    "communityId": "community_abc",
    "contributorName": "Peter Pan",
    "walletAddress": "0xabc987def654ghi321jkl012mno345pqr678",
    "platform": "telegram",
    "rewardId": "reward_002",
    "points": 175,
    "metadataUri": "ipfs://metadatauri456",
    "status": "pending",
    "createdAt": new Date( "2025-03-26T09:21:00Z" ),
    "updatedAt": new Date( "2025-03-26T09:21:00Z" ),
    "processedAt": null,
    "error": null
  },
];


export default function RewardRecommendations() {
  const [sorting, setSorting] = useState<SortingState>( [] );
  const [isSubmitting, setIsSubmitting] = useState<boolean>( false );
  const [showRejectDialog, setShowRejectDialog] = useState<boolean>( false );
  const {triggerConfetti} = useConfetti();
  const columns: ColumnDef<RewardRecommendation>[] = [
    {
      accessorKey: "contributorName",
      header: "Contributor Name",
      cell: ({row}) => (
        <div>{row.getValue( "contributorName" )}</div>
      ),
    },
    {
      accessorKey: "points",
      header: ({column}) => {
        return (
          <div className="text-right">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting( column.getIsSorted() === "asc" )}
            >
              Points
              <ArrowUpDown/>
            </Button>
          </div>
        )
      },
      cell: ({row}) => <div className="lowercase text-right font-medium">{row.getValue( "points" )}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({row}) => {
        const rewardRecommendation = row.original

        return (
          <div>
            <Button
              onClick={() => navigator.clipboard.writeText( rewardRecommendation.id )}
            >
              Reward
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel
                  onClick={handleFormSubmission}
                >Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleAlertDialogClose}>Reject</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

        )
      },
    },
  ]

  const table = useReactTable( {
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
    },
  } );

  function handleFormSubmission() {
    startTransition( async () => {
      triggerConfetti();
    } );
  }

  function handleRewardRecommendationRejected() {
    setIsSubmitting( true );

  }

  function handleAlertDialogClose() {
    setShowRejectDialog( !showRejectDialog );
  }

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map( (headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map( (header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                } )}
              </TableRow>
            ) )}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map( (row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map( (cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ) )}
                </TableRow>
              ) )
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <AlertDialog open={showRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleAlertDialogClose}>Cancel</AlertDialogCancel>
            {isSubmitting ? (
              <AlertDialogAction disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin"/> Deleting reward
              </AlertDialogAction>
            ) : (
              <AlertDialogAction onClick={handleRewardRecommendationRejected}>Continue</AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
