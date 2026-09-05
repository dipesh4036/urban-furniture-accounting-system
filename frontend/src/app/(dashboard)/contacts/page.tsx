"use client";

import { useState } from "react";
import { Mail, Plus, User } from "lucide-react";
import { toast } from "sonner";
import { ViewToggle, type ViewMode } from "@/components/common/ViewToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTableToolbar } from "@/components/common/DataTableToolbar";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { DataTableEmptyState } from "@/components/common/DataTableEmptyState";
import { ContactFormDialog } from "@/features/contacts/components/ContactFormDialog";
import { useContacts, useResendActivationEmail, useUpdateContact } from "@/features/contacts/hooks/useContacts";
import { useDataTable } from "@/hooks/useDataTable";
import { toFileUrl } from "@/lib/api";
import type { Contact } from "@/features/contacts/services/contacts.service";

export default function ContactsPage() {
  const [view, setView] = useState<ViewMode>("list");
  const { data, isLoading, isError, refetch } = useContacts();
  const updateContact = useUpdateContact();
  const resendEmail = useResendActivationEmail();

  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    resetFilters,
    isFiltered,
    currentPage,
    pageSize,
    setPage,
    setPageSize,
    totalItems,
    totalPages,
    paginatedData,
    startIndex,
    endIndex,
  } = useDataTable<Contact>({
    data: data?.contacts,
    defaultPageSize: 10,
    searchFields: ["name", "email", "mobile", "city", "state", "pincode"],
    initialFilters: { type: "ALL", status: "ALL" },
    filterPredicate: (contact, currentFilters) => {
      // Filter by Type
      if (currentFilters.type && currentFilters.type !== "ALL") {
        if (contact.type !== currentFilters.type && contact.type !== "BOTH") {
          return false;
        }
      }
      // Filter by Status
      if (currentFilters.status && currentFilters.status !== "ALL") {
        if (currentFilters.status === "ACTIVE" && !contact.isActive) return false;
        if (currentFilters.status === "ARCHIVED" && contact.isActive) return false;
        if (currentFilters.status === "PENDING_ACTIVATION" && contact.isActivated) return false;
      }
      return true;
    },
  });

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
          <p className="text-sm text-muted-foreground">Manage your directory of customers and vendors.</p>
        </div>

        <div className="flex items-center gap-3">
          <ViewToggle view={view} onViewChange={setView} />
          <ContactFormDialog
            trigger={
              <Button>
                <Plus className="size-4" />
                New Contact
              </Button>
            }
          />
        </div>
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
          <ContactFormDialog
            trigger={
              <Button size="sm" variant="outline">
                <Plus className="size-4" />
                Create your first contact
              </Button>
            }
          />
        </div>
      )}

      {!isLoading && !isError && data && data.contacts.length > 0 && (
        <div className="flex flex-col gap-4">
          <DataTableToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search name, email, phone, city..."
            filters={[
              {
                key: "type",
                label: "All Types",
                options: [
                  { label: "All Types", value: "ALL" },
                  { label: "Customers", value: "CUSTOMER" },
                  { label: "Vendors", value: "VENDOR" },
                  { label: "Both", value: "BOTH" },
                ],
              },
              {
                key: "status",
                label: "All Statuses",
                options: [
                  { label: "All Statuses", value: "ALL" },
                  { label: "Active", value: "ACTIVE" },
                  { label: "Archived", value: "ARCHIVED" },
                  { label: "Activation Pending", value: "PENDING_ACTIVATION" },
                ],
              },
            ]}
            activeFilters={filters}
            onFilterChange={setFilter}
            isFiltered={isFiltered}
            onResetFilters={resetFilters}
            totalResults={totalItems}
            unfilteredTotal={data.contacts.length}
          />

          {paginatedData.length === 0 ? (
            <DataTableEmptyState onReset={resetFilters} />
          ) : (
            <>
              {view === "list" ? (
                <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contact Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {contact.profileImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={toFileUrl(contact.profileImage)}
                                  alt=""
                                  className="size-8 rounded-full object-cover shrink-0"
                                />
                              ) : (
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
                                  {contact.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="font-semibold text-foreground">{contact.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={contact.type} showDot={false} size="sm" />
                          </TableCell>
                          <TableCell className="text-muted-foreground">{contact.email}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {[contact.city, contact.state].filter(Boolean).join(", ") || "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1.5">
                              <StatusBadge status={contact.isActive ? "ACTIVE" : "INACTIVE"} size="sm" />
                              {!contact.isActivated && <StatusBadge status="ACTIVATION_PENDING" size="sm" />}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
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

                  <DataTablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {paginatedData.map((contact) => (
                      <Card key={contact.id} className="flex flex-col justify-between transition-all hover:shadow-md">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                          <div className="flex items-center gap-3">
                            {contact.profileImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={toFileUrl(contact.profileImage)}
                                alt={contact.name}
                                className="size-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                                {contact.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <h3 className="font-semibold text-foreground line-clamp-1">{contact.name}</h3>
                              <StatusBadge status={contact.type} showDot={false} size="sm" className="mt-1" />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 pb-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="size-3.5 shrink-0" />
                            <span className="truncate text-xs">{contact.email}</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <StatusBadge status={contact.isActive ? "ACTIVE" : "INACTIVE"} size="sm" />
                            {!contact.isActivated && <StatusBadge status="ACTIVATION_PENDING" size="sm" />}
                          </div>
                        </CardContent>
                        <CardFooter className="flex flex-wrap justify-end gap-2 border-t pt-3">
                          {!contact.isActivated && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => handleResendEmail(contact.id)}
                              disabled={resendEmail.isPending}
                            >
                              Resend Link
                            </Button>
                          )}
                          <ContactFormDialog
                            contact={contact}
                            trigger={
                              <Button variant="outline" size="sm" className="h-8 text-xs">
                                Edit
                              </Button>
                            }
                          />
                          {contact.isActive && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => handleArchive(contact.id)}
                              disabled={updateContact.isPending}
                            >
                              Archive
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>

                  <DataTablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                    className="border bg-card rounded-lg"
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
