"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ContactFormDialog } from "@/features/contacts/components/ContactFormDialog";
import { useContacts, useResendActivationEmail, useUpdateContact } from "@/features/contacts/hooks/useContacts";
import { toFileUrl } from "@/lib/api";

export default function ContactsPage() {
  const { data, isLoading, isError, refetch } = useContacts();
  const updateContact = useUpdateContact();
  const resendEmail = useResendActivationEmail();

  // Archiving is just PATCH /contacts/:id with { isActive: false } - there's
  // no separate archive endpoint (see contacts.service.ts).
  async function handleArchive(id: string) {
    try {
      await updateContact.mutateAsync({ id, input: { isActive: false } });
      toast.success("Contact archived");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  async function handleResendEmail(id: string) {
    try {
      await resendEmail.mutateAsync(id);
      toast.success("Activation email sent successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send activation email.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
          <p className="text-sm text-muted-foreground">Customers and vendors.</p>
        </div>

        <ContactFormDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              New Contact
            </Button>
          }
        />
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">Couldn&apos;t load contacts. Please try again.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && data && data.contacts.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">No contacts yet.</p>
          <ContactFormDialog trigger={<Button>Create your first contact</Button>} />
        </div>
      )}

      {!isLoading && !isError && data && data.contacts.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  {contact.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={toFileUrl(contact.profileImage)}
                      alt=""
                      className="size-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="size-8 rounded-full bg-muted" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{contact.name}</TableCell>
                <TableCell>{contact.type}</TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant={contact.isActive ? "default" : "secondary"}>
                      {contact.isActive ? "Active" : "Archived"}
                    </Badge>
                    {!contact.isActivated && <Badge variant="outline">Activation Pending</Badge>}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {!contact.isActivated && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResendEmail(contact.id)}
                        disabled={resendEmail.isPending}
                      >
                        Resend Link
                      </Button>
                    )}
                    <ContactFormDialog contact={contact} trigger={<Button variant="outline" size="sm">Edit</Button>} />
                    {contact.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleArchive(contact.id)}
                        disabled={updateContact.isPending}
                      >
                        Archive
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
