import supabase from "@/lib/supabaseClient";
import { openai, OpenAIResponsesProviderOptions } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { v4 } from "uuid";
import { z } from "zod/v4";

export const maxDuration = 60;
export const runtime = "nodejs";

const requestSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    ai_notes: z.string().min(1),
    fileName: z.string().min(1),
    fileType: z.string().min(1),
    fileBase64: z.string().min(1),
});

export async function POST(req: Request) {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
        return new Response("Invalid request", { status: 400 });
    }

    const { name, description, ai_notes, fileName, fileType, fileBase64 } = parsed.data;

    const uuids = Array.from({ length: 100 }, () => v4());

    const { experimental_output } = await generateText({
        model: openai.responses("gpt-5"),

        providerOptions: {
            openai: {
                reasoningEffort: "minimal",
                textVerbosity: "low",
            } satisfies OpenAIResponsesProviderOptions,
        },

        system: `Your job is to extract the blueprint table for the provided file. A file can often include multiple blueprints. 
      So make sure you only extra for this blueprint
      - name: ${name}
      - description: ${description}
      - ai_notes: ${ai_notes}

      The content of the above list was extracted from the same file before. It might not be a 1:1 match. 
      The ai_notes are to to help you find the right blueprint in the file. 

      Please do some clearnup around row numbers. You will often find auto generated prefixes like "1.", "2.", "3.", "a.", "b.", "c.", "II.", "III.", "IV.", "V.", "VI.", "VII.", "VIII.", "IX.", "X." and so on. You can ignore them. Because that's part of the position and parents/child relationship now

      Since you might need UUIDs, here is a list to pick from. 

      ${uuids.join("\n")}

      `,

        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "file",
                        data: fileBase64,
                        mediaType: fileType,
                        filename: fileName,
                    },
                ],
            },
        ],
        maxOutputTokens: 80000,
        experimental_output: Output.object({
            schema: z.object({
                edges: z.array(
                    z.object({
                        edget_id: z.uuid(),
                        title: z.string().min(1),
                        description: z.string().optional(),
                        weight: z.number().int().min(0).max(100).optional(),
                        position: z.number().int(),
                        parent_id: z
                            .uuid()
                            .optional()
                            .describe(
                                "The parent id is the edget_id this entry belong to. If it's a root entry, this is undefined."
                            ),
                    })
                ),
            }),
        }),
    });

    // let's save the blueprint to the DB

    const { data: blueprintData, error: blueprintError } = await supabase
        .from("blueprints")
        .insert({
            name,
            description,
            ai_notes,
        })
        .select()
        .single();

    if (blueprintError) {
        console.log("blueprintError", blueprintError);
        throw new Error(`Failed to save blueprint: ${blueprintError.message}`);
    }

    const { blueprint_id } = blueprintData;

    // let's save the edges to the DB
    const { error: edgesError } = await supabase
        .from("blueprint_edges")
        .insert(experimental_output.edges.map((edge) => ({ ...edge, blueprint_id })));
    if (edgesError) {
        console.log("edgesError", edgesError);
        throw new Error(`Failed to save edges: ${edgesError.message}`);
    }

    // In a future implementation, persist the blueprint and file here.
    return Response.json({ success: true, blueprint_id: blueprint_id });
}
