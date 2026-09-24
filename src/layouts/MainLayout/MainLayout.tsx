import { useState, type ReactNode } from "react";

import Footer from "./Footer";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

type Props = {
  children?: ReactNode;
};

function MainLayout({ children }: Props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] lg:flex">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((current) => !current)}
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar
          sidebarCollapsed={sidebarCollapsed}
          onSidebarToggle={() => setSidebarCollapsed((current) => !current)}
        />

        <main className="min-h-0 flex-1">{children}</main>

        <Footer />
      </div>
    </div>
  );
}

export default MainLayout;