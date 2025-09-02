import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { z } from "zod";
import { blueprintSchema } from "./schema";

export const maxDuration = 60;
export const runtime = "nodejs";

const requestSchema = z.object({
    // base64-encoded file, small for demo; in production use multipart/form-data
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

    const { fileType, fileBase64 } = parsed.data;

    const { experimental_output } = await generateText({
        model: openai("gpt-5"),
        system: `Find all exam blueprints in this file. A blueprint in this case is not the content (table) but the topic. Some pdfs have multiple blueprints.`,
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "file",
                        data: fileBase64,
                        mediaType: fileType,
                    },
                ],
            },
        ],
        maxOutputTokens: 10000,
        experimental_output: Output.object({
            schema: blueprintSchema,
        }),
    });
    console.log("experimental_output", experimental_output);
    return Response.json(experimental_output);
}
