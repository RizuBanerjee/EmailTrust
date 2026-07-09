import { useNavigate, useLocation } from "react-router-dom";
import { Moon, Sun, LogOut, Menu, User } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

const pageTitles = {
  "/dashboard":          "Dashboard",
  "/api-keys":           "API Keys",
  "/email-verification": "Email Verification",
  "/batch-verification": "Batch Verification",
  "/analytics":          "Analytics",
  "/credits":            "Credits",
  "/subscription":       "Subscription",
  "/usage-logs":         "Usage Logs",
  "/admin-domains":      "Admin Domains",
  "/profile":            "Profile",
};

export default function Navbar({ onMenuClick }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { theme, toggleTheme } = useTheme();

  const userEmail = localStorage.getItem("user_email") || "";
  const userPhoto = localStorage.getItem("user_photo") || "";
  const userName  = localStorage.getItem("user_name") || userEmail;
  const pageTitle = pageTitles[location.pathname] || "EmailTrust";

  function logout() {
    localStorage.removeItem("firebase_token");
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_name");
    localStorage.removeItem("user_photo");
    navigate("/login");
  }

  return (
    <header className="fixed top-0 left-0 right-0 lg:left-64 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-20 flex items-center justify-between px-4 lg:px-6">
      {/* Left: hamburger + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          {pageTitle}
        </h1>
      </div>

      {/* Right: theme toggle + user */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />

        {/* User dropdown */}
        <div className="flex items-center gap-2">
          {userPhoto ? (
            <img
              src={userPhoto}
              alt={userName}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
              <User className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            </div>
          )}
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-none truncate max-w-[120px]">
              {userName.split("@")[0]}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-none mt-0.5 truncate max-w-[120px]">
              {userEmail}
            </p>
          </div>
          <button
            onClick={logout}
            className="ml-1 p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
