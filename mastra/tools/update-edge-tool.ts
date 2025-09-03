import supabase from "@/lib/supabaseClient";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const updateEdgeTool = createTool({
    id: "update-edge",
    description:
        "Update an entry in the blueprint_edges table. This does NOT allow you to move a node!",
    inputSchema: z.object({
        edgeId: z.string().uuid().describe("The id of the edge to update"),
        title: z.string().min(1).describe("The title of the topic or sub-topic"),
        description: z.string().optional().describe("The description of the topic or sub-topic"),
        weight: z.number().int().min(0).max(100).describe("The weight of the topic or sub-topic"),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        error: z.string().optional(),
    }),
    execute: async ({ context }) => {
        const { edgeId, title, description, weight } = context;

        const { error } = await supabase
            .from("blueprint_edges")
            .update({ title, description, weight })
            .eq("edget_id", edgeId);

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
