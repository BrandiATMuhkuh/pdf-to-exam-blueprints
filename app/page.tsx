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
import { useState } from "react"
import { z } from "zod"

export default function Page() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { object, submit, isLoading, error } = useObject({
    api: "/api/analyze",
    schema: z.object({
      blueprints: z.array(
        z.object({
          name: z.string(),
          description: z.string().optional(),
        })
      ),
    }),
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
            </div>
            {object?.blueprints ? (
              <div className="mt-6">
                <Card className="w-full max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle>Detected Blueprints</CardTitle>
                    <CardDescription>Preview of extracted structure</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm">
                      {JSON.stringify(object.blueprints, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </div>
          <ChatSidebar className="hidden md:block" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
