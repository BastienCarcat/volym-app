import * as React from "react";

import { NavMain } from "@/components/layout/sidebar/nav-main";
import { NavGroup } from "@/components/layout/sidebar/nav-group";
import { NavUser } from "@/components/layout/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NavHeader } from "./nav-header";

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // This is sample data.
  const data = {
    workouts: {
      title: "Workouts",
      entity: "workouts",
      items: [
        {
          name: "Upper",
          id: "1",
        },
        {
          name: "Lower",
          id: "2",
        },
        {
          name: "Chest",
          id: "3",
        },
      ],
    },
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavHeader />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <NavGroup group={data.workouts} />
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
