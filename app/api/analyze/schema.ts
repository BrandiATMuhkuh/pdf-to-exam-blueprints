import { z } from "zod";

export const blueprintSchema = z.object({
    blueprints: z
        .array(
            z.object({
                name: z.string().min(1).describe("Name of the blueprint in the document."),
                description: z.string().optional().describe("Optional document context."),
                ai_notes: z
                    .string()
                    .describe(
                        "Notes for the AI to remember the gist of this exam blueprint in the future."
                    ),
                possibleDuplicateOf: z
                    .string()
                    .optional()
                    .describe(
                        "In case you think this is a dublicate write DUPLICATE. Otherwise keep it undefined."
                    ),
            })
        )
        .describe("All blueprints found in the file; most files have one."),
});

export type BlueprintObject = z.infer<typeof blueprintSchema>;
