import React, { useState } from "react";
import { api } from "../lib/http";
import { toast } from "../utils/toast";
import { useAuth } from "../context/AuthContext";
import { PageHeader, Card, Toggle, Field, Input, Button } from "../components/ui/kit";

const Settings = () => {
  const { user, reload } = useAuth();
  const [name, setName] = useState(user.businessName);
  const [approval, setApproval] = useState(user.approvalRequired);
  const [negative, setNegative] = useState(user.allowNegativeStock);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await api.put("/api/settings", { name, approvalRequired: approval, allowNegativeStock: negative });
      await reload();
      toast.success("Settings saved.");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Business settings" subtitle="Rules that apply to every outlet." />
      <Card className="space-y-6">
        <Field label="Business name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Toggle checked={approval} onChange={setApproval} label="Managers must approve orders"
          hint="When off, an order a waiter sends is approved straight away and goes to “to serve”." />
        <Toggle checked={negative} onChange={setNegative} label="Allow stock to go below zero"
          hint="Keep this off so delivery is refused when there is not enough stock." />
        <Button loading={busy} onClick={save}>Save settings</Button>
      </Card>
    </div>
  );
};

export default Settings;
