import React, { useEffect, useState, useCallback } from "react";
import { X, Loader2, ChevronDown, Check } from "lucide-react";
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react";
import { cn } from "../../lib/utils";

/* Small building blocks that follow the look of the rest of the app:
   white cards, 10px corners, orange (#FF6F00) as the one accent colour. */

export const PageHeader = ({ title, subtitle, actions }) => (
  <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
    <div>
      <h1 className="text-[20px] font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="text-[#A2A1A8] text-sm mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export const Card = ({ className, children, ...rest }) => (
  <div className={cn("bg-white rounded-[10px] border border-gray-200 p-5 xs:p-3", className)} {...rest}>
    {children}
  </div>
);

export const SectionTitle = ({ children, right }) => (
  <div className="flex items-center justify-between mb-3">
    <h2 className="text-base font-semibold text-gray-900">{children}</h2>
    {right}
  </div>
);

const buttonStyles = {
  primary: "bg-[#FF6F00] text-white hover:bg-[#E65C00] border border-transparent",
  secondary: "bg-white text-gray-700 border border-gray-300 hover:border-[#FF6F00] hover:text-[#FF6F00]",
  danger: "bg-white text-red-600 border border-red-200 hover:bg-red-50",
  ghost: "bg-transparent text-gray-600 hover:bg-gray-100 border border-transparent",
};

export const Button = ({ variant = "primary", size = "md", loading, className, children, disabled, ...rest }) => (
  <button
    disabled={disabled || loading}
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-[10px] font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#FF6F00] focus:ring-offset-1",
      size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2.5 text-sm",
      buttonStyles[variant],
      className
    )}
    {...rest}
  >
    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
    {children}
  </button>
);

const inputBase =
  "w-full px-3 py-2.5 border border-gray-300 rounded-[10px] text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6F00] focus:border-transparent disabled:bg-gray-50";

export const Field = ({ label, hint, error, children, className }) => (
  <label className={cn("block", className)}>
    {label && <span className="block text-sm text-gray-700 mb-1.5">{label}</span>}
    {children}
    {hint && !error && <span className="block text-xs text-[#A2A1A8] mt-1">{hint}</span>}
    {error && <span className="block text-xs text-red-600 mt-1">{error}</span>}
  </label>
);

export const Input = React.forwardRef(({ className, ...rest }, ref) => (
  <input ref={ref} className={cn(inputBase, className)} {...rest} />
));

export const Textarea = ({ className, ...rest }) => <textarea rows={3} className={cn(inputBase, className)} {...rest} />;

const flattenOptions = (children) =>
  React.Children.toArray(children).flatMap((c) =>
    c && c.type === React.Fragment ? flattenOptions(c.props.children) : c && c.type === "option" ? [c] : []
  );

/**
 * A dropdown that looks the same on every device. It takes the same <option> children and onChange(event)
 * as a normal select, but the list is drawn by the app (not the browser), so it is styled, scrolls when long,
 * and opens above the field when there is no room below.
 */
