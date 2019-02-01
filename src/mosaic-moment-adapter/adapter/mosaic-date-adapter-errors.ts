/** @docs-private */
export function createMissingDateForamtterError(provider: string) {
    return Error(
        `McDateAdapter: No provider found for ${provider}. You must import one of the existing ` +
        `modules at your application root or provide a custom implementation or use exists ones.`);
}
