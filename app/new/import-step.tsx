"use client";

import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import type { FilePayload } from "./blueprint-import-wizard";

interface ImportStepProps {
    onSubmit: (payload: FilePayload) => void;
    onFilePayloadSet: (payload: FilePayload) => void;
    isLoading: boolean;
    error: unknown;
}

export function ImportStep({ onSubmit, onFilePayloadSet, isLoading, error }: ImportStepProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    function handleSelectFile(event: React.ChangeEvent<HTMLInputElement>): void {
        const nextFile = event.target.files?.[0] ?? null;
        setSelectedFile(nextFile);
        if (nextFile) {
            console.log("file-selected", { name: nextFile.name, size: nextFile.size });
        } else {
            console.log("file-cleared");
        }
    }

    function handleAnalyze(): void {
        if (!selectedFile) {
            console.log("analyze", { message: "No file selected" });
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = (reader.result as string).split(",")[1] ?? "";
            const payload: FilePayload = {
                fileName: selectedFile.name,
                fileType: selectedFile.type || "application/pdf",
                fileBase64: base64,
            };
            onFilePayloadSet(payload);
            onSubmit(payload);
        };
        reader.readAsDataURL(selectedFile);
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Import Blueprint PDF</CardTitle>
                <CardDescription>
                    Select a PDF to analyze. Convert other files to PDF first. Open and print to
                    PDF.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid w-full max-w-sm items-center gap-2">
                    <Label htmlFor="pdf">PDF file</Label>
                    <Input
                        id="pdf"
                        type="file"
                        accept="application/pdf"
                        onChange={handleSelectFile}
                    />
                    {selectedFile ? (
                        <p className="text-muted-foreground truncate text-sm">
                            {selectedFile.name}
                        </p>
                    ) : null}
                    {error ? (
                        <p className="text-destructive text-sm">Something went wrong.</p>
                    ) : null}
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={!selectedFile || isLoading}
                    aria-busy={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader size={16} />
                            Analyzing…
                        </>
                    ) : (
                        "Analyze"
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
