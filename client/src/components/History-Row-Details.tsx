import React from "react";
import { ScrollArea } from "./ui-component/Scroll-Area";
import { Card, CardContent, CardHeader, CardTitle } from "./ui-component/Card";
import { StatusBadge } from "../lib/StatusBadge";
import { calculateSuccessRate, formatDate } from "../lib/utils";
import CircularProgress from "./ui-component/CircularProgress";
import { AlertCircle, CheckCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui-component/Table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui-component/Collapsible";
import { Button } from "./ui-component/Button";
import { getEmailLogsApiResponse } from "../types/email-logs";

type Props = {
  selectedRow: getEmailLogsApiResponse;
};

const HistoryRowDetails = ({ selectedRow }: Props) => {
  return (
    <ScrollArea className="h-[calc(90vh-8rem)]">
      <div className="space-y-6 p-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Campaign Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Template:
                  </dt>
                  <dd className="text-sm">{selectedRow.template_name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Subject:
                  </dt>
                  <dd className="text-sm">{selectedRow.subject}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Sent At:
                  </dt>
                  <dd className="text-sm">
                    {formatDate(selectedRow?.sent_at!)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Status:</dt>
                  <dd>
                    <StatusBadge status={selectedRow.status} />
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Recipients:
                  </dt>
                  <dd className="text-sm">
                    {selectedRow.receiver_emails.length}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Delivery Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-6">
                <CircularProgress
                  value={calculateSuccessRate(selectedRow.receiver_emails).rate}
                  size={80}
                  strokeWidth={10}
                  color={
                    calculateSuccessRate(selectedRow.receiver_emails).rate > 80
                      ? "green"
                      : calculateSuccessRate(selectedRow.receiver_emails).rate >
                        50
                      ? "amber"
                      : "red"
                  }
                />

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      {
                        selectedRow.receiver_emails.filter(
                          (r) => r.status === "sent"
                        ).length
                      }{" "}
                      Delivered
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">
                      {
                        selectedRow.receiver_emails.filter(
                          (r) => r.status === "invalid"
                        ).length
                      }{" "}
                      Invalid
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">
                      {
                        selectedRow.receiver_emails.filter(
                          (r) => r.status === "failed"
                        ).length
                      }{" "}
                      Failed
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Global Variables */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Global Variables</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedRow.global_variables.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No global variables used
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedRow.global_variables.map((variable, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        {variable.key}
                      </TableCell>
                      <TableCell>{variable.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recipients */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recipients</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[25%]">Email</TableHead>
                  <TableHead className="w-[5%]">Status</TableHead>
                  <TableHead className="w-[70%]">Variables</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedRow.receiver_emails.map((receiver, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="w-[25%]">{receiver.email}</TableCell>
                    <TableCell className="w-[5%]">
                      <StatusBadge status={receiver.status} />
                    </TableCell>
                    <TableCell className="w-[75%]">
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7"
                          >
                            View {receiver.variables.length} variables
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="mt-2 border rounded-md p-2 bg-slate-50">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[20%]">Key</TableHead>
                                  <TableHead className="w-[60%]">Description</TableHead>
                                  <TableHead className="w-[20%]">Value</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {receiver.variables.map((variable, vidx) => (
                                  <TableRow key={vidx}>
                                    <TableCell className="font-medium text-sm w-[20%]">
                                      {variable.key}
                                    </TableCell>
                                    <TableCell className="text-sm  w-[60%]">
                                      {variable.description}
                                    </TableCell>
                                    <TableCell className="text-sm w-[20%]">
                                      {variable.value}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

export default HistoryRowDetails;
