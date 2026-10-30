import React, { useState, useEffect } from "react";
import { api } from "../lib/http";
import { toast } from "../utils/toast";
import { money, number, dateTime, label, daysAgo, today } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import {
  PageHeader, Card, Button, Badge, Tabs, Table, Spinner, ErrorNote, Empty, Modal, Field, Input, Select, Textarea, Toggle, useLoad,
} from "../components/ui/kit";
import OutletFilter from "./OutletFilter";
import VariantPicker, { findVariant } from "./VariantPicker";

const Stock = () => {
  const { can } = useAuth();
  const [tab, setTab] = useState("levels");
  const [outletId, setOutletId] = useState(null);
  const [lowOnly, setLowOnly] = useState(false);
  const [from, setFrom] = useState(daysAgo(29));
  const [to, setTo] = useState(today());
  const [dialog, setDialog] = useState(null);

  const levels = useLoad(() => api.get("/api/stock", { outletId, lowOnly }), [outletId, lowOnly]);
  const moves = useLoad(() => (tab === "movements" ? api.get("/api/stock/movements", { outletId, from, to }) : Promise.resolve(null)), [tab, outletId, from, to]);
  const menu = useLoad(() => api.get("/api/menu"));

  const done = () => {
    setDialog(null);
    menu.reload(true);
    levels.reload(true);
    if (tab === "movements") moves.reload(true);
  };

  return (
    <div>
      <PageHeader
        title="Stock"
        subtitle="Counted in bottles (the smallest unit), entered in crates or however it arrives."
        actions={
          <>
            <OutletFilter value={outletId} onChange={setOutletId} />
            {can("stock:receive") && <Button onClick={() => setDialog("receive")}>Receive stock</Button>}
            {can("stock:transfer") && <Button variant="secondary" onClick={() => setDialog("transfer")}>Move between outlets</Button>}
            {can("stock:adjust") && <Button variant="secondary" onClick={() => setDialog("adjust")}>Breakage, waste or count</Button>}
          </>
        }
      />
      <Tabs tabs={[{ value: "levels", text: "Stock levels" }, { value: "movements", text: "Movements" }]} value={tab} onChange={setTab} />

      {tab === "levels" && (
        <>
          <div className="mb-4"><Toggle checked={lowOnly} onChange={setLowOnly} label="Show only items running low" /></div>
          {levels.error && <ErrorNote error={levels.error} onRetry={levels.reload} />}
          {levels.loading && !levels.data ? (
            <Spinner />
          ) : levels.data && levels.data.length === 0 ? (
            <Empty title={lowOnly ? "Nothing is running low" : "No stock recorded yet"} hint={can("stock:receive") ? "Use Receive stock when a delivery arrives." : undefined} />
          ) : levels.data ? (
            <Table headers={["Outlet", "Item", "In stock", { text: "Smallest units", right: true }, { text: "Unit cost", right: true }, { text: "Value", right: true }, ""]}>
              {levels.data.map((s) => (
                <tr key={`${s.outletId}-${s.variantId}`}>
                  <td className="px-4 py-3 text-gray-600">{s.outletName}</td>
                  <td className="px-4 py-3 font-medium">{s.productName}{s.label ? ` – ${s.label}` : ""}</td>
                  <td className="px-4 py-3">{s.display}</td>
                  <td className="px-4 py-3 text-right">{number(s.quantity)}</td>
                  <td className="px-4 py-3 text-right">{money(s.avgUnitCost)}</td>
                  <td className="px-4 py-3 text-right">{money(s.value)}</td>
                  <td className="px-4 py-3">{s.low && <Badge tone="red">Low stock</Badge>}</td>
                </tr>
              ))}
            </Table>
          ) : null}
        </>
      )}

      {tab === "movements" && (
        <>
          <div className="flex flex-wrap gap-3 mb-4">
            <Input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="!w-auto" />
            <Input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className="!w-auto" />
          </div>
          {moves.error && <ErrorNote error={moves.error} onRetry={moves.reload} />}
          {moves.loading && !moves.data ? (
            <Spinner />
          ) : moves.data && moves.data.length === 0 ? (
            <Empty title="No stock movements in this period" />
          ) : moves.data ? (
            <Table headers={["When", "Outlet", "Item", "Type", "You entered", { text: "Change", right: true }, { text: "Balance", right: true }, "Reason / ref", "By"]}>
              {moves.data.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">{dateTime(m.at)}</td>
                  <td className="px-4 py-3">{m.outletName}</td>
                  <td className="px-4 py-3">{m.itemName}</td>
                  <td className="px-4 py-3"><Badge tone={m.baseQuantity > 0 ? "green" : "amber"}>{label(m.type)}</Badge></td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {m.enteredQuantity} {m.enteredUnit === "PACK" ? `pack (${m.unitsPerPackUsed} each)` : "unit"}
                  </td>
                  <td className="px-4 py-3 text-right">{m.baseQuantity > 0 ? "+" : ""}{number(m.baseQuantity)}</td>
                  <td className="px-4 py-3 text-right">{number(m.balanceAfter)}</td>
                  <td className="px-4 py-3 text-gray-600">{m.reason || m.reference || ""}</td>
                  <td className="px-4 py-3 text-gray-500">{m.byName}</td>
                </tr>
              ))}
            </Table>
          ) : null}
        </>
      )}

      {dialog === "receive" && <ReceiveDialog menu={menu.data} onClose={() => setDialog(null)} onDone={done} defaultOutlet={outletId} />}
      {dialog === "transfer" && <TransferDialog menu={menu.data} onClose={() => setDialog(null)} onDone={done} defaultOutlet={outletId} />}
      {dialog === "adjust" && <AdjustDialog menu={menu.data} onClose={() => setDialog(null)} onDone={done} defaultOutlet={outletId} />}
    </div>
  );
};

