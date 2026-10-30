import React, { useEffect, useState } from "react";
import { api } from "../lib/http";
import { toast } from "../utils/toast";
import { money, dateTime, label, ORDER_STATUS, PAYMENT_STATUS, METHODS } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import {
  PageHeader, Card, Button, Badge, Tabs, Table, Spinner, ErrorNote, Empty, Modal, Field, Input, Select, Textarea, useLoad,
} from "../components/ui/kit";
import OutletFilter from "./OutletFilter";

const TABS = [
  { value: "PENDING_APPROVAL", text: "Waiting for approval" },
  { value: "APPROVED", text: "To serve" },
  { value: "DELIVERED", text: "Delivered" },
  { value: "REJECTED", text: "Rejected" },
  { value: "CANCELLED", text: "Cancelled" },
  { value: "", text: "All" },
];

const StatusBadge = ({ status }) => {
  const s = ORDER_STATUS[status] || { text: label(status), tone: "gray" };
  return <Badge tone={s.tone}>{s.text}</Badge>;
};

const Orders = () => {
  const { user, can } = useAuth();
  const [tab, setTab] = useState(can("order:approve") ? "PENDING_APPROVAL" : "APPROVED");
  const [outletId, setOutletId] = useState(null);
  const [openId, setOpenId] = useState(null);

  const { data, error, loading, reload } = useLoad(() => api.get("/api/orders", { outletId, status: tab }), [tab, outletId]);
  const counts = useLoad(() => api.get("/api/orders", { outletId }), [outletId]);

  // New orders from waiters should show up without anyone pressing refresh.
  useEffect(() => {
    const t = setInterval(() => {
      reload(true);
      counts.reload(true);
    }, 20000);
    return () => clearInterval(t);
  }, [reload, counts.reload]);

  const countOf = (s) => (counts.data || []).filter((o) => o.status === s).length;
  const tabs = TABS.map((t) => ({ ...t, count: t.value === "PENDING_APPROVAL" || t.value === "APPROVED" ? countOf(t.value) : 0 }));

  const refreshAll = () => {
    reload(true);
    counts.reload(true);
  };

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle={can("order:view-all") ? "Approve what waiters send, then record delivery when it is served." : "Your orders."}
        actions={<OutletFilter value={outletId} onChange={setOutletId} />}
      />
      <Tabs tabs={tabs} value={tab} onChange={setTab} />
      {error && <ErrorNote error={error} onRetry={reload} />}
      {loading && !data ? (
        <Spinner />
      ) : data && data.length === 0 ? (
        <Empty title="No orders here" hint="New orders appear automatically." />
      ) : data ? (
        <Table headers={["Order", "Outlet", "Taken by", "Customer", { text: "Total", right: true }, "Status", "When"]}>
          {data.map((o) => (
            <tr key={o.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setOpenId(o.id)}>
              <td className="px-4 py-3">
                <span className="font-medium text-gray-900">{o.code}</span>
                {o.tableLabel && <div className="text-xs text-[#A2A1A8]">{o.tableLabel}</div>}
              </td>
              <td className="px-4 py-3 text-gray-600">{o.outletName}</td>
              <td className="px-4 py-3 text-gray-600">{o.createdByName}</td>
              <td className="px-4 py-3 text-gray-600">{o.customerName || "—"}</td>
              <td className="px-4 py-3 text-right font-medium">{money(o.totalAmount)}</td>
              <td className="px-4 py-3">
                <StatusBadge status={o.status} />
                {o.status === "DELIVERED" && (
                  <div className="mt-1"><Badge tone={PAYMENT_STATUS[o.paymentStatus].tone}>{PAYMENT_STATUS[o.paymentStatus].text}</Badge></div>
                )}
              </td>
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{dateTime(o.createdAt)}</td>
            </tr>
          ))}
        </Table>
      ) : null}

      {openId && <OrderPanel id={openId} me={user} can={can} onClose={() => setOpenId(null)} onChanged={refreshAll} />}
    </div>
  );
};

