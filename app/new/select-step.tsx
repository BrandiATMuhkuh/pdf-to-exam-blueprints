"use client";

import { Loader } from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { UiBlueprint } from "./blueprint-import-wizard";

interface SelectStepProps {
    blueprints: UiBlueprint[];
    onToggleBlueprint: (index: number) => void;
    onImportSelected: () => Promise<void>;
    onBack: () => void;
    isImporting: boolean;
    importedCount: number;
    plannedImportCount: number;
}

export function SelectStep({
    blueprints,
    onToggleBlueprint,
    onImportSelected,
    onBack,
    isImporting,
    importedCount,
    plannedImportCount,
}: SelectStepProps) {
    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>Select Blueprints to Import</CardTitle>
                <CardDescription>
                    {blueprints.length} blueprint{blueprints.length === 1 ? "" : "s"} detected.
                    Choose which ones to import. Imports can take several minutes per blueprint.
                    Please keep this page open during the process.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {blueprints.map((bp, index) => (
                        <label
                            key={bp.name + index}
                            className="flex cursor-pointer items-start justify-between gap-3 rounded-md border p-3 hover:bg-muted/40"
                        >
                            <div className="flex gap-3">
                                <input
                                    type="checkbox"
                                    checked={bp.isSelected}
                                    onChange={() => onToggleBlueprint(index)}
                                    className="mt-1 h-4 w-4"
                                    aria-label={`Select ${bp.name}`}
                                    disabled={isImporting}
                                />
                                <div className="min-w-0">
                                    <p className="font-medium leading-none">{bp.name}</p>
                                    {bp.description ? (
                                        <p className="text-muted-foreground mt-1 text-sm line-clamp-2">
                                            {bp.description}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                            <div className="pl-2 flex flex-col gap-1">
                                {bp.possibleDuplicateOf && (
                                    <Badge
                                        variant="outline"
                                        className="text-orange-600 border-orange-600"
                                        title={bp.possibleDuplicateOf}
                                    >
                                        Duplicate
                                    </Badge>
                                )}
                                {bp.status === "done" && bp.blueprintId ? (
                                    <a
                                        href={`/bp/${bp.blueprintId}`}
                                        aria-label={`Open ${bp.name}`}
                                    >
                                        <Badge variant="secondary" className="bg-green-500">
                                            Done
                                        </Badge>
                                    </a>
                                ) : bp.status === "importing" ? (
                                    <Badge variant="outline" className="gap-2">
                                        <Loader size={12} />
                                        Importing…
                                    </Badge>
                                ) : bp.status === "error" ? (
                                    <Badge variant="destructive">Error</Badge>
                                ) : null}
                            </div>
                        </label>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
                <Button type="button" variant="outline" onClick={onBack}>
                    Back
                </Button>
                <div className="flex items-center gap-3">
                    {isImporting ? (
                        <p className="text-muted-foreground text-sm">
                            Importing {importedCount}/{plannedImportCount}—this can take many
                            minutes!!!
                        </p>
                    ) : null}
                    <Button
                        type="button"
                        onClick={onImportSelected}
                        disabled={isImporting}
                        aria-busy={isImporting}
                        className="gap-2"
                    >
                        {isImporting ? (
                            <>
                                <Loader size={16} />
                                Importing…
                            </>
                        ) : (
                            "Import"
                        )}
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
