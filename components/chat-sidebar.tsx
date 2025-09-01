"use client";
import * as React from "react";

import { ChatPanel } from "@/components/chat-panel";
import {
  Sidebar,
  SidebarContent,
  SidebarRail,
} from "@/components/ui/sidebar";

export function ChatSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar side="right" {...props}>
      <SidebarContent className="p-2">
        <div className="h-full w-full">
          <ChatPanel className="h-full w-full" />
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}


