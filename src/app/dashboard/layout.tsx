import { Header } from "@/components/header";
import { SidebarNav } from "@/components/sidebar-nav";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-muted/40">
        <Sidebar>
          <SidebarNav />
        </Sidebar>
        <div className="flex flex-1 flex-col sm:pl-14 transition-[padding-left] ease-in-out duration-200 group-data-[state=expanded]/sidebar-wrapper:sm:pl-64">
          <Header />
          <main className="overflow-auto p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
