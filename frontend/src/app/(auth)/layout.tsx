// Layout for all auth pages: /login, /forgot-password, /reset-password,
// /activate-account, /portal/login. Just centers a card on the screen -
// no sidebar, no topbar, no logic. Each page renders inside {children}.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md rounded-lg border bg-background p-8 shadow-sm">{children}</div>
    </div>
  );
}
