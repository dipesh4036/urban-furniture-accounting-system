import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// A small spinning icon to show next to "Saving...", "Creating...", etc.
// on a button while its action is pending. Just a styled wrapper around
// Lucide's Loader2 so every button spins the same way.
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("size-4 animate-spin", className)} />;
}
