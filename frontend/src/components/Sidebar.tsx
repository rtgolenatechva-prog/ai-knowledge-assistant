"use client";

import { MessageSquare, Plus, Sparkles, Trash2, LogOut } from "lucide-react";
import { Conversation } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

  return (
    <aside className="flex h-[40vh] w-full min-h-0 flex-col gap-3 border-b bg-sidebar p-3 text-sidebar-foreground md:h-full md:w-72 md:border-b-0 md:border-r">
      <div className="flex items-center gap-2 px-1 py-1">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="size-4" />
        </div>
        <span className="text-sm font-semibold">Knowledge Assistant</span>
      </div>

      <Button onClick={onCreate} disabled={creating} className="w-full shrink-0 justify-start gap-2">
        <Plus className="size-4" />
        {creating ? "Creating..." : "New conversation"}
      </Button>

      <ScrollArea className="min-h-0 flex-1 -mx-1 px-1">
        <div className="flex flex-col gap-1">
          {conversations.map((c) => (
            <div
              key={c.id}
              className={cn(
                "group flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-sidebar-accent",
                c.id === activeId && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
              <button className="min-w-0 flex-1 truncate text-left" onClick={() => onSelect(c.id)}>
                {c.title}
              </button>
              <button
                className="shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                onClick={() => onDelete(c.id)}
                aria-label={`Delete ${c.title}`}
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
          {conversations.length === 0 && (
            <p className="px-2 py-1 text-sm text-muted-foreground">No conversations yet.</p>
          )}
        </div>
      </ScrollArea>

      <Separator />

      <div className="flex items-center gap-2 px-1">
        <Avatar className="size-8">
          <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
            {user?.email?.[0]?.toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
        <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{user?.email}</p>
        <button
          onClick={logout}
          aria-label="Log out"
          className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </aside>
  );
}
