"use client";

import { BluePrintWithContent } from "./blueprint-types";

export function BlueprintHeader({ blueprint }: { blueprint: BluePrintWithContent }) {
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
