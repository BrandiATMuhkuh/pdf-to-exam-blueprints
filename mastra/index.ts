import { Mastra } from "@mastra/core/mastra";
import { LibSQLStore } from "@mastra/libsql";
import { PinoLogger } from "@mastra/loggers";

import { blueprintAgent } from "./agents/blueprint-agent";
import { weatherAgent } from "./agents/weather-agent";

export const mastra = new Mastra({
    agents: { weatherAgent, blueprintAgent },
    storage: new LibSQLStore({
        // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
        url: ":memory:",
    }),
    logger: new PinoLogger({
        name: "Mastra",
        level: "info",
    }),
});
