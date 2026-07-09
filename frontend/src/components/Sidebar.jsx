import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Key,
  Mail,
  Layers,
  BarChart2,
  CreditCard,
  Package,
  FileText,
  Shield,
  User,
  ChevronLeft,
  Zap,
  Users,
} from "lucide-react";
import { isAdmin } from "../utils/roles.js";

function getNavItems() {
  const admin = isAdmin();

  const serviceItems = [
    { path: "/dashboard",          label: "Dashboard",         icon: LayoutDashboard },
    { path: "/api-keys",           label: "API Keys",          icon: Key },
    { path: "/email-verification", label: "Email Verify",      icon: Mail },
    { path: "/batch-verification", label: "Batch Verify",      icon: Layers },
    { path: "/analytics",          label: "Analytics",         icon: BarChart2 },
    { path: "/credits",            label: "Credits",           icon: CreditCard },
    { path: "/subscription",      label: "Subscription",      icon: Package },
    { path: "/usage-logs",        label: "Usage Logs",        icon: FileText },
    { path: "/profile",           label: "Profile",           icon: User },
  ];

  const adminItems = admin
    ? [
        { path: "/admin/dashboard",  label: "Admin Dashboard",  icon: Users },
        { path: "/admin-domains",    label: "Admin Domains",    icon: Shield },
        { path: "/admin/analytics",  label: "Platform Analytics", icon: BarChart2 },
        { path: "/admin/users",    label: "Manage Users",   icon: Users },
        { path: "/admin/revenue",  label: "Revenue",        icon: CreditCard },
      ]
    : [];

  return { serviceItems, adminItems };
}

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { serviceItems, adminItems } = getNavItems();

  const renderNavGroup = (title, items) => (
    <div className="space-y-0.5">
      <p className="px-3 mb-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
        {title}
      </p>
      {items.map(({ path, label, icon: Icon }) => {
        const active = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            onClick={onClose}
            className={`sidebar-item no-underline ${active ? "sidebar-item-active" : "sidebar-item-inactive"}`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
          </Link>
        );
      })}
    </div>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <Link to="/dashboard" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            EmailTrust
          </span>
        </Link>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-4">
        {renderNavGroup("Service", serviceItems)}
        {adminItems.length > 0 && renderNavGroup("Management", adminItems)}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-slate-200 dark:border-slate-800">
        <div className="px-3 py-2">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            EmailTrust v1.0
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            API Platform
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
