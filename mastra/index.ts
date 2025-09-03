import { Mastra } from "@mastra/core/mastra";

import { blueprintAgent } from "./agents/blueprint-agent";
import { weatherAgent } from "./agents/weather-agent";

export const mastra = new Mastra({
    agents: { weatherAgent, blueprintAgent },
});
