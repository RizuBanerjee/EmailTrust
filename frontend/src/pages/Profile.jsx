import { useEffect, useState } from "react";
import api from "../api/api";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import Badge from "../components/ui/Badge.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import {
  User,
  Mail,
  Hash,
  CreditCard,
  Package,
  Key,
  Activity,
  CheckCircle,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion } from "framer-motion";

const planColors = {
  FREE:       "default",
  STARTER:    "info",
  PRO:        "brand",
  ENTERPRISE: "success",
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={copy}
      className="p-1 rounded text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
      title="Copy"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function MaskedKey({ apiKey }) {
  const [visible, setVisible] = useState(false);
  const masked = `${apiKey.slice(0, 8)}${"•".repeat(12)}${apiKey.slice(-4)}`;

  return (
    <div className="flex items-center gap-1.5">
      <code className="text-xs font-mono text-slate-600 dark:text-slate-400">
        {visible ? apiKey : masked}
      </code>
      <button
        onClick={() => setVisible((v) => !v)}
        className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
      >
        {visible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
      </button>
      <CopyButton text={apiKey} />
    </div>
  );
}

export default function Profile() {
  const [profile, setProfile]   = useState(null);
  const [apiKeys, setApiKeys]   = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]   = useState(true);

  const storedPhoto = localStorage.getItem("user_photo") || "";

  async function loadProfile() {
    try {
      setLoading(true);
      const me = await api.get("/auth/me");
      setProfile(me.data);

      const [apiKeysRes, analyticsRes] = await Promise.all([
        api.get(`/api-keys/user/${me.data.id}`),
        api.get("/analytics/overview"),
      ]);
      setApiKeys(apiKeysRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProfile(); }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  const initials = profile?.email
    ? profile.email.slice(0, 2).toUpperCase()
    : "ET";

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="page-title">Profile</h2>
            <p className="muted mt-0.5">Your account information</p>
          </div>
          <button onClick={loadProfile} className="btn-secondary">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          {/* Avatar + name */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            {storedPhoto ? (
              <img
                src={storedPhoto}
                alt={profile?.email}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-slate-100 dark:ring-slate-800"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-brand-600 dark:text-brand-400">{initials}</span>
              </div>
            )}
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {localStorage.getItem("user_name") || profile?.email?.split("@")[0]}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{profile?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="success">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 inline-block" />
                  Active
                </Badge>
                <Badge variant={planColors[profile?.plan] || "default"}>{profile?.plan}</Badge>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            {[
              {
                label: "User ID",
                icon: Hash,
                value: profile?.id,
                copy: true,
              },
              {
                label: "Email Address",
                icon: Mail,
                value: profile?.email,
                copy: true,
              },
              {
                label: "Current Plan",
                icon: Package,
                value: <Badge variant={planColors[profile?.plan] || "default"}>{profile?.plan}</Badge>,
              },
              {
                label: "Credits Remaining",
                icon: CreditCard,
                value: profile?.credits_remaining?.toLocaleString(),
              },
              {
                label: "API Keys",
                icon: Key,
                value: apiKeys.length,
              },
              {
                label: "Total Requests",
                icon: Activity,
                value: analytics?.total_requests?.toLocaleString() ?? 0,
              },
              {
                label: "Account Status",
                icon: CheckCircle,
                value: (
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-green-600 dark:text-green-400 font-semibold text-sm">Active</span>
                  </div>
                ),
              },
            ].map(({ label, icon: Icon, value, copy }) => (
              <div key={label} className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100 text-right">
                    {value ?? "—"}
                  </span>
                  {copy && value && <CopyButton text={String(value)} />}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* API Keys card */}
        {apiKeys.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card overflow-hidden"
          >
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="section-title text-sm flex items-center gap-2">
                <Key className="w-4 h-4 text-slate-400" />
                API Keys
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header">Key</th>
                    <th className="table-header text-right">Used</th>
                    <th className="table-header text-right">Limit</th>
                    <th className="table-header text-right">Usage</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((key) => {
                    const pct = key.requests_limit > 0
                      ? Math.round((key.requests_used / key.requests_limit) * 100)
                      : 0;
                    return (
                      <tr key={key.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="table-cell">
                          <MaskedKey apiKey={key.api_key} />
                        </td>
                        <td className="table-cell text-right tabular-nums text-sm">
                          {key.requests_used?.toLocaleString()}
                        </td>
                        <td className="table-cell text-right tabular-nums text-sm">
                          {key.requests_limit?.toLocaleString()}
                        </td>
                        <td className="table-cell text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${pct > 80 ? "bg-red-500" : "bg-brand-500"}`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-500 tabular-nums w-8 text-right">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
