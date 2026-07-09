import { useEffect, useState } from "react";
import api from "../api/api";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { Activity, Key, RefreshCw, TrendingUp, Globe } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { motion } from "framer-motion";

const COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#84cc16"];

export default function AdminAnalytics() {
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [analytics, setAnalytics] = useState({
    total_requests: 0,
    total_api_keys: 0,
    top_domains:    [],
  });

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/analytics/overview");
      setAnalytics(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Unable to load analytics.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAnalytics(); }, []);

  const chartData = (analytics.top_domains || []).slice(0, 10).map((item) => ({
    email: item.email || "unknown",
    count: item.count || 0,
  }));

  const domainData = (analytics.top_domains || [])
    .reduce((acc, item) => {
      const domain = item.email?.split("@")[1] || item.email || "unknown";
      const count = item.count || 0;
      const existing = acc.find((d) => d.domain === domain);
      if (existing) {
        existing.count += count;
      } else {
        acc.push({ domain, count });
      }
      return acc;
    }, [])
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="page-title">Platform Analytics</h2>
            <p className="muted mt-0.5">All users and requests overview</p>
          </div>
          <button onClick={loadAnalytics} disabled={loading} className="btn-secondary">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard
                title="Total Requests"
                value={analytics.total_requests?.toLocaleString()}
                icon={Activity}
                color="brand"
                subtitle="All time API calls"
              />
              <StatCard
                title="Total API Keys"
                value={analytics.total_api_keys?.toLocaleString()}
                icon={Key}
                color="violet"
                subtitle="Active keys"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="section-title">Top Checked Emails</h3>
                    <p className="muted mt-0.5">Most verified email addresses across all users</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-slate-400" />
                </div>

                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={chartData} layout="vertical" barSize={16}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.05} horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11, fill: "currentColor", opacity: 0.5 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="email"
                        width={140}
                        tick={{ fontSize: 10, fill: "currentColor", opacity: 0.6 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => v.length > 22 ? `${v.slice(0, 22)}…` : v}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#1e293b",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        cursor={{ fill: "rgba(99,102,241,0.06)" }}
                      />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState
                    icon={TrendingUp}
                    title="No email data yet"
                    description="Verify some emails to see analytics here."
                  />
                )}
              </div>

              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="section-title">Top Domains</h3>
                    <p className="muted mt-0.5">Most common email domains verified across all users</p>
                  </div>
                  <Globe className="w-5 h-5 text-slate-400" />
                </div>

                {domainData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={domainData} barSize={28}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.05} />
                      <XAxis
                        dataKey="domain"
                        tick={{ fontSize: 10, fill: "currentColor", opacity: 0.5 }}
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
                          background: "#1e293b",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        cursor={{ fill: "rgba(99,102,241,0.06)" }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {domainData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState
                    icon={Globe}
                    title="No domain data yet"
                    description="Verify some emails to see domain analytics here."
                  />
                )}
              </div>
            </div>

            {chartData.length > 0 && (
              <div className="card overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="section-title text-sm">Top Checked Emails — Detail</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="table-header">#</th>
                        <th className="table-header">Email</th>
                        <th className="table-header text-right">Count</th>
                        <th className="table-header text-right">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.map((item, i) => {
                        const share = analytics.total_requests > 0
                          ? ((item.count / analytics.total_requests) * 100).toFixed(1)
                          : "—";
                        return (
                          <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="table-cell text-slate-400 tabular-nums w-12">{i + 1}</td>
                            <td className="table-cell font-mono text-xs">{item.email}</td>
                            <td className="table-cell text-right tabular-nums font-medium">{item.count?.toLocaleString()}</td>
                            <td className="table-cell text-right tabular-nums text-slate-500">{share}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
