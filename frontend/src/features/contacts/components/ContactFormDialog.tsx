"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { RequiredMark } from "@/components/common/RequiredMark";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { uploadFile } from "@/features/uploads/services/uploads.service";
import { toFileUrl } from "@/lib/api";
import { useCreateContact, useUpdateContact } from "../hooks/useContacts";
import type { Contact } from "../services/contacts.service";
import { contactFormSchema, contactTypes, type ContactFormValues, type ContactTypeOption } from "../validators/contacts.validator";

const contactTypeLabels: Record<ContactTypeOption, string> = {
  CUSTOMER: "Customer",
  VENDOR: "Vendor",
  BOTH: "Both",
};

interface ContactFormDialogProps {
  // Pass a contact to edit it. Leave it out to create a new one.
  contact?: Contact;
  // The element that opens the dialog when clicked (e.g. a <Button>).
  // base-ui's DialogTrigger takes over this element's click behavior via
  // its `render` prop instead of Radix's `asChild` pattern.
  trigger: React.ReactElement;
}

function emptyValues(contact?: Contact): ContactFormValues {
  return {
    name: contact?.name ?? "",
    type: contact?.type ?? ("" as ContactTypeOption),
    email: contact?.email ?? "",
    mobile: contact?.mobile ?? "",
    city: contact?.city ?? "",
    state: contact?.state ?? "",
    pincode: contact?.pincode ?? "",
    profileImage: contact?.profileImage ?? undefined,
  };
}

export function ContactFormDialog({ contact, trigger }: ContactFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const isEditing = !!contact;

  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const isSaving = createContact.isPending || updateContact.isPending;

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    // The Select needs a defined starting value (empty string, not
    // undefined) or base-ui logs a "switching from uncontrolled to
    // controlled" warning the moment a real type gets picked.
    defaultValues: emptyValues(contact),
  });

  const profileImage = useWatch({ control, name: "profileImage" });

  // Reset the form back to this contact's values (or blank, for create)
  // every time the dialog opens - otherwise a previously edited contact's
  // leftover values could show up when creating a new one.
  useEffect(() => {
    if (open) {
      reset(emptyValues(contact));
    }
  }, [open, contact, reset]);

  // Uploads the chosen file to the backend (saved to disk there - see
  // POST /uploads) and stores the path it comes back with. The image
  // itself never touches the contact form's own request body.
  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { url } = await uploadFile(file);
      setValue("profileImage", url, { shouldValidate: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  async function onSubmit(values: ContactFormValues) {
    try {
      if (isEditing) {
        await updateContact.mutateAsync({ id: contact.id, input: values });
        toast.success("Contact updated");
      } else {
        await createContact.mutateAsync(values);
        toast.success("Contact created. An activation email has been sent.");
      }
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit contact" : "New contact"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            {profileImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={toFileUrl(profileImage)} alt="Profile preview" className="size-16 rounded-full object-cover" />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
                {isUploading ? "..." : "No photo"}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="profileImage">Profile Image</Label>
              <Input
                id="profileImage"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
                className="h-auto"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">
              Name
              <RequiredMark />
            </Label>
            <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="type">
              Type
              <RequiredMark />
            </Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="type" className="w-full" aria-invalid={!!errors.type}>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {contactTypeLabels[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">
              Email
              <RequiredMark />
            </Label>
            <Input id="email" type="email" aria-invalid={!!errors.email} {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="mobile">
              Mobile
              <RequiredMark />
            </Label>
            <Input id="mobile" type="tel" aria-invalid={!!errors.mobile} {...register("mobile")} />
            {errors.mobile && <p className="text-sm text-destructive">{errors.mobile.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="city">
                City
                <RequiredMark />
              </Label>
              <Input id="city" aria-invalid={!!errors.city} {...register("city")} />
              {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="state">
                State
                <RequiredMark />
              </Label>
              <Input id="state" aria-invalid={!!errors.state} {...register("state")} />
              {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="pincode">
                Pincode
                <RequiredMark />
              </Label>
              <Input id="pincode" aria-invalid={!!errors.pincode} {...register("pincode")} />
              {errors.pincode && <p className="text-sm text-destructive">{errors.pincode.message}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSaving || isUploading}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
