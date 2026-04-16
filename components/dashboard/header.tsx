'use client';

import { useAuth, roleLabels } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';

export function DashboardHeader() {
  const { user, profile, isLoading, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  if (isLoading) {
    return <Spinner className="h-5 w-5" />;
  }

  if (!user || !profile) {
    return (
      <Button variant="outline" onClick={() => router.push('/auth/login')}>
        Sign in
      </Button>
    );
  }

  const roleColor = {
    admin: 'bg-destructive/10 text-destructive border-destructive/20',
    hod: 'bg-primary/10 text-primary border-primary/20',
    professor: 'bg-secondary/10 text-secondary-foreground border-secondary/20',
    coordinator: 'bg-accent/10 text-accent-foreground border-accent/20',
  }[profile.role] || 'bg-muted text-muted-foreground';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium">{profile.name}</span>
            <Badge variant="outline" className={`text-xs ${roleColor}`}>
              {roleLabels[profile.role]}
            </Badge>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{profile.name}</p>
            <p className="text-xs text-muted-foreground">{profile.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
