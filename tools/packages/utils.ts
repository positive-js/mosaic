
/**
 * Method that converts dash-case strings to a camel-based string.
 */
export const dashCaseToCamelCase =
    (str: string) => str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
