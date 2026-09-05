"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { logout } from "@/features/auth/services/auth.service";

import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

// Small client-leaf component so the rest of the dashboard layout can stay
// a server component (frontend-nextjs SKILL.md: push "use client" to the
// leaf, not the whole layout).
export function LogoutButton({ variant = "outline", size = "sm", className }: LogoutButtonProps = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      // Clear the cached session so useAuth() stops thinking someone's
      // still logged in, then send them back to the login page.
      queryClient.removeQueries({ queryKey: ["auth", "me"] });
      router.push("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Logout failed");
      setIsLoggingOut(false);
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={className}
      title="Sign out"
    >
      <LogOut className="size-4" />
      {size !== "icon" && <span className="ml-1.5">{isLoggingOut ? "Signing out..." : "Sign out"}</span>}
    </Button>
  );
}
