import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

export default function AccountantDashboard() {
  const [stats, setStats] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [invoicesRes, commissionsRes] = await Promise.allSettled([
          api.get("/invoices"),
          api.get("/commissions/total"),
        ]);

        const invData = invoicesRes.status === "fulfilled" ? invoicesRes.value.data : [];
        const commData = commissionsRes.status === "fulfilled" ? commissionsRes.value.data : null;

        const invList = Array.isArray(invData) ? invData : (invData?.items ?? []);
        const pending = invList.filter((i) => i.status?.toLowerCase() === "pending");

        setStats({
          totalInvoices: invList.length,
          pendingPayments: pending.length,
          totalCommissions: commData?.total ?? commData?.amount ?? 0,
        });

        setInvoices(invList.slice(0, 5));
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
    { label: "إجمالي الفواتير", value: stats?.totalInvoices ?? "—" },
    { label: "مدفوعات معلقة", value: stats?.pendingPayments ?? "—" },
    {
      label: "العمولات",
      value: stats?.totalCommissions
        ? `$${Number(stats.totalCommissions).toLocaleString()}`
        : "—",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">لوحة تحكم المحاسب</h1>
        <p className="mt-1 text-sm text-white/60">متابعة الفواتير والمدفوعات والعمولات</p>
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
        <h2 className="text-sm font-semibold text-white">آخر الفواتير</h2>
        {invoices.length === 0 ? (
          <p className="text-sm text-white/50">لا توجد فواتير.</p>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-sm text-white/80">
              <thead>
                <tr className="border-b border-white/10 text-white/50">
                  <th className="pb-2 pr-4 text-right font-normal">رقم الفاتورة</th>
                  <th className="pb-2 pr-4 text-right font-normal">المبلغ</th>
                  <th className="pb-2 text-right font-normal">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-white/5">
                    <td className="py-2 pr-4">#{inv.id}</td>
                    <td className="py-2 pr-4">
                      {inv.amount ? `$${Number(inv.amount).toLocaleString()}` : "—"}
                    </td>
                    <td className="py-2">{inv.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {[
          { label: "فواتير المبيعات", to: "/accountant/sales-invoices" },
          { label: "فواتير الإيجار", to: "/accountant/rent-invoices" },
          { label: "تسجيل دفعة", to: "/accountant/record-payments" },
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
