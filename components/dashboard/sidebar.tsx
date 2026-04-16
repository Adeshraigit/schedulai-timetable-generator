'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Calendar,
  Users,
  BookOpen,
  Building2,
  DoorOpen,
  Settings,
  LayoutDashboard,
  Sparkles,
  GraduationCap,
} from 'lucide-react';

const menuItems = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { title: 'Timetables', href: '/dashboard/timetables', icon: Calendar },
      { title: 'Generate', href: '/dashboard/generate', icon: Sparkles },
    ],
  },
  {
    title: 'Resources',
    items: [
      { title: 'Courses', href: '/dashboard/courses', icon: BookOpen },
      { title: 'Professors', href: '/dashboard/professors', icon: Users },
      { title: 'Rooms', href: '/dashboard/rooms', icon: DoorOpen },
      { title: 'Student Groups', href: '/dashboard/student-groups', icon: GraduationCap },
    ],
  },
  {
    title: 'Administration',
    items: [
      { title: 'Departments', href: '/dashboard/departments', icon: Building2 },
      { title: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Calendar className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">SchedulAI</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Users className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">Admin User</span>
            <span className="text-xs text-muted-foreground">admin@schedulai.com</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
