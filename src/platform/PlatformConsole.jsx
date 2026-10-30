import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, CheckCircle2, PauseCircle, Store, Users, Banknote } from "lucide-react";
import { api } from "../lib/http";
import { money, number, dateOnly } from "../lib/format";
import { PageHeader, Card, Stat, Table, Badge, Spinner, ErrorNote, Button, useLoad, SectionTitle } from "../components/ui/kit";

const PlatformConsole = () => {
  const navigate = useNavigate();
  const { data, error, loading, reload } = useLoad(async () => {
    const [overview, restaurants] = await Promise.all([api.get("/api/admin/overview"), api.get("/api/admin/restaurants")]);
    return { overview, restaurants };
  });

  if (loading) return <Spinner />;
  if (error) return <ErrorNote error={error} onRetry={reload} />;
  const { overview: o, restaurants } = data;

  return (
    <div>
      <PageHeader
        title="Platform console"
        subtitle="Every restaurant account on SALES, in one place."
        actions={
          <Link to="/platform/onboard">
            <Button>Add restaurant</Button>
          </Link>
        }
      />
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <Stat label="Restaurants" value={number(o.restaurants)} />
        <Stat label="Active" value={number(o.active)} tone="green" />
        <Stat label="Suspended" value={number(o.suspended)} tone={o.suspended ? "red" : undefined} />
        <Stat label="Outlets" value={number(o.outlets)} />
        <Stat label="Staff" value={number(o.staff)} />
        <Stat label="Revenue (all)" value={money(o.revenue)} />
      </div>

      <Card>
        <SectionTitle right={<Link to="/platform/restaurants" className="text-sm text-[#FF6F00] hover:underline">See all</Link>}>
          Latest restaurants
        </SectionTitle>
        {restaurants.length === 0 ? (
          <p className="text-sm text-[#A2A1A8] py-6 text-center">No restaurant yet. Add the first one to get started.</p>
        ) : (
          <Table headers={["Restaurant", "Owner", "Outlets", "Staff", "Status", "Since"]} className="border-0">
            {restaurants.slice(0, 6).map((r) => (
              <tr key={r.id} className="hover:bg-orange-50/40 cursor-pointer" onClick={() => navigate(`/platform/restaurants/${r.id}`)}>
                <td className="px-4 py-3">
                  <Link to={`/platform/restaurants/${r.id}`} className="font-medium text-gray-900 hover:text-[#FF6F00]">{r.name}</Link>
                </td>
                <td className="px-4 py-3 text-gray-600">{r.ownerName || "—"}</td>
                <td className="px-4 py-3">{r.outlets}</td>
                <td className="px-4 py-3">{r.staff}</td>
                <td className="px-4 py-3"><Badge tone={r.active ? "green" : "red"}>{r.active ? "Active" : "Suspended"}</Badge></td>
                <td className="px-4 py-3 text-gray-500">{dateOnly(r.createdAt)}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
};

export default PlatformConsole;
