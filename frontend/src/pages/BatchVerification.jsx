import { useEffect, useState } from "react";
import api from "../api/api";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import Badge from "../components/ui/Badge.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import {
  Layers,
  Key,
  Play,
  CheckCircle,
  XCircle,
  AlertTriangle,
  List,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";

function getRiskBadge(result) {
  const isTemp = result?.is_temporary;
  const rec = result?.recommendation;
  const trust = result?.trust_score ?? 50;

  if (isTemp) return <Badge variant="danger">Disposable</Badge>;
  if (rec === "ALLOW" || trust >= 70) return <Badge variant="success">Safe</Badge>;
  if (rec === "REVIEW" || trust >= 40) return <Badge variant="warning">Risky</Badge>;
  return <Badge variant="danger">Block</Badge>;
}

export default function BatchVerification() {
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem("emailtrust_batch_api_key") || "");
  const [emails, setEmails] = useState(() => sessionStorage.getItem("emailtrust_batch_emails") || "");
  const [results, setResults] = useState(() => {
    try {
      const stored = sessionStorage.getItem("emailtrust_batch_results");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    sessionStorage.setItem("emailtrust_batch_api_key", apiKey);
  }, [apiKey]);

  useEffect(() => {
    sessionStorage.setItem("emailtrust_batch_emails", emails);
  }, [emails]);

  useEffect(() => {
    if (results.length > 0) {
      sessionStorage.setItem("emailtrust_batch_results", JSON.stringify(results));
    } else {
      sessionStorage.removeItem("emailtrust_batch_results");
    }
  }, [results]);

  async function verifyBatch() {
    if (!apiKey.trim()) {
      setError("Please enter your API key.");
      return;
    }
    const emailArray = emails.split("\n").map((e) => e.trim()).filter(Boolean);
    if (emailArray.length === 0) {
      setError("Please enter at least one email address.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResults([]);
      const response = await api.post(
        "/verify-batch/",
        { emails: emailArray },
        { headers: { Authorization: apiKey } }
      );
      setResults(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Batch verification failed. Check your API key and try again.");
    } finally {
      setLoading(false);
    }
  }

  const total      = results.length;
  const safe       = results.filter((r) => !r.is_temporary && (r.recommendation === "ALLOW" || (r.trust_score ?? 50) >= 70)).length;
  const disposable = results.filter((r) => r.is_temporary).length;
  const risky      = results.filter((r) => !r.is_temporary && (r.recommendation === "REVIEW" || ((r.trust_score ?? 50) < 70 && (r.trust_score ?? 50) >= 40))).length;
  const blocked    = results.filter((r) => !r.is_temporary && (r.recommendation === "BLOCK" || (r.trust_score ?? 50) < 40)).length;

  const emailCount = emails.split("\n").filter((e) => e.trim()).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="page-title">Batch Verification</h2>
          <p className="muted mt-0.5">Verify multiple email addresses at once</p>
        </div>

        <div className="card p-6">
          <h3 className="section-title mb-4">Batch Console</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="label">
                  <Key className="w-3.5 h-3.5 inline mr-1.5 mb-0.5" />
                  API Key
                </label>
                <input
                  className="input-field"
                  placeholder="Enter your API key…"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  type="password"
                  autoComplete="off"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="label mb-0">
                    <List className="w-3.5 h-3.5 inline mr-1.5 mb-0.5" />
                    Email Addresses
                  </label>
                  <span className="text-xs text-slate-400">{emailCount} email{emailCount !== 1 ? "s" : ""}</span>
                </div>
                <textarea
                  className="input-field h-48 resize-none font-mono text-xs leading-relaxed"
                  placeholder={"test@example.com\nuser@domain.com\nanother@gmail.com"}
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                />
                <p className="text-xs text-slate-400 mt-1.5">
                  <Info className="w-3 h-3 inline mr-1" />
                  One email per line. CSV paste supported.
                </p>
              </div>

              <button
                onClick={verifyBatch}
                disabled={loading}
                className="btn-primary w-full justify-center"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    Verifying {emailCount} emails…
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Verify Batch
                  </>
                )}
              </button>
            </div>

            <div>
              <label className="label">Summary</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total Checked", value: total, icon: Layers, color: "text-brand-600 dark:text-brand-400", bg: "bg-brand-50 dark:bg-brand-900/20" },
                  { label: "Safe", value: safe, icon: CheckCircle, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20" },
                  { label: "Disposable", value: disposable, icon: XCircle, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" },
                  { label: "Risky", value: risky, icon: AlertTriangle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className={`p-4 rounded-xl ${bg} flex flex-col gap-1`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                    <p className={`text-2xl font-bold tabular-nums ${color}`}>{results.length > 0 ? value : "—"}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="card overflow-hidden"
          >
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="section-title text-sm">Results — {total} emails</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header">#</th>
                    <th className="table-header">Email</th>
                    <th className="table-header">Trust Score</th>
                    <th className="table-header">Risk Score</th>
                    <th className="table-header">Provider</th>
                    <th className="table-header">Temporary</th>
                    <th className="table-header">Recommendation</th>
                    <th className="table-header">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="table-cell text-slate-400 tabular-nums">{i + 1}</td>
                      <td className="table-cell font-mono text-xs">{r.email}</td>
                      <td className="table-cell tabular-nums font-medium">
                        <span className={r.trust_score >= 70 ? "text-green-600 dark:text-green-400" : r.trust_score >= 40 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}>
                          {r.trust_score ?? "—"}
                        </span>
                      </td>
                      <td className="table-cell tabular-nums font-medium">
                        <span className={r.risk_score <= 30 ? "text-green-600 dark:text-green-400" : r.risk_score <= 60 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}>
                          {r.risk_score ?? "—"}
                        </span>
                      </td>
                      <td className="table-cell">{r.provider ?? "—"}</td>
                      <td className="table-cell">
                        {r.is_temporary ? (
                          <span className="flex items-center gap-1 text-red-600 dark:text-red-400 text-sm">
                            <XCircle className="w-3.5 h-3.5" /> Yes
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                            <CheckCircle className="w-3.5 h-3.5" /> No
                          </span>
                        )}
                      </td>
                      <td className="table-cell">
                        <Badge variant={
                          r.recommendation === "ALLOW" ? "success" :
                          r.recommendation === "REVIEW" ? "warning" : "danger"
                        }>
                          {r.recommendation ?? "—"}
                        </Badge>
                      </td>
                      <td className="table-cell">{getRiskBadge(r)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}