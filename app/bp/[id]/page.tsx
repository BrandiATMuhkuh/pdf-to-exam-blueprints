import { AppSidebar } from "@/components/app-sidebar";
import { ChatSidebar } from "@/components/chat-sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import supabase from "@/lib/supabaseClient";
import { BlueprintComponent } from "./blueprint-component";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { data: blueprint } = await supabase
        .from("blueprints")
        .select("*")
        .eq("blueprint_id", id)
        .single();

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="h-svh overflow-hidden">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                    />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="#">Blueprints</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{blueprint?.name}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                <div className="flex min-h-0 flex-1 overflow-hidden gap-4 p-4">
                    <div className="bg-card text-card-foreground h-full flex-1 overflow-auto rounded-xl border p-4">
                        <BlueprintComponent id={id} />
                    </div>
                    <div className="hidden md:flex h-full min-h-0 w-[480px] flex-shrink-0 overflow-hidden">
                        <ChatSidebar />
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
