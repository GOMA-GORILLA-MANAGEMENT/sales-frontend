import React, { useMemo } from "react";
import { Field, Select } from "../components/ui/kit";

/** Pick a menu item, then a size when it has sizes. `value` is the variant id. */
const VariantPicker = ({ menu, value, onChange, onlyTracked = true }) => {
  const products = useMemo(
    () => (menu || []).filter((p) => p.variants.some((v) => v.active && (!onlyTracked || v.tracked))),
    [menu, onlyTracked]
  );
  const product = products.find((p) => p.variants.some((v) => v.id === value));
  const variants = product ? product.variants.filter((v) => v.active && (!onlyTracked || v.tracked)) : [];

  return (
    <>
      <Field label="Item">
        <Select
          value={product?.id ?? ""}
          onChange={(e) => {
            const p = products.find((x) => x.id === Number(e.target.value));
            onChange(p ? p.variants.find((v) => v.active && (!onlyTracked || v.tracked)).id : null);
          }}
        >
          <option value="">Choose an item</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
      </Field>
      {product?.hasSizes && (
        <Field label="Size">
          <Select value={value ?? ""} onChange={(e) => onChange(Number(e.target.value))}>
            {variants.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
          </Select>
        </Field>
      )}
    </>
  );
};

export const findVariant = (menu, id) => {
  for (const p of menu || []) {
    const v = p.variants.find((x) => x.id === id);
    if (v) return { product: p, variant: v };
  }
  return null;
};

export default VariantPicker;
