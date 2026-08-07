"use client";

import { Sidebar } from "@/components/sidebar";
import { useAppStore } from "@/lib/store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border/50 bg-background/80 px-4 backdrop-blur-xl lg:hidden">
          <button
            onClick={toggleSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-medium">FluentAI</span>
        </div>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
