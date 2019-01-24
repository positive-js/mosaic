/** @docs-private */
export function createMissingDateImplError(provider: string) {
  return Error(
      `McDatepicker: No provider found for ${provider}. You must import one of the following ` +
      `modules at your application root provide a custom implementation or use exists ones.`);
}
