import { useNavigate, Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { motion } from "framer-motion";
import { auth } from "../firebase/firebase";
import { useTheme } from "../context/ThemeContext.jsx";
import api from "../api/api";
import { Zap, Moon, Sun, ArrowLeft, Shield, CheckCircle, AlertCircle, Mail } from "lucide-react";
import { useState } from "react";

const benefits = [
  "Real-time validation",
  "Disposable detection",
  "Bulk verification",
  "99.9% uptime SLA",
];

export default function Signup() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function signup(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      // Block disposable/temporary email addresses before allowing sign-up
      const checkRes = await api.get(`/check-disposable/${form.email}`);
      if (checkRes.data.disposable) {
        setError(
          "Temporary or disposable email addresses are not allowed. Please use a permanent email."
        );
        setLoading(false);
        return;
      }
    } catch (checkErr) {
      console.error("Disposable check failed", checkErr);
      // Fail-open if the check endpoint is unavailable.
    }

    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      if (form.name.trim()) {
        await updateProfile(result.user, { displayName: form.name.trim() });
      }

      const token = await result.user.getIdToken();

      localStorage.setItem("firebase_token", token);
      localStorage.setItem("user_email", result.user.email);
      localStorage.setItem("user_name", result.user.displayName || form.name.trim() || "");
      localStorage.setItem("user_photo", result.user.photoURL || "");

      try {
        const meRes = await api.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        localStorage.setItem("is_admin", meRes.data.is_admin ? "true" : "false");
      } catch (meErr) {
        console.error("Failed to fetch /auth/me", meErr);
        localStorage.setItem("is_admin", "false");
      }

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      let message = "Failed to create account.";
      if (err.code === "auth/email-already-in-use") {
        message = "An account with this email already exists. Try signing in.";
      } else if (err.code === "auth/invalid-email") {
        message = "Invalid email address.";
      } else if (err.code === "auth/weak-password") {
        message = "Password is too weak.";
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }

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
        </div>

        {/* Top red error banner */}
        {error && (
          <div className="absolute top-full left-0 right-0 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-6 py-2.5">
            <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </nav>

      <div className="flex flex-1 flex-col lg:flex-row pt-16">
        {/* Left: brand panel */}
        <div className="flex-1 hidden lg:flex flex-col justify-center px-16 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-100 dark:border-slate-800">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800 mb-6 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
              <span className="text-xs font-medium text-brand-700 dark:text-brand-300">
                Trusted Email Verification API
              </span>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4 tracking-tight">
              Create your EmailTrust account
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mb-8">
              Get started with email verification, API keys, and usage analytics.
            </p>

            <ul className="space-y-3">
              {benefits.map((b) => (
                <li
                  key={b}
                  className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"
                >
                  <CheckCircle className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Right: signup form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full max-w-sm"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>

            <div className="card p-8 shadow-lg">
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Sign up
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Create a new account
                </p>
              </div>

              <form onSubmit={signup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Full name
                  </label>
                  <input
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    required
                    placeholder="Your name"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating account…" : "Create account"}
                </button>
              </form>

              <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-brand-600 dark:text-brand-400 hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
