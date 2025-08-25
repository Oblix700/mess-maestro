
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookCopy,
  ChefHat,
  ChevronDown,
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Package,
  Soup,
  Settings,
  Scaling,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Icons } from "./icons";
import React from "react";

const menuItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/catalogue",
    label: "Catalogue",
    icon: BookCopy,
    subItems: [
      { href: "/dashboard/catalogue/categories", label: "Categories", icon: Package },
      { href: "/dashboard/catalogue/ingredients", label: "Ingredients", icon: Soup },
      { href: "/dashboard/catalogue/dishes", label: "Dishes", icon: ChefHat },
    ],
  },
  {
    href: "/dashboard/menu-planning",
    label: "Menu Planning",
    icon: ChefHat,
  },
  {
    href: "/dashboard/orders",
    label: "Orders",
    icon: ClipboardList,
  },
  {
    href: "/dashboard/reports",
    label: "Reports",
    icon: BarChart3,
  },
  {
    href: "/dashboard/admin",
    label: "Admin",
    icon: Settings,
    subItems: [
        { href: "/dashboard/admin/uom", label: "UOM", icon: Scaling },
    ]
  }
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="flex-1 overflow-auto">
        <div className="flex h-16 items-center justify-center border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-sidebar-foreground">
            <Icons.logo className="h-7 w-7" />
            <span>Mess Maestro</span>
          </Link>
        </div>
      <SidebarMenu className="p-2">
        {menuItems.map((item) =>
          item.subItems ? (
            <Collapsible key={item.href} defaultOpen={pathname.startsWith(item.href)}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex w-full items-center justify-between p-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 data-[state=open]:rotate-180" />
                  </Button>
                </CollapsibleTrigger>
              </SidebarMenuItem>
              <CollapsibleContent>
                <SidebarMenu className="pl-6 pt-1">
                  {item.subItems.map((subItem) => (
                    <SidebarMenuItem key={subItem.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === subItem.href}
                        className="justify-start gap-2"
                      >
                        <Link href={subItem.href}>
                          <subItem.icon className="h-4 w-4" />
                          <span>{subItem.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                className="justify-start gap-2"
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        )}
      </SidebarMenu>
    </div>
  );
}
