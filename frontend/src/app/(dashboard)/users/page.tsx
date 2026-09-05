"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTableToolbar } from "@/components/common/DataTableToolbar";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import { DataTableEmptyState } from "@/components/common/DataTableEmptyState";
import { useDataTable } from "@/hooks/useDataTable";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { UserFormDialog } from "@/features/users/components/UserFormDialog";
import { useUpdateUser, useUsers } from "@/features/users/hooks/useUsers";
import type { StaffUser } from "@/features/users/services/users.service";

export default function UsersPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useUsers();
  const updateUser = useUpdateUser();

  // Role guard: Non-admins (e.g. Accountants) cannot view or manage users
  useEffect(() => {
    if (!isAuthLoading && user && user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [user, isAuthLoading, router]);

  const rawUsers = useMemo(() => data?.users ?? [], [data?.users]);

  const {
    paginatedData,
    filteredData,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    resetFilters,
    hasActiveFilters,
    totalItems,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
  } = useDataTable<StaffUser>({
    data: rawUsers,
    searchFields: ["name", "loginId", "email"],
    filterPredicate: (item, currentFilters) => {
      const roleFilter = currentFilters.role;
      if (roleFilter && roleFilter !== "ALL" && item.role !== roleFilter) {
        return false;
      }
      const statusFilter = currentFilters.status;
      if (statusFilter && statusFilter !== "ALL") {
        const itemStatus = item.isActive ? "ACTIVE" : "INACTIVE";
        if (itemStatus !== statusFilter) {
          return false;
        }
      }
      return true;
    },
    defaultPageSize: 10,
  });

  if (!isAuthLoading && user && user.role !== "ADMIN") {
    return null;
  }

  // Deactivating/reactivating is just PATCH /users/:id with { isActive }
  async function handleToggleActive(id: string, isActive: boolean) {
    try {
      await updateUser.mutateAsync({ id, input: { isActive: !isActive } });
      toast.success(isActive ? "User deactivated" : "User reactivated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create User</h1>
          <p className="text-sm text-muted-foreground">Manage and provision staff accounts (Admin and Accountant).</p>
        </div>

        <UserFormDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              Create User
            </Button>
          }
        />
      </div>

      {/* Toolbar with Search and Filters */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name, login ID, email..."
        filterOptions={[
          {
            key: "role",
            title: "Role",
            options: [
              { label: "All Roles", value: "ALL" },
              { label: "Admin", value: "ADMIN" },
              { label: "Accountant", value: "ACCOUNTANT" },
            ],
          },
          {
            key: "status",
            title: "Status",
            options: [
              { label: "All Statuses", value: "ALL" },
              { label: "Active", value: "ACTIVE" },
              { label: "Inactive", value: "INACTIVE" },
            ],
          },
        ]}
        selectedFilters={filters}
        onFilterChange={setFilter}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        totalCount={rawUsers.length}
        filteredCount={filteredData.length}
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
          <p className="text-sm text-muted-foreground">Couldn&apos;t load users. Please try again.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && rawUsers.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">No staff users yet.</p>
          <UserFormDialog trigger={<Button>Create your first user</Button>} />
        </div>
      )}

      {!isLoading && !isError && rawUsers.length > 0 && filteredData.length === 0 && (
        <DataTableEmptyState
          icon={Users}
          title="No users match your criteria"
          description="Try resetting your filters or adjusting your search term."
          onClear={resetFilters}
        />
      )}

      {!isLoading && !isError && paginatedData.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Name</TableHead>
                  <TableHead>Login ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-foreground">{u.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                        {u.loginId}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <StatusBadge status={u.role} showDot={false} size="sm" />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={u.isActive ? "ACTIVE" : "INACTIVE"} size="sm" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(u.id, u.isActive)}
                        disabled={updateUser.isPending}
                      >
                        {u.isActive ? "Deactivate" : "Reactivate"}
                      </Button>
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
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </div>
      )}
    </div>
  );
}

