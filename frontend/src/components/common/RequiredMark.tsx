// A small red asterisk to drop right after a <Label>'s text, so a
// required field is obvious at a glance instead of only failing
// validation after the user tries to submit.
export function RequiredMark() {
  return (
    <span className="text-destructive" aria-hidden="true">
      {" "}
      *
    </span>
  );
}
