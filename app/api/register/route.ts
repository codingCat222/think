import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { NOTIFICATION_EMAIL } from "@/lib/content";

const childSchema = z.object({
  childName: z.string().min(2),
  dob: z.string().min(1),
  age: z.coerce.number().int().min(1).max(19),
  school: z.string().min(2),
  categoryId: z.enum(["2-5", "6-8", "9-12", "13-19"]),
  appIdea: z.string().optional(),
});

const schema = z.object({
  parentName: z.string().min(2),
  parentPhone: z.string().min(7),
  parentEmail: z.string().email(),
  senderAccountName: z.string().min(2),
  totalAmountPaid: z.coerce.number().positive(),
  consent: z.coerce.boolean(),
  privacy: z.coerce.boolean(),
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const raw = {
      parentName: formData.get("parentName"),
      parentPhone: formData.get("parentPhone"),
      parentEmail: formData.get("parentEmail"),
      senderAccountName: formData.get("senderAccountName"),
      totalAmountPaid: formData.get("totalAmountPaid"),
      consent: formData.get("consent"),
      privacy: formData.get("privacy"),
    };

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

    // Parse children array
    const childrenJson = formData.get("children");
    let children: z.infer<typeof childSchema>[] = [];
    try {
      const parsedChildren = JSON.parse(String(childrenJson));
      const validatedChildren = z.array(childSchema).min(1).safeParse(parsedChildren);
      if (!validatedChildren.success) {
        return NextResponse.json(
          { message: "Please fill in details for each child.", issues: validatedChildren.error.issues },
          { status: 400 }
        );
      }
      children = validatedChildren.data;
    } catch {
      return NextResponse.json({ message: "Invalid children details." }, { status: 400 });
    }

    // Save payment receipt proof
    const receiptFile = formData.get("paymentReceipt");
    if (!(receiptFile instanceof File) || receiptFile.size === 0) {
      return NextResponse.json(
        { message: "A bank transfer receipt or payment proof screenshot is required." },
        { status: 400 }
      );
    }

    const receiptUrl = await storeUploadedFile(receiptFile, "receipts");

    // Optional project files
    const projectFileUrls: string[] = [];
    for (let i = 0; i < children.length; i++) {
      const pFile = formData.get(`projectFile_${i}`);
      if (pFile instanceof File && pFile.size > 0) {
        const url = await storeUploadedFile(pFile, "projects");
        projectFileUrls.push(url);
      } else {
        projectFileUrls.push("");
      }
    }

    const registrationRecord = {
      ...parsed.data,
      children: children.map((c, i) => ({
        ...c,
        projectFileUrl: projectFileUrls[i] || null,
      })),
      receiptUrl,
      notificationEmail: NOTIFICATION_EMAIL,
      submittedAt: new Date().toISOString(),
    };

    const registration = await saveRegistration(registrationRecord);

    // Also trigger email notification if SMTP / Resend is configured
    await sendNotificationEmail(registrationRecord);

    return NextResponse.json(
      { message: "Registration received successfully.", id: registration.id },
      { status: 201 }
    );
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { message: "Something went wrong while saving your registration." },
      { status: 500 }
    );
  }
}

async function saveRegistration(data: Record<string, unknown>): Promise<{ id: string }> {
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

async function storeUploadedFile(file: File, folder: string = "uploads"): Promise<string> {
  const fs = await import("fs/promises");
  const path = await import("path");

  const targetDir = path.join(process.cwd(), "public", folder);
  await fs.mkdir(targetDir, { recursive: true });

  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
  const filePath = path.join(targetDir, safeName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  return `/${folder}/${safeName}`;
}

async function sendNotificationEmail(record: {
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  senderAccountName: string;
  totalAmountPaid: number;
  receiptUrl: string;
  children: { childName: string; age: number; school: string; categoryId: string; appIdea?: string }[];
  submittedAt: string;
}) {
  // If RESEND_API_KEY is configured in .env, we can send via Resend directly
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const emailBody = `
New Registration Received for Happy December Best Kids' Apps Challenge:

Parent / Guardian: ${record.parentName}
Phone: ${record.parentPhone}
Email: ${record.parentEmail}
Sender Bank Account: ${record.senderAccountName}
Total Paid: ₦${record.totalAmountPaid.toLocaleString()}
Receipt Link: ${record.receiptUrl}
Date: ${record.submittedAt}

Children:
${record.children
  .map(
    (c, i) =>
      `${i + 1}. ${c.childName} | Age: ${c.age} | Category: ${c.categoryId} | School: ${c.school} ${
        c.appIdea ? `\n   Idea: ${c.appIdea}` : ""
      }`
  )
  .join("\n")}
`;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "ThinkUp Registrations <onboarding@resend.dev>",
          to: NOTIFICATION_EMAIL,
          subject: `New Registration: ${record.parentName} (₦${record.totalAmountPaid.toLocaleString()})`,
          text: emailBody,
        }),
      });
    } catch (e) {
      console.warn("Failed sending email via Resend:", e);
    }
  }
}
