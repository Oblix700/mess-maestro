
import { Header } from "@/components/header";
import { SidebarNav } from "@/components/sidebar-nav";
import {
  SidebarProvider,
  Sidebar,
} from "@/components/ui/sidebar";
import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-muted/40">
        <Sidebar>
          <SidebarNav />
        </Sidebar>
        <div className="sm:pl-14 peer-[[data-state=expanded]]:sm:pl-64 transition-[padding-left] ease-in-out duration-200">
          <Header />
          <main className="p-4 sm:px-6 sm:py-0">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
