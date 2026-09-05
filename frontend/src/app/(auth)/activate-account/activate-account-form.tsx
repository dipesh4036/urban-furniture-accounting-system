"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { activateAccount } from "@/features/auth/services/auth.service";
import { activateAccountSchema, type ActivateAccountFormValues } from "@/features/auth/validators/auth.validator";

export function ActivateAccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ActivateAccountFormValues>({
    resolver: zodResolver(activateAccountSchema),
  });

  async function onSubmit(values: ActivateAccountFormValues) {
    if (!token) {
      toast.error("This activation link is missing its token. Please request a new one.");
      return;
    }

    try {
      await activateAccount(token, values.newPassword);
      toast.success("Account activated. Please sign in.");
      router.push("/portal/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  // No token in the URL at all - this link was opened wrong, so don't
  // even show the form.
  if (!token) {
    return (
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Invalid activation link</h1>
        <p className="text-sm text-muted-foreground">
          This link is missing its token. Please contact Urban Furniture to get a new invitation.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold tracking-tight">Activate your account</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="newPassword">Password</Label>
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            className="h-10"
            aria-invalid={!!errors.newPassword}
            {...register("newPassword")}
          />
          {errors.newPassword && <p className="text-sm text-destructive">{errors.newPassword.message}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword">Re-enter password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="h-10"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" disabled={isSubmitting} className="h-10 mt-2">
          {isSubmitting ? "Activating..." : "Activate account"}
        </Button>
      </form>
    </div>
  );
}
