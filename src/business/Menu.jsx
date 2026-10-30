import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { api } from "../lib/http";
import { toast } from "../utils/toast";
import { money } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import { PageHeader, Card, Button, Badge, Table, Spinner, ErrorNote, Empty, Modal, Field, Input, Select, Toggle, Textarea, Combobox, useLoad } from "../components/ui/kit";

const blankVariant = (label = "") => ({
  id: null, label, sellPrice: "", baseUnitName: "bottle", sold: false, packUnitName: "crate", unitsPerPack: "24", packPrice: "",
  tracked: true, lowStockThreshold: "5", active: true,
});

const fromView = (v) => ({
  id: v.id, label: v.label, sellPrice: String(v.sellPrice), baseUnitName: v.baseUnitName, sold: !!v.packUnitName,
  packUnitName: v.packUnitName || "crate", unitsPerPack: v.unitsPerPack ? String(v.unitsPerPack) : "24",
  packPrice: v.packPrice != null ? String(v.packPrice) : "", tracked: v.tracked, lowStockThreshold: String(v.lowStockThreshold ?? 0), active: v.active,
});

const Menu = () => {
  const { can } = useAuth();
  const { data, error, loading, reload } = useLoad(() => api.get("/api/menu"));
  const [editing, setEditing] = useState(null); // null | {} (new) | product
  const manage = can("menu:manage");

  return (
    <div>
      <PageHeader
        title="Menu"
        subtitle="What you sell, its prices and how it is counted in stock."
        actions={manage && <Button onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Add item</Button>}
      />
      {error && <ErrorNote error={error} onRetry={reload} />}
      {loading ? (
        <Spinner />
      ) : data && data.length === 0 ? (
        <Empty title="The menu is empty" hint={manage ? "Add your first item, for example Fanta or Grilled fish." : "The owner has not added items yet."} />
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {(data || []).map((p) => (
            <Card key={p.id} className={p.active ? "" : "opacity-60"}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  <p className="text-xs text-[#A2A1A8]">{p.category || "No category"}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!p.active && <Badge>Hidden</Badge>}
                  {manage && <Button variant="ghost" size="sm" onClick={() => setEditing(p)}><Pencil className="h-4 w-4" /> Edit</Button>}
                </div>
              </div>
              <Table headers={[p.hasSizes ? "Size" : "Unit", { text: "Price", right: true }, "Sold by the", "Stock"]} className="border-0">
                {p.variants.filter((v) => v.active).map((v) => (
                  <tr key={v.id}>
                    <td className="px-4 py-2.5">{p.hasSizes ? v.label : v.baseUnitName}</td>
                    <td className="px-4 py-2.5 text-right font-medium">{money(v.sellPrice)}</td>
                    <td className="px-4 py-2.5 text-gray-600">
                      {v.packUnitName ? `${v.baseUnitName} or ${v.packUnitName} of ${v.unitsPerPack}` : v.baseUnitName}
                    </td>
                    <td className="px-4 py-2.5">{v.tracked ? <Badge tone="blue">Counted</Badge> : <Badge>Not counted</Badge>}</td>
                  </tr>
                ))}
              </Table>
            </Card>
          ))}
        </div>
      )}
      {editing && <ItemDialog product={editing.id ? editing : null} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(true); }} />}
    </div>
  );
};

