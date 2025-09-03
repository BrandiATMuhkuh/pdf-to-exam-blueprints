import supabase from "@/lib/supabaseClient";
import { openai, OpenAIResponsesProviderOptions } from "@ai-sdk/openai";
import { convertToModelMessages, stepCountIs, streamText, tool, UIMessage } from "ai";
import { z } from "zod/v4";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const {
        messages,
        blueprintId,
    }: { messages: UIMessage[]; model?: string; webSearch?: boolean; blueprintId: string } =
        await req.json();

    // lets load the current edges
    const { data, error } = await supabase
        .from("blueprint_edges")
        .select("*")
        .eq("blueprint_id", blueprintId);

    if (error) {
        console.log("error", error);
        throw new Error(`Failed to load edges: ${error.message}`);
    }

    const edges = data;

    /// TOOLS
    const addEdge = tool({
        description: "Add an entry to the blueprint_edges table",
        inputSchema: z.object({
            title: z.string().min(1).describe("The title of the topic or sub-topic"),
            description: z
                .string()
                .optional()
                .describe("Optional description for the topic or sub-topic"),
            weight: z
                .number()
                .int()
                .min(0)
                .max(100)
                .describe("Relative weight (0-100) for this node"),
            position: z.number().int().describe("Ordering index within its siblings"),
            parentId: z
                .string()
                // .uuid()
                .nullable()
                .optional()
                .describe("Parent edge id if this is a sub-topic; null for root"),
        }),
        execute: async ({ title, description = "", weight, position, parentId }) => {
            if (!blueprintId) {
                throw new Error("Missing blueprintId for addEdge tool");
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
                throw new Error(`Failed to insert edge: ${error.message}`);
            }
            return data;
        },
    });

    const updateEdge = tool({
        description:
            "Update an entry in the blueprint_edges table. This does NOT allow you to move a node!",
        inputSchema: z.object({
            edgeId: z.string().uuid().describe("The id of the edge to update"),
            title: z.string().min(1).describe("The title of the topic or sub-topic"),
            description: z
                .string()
                .optional()
                .describe("The description of the topic or sub-topic"),
            weight: z
                .number()
                .int()
                .min(0)
                .max(100)
                .describe("The weight of the topic or sub-topic"),
        }),
        execute: async ({ edgeId, title, description, weight }) => {
            const { error } = await supabase
                .from("blueprint_edges")
                .update({ title, description, weight })
                .eq("edget_id", edgeId);

            if (error) {
                throw error;
            }
        },
    });

    const moveEdge = tool({
        description: "Move an entry in the blueprint_edges table",
        inputSchema: z.object({
            edgeId: z.uuid().describe("The id of the edge to move"),
            position: z.number().int().describe("The new position of the edge"),
            parentId: z
                .uuid()
                .optional()
                .describe(
                    "The new parent id of the edge. Can be the same as the current parent id."
                ),
        }),
        execute: async ({ edgeId, position, parentId }) => {
            // First, get the current edge to understand its current state
            const { data: currentEdge, error: fetchError } = await supabase
                .from("blueprint_edges")
                .select("position, parent_id, blueprint_id")
                .eq("edget_id", edgeId)
                .single();

            if (fetchError) {
                throw fetchError;
            }

            if (!currentEdge) {
                throw new Error("Edge not found");
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
                    return;
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
        },
    });

    const updateBlueprint = tool({
        description: "Update the blueprint",
        inputSchema: z.object({
            name: z.string().min(1).describe("The name of the blueprint"),
            description: z.string().optional().describe("The description of the blueprint"),
        }),
        execute: async ({ name, description }) => {
            const { error } = await supabase
                .from("blueprints")
                .update({ name, description })
                .eq("blueprint_id", blueprintId);

            if (error) {
                throw error;
            }
        },
    });

    const result = streamText({
        model: openai.responses("gpt-5"),
        messages: convertToModelMessages(messages),
        system: `You are an agent that helps to build and adjust examp blueprints. 
Your job is to to add, update, delete, move entries. 
Each entry has a position, just append (get next highest number).

If possible, check if the wait's are correct. They must not exceed 100%.

Important, the user can not select anything on the UI or knows any ID. So you must find it out by yourself.

Keep your output very short. You can of just say "done adding xyz". 

The following is the current state of the blueprint:

\`\`\`json
${JSON.stringify(edges, null, 2)}
\`\`\`


      `,
        stopWhen: stepCountIs(10),
        tools: {
            addEdge,
            updateEdge,
            updateBlueprint,
            moveEdge,
        },

        providerOptions: {
            openai: {
                reasoningEffort: "minimal",
                reasoningSummary: "auto",
            } satisfies OpenAIResponsesProviderOptions,
        },
    });

    // send sources and reasoning back to the client
    return result.toUIMessageStreamResponse({
        sendSources: true,
        sendReasoning: true,
        sendFinish: true,
        sendStart: true,
    });
}
