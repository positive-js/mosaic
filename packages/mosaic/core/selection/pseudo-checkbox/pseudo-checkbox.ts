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
    selector: 'mc-pseudo-checkbox',
    templateUrl: 'pseudo-checkbox.partial.html',
    styleUrls: ['pseudo-checkbox.css'],
    host: {
        class: 'mc-pseudo-checkbox',
        '[class.mc-indeterminate]': 'state === "indeterminate"',
        '[class.mc-checked]': 'state === "checked"',
        '[class.mc-disabled]': 'disabled'
    },
    preserveWhitespaces: false,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class McPseudoCheckbox {
    @Input() state: McPseudoCheckboxState = 'unchecked';

    @Input() disabled: boolean = false;
}