const ItemDialog = ({ product, onClose, onSaved }) => {
  const [name, setName] = useState(product?.name || "");
  const [category, setCategory] = useState(product?.category || "");
  const [description, setDescription] = useState(product?.description || "");
  const [hasSizes, setHasSizes] = useState(product?.hasSizes ?? false);
  const [active, setActive] = useState(product?.active ?? true);
  const [variants, setVariants] = useState(product ? product.variants.filter((v) => v.active).map(fromView) : [blankVariant("Standard")]);
  const [busy, setBusy] = useState(false);

  const DRINK = /drink|beer|soda|juice|water|wine|spirit|whisk|liquor|beverage|soft|fanta|coke/i;
  const changeCategory = (value) => {
    setCategory(value);
    // Drinks come in crates of 24 unless the manager says otherwise when receiving them.
    if (!product && DRINK.test(value)) {
      setVariants((vs) => vs.map((v) => (v.sold ? v : { ...v, sold: true, packUnitName: "crate", unitsPerPack: "24", baseUnitName: "bottle" })));
    }
  };

  const setV = (i, patch) => setVariants((vs) => vs.map((v, j) => (j === i ? { ...v, ...patch } : v)));

  const changeSizes = (on) => {
    setHasSizes(on);
    setVariants((vs) => (on ? (vs.length >= 2 ? vs : [{ ...vs[0], label: "Small" }, { ...blankVariant("Large"), baseUnitName: vs[0].baseUnitName }]) : [{ ...vs[0], label: "Standard" }]));
  };

  const valid =
    name.trim() &&
    variants.every((v) => v.sellPrice !== "" && Number(v.sellPrice) >= 0 && (!hasSizes || v.label.trim()) && (!v.sold || Number(v.unitsPerPack) >= 2));

  const save = async () => {
    setBusy(true);
    try {
      const body = {
        name, category: category || null, description: description || null, hasSizes, active,
        variants: variants.map((v) => ({
          id: v.id, label: hasSizes ? v.label : "Standard", sellPrice: Number(v.sellPrice), baseUnitName: v.baseUnitName || "piece",
          packUnitName: v.sold ? v.packUnitName : null, unitsPerPack: v.sold ? Number(v.unitsPerPack) : null,
          packPrice: v.sold && v.packPrice !== "" ? Number(v.packPrice) : null, tracked: v.tracked,
          lowStockThreshold: Number(v.lowStockThreshold) || 0, active: v.active,
        })),
      };
      if (product) await api.put(`/api/menu/${product.id}`, body);
      else await api.post("/api/menu", body);
      toast.success(product ? "Item updated." : "Item added to the menu.");
      onSaved();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open wide title={product ? `Edit ${product.name}` : "Add a menu item"} onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={busy} disabled={!valid} onClick={save}>Save item</Button></>}>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Fanta Orange" autoFocus /></Field>
        <Field label="Category" hint="Drinks are set up with 24 bottles in a crate by default.">
          <Combobox value={category} onChange={changeCategory} options={["Soft drinks", "Beer", "Wine", "Spirits", "Water and juice", "Food", "Other"]} placeholder="Soft drinks" />
        </Field>
      </div>
      <Field label="Description (optional)"><Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} /></Field>

      <div className="rounded-[10px] border border-gray-200 p-4">
        <Toggle checked={hasSizes} onChange={changeSizes} label="Does it come in different sizes?" hint="For example a small and a large bottle. Each size has its own price and its own stock." />
      </div>

      <div className="space-y-4">
        {variants.map((v, i) => (
          <div key={i} className="rounded-[10px] border border-gray-200 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800">{hasSizes ? `Size ${i + 1}` : "Price and stock"}</p>
              {hasSizes && variants.length > 2 && (
                <button onClick={() => setVariants((vs) => vs.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-600" aria-label="Remove size"><Trash2 className="h-4 w-4" /></button>
              )}
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {hasSizes && <Field label="Size name"><Input value={v.label} onChange={(e) => setV(i, { label: e.target.value })} placeholder="Small" /></Field>}
              <Field label="Selling price (RWF)"><Input type="number" min="0" value={v.sellPrice} onChange={(e) => setV(i, { sellPrice: e.target.value })} /></Field>
              <Field label="Smallest unit"><Input value={v.baseUnitName} onChange={(e) => setV(i, { baseUnitName: e.target.value })} placeholder="bottle" /></Field>
            </div>
            <Toggle checked={v.tracked} onChange={(x) => setV(i, { tracked: x })} label="Count it in stock" hint="Switch off for dishes made to order, like grilled fish." />
            {v.tracked && (
              <>
                <Toggle checked={v.sold} onChange={(x) => setV(i, { sold: x })} label="It also comes in bigger units (crate, carton, pack)" />
                {v.sold && (
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Field label="Bigger unit"><Input value={v.packUnitName} onChange={(e) => setV(i, { packUnitName: e.target.value })} placeholder="crate" /></Field>
                    <Field label={`${v.baseUnitName || "Units"}s in one ${v.packUnitName || "pack"}`}>
                      <Input type="number" min="2" value={v.unitsPerPack} onChange={(e) => setV(i, { unitsPerPack: e.target.value })} />
                    </Field>
                    <Field label="Price per whole one (optional)" hint="Leave empty to multiply the unit price">
                      <Input type="number" min="0" value={v.packPrice} onChange={(e) => setV(i, { packPrice: e.target.value })} />
                    </Field>
                  </div>
                )}
                <Field label="Warn me when stock falls to" hint={`In ${v.baseUnitName || "unit"}s`}>
                  <Input type="number" min="0" value={v.lowStockThreshold} onChange={(e) => setV(i, { lowStockThreshold: e.target.value })} className="max-w-[160px]" />
                </Field>
              </>
            )}
          </div>
        ))}
        {hasSizes && (
          <Button variant="secondary" size="sm" onClick={() => setVariants((vs) => [...vs, { ...blankVariant(""), baseUnitName: vs[0]?.baseUnitName || "bottle" }])}>
            <Plus className="h-4 w-4" /> Add another size
          </Button>
        )}
      </div>

      {product && <Toggle checked={active} onChange={setActive} label="Shown on the menu" hint="Switch off to hide it from waiters without losing its history." />}
    </Modal>
  );
};

export default Menu;