const useOutletList = () => {
  const { user, can } = useAuth();
  const { data } = useLoad(() => (can("outlet:manage") ? api.get("/api/outlets") : Promise.resolve(null)));
  return data || user.outlets || [];
};

/** When there is only one outlet to choose from, choose it. */
const useSingleOutlet = (outlets, value, setValue) => {
  useEffect(() => {
    if (!value && outlets.length === 1) setValue(outlets[0].id);
  }, [outlets, value, setValue]);
};

const UnitFields = ({ variant, unit, setUnit, qty, setQty, qtyLabel = "How many?", override, setOverride }) => (
  <>
    <div className="grid grid-cols-2 gap-3">
      <Field label={qtyLabel}>
        <Input type="number" min="0" value={qty} onChange={(e) => setQty(e.target.value)} />
      </Field>
      <Field label="Counted in">
        <Select value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option value="BASE">{variant ? `${variant.baseUnitName}s` : "units"}</option>
          {variant?.packUnitName && <option value="PACK">{variant.packUnitName}s</option>}
        </Select>
      </Field>
    </div>
    {unit === "PACK" && setOverride && (
      <Field
        label={`${variant?.baseUnitName || "Unit"}s in this ${variant?.packUnitName || "pack"}`}
        hint={`Normally ${variant?.unitsPerPack}. If this delivery came in a different size (for example 20), change the number here.`}
      >
        <Input type="number" min="2" value={override} onChange={(e) => setOverride(e.target.value)} placeholder={String(variant?.unitsPerPack || "")} />
      </Field>
    )}
  </>
);

const DRINK = /drink|beer|soda|juice|water|wine|spirit|whisk|liquor|beverage|soft|fanta|coke/i;
const blankRow = (label = "") => ({ label, price: "", crate: true, perCrate: "24", qty: "", cost: "" });

