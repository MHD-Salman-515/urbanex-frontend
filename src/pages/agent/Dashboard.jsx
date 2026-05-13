import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

function isToday(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function AgentDashboard() {
  const [stats, setStats] = useState(null);
  const [todayAppts, setTodayAppts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get("/appointments");
        const appts = Array.isArray(data) ? data : [];
        const today = appts.filter((a) => isToday(a.date));
        const pending = appts.filter((a) => a.status?.toLowerCase() === "pending");

        setStats({
          total: appts.length,
          today: today.length,
          pending: pending.length,
        });

        setTodayAppts(today.slice(0, 5));
      } catch {
        setError("فشل تحميل بيانات لوحة التحكم");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-900/20 p-6 text-center text-red-300">
        {error}
      </div>
    );
  }

  const kpis = [
    { label: "إجمالي المواعيد", value: stats?.total ?? "—" },
    { label: "مواعيد اليوم", value: stats?.today ?? "—" },
    { label: "قيد الانتظار", value: stats?.pending ?? "—" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">لوحة تحكم الوكيل</h1>
        <p className="mt-1 text-sm text-white/60">متابعة المواعيد والعمليات اليومية</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-white/10 bg-black/40 p-5">
            <p className="text-xs text-white/50">{kpi.label}</p>
            <p className="mt-2 text-3xl font-bold text-white">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/40 p-5 space-y-3">
        <h2 className="text-sm font-semibold text-white">مواعيد اليوم</h2>
        {todayAppts.length === 0 ? (
          <p className="text-sm text-white/50">لا توجد مواعيد اليوم.</p>
        ) : (
          <div className="space-y-2">
            {todayAppts.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3"
              >
                <span className="text-sm text-white/80">موعد #{a.id} — عقار #{a.propertyId}</span>
                <span className="text-xs text-white/50">
                  {new Date(a.date).toLocaleTimeString("ar-EG")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {[
          { label: "المواعيد", to: "/agent/appointments" },
          { label: "ربط العمليات", to: "/agent/link-ops" },
        ].map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
