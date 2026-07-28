"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Pin, PinOff, Trash2 } from "lucide-react";
import { Conversation } from "@/lib/api";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ConversationRowProps {
  conversation: Conversation;
  active: boolean;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onTogglePin: (id: string, pinned: boolean) => void;
  onDelete: (id: string) => void;
}

export function ConversationRow({
  conversation: c,
  active,
  onSelect,
  onRename,
  onTogglePin,
  onDelete,
}: ConversationRowProps) {
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(c.title);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function commitRename() {
    const trimmed = draft.trim();
    setRenaming(false);
    if (trimmed && trimmed !== c.title) {
      onRename(c.id, trimmed);
    } else {
      setDraft(c.title);
    }
  }

  if (renaming) {
    return (
      <Input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitRename}
        onKeyDown={(e) => {
          if (e.key === "Enter") commitRename();
          if (e.key === "Escape") {
            setDraft(c.title);
            setRenaming(false);
          }
        }}
        className="h-7 rounded-lg px-2 text-xs"
      />
    );
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs hover:bg-sidebar-accent",
        active && "bg-sidebar-accent text-sidebar-accent-foreground"
      )}
    >
      {c.pinned && <Pin className="size-3 shrink-0 text-muted-foreground" />}
      <button className="min-w-0 flex-1 truncate text-left" onClick={() => onSelect(c.id)}>
        {c.title}
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 hover:bg-background group-hover:opacity-100 data-open:opacity-100"
              aria-label={`Options for ${c.title}`}
            >
              <MoreHorizontal className="size-3.5" />
            </button>
          }
        />
        <DropdownMenuContent align="start" className="w-40">
          <DropdownMenuItem
            onClick={() => {
              setDraft(c.title);
              setRenaming(true);
            }}
          >
            <Pencil className="size-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onTogglePin(c.id, !c.pinned)}>
            {c.pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
            {c.pinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{c.title}&rdquo; and all its messages will be permanently deleted. This
              can&apos;t be undone.
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
    </div>
  );
}
