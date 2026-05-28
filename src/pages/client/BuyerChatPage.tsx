import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MessageCircle, MessageSquareDashed, Plus, Send, Sparkles, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useBuyerChatUi } from "@/hooks/chat/useBuyerChatUi";

const HINTS = [
  "بدي شقة بالمزة ميزانيتي 500 مليون",
  "أبحث عن بيت بريف دمشق 3 غرف",
  "ما هو سعر المتر بالمالكي؟",
];

export default function BuyerChatPage() {
  const { sessionId } = useParams<{ sessionId?: string }>();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
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
  } = useBuyerChatUi(sessionId ? parseInt(sessionId, 10) : undefined);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (loadingSessions) return;
    if (sessions.length === 0) {
      createSession();
    } else if (!activeSessionId) {
      const first = sessions[0];
      setActiveSessionId(first.id);
      navigate(`/client/chat/${first.id}`, { replace: true });
    }
  }, [loadingSessions, sessions.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const text = input;
    setInput("");
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectSession = (id: number) => {
    setActiveSessionId(id);
    navigate(`/client/chat/${id}`);
  };

  const handleNewSession = async () => {
    const s = await createSession();
    if (s?.id) navigate(`/client/chat/${s.id}`);
  };

  const handleDeleteSession = async (id: number) => {
    // optimistic removal — no backend delete endpoint for buyer sessions yet
    if (activeSessionId === id) {
      navigate("/client/chat", { replace: true });
    }
  };

  return (
    <div
      dir="rtl"
      className="lab-bg relative min-h-[calc(100vh-4rem)] w-full overflow-hidden px-4 py-6 text-white md:px-6"
    >
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-blue-500/10 blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-[128px]" />
        <div className="absolute right-1/3 top-1/4 h-64 w-64 rounded-full bg-cyan-500/10 blur-[96px]" />
      </div>

      <motion.div
        className="relative z-10 mx-auto w-full max-w-4xl space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Page header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs text-white/75 backdrop-blur-xl">
            <MessageSquareDashed className="h-3.5 w-3.5" />
            مساعد البحث العقاري
          </div>
          <h1 className="mt-4 bg-gradient-to-r from-white/90 to-white/40 bg-clip-text pb-1 text-3xl font-medium tracking-tight text-transparent">
            ابحث عن عقارك المثالي
          </h1>
          <p className="mt-2 text-sm text-white/40">أخبرني عن العقار الذي تبحث عنه</p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-300/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 backdrop-blur-xl">
            {error}
          </div>
        ) : null}

        {/* Main chat card */}
        <motion.div
          className="relative rounded-2xl border border-white/[0.05] bg-white/[0.02] shadow-2xl backdrop-blur-2xl"
          initial={{ scale: 0.98 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* Card header — session tabs */}
          <div className="border-b border-white/[0.05] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <Sparkles className="h-4 w-4 text-white/70" />
                <p className="truncate text-sm font-medium text-white/85">
                  {sessions.find((s) => s.id === activeSessionId)?.title || "محادثة"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleNewSession}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white transition hover:bg-white/15"
                >
                  <Plus className="h-3.5 w-3.5" />
                  بحث جديد
                </button>
                {activeSessionId ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteSession(activeSessionId)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-400/30 px-2.5 py-1.5 text-xs text-red-200 hover:bg-red-500/10 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    حذف
                  </button>
                ) : null}
              </div>
            </div>

            {/* Session tabs */}
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {loadingSessions ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-8 w-28 animate-pulse rounded-lg bg-white/10" />
                ))
              ) : sessions.length ? (
                sessions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => selectSession(s.id)}
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-xs transition ${
                      s.id === activeSessionId
                        ? "border-white/25 bg-white/10 text-white"
                        : "border-white/10 bg-black/30 text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <MessageCircle className="h-3 w-3" />
                    {s.title || "محادثة"}
                  </button>
                ))
              ) : (
                <p className="text-xs text-white/45">لا توجد محادثات بعد</p>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="min-h-[380px] max-h-[52vh] overflow-y-auto p-4 space-y-4">
            {loadingMessages && (
              <p className="text-white/40 text-sm text-center mt-8">جاري تحميل الرسائل...</p>
            )}

            {!loadingMessages && messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-12">
                <div className="text-5xl">🏠</div>
                <h3 className="text-white/80 text-base font-medium">مرحباً بك في مساعد البحث</h3>
                <p className="text-white/40 text-sm max-w-sm">
                  أخبرني عن العقار الذي تبحث عنه وسأساعدك في إيجاد الخيار المناسب
                </p>
                <div className="flex flex-col gap-2 mt-1 w-full max-w-sm">
                  {HINTS.map((hint) => (
                    <button
                      key={hint}
                      type="button"
                      onClick={() => setInput(hint)}
                      className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white/65 hover:text-white/90 text-sm transition text-right"
                    >
                      {hint}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={`${msg.id}-${i}`}>
                <div className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-white/10 border border-white/10 text-white/90 rounded-br-sm"
                        : "bg-white/[0.05] border border-white/[0.08] text-white/85 rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>

                {/* Property cards */}
                {msg.role === "assistant" &&
                  Array.isArray(msg.meta?.recommended_properties) &&
                  msg.meta.recommended_properties.length > 0 && (
                    <div className="flex justify-end mt-2">
                      <div className="max-w-[75%] space-y-2">
                        {msg.meta.recommended_properties.map((prop: any) => (
                          <a
                            key={prop.id}
                            href={`/property/${prop.id}`}
                            className="block p-3 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] transition"
                          >
                            <div className="flex gap-3 items-start">
                              {prop.image && (
                                <img
                                  src={prop.image}
                                  alt={prop.title}
                                  className="w-16 h-16 rounded-lg object-cover shrink-0"
                                />
                              )}
                              <div className="min-w-0">
                                <p className="text-white/90 font-medium text-sm truncate">{prop.title}</p>
                                <p className="text-white/50 text-xs mt-1">
                                  {prop.address} {prop.area ? `• ${prop.area} م²` : ""}
                                </p>
                                {prop.price != null && (
                                  <p className="text-blue-400 text-xs font-bold mt-1">
                                    {prop.price.toLocaleString("ar-SY")} ل.س
                                  </p>
                                )}
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ))}

            {sending && (
              <div className="flex justify-end">
                <div className="bg-white/[0.05] border border-white/[0.08] text-white/50 px-4 py-3 rounded-2xl text-sm">
                  جاري الكتابة...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-white/[0.05] p-4">
            <div className="flex gap-3 items-end">
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/15 disabled:opacity-40"
                aria-label="إرسال"
              >
                <Send className="h-4 w-4" />
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="أخبرني عن العقار الذي تبحث عنه..."
                rows={1}
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition"
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
