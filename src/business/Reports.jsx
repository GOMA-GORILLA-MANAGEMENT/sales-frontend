import React, { useState } from "react";
import { FileDown, FileSpreadsheet } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { api } from "../lib/http";
import { toast } from "../utils/toast";
import { number, daysAgo, today } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import { PageHeader, Card, Button, Select, Input, Spinner, ErrorNote, Empty, useLoad } from "../components/ui/kit";
import OutletFilter from "./OutletFilter";

const REPORTS = [
  { value: "sales", text: "Sales", hint: "Every delivered order with its cost of goods and payment." },
  { value: "products", text: "Product performance", hint: "What sold, how much, and what it cost." },
  { value: "stock", text: "Stock balances", hint: "What is on the shelves now and what it is worth." },
  { value: "movements", text: "Stock movements", hint: "Every receipt, sale, transfer, breakage and count." },
  { value: "reconciliation", text: "Stock reconciliation", hint: "Opening + received − sold ± adjustments = closing." },
  { value: "debts", text: "Customer debts", hint: "Open debts and how late they are." },
  { value: "aging", text: "Debt aging", hint: "Debt grouped by how late it is." },
  { value: "payments", text: "Payments and receipts", hint: "All money received, with reversals." },
  { value: "expenses", text: "Expenses", hint: "What was spent, by category and outlet." },
  { value: "audit", text: "Audit trail", hint: "Who did what, with the integrity hash.", permission: "audit:view" },
];

const Reports = () => {
  const { can } = useAuth();
  const available = REPORTS.filter((r) => !r.permission || can(r.permission));
  const [type, setType] = useState("sales");
  const [from, setFrom] = useState(daysAgo(29));
  const [to, setTo] = useState(today());
  const [outletId, setOutletId] = useState(null);
  const [busy, setBusy] = useState(false);
  const params = { from, to, outletId };
  const { data, error, loading, reload } = useLoad(() => api.get(`/api/reports/${type}`, params), [type, from, to, outletId]);
  const current = REPORTS.find((r) => r.value === type);
  const usesPeriod = !["stock", "debts", "aging"].includes(type);

  const excel = async () => {
    setBusy(true);
    try {
      await api.download(`/api/reports/${type}/export`, params, `${type}-report.xlsx`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const pdf = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text(data.title, 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [data.headers],
      body: data.rows.map((r) => r.map((c) => (typeof c === "number" ? number(c) : String(c ?? "")))),
      foot: data.totals ? [data.totals.map((c) => (typeof c === "number" ? number(c) : String(c ?? "")))] : undefined,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [255, 111, 0] },
      footStyles: { fillColor: [245, 245, 245], textColor: 20 },
    });
    doc.save(`${type}-report.pdf`);
  };

  return (
    <div>
      <PageHeader title="Reports" subtitle={current.hint}
        actions={<>
          <Button variant="secondary" onClick={excel} loading={busy}><FileSpreadsheet className="h-4 w-4" /> Excel</Button>
          <Button variant="secondary" onClick={pdf} disabled={!data}><FileDown className="h-4 w-4" /> PDF</Button>
        </>} />
      <div className="flex flex-wrap gap-3 mb-5">
        <Select value={type} onChange={(e) => setType(e.target.value)} className="!w-auto min-w-[220px]">
          {available.map((r) => <option key={r.value} value={r.value}>{r.text}</option>)}
        </Select>
        {type !== "audit" && <OutletFilter value={outletId} onChange={setOutletId} />}
        {usesPeriod && (
          <>
            <Input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="!w-auto" />
            <Input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className="!w-auto" />
          </>
        )}
      </div>
      {error && <ErrorNote error={error} onRetry={reload} />}
      {loading && !data ? <Spinner /> : data ? (
        <Card className="!p-0 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 font-medium text-gray-900">{data.title}</div>
          {data.rows.length === 0 ? <Empty title="Nothing to show for this choice" /> : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                  <tr>{data.headers.map((h) => <th key={h} className="px-4 py-3 font-medium whitespace-nowrap">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.rows.map((r, i) => (
                    <tr key={i}>{r.map((c, j) => <td key={j} className={`px-4 py-2.5 whitespace-nowrap ${typeof c === "number" ? "text-right" : ""}`}>{typeof c === "number" ? number(c) : String(c ?? "")}</td>)}</tr>
                  ))}
                </tbody>
                {data.totals && (
                  <tfoot className="bg-gray-50 font-semibold">
                    <tr>{data.totals.map((c, j) => <td key={j} className={`px-4 py-3 whitespace-nowrap ${typeof c === "number" ? "text-right" : ""}`}>{typeof c === "number" ? number(c) : String(c ?? "")}</td>)}</tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </Card>
      ) : null}
    </div>
  );
};

export default Reports;
