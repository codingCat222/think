import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Creates a Paystack transaction reference server-side. We never expose the
// Paystack SECRET key to the browser — only the PUBLIC key goes to the
// client, which is required to open the inline checkout widget.
//
// Env vars required (see .env.example):
//   PAYSTACK_SECRET_KEY             — starts with sk_...
//   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY — starts with pk_...
// ---------------------------------------------------------------------------

const CATEGORY_FEES: Record<string, number> = {
  "2-5": 10000,
  "6-8": 15000,
  "9-12": 20000,
  "13-19": 25000,
};

const schema = z.object({
  email: z.string().email(),
  categoryId: z.enum(["2-5", "6-8", "9-12", "13-19"]),
  amount: z.number().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid payment request." }, { status: 400 });
    }

    const { email, categoryId, amount } = parsed.data;

    // Trust the server-side fee table, not whatever the client sent, to
    // prevent a tampered request from paying less than the real fee.
    const expectedFee = CATEGORY_FEES[categoryId];
    if (amount !== expectedFee) {
      return NextResponse.json(
        { message: "Amount does not match the registration fee for this category." },
        { status: 400 }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

    if (!secretKey || !publicKey) {
      return NextResponse.json(
        { message: "Payments are not configured yet. Set PAYSTACK_SECRET_KEY and NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY." },
        { status: 500 }
      );
    }

    const reference = `thinkup_${categoryId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: expectedFee * 100, // kobo
        reference,
        currency: "NGN",
        metadata: { categoryId },
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData.status) {
      return NextResponse.json(
        { message: paystackData?.message || "Could not initialize payment with Paystack." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      reference,
      publicKey,
      authorizationUrl: paystackData.data?.authorization_url,
    });
  } catch (err) {
    console.error("Payment initialize error:", err);
    return NextResponse.json({ message: "Something went wrong starting payment." }, { status: 500 });
  }
}
