"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, Lock, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { resetPassword } from "@/features/auth/services/auth.service";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/features/auth/validators/auth.validator";
import { cn } from "@/lib/utils";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function onSubmit(values: ResetPasswordFormValues) {
    if (!token) {
      toast.error("This reset link is missing its token. Please request a new one.");
      return;
    }

    try {
      await resetPassword(token, values.newPassword);
      toast.success("Password reset successfully. Please sign in.");
      router.push("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  // Missing or invalid token view
  if (!token) {
    return (
      <div className="flex flex-col items-center text-center gap-6 py-4">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-8 ring-destructive/5">
          <ShieldAlert className="size-7" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Invalid reset link</h1>
          <p className="text-sm text-muted-foreground max-w-sm">
            This password reset link is missing its security token or has expired.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className={cn(buttonVariants({ variant: "default" }), "w-full h-11 text-sm font-medium gap-2")}
        >
          <ArrowLeft className="size-4" />
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to sign in</span>
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-1">
          <KeyRound className="size-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Set new password</h1>
        <p className="text-sm text-muted-foreground">
          Enter a strong password for your account (minimum 8 characters, uppercase, lowercase & special character).
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* New Password */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="newPassword" className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
            New Password
          </Label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Lock className="size-4" />
            </div>
            <Input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              className="h-11 pl-9 pr-10 rounded-lg border-input bg-background/50 focus-visible:ring-2 focus-visible:ring-primary/30"
              aria-invalid={!!errors.newPassword}
              {...register("newPassword")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-xs font-medium text-destructive flex items-center gap-1 mt-0.5">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
            Confirm Password
          </Label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Lock className="size-4" />
            </div>
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              className="h-11 pl-9 pr-10 rounded-lg border-input bg-background/50 focus-visible:ring-2 focus-visible:ring-primary/30"
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs font-medium text-destructive flex items-center gap-1 mt-0.5">
              {errors.confirmPassword.message}
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
              <span>Saving password...</span>
            </>
          ) : (
            <>
              <span>Reset password</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

