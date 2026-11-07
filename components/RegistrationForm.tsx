"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { CATEGORIES } from "@/lib/content";
import PaymentGate, { PaidBadge } from "./PaymentGate";

const schema = z
  .object({
    parentName: z.string().min(2, "Enter the parent/guardian's full name"),
    parentPhone: z.string().min(7, "Enter a valid phone number"),
    parentEmail: z.string().email("Enter a valid email address"),
    childName: z.string().min(2, "Enter the child's full name"),
    dob: z.string().min(1, "Select a date of birth"),
    age: z.coerce.number().int().min(1).max(19, "Age must be 19 or under"),
    school: z.string().min(2, "Enter the school name"),
    category: z.string().min(1, "Select an age category"),
    appIdea: z.string().optional(),
    consent: z.boolean().refine((v) => v, "Consent is required"),
    privacy: z.boolean().refine((v) => v, "You must agree to the privacy policy"),
  })
  .required({
    parentName: true,
    parentPhone: true,
    parentEmail: true,
    childName: true,
    dob: true,
    age: true,
    school: true,
    category: true,
    consent: true,
    privacy: true,
  });

type FormValues = z.infer<typeof schema>;

interface PaymentInfo {
  reference: string;
  category: string;
  email: string;
  fee: number;
}

export default function RegistrationForm() {
  const [payment, setPayment] = useState<PaymentInfo | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [serverError, setServerError] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const selectedCategory = CATEGORIES.find((c) => c.id === payment?.category);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      parentName: "",
      parentPhone: "",
      parentEmail: "",
      childName: "",
      dob: "",
      school: "",
      category: "",
      appIdea: "",
      consent: false,
      privacy: false,
    },
  });

  function handlePaid(info: PaymentInfo) {
    setPayment(info);
    setValue("parentEmail", info.email);
    const cat = CATEGORIES.find((c) => c.id === info.category);
    if (cat) setValue("category", `Ages ${cat.range}`);
  }

  async function onSubmit(values: FormValues) {
    if (!payment) {
      setStatus("error");
      setServerError("Please complete payment before submitting.");
      return;
    }

    setStatus("loading");
    setServerError("");
    try {
      const body = new FormData();
      Object.entries(values).forEach(([k, v]) => body.append(k, String(v)));
      body.append("paymentReference", payment.reference);
      body.append("amountPaid", String(payment.fee));
      if (file) body.append("projectFile", file);

      const res = await fetch("/api/register", { method: "POST", body });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Registration failed. Please try again.");
      }

      setStatus("success");
      reset();
      setFile(null);
    } catch (err) {
      setStatus("error");
      setServerError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const inputCls =
    "w-full border-b border-ink/20 bg-transparent px-0 py-3 text-ink placeholder:text-ink/35 focus:outline-none focus:border-signal transition-colors";

  return (
    <section id="register" className="py-20 lg:py-28 bg-white border-t border-ink/10">
      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <p className="text-xs font-mono text-signal mb-4">REGISTRATION</p>
        <h2 className="font-display text-4xl sm:text-5xl font-semibold text-ink leading-tight mb-3">
          Secure your child&rsquo;s spot.
        </h2>
        <p className="text-ink/60 mb-12">
          Pay the registration fee, then fill in your child&rsquo;s details.
        </p>

        {!payment ? (
          <PaymentGate onPaid={handlePaid} />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-14">
            <PaidBadge reference={payment.reference} fee={payment.fee} />

            <fieldset>
              <legend className="font-mono text-xs text-ink/40 mb-6">01 &mdash; PARENT / GUARDIAN</legend>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <input placeholder="Full name" className={inputCls} {...register("parentName")} />
                  {errors.parentName && <ErrorText text={errors.parentName.message} />}
                </div>
                <div>
                  <input placeholder="Phone number" className={inputCls} {...register("parentPhone")} />
                  {errors.parentPhone && <ErrorText text={errors.parentPhone.message} />}
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="email"
                    placeholder="Email address"
                    className={inputCls}
                    readOnly
                    {...register("parentEmail")}
                  />
                  {errors.parentEmail && <ErrorText text={errors.parentEmail.message} />}
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend className="font-mono text-xs text-ink/40 mb-6">02 &mdash; CHILD</legend>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                <div className="sm:col-span-2">
                  <input placeholder="Child's full name" className={inputCls} {...register("childName")} />
                  {errors.childName && <ErrorText text={errors.childName.message} />}
                </div>
                <div>
                  <label className="text-xs text-ink/40 block mb-1">Date of birth</label>
                  <input type="date" className={inputCls} {...register("dob")} />
                  {errors.dob && <ErrorText text={errors.dob.message} />}
                </div>
                <div>
                  <input type="number" min={1} max={19} placeholder="Age" className={inputCls} {...register("age")} />
                  {errors.age && <ErrorText text={errors.age.message} />}
                </div>
                <div>
                  <input placeholder="School name" className={inputCls} {...register("school")} />
                  {errors.school && <ErrorText text={errors.school.message} />}
                </div>
                <div>
                  <input className={`${inputCls} text-ink/60`} readOnly {...register("category")} />
                  <p className="text-xs text-ink/40 mt-1">
                    Category locked to what you paid for ({selectedCategory ? `Ages ${selectedCategory.range}` : ""})
                  </p>
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend className="font-mono text-xs text-ink/40 mb-6">03 &mdash; PROJECT (OPTIONAL)</legend>
              <textarea
                placeholder="Describe the app idea or project"
                rows={3}
                className={inputCls}
                {...register("appIdea")}
              />
              <label className="mt-6 flex items-center gap-3 border border-dashed border-ink/25 px-4 py-3 text-sm text-ink/60 cursor-pointer hover:border-signal transition-colors">
                <Upload className="w-4 h-4 shrink-0" />
                {file ? file.name : "Upload a project file"}
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </fieldset>

            <fieldset className="space-y-4">
              <label className="flex items-start gap-3 text-sm text-ink/70">
                <input type="checkbox" className="mt-1 accent-signal" {...register("consent")} />
                I am the parent/guardian and consent to my child&rsquo;s participation.
              </label>
              {errors.consent && <ErrorText text={errors.consent.message} />}

              <label className="flex items-start gap-3 text-sm text-ink/70">
                <input type="checkbox" className="mt-1 accent-signal" {...register("privacy")} />
                I agree to the <a href="#" className="text-signal underline">privacy policy</a>.
              </label>
              {errors.privacy && <ErrorText text={errors.privacy.message} />}
            </fieldset>

            {status === "error" && (
              <div className="flex items-center gap-2 text-sm text-signal-dark bg-signal-tint px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0" /> {serverError}
              </div>
            )}
            {status === "success" && (
              <div className="flex items-center gap-2 text-sm text-ink bg-signal-tint px-4 py-3">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-signal" />
                Registration received. We&rsquo;ll be in touch soon.
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-ink hover:bg-signal disabled:opacity-60 text-white font-semibold py-4 transition-colors focus-ring"
            >
              {status === "loading" ? "Submitting…" : "Submit registration"}
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
