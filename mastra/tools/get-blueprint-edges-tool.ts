import supabase from "@/lib/supabaseClient";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const getBlueprintEdgesTool = createTool({
    id: "get-blueprint-edges",
    description: "Get all edges for a blueprint",
    inputSchema: z.object({}),
    outputSchema: z.object({
        success: z.boolean(),
        data: z.array(z.any()).optional(),
        error: z.string().optional(),
    }),
    execute: async ({ runtimeContext }) => {
        const blueprintId = runtimeContext.get("blueprintId") as string;

        const { data, error } = await supabase
            .from("blueprint_edges")
            .select("*")
            .eq("blueprint_id", blueprintId);

        if (error) {
            console.log("error", error);
            return {
                success: false,
                error: `Failed to load edges: ${error.message}`,
            };
        }

        return {
            success: true,
            data,
        };
    },
});
