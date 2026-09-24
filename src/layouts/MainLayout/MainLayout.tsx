import { useState } from "react";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] lg:flex">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((current) => !current)} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar sidebarCollapsed={sidebarCollapsed} onSidebarToggle={() => setSidebarCollapsed((current) => !current)} />
        <main className="min-h-0 flex-1"><Outlet /></main>
        <Footer />
      </div>
    </div>
  );
}

export default MainLayout;