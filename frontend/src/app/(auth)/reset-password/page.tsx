import { Suspense } from "react";
import { ResetPasswordForm } from "./reset-password-form";

// useSearchParams() (used inside ResetPasswordForm to read ?token=) has
// to be wrapped in a Suspense boundary, or Next.js will bail the whole
// page out of static rendering. This file stays a plain server
// component so that boundary can exist here.
export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