export const Select = ({ className, children, value, onChange, disabled }) => {
  const options = flattenOptions(children).map((o) => ({
    value: String(o.props.value ?? (typeof o.props.children === "string" ? o.props.children : "")),
    label: o.props.children,
    disabled: o.props.disabled,
  }));
  const current = String(value ?? "");
  const selected = options.find((o) => o.value === current);
  const shown = selected || options[0];
  const placeholder = !selected || selected.value === "";

  return (
    <Listbox value={current} onChange={(v) => onChange && onChange({ target: { value: v } })} disabled={disabled}>
      <ListboxButton
        className={cn(inputBase, "flex items-center justify-between gap-2 bg-white text-left data-[disabled]:opacity-60", className)}
      >
        <span className={cn("truncate", placeholder && "text-gray-500")}>{shown ? shown.label : "Select"}</span>
        <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-500" />
      </ListboxButton>
      <ListboxOptions
        anchor={{ to: "bottom start", gap: 4, padding: 12 }}
        className="z-[100] w-[var(--button-width)] min-w-[160px] max-h-64 overflow-auto rounded-[10px] border border-gray-200 bg-white p-1 text-sm shadow-lg focus:outline-none [--anchor-max-height:16rem]"
      >
        {options.map((o, i) => (
          <ListboxOption
            key={`${o.value}-${i}`}
            value={o.value}
            disabled={o.disabled}
            className="flex cursor-pointer items-center justify-between gap-2 rounded-[8px] px-3 py-2.5 text-gray-800 data-[focus]:bg-orange-50 data-[selected]:font-medium data-[selected]:text-[#FF6F00] data-[disabled]:opacity-40"
          >
            <span className={cn("truncate", o.value === "" && "text-gray-500")}>{o.label}</span>
            {o.value === current && o.value !== "" && <Check className="h-4 w-4 flex-shrink-0" />}
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  );
};

/** A text box that suggests known values as you type. Any text is allowed, so new names can be typed. */
export const Combobox = ({ value, onChange, options = [], placeholder, className, autoFocus }) => {
  const [open, setOpen] = useState(false);
  const text = String(value ?? "");
  const items = options
    .map((o) => (typeof o === "string" ? { value: o } : o))
    .filter((o) => o.value.toLowerCase().includes(text.trim().toLowerCase()) && o.value.toLowerCase() !== text.trim().toLowerCase())
    .slice(0, 8);

  return (
    <div className="relative">
      <input
        className={cn(inputBase, className)}
        value={text}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
      />
      {open && items.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-[70] mt-1 max-h-60 overflow-auto rounded-[10px] border border-gray-200 bg-white p-1 text-sm shadow-lg">
          {items.map((o) => (
            <li
              key={o.value}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(o.value);
                setOpen(false);
              }}
              className="flex cursor-pointer items-center justify-between gap-3 rounded-[8px] px-3 py-2.5 text-gray-800 hover:bg-orange-50"
            >
              <span className="truncate">{o.value}</span>
              {o.hint && <span className="flex-shrink-0 text-xs text-[#A2A1A8]">{o.hint}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const Toggle = ({ checked, onChange, label, hint }) => (
  <label className="flex items-start gap-3 cursor-pointer select-none">
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative mt-0.5 h-6 w-11 flex-shrink-0 rounded-full transition-colors",
        checked ? "bg-[#FF6F00]" : "bg-gray-300"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
          checked ? "left-[22px]" : "left-0.5"
        )}
      />
    </button>
    <span>
      <span className="block text-sm text-gray-800">{label}</span>
      {hint && <span className="block text-xs text-[#A2A1A8]">{hint}</span>}
    </span>
  </label>
);

const tones = {
  green: "bg-green-50 text-green-700 border-green-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  red: "bg-red-50 text-red-700 border-red-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  gray: "bg-gray-100 text-gray-600 border-gray-200",
  orange: "bg-orange-50 text-[#FF6F00] border-orange-200",
};

export const Badge = ({ tone = "gray", children }) => (
  <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap", tones[tone])}>
    {children}
  </span>
);

export const Stat = ({ label, value, sub, tone }) => (
  <Card className="!p-4">
    <p className="text-xs text-[#A2A1A8]">{label}</p>
    <p className={cn("text-xl font-bold mt-1", tone === "red" ? "text-red-600" : tone === "green" ? "text-green-600" : "text-gray-900")}>
      {value}
    </p>
    {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
  </Card>
);

export const Spinner = ({ className }) => (
  <div className={cn("flex justify-center py-10", className)}>
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6F00]" />
  </div>
);

export const Empty = ({ title, hint, action }) => (
  <div className="text-center py-12">
    <p className="text-gray-800 font-medium">{title}</p>
    {hint && <p className="text-sm text-[#A2A1A8] mt-1">{hint}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const ErrorNote = ({ error, onRetry }) =>
  error ? (
    <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between gap-3">
      <span>{error}</span>
      {onRetry && (
        <button onClick={onRetry} className="underline">
          Try again
        </button>
      )}
    </div>
  ) : null;

export const Modal = ({ open, title, onClose, children, footer, wide }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={cn("relative bg-white rounded-[14px] shadow-xl w-full max-h-[90vh] flex flex-col", wide ? "max-w-3xl" : "max-w-lg")}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto space-y-4">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
};

export const Table = ({ headers, children, className }) => (
  <div className={cn("overflow-x-auto rounded-[10px] border border-gray-200 bg-white", className)}>
    <table className="min-w-full text-sm">
      <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
        <tr>
          {headers.map((h, i) => (
            <th key={i} className={cn("px-4 py-3 font-medium whitespace-nowrap", typeof h === "object" && h.right && "text-right")}>
              {typeof h === "object" ? h.text : h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">{children}</tbody>
    </table>
  </div>
);

export const Tabs = ({ tabs, value, onChange }) => (
  <div className="flex flex-wrap gap-1 border-b border-gray-200 mb-5">
    {tabs.map((t) => (
      <button
        key={t.value}
        onClick={() => onChange(t.value)}
        className={cn(
          "px-4 py-2.5 text-sm -mb-px border-b-2 transition-colors",
          value === t.value ? "border-[#FF6F00] text-[#FF6F00] font-medium" : "border-transparent text-gray-600 hover:text-gray-900"
        )}
      >
        {t.text}
        {t.count > 0 && (
          <span className="ml-2 rounded-full bg-[#FF6F00] px-1.5 py-0.5 text-[10px] font-semibold text-white">{t.count}</span>
        )}
      </button>
    ))}
  </div>
);

/** Loads data when the page opens and again when `deps` change. */
export function useLoad(fn, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(fn, deps);
  const reload = useCallback(
    async (quiet) => {
      if (!quiet) setLoading(true);
      try {
        setData(await run());
        setError("");
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [run]
  );
  useEffect(() => {
    reload();
  }, [reload]);
  return { data, error, loading, reload, setData };
}
