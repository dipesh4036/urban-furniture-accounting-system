"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Mail, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { forgotPassword } from "@/features/auth/services/auth.service";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/features/auth/validators/auth.validator";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
  // Once the email is submitted successfully, we swap the form out for a
  // "check your email" message.
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    try {
      await forgotPassword(values.email);
      setSubmittedEmail(values.email);
      toast.success("Reset instructions sent to your email");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  // Success State: Check your email view
  if (submittedEmail) {
    return (
      <div className="flex flex-col items-center text-center gap-6 py-2">
        {/* Animated Icon Badge */}
        <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-8 ring-emerald-500/5">
          <CheckCircle2 className="size-8" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Check your email</h1>
          <p className="text-sm text-muted-foreground max-w-sm">
            We&apos;ve sent a password reset link to{" "}
            <span className="font-semibold text-foreground break-all">{submittedEmail}</span>
          </p>
        </div>

        {/* Helpful Tips Box */}
        <div className="w-full rounded-xl border border-border bg-muted/30 p-4 text-xs text-muted-foreground text-left space-y-1.5">
          <p className="font-semibold text-foreground">Didn&apos;t receive the email?</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Check your spam or junk mail folder</li>
            <li>Ensure the email matches your account record</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={() => setSubmittedEmail(null)}
            className="w-full h-10 gap-2 text-xs font-medium cursor-pointer"
          >
            <RefreshCw className="size-3.5" />
            Try another email
          </Button>

          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "default" }), "w-full h-11 text-sm font-medium gap-2")}
          >
            <ArrowLeft className="size-4" />
            Return to sign in
          </Link>
        </div>
      </div>
    );
  }

  // Default Form State
  return (
    <div className="flex flex-col gap-6">
      {/* Back to sign in link */}
      <div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to sign in</span>
        </Link>
      </div>

      {/* Header & Icon */}
      <div className="flex flex-col gap-2">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-1">
          <KeyRound className="size-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Forgot your password?</h1>
        <p className="text-sm text-muted-foreground">
          Enter your registered email address and we&apos;ll send you instructions to reset your password.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
            Registered Email Address
          </Label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Mail className="size-4" />
            </div>
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              autoComplete="email"
              className="h-11 pl-9 pr-3 rounded-lg border-input bg-background/50 focus-visible:ring-2 focus-visible:ring-primary/30"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-xs font-medium text-destructive flex items-center gap-1 mt-0.5">
              {errors.email.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 mt-2 w-full font-medium text-sm rounded-lg shadow-sm gap-2 transition-all"
        >
          {isSubmitting ? (
            <>
              <Spinner className="size-4" />
              <span>Sending instructions...</span>
            </>
          ) : (
            <>
              <span>Send reset link</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

