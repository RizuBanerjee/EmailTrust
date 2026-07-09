import { useEffect, useRef, useState } from "react";
import api from "../api/api";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import Badge from "../components/ui/Badge.jsx";
import Modal from "../components/ui/Modal.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import {
  Shield,
  Search,
  Plus,
  Trash2,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Database,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDomains() {
  const fileInputRef = useRef(null);
  const [totalDomains, setTotalDomains] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [newDomain, setNewDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState({ open: false, domain: null });
  const [actionLoading, setActionLoading] = useState(false);

  async function loadCount() {
    try {
      const response = await api.get("/admin/domains/count");
      setTotalDomains(response.data.total_domains);
    } catch (err) {
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  }

  async function searchDomains(query = searchQuery) {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const response = await api.get(`/admin/domains/search/${query}`);
      setSearchResults(response.data);
    } catch (err) {
      console.error(err);
      setError("Unable to search domains.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearchKeyDown(e) {
    if (e.key === "Enter") searchDomains();
  }

  async function addDomain() {
    if (!newDomain.trim()) {
      setError("Please enter a domain.");
      return;
    }
    try {
      setActionLoading(true);
      setMessage("");
      setError("");
      await api.post("/admin/domains/", { domain: newDomain.trim() });
      setMessage(`Domain "${newDomain.trim()}" added successfully.`);
      setNewDomain("");
      loadCount();
      if (searchQuery) searchDomains();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Unable to add domain.");
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteDomain() {
    const domain = deleteModal.domain;
    if (!domain) return;
    try {
      setActionLoading(true);
      await api.delete(`/admin/domains/${domain}`);
      setMessage(`Domain "${domain}" deleted.`);
      setDeleteModal({ open: false, domain: null });
      loadCount();
      searchDomains();
    } catch (err) {
      console.error(err);
      setError("Unable to delete domain.");
    } finally {
      setActionLoading(false);
    }
  }

  function parseCsv(text) {
    const rows = text.split(/\r?\n/).filter((line) => line.trim());
    const domains = [];
    rows.forEach((row) => {
      row.split(",").forEach((cell) => {
        const domain = cell.trim().toLowerCase();
        if (domain && !domains.includes(domain)) {
          domains.push(domain);
        }
      });
    });
    return domains;
  }

  async function importDomains(domains) {
    if (domains.length === 0) {
      setMessage("No valid domains found in the file.");
      return;
    }
    try {
      setActionLoading(true);
      setMessage("");
      setError("");
      const response = await api.post("/admin/domains/import", { domains });
      setMessage(
        `${response.data.inserted} domains imported. ${response.data.skipped} already existed.`
      );
      loadCount();
      if (searchQuery) searchDomains();
    } catch (err) {
      console.error(err);
      setError("Import failed.");
    } finally {
      setActionLoading(false);
    }
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result || "";
      const domains = parseCsv(text);
      importDomains(domains);
    };
    reader.readAsText(file);
    e.target.value = ""; // allow re-importing the same file
  }

  useEffect(() => {
    loadCount();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="page-title">Admin Domains</h2>
            <p className="muted mt-0.5">Manage the disposable email domain blocklist</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                loadCount();
                if (searchQuery) searchDomains();
              }}
              className="btn-secondary"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button onClick={handleImportClick} disabled={actionLoading} className="btn-secondary">
              <Upload className="w-4 h-4" />
              Import CSV
            </button>
            <input
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {message && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-sm text-green-700 dark:text-green-400">{message}</p>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5 flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
            <Database className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Total Disposable Domains
            </p>
            {initialLoading ? (
              <Spinner size="sm" className="mt-1" />
            ) : (
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {totalDomains.toLocaleString()}
              </p>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="section-title mb-3">Search Domain</h3>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  className="input-field pl-9"
                  placeholder="gmail, yahoo, tempmail…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
              </div>
              <button onClick={() => searchDomains()} disabled={loading} className="btn-primary flex-shrink-0">
                {loading ? <Spinner size="sm" /> : <Search className="w-4 h-4" />}
                Search
              </button>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="section-title mb-3">Add Disposable Domain</h3>
            <div className="flex gap-2">
              <input
                className="input-field flex-1"
                placeholder="example.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addDomain()}
              />
              <button onClick={addDomain} disabled={actionLoading} className="btn-primary flex-shrink-0">
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="section-title text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" />
              Search Results
            </h3>
            {searchResults.length > 0 && (
              <Badge variant="default">{searchResults.length} found</Badge>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Spinner />
            </div>
          ) : searchResults.length === 0 ? (
            <EmptyState
              icon={Shield}
              title={searchQuery ? "No domains found" : "Search for domains"}
              description={
                searchQuery
                  ? `No disposable domains matching "${searchQuery}" found in the database.`
                  : "Enter a domain name above to search the blocklist."
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header w-12">#</th>
                    <th className="table-header">Domain</th>
                    <th className="table-header">Status</th>
                    <th className="table-header text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((domain, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="table-cell text-slate-400 tabular-nums text-xs">{i + 1}</td>
                      <td className="table-cell font-mono text-sm">{domain}</td>
                      <td className="table-cell">
                        <Badge variant="danger">Disposable</Badge>
                      </td>
                      <td className="table-cell text-right">
                        <button
                          onClick={() => setDeleteModal({ open: true, domain })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                          title={`Delete ${domain}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, domain: null })}
        title="Delete Domain"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setDeleteModal({ open: false, domain: null })}>
              Cancel
            </button>
            <button className="btn-danger" onClick={deleteDomain} disabled={actionLoading}>
              {actionLoading ? "Deleting…" : "Delete Domain"}
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Are you sure you want to remove{" "}
          <code className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
            {deleteModal.domain}
          </code>{" "}
          from the disposable domain list? This action cannot be undone.
        </p>
      </Modal>
    </DashboardLayout>
  );
}