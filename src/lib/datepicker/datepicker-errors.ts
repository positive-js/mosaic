/** @docs-private */
export function createMissingDateImplError(provider: string) {
  return Error(
      `McDatepicker: No provider found for ${provider}. You must import one of the following ` +
      `modules at your application root: McNativeDateModule, McMomentDateModule, or provide a ` +
      `custom implementation.`);
}
