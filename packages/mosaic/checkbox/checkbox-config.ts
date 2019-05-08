import { InjectionToken } from '@angular/core';


/**
 * Checkbox click action when user click on input element.
 * noop: Do not toggle checked or indeterminate.
 * check: Only toggle checked status, ignore indeterminate.
 * check-indeterminate: Toggle checked status, set indeterminate to false. Default behavior.
 * undefined: Same as `check-indeterminate`.
 */
export type McCheckboxClickAction = 'noop' | 'check' | 'check-indeterminate' | undefined;

/**
 * Injection token that can be used to specify the checkbox click behavior.
 */
export const MC_CHECKBOX_CLICK_ACTION =
    new InjectionToken<McCheckboxClickAction>('mc-checkbox-click-action');
