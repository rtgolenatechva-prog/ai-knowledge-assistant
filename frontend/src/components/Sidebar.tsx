"use client";

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
    <aside className="flex h-[40vh] w-full min-h-0 flex-col gap-3 border-b bg-muted/40 p-4 md:h-full md:w-64 md:border-b-0 md:border-r">
      <Button onClick={onCreate} disabled={creating} className="w-full shrink-0">
        {creating ? "Creating..." : "+ New conversation"}
      </Button>

      <ScrollArea className="min-h-0 flex-1 -mx-1 px-1">
        <div className="flex flex-col gap-1">
          {conversations.map((c) => (
            <div
              key={c.id}
              className={cn(
                "flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5 hover:bg-background",
                c.id === activeId && "border-primary bg-background"
              )}
            >
              <button
                className="flex-1 truncate text-left text-sm"
                onClick={() => onSelect(c.id)}
              >
                {c.title}
              </button>
              <button
                className="text-xs text-destructive hover:underline"
                onClick={() => onDelete(c.id)}
                aria-label={`Delete ${c.title}`}
              >
                Delete
              </button>
            </div>
          ))}
          {conversations.length === 0 && (
            <p className="px-2 text-sm text-muted-foreground">No conversations yet.</p>
          )}
        </div>
      </ScrollArea>

      <Separator />

      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{user?.email?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
        </Avatar>
        <p className="flex-1 truncate text-sm text-muted-foreground">{user?.email}</p>
      </div>
      <Button variant="outline" onClick={logout} className="w-full">
        Log out
      </Button>
    </aside>
  );
}
