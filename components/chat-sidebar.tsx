"use client";
import * as React from "react";

import { ChatPanel } from "@/components/chat-panel";
import {
  Sidebar,
  SidebarContent,
  SidebarRail,
} from "@/components/ui/sidebar";

export function ChatSidebar({
  style,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      side="right"
      style={{
        "--sidebar-width": "24rem",
        ...(style as React.CSSProperties),
      } as React.CSSProperties}
      {...props}
    >
      <SidebarContent className="p-2">
        <div className="h-full w-full">
          <ChatPanel />
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}


