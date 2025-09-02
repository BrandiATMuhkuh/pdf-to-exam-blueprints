"use client";
import { Tables } from "@/lib/database.types";

export function BlueprintHeader({ blueprint }: { blueprint: Tables<"blueprints"> }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-muted-foreground">Blueprint ID: {blueprint.blueprint_id}</div>
      {blueprint.name && (
        <div className="text-2xl font-semibold">{blueprint.name}</div>
      )}
      {blueprint.description && (
        <div className="text-muted-foreground">{blueprint.description}</div>
      )}
    </div>
  );
}
