import { Directive, ElementRef, Inject, InjectionToken, NgZone, Optional } from '@angular/core';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';


/**
 * Interface for a McInkBar positioner method, defining the positioning and width of the ink
 * bar in a set of tabs.
 */
// tslint:disable-next-line:naming-convention
export type McInkBarPositioner = (element: HTMLElement) => { left: string; width: string };

/** Injection token for the McInkBar's Positioner. */
export const MAT_INK_BAR_POSITIONER =
    new InjectionToken<McInkBarPositioner>('McInkBarPositioner', {
        providedIn: 'root',
        factory: MC_INK_BAR_POSITIONER_FACTORY
    });

/**
 * The default positioner function for the McInkBar.
 * @docs-private
 */
// tslint:disable-next-line:naming-convention
export function MC_INK_BAR_POSITIONER_FACTORY(): McInkBarPositioner {
    return (element: HTMLElement) => ({
        left: element ? `${element.offsetLeft || 0}px` : '0',
        width: element ? `${element.offsetWidth || 0}px` : '0'
    });
}

/**
 * The ink-bar is used to display and animate the line underneath the current active tab label.
 * @docs-private
 */
@Directive({
    selector: 'mc-ink-bar',
    host: {
        class: 'mat-ink-bar',
        '[class._mc-animation-noopable]': `animationMode === 'NoopAnimations'`
    }
})
export class McInkBar {
    constructor(
        private elementRef: ElementRef<HTMLElement>,
        private ngZone: NgZone,
        @Inject(MAT_INK_BAR_POSITIONER) private inkBarPositioner: McInkBarPositioner,
        @Optional() @Inject(ANIMATION_MODULE_TYPE) public animationMode?: string
    ) {}

    /**
     * Calculates the styles from the provided element in order to align the ink-bar to that element.
     * Shows the ink bar if previously set as hidden.
     */
    alignToElement(element: HTMLElement) {
        this.show();

        if (typeof requestAnimationFrame !== undefined) {
            this.ngZone.runOutsideAngular(() => requestAnimationFrame(() => this.setStyles(element)));
        } else {
            this.setStyles(element);
        }
    }

    /** Shows the ink bar. */
    show(): void {
        this.elementRef.nativeElement.style.visibility = 'visible';
    }

    /** Hides the ink bar. */
    hide(): void {
        this.elementRef.nativeElement.style.visibility = 'hidden';
    }

    /**
     * Sets the proper styles to the ink bar element.
     */
    private setStyles(element: HTMLElement) {
        const positions = this.inkBarPositioner(element);
        const inkBar: HTMLElement = this.elementRef.nativeElement;

        inkBar.style.left = positions.left;
        inkBar.style.width = positions.width;
    }
}
