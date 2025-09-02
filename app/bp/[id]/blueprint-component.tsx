"use client"

import { BlueprintHeader } from "./blueprint-header"


export function BlueprintComponent({ id }: { id: string }) {
  return (
    <div className="flex flex-col gap-4">
      <BlueprintHeader id={id} />
      <div className="rounded-md border p-4">UI goes here…</div>
    </div>
  )
}


