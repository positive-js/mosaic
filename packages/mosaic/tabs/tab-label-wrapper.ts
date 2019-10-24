import { Directive, ElementRef } from '@angular/core';
import {
    CanDisable,
    CanDisableCtor,
    mixinDisabled
} from '@ptsecurity/mosaic/core';


// Boilerplate for applying mixins to McTabLabelWrapper.
/** @docs-private */
export class McTabLabelWrapperBase {}
// tslint:disable-next-line:naming-convention
export const McTabLabelWrapperMixinBase: CanDisableCtor &
    typeof McTabLabelWrapperBase = mixinDisabled(McTabLabelWrapperBase);

/**
 * Used in the `mc-tab-group` view to display tab labels.
 * @docs-private
 */
@Directive({
    selector: '[mcTabLabelWrapper]',
    inputs: ['disabled'],
    host: {
        '[class.mc-disabled]': 'disabled',
        '[attr.aria-disabled]': '!!disabled'
    }
})
export class McTabLabelWrapper extends McTabLabelWrapperMixinBase implements CanDisable {
    constructor(public elementRef: ElementRef) {
        super();
    }

    /** Sets focus on the wrapper element */
    focus(): void {
        this.elementRef.nativeElement.focus();
    }

    getOffsetLeft(): number {
        return this.elementRef.nativeElement.offsetLeft;
    }

    getOffsetWidth(): number {
        return this.elementRef.nativeElement.offsetWidth;
    }
}
