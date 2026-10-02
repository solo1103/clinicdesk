"use client";

import Sidebar from "../../components/Sidebar";
import { useApp } from "../../lib/AppContext";

export default function DashboardLayout({ children }) {
  const { isSidebarOpen, setIsSidebarOpen } = useApp();

  return (
    <div className="min-h-dvh bg-[#F4F9F9]">
      <Sidebar
        toggle={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex min-h-dvh flex-col md:pl-[240px]">{children}</div>
    </div>
  );
}
