"use client";

import { useState } from "react";
import { Copy, Check, Building2, User, CreditCard } from "lucide-react";
import { BANK_DETAILS } from "@/lib/content";

interface BankTransferGateProps {
  totalFee: number;
  childCount: number;
}

export default function BankTransferGate({ totalFee, childCount }: BankTransferGateProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(BANK_DETAILS.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="border border-ink/15 bg-white p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink/10 pb-5">
        <div>
          <p className="font-mono text-xs text-signal mb-1">PAYMENT DETAILS</p>
          <h3 className="font-display text-2xl font-semibold text-ink">
            Bank Transfer Information
          </h3>
          <p className="text-xs text-ink/60 mt-1">
            Transfer registration fee directly to our official First Bank account.
          </p>
        </div>
        <div className="text-left sm:text-right bg-signal-tint/60 border border-signal/20 p-3 sm:px-4 sm:py-2.5 shrink-0">
          <p className="text-[11px] font-mono text-ink/50 uppercase">
            Total for {childCount} {childCount === 1 ? "child" : "children"}
          </p>
          <p className="font-display text-2xl font-bold text-signal">
            ₦{totalFee.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full border border-ink/15 flex items-center justify-center shrink-0 text-ink/60 mt-0.5">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-mono text-ink/40">BANK NAME</p>
            <p className="font-semibold text-ink text-base">{BANK_DETAILS.bankName}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full border border-ink/15 flex items-center justify-center shrink-0 text-ink/60 mt-0.5">
            <User className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-mono text-ink/40">ACCOUNT NAME</p>
            <p className="font-semibold text-ink text-base">{BANK_DETAILS.accountName}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full border border-signal/40 text-signal flex items-center justify-center shrink-0 mt-0.5">
            <CreditCard className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-ink/40">ACCOUNT NUMBER</p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="font-mono text-xl font-bold tracking-wider text-ink whitespace-nowrap">
                {BANK_DETAILS.accountNumber}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 text-xs bg-ink/5 hover:bg-ink hover:text-white border border-ink/20 px-2.5 py-1 transition-colors focus-ring shrink-0"
                title="Copy account number"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-signal" />
                    <span className="text-[11px] font-semibold text-signal">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-semibold">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-dashed border-ink/15 text-xs text-ink/60 flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-signal shrink-0" />
        <span>After transferring, enter your sender name and upload the receipt screenshot below.</span>
      </div>
    </div>
  );
}
