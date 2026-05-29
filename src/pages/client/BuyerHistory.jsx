import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function BuyerHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    api
      .get("/buyer/history")
      .then((res) => setHistory(Array.isArray(res.data) ? res.data : []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id) => setExpandedId((prev) => (prev === id ? null : id));

  const parseFilters = (raw) => {
    if (!raw) return null;
    if (typeof raw === "object") return raw;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  return (
    <section className="relative z-10 max-w-4xl mx-auto px-4 lg:px-0 py-10" dir="rtl">
      <div className="card-glass border border-white/15 rounded-2xl p-5 md:p-6 shadow-soft bg-black/30 backdrop-blur-xl">
        <div className="mb-6">
          <h1 className="text-3xl font-black bg-gradient-to-r from-white/20 to-white/10 bg-clip-text text-transparent">
            سجل البحث
          </h1>
          <p className="text-slate-300 text-sm mt-1">سجل جلسات البحث العقاري السابقة.</p>
        </div>

        {loading && (
          <p className="text-center text-slate-400 py-10">جاري التحميل...</p>
        )}

        {!loading && history.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-slate-400">لا يوجد سجل بحث بعد.</p>
          </div>
        )}

        {history.map((item) => {
          const filters = parseFilters(item.filters || item.filtersJson);
          const isOpen = expandedId === item.id;
          return (
            <div
              key={item.id}
              className="mb-3 rounded-xl border border-white/10 bg-slate-900/40 backdrop-blur overflow-hidden"
            >
              <button
                type="button"
                className="w-full p-4 flex items-center justify-between gap-3 text-right hover:bg-white/[0.03] transition"
                onClick={() => toggle(item.id)}
              >
                <div>
                  <h3 className="font-semibold text-white/90 text-sm">
                    {item.title || item.query || `جلسة #${item.id}`}
                  </h3>
                  {item.createdAt && (
                    <p className="text-slate-400 text-xs mt-0.5">
                      {new Date(item.createdAt).toLocaleDateString("ar-SY")}
                    </p>
                  )}
                </div>
                <span className="text-white/40 text-xs shrink-0">{isOpen ? "▲" : "▼"}</span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-white/10 space-y-2 text-sm text-slate-300">
                  {item.resultsCount != null && (
                    <p>النتائج: <span className="text-white/80">{item.resultsCount} عقار</span></p>
                  )}
                  {item.city && <p>المدينة: <span className="text-white/80">{item.city}</span></p>}
                  {item.district && <p>الحي: <span className="text-white/80">{item.district}</span></p>}
                  {item.propertyType && <p>النوع: <span className="text-white/80">{item.propertyType}</span></p>}
                  {filters && (
                    <div>
                      <p className="text-xs text-slate-500 mb-1">تفاصيل الفلاتر:</p>
                      <pre className="text-xs bg-black/30 rounded-lg p-2 overflow-x-auto text-slate-300">
                        {JSON.stringify(filters, null, 2)}
                      </pre>
                    </div>
                  )}
                  {!item.city && !item.district && !item.propertyType && !filters && (
                    <p className="text-slate-500 text-xs">لا تتوفر تفاصيل إضافية.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
