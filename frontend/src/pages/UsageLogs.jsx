import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import Badge from "../components/ui/Badge.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import {
  FileText,
  Search,
  Download,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

const PAGE_SIZE = 25;

const endpointLabel = {
  "/verify-email":  "Email Verify",
  "/verify-batch":  "Batch Verify",
};

const endpointBadge = {
  "/verify-email": "brand",
  "/verify-batch": "violet",
};

export default function UsageLogs() {
  const [apiKeys, setApiKeys]           = useState([]);
  const [selectedKey, setSelectedKey]   = useState("");
  const [logs, setLogs]                 = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [search, setSearch]             = useState("");
  const [endpointFilter, setEndpointFilter] = useState("ALL");
  const [user, setUser]                 = useState(null);
  const [page, setPage]                 = useState(1);

  async function loadApiKeys() {
    try {
      setLoading(true);
      setError("");
      const me       = await api.get("/auth/me");
      setUser(me.data);
      const response = await api.get(`/api-keys/user/${me.data.id}`);
      setApiKeys(response.data);
      if (response.data.length > 0) {
        setSelectedKey(response.data[0].api_key);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to fetch user information or API keys.");
    } finally {
      setLoading(false);
    }
  }

  async function loadLogs(apiKey) {
    if (!apiKey) return;
    try {
      setLoading(true);
      const response = await api.get(`/usage/${apiKey}`);
      setLogs(response.data);
      setPage(1);
    } catch (err) {
      console.error(err);
      setError("Unable to fetch usage logs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadApiKeys(); }, []);
  useEffect(() => { if (selectedKey) loadLogs(selectedKey); }, [selectedKey]);

  const filteredLogs = useMemo(() => {
    let data = [...logs].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (endpointFilter !== "ALL") {
      data = data.filter((log) => log.endpoint === endpointFilter);
    }
    if (search.trim()) {
      data = data.filter((log) =>
        log.email_checked?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return data;
  }, [logs, search, endpointFilter]);

  const totalPages  = Math.ceil(filteredLogs.length / PAGE_SIZE);
  const paginated   = filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function exportCSV() {
    if (filteredLogs.length === 0) return;
    const headers = ["ID", "Email", "Endpoint", "Created At"];
    const rows    = filteredLogs.map((log) => [
      log.id,
      log.email_checked,
      log.endpoint,
      log.created_at,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "usage_logs.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="page-title">Usage Logs</h2>
            <p className="muted mt-0.5">
              {user ? `Viewing logs for ${user.email}` : "API request history"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => loadLogs(selectedKey)}
              disabled={loading || !selectedKey}
              className="btn-secondary"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button onClick={exportCSV} disabled={filteredLogs.length === 0} className="btn-secondary">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* API Key selector */}
            <div className="flex-1">
              <label className="label text-xs mb-1">API Key</label>
              <select
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                className="input-field"
              >
                {apiKeys.map((key) => (
                  <option key={key.id} value={key.api_key}>
                    {key.api_key.slice(0, 8)}…{key.api_key.slice(-6)}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <label className="label text-xs mb-1">Search Email</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className="input-field pl-9"
                  placeholder="Filter by email…"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
            </div>

            {/* Endpoint filter */}
            <div className="sm:w-48">
              <label className="label text-xs mb-1">
                <Filter className="w-3 h-3 inline mr-1" />
                Endpoint
              </label>
              <select
                value={endpointFilter}
                onChange={(e) => { setEndpointFilter(e.target.value); setPage(1); }}
                className="input-field"
              >
                <option value="ALL">All Endpoints</option>
                <option value="/verify-email">Email Verify</option>
                <option value="/verify-batch">Batch Verify</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {filteredLogs.length.toLocaleString()}
            </span>{" "}
            total requests
          </span>
          {search && (
            <Badge variant="default">Filtered</Badge>
          )}
          {endpointFilter !== "ALL" && (
            <Badge variant="brand">{endpointLabel[endpointFilter] || endpointFilter}</Badge>
          )}
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Spinner />
            </div>
          ) : paginated.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No usage logs found"
              description="Perform an email verification using one of your API keys to generate logs."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="table-header w-16">ID</th>
                      <th className="table-header">Email</th>
                      <th className="table-header">Endpoint</th>
                      <th className="table-header">Date</th>
                      <th className="table-header">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((log) => {
                      const date = new Date(log.created_at);
                      return (
                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="table-cell tabular-nums text-slate-400 text-xs">{log.id}</td>
                          <td className="table-cell font-mono text-xs">{log.email_checked}</td>
                          <td className="table-cell">
                            <Badge variant={endpointBadge[log.endpoint] || "default"}>
                              {endpointLabel[log.endpoint] || log.endpoint}
                            </Badge>
                          </td>
                          <td className="table-cell text-slate-500 text-xs tabular-nums">
                            {date.toLocaleDateString()}
                          </td>
                          <td className="table-cell text-slate-500 text-xs tabular-nums">
                            {date.toLocaleTimeString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pg = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                      return (
                        <button
                          key={pg}
                          onClick={() => setPage(pg)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            pg === page
                              ? "bg-brand-600 text-white"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          {pg}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
