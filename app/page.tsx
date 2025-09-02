"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { ChatSidebar } from "@/components/chat-sidebar"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { experimental_useObject as useObject } from "@ai-sdk/react"
import { useEffect, useState } from "react"
import type { BlueprintObject } from "./api/analyze/schema"
import { blueprintSchema } from "./api/analyze/schema"


export default function Page() {
  type UiBlueprint = {
    readonly name: string
    readonly description?: string
    readonly ai_notes: string
    isSelected: boolean
    status: "idle" | "importing" | "done" | "error"
    blueprintId?: string
  }

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [wizardStep, setWizardStep] = useState<"import" | "select">("import")
  const [blueprints, setBlueprints] = useState<UiBlueprint[]>([])
  const [filePayload, setFilePayload] = useState<{ fileName: string; fileType: string; fileBase64: string } | null>(null)
  const [isImporting, setIsImporting] = useState<boolean>(false)
  const [importedCount, setImportedCount] = useState<number>(0)
  const [plannedImportCount, setPlannedImportCount] = useState<number>(0)
  const { object, submit, isLoading, error } = useObject({
    api: "/api/analyze",
    schema: blueprintSchema,
  })

  function handleSelectFile(event: React.ChangeEvent<HTMLInputElement>): void {
    const nextFile = event.target.files?.[0] ?? null
    setSelectedFile(nextFile)
    if (nextFile) {
      console.log("file-selected", { name: nextFile.name, size: nextFile.size })
    } else {
      console.log("file-cleared")
    }
  }

  function handleAnalyze(): void {
    if (!selectedFile) {
      console.log("analyze", { message: "No file selected" })
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1] ?? ""
      const payload = {
        fileName: selectedFile.name,
        fileType: selectedFile.type || "application/pdf",
        fileBase64: base64,
      }
      setFilePayload(payload)
      submit(payload)
    }
    reader.readAsDataURL(selectedFile)
  }

  useEffect(() => {
    if (!object?.blueprints) return
    const sourceBlueprints: BlueprintObject["blueprints"] = (object.blueprints ?? []) as BlueprintObject["blueprints"]
    const nextBlueprints: UiBlueprint[] = sourceBlueprints.map((bp) => ({
      name: bp.name,
      description: bp.description,
      ai_notes: bp.ai_notes,
      isSelected: true,
      status: "idle",
    }))
    setBlueprints(nextBlueprints)
    setWizardStep("select")
    console.log("analyze-completed", { count: nextBlueprints.length })
  }, [object?.blueprints])

  function handleToggleBlueprint(index: number): void {
    setBlueprints((prev) =>
      prev.map((bp, i) => (i === index ? { ...bp, isSelected: !bp.isSelected } : bp))
    )
  }

  async function handleImportSelected(): Promise<void> {
    if (!filePayload) {
      console.log("import", { message: "Missing file payload" })
      return
    }
    const selectedCount = blueprints.filter((b) => b.isSelected).length
    if (selectedCount === 0) {
      console.log("import", { message: "No blueprints selected" })
      return
    }
    setIsImporting(true)
    setImportedCount(0)
    setPlannedImportCount(selectedCount)
    for (let i = 0; i < blueprints.length; i++) {
      const bp = blueprints[i]
      if (!bp?.isSelected) continue
      setBlueprints((prev) => prev.map((b, idx) => (idx === i ? { ...b, status: "importing" } : b)))
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
        })
        if (!res.ok) throw new Error("Import failed")
        const json = (await res.json()) as { success?: boolean; blueprint_id?: string | number }
        if (!json?.success || json.blueprint_id === undefined || json.blueprint_id === null) {
          throw new Error("Invalid response")
        }
        setBlueprints((prev) =>
          prev.map((b, idx) =>
            idx === i ? { ...b, status: "done", blueprintId: String(json.blueprint_id), isSelected: false } : b
          )
        )
        setImportedCount((c) => c + 1)
        console.log("import-progress", { current: i + 1, total: selectedCount, name: bp.name })
      } catch {
        console.log("error", { message: "Failed to import blueprint", name: bp.name })
        setBlueprints((prev) => prev.map((b, idx) => (idx === i ? { ...b, status: "error" } : b)))
      }
    }
    setIsImporting(false)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  Building Your Application
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex min-h-0 flex-1 gap-4 p-4">
          <div className="bg-card text-card-foreground flex-1 overflow-auto rounded-xl border p-4">
            <div className="flex w-full justify-center">
              {wizardStep === "import" ? (
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle>Import Blueprint PDF</CardTitle>
                    <CardDescription>
                      Select a PDF to analyze. No upload will happen yet.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid w-full max-w-sm items-center gap-2">
                      <Label htmlFor="pdf">PDF file</Label>
                      <Input id="pdf" type="file" accept="application/pdf" onChange={handleSelectFile} />
                      {selectedFile ? (
                        <p className="text-muted-foreground truncate text-sm">{selectedFile.name}</p>
                      ) : null}
                      {error ? (
                        <p className="text-destructive text-sm">Something went wrong.</p>
                      ) : null}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="button" onClick={handleAnalyze} disabled={!selectedFile || isLoading}>
                      Analyze
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <Card className="w-full max-w-2xl">
                  <CardHeader>
                    <CardTitle>Select Blueprints to Import</CardTitle>
                    <CardDescription>
                      {blueprints.length} blueprint{blueprints.length === 1 ? "" : "s"} detected.
                      Choose which ones to import.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {blueprints.map((bp, index) => (
                        <label key={bp.name + index} className="flex cursor-pointer items-start justify-between gap-3 rounded-md border p-3 hover:bg-muted/40">
                          <div className="flex gap-3">
                            <input
                              type="checkbox"
                              checked={bp.isSelected}
                              onChange={() => handleToggleBlueprint(index)}
                              className="mt-1 h-4 w-4"
                              aria-label={`Select ${bp.name}`}
                              disabled={isImporting}
                            />
                            <div className="min-w-0">
                              <p className="font-medium leading-none">{bp.name}</p>
                              {bp.description ? (
                                <p className="text-muted-foreground mt-1 text-sm line-clamp-2">{bp.description}</p>
                              ) : null}
                            </div>
                          </div>
                          <div className="pl-2">
                            {bp.status === "done" && bp.blueprintId ? (
                              <a href={`/bp/${bp.blueprintId}`} aria-label={`Open ${bp.name}`}>
                                <Badge variant="secondary" className="bg-green-500">Done</Badge>
                              </a>
                            ) : bp.status === "importing" ? (
                              <Badge variant="outline">Importing…</Badge>
                            ) : bp.status === "error" ? (
                              <Badge variant="destructive">Error</Badge>
                            ) : null}
                          </div>
                        </label>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between">
                    <Button type="button" variant="outline" onClick={() => setWizardStep("import")}>
                      Back
                    </Button>
                    <div className="flex items-center gap-3">
                      {isImporting ? (
                        <p className="text-muted-foreground text-sm">
                          Importing {importedCount}/{plannedImportCount}
                        </p>
                      ) : null}
                      <Button type="button" onClick={handleImportSelected} disabled={isImporting}>
                        Import
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              )}
            </div>
          </div>
          <ChatSidebar className="hidden md:block" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
