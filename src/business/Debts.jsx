import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/http";
import { money, dateOnly, label } from "../lib/format";
import { PageHeader, Stat, Table, Badge, Spinner, ErrorNote, Empty, Toggle, Select, Card, SectionTitle, useLoad } from "../components/ui/kit";
import OutletFilter from "./OutletFilter";

const Debts = () => {
  const [outletId, setOutletId] = useState(null);
  const [customerId, setCustomerId] = useState("");
  const [lateOnly, setLateOnly] = useState(false);
  const [openOnly, setOpenOnly] = useState(true);
  const { data, error, loading, reload } = useLoad(() => api.get("/api/debts", { outletId, customerId, openOnly }), [outletId, customerId, openOnly]);
  const customers = useLoad(() => api.get("/api/customers"));

  const rows = (data || []).filter((d) => !lateOnly || d.overdue);
  const owed = (data || []).reduce((s, d) => s + d.outstanding, 0);
  const late = (data || []).filter((d) => d.overdue);
  const lateAmount = late.reduce((s, d) => s + d.outstanding, 0);

  const byOutlet = Object.values(
    (data || []).filter((d) => d.outstanding > 0).reduce((acc, d) => {
      const k = d.outletName || "—";
      acc[k] = acc[k] || { name: k, amount: 0, count: 0 };
      acc[k].amount += d.outstanding;
      acc[k].count += 1;
      return acc;
    }, {})
  );

  return (
    <div>
      <PageHeader title="Debts" subtitle="What customers owe, what is late and how late." actions={<OutletFilter value={outletId} onChange={setOutletId} />} />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Stat label="Total owed" value={money(owed)} />
        <Stat label="Open debts" value={(data || []).filter((d) => d.outstanding > 0).length} />
        <Stat label="Overdue" value={money(lateAmount)} tone={lateAmount > 0 ? "red" : undefined} sub={`${late.length} debt(s)`} />
        <Stat label="Customers in debt" value={new Set((data || []).filter((d) => d.outstanding > 0).map((d) => d.customerId)).size} />
      </div>

      {byOutlet.length > 1 && (
        <Card className="mb-6">
          <SectionTitle>Debt by outlet</SectionTitle>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {byOutlet.map((o) => (
              <div key={o.name} className="rounded-[10px] bg-gray-50 px-4 py-3">
                <p className="text-sm text-gray-600">{o.name}</p>
                <p className="font-semibold">{money(o.amount)}</p>
                <p className="text-xs text-[#A2A1A8]">{o.count} debt(s)</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-4 mb-4">
        <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="!w-auto min-w-[200px]">
          <option value="">All customers</option>
          {(customers.data || []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Toggle checked={lateOnly} onChange={setLateOnly} label="Late only" />
        <Toggle checked={openOnly} onChange={setOpenOnly} label="Hide settled" />
      </div>

      {error && <ErrorNote error={error} onRetry={reload} />}
      {loading && !data ? <Spinner /> : rows.length === 0 ? <Empty title="No debts to show" /> : (
        <Table headers={["Customer", "Order", "Outlet", { text: "Original", right: true }, { text: "Paid", right: true }, { text: "Owed", right: true }, "Due", "Status"]}>
          {rows.map((d) => (
            <tr key={d.id} className="hover:bg-gray-50">
              <td className="px-4 py-3"><Link to={`/debts/${d.id}`} className="font-medium text-gray-900 hover:text-[#FF6F00]">{d.customerName}</Link></td>
              <td className="px-4 py-3 text-gray-600">{d.orderCode || "—"}</td>
              <td className="px-4 py-3 text-gray-600">{d.outletName || "—"}</td>
              <td className="px-4 py-3 text-right">{money(d.originalAmount)}</td>
              <td className="px-4 py-3 text-right">{money(d.paidAmount)}</td>
              <td className="px-4 py-3 text-right font-semibold">{money(d.outstanding)}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                {dateOnly(d.dueDate)}
                {d.overdue && <div className="text-xs text-red-600">{d.daysOverdue} day(s) late</div>}
              </td>
              <td className="px-4 py-3"><Badge tone={d.status === "SETTLED" ? "green" : d.overdue ? "red" : d.status === "PARTIAL" ? "amber" : "blue"}>{label(d.status)}</Badge></td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
};

export default Debts;
