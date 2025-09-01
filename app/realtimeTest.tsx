"use client";
import { Tables } from "../lib/database.types";

import supabase from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function RealtimeTest() {
  const [blueprintEdges, setBlueprintEdges] = useState<Tables<"blueprints">[]>([]);

  const updateBluprints = async () => {
    supabase.from("blueprints").select("*").then(({ data, error }) => {
      console.log("data", data);
      if (!error) {
        setBlueprintEdges(data);
      }
    });
  }

  useEffect(() => {
    console.log("supabase", supabase);
    updateBluprints();

    const channels2 = supabase.channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "blueprints" },
        (payload) => {
          console.log("Change received!", payload);
          updateBluprints();
        }
      )
      .subscribe()

    const channel = supabase
      .channel("public-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "blueprint_edges" },
        (payload) => {
          console.log("realtime:blueprints2", payload);
        }
      )
      .subscribe();

    return () => {
      console.log("cleanup", "unsubscribe blueprints-db-changes");
      channel.unsubscribe();
      channels2.unsubscribe();
    };
  }, []);
  return <div>
    <h1>Blueprints</h1>
    <pre>{JSON.stringify(blueprintEdges, null, 2)}</pre>
  </div>;
}