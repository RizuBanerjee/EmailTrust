import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login             from "../pages/Login";
import Signup            from "../pages/Signup";
import Landing           from "../pages/Landing";
import Dashboard         from "../pages/Dashboard";
import ProtectedRoute    from "../components/ProtectedRoute";
import AdminProtectedRoute from "../components/AdminProtectedRoute.jsx";
import ApiKeys           from "../pages/ApiKeys";
import EmailVerification from "../pages/EmailVerification";
import BatchVerification from "../pages/BatchVerification";
import Analytics         from "../pages/Analytics";
import AdminAnalytics    from "../pages/AdminAnalytics";
import AdminDashboard    from "../pages/AdminDashboard";
import Credits           from "../pages/Credits";
import Subscription      from "../pages/Subscription";
import UsageLogs         from "../pages/UsageLogs";
import AdminDomains      from "../pages/AdminDomains";
import Profile           from "../pages/Profile";
import AdminUsers from "../pages/AdminUsers";
import AdminRevenue from "../pages/AdminRevenue";

function DefaultRoute() {
  const token = localStorage.getItem("firebase_token");
  return <Navigate to={token ? "/dashboard" : "/login"} replace />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>

        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/api-keys"  element={<ProtectedRoute><ApiKeys /></ProtectedRoute>} />

        <Route path="/email-verification"
          element={<ProtectedRoute><EmailVerification /></ProtectedRoute>} />

        <Route path="/batch-verification"
          element={<ProtectedRoute><BatchVerification /></ProtectedRoute>} />

        <Route path="/analytics"
          element={<ProtectedRoute><Analytics /></ProtectedRoute>} />

        <Route path="/admin/dashboard"
          element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />

        <Route path="/credits"
          element={<ProtectedRoute><Credits /></ProtectedRoute>} />

        <Route path="/subscription"
          element={<ProtectedRoute><Subscription /></ProtectedRoute>} />

        <Route path="/usage-logs"
          element={<ProtectedRoute><UsageLogs /></ProtectedRoute>} />

        <Route path="/admin-domains"
          element={<AdminProtectedRoute><AdminDomains /></AdminProtectedRoute>} />

        <Route path="/admin/analytics"
          element={<AdminProtectedRoute><AdminAnalytics /></AdminProtectedRoute>} />

        <Route path="/profile"
          element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        <Route path="/admin/users"    element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />

        <Route path="/admin/revenue"  element={<AdminProtectedRoute><AdminRevenue /></AdminProtectedRoute>} />

        <Route path="*" element={<DefaultRoute />} />

      </Routes>
    </BrowserRouter>
  );
}
