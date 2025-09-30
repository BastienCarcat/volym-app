import * as React from "react";

import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

export interface Group {
  entity: string;
  title: string;
  items: {
    name: string;
    id: string;
  }[];
}

interface NavGroupProps {
  group: Group;
  children?: React.ReactNode;
}

interface NavGroupActionProps {
  children: React.ReactNode;
  title?: string;
}

function NavGroupRoot({ group, children }: NavGroupProps) {
  const actionChild = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.type === NavGroupAction
  );

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
      {actionChild}
      <SidebarMenu>
        {group.items.map((item) => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton asChild>
              <Link href={`${group.entity}/${item.id}`}>{item.name}</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function NavGroupAction({
  children,
  title,
  ...props
}: React.ComponentProps<"button"> & NavGroupActionProps) {
  return (
    <SidebarGroupAction title={title} {...props}>
      {children}
    </SidebarGroupAction>
  );
}

export const NavGroup = Object.assign(NavGroupRoot, {
  Action: NavGroupAction,
});
