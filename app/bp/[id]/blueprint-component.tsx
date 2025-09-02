"use client";
import { Tables } from "@/lib/database.types";

import supabase from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { BlueprintHeader } from "./blueprint-header";

export function BlueprintComponent({ id }: { id: string }) {
  const { blueprint } = useBlueprintData(id);

  if (!blueprint) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <BlueprintHeader blueprint={blueprint} />
      <div className="rounded-md border p-4">UI goes here…</div>
    </div>
  );
}


function useBlueprintData(id: string) {
  const [blueprint, setBlueprint] = useState<Tables<"blueprints"> | undefined>(undefined);

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
      setBlueprint(data ?? undefined);
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

  return { blueprint }
}