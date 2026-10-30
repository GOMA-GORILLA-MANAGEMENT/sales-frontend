import React, { useState } from "react";
import { Plus, Pencil, PauseCircle, PlayCircle } from "lucide-react";
import { api } from "../lib/http";
import { toast } from "../utils/toast";
import { label } from "../lib/format";
import { PageHeader, Card, Button, Badge, Spinner, ErrorNote, Empty, Modal, Field, Input, Select, useLoad } from "../components/ui/kit";
import { useAuth } from "../context/AuthContext";

const Outlets = () => {
  const { reload: reloadMe } = useAuth();
  const { data, error, loading, reload } = useLoad(() => api.get("/api/outlets"));
  const [editing, setEditing] = useState(null);

  const refresh = () => {
    reload(true);
    reloadMe();
  };

  const toggle = async (o) => {
    try {
      await api.put(`/api/outlets/${o.id}/status`, { status: o.status === "OPEN" ? "PAUSED" : "OPEN" });
      toast.success(o.status === "OPEN" ? `${o.name} is paused.` : `${o.name} is open again.`);
      refresh();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div>
      <PageHeader title="Restaurants & bars" subtitle="Every place you run. Add one whenever you open a new location." actions={<Button onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Add restaurant or bar</Button>} />
      {error && <ErrorNote error={error} onRetry={reload} />}
      {loading ? <Spinner /> : data && data.length === 0 ? <Empty title="No outlets yet" /> : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(data || []).map((o) => (
            <Card key={o.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{o.name}</p>
                  <p className="text-sm text-[#A2A1A8]">{label(o.type)}{o.address ? ` · ${o.address}` : ""}</p>
                  {o.phone && <p className="text-sm text-[#A2A1A8]">{o.phone}</p>}
                </div>
                <Badge tone={o.status === "OPEN" ? "green" : "amber"}>{o.status === "OPEN" ? "Open" : "Paused"}</Badge>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="secondary" size="sm" onClick={() => setEditing(o)}><Pencil className="h-4 w-4" /> Edit</Button>
                <Button variant="secondary" size="sm" onClick={() => toggle(o)}>
                  {o.status === "OPEN" ? <><PauseCircle className="h-4 w-4" /> Pause</> : <><PlayCircle className="h-4 w-4" /> Reopen</>}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {editing && <OutletDialog outlet={editing.id ? editing : null} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refresh(); }} />}
    </div>
  );
};

const OutletDialog = ({ outlet, onClose, onSaved }) => {
  const [f, setF] = useState({ name: outlet?.name || "", type: outlet?.type || "RESTAURANT", address: outlet?.address || "", phone: outlet?.phone || "" });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const save = async () => {
    setBusy(true);
    try {
      if (outlet) await api.put(`/api/outlets/${outlet.id}`, f);
      else await api.post("/api/outlets", f);
      toast.success(outlet ? "Saved." : "Added.");
      onSaved();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open title={outlet ? `Edit ${outlet.name}` : "Add a restaurant or bar"} onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={busy} disabled={!f.name.trim()} onClick={save}>Save</Button></>}>
      <Field label="Name"><Input value={f.name} onChange={set("name")} autoFocus /></Field>
      <Field label="Type"><Select value={f.type} onChange={set("type")}><option value="RESTAURANT">Restaurant</option><option value="BAR">Bar</option></Select></Field>
      <Field label="Address (optional)"><Input value={f.address} onChange={set("address")} /></Field>
      <Field label="Phone (optional)"><Input value={f.phone} onChange={set("phone")} /></Field>
    </Modal>
  );
};

export default Outlets;
