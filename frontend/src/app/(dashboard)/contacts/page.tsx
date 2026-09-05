"use client";

import { useState } from "react";
import { Mail, MoreVertical, Pencil, Plus, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { ViewToggle, type ViewMode } from "@/components/common/ViewToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTableToolbar } from "@/components/common/DataTableToolbar";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { DataTableEmptyState } from "@/components/common/DataTableEmptyState";
import { ContactFormDialog } from "@/features/contacts/components/ContactFormDialog";
import { useContacts, useResendActivationEmail, useUpdateContact } from "@/features/contacts/hooks/useContacts";
import { useServerDataTable } from "@/hooks/useServerDataTable";
import { toFileUrl } from "@/lib/api";
import type { Contact, ContactType } from "@/features/contacts/services/contacts.service";

function getContactStatus(contact: { isActive: boolean; isActivated: boolean }): string {
  if (!contact.isActive) return "INACTIVE";
  if (!contact.isActivated) return "ACTIVATION_PENDING";
  return "ACTIVE";
}

export default function ContactsPage() {
  const [view, setView] = useState<ViewMode>("list");
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const {
    searchInput,
    search,
    setSearchQuery,
    filters,
    setFilter,
    resetFilters,
    isFiltered,
    currentPage,
    setPage,
    pageSize,
    setPageSize,
  } = useServerDataTable({
    defaultPageSize: 10,
    initialFilters: { type: "ALL", status: "ALL" },
  });

  // Server-side search/filter/pagination - every keystroke (debounced)
  // and every filter/page change triggers a fresh GET /contacts request.
  const { data, isLoading, isError, refetch } = useContacts({
    search: search || undefined,
    type: filters.type === "ALL" ? undefined : (filters.type as ContactType),
    status: filters.status === "ALL" ? undefined : (filters.status as "ACTIVE" | "INACTIVE" | "PENDING_ACTIVATION"),
    page: currentPage,
    limit: pageSize,
  });
  const updateContact = useUpdateContact();
  const resendEmail = useResendActivationEmail();

  const totalItems = data?.meta.total || 0;
  const totalPages = data?.meta.totalPages || 0;
  const paginatedData = data?.contacts || [];
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  async function handleDeactivate(id: string) {
    try {
      await updateContact.mutateAsync({ id, input: { isActive: false } });
      toast.success("Contact set to inactive");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  async function handleActivate(id: string) {
    try {
      await updateContact.mutateAsync({ id, input: { isActive: true } });
      toast.success("Contact set to active");
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
      {/* Page Header */}
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

      {/* Controlled Edit Contact Modal */}
      <ContactFormDialog
        contact={editingContact ?? undefined}
        open={!!editingContact}
        onOpenChange={(open) => {
          if (!open) setEditingContact(null);
        }}
      />

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
            searchQuery={searchInput}
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
                  { label: "Inactive", value: "INACTIVE" },
                  { label: "Activation Pending", value: "PENDING_ACTIVATION" },
                ],
              },
            ]}
            activeFilters={filters}
            onFilterChange={setFilter}
            isFiltered={isFiltered}
            onResetFilters={resetFilters}
            totalResults={totalItems}
            unfilteredTotal={totalItems}
          />

          {paginatedData.length === 0 ? (
            <DataTableEmptyState onReset={resetFilters} />
          ) : (
            <>
              {view === "list" ? (
                <div className="w-full rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[180px]">Contact Name</TableHead>
                        <TableHead className="w-[120px]">Type</TableHead>
                        <TableHead className="min-w-[160px]">Email</TableHead>
                        <TableHead className="min-w-[120px]">Location</TableHead>
                        <TableHead className="w-[140px]">Status</TableHead>
                        <TableHead className="w-[60px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell className="max-w-[220px]">
                            <div className="flex items-center gap-3 min-w-0">
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
                              <span className="font-semibold text-foreground truncate" title={contact.name}>
                                {contact.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={contact.type} showDot={false} size="sm" />
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            <span className="truncate block max-w-[200px]" title={contact.email}>
                              {contact.email}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            <span
                              className="truncate block max-w-[160px]"
                              title={[contact.city, contact.state].filter(Boolean).join(", ")}
                            >
                              {[contact.city, contact.state].filter(Boolean).join(", ") || "-"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={getContactStatus(contact)} size="sm" />
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                                  >
                                    <MoreVertical className="size-4" />
                                    <span className="sr-only">Actions</span>
                                  </Button>
                                }
                              />
                              <DropdownMenuContent align="end" className="w-44">
                                {!contact.isActivated && (
                                  <DropdownMenuItem
                                    onClick={() => handleResendEmail(contact.id)}
                                    disabled={resendEmail.isPending}
                                  >
                                    <Mail className="size-3.5 mr-2 text-muted-foreground" />
                                    <span>Resend Link</span>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => setEditingContact(contact)}>
                                  <Pencil className="size-3.5 mr-2 text-muted-foreground" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {contact.isActive ? (
                                  <DropdownMenuItem
                                    onClick={() => handleDeactivate(contact.id)}
                                    disabled={updateContact.isPending}
                                    className="text-destructive focus:text-destructive data-highlighted:bg-destructive/10 data-highlighted:text-destructive"
                                  >
                                    <UserX className="size-3.5 mr-2" />
                                    <span>Deactivate</span>
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => handleActivate(contact.id)}
                                    disabled={updateContact.isPending}
                                    className="text-emerald-600 focus:text-emerald-600 data-highlighted:bg-emerald-50 dark:data-highlighted:bg-emerald-950/40 data-highlighted:text-emerald-600"
                                  >
                                    <UserCheck className="size-3.5 mr-2" />
                                    <span>Activate</span>
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
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
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            {contact.profileImage ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={toFileUrl(contact.profileImage)}
                                alt={contact.name}
                                className="size-10 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                                {contact.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <h3 className="font-semibold text-foreground truncate" title={contact.name}>
                                {contact.name}
                              </h3>
                              <StatusBadge status={contact.type} showDot={false} size="sm" className="mt-1" />
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="size-8 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                                >
                                  <MoreVertical className="size-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              }
                            />
                            <DropdownMenuContent align="end" className="w-44">
                              {!contact.isActivated && (
                                <DropdownMenuItem
                                  onClick={() => handleResendEmail(contact.id)}
                                  disabled={resendEmail.isPending}
                                >
                                  <Mail className="size-3.5 mr-2 text-muted-foreground" />
                                  <span>Resend Link</span>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => setEditingContact(contact)}>
                                <Pencil className="size-3.5 mr-2 text-muted-foreground" />
                                <span>Edit</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {contact.isActive ? (
                                <DropdownMenuItem
                                  onClick={() => handleDeactivate(contact.id)}
                                  disabled={updateContact.isPending}
                                  className="text-destructive focus:text-destructive data-highlighted:bg-destructive/10 data-highlighted:text-destructive"
                                >
                                  <UserX className="size-3.5 mr-2" />
                                  <span>Deactivate</span>
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleActivate(contact.id)}
                                  disabled={updateContact.isPending}
                                  className="text-emerald-600 focus:text-emerald-600 data-highlighted:bg-emerald-50 dark:data-highlighted:bg-emerald-950/40 data-highlighted:text-emerald-600"
                                >
                                  <UserCheck className="size-3.5 mr-2" />
                                  <span>Activate</span>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardHeader>
                        <CardContent className="space-y-3 pb-4 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="size-3.5 shrink-0" />
                            <span className="truncate text-xs" title={contact.email}>
                              {contact.email}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Location:</span>
                            <span className="font-medium text-foreground truncate max-w-[150px]">
                              {[contact.city, contact.state].filter(Boolean).join(", ") || "-"}
                            </span>
                          </div>

                          <div className="pt-1">
                            <StatusBadge status={getContactStatus(contact)} size="sm" />
                          </div>
                        </CardContent>
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
