import React from "react";
import { Select } from "../components/ui/kit";
import { useAuth } from "../context/AuthContext";

/** Dropdown of the outlets this person works in. Hidden when there is only one. */
const OutletFilter = ({ value, onChange, allLabel = "All outlets", required }) => {
  const { user } = useAuth();
  const outlets = user.outlets || [];
  if (outlets.length <= 1 && !required) return null;
  return (
    <Select value={value ?? ""} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)} className="!w-auto min-w-[180px]">
      {!required && <option value="">{allLabel}</option>}
      {outlets.map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </Select>
  );
};

export default OutletFilter;
