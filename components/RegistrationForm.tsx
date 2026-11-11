"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, CheckCircle2, AlertCircle, Plus, Trash2, MessageCircle } from "lucide-react";
import { CATEGORIES, NOTIFICATION_WHATSAPP } from "@/lib/content";
import BankTransferGate from "./BankTransferGate";

const childSchema = z.object({
  childName: z.string().min(2, "Enter the child's full name"),
  dob: z.string().min(1, "Select date of birth"),
  age: z.coerce.number().int().min(1, "Must be at least 1").max(19, "Age must be 19 or under"),
  school: z.string().min(2, "Enter the school name"),
  categoryId: z.enum(["2-5", "6-8", "9-12", "13-19"], {
    errorMap: () => ({ message: "Select an age category" }),
  }),
  appIdea: z.string().optional(),
});

const schema = z.object({
  parentName: z.string().min(2, "Enter the parent/guardian's full name"),
  parentPhone: z.string().min(7, "Enter a valid phone number"),
  parentEmail: z.string().email("Enter a valid email address"),
  children: z.array(childSchema).min(1, "At least one child is required"),
  senderAccountName: z.string().min(2, "Enter the sender / bank account name transferred from"),
  consent: z.boolean().refine((v) => v, "Consent is required"),
  privacy: z.boolean().refine((v) => v, "You must agree to the privacy policy"),
});

type FormValues = z.infer<typeof schema>;

