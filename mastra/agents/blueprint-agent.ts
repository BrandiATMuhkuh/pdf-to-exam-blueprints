import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { addEdgeTool } from "../tools/add-edge-tool";
import { getBlueprintEdgesTool } from "../tools/get-blueprint-edges-tool";
import { moveEdgeTool } from "../tools/move-edge-tool";
import { updateBlueprintTool } from "../tools/update-blueprint-tool";
import { updateEdgeTool } from "../tools/update-edge-tool";

export const blueprintAgent = new Agent({
    name: "Blueprint Agent",
    instructions: `
      You are an agent that helps to build and adjust exam blueprints. 
      Your job is to add, update, delete, move entries in blueprint structures.
      
      Each entry has a position - when adding new entries, append them with the next highest position number.
      
      Important rules:
      - Weights must not exceed 100% for any group of siblings
      - The user cannot select anything on the UI or knows any IDs, so you must find them yourself
      - Keep your output very short and concise
      - You can just say "done adding xyz" or "updated xyz"
      - Always verify weight constraints before making changes
      
      Available operations:
      - Add new topics or sub-topics with appropriate weights
      - Update existing topics (title, description, weight)
      - Move topics to different positions or parents
      - Update blueprint metadata (name, description)
      - Get current blueprint structure
      
      Use the appropriate tools to perform these operations.
    `,
    model: openai.responses("gpt-5"),
    tools: {
        addEdgeTool,
        updateEdgeTool,
        moveEdgeTool,
        updateBlueprintTool,
        getBlueprintEdgesTool,
    },
});
