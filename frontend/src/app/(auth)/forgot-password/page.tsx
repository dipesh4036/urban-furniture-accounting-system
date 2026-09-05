"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword } from "@/features/auth/services/auth.service";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/features/auth/validators/auth.validator";

export default function ForgotPasswordPage() {
  // Once the email is submitted, we swap the form out for a "check your
  // email" message - the backend never tells us whether that email
  // actually has an account, so we always show the same success state.
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
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  if (submittedEmail) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          If an account exists for <span className="font-medium text-foreground">{submittedEmail}</span>, we&apos;ve
          sent a link to reset your password.
        </p>
        <Link href="/login" className="text-sm font-medium underline underline-offset-4">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold tracking-tight">Forgot your password?</h1>
        <p className="text-sm text-muted-foreground">Enter your email and we&apos;ll send you a reset link.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="h-10"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <Button type="submit" disabled={isSubmitting} className="h-10 mt-2">
          {isSubmitting ? "Sending..." : "Send reset link"}
        </Button>

        <Link href="/login" className="text-center text-sm font-medium underline underline-offset-4">
          Back to sign in
        </Link>
      </form>
    </div>
  );
}
