import { AfterViewInit, Directive, ElementRef, Renderer2 } from '@angular/core';
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
        '[class.mc-disabled]': 'disabled'
    }
})
export class McTabLabelWrapper extends McTabLabelWrapperMixinBase implements CanDisable, AfterViewInit {
    constructor(
        public elementRef: ElementRef,
        private renderer: Renderer2
    ) {
        super();
    }

    ngAfterViewInit(): void {
        this.addClassModifierForIcons(Array.from(this.elementRef.nativeElement.querySelectorAll('.mc-icon')));
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

    private addClassModifierForIcons(icons: HTMLElement[]) {
        const twoIcons = 2;
        const [firstIconElement, secondIconElement] = icons;

        if (icons.length === 1) {
            const COMMENT_NODE = 8;

            if (firstIconElement.nextSibling && firstIconElement.nextSibling.nodeType !== COMMENT_NODE) {
                this.renderer.addClass(firstIconElement, 'mc-icon_left');
            }

            if (firstIconElement.previousSibling && firstIconElement.previousSibling.nodeType !== COMMENT_NODE) {
                this.renderer.addClass(firstIconElement, 'mc-icon_right');
            }
        } else if (icons.length === twoIcons) {
            this.renderer.addClass(firstIconElement, 'mc-icon_left');
            this.renderer.addClass(secondIconElement, 'mc-icon_right');
        }
    }
}
