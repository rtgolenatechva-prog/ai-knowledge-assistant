"use client";

import { useState } from "react";
import {
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Settings,
  Sparkles,
  Trash2,
  LogOut,
} from "lucide-react";
import { Conversation } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { groupConversationsByDate } from "@/lib/group-by-date";
import { SettingsDialog } from "@/components/SettingsDialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  creating: boolean;
}

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onCreate,
  onDelete,
  creating,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const groups = groupConversationsByDate(conversations);

  return (
    <aside
      className={cn(
        "flex h-[40vh] w-full min-h-0 flex-col gap-3 border-b bg-sidebar p-3 text-sidebar-foreground transition-[width] duration-150 md:h-full md:border-b-0 md:border-r",
        collapsed ? "md:w-16" : "md:w-72"
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
                <p className="px-2 pt-1 text-xs font-medium text-muted-foreground">{group.label}</p>
              )}
              {group.items.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    "group flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-sidebar-accent",
                    c.id === activeId && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
                  {!collapsed && (
                    <>
                      <button
                        className="min-w-0 flex-1 truncate text-left"
                        onClick={() => onSelect(c.id)}
                      >
                        {c.title}
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <button
                              className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                              aria-label={`Delete ${c.title}`}
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          }
                        />
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
                            <AlertDialogDescription>
                              &ldquo;{c.title}&rdquo; and all its messages will be permanently
                              deleted. This can&apos;t be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="border-t-0 bg-transparent">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-white hover:bg-destructive/90"
                              onClick={() => onDelete(c.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
          {conversations.length === 0 && !collapsed && (
            <p className="px-2 py-1 text-sm text-muted-foreground">No conversations yet.</p>
          )}
        </div>
      </ScrollArea>

      <Separator />

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
                <p className="min-w-0 flex-1 truncate text-left text-sm text-muted-foreground">
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
    </aside>
  );
}
