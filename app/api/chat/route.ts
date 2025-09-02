import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, UIMessage } from "ai";


// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    model,
    webSearch,
  }: { messages: UIMessage[]; model: string; webSearch: boolean } =
    await req.json();

  const result = streamText({
    model: openai("gpt-5"),
    messages: convertToModelMessages(messages),
    system:
      `You are an agent that extract a exam blueprint from a PDF file. And helps build
and adjust the blueprint to the user's needs.

When given a file, you job is to first find out if the document has one or many exam blueprints. 

In case it has many, you ask the user which one to create. Use a numbered list. And make sure you list all of them.

After the user responded, you extract each on individually into a table
      `,

    providerOptions: {
      openai: {
        reasoningEffort: "low",
        summary: "auto"
      },
    },
  });

  // send sources and reasoning back to the client
  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
    sendFinish: true,
    sendStart: true
  });
}