"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { RequiredMark } from "@/components/common/RequiredMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useCreateUser } from "../hooks/useUsers";
import { createUserFormSchema, staffRoles, type CreateUserFormValues } from "../validators/users.validator";

const roleLabels: Record<CreateUserFormValues["role"], string> = {
  ADMIN: "Admin",
  ACCOUNTANT: "Accountant",
};

interface CreateUserFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  inDialog?: boolean;
}

export function CreateUserForm({ onSuccess, onCancel, inDialog = false }: CreateUserFormProps = {}) {
  const createUser = useCreateUser();

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: {
      name: "",
      loginId: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "" as CreateUserFormValues["role"],
    },
  });

  async function onSubmit(values: CreateUserFormValues) {
    try {
      await createUser.mutateAsync(values);
      toast.success("User created successfully");
      reset();
      onSuccess?.();
    } catch (error) {
      const code = error instanceof Error ? (error as Error & { code?: string }).code : undefined;
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";

      if (code === "LOGIN_ID_TAKEN") {
        setError("loginId", { message });
      } else if (code === "EMAIL_TAKEN") {
        setError("email", { message });
      } else {
        toast.error(message);
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      autoComplete="off"
      className={cn("flex flex-col gap-5", !inDialog && "rounded-lg border p-6")}
    >
      {!inDialog && <h2 className="text-base font-semibold tracking-tight">Create Staff User</h2>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">
            Full Name
            <RequiredMark />
          </Label>
          <Input
            id="name"
            placeholder="e.g. Sarah Connor"
            autoComplete="off"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="loginId">
            Login ID / Username
            <RequiredMark />
          </Label>
          <Input
            id="loginId"
            placeholder="e.g. sconnor"
            autoComplete="off"
            aria-invalid={!!errors.loginId}
            {...register("loginId")}
          />
          {errors.loginId && <p className="text-xs text-destructive">{errors.loginId.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">
            Email Address
            <RequiredMark />
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="sconnor@company.com"
            autoComplete="off"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label>
            System Role
            <RequiredMark />
          </Label>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="flex items-center gap-6 pt-1"
              >
                {staffRoles.map((role) => (
                  <label key={role} className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                    <RadioGroupItem value={role} />
                    {roleLabels[role]}
                  </label>
                ))}
              </RadioGroup>
            )}
          />
          {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
        </div>
      </div>

      {/* Security Section */}
      <div className="flex flex-col gap-3 pt-2">
        <div className="border-t border-border/50 pt-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Account Security
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password">
              Password
              <RequiredMark />
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirmPassword">
              Confirm Password
              <RequiredMark />
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex items-center justify-end gap-2 pt-4",
          inDialog ? "mt-2 border-t border-border/40" : "self-start"
        )}
      >
        {inDialog && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={createUser.isPending}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={createUser.isPending}>
          {createUser.isPending && <Spinner className="mr-2 size-4" />}
          {createUser.isPending ? "Creating..." : "Create User"}
        </Button>
      </div>
    </form>
  );
}
