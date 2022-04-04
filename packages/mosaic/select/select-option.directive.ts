import { Directionality } from '@angular/cdk/bidi';
import { Overlay, ScrollDispatcher } from '@angular/cdk/overlay';
import { AfterViewInit, Directive, ElementRef, Inject, NgZone, OnDestroy, Optional, ViewContainerRef } from '@angular/core';
import { McOption } from '@ptsecurity/mosaic/core';
import { McTooltipTrigger, MC_TOOLTIP_SCROLL_STRATEGY } from '@ptsecurity/mosaic/tooltip';


@Directive({
    selector: 'mc-option',
    host: {
        '(mouseenter)': 'onMouseEnter()',
        '(mouseleave)': 'onMouseLeave()'
    }
})
export class McSelectOption extends McTooltipTrigger implements AfterViewInit, OnDestroy {
    private resizeObserver: ResizeObserver;
    private mutationObserver: MutationObserver;
    private optionContentElement: HTMLElement;

    constructor(
        private option: McOption,
        overlay: Overlay,
        elementRef: ElementRef,
        ngZone: NgZone,
        scrollDispatcher: ScrollDispatcher,
        hostView: ViewContainerRef,
        @Inject(MC_TOOLTIP_SCROLL_STRATEGY) scrollStrategy,
        @Optional() direction: Directionality
    ) {
        super(overlay, elementRef, ngZone, scrollDispatcher, hostView, scrollStrategy, direction);
    }

    ngAfterViewInit() {
        this.optionContentElement = this.elementRef.nativeElement.querySelector('.mc-option-text');

        this.content = this.option.viewValue;
        this.disabled = !this.isEllipsisActive();

        this.resizeObserver = new ResizeObserver(() => {
            this.disabled = !this.isEllipsisActive();
        });

        this.mutationObserver = new MutationObserver(() => {
            this.content = this.option.viewValue;
        });

        this.mutationObserver.observe(this.optionContentElement, {
            characterData: true, attributes: false, childList: true, subtree: true
        });
    }

    ngOnDestroy() {
        super.ngOnDestroy();

        if (this.resizeObserver) {
            this.resizeObserver.unobserve(this.elementRef.nativeElement);
            this.resizeObserver.disconnect();
        }

        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
    }

    onMouseEnter() {
        this.resizeObserver.observe(this.elementRef.nativeElement);
        this.disabled = !this.isEllipsisActive();
    }

    onMouseLeave() {
        this.resizeObserver.unobserve(this.elementRef.nativeElement);
        this.disabled = true;
    }

    isEllipsisActive(): boolean {
        return this.optionContentElement.clientWidth < this.optionContentElement.scrollWidth;
    }
}
