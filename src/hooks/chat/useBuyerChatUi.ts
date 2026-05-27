import { useState, useEffect, useCallback } from "react";
import { buyerChatApi, BuyerChatSession, BuyerChatMessage } from "@/services/buyerChat.api";

export function useBuyerChatUi(initialSessionId?: number) {
  const [sessions, setSessions] = useState<BuyerChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(initialSessionId ?? null);
  const [messages, setMessages] = useState<BuyerChatMessage[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoadingSessions(true);
    buyerChatApi
      .getSessions()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setSessions(data);
      })
      .catch(() => setError("فشل تحميل المحادثات"))
      .finally(() => setLoadingSessions(false));
  }, []);

  useEffect(() => {
    if (!activeSessionId) return;
    setLoadingMessages(true);
    setMessages([]);
    buyerChatApi
      .getMessages(activeSessionId)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setMessages(data);
      })
      .catch(() => setError("فشل تحميل الرسائل"))
      .finally(() => setLoadingMessages(false));
  }, [activeSessionId]);

  const createSession = useCallback(async () => {
    try {
      const res = await buyerChatApi.createSession("بحث جديد");
      const session = res.data;
      setSessions((prev) => [session, ...prev]);
      setActiveSessionId(session.id);
      setMessages([]);
      return session;
    } catch {
      setError("فشل إنشاء محادثة");
    }
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!activeSessionId || !text.trim()) return;
      const userMsg: BuyerChatMessage = {
        id: Date.now(),
        role: "user",
        content: text,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setSending(true);
      try {
        const res = await buyerChatApi.sendMessage(activeSessionId, text);
        const reply = res.data as any;
        const assistantMsg: BuyerChatMessage = {
          id: Date.now() + 1,
          role: "assistant",
          content:
            reply?.response?.text_ar ??
            reply?.text_ar ??
            reply?.message ??
            reply?.text ??
            JSON.stringify(reply),
          createdAt: new Date().toISOString(),
          meta: reply,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        setError("فشل إرسال الرسالة");
      } finally {
        setSending(false);
      }
    },
    [activeSessionId],
  );

  return {
    sessions,
    activeSessionId,
    setActiveSessionId,
    messages,
    loadingSessions,
    loadingMessages,
    sending,
    error,
    createSession,
    sendMessage,
  };
}
