import React, { useState } from "react";
import { api } from "../lib/http";
import { toast } from "../utils/toast";
import { label } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import { PageHeader, Card, Field, Input, Button, Badge } from "../components/ui/kit";

const Profile = () => {
  const { user } = useAuth();
  const [f, setF] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const valid = f.currentPassword && f.newPassword.length >= 8 && f.newPassword === f.confirm;

  const change = async () => {
    setBusy(true);
    try {
      await api.post("/api/auth/change-password", { currentPassword: f.currentPassword, newPassword: f.newPassword });
      toast.success("Password changed.");
      setF({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="My profile" />
      <Card>
        <dl className="grid sm:grid-cols-2 gap-4 text-sm">
          <div><dt className="text-[#A2A1A8]">Name</dt><dd className="font-medium">{user.fullName}</dd></div>
          <div><dt className="text-[#A2A1A8]">Email</dt><dd className="font-medium">{user.email}</dd></div>
          <div><dt className="text-[#A2A1A8]">Role</dt><dd className="font-medium">{label(user.role)}</dd></div>
          <div><dt className="text-[#A2A1A8]">Works in</dt><dd className="flex flex-wrap gap-1.5 mt-1">{(user.outlets || []).map((o) => <Badge key={o.id}>{o.name}</Badge>)}</dd></div>
        </dl>
      </Card>
      <Card className="space-y-4">
        <h2 className="font-semibold text-gray-900">Change password</h2>
        <Field label="Current password"><Input type="password" autoComplete="current-password" value={f.currentPassword} onChange={set("currentPassword")} /></Field>
        <Field label="New password" hint="At least 8 characters"><Input type="password" autoComplete="new-password" value={f.newPassword} onChange={set("newPassword")} /></Field>
        <Field label="Repeat new password" error={f.confirm && f.confirm !== f.newPassword ? "The passwords do not match" : undefined}>
          <Input type="password" autoComplete="new-password" value={f.confirm} onChange={set("confirm")} />
        </Field>
        <Button loading={busy} disabled={!valid} onClick={change}>Change password</Button>
      </Card>
    </div>
  );
};

export default Profile;
