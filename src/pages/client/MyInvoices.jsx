import { useEffect, useState } from "react";
import api from "../../api/axios";

function statusMeta(status) {
  switch (status) {
    case "PAID":
      return { label: "مدفوعة", cls: "border-emerald-400/40 bg-emerald-500/15 text-emerald-200" };
    case "OVERDUE":
      return { label: "متأخرة", cls: "border-rose-400/40 bg-rose-500/15 text-rose-200" };
    default:
      return { label: "غير مدفوعة", cls: "border-amber-400/40 bg-amber-500/15 text-amber-200" };
  }
}

export default function MyInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/invoices/my")
      .then((res) => setInvoices(Array.isArray(res.data) ? res.data : []))
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false));
  }, []);

  const paidCount = invoices.filter((i) => i.status === "PAID").length;
  const overdueCount = invoices.filter((i) => i.status === "OVERDUE").length;

  return (
    <section className="relative z-10 max-w-4xl mx-auto px-4 lg:px-0 py-10" dir="rtl">
      <div className="card-glass border border-white/15 rounded-2xl p-5 md:p-6 shadow-soft bg-black/30 backdrop-blur-xl">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-white/20 to-white/10 bg-clip-text text-transparent">
              فواتيري
            </h1>
            <p className="text-slate-300 text-sm mt-1">جميع الفواتير المرتبطة بحسابك.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-300">
            <span className="px-3 py-1 rounded-full bg-slate-900/60 border border-slate-600/60">
              الإجمالي: {invoices.length}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-900/30 border border-emerald-500/40 text-emerald-200">
              مدفوعة: {paidCount}
            </span>
            <span className="px-3 py-1 rounded-full bg-red-900/30 border border-red-500/40 text-red-200">
              متأخرة: {overdueCount}
            </span>
          </div>
        </div>

        {loading && (
          <p className="text-center text-slate-400 py-10">جاري التحميل...</p>
        )}

        {!loading && invoices.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🧾</div>
            <p className="text-slate-400">لا توجد فواتير حتى الآن.</p>
          </div>
        )}

        {invoices.map((inv) => {
          const { label, cls } = statusMeta(inv.status);
          return (
            <div
              key={inv.id}
              className="p-4 mb-4 rounded-xl border border-white/10 bg-slate-900/40 backdrop-blur"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="font-semibold text-white/90">فاتورة #{inv.id}</h3>
                  {inv.property?.title && (
                    <p className="text-slate-300 text-sm">
                      <b>العقار:</b> {inv.property.title}
                    </p>
                  )}
                  <p className="text-slate-300 text-sm">
                    <b>المبلغ:</b> {Number(inv.totalAmount || 0).toLocaleString("ar-SY")} ل.س
                  </p>
                  {inv.tax > 0 && (
                    <p className="text-slate-400 text-xs">
                      الضريبة: {Number(inv.tax || 0).toLocaleString("ar-SY")} ل.س
                    </p>
                  )}
                  {inv.dueDate && (
                    <p className="text-slate-300 text-sm">
                      <b>تاريخ الاستحقاق:</b>{" "}
                      {new Date(inv.dueDate).toLocaleDateString("ar-SY")}
                    </p>
                  )}
                  {inv.createdAt && (
                    <p className="text-slate-400 text-xs">
                      صدرت: {new Date(inv.createdAt).toLocaleDateString("ar-SY")}
                    </p>
                  )}
                </div>
                <span
                  className={`inline-block shrink-0 px-3 py-1 rounded-full border text-xs ${cls}`}
                >
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
