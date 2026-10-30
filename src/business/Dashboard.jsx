import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { api } from "../lib/http";
import { money, number, label, daysAgo, today, ORDER_STATUS } from "../lib/format";
import { PageHeader, Card, Stat, Table, Spinner, ErrorNote, Input, SectionTitle, Empty, useLoad } from "../components/ui/kit";
import OutletFilter from "./OutletFilter";

const COLORS = ["#FF6F00", "#2563EB", "#16A34A", "#9333EA", "#DC2626", "#0891B2"];
const RANGES = [
  { text: "7 days", days: 6 },
  { text: "30 days", days: 29 },
  { text: "90 days", days: 89 },
];

const Dashboard = () => {
  const [from, setFrom] = useState(daysAgo(29));
  const [to, setTo] = useState(today());
  const [outletId, setOutletId] = useState(null);
  const { data: d, error, loading, reload } = useLoad(() => api.get("/api/dashboard", { from, to, outletId }), [from, to, outletId]);

  const k = d?.kpis;
  const statusData = d ? Object.entries(d.ordersByStatus).map(([s, v]) => ({ name: ORDER_STATUS[s]?.text || label(s), value: v })) : [];
  const methodData = d ? d.ordersByPaymentMethod.map((m) => ({ name: label(m.method), value: m.orders })) : [];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="How the business is doing for the period you choose."
        actions={
          <>
            <OutletFilter value={outletId} onChange={setOutletId} />
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => {
                  setFrom(daysAgo(r.days));
                  setTo(today());
                }}
                className="rounded-[10px] border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:border-[#FF6F00] hover:text-[#FF6F00]"
              >
                {r.text}
              </button>
            ))}
            <Input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="!w-auto" />
            <Input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className="!w-auto" />
          </>
        }
      />

      {error && <ErrorNote error={error} onRetry={reload} />}
      {loading && !d ? (
        <Spinner />
      ) : d ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label="Revenue" value={money(k.revenue)} sub={`${number(k.orders)} orders delivered`} />
            <Stat label="Cost of goods sold" value={money(k.costOfGoodsSold)} />
            <Stat label="Collected (payments received)" value={money(k.collections)} tone="green" />
            <Stat label="Expenses" value={money(k.expenses)} />
            <Stat label="Average order" value={money(k.averageOrder)} />
            <Stat label="Stock value" value={money(k.stockValue)} sub={k.lowStockItems ? `${k.lowStockItems} item(s) running low` : "Nothing running low"} />
            <Stat label="Customers owe" value={money(k.debtOutstanding)} />
            <Stat label="Overdue debt" value={money(k.debtOverdue)} tone={k.debtOverdue > 0 ? "red" : undefined} />
            <Stat label="Breakage & waste" value={money(k.breakageAndWasteValue)} />
            <Stat label="Discounts given" value={money(k.discountsGiven)} />
            <Stat label="Debts written off" value={money(k.writeOffs)} />
            <Stat label="Voided orders" value={number(k.voidedOrders)} sub={money(k.voidedValue)} />
          </div>

          <Card>
            <SectionTitle>Revenue per day</SectionTitle>
            <div className="h-64">
              <ResponsiveContainer>
                <AreaChart data={d.daily} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="date" tickFormatter={(v) => v.slice(5)} fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
                  <Tooltip formatter={(v) => money(v)} />
                  <Area type="monotone" dataKey="revenue" stroke="#FF6F00" fill="#FF6F00" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <SectionTitle>Orders by status</SectionTitle>
              <div className="h-60">
                <ResponsiveContainer>
                  <BarChart data={statusData} layout="vertical" margin={{ left: 40 }}>
                    <XAxis type="number" allowDecimals={false} fontSize={12} />
                    <YAxis type="category" dataKey="name" fontSize={12} width={130} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#FF6F00" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <SectionTitle>Orders by payment method</SectionTitle>
              {methodData.length === 0 ? (
                <Empty title="No delivered orders in this period" />
              ) : (
                <div className="h-60">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={methodData} dataKey="value" nameKey="name" outerRadius={80} label>
                        {methodData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </div>

          {d.outlets.length > 1 && (
            <Card>
              <SectionTitle>Outlet comparison</SectionTitle>
              <Table headers={["Outlet", { text: "Orders", right: true }, { text: "Revenue", right: true }, { text: "Cost of goods", right: true }, { text: "Debt owed", right: true }]} className="border-0">
                {d.outlets.map((o) => (
                  <tr key={o.outletId}>
                    <td className="px-4 py-3 font-medium">{o.outlet}</td>
                    <td className="px-4 py-3 text-right">{number(o.orders)}</td>
                    <td className="px-4 py-3 text-right">{money(o.revenue)}</td>
                    <td className="px-4 py-3 text-right">{money(o.costOfGoods)}</td>
                    <td className="px-4 py-3 text-right">{money(o.debt)}</td>
                  </tr>
                ))}
              </Table>
            </Card>
          )}

          {d.expensesByCategory.length > 0 && (
            <Card>
              <SectionTitle right={<Link to="/expenses" className="text-sm text-[#FF6F00] hover:underline">All expenses</Link>}>Expenses by category</SectionTitle>
              <Table headers={["Category", { text: "Spent", right: true }]} className="border-0">
                {d.expensesByCategory.map((x) => (
                  <tr key={x.category}><td className="px-4 py-2.5">{x.category}</td><td className="px-4 py-2.5 text-right">{money(x.amount)}</td></tr>
                ))}
              </Table>
            </Card>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <SectionTitle>Best sellers</SectionTitle>
              {d.bestSellers.length === 0 ? (
                <Empty title="Nothing sold in this period" />
              ) : (
                <Table headers={["Item", { text: "Sold", right: true }, { text: "Revenue", right: true }]} className="border-0">
                  {d.bestSellers.map((p) => (
                    <tr key={p.name}>
                      <td className="px-4 py-2.5">{p.name}</td>
                      <td className="px-4 py-2.5 text-right">{number(p.quantity)}</td>
                      <td className="px-4 py-2.5 text-right">{money(p.revenue)}</td>
                    </tr>
                  ))}
                </Table>
              )}
            </Card>
            <Card>
              <SectionTitle right={<Link to="/debts" className="text-sm text-[#FF6F00] hover:underline">Open debts</Link>}>
                Debt by age
              </SectionTitle>
              <div className="h-56">
                <ResponsiveContainer>
                  <BarChart data={d.debtAging}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="bucket" fontSize={11} interval={0} tickFormatter={(v) => v.replace(" late", "")} />
                    <YAxis fontSize={12} tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)} />
                    <Tooltip formatter={(v) => money(v)} />
                    <Bar dataKey="amount" fill="#2563EB" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <SectionTitle>Employee activity</SectionTitle>
              {d.employeeActivity.length === 0 ? (
                <Empty title="No orders in this period" />
              ) : (
                <Table headers={["Waiter", { text: "Orders taken", right: true }, { text: "Revenue", right: true }]} className="border-0">
                  {d.employeeActivity.map((e) => (
                    <tr key={e.name}>
                      <td className="px-4 py-2.5">{e.name}</td>
                      <td className="px-4 py-2.5 text-right">{number(e.ordersTaken)}</td>
                      <td className="px-4 py-2.5 text-right">{money(e.revenue)}</td>
                    </tr>
                  ))}
                </Table>
              )}
            </Card>
            <Card>
              <SectionTitle>Manager approvals</SectionTitle>
              {d.approvalHistory.length === 0 ? (
                <Empty title="No approval decisions in this period" />
              ) : (
                <Table headers={["Manager", { text: "Approved", right: true }, { text: "Rejected", right: true }]} className="border-0">
                  {d.approvalHistory.map((e) => (
                    <tr key={e.name}>
                      <td className="px-4 py-2.5">{e.name}</td>
                      <td className="px-4 py-2.5 text-right">{number(e.approved)}</td>
                      <td className="px-4 py-2.5 text-right">{number(e.rejected)}</td>
                    </tr>
                  ))}
                </Table>
              )}
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Dashboard;
