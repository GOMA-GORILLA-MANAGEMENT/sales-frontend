import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/http";
import { toast } from "../utils/toast";
import { money, dateOnly } from "../lib/format";
import { PageHeader, Table, Badge, Spinner, ErrorNote, Button, Empty, Input, Modal, Textarea, Field, useLoad } from "../components/ui/kit";

const Restaurants = () => {
  const navigate = useNavigate();
  const { data, error, loading, reload } = useLoad(() => api.get("/api/admin/restaurants"));
  const [query, setQuery] = useState("");
  const [suspending, setSuspending] = useState(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const rows = (data || []).filter((r) => r.name.toLowerCase().includes(query.toLowerCase()));

  const suspend = async () => {
    setBusy(true);
    try {
      await api.post(`/api/admin/restaurants/${suspending.id}/suspend`, { reason });
      toast.success(`${suspending.name} is suspended. Nobody there can sign in.`);
      setSuspending(null);
      setReason("");
      reload(true);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const reactivate = async (r) => {
    try {
      await api.post(`/api/admin/restaurants/${r.id}/reactivate`);
      toast.success(`${r.name} is active again.`);
      reload(true);
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Restaurants"
        subtitle="Click a restaurant to see its details and edit them."
        actions={<Link to="/platform/onboard"><Button>Add restaurant</Button></Link>}
      />
      <div className="mb-4 max-w-sm">
        <Input placeholder="Search by name" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorNote error={error} onRetry={reload} />
      ) : rows.length === 0 ? (
        <Empty title="No restaurant found" hint="Add a restaurant to see it here." />
      ) : (
        <Table headers={["Restaurant", "Owner", "Outlets", "Staff", { text: "Revenue", right: true }, "Status", "Since", ""]}>
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-orange-50/40 cursor-pointer" onClick={() => navigate(`/platform/restaurants/${r.id}`)}>
              <td className="px-4 py-3">
                <span className="font-medium text-gray-900">{r.name}</span>
                <div className="text-xs text-[#A2A1A8]">{r.code}</div>
              </td>
              <td className="px-4 py-3 text-gray-600">{r.ownerName}<div className="text-xs text-[#A2A1A8]">{r.ownerEmail}</div></td>
              <td className="px-4 py-3">{r.outlets}</td>
              <td className="px-4 py-3">{r.staff}</td>
              <td className="px-4 py-3 text-right">{money(r.revenue)}</td>
              <td className="px-4 py-3"><Badge tone={r.active ? "green" : "red"}>{r.active ? "Active" : "Suspended"}</Badge></td>
              <td className="px-4 py-3 text-gray-500">{dateOnly(r.createdAt)}</td>
              <td className="px-4 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                {r.active ? (
                  <Button variant="danger" size="sm" onClick={() => setSuspending(r)}>Suspend</Button>
                ) : (
                  <Button variant="secondary" size="sm" onClick={() => reactivate(r)}>Reactivate</Button>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}

      <Modal
        open={!!suspending}
        title={`Suspend ${suspending?.name}?`}
        onClose={() => setSuspending(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setSuspending(null)}>Cancel</Button>
            <Button variant="danger" loading={busy} onClick={suspend}>Suspend restaurant</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Nobody at this restaurant will be able to sign in, and anyone signed in now is cut off straight away. Their data is kept
          and you can reactivate the account at any time.
        </p>
        <Field label="Reason (kept in the record)">
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="For example: subscription unpaid" />
        </Field>
      </Modal>
    </div>
  );
};

export default Restaurants;
