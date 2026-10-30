import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "../lib/http";
import { toast } from "../utils/toast";
import { money, label } from "../lib/format";
import { PageHeader, Card, Stat, Table, Badge, Spinner, ErrorNote, Button, Modal, Field, Input, SectionTitle, useLoad, Textarea } from "../components/ui/kit";
import PasswordReveal from "../components/PasswordReveal";

const RestaurantDetail = () => {
  const { id } = useParams();
  const { data, error, loading, reload } = useLoad(() => api.get(`/api/admin/restaurants/${id}`), [id]);
  const [reset, setReset] = useState(null);
  const [revealed, setRevealed] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);

  if (loading) return <Spinner />;
  if (error) return <ErrorNote error={error} onRetry={reload} />;
  const { summary: s, staff, outlets, roles } = data;

  const doReset = async () => {
    setBusy(true);
    try {
      const res = await api.post(`/api/admin/restaurants/${id}/reset-owner-password`, { password: newPassword || null });
      setReset(null);
      setNewPassword("");
      if (res.generatedPassword) setRevealed({ title: "Owner password reset", email: res.ownerEmail, password: res.generatedPassword });
      else toast.success("Owner password changed.");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const toggle = async () => {
    setBusy(true);
    try {
      if (s.active) await api.post(`/api/admin/restaurants/${id}/suspend`, { reason });
      else await api.post(`/api/admin/restaurants/${id}/reactivate`);
      toast.success(s.active ? "Restaurant suspended." : "Restaurant reactivated.");
      setSuspendOpen(false);
      setReason("");
      reload(true);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Link to="/platform/restaurants" className="inline-flex items-center gap-2 text-sm text-[#A2A1A8] hover:text-gray-700 mb-3">
        <ArrowLeft className="h-4 w-4" /> Back to restaurants
      </Link>
      <PageHeader
        title={s.name}
        subtitle={`${s.code} · owner ${s.ownerName || "—"} (${s.ownerEmail || "no email"})`}
        actions={
          <>
            <Badge tone={s.active ? "green" : "red"}>{s.active ? "Active" : "Suspended"}</Badge>
            <Button onClick={() => setEditing(true)}>Edit details</Button>
            <Button variant="secondary" onClick={() => setReset(true)}>Reset owner password</Button>
            {s.active ? (
              <Button variant="danger" onClick={() => setSuspendOpen(true)}>Suspend</Button>
            ) : (
              <Button onClick={toggle} loading={busy}>Reactivate</Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <Stat label="Outlets" value={s.outlets} />
        <Stat label="Staff" value={s.staff} />
        <Stat label="Revenue" value={money(s.revenue)} />
        <Stat label="Order approval" value={data.approvalRequired ? "Required" : "Off"} />
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <Card>
          <SectionTitle>Outlets</SectionTitle>
          <Table headers={["Name", "Type", "Status"]} className="border-0">
            {outlets.map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3 font-medium">{o.name}</td>
                <td className="px-4 py-3">{label(o.type)}</td>
                <td className="px-4 py-3"><Badge tone={o.status === "OPEN" ? "green" : "amber"}>{label(o.status)}</Badge></td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card>
          <SectionTitle>Roles</SectionTitle>
          <div className="space-y-3">
            {roles.map((r) => (
              <details key={r.role} className="rounded-[10px] border border-gray-200 px-4 py-3">
                <summary className="cursor-pointer text-sm font-medium text-gray-800">
                  {label(r.role)} <span className="text-[#A2A1A8] font-normal">· {r.permissions.length} permissions</span>
                </summary>
                <p className="mt-2 text-xs text-gray-500 leading-6">{r.permissions.join(", ")}</p>
              </details>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <SectionTitle>Staff</SectionTitle>
        <Table headers={["Name", "Email", "Role", "Outlets", "Status"]} className="border-0">
          {staff.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-3 font-medium">{p.fullName}</td>
              <td className="px-4 py-3 text-gray-600">{p.email}</td>
              <td className="px-4 py-3">{label(p.role)}</td>
              <td className="px-4 py-3 text-gray-600">{p.outletNames.join(", ") || "All"}</td>
              <td className="px-4 py-3"><Badge tone={p.status === "ACTIVE" ? "green" : "gray"}>{label(p.status)}</Badge></td>
            </tr>
          ))}
        </Table>
      </Card>
      <p className="text-xs text-[#A2A1A8] mt-4">
        For privacy, orders, stock and customer records of a restaurant are not visible from the platform console.
      </p>

      <Modal
        open={!!reset}
        title="Reset owner password"
        onClose={() => setReset(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setReset(null)}>Cancel</Button>
            <Button onClick={doReset} loading={busy}>Reset password</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">The owner is signed out everywhere. Leave the box empty to generate a strong password you can pass on.</p>
        <Field label="New password (optional)" hint="At least 8 characters">
          <Input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="off" />
        </Field>
      </Modal>

      <Modal
        open={suspendOpen}
        title={`Suspend ${s.name}?`}
        onClose={() => setSuspendOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSuspendOpen(false)}>Cancel</Button>
            <Button variant="danger" loading={busy} onClick={toggle}>Suspend restaurant</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">Nobody can sign in or keep using their session until you reactivate the account.</p>
        <Field label="Reason (kept in the record)">
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
      </Modal>

      {editing && (
        <EditDialog summary={s} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); reload(true); }} />
      )}

      <PasswordReveal data={revealed} onClose={() => setRevealed(null)} />
    </div>
  );
};

const EditDialog = ({ summary: s, onClose, onSaved }) => {
  const [f, setF] = useState({
    name: s.name || "", phone: s.phone || "", address: s.address || "", ownerFirstName: s.ownerFirstName || "",
    ownerLastName: s.ownerLastName || "", ownerEmail: s.ownerEmail || "", ownerPhone: s.ownerPhone || "",
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const emailChanged = f.ownerEmail.trim().toLowerCase() !== (s.ownerEmail || "");

  const save = async () => {
    setBusy(true);
    try {
      await api.put(`/api/admin/restaurants/${s.id}`, f);
      toast.success("Details saved.");
      onSaved();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open wide title={`Edit ${s.name}`} onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={busy} disabled={!f.name.trim()} onClick={save}>Save changes</Button></>}>
      <h4 className="text-sm font-semibold text-gray-900">Restaurant</h4>
      <Field label="Name"><Input value={f.name} onChange={set("name")} /></Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Phone"><Input value={f.phone} onChange={set("phone")} /></Field>
        <Field label="Address"><Input value={f.address} onChange={set("address")} /></Field>
      </div>
      <h4 className="text-sm font-semibold text-gray-900 pt-2">Owner</h4>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="First name"><Input value={f.ownerFirstName} onChange={set("ownerFirstName")} /></Field>
        <Field label="Last name"><Input value={f.ownerLastName} onChange={set("ownerLastName")} /></Field>
        <Field label="Login email" hint={emailChanged ? "Changing it signs the owner out. They sign in again with the new email." : undefined}>
          <Input type="email" value={f.ownerEmail} onChange={set("ownerEmail")} />
        </Field>
        <Field label="Phone"><Input value={f.ownerPhone} onChange={set("ownerPhone")} /></Field>
      </div>
    </Modal>
  );
};

export default RestaurantDetail;
