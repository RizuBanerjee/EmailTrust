import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext.jsx";
import {
  Zap,
  Shield,
  BarChart2,
  Key,
  Activity,
  Moon,
  Sun,
  CheckCircle,
  ArrowRight,
  Mail,
  Lock,
  Globe,
  Server,
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Disposable Detection",
    description: "Identify and block throwaway email addresses instantly.",
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-900/20",
  },
  {
    icon: Key,
    title: "API Key Management",
    description: "Create, rotate, and monitor API keys with usage limits.",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    icon: BarChart2,
    title: "Advanced Analytics",
    description: "Deep insights into request volumes and email patterns.",
    color: "text-green-500",
    bg: "bg-green-50 dark:bg-green-900/20",
  },
  {
    icon: Activity,
    title: "Usage Tracking",
    description: "Per-key logs, endpoint filters, and CSV export.",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
];

const highlights = [
  "Real-time email validation",
  "Bulk batch verification",
  "Risk scoring engine",
  "99.9% uptime SLA",
];

export default function Landing() {
  const { theme, toggleTheme } = useTheme();

  // If already logged in, go straight to the dashboard
  const token = localStorage.getItem("firebase_token");
  if (token) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">
              EmailTrust
            </span>
          </div>

          <div className="flex items-center gap-2">
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
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors shadow-sm"
            >
              Sign Up
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex items-center pt-16 px-6">
        <div className="max-w-7xl mx-auto w-full py-16 lg:py-24">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                <span className="text-xs font-medium text-brand-700 dark:text-brand-300">
                  Trusted Email Verification API
                </span>
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight mb-6">
                Powerful Email{" "}
                <span className="text-brand-600 dark:text-brand-400">
                  Verification API
                </span>
              </h1>

              <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-8 leading-relaxed">
                Validate emails in real-time, detect disposable addresses, and
                protect your product with enterprise-grade accuracy.
              </p>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 max-w-xl">
                {highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"
                  >
                    <CheckCircle className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors shadow-lg shadow-brand-600/20"
                >
                  Get started
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Learn more
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 lg:py-24 px-6 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              Everything you need to verify emails
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              A complete platform for real-time validation, batch processing, and API management.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, title, description, color, bg }) => (
              <div
                key={title}
                className="p-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md transition-shadow"
              >
                <div className={`p-2.5 rounded-lg ${bg} w-fit mb-4`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  {title}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 dark:border-slate-800 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} EmailTrust. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300">Terms</a>
            <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
