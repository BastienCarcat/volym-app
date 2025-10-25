import * as React from "react";

import { NavGroupPrograms } from "@/components/layout/sidebar/groups/nav-group-programs";
import { NavGroupSettings } from "@/components/layout/sidebar/groups/nav-group-settings";
import { NavUser } from "@/components/layout/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { NavHeader } from "./nav-header";
import { getAuthenticatedUser } from "@/lib/auth/getUser";

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const user = await getAuthenticatedUser();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavHeader />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <NavGroupPrograms />
        <SidebarSeparator />
        <NavGroupSettings />
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
