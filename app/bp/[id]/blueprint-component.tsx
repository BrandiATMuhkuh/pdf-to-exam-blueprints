"use client"


export function BlueprintComponent({ id }: { id: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-muted-foreground">Blueprint ID: {id}</div>
      <div className="rounded-md border p-4">UI goes here…</div>
    </div>
  )
}


