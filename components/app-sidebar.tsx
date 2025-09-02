"use client";
import { Tables } from "@/lib/database.types";
import supabase from "@/lib/supabaseClient";
import * as React from "react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
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
import { ProjectName } from "@/components/version-switcher";

type BlueprintRow = Tables<"blueprints">;

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [blueprints, setBlueprints] = useState<BlueprintRow[]>([]);

    const updateBlueprints = async (): Promise<void> => {
        const { data, error } = await supabase
            .from("blueprints")
            .select("*")
            .order("name", { ascending: true });
        if (error) {
            console.log("error", error);
            return;
        }
        setBlueprints(data ?? []);
    };

    useEffect(() => {
        updateBlueprints();
        const channel = supabase
            .channel("public-blueprints-sidebar")
            .on("postgres_changes", { event: "*", schema: "public", table: "blueprints" }, () => {
                console.log("realtime:blueprints", "update received");
                updateBlueprints();
            })
            .subscribe();
        return () => {
            console.log("cleanup", "unsubscribe public-blueprints-sidebar");
            channel.unsubscribe();
        };
    }, []);
    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <ProjectName />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <Button
                                    asChild
                                    className="w-full justify-center bg-black text-white hover:bg-black/90"
                                >
                                    <a href={`/`}>Import</a>
                                </Button>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Blueprints</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {blueprints.map((bp) => (
                                <SidebarMenuItem key={bp.blueprint_id}>
                                    <SidebarMenuButton asChild>
                                        <a href={`/bp/${bp.blueprint_id}`}>{bp.name}</a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}
