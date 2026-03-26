import type { ComponentType, ReactNode } from 'react';
import { Bell, Building2, CalendarDays, Menu, Users } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

type OrganizerLayoutProps = {
  children: ReactNode;
};

type NavItem = {
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', path: '/organizer', icon: CalendarDays },
  { label: 'Events', path: '/organizer/events', icon: CalendarDays },
  { label: 'Organization', path: '/organizer/organization', icon: Building2 },
  { label: 'Volunteers', path: '/organizer/volunteers', icon: Users },
];

function SidebarContent() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <p className="text-base font-semibold tracking-tight">VolunteerHub Organizer</p>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/organizer'
              ? location.pathname === '/organizer'
              : location.pathname.startsWith(item.path);

          return (
            <Button
              key={item.path}
              type="button"
              variant="ghost"
              className={cn(
                'flex w-full items-center justify-start gap-3 rounded-md px-3 py-2 text-sm',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              )}
              onClick={() => navigate(item.path)}
            >
                <Icon className="size-4" />
                <span>{item.label}</span>
            </Button>
          );
        })}
      </nav>
    </div>
  );
}

const OrganizerLayout = ({ children }: OrganizerLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-sidebar-border md:block">
        <SidebarContent />
      </aside>

      <div className="md:pl-60">
        <header className="sticky top-0 z-20 h-16 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/70 sm:px-6">
          <div className="mx-auto flex h-full max-w-400 items-center justify-between">
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden" aria-label="Open organizer menu">
                    <Menu className="size-4" />
                  </Button>
                </SheetTrigger>

                <SheetContent side="left" className="w-60 p-0">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Organizer navigation</SheetTitle>
                    <SheetDescription>Open the organizer sidebar navigation links.</SheetDescription>
                  </SheetHeader>
                  <SidebarContent />
                </SheetContent>
              </Sheet>

              <p className="text-sm font-medium text-muted-foreground">Organizer Workspace</p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" aria-label="Open notifications">
                <Bell className="size-4" />
              </Button>

              <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 gap-2 rounded-full px-2">
                    <Avatar className="size-8">
                      <AvatarImage src="https://i.pravatar.cc/80?img=14" alt="Organizer user" />
                      <AvatarFallback>OR</AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm font-medium sm:inline">Organizer</span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-400 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default OrganizerLayout;