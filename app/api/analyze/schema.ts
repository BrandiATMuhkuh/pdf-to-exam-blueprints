import { z } from "zod";

export const blueprintSchema = z.object({
    blueprints: z
        .array(
            z.object({
                name: z.string().min(1).describe("Name of the blueprint in the document."),
                description: z.string().optional().describe("Optional document context."),
            })
        )
        .min(1)
        .describe("All blueprints found in the file; most files have one."),
});

export type BlueprintObject = z.infer<typeof blueprintSchema>;
