"use client";

import { BluePrintWithContent } from "./blueprint-types";

export function BlueprintHeader({ blueprint }: { blueprint: BluePrintWithContent }) {
    return (
        <div className="flex flex-col gap-4">
            <div className="text-2xl font-semibold">{blueprint.name}</div>
            <div className="text-muted-foreground">{blueprint.description}</div>
        </div>
    );
}
