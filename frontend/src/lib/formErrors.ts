import type { FieldErrors, FieldValues } from "react-hook-form";

// Returns the top-level field name of the first field that failed
// validation (in schema/field-declaration order, which for every form in
// this app matches the order fields appear on screen top-to-bottom).
// Used so a form shows only one inline error at a time - under whichever
// field is "first" - instead of highlighting every invalid field with its
// own message. See ContactFormDialog/CreateUserForm for the pattern:
// each field renders its <p> only when `firstErrorField === "thatField"`.
export function getFirstErrorField<T extends FieldValues>(errors: FieldErrors<T>): string | undefined {
  const keys = Object.keys(errors);
  return keys.length > 0 ? keys[0] : undefined;
}
