import { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      {/* Main content */}
      <main className="lg:ml-64 pt-16 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="p-4 lg:p-8 max-w-7xl mx-auto"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
