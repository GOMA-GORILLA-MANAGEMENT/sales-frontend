import React, { useState } from "react";
import { Plus } from "lucide-react";
import { api } from "../lib/http";
import { toast } from "../utils/toast";
import { label } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import { PageHeader, Button, Badge, Table, Spinner, ErrorNote, Empty, Modal, Field, Input, Select, useLoad } from "../components/ui/kit";
import PasswordReveal from "../components/PasswordReveal";

const ASSIGNABLE = { OWNER: ["OVERALL_MANAGER", "MANAGER", "WAITER"], OVERALL_MANAGER: ["MANAGER", "WAITER"] };
const ROLE_HELP = {
  OVERALL_MANAGER: "Runs several outlets. Almost everything the owner can do, except business settings.",
  MANAGER: "Runs one outlet or a few. Approves orders, receives and moves stock, takes debt payments.",
  WAITER: "Takes orders, records delivery and takes payments at their outlet.",
};

const Team = () => {
  const { user } = useAuth();
  const { data, error, loading, reload } = useLoad(async () => {
    const [staff, outlets] = await Promise.all([api.get("/api/staff"), api.get("/api/outlets")]);
    return { staff, outlets };
  });
  const [editing, setEditing] = useState(null);
  const [revealed, setRevealed] = useState(null);
  const assignable = ASSIGNABLE[user.role] || [];

  return (
    <div>
      <PageHeader title="Team" subtitle="Everyone who works here, their role and the outlets they can use." actions={<Button onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Add team member</Button>} />
      {error && <ErrorNote error={error} onRetry={reload} />}
      {loading ? <Spinner /> : data.staff.length === 0 ? <Empty title="No team members yet" /> : (
        <Table headers={["Name", "Email", "Role", "Outlets", "Status", ""]}>
          {data.staff.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">{p.fullName}</td>
              <td className="px-4 py-3 text-gray-600">{p.email}</td>
              <td className="px-4 py-3">{label(p.role)}</td>
              <td className="px-4 py-3 text-gray-600">{p.role === "OWNER" ? "All" : p.outletNames.join(", ") || "All"}</td>
              <td className="px-4 py-3"><Badge tone={p.status === "ACTIVE" ? "green" : "gray"}>{label(p.status)}</Badge></td>
              <td className="px-4 py-3 text-right">{assignable.includes(p.role) && <Button variant="secondary" size="sm" onClick={() => setEditing(p)}>Manage</Button>}</td>
            </tr>
          ))}
        </Table>
      )}
      {editing && (
        <MemberDialog member={editing.id ? editing : null} outlets={data?.outlets || []} roles={assignable} onClose={() => setEditing(null)}
          onSaved={(secret) => { setEditing(null); reload(true); if (secret) setRevealed(secret); }} />
      )}
      <PasswordReveal data={revealed} onClose={() => setRevealed(null)} />
    </div>
  );
};

const MemberDialog = ({ member, outlets, roles, onClose, onSaved }) => {
  const [f, setF] = useState({
    firstName: member?.firstName || "", lastName: member?.lastName || "", email: member?.email || "", phone: member?.phone || "",
    role: member?.role || roles[roles.length - 1] || "WAITER", outletIds: member?.outletIds || [], password: "", status: member?.status || "ACTIVE",
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const toggleOutlet = (id) => setF((p) => ({ ...p, outletIds: p.outletIds.includes(id) ? p.outletIds.filter((x) => x !== id) : [...p.outletIds, id] }));
  const needsOutlet = f.role === "MANAGER" || f.role === "WAITER";

  const save = async () => {
    setBusy(true);
    try {
      if (member) {
        await api.put(`/api/staff/${member.id}`, { firstName: f.firstName, lastName: f.lastName, phone: f.phone, role: f.role, outletIds: f.outletIds, status: f.status });
        toast.success("Saved.");
        onSaved();
      } else {
        const res = await api.post("/api/staff", { firstName: f.firstName, lastName: f.lastName, email: f.email, phone: f.phone || null, role: f.role, outletIds: f.outletIds, password: f.password || null });
        toast.success(`${res.staff.fullName} added.`);
        onSaved(res.generatedPassword ? { title: "Login created", email: res.staff.email, password: res.generatedPassword } : null);
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    try {
      const res = await api.post(`/api/staff/${member.id}/reset-password`);
      onSaved({ title: "Password reset", email: res.staff.email, password: res.generatedPassword });
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <Modal open title={member ? `Manage ${member.fullName}` : "Add a team member"} onClose={onClose}
      footer={<>
        {member && <Button variant="secondary" onClick={reset} className="mr-auto">Reset password</Button>}
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button loading={busy} disabled={!f.firstName.trim() || !f.lastName.trim() || (!member && !/\S+@\S+\.\S+/.test(f.email)) || (needsOutlet && f.outletIds.length === 0)} onClick={save}>Save</Button>
      </>}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name"><Input value={f.firstName} onChange={set("firstName")} /></Field>
        <Field label="Last name"><Input value={f.lastName} onChange={set("lastName")} /></Field>
      </div>
      {!member && <Field label="Email (their login)"><Input type="email" value={f.email} onChange={set("email")} /></Field>}
      <Field label="Phone (optional)"><Input value={f.phone} onChange={set("phone")} /></Field>
      <Field label="Role" hint={ROLE_HELP[f.role]}>
        <Select value={f.role} onChange={set("role")}>{roles.map((r) => <option key={r} value={r}>{label(r)}</option>)}</Select>
      </Field>
      <div>
        <span className="block text-sm text-gray-700 mb-1.5">Can work in {f.role === "OVERALL_MANAGER" ? "(leave empty for all outlets)" : ""}</span>
        <div className="grid sm:grid-cols-2 gap-2">
          {outlets.map((o) => (
            <label key={o.id} className="flex items-center gap-2 rounded-[10px] border border-gray-200 px-3 py-2 text-sm cursor-pointer hover:border-[#FF6F00]">
              <input type="checkbox" className="accent-[#FF6F00]" checked={f.outletIds.includes(o.id)} onChange={() => toggleOutlet(o.id)} />
              {o.name}
            </label>
          ))}
        </div>
      </div>
      {!member && <Field label="Password (optional)" hint="Leave empty to generate one you can pass on."><Input type="text" autoComplete="off" value={f.password} onChange={set("password")} /></Field>}
      {member && (
        <Field label="Account"><Select value={f.status} onChange={set("status")}><option value="ACTIVE">Active</option><option value="INACTIVE">Switched off (cannot sign in)</option></Select></Field>
      )}
    </Modal>
  );
};

export default Team;
