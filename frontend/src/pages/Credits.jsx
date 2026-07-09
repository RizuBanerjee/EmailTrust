import { useEffect, useState } from "react";
import api from "../api/api";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import Badge from "../components/ui/Badge.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import { CreditCard, RefreshCw, Zap, Package } from "lucide-react";
import { motion } from "framer-motion";

const planColors = {
  FREE:       "default",
  STARTER:    "info",
  PRO:        "brand",
  ENTERPRISE: "success",
};

const planLimits = {
  FREE:       1000,
  STARTER:    10000,
  PRO:        50000,
  ENTERPRISE: 500000,
};

export default function Credits() {
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [credits, setCredits] = useState(null);

  const email = localStorage.getItem("user_email");

  async function loadCredits() {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(`/credits/${email}`);
      setCredits(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Unable to load credits.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCredits(); }, []);

  const remaining = credits?.credits_remaining ?? 0;
  const plan      = credits?.plan ?? "FREE";
  // Prefer the backend's own total/limit if it provides one; otherwise fall back to the static mapping.
  const limit     = credits?.total_credits ?? credits?.plan_limit ?? credits?.total ?? planLimits[plan] ?? 1000;
  const used      = credits?.credits_used ?? Math.max(0, limit - remaining);
  const pct       = limit > 0 ? Math.min(100, Math.round((remaining / limit) * 100)) : 0;

  const barColor =
    pct > 60  ? "bg-green-500" :
    pct > 25  ? "bg-amber-500" :
    "bg-red-500";

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="page-title">Credits</h2>
            <p className="muted mt-0.5">Your API credit balance and plan status</p>
          </div>
          <button onClick={loadCredits} disabled={loading} className="btn-secondary">
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
          <div className="flex items-center justify-center h-48">
            <Spinner size="lg" />
          </div>
        ) : credits && credits.exists ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Credit balance card */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Available Credits</p>
                  <p className="text-5xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                    {remaining.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    of {limit.toLocaleString()} total
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-900/20">
                  <CreditCard className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{used.toLocaleString()} used</span>
                  <span>{pct}% remaining</span>
                </div>
                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${barColor}`}
                  />
                </div>
                {pct <= 25 && (
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                    Running low — consider upgrading your plan.
                  </p>
                )}
              </div>
            </div>

            {/* Plan status card */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-lg bg-violet-50 dark:bg-violet-900/20">
                  <Package className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="section-title">Plan Status</h3>
                  <p className="muted">Your current subscription tier</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Email", value: credits.email },
                  {
                    label: "Current Plan",
                    value: (
                      <div className="flex items-center gap-2">
                        <Badge variant={planColors[plan] || "default"}>{plan}</Badge>
                      </div>
                    ),
                  },
                  { label: "Credits Remaining", value: remaining.toLocaleString() },
                  { label: "Plan Limit", value: limit.toLocaleString() },
                  {
                    label: "Status",
                    value: (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <Badge variant="success">Active</Badge>
                      </div>
                    ),
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick tip */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800">
              <Zap className="w-5 h-5 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-brand-900 dark:text-brand-100">Need more credits?</p>
                <p className="text-sm text-brand-700 dark:text-brand-300 mt-0.5">
                  Upgrade your plan in the Subscription page to unlock higher limits and more features.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          !loading && !error && (
            <div className="card p-8 text-center">
              <CreditCard className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">No credit information found for this account.</p>
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
}
