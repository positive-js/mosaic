
/**
 * Function that patches Dgeni's instantiated log service. The patch will hide warnings about
 * unresolved TypeScript symbols for the mixin base classes.
 *
 * ```
 * warn:    Unresolved TypeScript symbol(s): _McElement - doc "lib/element/element"
 *    (class)  - from file "lib/element/element.ts" - starting at line 37, ending at line 98
 * ```
 *
 * Those warnings are valid, but are not fixable because the base class is created dynamically
 * through mixin functions and will be stored as a constant.
 */
export function patchLogService(log: any) {
  const _warnFn = log.warn;

  log.warn = function(message: string) {
    if (message.includes('Unresolved TypeScript symbol') && message.includes('MixinBase')) {
      return;
    }

    _warnFn.apply(this, [message]);
  };
}
