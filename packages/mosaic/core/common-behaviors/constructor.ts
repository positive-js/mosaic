
/** @docs-private */
export type Constructor<T> = new(...args: any[]) => T;

/**
 * This is a permissive type for abstract class constructors.
 * @docs-private
 */
// tslint:disable-next-line:ban-types
export type AbstractConstructor<T> = Function & { prototype: T };
