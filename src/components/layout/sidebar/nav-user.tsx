"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/better-auth/client";
import { useCallback, useMemo } from "react";
import { CompleteUser } from "@/lib/auth/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function UserCard({
  user: { authUser, dbUser },
}: React.ComponentProps<"div"> & { user: CompleteUser }) {
  const userLetters = useMemo(() => {
    return authUser.email?.substring(0, 2).toUpperCase() || "AA";
  }, [authUser.email]);

  const displayName = useMemo(() => {
    if (dbUser.firstname && dbUser.lastname) {
      return `${dbUser.firstname} ${dbUser.lastname}`;
    }
    return authUser.name || authUser.email;
  }, [dbUser.firstname, dbUser.lastname, authUser.name, authUser.email]);

  return (
    <>
      <Avatar className="h-8 w-8 rounded-lg">
        <AvatarImage src={authUser.image || undefined} alt={displayName} />
        <AvatarFallback className="rounded-lg">{userLetters}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{displayName}</span>
        <span className="truncate text-xs">{authUser.email}</span>
      </div>
    </>
  );
}

export function NavUser({ user }: { user: CompleteUser }) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    const { error } = await authClient.signOut();

    if (error) {
      toast.error("Failed to logout. Please try again.");
      return;
    }

    router.push("/auth/login");
    router.refresh();
  }, [router]);

  return (
    <SidebarMenu className="py-2">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserCard user={user} />
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <UserCard user={user} />
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