const OrderPanel = ({ id, me, can, onClose, onChanged }) => {
  const { data: o, error, loading, reload } = useLoad(() => api.get(`/api/orders/${id}`), [id]);
  const [mode, setMode] = useState(null); // 'reject' | 'cancel' | 'deliver'
  const [busy, setBusy] = useState(false);

  const act = async (fn, success) => {
    setBusy(true);
    try {
      await fn();
      toast.success(success);
      setMode(null);
      await reload(true);
      onChanged();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const mine = o && o.createdById === me.id;
  const canApprove = o && o.status === "PENDING_APPROVAL" && can("order:approve") && !mine;
  const canCancel = o && ["PENDING_APPROVAL", "APPROVED"].includes(o.status) && (can("order:cancel-any") || (can("order:cancel-own") && mine));
  const canDeliver = o && o.status === "APPROVED" && can("order:deliver");

  return (
    <Modal
      open
      wide
      title={o ? `${o.code} · ${o.outletName}` : "Order"}
      onClose={onClose}
      footer={
        o && (
          <>
            {canCancel && <Button variant="danger" onClick={() => setMode("cancel")}>Cancel order</Button>}
            {canApprove && <Button variant="danger" onClick={() => setMode("reject")}>Reject</Button>}
            {canApprove && <Button loading={busy} onClick={() => act(() => api.post(`/api/orders/${id}/approve`), "Order approved. It is ready to serve.")}>Approve</Button>}
            {canDeliver && <Button onClick={() => setMode("deliver")}>Record delivery</Button>}
          </>
        )
      }
    >
      {loading && !o ? (
        <Spinner />
      ) : error ? (
        <ErrorNote error={error} onRetry={reload} />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={o.status} />
            {o.status === "DELIVERED" && <Badge tone={PAYMENT_STATUS[o.paymentStatus].tone}>{PAYMENT_STATUS[o.paymentStatus].text}</Badge>}
            {o.receiptNumber && <Badge tone="blue">Receipt {o.receiptNumber}</Badge>}
            {o.tableLabel && <Badge>{o.tableLabel}</Badge>}
          </div>
          {mine && o.status === "PENDING_APPROVAL" && can("order:approve") && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-[10px] px-3 py-2">
              You created this order, so another manager has to approve it.
            </p>
          )}
          <dl className="grid sm:grid-cols-3 gap-4 text-sm">
            <div><dt className="text-[#A2A1A8]">Taken by</dt><dd className="font-medium">{o.createdByName}</dd></div>
            <div><dt className="text-[#A2A1A8]">Customer</dt><dd className="font-medium">{o.customerName || "—"}</dd></div>
            <div><dt className="text-[#A2A1A8]">Payment method</dt><dd className="font-medium">{label(o.paymentMethod)}</dd></div>
          </dl>
          <Table headers={["Item", { text: "Qty", right: true }, { text: "Price", right: true }, { text: "Total", right: true }]}>
            {o.lines.map((l) => (
              <tr key={l.id}>
                <td className="px-4 py-2.5">{l.itemName}</td>
                <td className="px-4 py-2.5 text-right">{l.quantity}</td>
                <td className="px-4 py-2.5 text-right">{money(l.unitPrice)}</td>
                <td className="px-4 py-2.5 text-right">{money(l.lineTotal)}</td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-semibold">
              <td className="px-4 py-2.5" colSpan={3}>Total</td>
              <td className="px-4 py-2.5 text-right">{money(o.totalAmount)}</td>
            </tr>
            {o.status === "DELIVERED" && (
              <tr>
                <td className="px-4 py-2.5 text-gray-600" colSpan={3}>Paid at delivery</td>
                <td className="px-4 py-2.5 text-right">{money(o.amountPaid)}</td>
              </tr>
            )}
          </Table>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">History</h4>
            <ol className="space-y-2 border-l-2 border-gray-200 pl-4">
              {o.history.map((h, i) => (
                <li key={i} className="text-sm">
                  <span className="font-medium">{ORDER_STATUS[h.to]?.text || label(h.to)}</span>{" "}
                  <span className="text-gray-500">by {h.byName} · {dateTime(h.at)}</span>
                  {h.reason && <div className="text-gray-600">“{h.reason}”</div>}
                </li>
              ))}
            </ol>
          </div>

          {mode === "reject" && (
            <ReasonModal title="Reject this order" action="Reject order" onClose={() => setMode(null)} busy={busy}
              onConfirm={(reason) => act(() => api.post(`/api/orders/${id}/reject`, { reason }), "Order rejected.")} />
          )}
          {mode === "cancel" && (
            <ReasonModal title="Cancel this order" action="Cancel order" onClose={() => setMode(null)} busy={busy}
              onConfirm={(reason) => act(() => api.post(`/api/orders/${id}/cancel`, { reason }), "Order cancelled.")} />
          )}
          {mode === "deliver" && <DeliverModal order={o} can={can} onClose={() => setMode(null)} onDone={() => { setMode(null); reload(true); onChanged(); }} />}
        </>
      )}
    </Modal>
  );
};

const ReasonModal = ({ title, action, onClose, onConfirm, busy }) => {
  const [reason, setReason] = useState("");
  return (
    <Modal
      open
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Back</Button>
          <Button variant="danger" loading={busy} disabled={!reason.trim()} onClick={() => onConfirm(reason.trim())}>{action}</Button>
        </>
      }
    >
      <Field label="Reason (required)">
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} autoFocus />
      </Field>
    </Modal>
  );
};

const DeliverModal = ({ order, can, onClose, onDone }) => {
  const [paid, setPaid] = useState(String(order.totalAmount));
  const [method, setMethod] = useState(order.paymentMethod === "CREDIT" ? "CASH" : order.paymentMethod);
  const [customerId, setCustomerId] = useState(order.customerId ? String(order.customerId) : "");
  const [override, setOverride] = useState("");
  const [needOverride, setNeedOverride] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const { data: customers } = useLoad(() => (can("customer:view") ? api.get("/api/customers") : Promise.resolve([])));

  const amount = Number(paid) || 0;
  const unpaid = Math.max(0, order.totalAmount - amount);

  const submit = async () => {
    setBusy(true);
    setProblem("");
    try {
      await api.post(`/api/orders/${order.id}/deliver`, {
        amountPaid: amount,
        paymentMethod: method,
        customerId: unpaid > 0 && customerId ? Number(customerId) : null,
        overrideReason: override.trim() || null,
      });
      toast.success(unpaid > 0 ? `Delivered. ${money(unpaid)} is now owed.` : "Delivered and paid.");
      onDone();
    } catch (e) {
      setProblem(e.message);
      if (/credit limit/i.test(e.message)) setNeedOverride(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      title={`Record delivery · ${order.code}`}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Back</Button>
          <Button loading={busy} onClick={submit}>Confirm delivery</Button>
        </>
      }
    >
      <p className="text-sm text-gray-600">
        Bill: <strong>{money(order.totalAmount)}</strong>. Confirming takes the items off the shelf and records the payment.
      </p>
      <Field label="Amount paid now (RWF)">
        <Input type="number" min="0" max={order.totalAmount} value={paid} onChange={(e) => setPaid(e.target.value)} />
      </Field>
      <Field label="How was it paid?">
        <Select value={method} onChange={(e) => setMethod(e.target.value)}>
          {METHODS.filter((m) => m.value !== "CREDIT").map((m) => <option key={m.value} value={m.value}>{m.text}</option>)}
        </Select>
      </Field>
      {unpaid > 0 && (
        <div className="rounded-[10px] border border-amber-200 bg-amber-50 p-4 space-y-3">
          <p className="text-sm text-amber-800">
            <strong>{money(unpaid)}</strong> is not paid. It will be recorded as a debt.
          </p>
          <Field label="Which customer owes the rest?">
            <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Choose a customer</option>
              {(customers || []).filter((c) => c.active).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          {needOverride && can("credit:override") && (
            <Field label="Written reason to override the credit limit" hint="This is kept in the audit trail.">
              <Textarea value={override} onChange={(e) => setOverride(e.target.value)} />
            </Field>
          )}
        </div>
      )}
      {problem && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-[10px] px-3 py-2">{problem}</p>}
    </Modal>
  );
};

export default Orders;
