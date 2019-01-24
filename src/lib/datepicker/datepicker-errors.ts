/** @docs-private */
export function createMissingDateImplError(provider: string) {
    return Error(
        `McDatepicker: No provider found for ${provider}. You must import one of the existing ` +
        `modules at your application root or provide a custom implementation or use exists ones.`);
}
