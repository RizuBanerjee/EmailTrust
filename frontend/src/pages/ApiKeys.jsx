import { useEffect, useState } from "react";
import api from "../api/api";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import Modal from "../components/ui/Modal.jsx";
import Badge from "../components/ui/Badge.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import {
  Plus,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Key,
  Search,
  Check,
} from "lucide-react";

function KeyCell({ apiKey }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied]   = useState(false);

  function copy() {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const masked = apiKey ? `${apiKey.slice(0, 8)}${"•".repeat(Math.max(0, apiKey.length - 12))}${apiKey.slice(-4)}` : "";

  return (
    <div className="flex items-center gap-2">
      <code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
        {visible ? apiKey : masked}
      </code>
      <button
        onClick={() => setVisible((v) => !v)}
        className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        title={visible ? "Hide key" : "Show key"}
      >
        {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
      <button
        onClick={copy}
        className="p-1 rounded text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        title="Copy key"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

export default function ApiKeys() {
  const [user, setUser]               = useState(null);
  const [keys, setKeys]               = useState([]);
  const [search, setSearch]           = useState("");
  const [loading, setLoading]         = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [regenModal, setRegenModal]   = useState({ open: false, id: null });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { initialize(); }, []);

  async function initialize() {
    try {
      setLoading(true);
      const authResponse = await api.get("/auth/me");
      setUser(authResponse.data);
      await loadKeys(authResponse.data.id);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function loadKeys(userId) {
    const response = await api.get(`/api-keys/user/${userId}`);
    setKeys(response.data);
  }

  async function createKey() {
    if (!user) return;
    try {
      setActionLoading(true);
      await api.post(`/api-keys/${user.id}`);
      await loadKeys(user.id);
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteKey() {
    if (!deleteModal.id) return;
    try {
      setActionLoading(true);
      await api.delete(`/api-keys/${deleteModal.id}`);
      setDeleteModal({ open: false, id: null });
      await loadKeys(user.id);
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  }

  async function regenerateKey() {
    if (!regenModal.id) return;
    try {
      setActionLoading(true);
      await api.post(`/api-keys/regenerate/${regenModal.id}`);
      setRegenModal({ open: false, id: null });
      await loadKeys(user.id);
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  }

  const filtered = keys.filter((k) =>
    search ? k.api_key?.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="page-title">API Keys</h2>
            <p className="muted mt-0.5">{keys.length} key{keys.length !== 1 ? "s" : ""} total</p>
          </div>
          <button onClick={createKey} disabled={actionLoading} className="btn-primary">
            <Plus className="w-4 h-4" />
            Create API Key
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="input-field pl-9"
            placeholder="Search API keys…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Spinner />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Key}
              title="No API keys yet"
              description="Create your first API key to start verifying emails."
              action={
                <button onClick={createKey} className="btn-primary">
                  <Plus className="w-4 h-4" />
                  Create API Key
                </button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header">API Key</th>
                    <th className="table-header">Usage</th>
                    <th className="table-header">Limit</th>
                    <th className="table-header">Status</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((key) => {
                    const pct = key.requests_limit > 0
                      ? Math.round((key.requests_used / key.requests_limit) * 100)
                      : 0;
                    return (
                      <tr key={key.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="table-cell">
                          <KeyCell apiKey={key.api_key} />
                        </td>
                        <td className="table-cell">
                          <div>
                            <span className="font-mono text-sm">{key.requests_used?.toLocaleString()}</span>
                            <div className="w-28 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mt-1.5">
                              <div
                                className={`h-1 rounded-full ${pct > 80 ? "bg-red-500" : "bg-brand-500"}`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="table-cell font-mono text-sm">
                          {key.requests_limit?.toLocaleString()}
                        </td>
                        <td className="table-cell">
                          <Badge variant={pct >= 100 ? "danger" : pct > 80 ? "warning" : "success"}>
                            {pct >= 100 ? "Exhausted" : pct > 80 ? "Near limit" : "Active"}
                          </Badge>
                        </td>
                        <td className="table-cell text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setRegenModal({ open: true, id: key.id })}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 dark:hover:text-brand-400 transition-colors"
                              title="Regenerate key"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteModal({ open: true, id: key.id })}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                              title="Delete key"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete modal */}
      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        title="Delete API Key"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setDeleteModal({ open: false, id: null })}>
              Cancel
            </button>
            <button className="btn-danger" onClick={deleteKey} disabled={actionLoading}>
              {actionLoading ? "Deleting…" : "Delete Key"}
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Are you sure you want to delete this API key? This action cannot be undone and all associated usage logs will remain.
        </p>
      </Modal>

      {/* Regenerate modal */}
      <Modal
        open={regenModal.open}
        onClose={() => setRegenModal({ open: false, id: null })}
        title="Regenerate API Key"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setRegenModal({ open: false, id: null })}>
              Cancel
            </button>
            <button className="btn-primary" onClick={regenerateKey} disabled={actionLoading}>
              {actionLoading ? "Regenerating…" : "Regenerate Key"}
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Regenerating will create a new API key value. Any application using the old key will stop working immediately. Make sure to update your integrations.
        </p>
      </Modal>
    </DashboardLayout>
  );
}
