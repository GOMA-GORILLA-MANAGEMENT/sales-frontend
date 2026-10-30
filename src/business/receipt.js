import { money, dateTime } from "../lib/format";

/** Opens a small printable receipt for a payment. */
export function printReceipt({ business, payment, debt }) {
  const w = window.open("", "_blank", "width=420,height=640");
  if (!w) return;
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  w.document.write(`<!doctype html><html><head><title>Receipt ${esc(payment.receiptNumber)}</title>
  <style>body{font-family:Arial,sans-serif;padding:24px;color:#111}h1{font-size:18px;margin:0}hr{border:0;border-top:1px dashed #999;margin:14px 0}
  .row{display:flex;justify-content:space-between;margin:6px 0;font-size:14px}.big{font-size:20px;font-weight:bold}</style></head><body>
  <h1>${esc(business)}</h1><div style="color:#666;font-size:13px">${payment.amount < 0 ? "Payment reversal" : "Payment receipt"}</div><hr>
  <div class="row"><span>Receipt</span><b>${esc(payment.receiptNumber)}</b></div>
  <div class="row"><span>Date</span><span>${esc(dateTime(payment.at))}</span></div>
  <div class="row"><span>Customer</span><span>${esc(debt.customerName)}</span></div>
  <div class="row"><span>Method</span><span>${esc(String(payment.method).replace("_", " ").toLowerCase())}</span></div>
  <hr><div class="row big"><span>Amount</span><span>${esc(money(payment.amount))}</span></div>
  <div class="row"><span>Still owed on this debt</span><span>${esc(money(debt.outstanding))}</span></div>
  <hr><div class="row"><span>Received by</span><span>${esc(payment.byName)}</span></div>
  <script>window.onload=()=>window.print()</script></body></html>`);
  w.document.close();
}
