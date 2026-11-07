import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// ---------------------------------------------------------------------------
// This route receives the registration form (multipart/form-data, because it
// may include a file upload) and persists it.
//
// Swap `saveRegistration` below for your real database call — e.g. Prisma,
// Supabase, MongoDB, etc. An example Prisma version is commented at the
// bottom of this file.
// ---------------------------------------------------------------------------

const schema = z.object({
  parentName: z.string().min(2),
  parentPhone: z.string().min(7),
  parentEmail: z.string().email(),
  childName: z.string().min(2),
  dob: z.string().min(1),
  age: z.coerce.number().int().min(1).max(19),
  school: z.string().min(2),
  category: z.string().min(1),
  appIdea: z.string().optional(),
  consent: z.coerce.boolean(),
  privacy: z.coerce.boolean(),
  paymentReference: z.string().min(5, "A verified payment reference is required."),
  amountPaid: z.coerce.number().positive(),
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const raw = Object.fromEntries(formData.entries());
    const parsed = schema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please check the form for errors.", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    if (!parsed.data.consent || !parsed.data.privacy) {
      return NextResponse.json(
        { message: "Consent and privacy agreement are required." },
        { status: 400 }
      );
    }

    const paymentOk = await verifyPaymentWasRecorded(
      parsed.data.paymentReference,
      parsed.data.amountPaid
    );
    if (!paymentOk) {
      return NextResponse.json(
        { message: "We could not confirm this payment. Please complete payment again before registering." },
        { status: 402 }
      );
    }

    const file = formData.get("projectFile");
    let storedFileUrl: string | null = null;

    if (file instanceof File && file.size > 0) {
      // TODO: upload to your storage provider (S3, Supabase Storage, etc.)
      // and set storedFileUrl to the resulting public/signed URL.
      storedFileUrl = await storeUploadedFile(file);
    }

    const registration = await saveRegistration({
      ...parsed.data,
      projectFileUrl: storedFileUrl,
      submittedAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: "Registration received.", id: registration.id }, { status: 201 });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { message: "Something went wrong while saving your registration." },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Replace this with your actual database write.
// ---------------------------------------------------------------------------
async function saveRegistration(data: Record<string, unknown>): Promise<{ id: string }> {
  // Example: write to a local JSON file for development/demo purposes only.
  // DO NOT use this in production — use a real database.
  const fs = await import("fs/promises");
  const path = await import("path");

  const dbPath = path.join(process.cwd(), "registrations.json");
  let existing: Record<string, unknown>[] = [];

  try {
    const content = await fs.readFile(dbPath, "utf-8");
    existing = JSON.parse(content);
  } catch {
    existing = [];
  }

  const id = crypto.randomUUID();
  existing.push({ id, ...data });

  await fs.writeFile(dbPath, JSON.stringify(existing, null, 2));

  return { id };
}

// ---------------------------------------------------------------------------
// Confirms the payment reference the client submitted matches a transaction
// that /api/payments/verify already confirmed as successful with Paystack
// directly (never trust a reference the client just typed in). Dev version
// reads the same local JSON file written in payments/verify/route.ts —
// replace with a real database lookup (e.g. a Prisma `payment.findUnique`)
// in production, ideally inside the same transaction as the registration
// insert.
// ---------------------------------------------------------------------------
async function verifyPaymentWasRecorded(reference: string, amountPaid: number): Promise<boolean> {
  const fs = await import("fs/promises");
  const path = await import("path");

  const dbPath = path.join(process.cwd(), "verified-payments.json");
  try {
    const content = await fs.readFile(dbPath, "utf-8");
    const payments: { reference: string; amount: number }[] = JSON.parse(content);
    return payments.some((p) => p.reference === reference && p.amount === amountPaid);
  } catch {
    return false;
  }
}

async function storeUploadedFile(file: File): Promise<string> {
  // Example: save to /public/uploads locally for development/demo purposes only.
  // DO NOT use this in production — use real object storage.
  const fs = await import("fs/promises");
  const path = await import("path");

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
  const filePath = path.join(uploadsDir, safeName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  return `/uploads/${safeName}`;
}

/* ---------------------------------------------------------------------------
 * Example: Prisma + PostgreSQL version (recommended for production)
 * ---------------------------------------------------------------------------
 *
 * 1. npm install @prisma/client && npx prisma init
 * 2. Define this model in prisma/schema.prisma:
 *
 *    model Registration {
 *      id             String   @id @default(uuid())
 *      parentName     String
 *      parentPhone    String
 *      parentEmail    String
 *      childName      String
 *      dob            String
 *      age            Int
 *      school         String
 *      category       String
 *      appIdea        String?
 *      projectFileUrl String?
 *      consent        Boolean
 *      privacy        Boolean
 *      submittedAt    DateTime @default(now())
 *    }
 *
 * 3. npx prisma migrate dev --name init
 * 4. Replace saveRegistration() above with:
 *
 *    import { PrismaClient } from "@prisma/client";
 *    const prisma = new PrismaClient();
 *
 *    async function saveRegistration(data) {
 *      const registration = await prisma.registration.create({ data });
 *      return { id: registration.id };
 *    }
 * ------------------------------------------------------------------------- */
