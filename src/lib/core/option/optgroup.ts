import { Component, ViewEncapsulation, Input, ChangeDetectionStrategy } from '@angular/core';

import { mixinDisabled, CanDisable, CanDisableCtor } from '../common-behaviors/index';


// Boilerplate for applying mixins to McOptgroup.
/** @docs-private */
export class McOptgroupBase {}

export const McOptgroupMixinBase: CanDisableCtor & typeof McOptgroupBase = mixinDisabled(McOptgroupBase);

// Counter for unique group ids.
let uniqueOptgroupIdCounter = 0;

/**
 * Component that is used to group instances of `mc-option`.
 */
@Component({
    selector: 'mc-optgroup',
    exportAs: 'mcOptgroup',
    templateUrl: 'optgroup.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    inputs: ['disabled'],
    styleUrls: ['optgroup.css'],
    host: {
        class: 'mc-optgroup',
        role: 'group',
        '[class.mc-optgroup-disabled]': 'disabled',
        '[attr.aria-disabled]': 'disabled.toString()',
        '[attr.aria-labelledby]': 'labelId'
    }
})
export class McOptgroup extends McOptgroupMixinBase implements CanDisable {
    /** Label for the option group. */
    @Input() label: string;

    /** Unique id for the underlying label. */
    labelId: string = `mc-optgroup-label-${uniqueOptgroupIdCounter++}`;
}
