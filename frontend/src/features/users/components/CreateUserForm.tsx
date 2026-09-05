"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { RequiredMark } from "@/components/common/RequiredMark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCreateUser } from "../hooks/useUsers";
import { createUserFormSchema, staffRoles, type CreateUserFormValues } from "../validators/users.validator";

const roleLabels: Record<CreateUserFormValues["role"], string> = {
  ADMIN: "Admin",
  ACCOUNTANT: "Accountant",
};

export function CreateUserForm() {
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
    // The radio group must start with a defined value (empty string, not
    // undefined) or base-ui logs a "switching from uncontrolled to
    // controlled" warning the moment a role gets picked. "" isn't a
    // valid role, so it still fails Zod validation on submit until the
    // user actually picks one - it's just a placeholder starting value.
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
      toast.success("User created");
      reset();
    } catch (error) {
      // The backend tells us exactly which field collided via `code` -
      // LOGIN_ID_TAKEN or EMAIL_TAKEN - so we can show it right under
      // that field instead of just a generic toast.
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
    <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="flex flex-col gap-4 rounded-lg border p-6">
      <h2 className="text-sm font-semibold">Create User</h2>

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">
          Name
          <RequiredMark />
        </Label>
        <Input id="name" autoComplete="off" aria-invalid={!!errors.name} {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="loginId">
          Login Id
          <RequiredMark />
        </Label>
        <Input id="loginId" autoComplete="off" aria-invalid={!!errors.loginId} {...register("loginId")} />
        {errors.loginId && <p className="text-sm text-destructive">{errors.loginId.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">
          Email
          <RequiredMark />
        </Label>
        <Input id="email" type="email" autoComplete="off" aria-invalid={!!errors.email} {...register("email")} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label>
          Role
          <RequiredMark />
        </Label>
        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-6">
              {staffRoles.map((role) => (
                <label key={role} className="flex items-center gap-2 text-sm font-normal">
                  <RadioGroupItem value={role} />
                  {roleLabels[role]}
                </label>
              ))}
            </RadioGroup>
          )}
        />
        {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">
            Password
            <RequiredMark />
          </Label>
          <Input id="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword">
            Re-enter Password
            <RequiredMark />
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
        </div>
      </div>

      <Button type="submit" disabled={createUser.isPending} className="mt-2 self-start">
        {createUser.isPending ? "Creating..." : "Create User"}
      </Button>
    </form>
  );
}
