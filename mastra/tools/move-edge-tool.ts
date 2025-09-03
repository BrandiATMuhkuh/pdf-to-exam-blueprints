import supabase from "@/lib/supabaseClient";
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const moveEdgeTool = createTool({
    id: "move-edge",
    description: "Move an entry in the blueprint_edges table",
    inputSchema: z.object({
        edgeId: z.string().uuid().describe("The id of the edge to move"),
        position: z.number().int().describe("The new position of the edge"),
        parentId: z
            .string()
            .uuid()
            .optional()
            .describe("The new parent id of the edge. Can be the same as the current parent id."),
    }),
    outputSchema: z.object({
        success: z.boolean(),
        error: z.string().optional(),
    }),
    execute: async ({ context }) => {
        const { edgeId, position, parentId } = context;

        try {
            // First, get the current edge to understand its current state
            const { data: currentEdge, error: fetchError } = await supabase
                .from("blueprint_edges")
                .select("position, parent_id, blueprint_id")
                .eq("edget_id", edgeId)
                .single();

            if (fetchError) {
                return {
                    success: false,
                    error: fetchError.message,
                };
            }

            if (!currentEdge) {
                return {
                    success: false,
                    error: "Edge not found",
                };
            }

            const currentPosition = currentEdge.position;
            const currentParentId = currentEdge.parent_id;
            const targetParentId = parentId ?? currentParentId;

            // If moving to a different parent, handle it as a special case
            if (currentParentId !== targetParentId) {
                // Remove from current parent's positions
                if (currentParentId !== null) {
                    const { data: affectedEdges } = await supabase
                        .from("blueprint_edges")
                        .select("edget_id, position")
                        .eq("parent_id", currentParentId)
                        .gte("position", currentPosition + 1);

                    if (affectedEdges) {
                        for (const edge of affectedEdges) {
                            await supabase
                                .from("blueprint_edges")
                                .update({ position: edge.position - 1 })
                                .eq("edget_id", edge.edget_id);
                        }
                    }
                }

                // Add to new parent's positions
                if (targetParentId !== null) {
                    const { data: affectedEdges } = await supabase
                        .from("blueprint_edges")
                        .select("edget_id, position")
                        .eq("parent_id", targetParentId)
                        .gte("position", position);

                    if (affectedEdges) {
                        for (const edge of affectedEdges) {
                            await supabase
                                .from("blueprint_edges")
                                .update({ position: edge.position + 1 })
                                .eq("edget_id", edge.edget_id);
                        }
                    }
                }

                // Update the edge itself
                await supabase
                    .from("blueprint_edges")
                    .update({ position, parent_id: targetParentId })
                    .eq("edget_id", edgeId);
            } else {
                // Moving within the same parent
                if (currentPosition === position) {
                    // No movement needed
                    return {
                        success: true,
                    };
                }

                if (currentPosition < position) {
                    // Moving down: shift positions between current and target down by 1
                    if (currentParentId !== null) {
                        const { data: affectedEdges } = await supabase
                            .from("blueprint_edges")
                            .select("edget_id, position")
                            .eq("parent_id", currentParentId)
                            .gt("position", currentPosition)
                            .lte("position", position);

                        if (affectedEdges) {
                            for (const edge of affectedEdges) {
                                await supabase
                                    .from("blueprint_edges")
                                    .update({ position: edge.position - 1 })
                                    .eq("edget_id", edge.edget_id);
                            }
                        }
                    }
                } else {
                    // Moving up: shift positions between target and current up by 1
                    if (currentParentId !== null) {
                        const { data: affectedEdges } = await supabase
                            .from("blueprint_edges")
                            .select("edget_id, position")
                            .eq("parent_id", currentParentId)
                            .gte("position", position)
                            .lt("position", currentPosition);

                        if (affectedEdges) {
                            for (const edge of affectedEdges) {
                                await supabase
                                    .from("blueprint_edges")
                                    .update({ position: edge.position + 1 })
                                    .eq("edget_id", edge.edget_id);
                            }
                        }
                    }
                }

                // Update the edge itself
                await supabase.from("blueprint_edges").update({ position }).eq("edget_id", edgeId);
            }

            return {
                success: true,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error occurred",
            };
        }
    },
});
