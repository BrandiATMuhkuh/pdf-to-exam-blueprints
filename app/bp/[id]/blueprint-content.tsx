"use client";

import { BluePrintWithContent } from "./blueprint-types";

export function BlueprintContent({ blueprint }: { blueprint: BluePrintWithContent }) {
  const edges = blueprint.blueprint_edges


  return (
    <div className="rounded-md border overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left p-2">Title</th>
            <th className="text-left p-2">Description</th>
            <th className="text-left p-2">Weight</th>
            <th className="text-left p-2">Position</th>
            <th className="text-left p-2">Parent</th>
          </tr>
        </thead>
        <tbody>
          {edges.map((edge) => (
            <tr key={edge.edget_id} className="border-t">
              <td className="p-2 align-top">{edge.title}</td>
              <td className="p-2 align-top text-muted-foreground">{edge.description}</td>
              <td className="p-2 align-top">{edge.weight}</td>
              <td className="p-2 align-top">{edge.position}</td>
              <td className="p-2 align-top">{edge.parent_id ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


