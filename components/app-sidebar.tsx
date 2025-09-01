"use client";
import { Tables } from "@/lib/database.types";
import supabase from "@/lib/supabaseClient";
import * as React from "react";
import { useEffect, useState } from "react";

import { SearchForm } from "@/components/search-form";
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
  SidebarRail,
} from "@/components/ui/sidebar";
import { VersionSwitcher } from "@/components/version-switcher";

const VERSIONS: readonly string[] = ["1.0.1"] as const

type BlueprintRow = Tables<"blueprints">

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [blueprints, setBlueprints] = useState<BlueprintRow[]>([])

  const updateBlueprints = async (): Promise<void> => {
    const { data, error } = await supabase
      .from("blueprints")
      .select("*")
      .order("name", { ascending: true })
    if (error) {
      console.log("error", error)
      return
    }
    setBlueprints(data ?? [])
  }

  useEffect(() => {
    updateBlueprints()
    const channel = supabase
      .channel("public-blueprints-sidebar")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "blueprints" },
        () => {
          console.log("realtime:blueprints", "update received")
          updateBlueprints()
        }
      )
      .subscribe()
    return () => {
      console.log("cleanup", "unsubscribe public-blueprints-sidebar")
      channel.unsubscribe()
    }
  }, [])
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher versions={VERSIONS as unknown as string[]} defaultVersion={VERSIONS[0]} />
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Blueprints</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {blueprints.map((bp) => (
                <SidebarMenuItem key={bp.blueprint_id}>
                  <SidebarMenuButton asChild>
                    <a href="#">{bp.name}</a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
