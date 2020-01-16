import { Component, ViewEncapsulation, Input, ChangeDetectionStrategy } from '@angular/core';

import { mixinDisabled, CanDisable, CanDisableCtor } from '../common-behaviors/index';


/** @docs-private */
export class McOptgroupBase {}

// tslint:disable-next-line: naming-convention
export const McOptgroupMixinBase: CanDisableCtor & typeof McOptgroupBase = mixinDisabled(McOptgroupBase);

let uniqueOptgroupIdCounter = 0;

/**
 * Component that is used to group instances of `mc-option`.
 */
@Component({
    selector: 'mc-optgroup',
    exportAs: 'mcOptgroup',
    templateUrl: 'optgroup.html',
    styleUrls: ['./optgroup.css'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    inputs: ['disabled'],
    host: {
        class: 'mc-optgroup',
        '[class.mc-disabled]': 'disabled'
    }
})
export class McOptgroup extends McOptgroupMixinBase implements CanDisable {
    @Input() label: string;

    /** Unique id for the underlying label. */
    labelId: string = `mc-optgroup-label-${uniqueOptgroupIdCounter++}`;
}
