"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { 
  KeyRound, 
  Shield, 
  User, 
  Pencil,
  CheckCircle2, 
  XCircle
} from "lucide-react";
import { RequiredMark } from "@/components/common/RequiredMark";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { getFirstErrorField } from "@/lib/formErrors";
import { useUpdateUser } from "../hooks/useUsers";
import type { StaffUser } from "../services/users.service";
import { 
  staffRoles, 
  updateUserFormSchema, 
  type UpdateUserFormValues 
} from "../validators/users.validator";

const roleLabels: Record<UpdateUserFormValues["role"], string> = {
  ADMIN: "Administrator (Full Access)",
  ACCOUNTANT: "Accountant (Operational Access)",
};

interface EditUserDialogProps {
  user: StaffUser;
  trigger?: React.ReactElement;
}

export function EditUserDialog({ user, trigger }: EditUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const updateUser = useUpdateUser();

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserFormSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      password: "",
      confirmPassword: "",
    },
  });

  const firstErrorField = getFirstErrorField(errors);

  // Sync form when dialog opens or user changes
  useEffect(() => {
    if (open) {
      reset({
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        password: "",
        confirmPassword: "",
      });
      setShowPasswordFields(false);
    }
  }, [open, user, reset]);

  async function onSubmit(values: UpdateUserFormValues) {
    try {
      const payload = {
        name: values.name,
        email: values.email,
        role: values.role,
        isActive: values.isActive,
        ...(values.password && values.password.trim().length > 0
          ? { password: values.password, confirmPassword: values.confirmPassword }
          : {}),
      };

      await updateUser.mutateAsync({ id: user.id, input: payload });
      toast.success("User updated successfully");
      setOpen(false);
    } catch (error) {
      const code = error instanceof Error ? (error as Error & { code?: string }).code : undefined;
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";

      if (code === "EMAIL_TAKEN") {
        setError("email", { message });
      } else {
        toast.error(message);
      }
    }
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
      <Pencil className="size-3.5" />
      Edit
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger ?? defaultTrigger} />
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <User className="size-5 text-primary" />
            Edit Staff User
          </DialogTitle>
          <DialogDescription>
            Modify profile credentials, system access level, or account status for {user.name}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 flex flex-col gap-5">
          {/* User Identifier Banner */}
          <div className="rounded-lg border border-border/60 bg-muted/40 p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{user.name}</div>
                <div className="text-xs text-muted-foreground">
                  Login ID: <span className="font-mono font-medium text-foreground bg-muted px-1.5 py-0.5 rounded">@{user.loginId}</span>
                </div>
              </div>
            </div>
            <span className="text-xs text-muted-foreground font-medium italic">Fixed Identity</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-name">
                Full Name
                <RequiredMark />
              </Label>
              <Input
                id="edit-name"
                placeholder="e.g. Sarah Connor"
                aria-invalid={firstErrorField === "name"}
                {...register("name")}
              />
              {firstErrorField === "name" && errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-email">
                Email Address
                <RequiredMark />
              </Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="sconnor@company.com"
                aria-invalid={firstErrorField === "email"}
                {...register("email")}
              />
              {firstErrorField === "email" && errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* System Role */}
          <div className="flex flex-col gap-2 rounded-lg border border-border/60 p-3.5 bg-card">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                System Role &amp; Permissions
                <RequiredMark />
              </Label>
              <Shield className="size-4 text-muted-foreground" />
            </div>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex flex-col gap-2 pt-1"
                >
                  {staffRoles.map((role) => (
                    <label
                      key={role}
                      className="flex cursor-pointer items-center justify-between rounded-md border border-border/40 p-2.5 text-xs font-medium hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <RadioGroupItem value={role} />
                        <span className="font-semibold text-foreground">{roleLabels[role]}</span>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              )}
            />
            {firstErrorField === "role" && errors.role && (
              <p className="text-xs text-destructive">{errors.role.message}</p>
            )}
          </div>

          {/* Account Status */}
          <div className="flex flex-col gap-2 rounded-lg border border-border/60 p-3.5 bg-card">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Account Status
            </Label>
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => field.onChange(true)}
                    className={`flex items-center justify-center gap-2 rounded-md border p-2.5 text-xs font-medium transition-all ${
                      field.value
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                        : "border-border/50 text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <CheckCircle2 className="size-4" />
                    Active Account
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange(false)}
                    className={`flex items-center justify-center gap-2 rounded-md border p-2.5 text-xs font-medium transition-all ${
                      !field.value
                        ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold"
                        : "border-border/50 text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <XCircle className="size-4" />
                    Deactivated
                  </button>
                </div>
              )}
            />
          </div>

          {/* Password Reset Section (Optional) */}
          <div className="rounded-lg border border-border/60 p-3.5 bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="size-4 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Credentials &amp; Security
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowPasswordFields(!showPasswordFields)}
                className="h-7 text-xs font-medium text-primary hover:text-primary hover:bg-primary/10"
              >
                {showPasswordFields ? "Keep Current Password" : "Reset Password"}
              </Button>
            </div>

            {showPasswordFields && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-3 pt-3 border-t border-border/40 animate-in fade-in-50 duration-200">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-password">New Password</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    aria-invalid={firstErrorField === "password"}
                    {...register("password")}
                  />
                  {firstErrorField === "password" && errors.password && (
                    <p className="text-xs text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-confirmPassword">Confirm New Password</Label>
                  <Input
                    id="edit-confirmPassword"
                    type="password"
                    placeholder="Re-type new password"
                    autoComplete="new-password"
                    aria-invalid={firstErrorField === "confirmPassword"}
                    {...register("confirmPassword")}
                  />
                  {firstErrorField === "confirmPassword" && errors.confirmPassword && (
                    <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-2 pt-4 border-t border-border/40 flex flex-row items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={updateUser.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateUser.isPending}>
              {updateUser.isPending && <Spinner className="mr-2 size-4" />}
              {updateUser.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
