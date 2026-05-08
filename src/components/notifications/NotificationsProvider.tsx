import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext.jsx";
import { useToast } from "@/components/ToastProvider.jsx";
import { API_BASE, getStoredAccessToken } from "@/api/axios";
import type { NotificationItem, NotificationType } from "@/lib/notifications/types";

export type BackendNotification = {
  id: number;
  userId: number;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type NotificationsFilter = "all" | NotificationType;

export type NotificationsContextValue = {
  notifications: BackendNotification[];
  unreadCount: number;
  markAsRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  // backward compat for existing bell UI
  userId: string;
  items: NotificationItem[];
  activeFilter: NotificationsFilter;
  setActiveFilter: (value: NotificationsFilter) => void;
  markRead: (id: string) => Promise<void>;
  notify: () => void;
  clearAll: () => void;
};

export const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function useNotifications() {
  return useContext(NotificationsContext);
}

function mapType(type: string): NotificationType {
  if (type === "PROPERTY_APPROVED" || type === "PRICE_ALERT") return "properties";
  return "system";
}

function toItem(n: BackendNotification): NotificationItem {
  return {
    id: String(n.id),
    type: mapType(n.type),
    title: n.title,
    message: n.body,
    createdAt: new Date(n.createdAt).getTime(),
    read: n.isRead,
  };
}

// Keep window event API for any legacy callers — now a no-op
export function notify(): void {}

const BASE = () => API_BASE || "";

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const toast = useToast();
  const toastRef = useRef(toast);
  useEffect(() => { toastRef.current = toast; });

  const user = auth?.user;
  const userId = user ? String((user as Record<string, unknown>).id ?? (user as Record<string, unknown>).sub ?? "") : "";

  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<NotificationsFilter>("all");

  const abortRef = useRef<AbortController | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // On login: fetch existing notifications + unread count
  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    const token = getStoredAccessToken();
    if (!token) return;

    const headers: HeadersInit = { Authorization: `Bearer ${token}` };
    const base = BASE();

    Promise.all([
      fetch(`${base}/notifications`, { headers }).then((r) => (r.ok ? r.json() : [])),
      fetch(`${base}/notifications/unread-count`, { headers }).then((r) =>
        r.ok ? r.json() : { count: 0 }
      ),
    ])
      .then(([list, countData]) => {
        if (!mountedRef.current) return;
        if (Array.isArray(list)) setNotifications(list as BackendNotification[]);
        if (typeof (countData as Record<string, unknown>)?.count === "number")
          setUnreadCount((countData as { count: number }).count);
      })
      .catch(() => {});
  }, [userId]);

  // SSE connection — uses fetch() because EventSource doesn't support auth headers
  const connectSse = useCallback(() => {
    const token = getStoredAccessToken();
    if (!token || !mountedRef.current) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;

    (async () => {
      try {
        const res = await fetch(`${BASE()}/notifications/stream`, {
          headers: { Authorization: `Bearer ${token}` },
          signal,
        });

        if (!res.ok || !res.body) return;

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let pendingEvent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const t = line.trimEnd();
            if (t.startsWith("event:")) {
              pendingEvent = t.slice(6).trim();
            } else if (t.startsWith("data:")) {
              const raw = t.slice(5).trim();
              if (pendingEvent === "notification" && raw) {
                try {
                  const n = JSON.parse(raw) as BackendNotification;
                  if (mountedRef.current) {
                    setNotifications((prev) => [n, ...prev]);
                    setUnreadCount((prev) => prev + 1);
                    toastRef.current?.info(n.body, { duration: 5000 });
                  }
                } catch {}
                pendingEvent = "";
              }
            } else if (t === "") {
              pendingEvent = "";
            }
          }
        }
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
      }

      // Connection dropped — reconnect after 3 s
      if (mountedRef.current) {
        reconnectRef.current = setTimeout(connectSse, 3000);
      }
    })();
  }, []); // stable: reads token and base lazily, toast via ref

  useEffect(() => {
    if (!userId) return;
    connectSse();
    return () => {
      abortRef.current?.abort();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [userId, connectSse]);

  const markAsRead = useCallback(async (id: number) => {
    const token = getStoredAccessToken();
    if (!token) return;
    try {
      const res = await fetch(`${BASE()}/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  }, []);

  const markAllRead = useCallback(async () => {
    const token = getStoredAccessToken();
    if (!token) return;
    try {
      const res = await fetch(`${BASE()}/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  }, []);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      unreadCount,
      markAsRead,
      markAllRead,
      userId,
      items: notifications.map(toItem),
      activeFilter,
      setActiveFilter,
      markRead: (id: string) => markAsRead(Number(id)),
      notify: () => {},
      clearAll: () => {
        setNotifications([]);
        setUnreadCount(0);
      },
    }),
    [notifications, unreadCount, markAsRead, markAllRead, userId, activeFilter]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}
