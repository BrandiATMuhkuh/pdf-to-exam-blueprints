import supabase from "@/lib/supabaseClient";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const addEdgeTool = createTool({
    id: "add-edge",
    description: "Add an entry to the blueprint_edges table",
    inputSchema: z.object({
        title: z.string().min(1).describe("The title of the topic or sub-topic"),
        description: z
            .string()
            .optional()
            .describe("Optional description for the topic or sub-topic"),
        weight: z.number().int().min(0).max(100).describe("Relative weight (0-100) for this node"),
        position: z.number().int().describe("Ordering index within its siblings"),
        parentId: z
            .string()
            .nullable()
            .optional()
            .describe("Parent edge id if this is a sub-topic; null for root"),
        blueprintId: z.string().describe("The blueprint ID to add the edge to"),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        data: z.any().optional(),
        error: z.string().optional(),
    }),
    execute: async ({ context }) => {
        const { title, description = "", weight, position, parentId, blueprintId } = context;

        if (!blueprintId) {
            return {
                success: false,
                error: "Missing blueprintId for addEdge tool",
            };
        }

        const { data, error } = await supabase
            .from("blueprint_edges")
            .insert({
                blueprint_id: blueprintId,
                title,
                description: description ?? "",
                weight,
                position,
                parent_id: parentId ?? null,
            })
            .select()
            .single();

        if (error) {
            console.log("error", error);
            return {
                success: false,
                error: `Failed to insert edge: ${error.message}`,
            };
        }

        return {
            success: true,
            data,
        };
    },
});
