"use client";

import { Calendar, Mail, MapPin, Pencil, Phone, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { toFileUrl } from "@/lib/api";
import type { Contact } from "../services/contacts.service";

interface ContactDetailsDialogProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (contact: Contact) => void;
}

function getContactStatus(contact: { isActive: boolean; isActivated: boolean }): string {
  if (!contact.isActive) return "INACTIVE";
  if (!contact.isActivated) return "ACTIVATION_PENDING";
  return "ACTIVE";
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ContactDetailsDialog({
  contact,
  open,
  onOpenChange,
  onEdit,
}: ContactDetailsDialogProps) {
  if (!contact) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 pr-6">
            <DialogTitle className="text-xl font-semibold tracking-tight text-foreground line-clamp-1">
              {contact.name}
            </DialogTitle>
          </div>
          <DialogDescription>
            Contact profile, communication details, and address records.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 pt-2">
          {/* Top Banner: Profile Photo & Identity */}
          <div className="flex items-center gap-4 rounded-xl border border-border/80 p-4 bg-muted/20">
            <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/80 bg-background shadow-xs">
              {contact.profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={toFileUrl(contact.profileImage)}
                  alt={contact.name}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-primary/10 text-primary font-bold text-xl">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
              <h3 className="font-semibold text-base text-foreground truncate" title={contact.name}>
                {contact.name}
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={contact.type} showDot={false} size="sm" />
                <StatusBadge status={getContactStatus(contact)} size="sm" />
              </div>
            </div>
          </div>

          {/* Contact & Communication */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Contact Information
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Email */}
              <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-xs">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="size-4" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[11px] font-medium text-muted-foreground">Email Address</span>
                  <span className="text-xs font-medium text-foreground truncate" title={contact.email}>
                    {contact.email}
                  </span>
                </div>
              </div>

              {/* Mobile */}
              <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-xs">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Phone className="size-4" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[11px] font-medium text-muted-foreground">Phone Number</span>
                  <span className="text-xs font-medium text-foreground truncate">
                    {contact.mobile || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Address & Location
            </span>
            <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-3.5 shadow-xs">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
                <MapPin className="size-4" />
              </div>
              <div className="flex flex-col gap-1 min-w-0 flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">City:</span>
                  <span className="font-semibold text-foreground">{contact.city || "-"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">State:</span>
                  <span className="font-semibold text-foreground">{contact.state || "-"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Pincode:</span>
                  <span className="font-semibold text-foreground">{contact.pincode || "-"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Account & Metadata info */}
          <div className="flex flex-col gap-2.5 border-t border-border/60 pt-4 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5" />
                Portal Activation
              </span>
              <span className="font-medium text-foreground">
                {contact.isActivated ? "Activated" : "Pending Activation"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                Created Date
              </span>
              <span className="font-medium text-foreground">{formatDate(contact.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                Last Updated
              </span>
              <span className="font-medium text-foreground">{formatDate(contact.updatedAt)}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2 pt-4 border-t border-border/40 flex flex-row items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onEdit && (
            <Button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onEdit(contact);
              }}
            >
              <Pencil className="mr-1.5 size-3.5" />
              Edit Contact
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
