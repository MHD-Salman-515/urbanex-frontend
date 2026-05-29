import { useEffect, useState } from "react";
import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Table from "../../components/Table";
import { useToast } from "../../components/ToastProvider";

const initialForm = {
  ticketId: "",
  amount: "",
  description: "",
  contractorId: "",
};

export default function Expenses() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [tickets, setTickets] = useState([]);
  const [contractors, setContractors] = useState([]);

  const load = async () => {
    try {
      const res = await api.get("/expenses/supplier");
      setRows(Array.isArray(res.data) ? res.data : []);
      const t = await api.get("/tickets").catch(() => ({ data: [] }));
      setTickets(Array.isArray(t.data) ? t.data : []);
      const c = await api.get("/users?role=supplier").catch(() => ({ data: [] }));
      setContractors(Array.isArray(c.data) ? c.data : []);
    } catch {
      toast.error("Failed to load expenses");
    }
  };

  useEffect(() => { load(); }, []);

  const createExpense = async (e) => {
    e.preventDefault();
    if (!form.amount) return toast.error("Amount is required");
    try {
      await api.post("/expenses", {
        ticketId: form.ticketId ? Number(form.ticketId) : undefined,
        amount: Number(form.amount),
        description: form.description || "—",
        contractorId: form.contractorId ? Number(form.contractorId) : undefined,
      });
      toast.success("تمت إضافة المصروف بنجاح");
      setShowForm(false);
      setForm(initialForm);
      load();
    } catch {
      toast.error("فشل إنشاء المصروف");
    }
  };

  const columns = [
    { key: "id", header: "#" },
    { key: "ticket", header: "Ticket", render: (r) => (r.ticketId ? `#${r.ticketId}` : "—") },
    { key: "amount", header: "Amount", render: (r) => `${Number(r.amount || 0).toLocaleString()} SYP` },
    { key: "description", header: "Description", render: (r) => r.description || "—" },
    {
      key: "contractor",
      header: "Contractor",
      render: (r) => r.contractor?.fullName || r.contractor?.name || (r.contractorId ? `#${r.contractorId}` : "—"),
    },
    {
      key: "date",
      header: "Date",
      render: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"),
    },
  ];

  const inputClass =
    "mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-white/15";
  const selectClass =
    "mt-1 w-full appearance-none rounded-xl border border-white/10 bg-[#0b1220]/60 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-white/15 focus:ring-2 focus:ring-white/30";
  const optionClass = "bg-[#050912] text-slate-100";

  return (
    <section className="space-y-4">
      <PageHeader
        title="Expenses"
        subtitle="Track and manage maintenance and operational expenses."
        actions={
          <button
            className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10"
            onClick={() => setShowForm(true)}
          >
            + New Expense
          </button>
        }
      />

      <Card className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-white md:text-base">Expense Records</h3>
          <p className="mt-1 text-xs text-slate-300">Create, review, and remove expense entries.</p>
        </div>
        <Table columns={columns} rows={rows} emptyText="No expenses recorded" />
      </Card>

      {showForm ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#050912]/95 p-5 backdrop-blur-xl">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
              <div className="relative">
                <h3 className="text-lg font-semibold text-white">Create Expense</h3>
                <p className="mt-1 text-xs text-slate-300">Fill expense details and save.</p>
              </div>
            </div>

            <form onSubmit={createExpense} className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-slate-300">Ticket (optional)</label>
                <div className="relative">
                  <select
                    className={selectClass}
                    value={form.ticketId}
                    onChange={(e) => setForm({ ...form, ticketId: e.target.value })}
                  >
                    <option className={optionClass} value="">No ticket</option>
                    {tickets.map((t) => (
                      <option className={optionClass} key={t.id} value={t.id}>
                        #{t.id} — {t.category || t.title || "Ticket"}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-300">
                    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="m5 7 5 5 5-5" />
                    </svg>
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300">Amount (SYP) *</label>
                <input
                  type="number"
                  className={inputClass}
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs text-slate-300">Description *</label>
                <input
                  type="text"
                  className={inputClass}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs text-slate-300">Contractor (optional)</label>
                <div className="relative">
                  <select
                    className={selectClass}
                    value={form.contractorId}
                    onChange={(e) => setForm({ ...form, contractorId: e.target.value })}
                  >
                    <option className={optionClass} value="">No contractor</option>
                    {contractors.map((c) => (
                      <option className={optionClass} key={c.id} value={c.id}>
                        {c.fullName || c.name || c.email}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-300">
                    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="m5 7 5 5 5-5" />
                    </svg>
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10"
              >
                Save Expense
              </button>
            </form>

            <button
              type="button"
              className="mt-3 w-full rounded-xl border border-white/20 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              onClick={() => setShowForm(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
