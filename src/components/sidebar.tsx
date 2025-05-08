"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import {
  BarChart,
  Bell,
  BookOpen,
  GraduationCap,
  Home,
  LayoutDashboard,
  Users,
} from "lucide-react";

import useUserStore from "@/stores/useUserStore";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu items with color settings
const getMenuItems = (userRole: string) => {
  const baseItems = [
    {
      title: "Trang chủ",
      url: "/",
      icon: Home,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      title: "Lộ trình",
      url: "/roadmap",
      icon: GraduationCap,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      title: "Bài viết",
      url: "/blog",
      icon: BookOpen,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
    },
  ];

  if (userRole === "ADMIN") {
    baseItems.push(
      {
        title: "Quản lý",
        url: "/admin/courses",
        icon: LayoutDashboard,
        color: "text-gray-600",
        bgColor: "bg-purple-50",
      },
      {
        title: "Người dùng",
        url: "/admin/users",
        icon: Users,
        color: "text-gray-600",
        bgColor: "bg-indigo-50",
      },
      {
        title: "Báo cáo",
        url: "/admin/reports",
        icon: BarChart,
        color: "text-gray-600",
        bgColor: "bg-rose-50",
      },
    );
  }

  return baseItems;
};

export function AppSidebar() {
  const { user } = useUserStore();
  const items = getMenuItems(user?.role || "");
  const pathname = usePathname();

  return (
    <Sidebar className="w-22 h-full bg-white border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="w-full">
              {items.map((item) => {
                const isActive =
                  item.url === "/"
                    ? pathname === "/"
                    : item.url.startsWith("/admin")
                      ? pathname.startsWith(item.url)
                      : pathname === item.url;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn("h-20", isActive && item.bgColor)}
                      isActive={isActive}
                    >
                      <Link
                        href={item.url}
                        className="flex h-10 flex-col items-center justify-center w-full"
                      >
                        <p className={cn(item.color)}>
                          <item.icon />
                        </p>
                        <p
                          className={cn(
                            "text-center text-[12px] font-semibold",
                            isActive ? "text-gray-900" : "text-gray-600",
                          )}
                        >
                          {item.title}
                        </p>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton asChild className="mb-10 rounded-full">
          <Link
            href={"/notifications"}
            className="flex flex-col items-center justify-center w-full h-20"
          >
            <p className="text-orange-500">
              <Bell />
            </p>
          </Link>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
