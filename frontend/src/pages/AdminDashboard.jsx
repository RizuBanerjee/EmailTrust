import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import StatCard from "../components/ui/StatCard.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import {
  Activity,
  Key,
  Globe,
  Shield,
  ArrowRight,
  Users,
  Wallet,
  CreditCard,
  RefreshCw,
  BarChart2,
} from "lucide-react";
import { motion } from "framer-motion";

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

const cardColors = {
  violet: {
    bg: "bg-violet-50 dark:bg-violet-900/20",
    icon: "text-violet-600 dark:text-violet-400",
  },
  brand: {
    bg: "bg-brand-50 dark:bg-brand-900/20",
    icon: "text-brand-600 dark:text-brand-400",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-900/20",
    icon: "text-green-600 dark:text-green-400",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    icon: "text-amber-600 dark:text-amber-400",
  },
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [platformStats, setPlatformStats] = useState({
    total_requests: 0,
    total_api_keys: 0,
    total_domains: 0,
  });
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalPayments: 0,
    totalRevenue: 0,
  });

  async function loadStats() {
    try {
      setLoading(true);
      setError("");
      const [analyticsRes, domainsRes, overviewRes] = await Promise.all([
        api.get("/analytics/overview"),
        api.get("/admin/domains/count"),
        api.get("/admin/overview"),
      ]);
      setPlatformStats({
        total_requests: analyticsRes.data.total_requests || 0,
        total_api_keys: analyticsRes.data.total_api_keys || 0,
        total_domains: domainsRes.data.total_domains || 0,
      });
      setAdminStats(overviewRes.data);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, "Unable to load admin stats."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  const adminCards = [
    {
      title: "Manage Users",
      description: "View users, grant credits, suspend, or delete accounts.",
      icon: Users,
      to: "/admin/users",
      color: "violet",
    },
    {
      title: "Revenue",
      description: "Track payments, monthly earnings, and trends.",
      icon: Wallet,
      to: "/admin/revenue",
      color: "green",
    },
    {
      title: "Admin Domains",
      description: "Manage disposable and blocked email domains.",
      icon: Shield,
      to: "/admin-domains",
      color: "brand",
    },
    {
      title: "Platform Analytics",
      description: "View analytics across all users and API keys.",
      icon: BarChart2,
      to: "/admin/analytics",
      color: "amber",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="page-title">Admin Dashboard</h2>
            <p className="muted mt-0.5">Overview and platform management tools</p>
          </div>
          <button onClick={loadStats} className="btn-secondary">
            <RefreshCw className="w-4 h-4" />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                title="Total Users"
                value={adminStats.totalUsers?.toLocaleString()}
                icon={Users}
                color="violet"
                subtitle="Registered accounts"
              />
              <StatCard
                title="Total Payments"
                value={adminStats.totalPayments?.toLocaleString()}
                icon={CreditCard}
                color="brand"
                subtitle="Subscription transactions"
              />
              <StatCard
                title="Total Revenue"
                value={`₹${adminStats.totalRevenue?.toLocaleString()}`}
                icon={Wallet}
                color="green"
                subtitle="Lifetime revenue"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Requests"
                value={platformStats.total_requests.toLocaleString()}
                icon={Activity}
                color="brand"
                subtitle="All time platform API calls"
              />
              <StatCard
                title="Total API Keys"
                value={platformStats.total_api_keys.toLocaleString()}
                icon={Key}
                color="violet"
                subtitle="Across all users"
              />
              <StatCard
                title="Total Domains"
                value={platformStats.total_domains.toLocaleString()}
                icon={Globe}
                color="green"
                subtitle="In disposable domain list"
              />
              <StatCard
                title="Admin Tools"
                value="4"
                icon={Users}
                color="amber"
                subtitle="Available actions"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {adminCards.map(({ title, description, icon: Icon, to, color }) => {
                const c = cardColors[color];
                return (
                  <Link
                    key={title}
                    to={to}
                    className="card p-5 hover:border-brand-300 dark:hover:border-brand-700 transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg ${c.bg}`}>
                          <Icon className={`w-5 h-5 ${c.icon}`} />
                        </div>
                        <div>
                          <h3 className="section-title">{title}</h3>
                          <p className="muted text-sm">{description}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}