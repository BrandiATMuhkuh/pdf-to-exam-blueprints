"use client";
import { Tables } from "@/lib/database.types";
import supabase from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

type BlueprintRow = Tables<"blueprints">;

export function BlueprintHeader({ id }: { id: string }) {
  console.log("id", id);
  const [blueprints, setBlueprints] = useState<BlueprintRow | undefined>(undefined);

  useEffect(() => {
    const updateBlueprints = async () => {
      const { data, error } = await supabase
        .from("blueprints")
        .select("*")
        .eq("blueprint_id", id)
        .single();

      if (error) {
        console.log("error", error);
        return;
      }
      setBlueprints(data ?? undefined);
    };

    updateBlueprints();
    const channel = supabase
      .channel("public-blueprints-sidebar")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "blueprints",
          filter: `blueprint_id=eq.${id}`,
        },
        () => {
          console.log("realtime:blueprints", "update received");
          updateBlueprints();
        }
      )
      .subscribe();
    return () => {
      console.log("cleanup", "unsubscribe public-blueprints-sidebar");
      channel.unsubscribe();
    };
  }, [id]);

  console.log("blueprints", blueprints);

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-muted-foreground">Blueprint ID: {id}</div>
    </div>
  );
}
