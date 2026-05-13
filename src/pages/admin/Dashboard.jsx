import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [propsRes, apptRes, usersRes] = await Promise.allSettled([
          api.get("/admin/properties"),
          api.get("/appointments"),
          api.get("/admin/users"),
        ]);

        const properties = propsRes.status === "fulfilled" ? propsRes.value.data : [];
        const appts = apptRes.status === "fulfilled" ? apptRes.value.data : [];
        const users = usersRes.status === "fulfilled" ? usersRes.value.data : [];

        setStats({
          totalProperties: Array.isArray(properties) ? properties.length : (properties?.total ?? 0),
          totalAppointments: Array.isArray(appts) ? appts.length : (appts?.total ?? 0),
          totalUsers: Array.isArray(users) ? users.length : (users?.total ?? 0),
        });

        setAppointments(Array.isArray(appts) ? appts.slice(0, 5) : []);
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
    { label: "إجمالي العقارات", value: stats?.totalProperties ?? "—" },
    { label: "إجمالي المواعيد", value: stats?.totalAppointments ?? "—" },
    { label: "المستخدمون", value: stats?.totalUsers ?? "—" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">لوحة تحكم الإدارة</h1>
        <p className="mt-1 text-sm text-white/60">نظرة عامة على منصة Urbanex</p>
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
        <h2 className="text-sm font-semibold text-white">آخر المواعيد</h2>
        {appointments.length === 0 ? (
          <p className="text-sm text-white/50">لا توجد مواعيد.</p>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-sm text-white/80">
              <thead>
                <tr className="border-b border-white/10 text-white/50">
                  <th className="pb-2 pr-4 text-right font-normal">رقم الموعد</th>
                  <th className="pb-2 pr-4 text-right font-normal">العقار</th>
                  <th className="pb-2 text-right font-normal">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr key={a.id} className="border-b border-white/5">
                    <td className="py-2 pr-4">#{a.id}</td>
                    <td className="py-2 pr-4">#{a.propertyId}</td>
                    <td className="py-2">{a.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {[
          { label: "إدارة العقارات", to: "/admin/properties" },
          { label: "إدارة المستخدمين", to: "/admin/users" },
          { label: "المواعيد", to: "/admin/appointments" },
          { label: "العمليات", to: "/admin/operations" },
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
