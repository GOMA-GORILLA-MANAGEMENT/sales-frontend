import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { api } from "../lib/http";
import { toast } from "../utils/toast";
import { money } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import { PageHeader, Button, Badge, Table, Spinner, ErrorNote, Empty, Modal, Field, Input, Toggle, useLoad } from "../components/ui/kit";

const Customers = () => {
  const { can } = useAuth();
  const { data, error, loading, reload } = useLoad(() => api.get("/api/customers"));
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState("");
  const rows = (data || []).filter((c) => c.name.toLowerCase().includes(query.toLowerCase()) || (c.phone || "").includes(query));

  return (
    <div>
      <PageHeader title="Customers" subtitle="People who may eat or drink now and pay later."
        actions={can("customer:manage") && <Button onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Add customer</Button>} />
      <div className="mb-4 max-w-sm"><Input placeholder="Search by name or phone" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
      {error && <ErrorNote error={error} onRetry={reload} />}
      {loading ? <Spinner /> : rows.length === 0 ? <Empty title="No customers found" /> : (
        <Table headers={["Name", "Phone", "ID", { text: "Credit limit", right: true }, "Days to pay", { text: "Owes now", right: true }, ""]}>
          {rows.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">{c.name}{!c.active && <span className="ml-2"><Badge>Inactive</Badge></span>}</td>
              <td className="px-4 py-3 text-gray-600">{c.phone || "—"}</td>
              <td className="px-4 py-3 text-gray-600">{c.idNumber || "—"}</td>
              <td className="px-4 py-3 text-right">{money(c.creditLimit)}</td>
              <td className="px-4 py-3">{c.creditDays}</td>
              <td className={`px-4 py-3 text-right font-medium ${c.outstanding > 0 ? "text-red-600" : ""}`}>{money(c.outstanding)}</td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                {can("debt:view") && <Link to={`/customers/${c.id}/statement`} className="text-sm text-[#FF6F00] hover:underline mr-3">Statement</Link>}
                {can("customer:manage") && <Button variant="secondary" size="sm" onClick={() => setEditing(c)}>Edit</Button>}
              </td>
            </tr>
          ))}
        </Table>
      )}
      {editing && <CustomerDialog customer={editing.id ? editing : null} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(true); }} />}
    </div>
  );
};

const CustomerDialog = ({ customer, onClose, onSaved }) => {
  const { can } = useAuth();
  const [f, setF] = useState({
    name: customer?.name || "", phone: customer?.phone || "", email: customer?.email || "", idNumber: customer?.idNumber || "",
    creditLimit: String(customer?.creditLimit ?? 0), creditDays: String(customer?.creditDays ?? 30), active: customer?.active ?? true,
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const save = async () => {
    setBusy(true);
    try {
      const body = { ...f, creditLimit: Number(f.creditLimit) || 0, creditDays: Number(f.creditDays) || 0 };
      if (customer) await api.put(`/api/customers/${customer.id}`, body);
      else await api.post("/api/customers", body);
      toast.success("Saved.");
      onSaved();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open title={customer ? `Edit ${customer.name}` : "Add a customer"} onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={busy} disabled={!f.name.trim()} onClick={save}>Save</Button></>}>
      <Field label="Name"><Input value={f.name} onChange={set("name")} autoFocus /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Phone"><Input value={f.phone} onChange={set("phone")} /></Field>
        <Field label="ID number (optional)"><Input value={f.idNumber} onChange={set("idNumber")} /></Field>
      </div>
      <Field label="Email (optional)"><Input type="email" value={f.email} onChange={set("email")} /></Field>
      {can("credit:override") ? (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Credit limit (RWF)" hint="The most they may owe at once. 0 means no credit."><Input type="number" min="0" value={f.creditLimit} onChange={set("creditLimit")} /></Field>
          <Field label="Days to pay" hint="Before a debt counts as late."><Input type="number" min="0" value={f.creditDays} onChange={set("creditDays")} /></Field>
        </div>
      ) : (
        <p className="text-sm text-[#A2A1A8]">Credit limit and days to pay are set by the owner or an overall manager.</p>
      )}
      {customer && <Toggle checked={f.active} onChange={(v) => setF((p) => ({ ...p, active: v }))} label="Active" />}
    </Modal>
  );
};

export default Customers;
