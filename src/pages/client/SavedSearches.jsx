import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Search } from "lucide-react";
import api from "../../api/axios";

export default function SavedSearches() {
  const navigate = useNavigate();
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api
      .get("/buyer/saved-searches")
      .then((res) => setSearches(Array.isArray(res.data) ? res.data : []))
      .catch(() => setSearches([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const deleteSearch = async (id) => {
    await api.delete(`/buyer/saved-searches/${id}`).catch(() => {});
    setSearches((prev) => prev.filter((s) => s.id !== id));
  };

  const applySearch = (item) => {
    try {
      const raw = item.filtersJson;
      const filters = typeof raw === "string" ? JSON.parse(raw) : raw || {};
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([, v]) => v != null && v !== ""))
      ).toString();
      navigate(`/search${params ? `?${params}` : ""}`);
    } catch {
      navigate("/search");
    }
  };

  const summarizeFilters = (item) => {
    try {
      const raw = item.filtersJson;
      const filters = typeof raw === "string" ? JSON.parse(raw) : raw || {};
      const parts = [];
      if (filters.city) parts.push(`مدينة: ${filters.city}`);
      if (filters.district) parts.push(`حي: ${filters.district}`);
      if (filters.type) parts.push(`نوع: ${filters.type}`);
      if (filters.minPrice) parts.push(`من: ${Number(filters.minPrice).toLocaleString()}`);
      if (filters.maxPrice) parts.push(`حتى: ${Number(filters.maxPrice).toLocaleString()}`);
      return parts.length ? parts.join(" • ") : raw || "";
    } catch {
      return String(item.filtersJson || "");
    }
  };

  return (
    <section className="relative z-10 max-w-4xl mx-auto px-4 lg:px-0 py-10" dir="rtl">
      <div className="card-glass border border-white/15 rounded-2xl p-5 md:p-6 shadow-soft bg-black/30 backdrop-blur-xl">
        <div className="mb-6">
          <h1 className="text-3xl font-black bg-gradient-to-r from-white/20 to-white/10 bg-clip-text text-transparent">
            بحوثاتي المحفوظة
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            عمليات البحث التي قمت بحفظها للرجوع إليها لاحقاً.
          </p>
        </div>

        {loading && (
          <p className="text-center text-slate-400 py-10">جاري التحميل...</p>
        )}

        {!loading && searches.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📌</div>
            <p className="text-slate-400">لا يوجد بحث محفوظ.</p>
            <button
              type="button"
              onClick={() => navigate("/search")}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 text-sm text-white/80 hover:bg-white/10 transition"
            >
              <Search className="h-4 w-4" />
              ابدأ البحث الآن
            </button>
          </div>
        )}

        {searches.map((item) => (
          <div
            key={item.id}
            className="p-4 mb-3 rounded-xl border border-white/10 bg-slate-900/40 backdrop-blur flex items-start gap-3"
          >
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white/90 text-sm">
                {item.label || `بحث #${item.id}`}
              </h3>
              {item.createdAt && (
                <p className="text-slate-400 text-xs mt-0.5">
                  {new Date(item.createdAt).toLocaleDateString("ar-SY")}
                </p>
              )}
              {item.filtersJson && (
                <p className="text-slate-400 text-xs mt-1 truncate">
                  {summarizeFilters(item)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => applySearch(item)}
                className="px-3 py-1.5 text-xs rounded-xl border border-white/15 text-white/80 hover:bg-white/10 transition"
              >
                تطبيق
              </button>
              <button
                type="button"
                onClick={() => deleteSearch(item.id)}
                className="p-1.5 rounded-xl border border-rose-400/30 text-rose-300 hover:bg-rose-500/10 transition"
                aria-label="حذف"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
