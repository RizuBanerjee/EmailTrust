import { useNavigate, Link } from "react-router-dom";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { motion } from "framer-motion";
import { auth, googleProvider } from "../firebase/firebase";
import { useTheme } from "../context/ThemeContext.jsx";
import api from "../api/api";
import { Zap, Moon, Sun, ArrowRight, ArrowLeft, Shield, CheckCircle, AlertCircle, Mail, Lock } from "lucide-react";
import { useState } from "react";

const benefits = [
  "Real-time validation",
  "Disposable detection",
  "Bulk verification",
  "99.9% uptime SLA",
];

export default function Login() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function finishLogin(firebaseUser) {
    const email = firebaseUser.email;
    const token = await firebaseUser.getIdToken();

    localStorage.setItem("firebase_token", token);
    localStorage.setItem("user_email", email);
    localStorage.setItem("user_name", firebaseUser.displayName || "");
    localStorage.setItem("user_photo", firebaseUser.photoURL || "");

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
  }

  async function checkDisposable(email) {
    try {
      const checkRes = await api.get(`/check-disposable/${email}`);
      if (checkRes.data.disposable) {
        return {
          disposable: true,
          message:
            "Temporary or disposable email addresses are not allowed. Please use a permanent email.",
        };
      }
      return { disposable: false };
    } catch (checkErr) {
      console.error("Disposable check failed", checkErr);
      // Fail-open if the check endpoint is unavailable.
      return { disposable: false };
    }
  }

  async function loginWithGoogle() {
    setError("");
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email;
      const check = await checkDisposable(email);

      if (check.disposable) {
        await signOut(auth);
        setError(check.message);
        setLoading(false);
        return;
      }

      await finishLogin(result.user);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function loginWithEmail(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const check = await checkDisposable(form.email);
      if (check.disposable) {
        setError(check.message);
        setLoading(false);
        return;
      }

      const result = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      await finishLogin(result.user);
    } catch (err) {
      console.error(err);
      let message = "Failed to sign in.";
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        message = "Invalid email or password.";
      } else if (err.code === "auth/invalid-email") {
        message = "Invalid email address.";
      } else if (err.code === "auth/too-many-requests") {
        message = "Too many attempts. Please try again later.";
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
              Sign in to EmailTrust
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mb-8">
              Access your dashboard, manage API keys, monitor usage, and verify
              emails at scale.
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

        {/* Right: login form */}
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
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Welcome back
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Sign in to access your dashboard
                </p>
              </div>

              <button
                onClick={loginWithGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-150 shadow-sm group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {/* Google icon */}
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
                <ArrowRight className="w-4 h-4 ml-auto opacity-40 group-hover:opacity-70 transition-opacity" />
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500">
                    or sign in with email
                  </span>
                </div>
              </div>

              <form onSubmit={loginWithEmail} className="space-y-4">
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
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      autoComplete="current-password"
                      value={form.password}
                      onChange={(e) => updateField("password", e.target.value)}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Checking email…" : "Sign in with email"}
                </button>
              </form>

              <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                Don&apos;t have an account?{" "}
                <Link
                  to="/signup"
                  className="text-brand-600 dark:text-brand-400 hover:underline font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
