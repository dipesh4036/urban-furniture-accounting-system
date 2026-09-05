"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create User</h1>
          <p className="text-sm text-muted-foreground">Manage and provision staff accounts (Admin and Accountant).</p>
        </div>

        <UserFormDialog
          trigger={
            <Button size="sm">
              <Plus className="mr-2 size-4" />
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
          <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Name</TableHead>
                  <TableHead>Login Id</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{u.loginId}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.isActive ? "outline" : "secondary"} className={u.isActive ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : ""}>
                        {u.isActive ? "Active" : "Inactive"}
                      </Badge>
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
          </div>

          <DataTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}
    </div>
  );
}

