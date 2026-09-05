"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Camera, Trash2, User, Upload } from "lucide-react";
import { toast } from "sonner";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { uploadFile } from "@/features/uploads/services/uploads.service";
import { toFileUrl } from "@/lib/api";
import { useCreateContact, useUpdateContact } from "../hooks/useContacts";
import type { Contact } from "../services/contacts.service";
import {
  contactFormSchema,
  contactTypes,
  type ContactFormValues,
  type ContactTypeOption,
} from "../validators/contacts.validator";

const contactTypeLabels: Record<ContactTypeOption, string> = {
  CUSTOMER: "Customer",
  VENDOR: "Vendor",
  BOTH: "Both (Customer & Vendor)",
};

interface ContactFormDialogProps {
  // Pass a contact to edit it. Leave it out to create a new one.
  contact?: Contact;
  // The element that opens the dialog when clicked (e.g. a <Button>).
  trigger?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
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

export function ContactFormDialog({
  contact,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ContactFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (val: boolean) => {
    if (controlledOnOpenChange) controlledOnOpenChange(val);
    if (!isControlled) setInternalOpen(val);
  };
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    setError,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: emptyValues(contact),
  });

  const profileImage = useWatch({ control, name: "profileImage" });

  useEffect(() => {
    if (open) {
      reset(emptyValues(contact));
    }
  }, [open, contact, reset]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { url } = await uploadFile(file);
      setValue("profileImage", url, { shouldValidate: true });
      toast.success("Profile photo uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  function handleRemovePhoto() {
    setValue("profileImage", undefined, { shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function onSubmit(values: ContactFormValues) {
    try {
      if (isEditing) {
        await updateContact.mutateAsync({ id: contact.id, input: values });
        toast.success("Contact updated successfully");
      } else {
        await createContact.mutateAsync(values);
        toast.success("Contact created. An activation email has been sent.");
      }
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger} />}
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {isEditing ? "Edit Contact" : "New Contact"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update contact information, roles, and address details."
              : "Add a customer, vendor, or business partner to your system."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 flex flex-col gap-5">
          {/* Profile photo uploader */}
          <div className="flex items-center gap-4 rounded-lg border border-dashed border-border/80 p-3.5 bg-muted/20">
            <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-background shadow-xs">
              {profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={toFileUrl(profileImage)}
                  alt="Profile preview"
                  className="size-full object-cover"
                />
              ) : (
                <User className="size-8 text-muted-foreground/60" />
              )}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-xs">
                  <Spinner className="size-5 text-primary" />
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-1.5">
              <span className="text-xs font-medium text-foreground">Contact Photo</span>
              <p className="text-xs text-muted-foreground">
                Optional. PNG, JPG or WEBP (max. 5MB)
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="h-7 text-xs"
                >
                  <Camera className="mr-1.5 size-3.5" />
                  {profileImage ? "Change photo" : "Upload photo"}
                </Button>
                {profileImage && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isUploading}
                    onClick={handleRemovePhoto}
                    className="h-7 text-xs text-destructive hover:text-destructive"
                  >
                    <Trash2 className="mr-1 size-3.5" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Basic Identity: Name & Type */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">
                Full Name
                <RequiredMark />
              </Label>
              <Input
                id="name"
                placeholder="e.g. Acme Corp or John Doe"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="type">
                Contact Type
                <RequiredMark />
              </Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="type" className="w-full" aria-invalid={!!errors.type}>
                      <SelectValue placeholder="Select type" />
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
              {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
            </div>
          </div>

          {/* Communication: Email & Mobile */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">
                Email Address
                <RequiredMark />
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@company.com"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mobile">
                Mobile Number
                <RequiredMark />
              </Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="+1 555-0199"
                aria-invalid={!!errors.mobile}
                {...register("mobile")}
              />
              {errors.mobile ? (
                <p className="text-xs text-destructive">{errors.mobile.message}</p>
              ) : (
                <span className="text-[11px] text-muted-foreground">10-15 digits with country code</span>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center justify-between border-t border-border/50 pt-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Address Details
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="city">
                  City
                  <RequiredMark />
                </Label>
                <Input id="city" placeholder="e.g. New York" aria-invalid={!!errors.city} {...register("city")} />
                {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="state">
                  State
                  <RequiredMark />
                </Label>
                <Input id="state" placeholder="e.g. NY" aria-invalid={!!errors.state} {...register("state")} />
                {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pincode">
                  Pincode / ZIP
                  <RequiredMark />
                </Label>
                <Input
                  id="pincode"
                  placeholder="e.g. 10001"
                  aria-invalid={!!errors.pincode}
                  {...register("pincode")}
                />
                {errors.pincode && <p className="text-xs text-destructive">{errors.pincode.message}</p>}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-2 pt-4 border-t border-border/40 flex flex-row items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSaving || isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || isUploading}>
              {isSaving && <Spinner className="mr-2 size-4" />}
              {isSaving ? "Saving..." : isEditing ? "Update Contact" : "Create Contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
