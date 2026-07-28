"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/lib/use-media-query";
import {
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings,
  Sparkles,
  LogOut,
} from "lucide-react";
import { Conversation } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { groupConversationsByDate } from "@/lib/group-by-date";
import { SettingsDialog } from "@/components/SettingsDialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ConversationRow } from "@/components/ConversationRow";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onTogglePin: (id: string, pinned: boolean) => void;
  creating: boolean;
}

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onCreate,
  onDelete,
  onRename,
  onTogglePin,
  creating,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [width, setWidth] = useState(288);
  const [resizing, setResizing] = useState(false);
  const asideRef = useRef<HTMLElement>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const groups = groupConversationsByDate(conversations);

  const startResize = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = asideRef.current?.getBoundingClientRect().width ?? 288;
    setResizing(true);

    function onMove(ev: PointerEvent) {
      const next = Math.min(420, Math.max(220, startWidth + (ev.clientX - startX)));
      setWidth(next);
    }
    function onUp() {
      setResizing(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, []);

  useEffect(() => {
    if (!resizing) return;
    const prevCursor = document.body.style.cursor;
    const prevSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    return () => {
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevSelect;
    };
  }, [resizing]);

  return (
    <aside
      ref={asideRef}
      style={isDesktop && !collapsed ? { width } : undefined}
      className={cn(
        "relative flex h-[40vh] w-full min-h-0 flex-col gap-3 border-b bg-sidebar p-3 text-sidebar-foreground md:h-full md:border-b-0 md:border-r",
        !resizing && "transition-[width] duration-150",
        collapsed && "md:w-16"
      )}
    >
      <div className="flex items-center gap-2 px-1 py-1">
        <Sparkles className="size-5 shrink-0 text-foreground" />
        {!collapsed && <span className="flex-1 truncate text-sm font-semibold">Knowledge Assistant</span>}
        <button
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "hidden shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground md:flex",
            collapsed && "mx-auto"
          )}
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>
      </div>

      <Button
        onClick={onCreate}
        disabled={creating}
        aria-label="New conversation"
        className={cn("w-full shrink-0 gap-2", collapsed ? "justify-center px-0" : "justify-start")}
      >
        <Plus className="size-4 shrink-0" />
        {!collapsed && (creating ? "Creating..." : "New conversation")}
      </Button>

      <ScrollArea className="min-h-0 flex-1 -mx-1 px-1">
        <div className="flex flex-col gap-3">
          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              {!collapsed && (
                <p className="px-2 pt-1 text-[11px] font-medium text-muted-foreground">{group.label}</p>
              )}
              {group.items.map((c) =>
                collapsed ? (
                  <button
                    key={c.id}
                    onClick={() => onSelect(c.id)}
                    aria-label={c.title}
                    className={cn(
                      "flex items-center justify-center rounded-lg p-2 hover:bg-sidebar-accent",
                      c.id === activeId && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
                  </button>
                ) : (
                  <ConversationRow
                    key={c.id}
                    conversation={c}
                    active={c.id === activeId}
                    onSelect={onSelect}
                    onRename={onRename}
                    onTogglePin={onTogglePin}
                    onDelete={onDelete}
                  />
                )
              )}
            </div>
          ))}
          {conversations.length === 0 && !collapsed && (
            <p className="px-2 py-1 text-xs text-muted-foreground">No conversations yet.</p>
          )}
        </div>
      </ScrollArea>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              className={cn(
                "flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-sidebar-accent",
                collapsed && "justify-center"
              )}
              aria-label="Account menu"
            >
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                  {user?.email?.[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <p className="min-w-0 flex-1 truncate text-left text-xs text-muted-foreground">
                  {user?.email}
                </p>
              )}
            </button>
          }
        />
        <DropdownMenuContent align="start" side="top" className="w-56">
          <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
            <Settings className="size-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout} aria-label="Log out">
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />

      {!collapsed && (
        <div
          onPointerDown={startResize}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          className="absolute inset-y-0 -right-1 hidden w-2 cursor-col-resize touch-none md:block"
        >
          <div className="mx-auto h-full w-px bg-transparent hover:bg-primary/40" />
        </div>
      )}
    </aside>
  );
}
