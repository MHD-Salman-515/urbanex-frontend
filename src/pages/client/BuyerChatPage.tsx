import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MessageCircle, Plus, Send, Home } from "lucide-react";
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

  // Auto-create or select session once sessions load
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

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-950" dir="rtl">
      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 border-l border-gray-800 bg-gray-900 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <Home size={18} className="text-blue-400" />
            <h2 className="text-white font-bold text-sm">مساعد البحث</h2>
          </div>
          <button
            type="button"
            onClick={handleNewSession}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition"
          >
            <Plus size={15} />
            بحث جديد
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loadingSessions ? (
            <p className="text-gray-500 text-xs text-center mt-4">جاري التحميل...</p>
          ) : sessions.length === 0 ? (
            <p className="text-gray-600 text-xs text-center mt-4">لا توجد محادثات</p>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => selectSession(session.id)}
                className={`w-full text-right px-3 py-2 rounded-xl text-sm mb-1 transition flex items-center gap-2 ${
                  activeSessionId === session.id
                    ? "bg-blue-600/20 text-blue-400 border border-blue-600/30"
                    : "text-gray-400 hover:bg-gray-800"
                }`}
              >
                <MessageCircle size={13} className="shrink-0" />
                <span className="truncate">{session.title || "محادثة"}</span>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 shrink-0">
          <h1 className="text-white font-bold text-base">🏠 مساعد البحث العقاري</h1>
          <p className="text-gray-400 text-xs mt-0.5">أخبرني عن العقار الذي تبحث عنه</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loadingMessages && (
            <p className="text-gray-500 text-sm text-center mt-8">جاري تحميل الرسائل...</p>
          )}

          {!loadingMessages && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-4">
              <div className="text-5xl">🏠</div>
              <h3 className="text-white text-lg font-bold">مرحباً بك في مساعد البحث</h3>
              <p className="text-gray-400 text-sm max-w-sm">
                أخبرني عن العقار الذي تبحث عنه وسأساعدك في إيجاد الخيار المناسب
              </p>
              <div className="flex flex-col gap-2 mt-1 w-full max-w-sm">
                {HINTS.map((hint) => (
                  <button
                    key={hint}
                    type="button"
                    onClick={() => setInput(hint)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm transition text-right"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={`${msg.id}-${i}`}
              className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-gray-800 text-gray-100 rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-end">
              <div className="bg-gray-800 text-gray-400 px-4 py-3 rounded-2xl text-sm">
                جاري الكتابة...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-gray-900 border-t border-gray-800 p-4 shrink-0">
          {error && (
            <p className="text-red-400 text-xs mb-2 text-center">{error}</p>
          )}
          <div className="flex gap-3 items-end">
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || sending}
              className="p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl transition shrink-0"
              aria-label="إرسال"
            >
              <Send size={18} />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="أخبرني عن العقار الذي تبحث عنه..."
              rows={1}
              className="flex-1 bg-gray-800 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
