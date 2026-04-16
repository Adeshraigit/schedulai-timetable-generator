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
  Shield,
  FileText,
} from 'lucide-react';
import { useAuth, useAvailableActions, roleLabels } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';

export function DashboardSidebar() {
  const pathname = usePathname();
  const { profile, isLoading } = useAuth();
  const actions = useAvailableActions();

  // Build menu items based on permissions
  const menuItems = [
    {
      title: 'Overview',
      items: [
        { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, show: true },
        { title: 'Timetables', href: '/dashboard/timetables', icon: Calendar, show: true },
        { title: 'Generate', href: '/dashboard/generate', icon: Sparkles, show: actions.canCreateTimetables },
      ],
    },
    {
      title: 'Resources',
      items: [
        { title: 'Courses', href: '/dashboard/courses', icon: BookOpen, show: true },
        { title: 'Professors', href: '/dashboard/professors', icon: Users, show: true },
        { title: 'Rooms', href: '/dashboard/rooms', icon: DoorOpen, show: true },
        { title: 'Student Groups', href: '/dashboard/student-groups', icon: GraduationCap, show: true },
      ],
    },
    {
      title: 'Constraints',
      items: [
        { title: 'Constraints', href: '/dashboard/constraints', icon: FileText, show: actions.canCreateConstraints },
      ],
    },
    {
      title: 'Administration',
      items: [
        { title: 'Departments', href: '/dashboard/departments', icon: Building2, show: actions.canManageDepartments },
        { title: 'User Management', href: '/dashboard/users', icon: Shield, show: actions.canManageUsers },
        { title: 'Settings', href: '/dashboard/settings', icon: Settings, show: true },
      ],
    },
  ];

  // Filter out empty groups
  const filteredMenuItems = menuItems
    .map(group => ({
      ...group,
      items: group.items.filter(item => item.show),
    }))
    .filter(group => group.items.length > 0);

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
        {filteredMenuItems.map((group) => (
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
        {isLoading ? (
          <div className="h-12 animate-pulse rounded-lg bg-muted" />
        ) : profile ? (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-foreground truncate">
                {profile.name}
              </span>
              <Badge variant="outline" className="text-xs w-fit">
                {roleLabels[profile.role]}
              </Badge>
            </div>
          </div>
        ) : (
          <Link 
            href="/auth/login" 
            className="text-sm text-primary hover:underline"
          >
            Sign in to continue
          </Link>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
