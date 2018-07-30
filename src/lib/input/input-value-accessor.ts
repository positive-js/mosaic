import { InjectionToken } from '@angular/core';


/**
 * This token is used to inject the object whose value should be set into `McInput`. If none is
 * provided, the native `HTMLInputElement` is used. Directives like `McDatepickerInput` can provide
 * themselves for this token, in order to make `MatInput` delegate the getting and setting of the
 * value to them.
 */
export const MC_INPUT_VALUE_ACCESSOR =
    new InjectionToken<{ value: any }>('MC_INPUT_VALUE_ACCESSOR');