export default function RegistrationForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [serverError, setServerError] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [projectFiles, setProjectFiles] = useState<Record<number, File | null>>({});
  const [submittedData, setSubmittedData] = useState<{
    parentName: string;
    parentPhone: string;
    childrenSummary: string;
    totalAmount: number;
    senderName: string;
  } | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      parentName: "",
      parentPhone: "",
      parentEmail: "",
      senderAccountName: "",
      children: [
        {
          childName: "",
          dob: "",
          age: "" as unknown as number,
          school: "",
          categoryId: "6-8",
          appIdea: "",
        },
      ],
      consent: false,
      privacy: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "children",
  });

  const watchedChildren = watch("children");

  // Calculate total fee live based on categories chosen for each child
  const totalFee = (watchedChildren || []).reduce((acc, c) => {
    const cat = CATEGORIES.find((item) => item.id === c?.categoryId);
    return acc + (cat ? cat.fee : 0);
  }, 0);

  async function onSubmit(values: FormValues) {
    if (!receiptFile) {
      setStatus("error");
      setServerError("Please upload your payment receipt / transfer proof.");
      return;
    }

    setStatus("loading");
    setServerError("");
    try {
      const body = new FormData();
      body.append("parentName", values.parentName);
      body.append("parentPhone", values.parentPhone);
      body.append("parentEmail", values.parentEmail);
      body.append("senderAccountName", values.senderAccountName);
      body.append("consent", String(values.consent));
      body.append("privacy", String(values.privacy));
      body.append("totalAmountPaid", String(totalFee));
      body.append("children", JSON.stringify(values.children));
      body.append("paymentReceipt", receiptFile);

      // Append project files if any
      Object.entries(projectFiles).forEach(([idx, pFile]) => {
        if (pFile) {
          body.append(`projectFile_${idx}`, pFile);
        }
      });

      const res = await fetch("/api/register", { method: "POST", body });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Registration failed. Please try again.");
      }

      const summary = values.children
        .map((c, i) => {
          const cat = CATEGORIES.find((k) => k.id === c.categoryId);
          return `${i + 1}. ${c.childName} (Age ${c.age}, ${cat?.label} - Ages ${cat?.range})`;
        })
        .join("\n");

      setSubmittedData({
        parentName: values.parentName,
        parentPhone: values.parentPhone,
        childrenSummary: summary,
        totalAmount: totalFee,
        senderName: values.senderAccountName,
      });

      setStatus("success");
      reset();
      setReceiptFile(null);
      setProjectFiles({});
    } catch (err) {
      setStatus("error");
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const inputCls =
    "w-full border-b border-ink/20 bg-transparent px-0 py-3 text-ink placeholder:text-ink/35 focus:outline-none focus:border-signal transition-colors";

  function buildWhatsAppUrl() {
    if (!submittedData) return "#";
    const text = `*NEW REGISTRATION — HAPPY DECEMBER CHALLENGE*
*Parent Name:* ${submittedData.parentName}
*Phone:* ${submittedData.parentPhone}
*Sender Account:* ${submittedData.senderName}
*Total Paid:* ₦${submittedData.totalAmount.toLocaleString()}

*Participants (${fields.length}):*
${submittedData.childrenSummary}

I have submitted on the website and attached my bank payment confirmation.`;

    return `https://wa.me/${NOTIFICATION_WHATSAPP}?text=${encodeURIComponent(text)}`;
  }

  return (
    <section id="register" className="py-20 lg:py-28 bg-white border-t border-ink/10">
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <p className="text-xs font-mono text-signal mb-4">REGISTRATION</p>
        <h2 className="font-display text-4xl sm:text-5xl font-semibold text-ink leading-tight mb-3">
          Secure your child&rsquo;s spot.
        </h2>
        <p className="text-ink/60 mb-10">
          Complete the 3 simple steps below to register your child or children.
        </p>

        {status === "success" && submittedData ? (
          <div className="border border-signal/20 bg-signal-tint p-6 sm:p-10 space-y-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-signal shrink-0" />
              <div>
                <h3 className="font-display text-2xl font-bold text-ink">Registration Received!</h3>
                <p className="text-sm text-ink/70">
                  Your details and payment receipt have been submitted to ThinkUp.
                </p>
              </div>
            </div>

            <div className="bg-white border border-ink/10 p-5 space-y-2 text-sm text-ink/80">
              <p>
                <strong>Parent / Guardian:</strong> {submittedData.parentName} ({submittedData.parentPhone})
              </p>
              <p>
                <strong>Sender Name:</strong> {submittedData.senderName}
              </p>
              <p>
                <strong>Total Amount:</strong> ₦{submittedData.totalAmount.toLocaleString()}
              </p>
              <div className="mt-2 pt-2 border-t border-ink/10">
                <strong className="block mb-1">Registered Children:</strong>
                <pre className="whitespace-pre-wrap font-sans text-xs text-ink/70">
                  {submittedData.childrenSummary}
                </pre>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-3 w-full bg-signal hover:bg-signal-dark text-white font-semibold py-4 px-6 transition-colors focus-ring"
              >
                <MessageCircle className="w-5 h-5 shrink-0" />
                Notify Us Instantly on WhatsApp
              </a>
              <button
                type="button"
                onClick={() => {
                  setStatus("idle");
                  setSubmittedData(null);
                }}
                className="w-full text-center text-xs text-ink/50 hover:text-ink mt-3 underline"
              >
                Register another person / family
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-14">
            {/* STEP 1: PARENT / GUARDIAN */}
            <fieldset>
              <legend className="font-mono text-xs text-ink/40 mb-6">
                STEP 1 &mdash; PARENT / GUARDIAN DETAILS
              </legend>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <input
                    placeholder="Parent / Guardian Full Name"
                    className={inputCls}
                    {...register("parentName")}
                  />
                  {errors.parentName && <ErrorText text={errors.parentName.message} />}
                </div>
                <div>
                  <input
                    placeholder="Phone number"
                    className={inputCls}
                    {...register("parentPhone")}
                  />
                  {errors.parentPhone && <ErrorText text={errors.parentPhone.message} />}
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="email"
                    placeholder="Email address"
                    className={inputCls}
                    {...register("parentEmail")}
                  />
                  {errors.parentEmail && <ErrorText text={errors.parentEmail.message} />}
                </div>
              </div>
            </fieldset>

            {/* STEP 2: PARTICIPANT DETAILS */}
            <fieldset className="space-y-8">
              <div className="flex items-center justify-between border-b border-ink/10 pb-3">
                <legend className="font-mono text-xs text-ink/40">
                  STEP 2 &mdash; PARTICIPANT DETAILS ({fields.length} {fields.length === 1 ? "CHILD" : "CHILDREN"})
                </legend>
                <button
                  type="button"
                  onClick={() =>
                    append({
                      childName: "",
                      dob: "",
                      age: "" as unknown as number,
                      school: "",
                      categoryId: "6-8",
                      appIdea: "",
                    })
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-signal hover:underline focus-ring"
                >
                  <Plus className="w-3.5 h-3.5" /> Add another child
                </button>
              </div>

              {fields.map((field, index) => {
                const childCat = CATEGORIES.find(
                  (c) => c.id === watchedChildren?.[index]?.categoryId
                );
                return (
                  <div
                    key={field.id}
                    className="border border-ink/15 p-5 sm:p-6 bg-white space-y-6 relative"
                  >
                    <div className="flex items-center justify-between border-b border-ink/10 pb-3">
                      <span className="font-mono text-xs font-semibold text-signal">
                        CHILD {String(index + 1).padStart(2, "0")}
                      </span>
                      {fields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-xs text-ink/40 hover:text-signal flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                      <div className="sm:col-span-2">
                        <input
                          placeholder="Child's full name"
                          className={inputCls}
                          {...register(`children.${index}.childName` as const)}
                        />
                        {errors.children?.[index]?.childName && (
                          <ErrorText text={errors.children[index]?.childName?.message} />
                        )}
                      </div>

                      <div>
                        <label className="text-xs text-ink/40 block mb-1">Date of birth</label>
                        <input
                          type="date"
                          className={inputCls}
                          {...register(`children.${index}.dob` as const)}
                        />
                        {errors.children?.[index]?.dob && (
                          <ErrorText text={errors.children[index]?.dob?.message} />
                        )}
                      </div>

                      <div>
                        <label className="text-xs text-ink/40 block mb-1">Age</label>
                        <input
                          type="number"
                          min={1}
                          max={19}
                          placeholder="Age (2 - 19)"
                          className={inputCls}
                          {...register(`children.${index}.age` as const)}
                        />
                        {errors.children?.[index]?.age && (
                          <ErrorText text={errors.children[index]?.age?.message} />
                        )}
                      </div>

                      <div>
                        <input
                          placeholder="School name"
                          className={inputCls}
                          {...register(`children.${index}.school` as const)}
                        />
                        {errors.children?.[index]?.school && (
                          <ErrorText text={errors.children[index]?.school?.message} />
                        )}
                      </div>

                      <div>
                        <label className="text-xs text-ink/40 block mb-1">Age Category</label>
                        <select
                          className={`${inputCls} cursor-pointer bg-white`}
                          {...register(`children.${index}.categoryId` as const)}
                        >
                          {CATEGORIES.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              Ages {cat.range} — {cat.label} (₦{cat.fee.toLocaleString()})
                            </option>
                          ))}
                        </select>
                        {errors.children?.[index]?.categoryId && (
                          <ErrorText text={errors.children[index]?.categoryId?.message} />
                        )}
                        {childCat && (
                          <p className="text-[11px] text-ink/50 mt-1">
                            {childCat.perk} &bull; Fee: ₦{childCat.fee.toLocaleString()}
                          </p>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <textarea
                          placeholder="Describe their app idea or project (optional)"
                          rows={2}
                          className={inputCls}
                          {...register(`children.${index}.appIdea` as const)}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="flex items-center gap-3 border border-dashed border-ink/25 px-4 py-2.5 text-xs text-ink/60 cursor-pointer hover:border-signal transition-colors">
                          <Upload className="w-4 h-4 shrink-0" />
                          {projectFiles[index] ? projectFiles[index]?.name : "Upload project file / slides (optional)"}
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0] ?? null;
                              setProjectFiles((prev) => ({ ...prev, [index]: f }));
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() =>
                  append({
                    childName: "",
                    dob: "",
                    age: "" as unknown as number,
                    school: "",
                    categoryId: "6-8",
                    appIdea: "",
                  })
                }
                className="w-full py-3 border border-dashed border-ink/30 text-xs font-semibold text-ink/70 hover:text-signal hover:border-signal flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add another child to this registration
              </button>
            </fieldset>

            {/* STEP 3: PAYMENT & CONFIRMATION */}
            <fieldset className="space-y-8">
              <legend className="font-mono text-xs text-ink/40">
                STEP 3 &mdash; PAYMENT &amp; CONFIRMATION
              </legend>

              {/* Bank details card with calculated total fee */}
              <BankTransferGate totalFee={totalFee} childCount={fields.length} />

              <div className="space-y-6 pt-2">
                <div>
                  <label className="block text-xs text-ink/60 mb-2 font-medium">
                    Sender / Account Name used for transfer *
                  </label>
                  <input
                    placeholder="Enter the bank account name transferred from"
                    className={inputCls}
                    {...register("senderAccountName")}
                  />
                  {errors.senderAccountName && (
                    <ErrorText text={errors.senderAccountName.message} />
                  )}
                  <p className="text-xs text-ink/40 mt-1">
                    The name on the bank account you sent the transfer from so we can confirm it quickly.
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-ink/60 mb-2 font-medium">
                    Upload Bank Transfer Receipt / Screenshot *
                  </label>
                  <label className="flex items-center gap-3 border-2 border-dashed border-ink/30 px-5 py-4 text-sm text-ink/70 cursor-pointer hover:border-signal transition-colors bg-white">
                    <Upload className="w-5 h-5 shrink-0 text-signal" />
                    <span className="font-medium">
                      {receiptFile ? receiptFile.name : "Click to upload transfer receipt (PNG, JPG, PDF)"}
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {!receiptFile && status === "error" && (
                    <ErrorText text="Payment proof receipt is required." />
                  )}
                </div>
              </div>
            </fieldset>

            {/* Consent & privacy */}
            <fieldset className="space-y-4 pt-4 border-t border-ink/10">
              <label className="flex items-start gap-3 text-sm text-ink/70">
                <input type="checkbox" className="mt-1 accent-signal" {...register("consent")} />
                I am the parent/guardian and consent to my child&rsquo;s / children&rsquo;s participation.
              </label>
              {errors.consent && <ErrorText text={errors.consent.message} />}

              <label className="flex items-start gap-3 text-sm text-ink/70">
                <input type="checkbox" className="mt-1 accent-signal" {...register("privacy")} />
                I agree to the{" "}
                <a href="#" className="text-signal underline">
                  privacy policy
                </a>
                .
              </label>
              {errors.privacy && <ErrorText text={errors.privacy.message} />}
            </fieldset>

            {status === "error" && (
              <div className="flex items-center gap-2 text-sm text-signal-dark bg-signal-tint px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0" /> {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-ink hover:bg-signal disabled:opacity-60 text-white font-semibold py-4 transition-colors focus-ring"
            >
              {status === "loading" ? "Submitting registration…" : `Submit registration (₦${totalFee.toLocaleString()})`}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function ErrorText({ text }: { text?: string }) {
  if (!text) return null;
  return <p className="text-xs text-signal mt-1.5">{text}</p>;
}
