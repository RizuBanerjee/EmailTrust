import { useEffect, useState } from "react";
import api from "../api/api";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import Badge from "../components/ui/Badge.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import {
  Activity,
  Key,
  CreditCard,
  Package,
  RefreshCw,
  TrendingUp,
  Globe,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const planColors = {
  FREE:       "default",
  STARTER:    "info",
  PRO:        "brand",
  ENTERPRISE: "success",
};

export default function Dashboard() {
  const [user, setUser]         = useState(null);
  const [overview, setOverview] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const authResponse = await api.get("/auth/me");
      setUser(authResponse.data);

      const email = authResponse.data.email;
      const [dashRes, analyticsRes] = await Promise.all([
        api.get(`/dashboard/overview/${email}`),
        api.get(`/analytics/user/${email}`),
      ]);

      setOverview(dashRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  // Build chart data from top_domains
  const chartData = (analytics?.top_domains || [])
    .reduce((acc, item) => {
      const domain = item.email?.split("@")[1] || item.email || "unknown";
      const count = item.count || 0;
      const existing = acc.find((d) => d.email === domain);
      if (existing) {
        existing.count += count;
      } else {
        acc.push({ email: domain, count });
      }
      return acc;
    }, [])
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="page-title">Overview</h2>
            <p className="muted mt-0.5">
              Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
            </p>
          </div>
          <button onClick={loadDashboard} className="btn-secondary">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Requests"
            value={overview?.total_requests?.toLocaleString() ?? "—"}
            icon={Activity}
            color="brand"
          />
          <StatCard
            title="API Keys"
            value={overview?.api_keys ?? "—"}
            icon={Key}
            color="violet"
          />
          <StatCard
            title="Credits Remaining"
            value={user?.credits_remaining?.toLocaleString() ?? "—"}
            icon={CreditCard}
            color="green"
          />
          <StatCard
            title="Subscription"
            value={
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={planColors[user?.plan] || "default"}>
                  {user?.plan || "—"}
                </Badge>
              </div>
            }
            icon={Package}
            color="amber"
            subtitle="Current plan"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Top domains chart */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="section-title">Top Checked Domains</h3>
                <p className="muted mt-0.5">Most frequently verified email domains</p>
              </div>
              <TrendingUp className="w-5 h-5 text-slate-400" />
            </div>

            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} />
                  <XAxis
                    dataKey="email"
                    tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }}
                    tickLine={false}
                    axisLine={false}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--tooltip-bg, #1e293b)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    cursor={{ fill: "rgba(99,102,241,0.06)" }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[220px] text-slate-400">
                <Globe className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">No domain data yet</p>
              </div>
            )}
          </div>

          {/* Account summary */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="section-title">Account Summary</h3>
                <p className="muted mt-0.5">Your account details at a glance</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: "Email", value: user?.email, copy: true },
                { label: "Plan", value: <Badge variant={planColors[user?.plan] || "default"}>{user?.plan}</Badge> },
                { label: "Credits Remaining", value: user?.credits_remaining?.toLocaleString() },
                { label: "Total API Keys", value: overview?.api_keys },
                { label: "Total Requests", value: overview?.total_requests?.toLocaleString() },
                { label: "Account Status", value: <Badge variant="success">Active</Badge> },
              ].map(({ label, value, copy }) => (
                <div key={label} className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{value ?? "—"}</span>
                    {copy && value && (
                      <button
                        onClick={() => navigator.clipboard.writeText(value)}
                        className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
                      >
                        Copy
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
