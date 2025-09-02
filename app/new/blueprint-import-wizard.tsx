"use client";

import { experimental_useObject as useObject } from "@ai-sdk/react";
import { useEffect, useState } from "react";
import type { BlueprintObject } from "../api/analyze/schema";
import { blueprintSchema } from "../api/analyze/schema";
import { ImportStep } from "./import-step";
import { SelectStep } from "./select-step";

export type UiBlueprint = {
    readonly name: string;
    readonly description?: string;
    readonly ai_notes: string;
    readonly possibleDuplicateOf?: string;
    isSelected: boolean;
    status: "idle" | "importing" | "done" | "error";
    blueprintId?: string;
};

export type FilePayload = {
    fileName: string;
    fileType: string;
    fileBase64: string;
};

export function BlueprintImportWizard() {
    const [wizardStep, setWizardStep] = useState<"import" | "select">("import");
    const [blueprints, setBlueprints] = useState<UiBlueprint[]>([]);
    const [filePayload, setFilePayload] = useState<FilePayload | null>(null);
    const [isImporting, setIsImporting] = useState<boolean>(false);
    const [importedCount, setImportedCount] = useState<number>(0);
    const [plannedImportCount, setPlannedImportCount] = useState<number>(0);

    const { object, submit, isLoading, error } = useObject({
        api: "/api/analyze",
        schema: blueprintSchema,
    });

    useEffect(() => {
        if (!object?.blueprints) return;
        const sourceBlueprints: BlueprintObject["blueprints"] = (object.blueprints ??
            []) as BlueprintObject["blueprints"];
        const nextBlueprints: UiBlueprint[] = sourceBlueprints.map((bp) => ({
            name: bp.name,
            description: bp.description,
            ai_notes: bp.ai_notes,
            possibleDuplicateOf: bp.possibleDuplicateOf,
            isSelected: true,
            status: "idle",
        }));
        setBlueprints(nextBlueprints);
        setWizardStep("select");
        console.log("analyze-completed", { count: nextBlueprints.length });
    }, [object?.blueprints]);

    function handleToggleBlueprint(index: number): void {
        setBlueprints((prev) =>
            prev.map((bp, i) => (i === index ? { ...bp, isSelected: !bp.isSelected } : bp))
        );
    }

    async function handleImportSelected(): Promise<void> {
        if (!filePayload) {
            console.log("import", { message: "Missing file payload" });
            return;
        }
        const selectedCount = blueprints.filter((b) => b.isSelected).length;
        if (selectedCount === 0) {
            console.log("import", { message: "No blueprints selected" });
            return;
        }
        setIsImporting(true);
        setImportedCount(0);
        setPlannedImportCount(selectedCount);
        for (let i = 0; i < blueprints.length; i++) {
            const bp = blueprints[i];
            if (!bp?.isSelected) continue;
            setBlueprints((prev) =>
                prev.map((b, idx) => (idx === i ? { ...b, status: "importing" } : b))
            );
            try {
                const res = await fetch("/api/import", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: bp.name,
                        description: bp.description,
                        ai_notes: bp.ai_notes,
                        ...filePayload,
                    }),
                });
                if (!res.ok) throw new Error("Import failed");
                const json = (await res.json()) as {
                    success?: boolean;
                    blueprint_id?: string | number;
                };
                if (
                    !json?.success ||
                    json.blueprint_id === undefined ||
                    json.blueprint_id === null
                ) {
                    throw new Error("Invalid response");
                }
                setBlueprints((prev) =>
                    prev.map((b, idx) =>
                        idx === i
                            ? {
                                  ...b,
                                  status: "done",
                                  blueprintId: String(json.blueprint_id),
                                  isSelected: false,
                              }
                            : b
                    )
                );
                setImportedCount((c) => c + 1);
                console.log("import-progress", {
                    current: i + 1,
                    total: selectedCount,
                    name: bp.name,
                });
            } catch {
                console.log("error", { message: "Failed to import blueprint", name: bp.name });
                setBlueprints((prev) =>
                    prev.map((b, idx) => (idx === i ? { ...b, status: "error" } : b))
                );
            }
        }
        setIsImporting(false);
    }

    return (
        <>
            {wizardStep === "import" ? (
                <ImportStep
                    onSubmit={submit}
                    onFilePayloadSet={setFilePayload}
                    isLoading={isLoading}
                    error={error}
                />
            ) : (
                <SelectStep
                    blueprints={blueprints}
                    onToggleBlueprint={handleToggleBlueprint}
                    onImportSelected={handleImportSelected}
                    onBack={() => setWizardStep("import")}
                    isImporting={isImporting}
                    importedCount={importedCount}
                    plannedImportCount={plannedImportCount}
                />
            )}
        </>
    );
}
