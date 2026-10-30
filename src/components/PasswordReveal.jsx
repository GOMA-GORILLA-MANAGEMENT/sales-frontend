import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Modal, Button } from "./ui/kit";

/** Shows a generated password exactly once, with a copy button. */
const PasswordReveal = ({ data, onClose }) => {
  const [copied, setCopied] = useState(false);
  if (!data) return null;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(data.password);
      setCopied(true);
    } catch {
      /* the password is on screen to copy by hand */
    }
  };
  return (
    <Modal open title={data.title} onClose={onClose} footer={<Button onClick={onClose}>I have copied it</Button>}>
      <p className="text-sm text-gray-600">
        This password is shown <strong>only now</strong> and cannot be looked up later. Copy it and pass it on to {data.email}.
      </p>
      <div className="flex items-center justify-between gap-3 rounded-[10px] border border-orange-200 bg-orange-50 px-4 py-3">
        <code className="text-lg font-semibold tracking-wide text-gray-900 break-all">{data.password}</code>
        <button onClick={copy} className="p-2 rounded-full hover:bg-orange-100 text-[#FF6F00]" aria-label="Copy password">
          {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
        </button>
      </div>
    </Modal>
  );
};

export default PasswordReveal;
