import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Search, Trash2 } from "lucide-react";
import { api } from "../lib/http";
import { toast } from "../utils/toast";
import { money, METHODS } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import { PageHeader, Card, Button, Field, Input, Select, Spinner, ErrorNote, Empty, Badge, Combobox, useLoad } from "../components/ui/kit";

const TakeOrder = () => {
  const { user, can } = useAuth();
  const navigate = useNavigate();
  const outlets = user.outlets || [];
  const [outletId, setOutletId] = useState(outlets[0]?.id ?? "");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [method, setMethod] = useState("CASH");
  const [table, setTable] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [busy, setBusy] = useState(false);

  const { data, error, loading, reload } = useLoad(async () => {
    const [menu, customers] = await Promise.all([
      api.get("/api/menu"),
      can("customer:view") ? api.get("/api/customers") : Promise.resolve([]),
    ]);
    return { menu: menu.filter((p) => p.active), customers: customers.filter((c) => c.active) };
  });

  const categories = useMemo(() => ["All", ...new Set((data?.menu || []).map((p) => p.category).filter(Boolean))], [data]);
  const items = (data?.menu || []).filter(
    (p) => (category === "All" || p.category === category) && p.name.toLowerCase().includes(query.toLowerCase())
  );
  const selectedOutlet = outlets.find((o) => o.id === Number(outletId));
  const total = cart.reduce((sum, l) => sum + l.price * l.quantity, 0);

  const add = (product, variant, unit) => {
    const key = `${variant.id}:${unit}`;
    const price = unit === "PACK" ? variant.packPrice ?? variant.sellPrice * variant.unitsPerPack : variant.sellPrice;
    const name = `${product.name}${product.hasSizes ? ` – ${variant.label}` : ""}${unit === "PACK" ? ` (${variant.packUnitName})` : ""}`;
    setCart((c) => {
      const found = c.find((l) => l.key === key);
      if (found) return c.map((l) => (l.key === key ? { ...l, quantity: l.quantity + 1 } : l));
      return [...c, { key, variantId: variant.id, unit, name, price, quantity: 1 }];
    });
  };
  const change = (key, delta) =>
    setCart((c) => c.map((l) => (l.key === key ? { ...l, quantity: l.quantity + delta } : l)).filter((l) => l.quantity > 0));

  // A typed name or phone that matches a known customer picks that customer; otherwise it is a new one.
  const known = (data?.customers || []).find((c) =>
    customerPhone.trim() ? c.phone === customerPhone.trim() : customerName.trim() && c.name.toLowerCase() === customerName.trim().toLowerCase()
  );
  const hasCustomer = !!(customerName.trim() || customerPhone.trim());

  const pickName = (value) => {
    setCustomerName(value);
    const match = (data?.customers || []).find((c) => c.name.toLowerCase() === value.trim().toLowerCase());
    if (match && !customerPhone.trim()) setCustomerPhone(match.phone || "");
  };

  const send = async () => {
    if (method === "CREDIT" && !hasCustomer) {
      toast.error("Enter the customer's name or phone for a credit order.");
      return;
    }
    setBusy(true);
    try {
      let customerId = null;
      if (hasCustomer) {
        customerId = known ? known.id : (await api.post("/api/customers/quick", { name: customerName, phone: customerPhone })).id;
      }
      const order = await api.post("/api/orders", {
        outletId: Number(outletId),
        customerId,
        paymentMethod: method,
        tableLabel: table || null,
        lines: cart.map((l) => ({ variantId: l.variantId, unit: l.unit, quantity: l.quantity })),
      });
      toast.success(
        order.status === "APPROVED" ? `${order.code} sent and ready to serve.` : `${order.code} sent. Waiting for a manager to approve.`
      );
      setCart([]);
      setTable("");
      navigate("/orders");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorNote error={error} onRetry={reload} />;
  if (outlets.length === 0) return <Empty title="You are not assigned to an outlet yet" hint="Ask the owner or a manager to assign you." />;

  return (
    <div>
      <PageHeader title="Take order" subtitle="Tap items to build the order, then send it." />
      <div className="grid xl:grid-cols-[1fr_380px] gap-6 items-start">
        <div>
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input className="!pl-9" placeholder="Search the menu" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  category === c ? "border-[#FF6F00] bg-orange-50 text-[#FF6F00]" : "border-gray-300 text-gray-600 hover:border-[#FF6F00]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          {items.length === 0 ? (
            <Empty title="Nothing on the menu matches" hint="The owner adds menu items under Menu." />
          ) : (
            <div className="grid sm:grid-cols-2 2xl:grid-cols-3 gap-3">
              {items.map((p) => (
                <Card key={p.id} className="!p-4">
                  <p className="font-medium text-gray-900">{p.name}</p>
                  {p.category && <p className="text-xs text-[#A2A1A8] mb-3">{p.category}</p>}
                  <div className="space-y-2 mt-2">
                    {p.variants.filter((v) => v.active).map((v) => (
                      <div key={v.id} className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => add(p, v, "BASE")}
                          className="flex-1 min-w-[120px] flex items-center justify-between rounded-[10px] border border-gray-200 px-3 py-2 text-sm hover:border-[#FF6F00] hover:bg-orange-50 transition-colors"
                        >
                          <span>{p.hasSizes ? v.label : "Add"}</span>
                          <span className="font-semibold text-[#FF6F00]">{money(v.sellPrice)}</span>
                        </button>
                        {v.packUnitName && v.unitsPerPack && (
                          <button
                            onClick={() => add(p, v, "PACK")}
                            className="rounded-[10px] border border-gray-200 px-2.5 py-2 text-xs text-gray-600 hover:border-[#FF6F00] hover:text-[#FF6F00]"
                            title={`${v.unitsPerPack} ${v.baseUnitName}s`}
                          >
                            + {v.packUnitName}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Card className="xl:sticky xl:top-0 space-y-4">
          <h2 className="font-semibold text-gray-900">Current order</h2>
          {outlets.length > 1 && (
            <Field label="Outlet">
              <Select value={outletId} onChange={(e) => setOutletId(e.target.value)}>
                {outlets.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </Select>
            </Field>
          )}
          {selectedOutlet?.status === "PAUSED" && <Badge tone="amber">This outlet is paused and is not taking orders</Badge>}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Table / note"><Input value={table} onChange={(e) => setTable(e.target.value)} placeholder="Table 4" /></Field>
            <Field label="Payment method">
              <Select value={method} onChange={(e) => setMethod(e.target.value)}>
                {METHODS.map((m) => <option key={m.value} value={m.value}>{m.text}</option>)}
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Customer name (optional)">
              <Combobox value={customerName} onChange={pickName} placeholder="Type a name"
                options={(data?.customers || []).map((c) => ({ value: c.name, hint: c.phone || undefined }))} />
            </Field>
            <Field label="Phone (optional)">
              <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="07..." inputMode="tel" />
            </Field>
          </div>
          {hasCustomer && (
            <p className="text-xs text-[#A2A1A8] -mt-2">
              {known ? `Existing customer: ${known.name}` : "New customer: they are added when you send the order."}
            </p>
          )}

          <div className="border-t border-gray-100 pt-3 space-y-2">
            {cart.length === 0 && <p className="text-sm text-[#A2A1A8] py-4 text-center">Tap an item to add it.</p>}
            {cart.map((l) => (
              <div key={l.key} className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{l.name}</p>
                  <p className="text-xs text-[#A2A1A8]">{money(l.price)} each</p>
                </div>
                <button onClick={() => change(l.key, -1)} className="p-1.5 rounded-full border border-gray-300 hover:border-[#FF6F00]" aria-label="Less"><Minus className="h-3.5 w-3.5" /></button>
                <span className="w-6 text-center text-sm font-medium">{l.quantity}</span>
                <button onClick={() => change(l.key, 1)} className="p-1.5 rounded-full border border-gray-300 hover:border-[#FF6F00]" aria-label="More"><Plus className="h-3.5 w-3.5" /></button>
                <button onClick={() => change(l.key, -l.quantity)} className="p-1.5 text-gray-400 hover:text-red-600" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="text-gray-600">Total</span>
            <span className="text-xl font-bold text-gray-900">{money(total)}</span>
          </div>
          <Button className="w-full" loading={busy} disabled={cart.length === 0 || !outletId || selectedOutlet?.status === "PAUSED"} onClick={send}>
            Send order
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default TakeOrder;
