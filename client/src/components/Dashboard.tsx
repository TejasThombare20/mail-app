import { useEffect, useState } from "react";
import apiHandler from "../handlers/api-handler";
import { useHandleApiError } from "../handlers/useErrorToast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui-component/Card";
import { Badge } from "./ui-component/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui-component/Table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Mail,
  Send,
  AlertTriangle,
  Activity,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { formatDate } from "../lib/utils";

interface SessionDetail {
  id: string;
  subject: string;
  template_name: string | null;
  status: string;
  total_emails: number;
  sent_count: number;
  failed_count: number;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  duration_seconds: number | null;
  recipient_companies: string[];
}

interface DashboardSummary {
  total_sessions: number;
  total_emails_sent: number;
  total_emails_failed: number;
  completed_sessions: number;
  failed_sessions: number;
  in_progress_sessions: number;
}

interface DashboardStats {
  summary: DashboardSummary;
  sessions: SessionDetail[];
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--destructive))",
  "hsl(210, 70%, 55%)",
  "hsl(150, 60%, 45%)",
  "hsl(40, 80%, 55%)",
];

const PIE_COLORS = ["#22c55e", "#ef4444", "#3b82f6", "#eab308"];

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const showErrorToast = useHandleApiError();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await apiHandler.get<DashboardStats>(
          "/api/loghistory/dashboard/stats"
        );
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (error: any) {
        showErrorToast(error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        Unable to load dashboard data.
      </div>
    );
  }

  const { summary, sessions } = stats;

  // --- Chart data ---

  // Emails per session (bar chart) - last 15 sessions in chronological order
  const emailsPerSession = [...sessions]
    .reverse()
    .slice(-15)
    .map((s, i) => ({
      name: s.subject
        ? s.subject.length > 20
          ? s.subject.slice(0, 20) + "..."
          : s.subject
        : `Session ${i + 1}`,
      sent: s.sent_count,
      failed: s.failed_count,
    }));

  // Session status pie chart
  const statusPieData = [
    { name: "Completed", value: summary.completed_sessions },
    { name: "Failed", value: summary.failed_sessions },
    { name: "In Progress", value: summary.in_progress_sessions },
    {
      name: "Pending",
      value:
        summary.total_sessions -
        summary.completed_sessions -
        summary.failed_sessions -
        summary.in_progress_sessions,
    },
  ].filter((d) => d.value > 0);

  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return "-";
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-600 text-white border-0">Completed</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-600 text-white border-0">In Progress</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sessions
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.total_sessions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Emails Sent
            </CardTitle>
            <Send className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {summary.total_emails_sent}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Emails Failed
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {summary.total_emails_failed}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Success Rate
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {summary.total_emails_sent + summary.total_emails_failed > 0
                ? (
                    (summary.total_emails_sent /
                      (summary.total_emails_sent + summary.total_emails_failed)) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart - Emails per Session */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Emails per Session</CardTitle>
          </CardHeader>
          <CardContent>
            {emailsPerSession.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No session data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={emailsPerSession}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    angle={-30}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Bar
                    dataKey="sent"
                    name="Sent"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="failed"
                    name="Failed"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart - Session Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Session Status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusPieData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No session data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusPieData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Session Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No sessions found. Start sending emails to see data here.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Sent</TableHead>
                    <TableHead className="text-center">Failed</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead>Companies</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {session.subject || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {session.template_name || "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(session.status)}</TableCell>
                      <TableCell className="text-center text-green-600 font-medium">
                        {session.sent_count}
                      </TableCell>
                      <TableCell className="text-center text-red-600 font-medium">
                        {session.failed_count}
                      </TableCell>
                      <TableCell className="text-center">
                        {session.total_emails}
                      </TableCell>
                      <TableCell className="max-w-[180px]">
                        {session.recipient_companies.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {session.recipient_companies.slice(0, 3).map((c) => (
                              <Badge
                                key={c}
                                variant="outline"
                                className="text-xs"
                              >
                                {c}
                              </Badge>
                            ))}
                            {session.recipient_companies.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{session.recipient_companies.length - 3}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {formatDate(session.started_at)}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {formatDuration(session.duration_seconds)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
