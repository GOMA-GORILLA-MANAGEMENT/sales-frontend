import React, { useState } from "react";
import { Plus } from "lucide-react";
import { api } from "../lib/http";
import { toast } from "../utils/toast";
import { money, dateOnly, daysAgo, today } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import { PageHeader, Stat, Table, Badge, Spinner, ErrorNote, Empty, Button, Modal, Field, Input, Select, Textarea, useLoad } from "../components/ui/kit";
import OutletFilter from "./OutletFilter";

const CATEGORIES = ["Salaries", "Rent", "Electricity", "Water", "Gas", "Transport", "Repairs", "Cleaning", "Marketing", "Licences and taxes", "Other"];

const Expenses = () => {
  const { user, can } = useAuth();
  const [from, setFrom] = useState(daysAgo(29));
  const [to, setTo] = useState(today());
  const [outletId, setOutletId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [voiding, setVoiding] = useState(null);
  const { data, error, loading, reload } = useLoad(() => api.get("/api/expenses", { outletId, from, to }), [outletId, from, to]);

  const total = (data || []).filter((e) => !e.voided).reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <PageHeader title="Expenses" subtitle="Money spent running the business. Mistakes are voided with a reason, never deleted."
        actions={<>
          <OutletFilter value={outletId} onChange={setOutletId} />
          <Input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="!w-auto" />
          <Input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className="!w-auto" />
          <Button onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> Record expense</Button>
        </>} />
      <div className="mb-5 max-w-xs"><Stat label="Total in this period" value={money(total)} /></div>
      {error && <ErrorNote error={error} onRetry={reload} />}
      {loading && !data ? <Spinner /> : data && data.length === 0 ? <Empty title="No expenses in this period" /> : data ? (
        <Table headers={["Date", "Outlet", "Category", "Description", { text: "Amount", right: true }, "By", ""]}>
          {data.map((e) => (
            <tr key={e.id} className={e.voided ? "text-gray-400" : ""}>
              <td className="px-4 py-3 whitespace-nowrap">{dateOnly(e.expenseDate)}</td>
              <td className="px-4 py-3">{e.outletName}</td>
              <td className="px-4 py-3">{e.category}</td>
              <td className="px-4 py-3">{e.description}{e.voided && <div className="text-xs">Voided by {e.voidedByName}: {e.voidReason}</div>}</td>
              <td className={`px-4 py-3 text-right font-medium ${e.voided ? "line-through" : ""}`}>{money(e.amount)}</td>
              <td className="px-4 py-3">{e.byName}</td>
              <td className="px-4 py-3 text-right">
                {e.voided ? <Badge>Voided</Badge> : can("expense:void") && <Button variant="ghost" size="sm" onClick={() => setVoiding(e)}>Void</Button>}
              </td>
            </tr>
          ))}
        </Table>
      ) : null}
      {adding && <AddDialog outlets={user.outlets || []} onClose={() => setAdding(false)} onSaved={() => { setAdding(false); reload(true); }} />}
      {voiding && <VoidDialog expense={voiding} onClose={() => setVoiding(null)} onSaved={() => { setVoiding(null); reload(true); }} />}
    </div>
  );
};

const AddDialog = ({ outlets, onClose, onSaved }) => {
  const [f, setF] = useState({ outletId: outlets[0]?.id ?? "", category: "Other", description: "", amount: "", expenseDate: today() });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const save = async () => {
    setBusy(true);
    try {
      await api.post("/api/expenses", { ...f, outletId: Number(f.outletId), amount: Number(f.amount) });
      toast.success("Expense recorded.");
      onSaved();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open title="Record an expense" onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={busy} disabled={!f.outletId || !(Number(f.amount) > 0)} onClick={save}>Save</Button></>}>
      {outlets.length > 1 && (
        <Field label="Outlet"><Select value={f.outletId} onChange={set("outletId")}>{outlets.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</Select></Field>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Category"><Select value={f.category} onChange={set("category")}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
        <Field label="Date"><Input type="date" max={today()} value={f.expenseDate} onChange={set("expenseDate")} /></Field>
      </div>
      <Field label="Amount (RWF)"><Input type="number" min="0" value={f.amount} onChange={set("amount")} autoFocus /></Field>
      <Field label="Description (optional)"><Input value={f.description} onChange={set("description")} /></Field>
    </Modal>
  );
};

const VoidDialog = ({ expense, onClose, onSaved }) => {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try {
      await api.post(`/api/expenses/${expense.id}/void`, { reason });
      toast.success("Expense voided.");
      onSaved();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open title="Void this expense" onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Back</Button><Button variant="danger" loading={busy} disabled={!reason.trim()} onClick={save}>Void expense</Button></>}>
      <p className="text-sm text-gray-600">{expense.category} · {money(expense.amount)}. It stays in the record, marked as voided.</p>
      <Field label="Reason (required)"><Textarea value={reason} onChange={(e) => setReason(e.target.value)} autoFocus /></Field>
    </Modal>
  );
};

export default Expenses;
