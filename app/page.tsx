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
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function Page() {
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
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <div className="bg-muted/50 aspect-video rounded-xl" />
              <div className="bg-muted/50 aspect-video rounded-xl" />
              <div className="bg-muted/50 aspect-video rounded-xl" />
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border-b px-3 py-2 text-left text-sm font-medium">Name</th>
                    <th className="border-b px-3 py-2 text-left text-sm font-medium">Description</th>
                    <th className="border-b px-3 py-2 text-left text-sm font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="even:bg-muted/20">
                      <td className="border-b px-3 py-2 text-sm">Blueprint {i + 1}</td>
                      <td className="border-b px-3 py-2 text-sm">Dummy description for preview</td>
                      <td className="border-b px-3 py-2 text-sm">2025-09-01</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <ChatSidebar className="hidden md:block" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
