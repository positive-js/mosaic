import { Component, ViewEncapsulation, Input, ChangeDetectionStrategy } from '@angular/core';


export type McPseudoCheckboxState = 'unchecked' | 'checked' | 'indeterminate';

/**
 * Component that shows a simplified checkbox without including any kind of "real" checkbox.
 * Meant to be used when the checkbox is purely decorative and a large number of them will be
 * included, such as for the options in a multi-select. Uses no SVGs or complex animations.
 * Note that theming is meant to be handled by the parent element, e.g.
 * `mc-primary .mc-pseudo-checkbox`.
 *
 * Note that this component will be completely invisible to screen-reader users. This is *not*
 * interchangeable with `<mc-checkbox>` and should *not* be used if the user would directly
 * interact with the checkbox. The pseudo-checkbox should only be used as an implementation detail
 * of more complex components that appropriately handle selected / checked state.
 * @docs-private
 */
@Component({
    encapsulation: ViewEncapsulation.None,
    preserveWhitespaces: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'mc-pseudo-checkbox',
    styleUrls: ['pseudo-checkbox.css'],
    template: '',
    host: {
        class: 'mc-pseudo-checkbox',
        '[class.mc-pseudo-checkbox-indeterminate]': 'state === "indeterminate"',
        '[class.mc-pseudo-checkbox-checked]': 'state === "checked"',
        '[class.mc-pseudo-checkbox-disabled]': 'disabled'
    }
})
export class McPseudoCheckbox {
    // Display state of the checkbox.
    @Input() state: McPseudoCheckboxState = 'unchecked';

    // Whether the checkbox is disabled.
    @Input() disabled: boolean = false;
}
