import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import Badge from "../components/ui/Badge.jsx";
import Modal from "../components/ui/Modal.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { Search, Users, Gift, Ban, Trash2, RefreshCw, AlertTriangle } from "lucide-react";
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

const planColors = {
  FREE: "default",
  STARTER: "info",
  PRO: "brand",
  ENTERPRISE: "success",
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [deleteUser, setDeleteUser] = useState(null);
  const [grantUser, setGrantUser] = useState(null);
  const [credits, setCredits] = useState("");
  const [suspendUser, setSuspendUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/admin/users");
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, "Unable to load users."));
    } finally {
      setLoading(false);
    }
  }

  async function grantCredits() {
    if (!grantUser || !credits || Number(credits) <= 0) return;
    try {
      setActionLoading(true);
      setError("");
      const res = await api.post(`/admin/users/${grantUser.id}/credits`, {
        credits: Number(credits),
      });
      setUsers((prev) => prev.map((u) => (u.id === res.data.user.id ? res.data.user : u)));
      setGrantUser(null);
      setCredits("");
    } catch (err) {
      setError(getErrorMessage(err, "Failed to grant credits."));
    } finally {
      setActionLoading(false);
    }
  }

  async function toggleSuspend(user) {
    try {
      setActionLoading(true);
      setError("");
      const res = await api.post(`/admin/users/${user.id}/suspend`);
      setUsers((prev) => prev.map((u) => (u.id === res.data.user.id ? res.data.user : u)));
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update suspension status."));
    } finally {
      setActionLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deleteUser) return;
    try {
      setActionLoading(true);
      setError("");
      await api.delete(`/admin/users/${deleteUser.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
      setDeleteUser(null);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to delete user."));
    } finally {
      setActionLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        (u.plan || "").toLowerCase().includes(q) ||
        (u.id || "").toLowerCase().includes(q)
    );
  }, [users, query]);

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
            <h2 className="page-title">Manage Users</h2>
            <p className="muted mt-0.5">View, grant credits, suspend, and delete users</p>
          </div>
          <button onClick={loadUsers} className="btn-secondary">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="card p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by email, plan, or ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users found"
            description={query ? "Try a different search term." : "No users in the database yet."}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="card overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header">User</th>
                    <th className="table-header">Plan</th>
                    <th className="table-header">Credits</th>
                    <th className="table-header">Admin</th>
                    <th className="table-header">Joined</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="table-cell">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {user.email}
                          </span>
                          <span className="text-xs font-mono text-slate-500">{user.id}</span>
                          {user.is_suspended && (
                            <div className="mt-1">
                              <Badge variant="danger">Suspended</Badge>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="table-cell">
                        <Badge variant={planColors[user.plan] || "default"}>{user.plan}</Badge>
                      </td>
                      <td className="table-cell tabular-nums">
                        {user.credits_remaining?.toLocaleString()}
                      </td>
                      <td className="table-cell">
                        <Badge variant={user.is_admin ? "success" : "default"}>
                          {user.is_admin ? "Admin" : "User"}
                        </Badge>
                      </td>
                      <td className="table-cell text-slate-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => setGrantUser(user)}
                            disabled={actionLoading}
                            className="text-emerald-500 hover:text-emerald-600 transition-colors"
                            title="Grant credits"
                          >
                            <Gift className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setSuspendUser(user)}
                            disabled={actionLoading}
                            className="text-amber-500 hover:text-amber-600 transition-colors"
                            title={user.is_suspended ? "Reactivate user" : "Suspend user"}
                          >
                            <Ban className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setDeleteUser(user)}
                            disabled={actionLoading}
                            className="text-red-500 hover:text-red-600 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        <Modal
          open={!!deleteUser}
          onClose={() => setDeleteUser(null)}
          title="Delete user"
          footer={
            <>
              <button className="btn-secondary" onClick={() => setDeleteUser(null)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={confirmDelete} disabled={actionLoading}>
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </>
          }
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Are you sure you want to delete <strong>{deleteUser?.email}</strong>? This will also remove their subscription/payment history.
            </p>
          </div>
        </Modal>

        <Modal
          open={!!grantUser}
          onClose={() => {
            setGrantUser(null);
            setCredits("");
          }}
          title="Grant credits"
          footer={
            <>
              <button
                className="btn-secondary"
                onClick={() => {
                  setGrantUser(null);
                  setCredits("");
                }}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={grantCredits}
                disabled={actionLoading || !credits || Number(credits) <= 0}
              >
                {actionLoading ? "Granting..." : "Grant"}
              </button>
            </>
          }
        >
          <div className="space-y-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Grant credits to <strong>{grantUser?.email}</strong>
            </p>
            <input
              type="number"
              min="1"
              placeholder="Amount to add"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </Modal>

        <Modal
          open={!!suspendUser}
          onClose={() => setSuspendUser(null)}
          title={suspendUser?.is_suspended ? "Reactivate user" : "Suspend user"}
          footer={
            <>
              <button className="btn-secondary" onClick={() => setSuspendUser(null)}>
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={() => {
                  toggleSuspend(suspendUser);
                  setSuspendUser(null);
                }}
                disabled={actionLoading}
              >
                {actionLoading ? "Saving..." : suspendUser?.is_suspended ? "Reactivate" : "Suspend"}
              </button>
            </>
          }
        >
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Are you sure you want to {suspendUser?.is_suspended ? "reactivate" : "suspend"}{" "}
            <strong>{suspendUser?.email}</strong>?
          </p>
        </Modal>
      </div>
    </DashboardLayout>
  );
}