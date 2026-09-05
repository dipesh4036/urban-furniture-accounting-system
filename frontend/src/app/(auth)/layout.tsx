import Image from "next/image";
import Link from "next/link";

// Shared shell for every auth page: /login, /forgot-password,
// /reset-password, /activate-account, /portal/login.
// Left side: editorial branding banner with interior architecture backdrop.
// Right side: centered responsive form card.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Branding Panel (Desktop) */}
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden p-12 lg:flex xl:p-16">
        {/* Background Image */}
        <Image
          src="/furniture-banner.jpg"
          alt="Urban Furniture interior showroom"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />

        {/* Multi-layered cinematic gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/80" />
        <div className="absolute inset-0 bg-black/20" />

        {/* Top Branding Section */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-xl border border-white/25 shadow-md bg-white/10 p-0.5">
            <Image
              src="/logo.jpg"
              alt="Urban Furniture Logo"
              fill
              className="object-cover rounded-[10px]"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">Urban Furniture</span>
            </div>
            <p className="text-xs text-white/70 font-medium">Studio & Financial Operations</p>
          </div>
        </div>

        {/* Center Editorial Statement & Quote Card */}
        <div className="relative z-10 max-w-lg space-y-7">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
              Finance · Inventory · Orders
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-white xl:text-4xl leading-tight">
              Crafted with precision.<br />
              Balanced with clarity.
            </h2>
            <p className="text-sm leading-relaxed text-white/80">
              From raw timber sourcing and workshop fabrication to showroom sales and multi-ledger accounting. Everything your furniture studio needs in one place.
            </p>
          </div>

          {/* Operational Testimonial Card */}
          <div className="rounded-2xl border border-white/15 bg-white/[0.08] p-5 backdrop-blur-md text-white/90 shadow-xl">
            <p className="text-sm font-normal leading-relaxed text-white/95 italic">
              &ldquo;Every custom order, vendor bill, and batch cost updates directly into our general ledger. It keeps our workshop running with zero friction.&rdquo;
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
              <div>
                <p className="font-semibold text-white">Workshop & Inventory Control</p>
                <p className="text-[11px] text-white/60">Urban Furniture Studio</p>
              </div>
              <span className="rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-medium tracking-wide text-white/90 border border-white/10">
                Staff Verified
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-6 text-xs text-white/65">
          <span>Enterprise Accounting System</span>
          <span>&copy; {new Date().getFullYear()} Urban Furniture</span>
        </div>
      </div>

      {/* Right Content Panel */}
      <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-8 lg:p-12 relative">
        {/* Mobile Header Branding (Visible only on < lg) */}
        <div className="mb-6 flex items-center gap-3 lg:hidden">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-xl border border-border shadow-xs">
            <Image
              src="/logo.jpg"
              alt="Urban Furniture Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              Urban<span className="font-normal text-muted-foreground">Furniture</span>
            </h1>
            <p className="text-xs text-muted-foreground">Accounting System</p>
          </div>
        </div>

        {/* Main Card Container */}
        <div className="w-full max-w-[440px] rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-lg shadow-black/5">
          {children}
        </div>
      </div>
    </div>
  );
}

