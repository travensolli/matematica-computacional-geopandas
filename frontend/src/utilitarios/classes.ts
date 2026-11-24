/** Junta classes CSS ignorando valores falsos. */
export function juntarClasses(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
