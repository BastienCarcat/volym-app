"use client";

import React, { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

import { usePrograms } from "@/app/(root)/programs/_hooks/use-programs";
import { CreateProgramDialog } from "@/components/features/programs/create-program-dialog";
import { UserLevel } from "@/generated/prisma";

interface NavGroupProgramsProps {
  userLevel: UserLevel | null;
}

export function NavGroupPrograms({ userLevel }: NavGroupProgramsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data, isLoading } = usePrograms();

  const programs = data?.programs || [];

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Programs</SidebarGroupLabel>
        <SidebarGroupAction
          title="Add program"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus />
          <span className="sr-only">Add program</span>
        </SidebarGroupAction>
        <SidebarMenu>
          {isLoading ? (
            <SidebarMenuItem className="flex justify-center pt-2">
              <Loader2 className="animate-spin text-gray-400" />
            </SidebarMenuItem>
          ) : programs?.length === 0 ? (
            <SidebarMenuItem>
              <SidebarMenuButton disabled>No programs yet</SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
            programs?.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton asChild>
                  <Link href={`/programs/${item.id}`}>{item.name}</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))
          )}
        </SidebarMenu>
      </SidebarGroup>
      <CreateProgramDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        userLevel={userLevel}
      />
    </>
  );
}
