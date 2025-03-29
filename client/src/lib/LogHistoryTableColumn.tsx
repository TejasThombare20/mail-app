import { ColumnDef } from "@tanstack/react-table";
import { getEmailLogsApiResponse } from "../types/email-logs";
import { Badge } from "../components/ui-component/Badge";
import { Button } from "../components/ui-component/Button";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  EyeIcon
} from "lucide-react";
import { calculateSuccessRate } from "./utils";
import { Dispatch, SetStateAction } from "react";
import CircularProgress from "../components/ui-component/CircularProgress";

interface getColumnsParameters {
  setSelectedEmail: Dispatch<SetStateAction<getEmailLogsApiResponse | null>>;
}

export const getColumns = ({
  setSelectedEmail,
}: getColumnsParameters): ColumnDef<getEmailLogsApiResponse, any>[] => {
  return [
    {
      id: "expand",
      header: "",
      cell: ({ row }) => {
        return row.getCanExpand() ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={row.getToggleExpandedHandler()}
            className="h-8 w-8 p-0"
          >
            {row.getIsExpanded() ? <ChevronDown /> : <ChevronRight />}
          </Button>
        ) : null;
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "template_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Template
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("template_name")}</div>
      ),
    },
    {
      accessorKey: "subject",
      header: "Subject",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("subject")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status: string = row.getValue("status");
        return (
          <Badge
            variant={
              status === "sent"
                ? "default"
                : status === "failed"
                ? "destructive"
                : "secondary"
            }
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "receiver_emails",
      header: "Success Rate",
      cell: ({ row }) => {
        const { rate} = calculateSuccessRate(
          row.original.receiver_emails
        );
        return (
          <div className="flex items-center">
            <CircularProgress
              value={rate}
              size={42}
              strokeWidth={5}
              color={rate > 80 ? "green" : rate > 50 ? "amber" : "red"}
            />
          </div>
        );
      },
    },
    {
      accessorKey: "sent_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Sent At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("sent_at"));
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedEmail(row.original)}
        >
          <EyeIcon className="h-4 w-4 mr-1" /> Details
        </Button>
      ),
    },
  ];
};
