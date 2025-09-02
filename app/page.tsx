"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { ChatSidebar } from "@/components/chat-sidebar"
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
  }

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [wizardStep, setWizardStep] = useState<"import" | "select">("import")
  const [blueprints, setBlueprints] = useState<UiBlueprint[]>([])
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
      submit({
        fileName: selectedFile.name,
        fileType: selectedFile.type || "application/pdf",
        fileBase64: base64,
      })
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
                        <label key={bp.name + index} className="flex cursor-pointer gap-3 rounded-md border p-3 hover:bg-muted/40">
                          <input
                            type="checkbox"
                            checked={bp.isSelected}
                            onChange={() => handleToggleBlueprint(index)}
                            className="mt-1 h-4 w-4"
                            aria-label={`Select ${bp.name}`}
                          />
                          <div className="min-w-0">
                            <p className="font-medium leading-none">{bp.name}</p>
                            {bp.description ? (
                              <p className="text-muted-foreground mt-1 text-sm line-clamp-2">{bp.description}</p>
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
                    <Button type="button" onClick={() => console.log("import-selected", { selected: blueprints.filter((b) => b.isSelected) })}>
                      Continue
                    </Button>
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
