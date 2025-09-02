import { z } from "zod";

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

    console.log("parsed", parsed.data.name);
    // In a future implementation, persist the blueprint and file here.
    return Response.json({ success: true, blueprint_id: Math.random() });
}
