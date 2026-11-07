"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, ShieldCheck, Blocks, Clapperboard, Lightbulb, Laptop } from "lucide-react";
import { CATEGORIES } from "@/lib/content";

const ICONS = { Blocks, Clapperboard, Lightbulb, Laptop } as const;

declare global {
  interface Window {
    PaystackPop?: {
      setup: (opts: PaystackSetupOptions) => { openIframe: () => void };
    };
  }
}

interface PaystackSetupOptions {
  key: string;
  email: string;
  amount: number;
  currency?: string;
  ref: string;
  metadata?: Record<string, unknown>;
  callback: (response: { reference: string }) => void;
  onClose: () => void;
}

type PaymentStatus = "idle" | "need-email" | "launching" | "verifying" | "paid" | "error";

export default function PaymentGate({
  onPaid,
}: {
  onPaid: (info: { reference: string; category: string; email: string; fee: number }) => void;
}) {
  const [categoryId, setCategoryId] = useState<string>("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const selected = CATEGORIES.find((c) => c.id === categoryId) ?? null;

  function loadPaystackScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.PaystackPop) return resolve();
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("Could not load the payment provider. Check your connection and try again."));
      document.body.appendChild(script);
    });
  }

  async function handlePay() {
    setErrorMsg("");

    if (!selected) {
      setErrorMsg("Select an age category first.");
      return;
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setStatus("need-email");
      setErrorMsg("Enter a valid email address to receive your payment receipt.");
      return;
    }

    setStatus("launching");
    try {
      const initRes = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, categoryId: selected.id, amount: selected.fee }),
      });
      const initData = await initRes.json();
      if (!initRes.ok) throw new Error(initData?.message || "Could not start payment.");

      await loadPaystackScript();

      const handler = window.PaystackPop!.setup({
        key: initData.publicKey,
        email,
        amount: selected.fee * 100,
        currency: "NGN",
        ref: initData.reference,
        metadata: { categoryId: selected.id, categoryLabel: selected.range },
        callback: async (response) => {
          setStatus("verifying");
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reference: response.reference }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(
                verifyData?.message || "We couldn't confirm your payment. Contact support with your reference."
              );
            }
            setStatus("paid");
            onPaid({ reference: response.reference, category: selected.id, email, fee: selected.fee });
          } catch (err) {
            setStatus("error");
            setErrorMsg(err instanceof Error ? err.message : "Payment verification failed.");
          }
        },
        onClose: () => {
          if (status !== "paid") setStatus("idle");
        },
      });
      handler.openIframe();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong starting payment.");
    }
  }

  return (
    <div>
      <p className="font-mono text-xs text-ink/40 mb-6">STEP 1 — PAY REGISTRATION FEE</p>

      <div className="border-t border-ink">
        {CATEGORIES.map((c) => {
          const Icon = ICONS[c.icon as keyof typeof ICONS];
          const active = categoryId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryId(c.id)}
              className={`w-full grid grid-cols-12 items-center py-5 border-b text-left transition-colors ${
                active ? "border-signal" : "border-ink/15 hover:border-ink"
              }`}
            >
              <div className="col-span-7 sm:col-span-8 flex items-center gap-3">
                <span
                  className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    active ? "border-signal text-signal" : "border-ink/15 text-ink/50"
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={2} />
                </span>
                <div>
                  <p className="font-display text-lg text-ink">{c.range}</p>
                  <p className="text-xs text-ink/50">{c.label}</p>
                </div>
              </div>
              <div className="col-span-5 sm:col-span-4 text-right">
                <span className={`font-display text-xl font-semibold ${active ? "text-signal" : "text-ink"}`}>
                  ₦{c.fee.toLocaleString()}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-10">
        <label className="text-xs text-ink/40 block mb-1">Email address for receipt</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="parent@email.com"
          className="w-full border-b border-ink/20 bg-transparent px-0 py-3 text-ink placeholder:text-ink/35 focus:outline-none focus:border-signal transition-colors"
        />
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 text-sm text-signal-dark bg-signal-tint px-4 py-3 mt-6">
          <AlertCircle className="w-4 h-4 shrink-0" /> {errorMsg}
        </div>
      )}

      <button
        type="button"
        onClick={handlePay}
        disabled={!selected || status === "launching" || status === "verifying"}
        className="w-full bg-ink hover:bg-signal disabled:opacity-50 text-white font-semibold py-4 transition-colors focus-ring mt-8"
      >
        {status === "launching" && "Opening secure payment…"}
        {status === "verifying" && "Confirming payment…"}
        {(status === "idle" || status === "need-email" || status === "error") &&
          (selected ? `Pay ₦${selected.fee.toLocaleString()} with Paystack` : "Select a category to pay")}
      </button>

      <p className="flex items-center justify-center gap-2 text-xs text-ink/40 mt-4">
        <ShieldCheck className="w-3.5 h-3.5" /> Secured by Paystack
      </p>
    </div>
  );
}

export function PaidBadge({ reference, fee }: { reference: string; fee: number }) {
  return (
    <div className="flex items-center gap-3 bg-signal-tint px-4 py-3 mb-10">
      <CheckCircle2 className="w-4 h-4 text-signal shrink-0" />
      <div className="text-sm">
        <p className="font-semibold text-ink">Payment confirmed — ₦{fee.toLocaleString()}</p>
        <p className="text-ink/50 text-xs">Reference: {reference}</p>
      </div>
    </div>
  );
}
