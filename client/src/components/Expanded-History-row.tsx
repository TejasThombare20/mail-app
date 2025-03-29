import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui-component/Table";
import { ScrollArea } from "./ui-component/Scroll-Area";
import { StatusBadge } from "../lib/StatusBadge";
import { getEmailLogsApiResponse } from "../types/email-logs";
import { ColumnDef, Row } from "@tanstack/react-table";

type Props = {
  row: Row<getEmailLogsApiResponse>;
  columns: ColumnDef<getEmailLogsApiResponse, any>[];
};

const ExpandedHistoryrow = ({ row, columns }: Props) => {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={columns.length}>
        <div className="p-4 bg-white border rounded-md">
          <h4 className="text-sm font-semibold mb-2">Recipients</h4>
          <ScrollArea className="h-auto max-h-[300px] overflow-y-scroll">
            <div className="grid grid-cols-2 gap-4">
              {/* Left Section */}
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {row.original.receiver_emails
                      .filter((_, idx) => idx % 2 === 0)
                      .map((recipient, idx) => (
                        <TableRow key={idx} className="break-inside-avoid">
                          <TableCell>{recipient.email}</TableCell>
                          <TableCell>
                            <StatusBadge status={recipient.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>

              {/* Right Section */}
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {row.original.receiver_emails
                      .filter((_, idx) => idx % 2 !== 0)
                      .map((recipient, idx) => (
                        <TableRow key={idx} className="break-inside-avoid">
                          <TableCell>{recipient.email}</TableCell>
                          <TableCell>
                            <StatusBadge status={recipient.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </ScrollArea>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ExpandedHistoryrow;
