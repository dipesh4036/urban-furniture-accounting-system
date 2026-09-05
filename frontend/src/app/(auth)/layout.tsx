import { Armchair, Lamp, Sofa } from "lucide-react";

// Shared shell for every auth page: /login, /forgot-password,
// /reset-password, /activate-account. Split into a branding panel on
// the left (hidden on small screens) and the actual page content on
// the right - each page just renders its own form/heading in {children}.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between bg-muted p-12 lg:flex">
        <div>
          <h1 className="text-2xl font-bold">Urban Furniture</h1>
          <p className="mt-1 text-sm text-muted-foreground">Accounting System</p>
        </div>

        {/*
          A simple furniture-themed illustration built from icons instead
          of an image file - stays crisp at any size and follows the
          theme's colors automatically in light/dark mode.
        */}
        <div className="flex flex-1 items-center justify-center">
          <div className="relative flex size-64 items-center justify-center rounded-full bg-primary/10">
            <Sofa className="size-28 text-primary" strokeWidth={1.25} />
            <Armchair className="absolute -bottom-2 -left-6 size-16 text-primary/70" strokeWidth={1.25} />
            <Lamp className="absolute -top-2 -right-4 size-16 text-primary/70" strokeWidth={1.25} />
          </div>
        </div>

        <div>
          <p className="max-w-sm text-sm text-muted-foreground">
            Manage contacts, sales, purchases and reports in one place.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">Roles supported: Admin, Invoicing User, Contact</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border bg-background p-8 shadow-sm">{children}</div>
      </div>
    </div>
  );
}