/** Type the item's name. Known items are picked from suggestions; a new name opens the details for a new item. */
const ReceiveDialog = ({ menu, onClose, onDone, defaultOutlet }) => {
  const { can } = useAuth();
  const outlets = useOutletList();
  const [outletId, setOutletId] = useState(defaultOutlet || "");
  useSingleOutlet(outlets, outletId, setOutletId);
  const [text, setText] = useState("");
  const [variantId, setVariantId] = useState(null);
  const [unit, setUnit] = useState("PACK");
  const [qty, setQty] = useState("");
  const [override, setOverride] = useState("");
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  // details for an item that does not exist yet
  const [category, setCategory] = useState("");
  const [hasSizes, setHasSizes] = useState(false);
  const [unitName, setUnitName] = useState("bottle");
  const [rows, setRows] = useState([blankRow("Standard")]);
  const [busy, setBusy] = useState(false);

  const typed = text.trim();
  const product = (menu || []).find((p) => p.name.toLowerCase() === typed.toLowerCase() && p.variants.some((v) => v.active && v.tracked));
  const sizes = product ? product.variants.filter((v) => v.active && v.tracked) : [];
  const isNew = typed.length > 0 && !product && !(menu || []).some((p) => p.name.toLowerCase() === typed.toLowerCase());
  const canCreate = can("menu:manage");

  const pick = (value) => {
    setText(value);
    const p = (menu || []).find((x) => x.name.toLowerCase() === value.trim().toLowerCase());
    const first = p?.variants.find((v) => v.active && v.tracked);
    setVariantId(first ? first.id : null);
    setUnit(first?.packUnitName ? "PACK" : "BASE");
    setOverride(first?.unitsPerPack ? String(first.unitsPerPack) : "");
  };
  const pickSize = (id) => {
    setVariantId(id);
    const v = findVariant(menu, id)?.variant;
    setUnit(v?.packUnitName ? "PACK" : "BASE");
    setOverride(v?.unitsPerPack ? String(v.unitsPerPack) : "");
  };
  const changeCategory = (value) => {
    setCategory(value);
    const drink = DRINK.test(value);
    setRows((rs) => rs.map((r) => ({ ...r, crate: drink ? true : r.crate })));
    if (!drink && value) setUnitName((u) => (u === "bottle" ? "piece" : u));
    if (drink) setUnitName("bottle");
  };
  const changeSizes = (on) => {
    setHasSizes(on);
    setRows(on ? [blankRow("Small"), blankRow("Large")] : [blankRow("Standard")]);
  };
  const setRow = (i, patch) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const v = findVariant(menu, variantId)?.variant;
  const effectiveUnit = unit === "PACK" && !v?.packUnitName ? "BASE" : unit;
  const perPack = Number(override) || v?.unitsPerPack || 1;
  const converted = (Number(qty) || 0) * (effectiveUnit === "PACK" ? perPack : 1);

  const newValid =
    rows.every((r) => r.price !== "" && Number(r.price) >= 0 && (!hasSizes || r.label.trim()) && (!r.crate || Number(r.perCrate) >= 2)) &&
    rows.some((r) => Number(r.qty) > 0);
  const valid = !!outletId && (isNew ? canCreate && newValid : !!variantId && Number(qty) > 0);

  const submit = async () => {
    setBusy(true);
    try {
      if (isNew) {
        const created = await api.post("/api/menu", {
          name: typed, category: category || null, hasSizes, active: true,
          variants: rows.map((r) => ({
            label: hasSizes ? r.label : "Standard", sellPrice: Number(r.price), baseUnitName: unitName || "piece",
            packUnitName: r.crate ? "crate" : null, unitsPerPack: r.crate ? Number(r.perCrate) : null, tracked: true,
            lowStockThreshold: r.crate ? Number(r.perCrate) : 5, active: true,
          })),
        });
        for (let i = 0; i < rows.length; i++) {
          if (!(Number(rows[i].qty) > 0)) continue;
          await api.post("/api/stock/receive", {
            outletId: Number(outletId), variantId: created.variants[i].id, quantity: Number(rows[i].qty),
            unit: rows[i].crate ? "PACK" : "BASE", purchasePrice: rows[i].cost === "" ? null : Number(rows[i].cost), note: note || null,
          });
        }
        toast.success(`${typed} added to the menu and stock received.`);
      } else {
        await api.post("/api/stock/receive", {
          outletId: Number(outletId), variantId, quantity: Number(qty), unit: effectiveUnit,
          unitsPerPackOverride: effectiveUnit === "PACK" && override ? Number(override) : null,
          purchasePrice: price === "" ? null : Number(price), note: note || null,
        });
        toast.success("Stock received.");
      }
      onDone();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open wide title="Receive stock" onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={busy} disabled={!valid} onClick={submit}>{isNew ? "Create item and add stock" : "Add to stock"}</Button></>}>
      <Field label="Outlet">
        <Select value={outletId} onChange={(e) => setOutletId(e.target.value)}>
          <option value="">Choose an outlet</option>
          {outlets.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </Select>
      </Field>
      <Field label="Item name" hint="Start typing. Pick an item you already have, or type a new name to add it.">
        <Combobox value={text} onChange={pick} options={(menu || []).map((p) => p.name)} placeholder="For example Fanta, Primus, Mineral water" autoFocus />
      </Field>

      {product && sizes.length > 1 && (
        <Field label="Size">
          <Select value={variantId ?? ""} onChange={(e) => pickSize(Number(e.target.value))}>
            {sizes.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </Select>
        </Field>
      )}

      {product && v && (
        <>
          <UnitFields variant={v} unit={effectiveUnit} setUnit={setUnit} qty={qty} setQty={setQty} override={override} setOverride={setOverride} />
          {effectiveUnit === "PACK" && Number(qty) > 0 && (
            <p className="text-sm text-gray-600 bg-gray-50 rounded-[10px] px-3 py-2">
              {qty} {v.packUnitName}(s) × {perPack} = <strong>{number(converted)} {v.baseUnitName}s</strong> will be added.
            </p>
          )}
          <Field label={`Price paid per ${effectiveUnit === "PACK" ? v.packUnitName : v.baseUnitName} (optional)`} hint="Used to work out the cost of what you sell.">
            <Input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
          </Field>
        </>
      )}

      {isNew && !canCreate && <p className="text-sm text-red-600">You cannot add new items. Pick one that is already on the menu.</p>}
      {isNew && canCreate && (
        <div className="rounded-[10px] border border-orange-200 bg-orange-50/50 p-4 space-y-4">
          <p className="text-sm text-gray-700"><strong>“{typed}” is new.</strong> Fill in its details and it is added to the menu with this stock.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Category" hint="Drinks default to 24 bottles in a crate.">
              <Combobox value={category} onChange={changeCategory} options={["Soft drinks", "Beer", "Wine", "Spirits", "Water and juice", "Food", "Other"]} placeholder="Soft drinks" />
            </Field>
            <Field label="Smallest unit"><Input value={unitName} onChange={(e) => setUnitName(e.target.value)} placeholder="bottle" /></Field>
          </div>
          <Toggle checked={hasSizes} onChange={changeSizes} label="Does it come in different sizes?" hint="For example small and large. Each size has its own price and stock." />
          {rows.map((r, i) => (
            <div key={i} className="rounded-[10px] bg-white border border-gray-200 p-3 space-y-3">
              {hasSizes && <Field label="Size name"><Input value={r.label} onChange={(e) => setRow(i, { label: e.target.value })} /></Field>}
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Selling price (RWF)"><Input type="number" min="0" value={r.price} onChange={(e) => setRow(i, { price: e.target.value })} /></Field>
                <Field label={`${r.crate ? "Crates" : unitName + "s"} received`}><Input type="number" min="0" value={r.qty} onChange={(e) => setRow(i, { qty: e.target.value })} /></Field>
              </div>
              <Toggle checked={r.crate} onChange={(x) => setRow(i, { crate: x })} label="It arrives in crates (or boxes)" />
              {r.crate && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label={`${unitName || "Unit"}s in one crate`}><Input type="number" min="2" value={r.perCrate} onChange={(e) => setRow(i, { perCrate: e.target.value })} /></Field>
                  <Field label="Price paid per crate (optional)"><Input type="number" min="0" value={r.cost} onChange={(e) => setRow(i, { cost: e.target.value })} /></Field>
                </div>
              )}
              {!r.crate && (
                <Field label={`Price paid per ${unitName || "unit"} (optional)`}><Input type="number" min="0" value={r.cost} onChange={(e) => setRow(i, { cost: e.target.value })} /></Field>
              )}
              {r.crate && Number(r.qty) > 0 && Number(r.perCrate) >= 2 && (
                <p className="text-xs text-gray-600">{r.qty} × {r.perCrate} = <strong>{number(Number(r.qty) * Number(r.perCrate))} {unitName}s</strong> go into stock.</p>
              )}
            </div>
          ))}
        </div>
      )}
      {(product || isNew) && <Field label="Note (optional)"><Input value={note} onChange={(e) => setNote(e.target.value)} /></Field>}
    </Modal>
  );
};

const TransferDialog = ({ menu, onClose, onDone, defaultOutlet }) => {
  const { user } = useAuth();
  const mine = user.outlets || [];
  const { data: everyOutlet } = useLoad(() => api.get("/api/outlets/transfer-targets"));
  const outlets = everyOutlet || mine;
  const [fromId, setFromId] = useState(defaultOutlet || "");
  useSingleOutlet(mine, fromId, setFromId);
  const [toId, setToId] = useState("");
  const [variantId, setVariantId] = useState(null);
  const [unit, setUnit] = useState("BASE");
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const v = findVariant(menu, variantId)?.variant;
  const effectiveUnit = unit === "PACK" && !v?.packUnitName ? "BASE" : unit;

  const submit = async () => {
    setBusy(true);
    try {
      await api.post("/api/stock/transfer", {
        fromOutletId: Number(fromId), toOutletId: Number(toId), variantId, quantity: Number(qty), unit: effectiveUnit, note: note || null,
      });
      toast.success("Stock moved.");
      onDone();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open title="Move stock between outlets" onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={busy} disabled={!fromId || !toId || fromId === toId || !variantId || !(Number(qty) > 0)} onClick={submit}>Move stock</Button></>}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="From">
          <Select value={fromId} onChange={(e) => setFromId(e.target.value)}>
            <option value="">Choose</option>
            {mine.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </Select>
        </Field>
        <Field label="To">
          <Select value={toId} onChange={(e) => setToId(e.target.value)}>
            <option value="">Choose</option>
            {outlets.filter((o) => String(o.id) !== String(fromId)).map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </Select>
        </Field>
      </div>
      <VariantPicker menu={menu} value={variantId} onChange={setVariantId} />
      {v && <UnitFields variant={v} unit={effectiveUnit} setUnit={setUnit} qty={qty} setQty={setQty} />}
      <Field label="Note (optional)"><Input value={note} onChange={(e) => setNote(e.target.value)} /></Field>
    </Modal>
  );
};

const KINDS = [
  { value: "BREAKAGE", text: "Breakage", hint: "Removes this quantity from stock." },
  { value: "WASTE", text: "Waste or expiry", hint: "Removes this quantity from stock." },
  { value: "RETURN", text: "Return to stock", hint: "Adds this quantity back." },
  { value: "CORRECTION", text: "Count correction", hint: "Enter the number you counted. Stock is set to it." },
];

const AdjustDialog = ({ menu, onClose, onDone, defaultOutlet }) => {
  const outlets = useOutletList();
  const [outletId, setOutletId] = useState(defaultOutlet || "");
  useSingleOutlet(outlets, outletId, setOutletId);
  const [variantId, setVariantId] = useState(null);
  const [type, setType] = useState("BREAKAGE");
  const [unit, setUnit] = useState("BASE");
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const v = findVariant(menu, variantId)?.variant;
  const effectiveUnit = unit === "PACK" && !v?.packUnitName ? "BASE" : unit;

  const submit = async () => {
    setBusy(true);
    try {
      await api.post("/api/stock/adjust", { outletId: Number(outletId), variantId, type, quantity: Number(qty), unit: effectiveUnit, reason });
      toast.success("Recorded.");
      onDone();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open title="Breakage, waste, returns or count" onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={busy} disabled={!outletId || !variantId || qty === "" || !reason.trim()} onClick={submit}>Save</Button></>}>
      <Field label="Outlet">
        <Select value={outletId} onChange={(e) => setOutletId(e.target.value)}>
          <option value="">Choose an outlet</option>
          {outlets.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </Select>
      </Field>
      <Field label="What happened?" hint={KINDS.find((k) => k.value === type).hint}>
        <Select value={type} onChange={(e) => setType(e.target.value)}>
          {KINDS.map((k) => <option key={k.value} value={k.value}>{k.text}</option>)}
        </Select>
      </Field>
      <VariantPicker menu={menu} value={variantId} onChange={setVariantId} />
      {v && <UnitFields variant={v} unit={effectiveUnit} setUnit={setUnit} qty={qty} setQty={setQty} qtyLabel={type === "CORRECTION" ? "Number counted" : "How many?"} />}
      <Field label="Reason (required)"><Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="For example: crate dropped while unloading" /></Field>
    </Modal>
  );
};

export default Stock;
