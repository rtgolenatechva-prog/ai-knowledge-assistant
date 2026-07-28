"use client";

import { Conversation } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import styles from "./Sidebar.module.css";

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
    <aside className={styles.sidebar}>
      <button className={styles.newButton} onClick={onCreate} disabled={creating}>
        {creating ? "Creating..." : "+ New conversation"}
      </button>

      <div className={styles.list}>
        {conversations.map((c) => (
          <div
            key={c.id}
            className={`${styles.item} ${c.id === activeId ? styles.itemActive : ""}`}
          >
            <button className={styles.itemTitle} onClick={() => onSelect(c.id)}>
              {c.title}
            </button>
            <button
              className={styles.deleteButton}
              onClick={() => onDelete(c.id)}
              aria-label={`Delete ${c.title}`}
            >
              Delete
            </button>
          </div>
        ))}
        {conversations.length === 0 && (
          <div className={styles.email}>No conversations yet.</div>
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.email}>{user?.email}</div>
        <button className={styles.logoutButton} onClick={logout}>
          Log out
        </button>
      </div>
    </aside>
  );
}
