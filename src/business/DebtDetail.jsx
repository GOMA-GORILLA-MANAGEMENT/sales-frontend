import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import { api } from "../lib/http";
import { toast } from "../utils/toast";
import { money, dateOnly, dateTime, label, METHODS } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import { PageHeader, Card, Stat, Table, Badge, Spinner, ErrorNote, Button, Modal, Field, Input, Select, Textarea, SectionTitle, useLoad } from "../components/ui/kit";
import { printReceipt } from "./receipt";

const DebtDetail = () => {
  const { id } = useParams();
  const { user, can } = useAuth();
  const { data, error, loading, reload, setData } = useLoad(() => api.get(`/api/debts/${id}`), [id]);
  const [dialog, setDialog] = useState(null); // 'pay' | 'adjust' | {reverse: payment}
  const [busy, setBusy] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");
  const [type, setType] = useState("DISCOUNT");
  const [reason, setReason] = useState("");

  if (loading && !data) return <Spinner />;
  if (error) return <ErrorNote error={error} onRetry={reload} />;
  const { debt: d, payments, adjustments } = data;

  const run = async (fn, ok) => {
    setBusy(true);
    try {
      setData(await fn());
      toast.success(ok);
      setDialog(null);
      setAmount("");
      setReason("");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Link to="/debts" className="inline-flex items-center gap-2 text-sm text-[#A2A1A8] hover:text-gray-700 mb-3"><ArrowLeft className="h-4 w-4" /> Back to debts</Link>
      <PageHeader
        title={`${d.customerName} · ${d.orderCode || "Debt"}`}
        subtitle={`${d.outletName || ""} · responsible: ${d.responsibleName || "—"} · due ${dateOnly(d.dueDate)}`}
        actions={
          <>
            <Badge tone={d.status === "SETTLED" ? "green" : d.overdue ? "red" : "amber"}>{label(d.status)}</Badge>
            {d.outstanding > 0 && can("payment:take") && <Button onClick={() => { setAmount(String(d.outstanding)); setDialog("pay"); }}>Record payment</Button>}
            {d.outstanding > 0 && can("debt:adjust") && <Button variant="secondary" onClick={() => { setAmount(""); setDialog("adjust"); }}>Discount, write off or correct</Button>}
          </>
        }
      />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Stat label="Original debt" value={money(d.originalAmount)} />
        <Stat label="Paid" value={money(d.paidAmount)} tone="green" />
        <Stat label="Discounts, write-offs" value={money(d.adjustedAmount)} />
        <Stat label="Still owed" value={money(d.outstanding)} tone={d.outstanding > 0 ? "red" : "green"} sub={d.overdue ? `${d.daysOverdue} day(s) late` : undefined} />
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <Card>
          <SectionTitle>Payments</SectionTitle>
          {payments.length === 0 ? <p className="text-sm text-[#A2A1A8]">No payment yet.</p> : (
            <Table headers={["Receipt", "When", "Method", { text: "Amount", right: true }, ""]} className="border-0">
              {payments.map((p) => (
                <tr key={p.id} className={p.kind === "REVERSAL" || p.reversed ? "text-gray-400" : ""}>
                  <td className="px-4 py-3">{p.receiptNumber}{p.kind === "REVERSAL" && <div className="text-xs">Reversal: {p.reason}</div>}{p.reversed && <div className="text-xs">Reversed</div>}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{dateTime(p.at)}<div className="text-xs">{p.byName}</div></td>
                  <td className="px-4 py-3">{label(p.method)}</td>
                  <td className="px-4 py-3 text-right font-medium">{money(p.amount)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => printReceipt({ business: user.businessName, payment: p, debt: d })} className="p-1.5 text-gray-500 hover:text-[#FF6F00]" aria-label="Print receipt"><Printer className="h-4 w-4" /></button>
                    {can("debt:adjust") && p.kind === "DEBT_PAYMENT" && !p.reversed && (
                      <Button variant="ghost" size="sm" onClick={() => setDialog({ reverse: p })}>Reverse</Button>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          )}
          <p className="text-xs text-[#A2A1A8] mt-3">Payments are never edited. A mistake is cancelled by a reversal that stays in the record.</p>
        </Card>
        <Card>
          <SectionTitle>Discounts, write-offs and corrections</SectionTitle>
          {adjustments.length === 0 ? <p className="text-sm text-[#A2A1A8]">None.</p> : (
            <Table headers={["When", "Type", { text: "Amount", right: true }, "Reason"]} className="border-0">
              {adjustments.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 whitespace-nowrap">{dateTime(a.at)}<div className="text-xs text-gray-500">{a.byName}</div></td>
                  <td className="px-4 py-3">{label(a.type)}</td>
                  <td className="px-4 py-3 text-right">{money(a.amount)}</td>
                  <td className="px-4 py-3 text-gray-600">{a.reason}</td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </div>

      <Modal open={dialog === "pay"} title="Record a payment" onClose={() => setDialog(null)}
        footer={<><Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button>
          <Button loading={busy} disabled={!(Number(amount) > 0)} onClick={() => run(() => api.post(`/api/debts/${id}/payments`, { amount: Number(amount), method }), "Payment recorded.")}>Save payment</Button></>}>
        <p className="text-sm text-gray-600">Owed now: <strong>{money(d.outstanding)}</strong>. Part payments are fine.</p>
        <Field label="Amount (RWF)"><Input type="number" min="0" max={d.outstanding} value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus /></Field>
        <Field label="Paid by"><Select value={method} onChange={(e) => setMethod(e.target.value)}>{METHODS.filter((m) => m.value !== "CREDIT").map((m) => <option key={m.value} value={m.value}>{m.text}</option>)}</Select></Field>
      </Modal>

      <Modal open={dialog === "adjust"} title="Discount, write off or correct" onClose={() => setDialog(null)}
        footer={<><Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button>
          <Button loading={busy} disabled={!Number(amount) || !reason.trim()} onClick={() => run(() => api.post(`/api/debts/${id}/adjustments`, { type, amount: Number(amount), reason }), "Recorded.")}>Save</Button></>}>
        <Field label="What is it?">
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="DISCOUNT">Discount (customer pays less)</option>
            <option value="WRITE_OFF">Write off (give up on collecting)</option>
            <option value="CORRECTION">Correction (fix a wrong amount)</option>
          </Select>
        </Field>
        <Field label="Amount to take off (RWF)" hint={type === "CORRECTION" ? "Use a negative number to raise the debt." : undefined}><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
        <Field label="Reason (required)"><Textarea value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
      </Modal>

      <Modal open={!!dialog?.reverse} title="Reverse this payment" onClose={() => setDialog(null)}
        footer={<><Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button>
          <Button variant="danger" loading={busy} disabled={!reason.trim()} onClick={() => run(() => api.post(`/api/payments/${dialog.reverse.id}/reverse`, { reason }), "Payment reversed.")}>Reverse payment</Button></>}>
        {dialog?.reverse && <p className="text-sm text-gray-600">Receipt {dialog.reverse.receiptNumber} for {money(dialog.reverse.amount)} will be cancelled by a new entry, and the debt goes back up.</p>}
        <Field label="Reason (required)"><Textarea value={reason} onChange={(e) => setReason(e.target.value)} /></Field>
      </Modal>
    </div>
  );
};

export default DebtDetail;
