import React, { useState } from "react";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { api } from "../lib/http";
import { toast } from "../utils/toast";
import { dateTime, daysAgo, today } from "../lib/format";
import { PageHeader, Card, Button, Table, Spinner, ErrorNote, Empty, Input, useLoad } from "../components/ui/kit";

const Audit = () => {
  const [from, setFrom] = useState(daysAgo(29));
  const [to, setTo] = useState(today());
  const [action, setAction] = useState("");
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const { data, error, loading, reload } = useLoad(() => api.get("/api/audit", { from, to, action }), [from, to, action]);

  const verify = async () => {
    setChecking(true);
    try {
      setResult(await api.get("/api/audit/verify"));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div>
      <PageHeader title="Audit trail"
        subtitle="Every important action, with who did it and when. Nobody can edit or delete these records, and each one is chained to the one before."
        actions={<Button onClick={verify} loading={checking}><ShieldCheck className="h-4 w-4" /> Verify integrity</Button>} />

      {result && (
        <div className={`mb-5 flex items-start gap-3 rounded-[10px] border px-4 py-3 ${result.valid ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}>
          {result.valid ? <ShieldCheck className="h-5 w-5 mt-0.5" /> : <ShieldAlert className="h-5 w-5 mt-0.5" />}
          <div>
            <p className="font-medium">{result.valid ? "No record has been altered" : "A record was altered or removed"}</p>
            <p className="text-sm">{result.message}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-4">
        <Input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="!w-auto" />
        <Input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className="!w-auto" />
        <Input placeholder="Filter by action, e.g. order.delivered" value={action} onChange={(e) => setAction(e.target.value)} className="!w-auto min-w-[260px]" />
      </div>

      {error && <ErrorNote error={error} onRetry={reload} />}
      {loading && !data ? <Spinner /> : data && data.length === 0 ? <Empty title="No records in this period" /> : data ? (
        <Table headers={["#", "When", "Who", "Action", "Record", "Before → after", "Reason"]}>
          {data.map((a) => (
            <tr key={a.id} className="align-top">
              <td className="px-4 py-3 text-gray-500">{a.seq}</td>
              <td className="px-4 py-3 whitespace-nowrap text-gray-500">{dateTime(a.at)}</td>
              <td className="px-4 py-3">{a.actorEmail || "system"}<div className="text-xs text-[#A2A1A8]">{a.actorRole}</div></td>
              <td className="px-4 py-3 font-medium whitespace-nowrap">{a.action}</td>
              <td className="px-4 py-3 text-gray-600">{a.reference || `${a.entityType} ${a.entityId ?? ""}`}</td>
              <td className="px-4 py-3 text-xs text-gray-500 max-w-[320px] break-words">
                {a.previousValue && <div>{a.previousValue}</div>}
                {a.newValue && <div className="text-gray-700">→ {a.newValue}</div>}
              </td>
              <td className="px-4 py-3 text-gray-600">{a.reason}</td>
            </tr>
          ))}
        </Table>
      ) : null}
    </div>
  );
};

export default Audit;
