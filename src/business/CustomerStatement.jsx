import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { api } from "../lib/http";
import { money, dateOnly, dateTime, label } from "../lib/format";
import { PageHeader, Card, Stat, Table, Badge, Spinner, ErrorNote, Button, SectionTitle, useLoad } from "../components/ui/kit";

const CustomerStatement = () => {
  const { id } = useParams();
  const { data, error, loading, reload } = useLoad(() => api.get(`/api/customers/${id}/statement`), [id]);
  if (loading) return <Spinner />;
  if (error) return <ErrorNote error={error} onRetry={reload} />;
  const s = data;
  return (
    <div>
      <Link to="/customers" className="inline-flex items-center gap-2 text-sm text-[#A2A1A8] hover:text-gray-700 mb-3"><ArrowLeft className="h-4 w-4" /> Back to customers</Link>
      <PageHeader title={`Statement · ${s.customer.name}`} subtitle={`Credit limit ${money(s.customer.creditLimit)} · ${s.customer.creditDays} days to pay`}
        actions={<Button variant="secondary" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print</Button>} />
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <Stat label="Billed on credit" value={money(s.totalBilled)} />
        <Stat label="Paid" value={money(s.totalPaid)} tone="green" />
        <Stat label="Discounts, write-offs" value={money(s.totalAdjusted)} />
        <Stat label="Owes now" value={money(s.outstanding)} tone={s.outstanding > 0 ? "red" : "green"} />
        <Stat label="Overdue" value={money(s.overdue)} tone={s.overdue > 0 ? "red" : undefined} />
      </div>
      <div className="space-y-6">
        <Card>
          <SectionTitle>Debts</SectionTitle>
          <Table headers={["Order", "Outlet", "Due", { text: "Original", right: true }, { text: "Paid", right: true }, { text: "Owed", right: true }, "Status"]} className="border-0">
            {s.debts.map((d) => (
              <tr key={d.id}>
                <td className="px-4 py-3"><Link to={`/debts/${d.id}`} className="text-[#FF6F00] hover:underline">{d.orderCode || `#${d.id}`}</Link></td>
                <td className="px-4 py-3">{d.outletName}</td>
                <td className="px-4 py-3">{dateOnly(d.dueDate)}{d.overdue && <span className="ml-2 text-xs text-red-600">{d.daysOverdue}d late</span>}</td>
                <td className="px-4 py-3 text-right">{money(d.originalAmount)}</td>
                <td className="px-4 py-3 text-right">{money(d.paidAmount)}</td>
                <td className="px-4 py-3 text-right font-medium">{money(d.outstanding)}</td>
                <td className="px-4 py-3"><Badge tone={d.status === "SETTLED" ? "green" : "amber"}>{label(d.status)}</Badge></td>
              </tr>
            ))}
          </Table>
        </Card>
        <Card>
          <SectionTitle>Payments</SectionTitle>
          <Table headers={["Receipt", "When", "Method", { text: "Amount", right: true }]} className="border-0">
            {s.payments.map((p) => (
              <tr key={p.id} className={p.kind === "REVERSAL" ? "text-gray-400" : ""}>
                <td className="px-4 py-3">{p.receiptNumber}</td>
                <td className="px-4 py-3">{dateTime(p.at)}</td>
                <td className="px-4 py-3">{label(p.method)}</td>
                <td className="px-4 py-3 text-right">{money(p.amount)}</td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default CustomerStatement;
