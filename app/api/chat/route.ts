import supabase from "@/lib/supabaseClient";
import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, stepCountIs, streamText, tool, UIMessage } from "ai";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const {
        messages,
        blueprintId,
    }: { messages: UIMessage[]; model?: string; webSearch?: boolean; blueprintId: string } =
        await req.json();

    console.log("blueprintId", blueprintId);

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

    const result = streamText({
        model: openai("gpt-5"),
        messages: convertToModelMessages(messages),
        system: `You are an agent that helps to build and adjust examp blueprints. 
Your job is to to add, update, delete, move entries. 
Each entry has a position, just append (get next highest number).

If possible, check if the wait's are correct. They must not exceed 100%.

Important, the user can not select anything on the UI or knows any ID. So you must find it out by yourself.


The following is the current state of the blueprint:

\`\`\`json
${JSON.stringify(edges, null, 2)}
\`\`\`


      `,
        stopWhen: stepCountIs(5),
        tools: {
            addEdge,
        },

        providerOptions: {
            openai: {
                reasoningEffort: "low",
                summary: "auto",
            },
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
