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
import { useState } from "react"

export default function Page() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

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
    console.log("analyze", { name: selectedFile.name, size: selectedFile.size })
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
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="button" onClick={handleAnalyze} disabled={!selectedFile}>
                    Analyze
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
          <ChatSidebar className="hidden md:block" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
