import { Directionality } from '@angular/cdk/bidi';
import { Overlay, ScrollDispatcher } from '@angular/cdk/overlay';
import {
    AfterViewInit,
    Directive,
    ElementRef,
    Inject,
    NgZone,
    OnDestroy,
    Optional,
    ViewContainerRef
} from '@angular/core';
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

    get textElement(): HTMLElement {
        return this.option.textElement.nativeElement;
    }

    get isOverflown(): boolean {
        return this.textElement.clientWidth < this.textElement.scrollWidth;
    }

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
        this.content = this.option.viewValue;

        this.resizeObserver = new ResizeObserver(() => this.disabled = !this.isOverflown);

        this.mutationObserver = new MutationObserver(() => this.content = this.option.viewValue);

        this.mutationObserver.observe(this.textElement, {
            characterData: true, attributes: false, childList: true, subtree: true
        });
    }

    ngOnDestroy() {
        super.ngOnDestroy();

        if (this.resizeObserver) {
            this.resizeObserver.unobserve(this.textElement);
            this.resizeObserver.disconnect();
        }

        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
    }

    onMouseEnter() {
        this.resizeObserver.observe(this.textElement);

        this.disabled = !this.isOverflown;
    }

    onMouseLeave() {
        this.resizeObserver.unobserve(this.textElement);

        this.disabled = true;
    }
}
