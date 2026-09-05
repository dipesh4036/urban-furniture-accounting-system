"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, User, ArrowRight, Sparkles, Building } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { login } from "@/features/auth/services/auth.service";
import { loginSchema, type LoginFormValues } from "@/features/auth/validators/auth.validator";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { isAuthenticated, isLoading: isCheckingSession } = useAuth();

  // Landing here with a session that's still valid (e.g. pressing Back
  // to a bfcache'd login page, then refreshing it) should skip straight
  // to the dashboard instead of showing the form again.
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      loginId: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    try {
      await login(values);
      toast.success("Signed in successfully");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid credentials. Please try again.");
    }
  }

  // Skip rendering the form while checking session or redirecting
  if (isCheckingSession || isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Spinner className="size-7 text-primary" />
        <p className="text-xs text-muted-foreground animate-pulse">Checking session...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace Login
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Enter your login ID and password to access your workspace.
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Login ID field */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="loginId" className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
            Login ID
          </Label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <User className="size-4" />
            </div>
            <Input
              id="loginId"
              type="text"
              placeholder="admin or username"
              autoComplete="username"
              className="h-11 pl-9 pr-3 rounded-lg border-input bg-background/50 focus-visible:ring-2 focus-visible:ring-primary/30"
              aria-invalid={!!errors.loginId}
              {...register("loginId")}
            />
          </div>
          {errors.loginId && (
            <p className="text-xs font-medium text-destructive flex items-center gap-1 mt-0.5">
              {errors.loginId.message}
            </p>
          )}
        </div>

        {/* Password field */}
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
            htmlFor="rememberMe"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer select-none"
          >
            <input
              id="rememberMe"
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

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 mt-2 w-full font-medium text-sm rounded-lg shadow-sm gap-2 transition-all cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Spinner className="size-4" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign in</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      {/* Customer & Vendor Portal Callout */}
      <div className="relative my-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground font-medium">Or</span>
        </div>
      </div>

      <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 flex items-center justify-between text-xs transition-colors hover:bg-muted/50">
        <div className="flex items-center gap-2.5">
          <Building className="size-4 text-muted-foreground shrink-0" />
          <div className="text-muted-foreground">
            Customer or Vendor?{" "}
            <Link
              href="/portal/login"
              className="font-semibold text-foreground hover:text-primary transition-colors underline underline-offset-4"
            >
              Sign in to Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

