import { Navigate } from "react-router-dom";
import { isAdmin } from "../utils/roles.js";

export default function AdminProtectedRoute({ children }) {
  const token = localStorage.getItem("firebase_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
