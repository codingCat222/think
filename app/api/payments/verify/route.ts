import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Confirms a Paystack transaction actually succeeded, server-side, before we
// trust the client's claim of "payment done". This also persists a verified
// payment record that /api/register checks against, so a forged reference
// can't be used to submit a free registration.
// ---------------------------------------------------------------------------

const schema = z.object({
  reference: z.string().min(5),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: "Invalid reference." }, { status: 400 });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { success: false, message: "Payments are not configured yet." },
        { status: 500 }
      );
    }

    const { reference } = parsed.data;

    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    );
    const verifyData = await verifyRes.json();

    const paid =
      verifyRes.ok &&
      verifyData.status === true &&
      verifyData.data?.status === "success";

    if (!paid) {
      return NextResponse.json(
        { success: false, message: "Payment was not successful." },
        { status: 402 }
      );
    }

    await recordVerifiedPayment({
      reference,
      amount: verifyData.data.amount / 100,
      email: verifyData.data.customer?.email,
      categoryId: verifyData.data.metadata?.categoryId,
      paidAt: verifyData.data.paid_at,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Payment verify error:", err);
    return NextResponse.json({ success: false, message: "Could not verify payment." }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// Dev-only store for verified payments, used by /api/register in this demo.
// Replace with a real database table in production — see the Prisma example
// in app/api/register/route.ts.
// ---------------------------------------------------------------------------
async function recordVerifiedPayment(data: {
  reference: string;
  amount: number;
  email: string;
  categoryId: string;
  paidAt: string;
}) {
  const fs = await import("fs/promises");
  const path = await import("path");

  const dbPath = path.join(process.cwd(), "verified-payments.json");
  let existing: Record<string, unknown>[] = [];
  try {
    existing = JSON.parse(await fs.readFile(dbPath, "utf-8"));
  } catch {
    existing = [];
  }

  existing.push(data);
  await fs.writeFile(dbPath, JSON.stringify(existing, null, 2));
}
