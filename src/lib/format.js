export const money = (n) =>
  `RWF ${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export const number = (n) => Number(n || 0).toLocaleString("en-US");

export const dateTime = (v) =>
  v
    ? new Date(v).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

export const dateOnly = (v) =>
  v
    ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "";

export const today = () => new Date().toISOString().slice(0, 10);

export const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export const label = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());

export const ORDER_STATUS = {
  PENDING_APPROVAL: { text: "Waiting for approval", tone: "amber" },
  APPROVED: { text: "To serve", tone: "blue" },
  DELIVERED: { text: "Delivered", tone: "green" },
  REJECTED: { text: "Rejected", tone: "red" },
  CANCELLED: { text: "Cancelled", tone: "gray" },
};

export const PAYMENT_STATUS = {
  PAID: { text: "Paid", tone: "green" },
  PARTIAL: { text: "Partly paid", tone: "amber" },
  UNPAID: { text: "Unpaid", tone: "red" },
};

export const METHODS = [
  { value: "CASH", text: "Cash" },
  { value: "CARD", text: "Card" },
  { value: "MOBILE_MONEY", text: "Mobile money" },
  { value: "CREDIT", text: "Credit" },
];
