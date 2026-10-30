import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { api } from "../lib/http";
import { toast } from "../utils/toast";
import { PageHeader, Card, Field, Input, Select, Button, Toggle } from "../components/ui/kit";
import PasswordReveal from "../components/PasswordReveal";

const steps = ["Restaurant", "Owner", "Review"];

const Onboard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [revealed, setRevealed] = useState(null);
  const [created, setCreated] = useState(null);
  const [f, setF] = useState({
    businessName: "",
    outletName: "",
    outletType: "RESTAURANT",
    ownerFirstName: "",
    ownerLastName: "",
    ownerEmail: "",
    ownerPhone: "",
    generate: true,
    password: "",
  });
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const valid =
    step === 0
      ? f.businessName.trim() && f.outletName.trim()
      : step === 1
      ? f.ownerFirstName.trim() && f.ownerLastName.trim() && /\S+@\S+\.\S+/.test(f.ownerEmail) && (f.generate || f.password.length >= 8)
      : true;

  const submit = async () => {
    setBusy(true);
    try {
      const res = await api.post("/api/admin/restaurants", {
        businessName: f.businessName,
        outletName: f.outletName,
        outletType: f.outletType,
        ownerFirstName: f.ownerFirstName,
        ownerLastName: f.ownerLastName,
        ownerEmail: f.ownerEmail,
        ownerPhone: f.ownerPhone || null,
        password: f.generate ? null : f.password,
      });
      toast.success(`${res.restaurant.name} is ready.`);
      setCreated(res.restaurant);
      if (res.generatedPassword) {
        setRevealed({ title: "Owner login created", email: res.ownerEmail, password: res.generatedPassword });
      } else {
        navigate(`/platform/restaurants/${res.restaurant.id}`);
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <PageHeader title="Add a restaurant" subtitle="Creates the account, its first outlet, the default roles and the owner login in one go." />

      <ol className="flex items-center gap-3 mb-6">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <span
              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                i < step ? "bg-[#FF6F00] text-white" : i === step ? "border-2 border-[#FF6F00] text-[#FF6F00]" : "border border-gray-300 text-gray-400"
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={`text-sm ${i === step ? "font-medium text-gray-900" : "text-gray-500"}`}>{s}</span>
            {i < steps.length - 1 && <span className="w-8 h-px bg-gray-300" />}
          </li>
        ))}
      </ol>

      <Card className="space-y-5">
        {step === 0 && (
          <>
            <Field label="Business name">
              <Input value={f.businessName} onChange={set("businessName")} placeholder="Gorilla Bar & Restaurant" autoFocus />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="First outlet name" hint="The owner can add more later.">
                <Input value={f.outletName} onChange={set("outletName")} placeholder="Gorilla Main Bar" />
              </Field>
              <Field label="First outlet is a">
                <Select value={f.outletType} onChange={set("outletType")}>
                  <option value="RESTAURANT">Restaurant</option>
                  <option value="BAR">Bar</option>
                </Select>
              </Field>
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Owner first name"><Input value={f.ownerFirstName} onChange={set("ownerFirstName")} /></Field>
              <Field label="Owner last name"><Input value={f.ownerLastName} onChange={set("ownerLastName")} /></Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Owner email (their login)"><Input type="email" value={f.ownerEmail} onChange={set("ownerEmail")} /></Field>
              <Field label="Phone (optional)"><Input value={f.ownerPhone} onChange={set("ownerPhone")} /></Field>
            </div>
            <Toggle
              checked={f.generate}
              onChange={(v) => setF((p) => ({ ...p, generate: v }))}
              label="Generate a password for the owner"
              hint="It is shown once, right after you create the account, so you can pass it on."
            />
            {!f.generate && (
              <Field label="Password" hint="At least 8 characters">
                <Input type="text" value={f.password} onChange={set("password")} autoComplete="off" />
              </Field>
            )}
          </>
        )}
        {step === 2 && (
          <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div><dt className="text-[#A2A1A8]">Business</dt><dd className="font-medium text-gray-900">{f.businessName}</dd></div>
            <div><dt className="text-[#A2A1A8]">First outlet</dt><dd className="font-medium text-gray-900">{f.outletName} ({f.outletType === "BAR" ? "bar" : "restaurant"})</dd></div>
            <div><dt className="text-[#A2A1A8]">Owner</dt><dd className="font-medium text-gray-900">{f.ownerFirstName} {f.ownerLastName}</dd></div>
            <div><dt className="text-[#A2A1A8]">Login email</dt><dd className="font-medium text-gray-900">{f.ownerEmail}</dd></div>
            <div><dt className="text-[#A2A1A8]">Password</dt><dd className="font-medium text-gray-900">{f.generate ? "Generated for you" : "Chosen by you"}</dd></div>
            <div><dt className="text-[#A2A1A8]">Default roles</dt><dd className="font-medium text-gray-900">Owner, Overall manager, Manager, Waiter</dd></div>
          </dl>
        )}

        <div className="flex justify-between pt-2">
          <Button variant="secondary" disabled={step === 0 || busy || !!created} onClick={() => setStep(step - 1)}>Back</Button>
          {step < 2 ? (
            <Button disabled={!valid} onClick={() => setStep(step + 1)}>Continue</Button>
          ) : (
            <Button loading={busy} disabled={!!created} onClick={submit}>Create account</Button>
          )}
        </div>
      </Card>

      <PasswordReveal
        data={revealed}
        onClose={() => {
          setRevealed(null);
          if (created) navigate(`/platform/restaurants/${created.id}`);
        }}
      />
    </div>
  );
};

export default Onboard;
