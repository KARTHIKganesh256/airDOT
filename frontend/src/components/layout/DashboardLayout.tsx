import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";

import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

export function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <motion.main
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex-1 space-y-8 px-6 py-8 xl:px-10"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}

