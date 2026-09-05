import Image from "next/image";

// Shared shell for every auth page: /login, /forgot-password,
// /reset-password, /activate-account. Split into a branding panel on
// the left (hidden on small screens) and the actual page content on
// the right - each page just renders its own form/heading in {children}.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden flex-1 flex-col justify-between p-12 lg:flex">
        {/* The photo fills the whole panel as a background - everything
            else in this panel sits on top of it. */}
        <Image
          src="/furniture-banner.jpg"
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />

        {/* A dark gradient over the photo so the white text stays
            readable no matter which part of the photo is behind it. */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-black/50" />

        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-white">Urban Furniture</h1>
          <p className="mt-1 text-sm text-white/80">Accounting System</p>
        </div>

        <div className="relative z-10">
          <p className="max-w-sm text-sm text-white/80">
            Manage contacts, sales, purchases and reports in one place.
          </p>
          <p className="mt-4 text-xs text-white/60">Roles supported: Admin, Invoicing User, Contact</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg border bg-background p-8 shadow-sm">{children}</div>
      </div>
    </div>
  );
}
