"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Building, Eye, EyeOff, Lock, Mail, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { contactLogin } from "@/features/auth/services/auth.service";
import { contactLoginSchema, type ContactLoginFormValues } from "@/features/auth/validators/auth.validator";

export default function ContactLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactLoginFormValues>({
    resolver: zodResolver(contactLoginSchema),
  });

  async function onSubmit(values: ContactLoginFormValues) {
    try {
      await contactLogin(values);
      toast.success("Signed in to portal");
      router.push("/portal/invoices");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid credentials. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-1.5 w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Users className="size-3" />
          <span>Customer & Vendor Access</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Portal Sign In</h1>
        <p className="text-sm text-muted-foreground">
          View your issued invoices, track sales & purchases, and manage vendor billing.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Email Field */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
            Email Address
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

        {/* Password Field */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
            Password
          </Label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Lock className="size-4" />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              className="h-11 pl-9 pr-10 rounded-lg border-input bg-background/50 focus-visible:ring-2 focus-visible:ring-primary/30"
              aria-invalid={!!errors.password}
              {...register("password")}
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
          {errors.password && (
            <p className="text-xs font-medium text-destructive flex items-center gap-1 mt-0.5">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember me & Forgot password row */}
        <div className="flex items-center justify-between pt-0.5">
          <label
            htmlFor="rememberMePortal"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer select-none"
          >
            <input
              id="rememberMePortal"
              type="checkbox"
              className="size-3.5 rounded border-input text-primary focus:ring-2 focus:ring-primary/30 accent-primary cursor-pointer"
            />
            <span>Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-primary hover:underline underline-offset-4 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 mt-2 w-full font-medium text-sm rounded-lg shadow-sm gap-2 transition-all"
        >
          {isSubmitting ? (
            <>
              <Spinner className="size-4" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign in to Portal</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      <div className="relative my-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground font-medium">Staff Access</span>
        </div>
      </div>

      <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 flex items-center justify-between text-xs transition-colors hover:bg-muted/50">
        <div className="flex items-center gap-2.5">
          <Building className="size-4 text-muted-foreground shrink-0" />
          <div className="text-muted-foreground">
            Internal Staff or Accountant?{" "}
            <Link
              href="/login"
              className="font-semibold text-foreground hover:text-primary transition-colors underline underline-offset-4"
            >
              Staff Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

