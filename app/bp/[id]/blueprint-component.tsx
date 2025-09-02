"use client";

import supabase from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { BlueprintContent } from "./blueprint-content";
import { BlueprintHeader } from "./blueprint-header";
import { BluePrintWithContent, query } from "./blueprint-types";



export function BlueprintComponent({ id }: { id: string }) {
  const { blueprint } = useBlueprintData(id);

  if (!blueprint) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <BlueprintHeader blueprint={blueprint} />
      <BlueprintContent blueprint={blueprint} />
    </div>
  );
}


function useBlueprintData(id: string) {
  const [blueprint, setBlueprint] = useState<BluePrintWithContent | undefined>(undefined);

  useEffect(() => {
    const updateBlueprints = async () => {
      const { data, error } = await query
        .eq("blueprint_id", id)
        .single();


      if (error) {
        console.log("error", error);
        return;
      }
      setBlueprint(data);
    };

    updateBlueprints();
    const channel = supabase
      .channel("blueprint-component-subscriptions")
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
      ).on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "blueprint_edges",
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