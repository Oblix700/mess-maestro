
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
  Calculator,
  Building,
  Truck,
  HeartPulse,
  Users,
  Globe,
  ShoppingCart,
  Warehouse,
  List,
  CalendarDays,
  Calendar,
  RotateCcw,
  Target,
  FileText,
  Percent,
  CalendarSearch,
  BookCheck,
  DollarSign,
  Send,
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
      { href: "/dashboard/catalogue/ingredients", label: "Ingredients", icon: Soup },
      { href: "/dashboard/catalogue/dishes", label: "Dishes", icon: ChefHat },
    ],
  },
  {
    href: "/dashboard/menu-planning",
    label: "Menu Planning",
    icon: RotateCcw,
    subItems: [
        { href: "/dashboard/menu-planning", label: "28-Day Cycle Overview", icon: FileText },
        { href: "/dashboard/menu-planning/28-day-menu-cycle", label: "Edit 28-Day Cycle", icon: BookCheck },
        { href: "/dashboard/menu-planning/28-day-shopping-list", label: "Cycle Shopping List", icon: List },
        { href: "/dashboard/menu-planning/strength-planner", label: "Strength Planner", icon: Percent },
        { href: "/dashboard/menu-planning/calendar", label: "Year Calendar", icon: CalendarSearch },
        { href: "/dashboard/menu-planning/monthly-shopping-list", label: "Monthly Shopping List", icon: List },
    ],
  },
  {
    href: "/dashboard/purchasing",
    label: "Purchasing",
    icon: ShoppingCart,
    subItems: [
        { href: "/dashboard/purchasing/price-comparison", label: "Price Comparison", icon: DollarSign },
        { href: "/dashboard/purchasing/suppliers", label: "Suppliers", icon: Truck },
        { href: "/dashboard/purchasing/orders", label: "Orders", icon: ClipboardList },
        { href: "/dashboard/purchasing/generate-final-shopping-list", label: "Generate Final List", icon: Send },
    ]
  },
  {
    href: "/dashboard/warehousing",
    label: "Warehousing",
    icon: Warehouse,
    subItems: [
        { href: "/dashboard/warehousing/stock-levels", label: "Stock Levels", icon: List },
    ]
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
        { href: "/dashboard/admin/users", label: "Users", icon: Users },
        { href: "/dashboard/admin/units", label: "Units", icon: Building },
        { href: "/dashboard/admin/region", label: "Region", icon: Globe },
        { href: "/dashboard/admin/categories", label: "Categories", icon: Package },
        { href: "/dashboard/admin/uom", label: "UOM", icon: Scaling },
        { href: "/dashboard/admin/ration-scale", label: "Ration Scale", icon: Calculator },
        { href: "/dashboard/admin/check-status", label: "Check Status", icon: HeartPulse },
    ]
  }
];

export function SidebarNav() {
  const pathname = usePathname();

  const isSubItemActive = (item: any) => {
    if (item.href === '/dashboard/menu-planning') {
      return pathname.startsWith('/dashboard/menu-planning')
    }
    if (item.subItems) {
      return item.subItems.some((subItem: any) => pathname.startsWith(subItem.href));
    }
    return pathname.startsWith(item.href);
  };
  
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
            <Collapsible key={item.href} defaultOpen={isSubItemActive(item)}>
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
