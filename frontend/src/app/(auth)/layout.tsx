// Layout for all auth pages: /login, /forgot-password, /reset-password,
// /activate-account, /portal/login. Just centers a card on the screen -
// no sidebar, no topbar, no logic. Each page renders inside {children}.
//
// The card fades and slides in slightly on load (motion-safe: only, so it's
// skipped entirely for anyone with "reduce motion" turned on) - this is a
// page someone lands on rarely, so a little polish here doesn't cost the
// "never animate something seen 100x/day" rule further down the app.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted p-4">
      {/*
        Ambient dot-grid background (taste-and-motion SKILL.md "Craft Bar" -
        an entry screen shouldn't just be a flat fill color). Built from two
        plain CSS layers, no image asset and no new dependency:
          1. a repeating radial-gradient of small dots, using the theme's
             own --border color so it holds in both light and dark mode
          2. a radial-gradient mask that fades the whole pattern out toward
             the edges, so it reads as texture behind the card, not a graphic
        z-10 on the card below keeps it painted on top of this layer.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_55%_55%_at_50%_40%,black,transparent)]"
        style={{
          backgroundImage: "radial-gradient(var(--color-border) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 relative z-10 w-full max-w-md rounded-lg border bg-background p-8 shadow-sm duration-300 [animation-timing-function:var(--ease-out)]">
        {children}
      </div>
    </div>
  );
}
