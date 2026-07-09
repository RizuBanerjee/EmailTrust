import { useEffect, useState, useMemo } from "react";
import api from "../api/api";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import Badge from "../components/ui/Badge.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import {
  Wallet,
  CreditCard,
  TrendingUp,
  RefreshCw,
  History,
  Calendar,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

function getErrorMessage(err, fallback) {
  const detail = err.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) =>
        typeof item === "string"
          ? item
          : item.msg || item.message || JSON.stringify(item)
      )
      .join("; ");
  }
  return fallback;
}

function formatCurrency(n) {
  return `₹${Math.round(n || 0).toLocaleString()}`;
}

const chartAxisColor = "#94a3b8";
const chartGridColor = "#334155";

export default function AdminRevenue() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  async function loadRevenue() {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/admin/revenue");
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, "Unable to load revenue data."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRevenue();
  }, []);

  const recentChartData = useMemo(() => {
    if (!data?.recentPayments) return [];
    return [...data.recentPayments]
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((p) => ({
        date: new Date(p.createdAt).toLocaleDateString(),
        amount: p.amount || 0,
      }));
  }, [data]);

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="page-title">Revenue</h2>
            <p className="muted mt-0.5">Payments, monthly earnings, and trends</p>
          </div>
          <button onClick={loadRevenue} className="btn-secondary">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {!data ? (
          <EmptyState
            icon={Wallet}
            title="No revenue data"
            description="Revenue information will appear once payments are recorded."
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                title="Total Revenue"
                value={formatCurrency(data.totalRevenue)}
                icon={Wallet}
                color="green"
                subtitle="Lifetime earnings"
              />
              <StatCard
                title="Payments"
                value={data.totalPayments?.toLocaleString()}
                icon={CreditCard}
                color="brand"
                subtitle="Successful transactions"
              />
              <StatCard
                title="Average Order"
                value={formatCurrency(data.averageOrderValue)}
                icon={TrendingUp}
                color="violet"
                subtitle="Per transaction"
              />
            </div>

            {data.byMonth?.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-4 h-4 text-slate-400" />
                    <h3 className="section-title text-sm">Monthly Revenue</h3>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.byMonth}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                        <XAxis dataKey="month" stroke={chartAxisColor} fontSize={12} />
                        <YAxis
                          stroke={chartAxisColor}
                          fontSize={12}
                          tickFormatter={(v) => `₹${v}`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "none",
                            borderRadius: "8px",
                          }}
                          itemStyle={{ color: "#e2e8f0" }}
                          formatter={(v) => [formatCurrency(v), "Revenue"]}
                        />
                        <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-4 h-4 text-slate-400" />
                    <h3 className="section-title text-sm">Monthly Payments</h3>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.byMonth}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                        <XAxis dataKey="month" stroke={chartAxisColor} fontSize={12} />
                        <YAxis stroke={chartAxisColor} fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "none",
                            borderRadius: "8px",
                          }}
                          itemStyle={{ color: "#e2e8f0" }}
                          formatter={(v) => [v, "Payments"]}
                        />
                        <Bar dataKey="payments" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {recentChartData.length > 0 && (
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-slate-400" />
                  <h3 className="section-title text-sm">Recent Payment Trend</h3>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={recentChartData}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                      <XAxis dataKey="date" stroke={chartAxisColor} fontSize={12} />
                      <YAxis
                        stroke={chartAxisColor}
                        fontSize={12}
                        tickFormatter={(v) => `₹${v}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "none",
                          borderRadius: "8px",
                        }}
                        itemStyle={{ color: "#e2e8f0" }}
                        formatter={(v) => [formatCurrency(v), "Amount"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#8b5cf6"
                        fillOpacity={1}
                        fill="url(#colorAmount)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="card overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <h3 className="section-title text-sm">Monthly Revenue</h3>
              </div>
              {data.byMonth?.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="No monthly data"
                  description="Revenue data will appear here once payments are recorded."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="table-header">Month</th>
                        <th className="table-header">Payments</th>
                        <th className="table-header text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.byMonth.map((m) => (
                        <tr
                          key={m.month}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="table-cell">{m.month}</td>
                          <td className="table-cell tabular-nums">{m.payments}</td>
                          <td className="table-cell text-right tabular-nums">
                            {formatCurrency(m.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="card overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" />
                <h3 className="section-title text-sm">Recent Payments</h3>
              </div>
              {data.recentPayments?.length === 0 ? (
                <EmptyState
                  icon={History}
                  title="No payments yet"
                  description="Recent transactions will appear here."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="table-header">User</th>
                        <th className="table-header">Amount</th>
                        <th className="table-header">Status</th>
                        <th className="table-header">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentPayments.map((p) => (
                        <tr
                          key={p.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="table-cell">
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-900 dark:text-slate-100">
                                {p.userName || p.userEmail || "—"}
                              </span>
                              <span className="text-xs text-slate-500">{p.userEmail}</span>
                            </div>
                          </td>
                          <td className="table-cell tabular-nums">
                            {formatCurrency(p.amount)}
                          </td>
                          <td className="table-cell">
                            <Badge
                              variant={p.status?.toLowerCase() === "active" ? "success" : "default"}
                            >
                              {p.status || "—"}
                            </Badge>
                          </td>
                          <td className="table-cell text-slate-500">
                            {new Date(p.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}