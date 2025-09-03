import supabase from "@/lib/supabaseClient";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const updateBlueprintTool = createTool({
    id: "update-blueprint",
    description: "Update the blueprint",
    inputSchema: z.object({
        name: z.string().min(1).describe("The name of the blueprint"),
        description: z.string().optional().describe("The description of the blueprint"),
        blueprintId: z.string().describe("The blueprint ID to update"),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        error: z.string().optional(),
    }),
    execute: async ({ context }) => {
        const { name, description, blueprintId } = context;

        const { error } = await supabase
            .from("blueprints")
            .update({ name, description })
            .eq("blueprint_id", blueprintId);

        if (error) {
            return {
                success: false,
                error: error.message,
            };
        }

        return {
            success: true,
        };
    },
});
