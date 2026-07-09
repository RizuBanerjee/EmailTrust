import { useEffect, useState } from "react";
import api from "../api/api";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import Badge from "../components/ui/Badge.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import {
  Mail,
  Key,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { motion } from "framer-motion";

function ScoreRing({ value, label, color }) {
  const colorMap = {
    green:  { ring: "text-green-500",  bg: "bg-green-50 dark:bg-green-900/20" },
    yellow: { ring: "text-amber-500",  bg: "bg-amber-50 dark:bg-amber-900/20" },
    red:    { ring: "text-red-500",    bg: "bg-red-50 dark:bg-red-900/20" },
    slate:  { ring: "text-slate-400",  bg: "bg-slate-50 dark:bg-slate-800" },
  };
  const c = colorMap[color] || colorMap.slate;

  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-xl ${c.bg}`}>
      <p className={`text-3xl font-bold tabular-nums ${c.ring}`}>{value ?? "—"}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{label}</p>
    </div>
  );
}

function ResultBadge({ value }) {
  if (value === true || value === "true")  return <Badge variant="danger">Yes</Badge>;
  if (value === false || value === "false") return <Badge variant="success">No</Badge>;
  if (typeof value === "string") return <Badge variant="default">{value}</Badge>;
  return <Badge variant="default">{String(value)}</Badge>;
}

function getRecommendationStyle(result) {
  if (!result) return null;
  const rec = result.recommendation;
  if (rec === "ALLOW" || (result.trust_score ?? 0) >= 70)
    return { icon: ShieldCheck, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800", text: "Safe to Accept", badge: "success" };
  if (rec === "REVIEW" || (result.trust_score ?? 0) >= 40)
    return { icon: ShieldAlert, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800", text: "Review Recommended", badge: "warning" };
  return { icon: ShieldX, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800", text: "Block — High Risk", badge: "danger" };
}

export default function EmailVerification() {
  const [email, setEmail] = useState(() => sessionStorage.getItem("emailtrust_email") || "");
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem("emailtrust_api_key") || "");
  const [result, setResult] = useState(() => {
    try {
      const stored = sessionStorage.getItem("emailtrust_email_result");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    sessionStorage.setItem("emailtrust_email", email);
  }, [email]);

  useEffect(() => {
    sessionStorage.setItem("emailtrust_api_key", apiKey);
  }, [apiKey]);

  useEffect(() => {
    if (result) {
      sessionStorage.setItem("emailtrust_email_result", JSON.stringify(result));
    } else {
      sessionStorage.removeItem("emailtrust_email_result");
    }
  }, [result]);

  async function verifyEmail() {
    if (!email.trim() || !apiKey.trim()) {
      setError("Please provide both an API key and an email address.");
      return;
    }
    try {
      setLoading(true);
      setError("");
      setResult(null);
      const response = await api.post(
        "/verify-email/",
        { email },
        { headers: { Authorization: apiKey } }
      );
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Verification failed. Check your API key and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") verifyEmail();
  }

  const rec = getRecommendationStyle(result);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h2 className="page-title">Email Verification</h2>
          <p className="muted mt-0.5">Test email addresses against the API in real time</p>
        </div>

        <div className="card p-6">
          <h3 className="section-title mb-4">Verification Console</h3>

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
              <label className="label">
                <Mail className="w-3.5 h-3.5 inline mr-1.5 mb-0.5" />
                Email Address
              </label>
              <div className="flex gap-2">
                <input
                  className="input-field"
                  placeholder="test@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  type="email"
                  autoComplete="off"
                />
                <button
                  onClick={verifyEmail}
                  disabled={loading}
                  className="btn-primary flex-shrink-0"
                >
                  {loading ? (
                    <Spinner size="sm" />
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Verify
                    </>
                  )}
                </button>
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

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {rec && (
              <div className={`flex items-center gap-3 p-4 rounded-xl border ${rec.bg}`}>
                <rec.icon className={`w-6 h-6 ${rec.color} flex-shrink-0`} />
                <div>
                  <p className={`font-semibold ${rec.color}`}>{rec.text}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Based on trust score and risk analysis
                  </p>
                </div>
                <Badge variant={rec.badge} className="ml-auto">
                  Trust {result.trust_score ?? "—"}
                </Badge>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <ScoreRing
                value={result.trust_score}
                label="Trust Score"
                color={result.trust_score >= 70 ? "green" : result.trust_score >= 40 ? "yellow" : "red"}
              />
              <ScoreRing
                value={result.risk_score}
                label="Risk Score"
                color={result.risk_score <= 30 ? "green" : result.risk_score <= 60 ? "yellow" : "red"}
              />
              <ScoreRing value={result.provider} label="Provider" color="slate" />
              <ScoreRing
                value={result.is_temporary ? "Yes" : "No"}
                label="Temporary"
                color={result.is_temporary ? "red" : "green"}
              />
            </div>

            {result.checks && (
              <div className="card p-5">
                <h3 className="section-title text-sm mb-4">Verification Checks</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(result.checks).map(([key, value]) => {
                    const label = key
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase());
                    const positiveChecks = ["syntax", "mx_record"];
                    const isGood = positiveChecks.includes(key) ? value : !value;
                    return (
                      <div
                        key={key}
                        className={`flex items-center gap-2 p-2 rounded-lg ${
                          isGood
                            ? "bg-green-50 dark:bg-green-900/20"
                            : "bg-red-50 dark:bg-red-900/20"
                        }`}
                      >
                        {isGood ? (
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        )}
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="card overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="section-title text-sm">Full Result</h3>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {Object.entries(result)
                  .filter(([key]) => key !== "checks")
                  .map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between px-5 py-3">
                      <span className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                        {key.replace(/_/g, " ")}
                      </span>
                      <div className="text-right">
                        {typeof value === "boolean" ? (
                          value ? (
                            <span className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                              <XCircle className="w-3.5 h-3.5" /> Yes
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                              <CheckCircle className="w-3.5 h-3.5" /> No
                            </span>
                          )
                        ) : (
                          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {String(value)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}