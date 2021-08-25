import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    Overlay,
    ScrollDispatcher,
    ScrollStrategy,
    FlexibleConnectedPositionStrategy,
    OverlayConnectionPosition,
    OriginConnectionPosition,
    HorizontalConnectionPos,
    VerticalConnectionPos
} from '@angular/cdk/overlay';
import { OverlayConfig } from '@angular/cdk/overlay/overlay-config';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Directive,
    ElementRef,
    EventEmitter,
    Inject,
    InjectionToken,
    Input,
    NgZone,
    Optional,
    Output,
    TemplateRef,
    Type,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import { ArrowPlacements, McBasePopUp, McBasePopUpTrigger, TooltipTriggers } from '@ptsecurity/mosaic/core';
import { merge } from 'rxjs';

import { mcTooltipAnimations } from './tooltip.animations';


@Component({
    selector: 'mc-tooltip-component',
    animations: [mcTooltipAnimations.tooltipState],
    templateUrl: './tooltip.component.html',
    styleUrls: ['./tooltip.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McTooltipComponent extends McBasePopUp {
    prefix = 'mc-tooltip';

    constructor(changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
    }
}

export const MC_TOOLTIP_SCROLL_STRATEGY =
    new InjectionToken<() => ScrollStrategy>('mc-tooltip-scroll-strategy');

/** @docs-private */
export function mcTooltipScrollStrategyFactory(overlay: Overlay): () => ScrollStrategy {
    return () => overlay.scrollStrategies.reposition({ scrollThrottle: 20 });
}

/** @docs-private */
export const MC_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER = {
    provide: MC_TOOLTIP_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: mcTooltipScrollStrategyFactory
};

/** Creates an error to be thrown if the user supplied an invalid tooltip position. */
export function getMcTooltipInvalidPositionError(position: string) {
    return Error(`McTooltip position "${position}" is invalid.`);
}

@Directive({
    selector: '[mcTooltip]',
    exportAs: 'mcTooltip',
    host: {
        '[class.mc-tooltip_open]': 'isOpen',

        '(keydown)': 'handleKeydown($event)',
        '(touchend)': 'handleTouchend()'
    }
})
export class McTooltip extends McBasePopUpTrigger<McTooltipComponent> {
    @Input('mcArrowPlacement') arrowPlacement: ArrowPlacements;

    @Output('mcTooltipChange') visibleChange = new EventEmitter<boolean>();
    @Output('mcTooltipPlacementChange') placementChange: EventEmitter<string> = new EventEmitter();

    @Input('mcTooltip')
    get content(): string | TemplateRef<any> {
        return this._content;
    }

    set content(content: string | TemplateRef<any>) {
        this._content = content;

        if (this.instance) {
            this.instance!.content = content;
        }
    }

    private _content: string | TemplateRef<any>;

    @Input('mcTooltipDisabled')
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
    }

    private _disabled: boolean = false;

    @Input('mcEnterDelay') enterDelay = 400;

    @Input('mcLeaveDelay') leaveDelay = 0;

    @Input('mcTrigger')
    get trigger(): string {
        return this._trigger;
    }

    set trigger(value: string) {
        if (value) {
            this._trigger = value;
        } else {
            this._trigger = `${TooltipTriggers.Hover}, ${TooltipTriggers.Focus}`;
        }

        this.initListeners();
    }

    private _trigger = `${TooltipTriggers.Hover}, ${TooltipTriggers.Focus}`;

    @Input('mcPlacement')
    get placement(): string {
        return this._placement;
    }

    set placement(value: string) {
        if (value !== this._placement) {
            this._placement = value;

            this.updateClassMap();
        } else {
            this._placement = 'top';
        }

        if (this.visible) {
            this.updatePosition();
        }
    }

    private _placement: string = 'top';

    @Input('mcTooltipClass')
    get customClass(): string {
        return this._customClass;
    }

    set customClass(value: string) {
        if (value) {
            this._customClass = value;

            this.updateClassMap();
        } else {
            this._customClass = '';
        }
    }

    private _customClass: string;

    @Input('mcVisible')
    get visible(): boolean {
        return this._visible;
    }

    set visible(externalValue: boolean) {
        const value = coerceBooleanProperty(externalValue);

        if (this._visible !== value) {
            this._visible = value;

            if (value) {
                this.show();
            } else {
                this.hide();
            }
        }
    }

    private _visible: boolean;

    protected originSelector = '.mc-tooltip';

    protected overlayConfig: OverlayConfig = {
        panelClass: 'mc-tooltip-panel'
    };

    constructor(
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

    closingActions() {
        return merge(this.overlayRef!.outsidePointerEvents(), this.overlayRef!.detachments());
    }

    /**
     * Returns the origin position and a fallback position based on the user's position preference.
     * The fallback position is the inverse of the origin (e.g. `'below' -> 'above'`).
     */
    getOrigin(): { main: OriginConnectionPosition; fallback: OriginConnectionPosition } {
        const position = this.placement;
        const isLtr = !this.direction || this.direction.value === 'ltr';
        let originPosition: OriginConnectionPosition;

        if (position === 'top' || position === 'bottom') {
            originPosition = { originX: 'center', originY: position === 'top' ? 'top' : 'bottom' };
        } else if (position === 'top' || (position === 'left' && isLtr) || (position === 'right' && !isLtr)) {
            originPosition = { originX: 'start', originY: 'center' };
        } else if (position === 'bottom' || (position === 'right' && isLtr) || (position === 'left' && !isLtr)) {
            originPosition = { originX: 'end', originY: 'center' };
        } else {
            throw getMcTooltipInvalidPositionError(position);
        }

        const { x, y } = this.invertPosition(originPosition.originX, originPosition.originY);

        return {
            main: originPosition,
            fallback: { originX: x, originY: y }
        };
    }

    /** Returns the overlay position and a fallback position based on the user's preference */
    getOverlayPosition(): { main: OverlayConnectionPosition; fallback: OverlayConnectionPosition } {
        const position = this.placement;
        const isLtr = !this.direction || this.direction.value === 'ltr';
        let overlayPosition: OverlayConnectionPosition;

        if (position === 'top') {
            overlayPosition = { overlayX: 'center', overlayY: 'bottom' };
        } else if (position === 'bottom') {
            overlayPosition = { overlayX: 'center', overlayY: 'top' };
        } else if (position === 'top' || (position === 'left' && isLtr) || (position === 'right' && !isLtr)) {
            overlayPosition = { overlayX: 'end', overlayY: 'center' };
        } else if (position === 'bottom' || (position === 'right' && isLtr) || (position === 'left' && !isLtr)) {
            overlayPosition = { overlayX: 'start', overlayY: 'center' };
        } else {
            throw getMcTooltipInvalidPositionError(position);
        }

        const { x, y } = this.invertPosition(overlayPosition.overlayX, overlayPosition.overlayY);

        return {
            main: overlayPosition,
            fallback: { overlayX: x, overlayY: y }
        };
    }

    /** Updates the position of the current tooltip. */
    updatePosition() {
        this.overlayRef = this.createOverlay();

        const position = this.overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy;
        const origin = this.getOrigin();
        const overlay = this.getOverlayPosition();

        position.withPositions([
            { ...origin.main, ...overlay.main },
            { ...origin.fallback, ...overlay.fallback }
        ]);

        if (this.instance) {
            position.apply();
        }
    }

    handlePositioningUpdate(placement: string) {
        this.overlayRef = this.createOverlay();
        const overlay = this.overlayRef.overlayElement;

        if (['right', 'left'].includes(placement)) {
            const halfDelimiter = 2;
            const overlayElemHeight = overlay.clientHeight;
            const currentContainerHeight = this.hostView.element.nativeElement.clientHeight;

            if (this.arrowPlacement === ArrowPlacements.Center) {
                const containerPositionTop: number = this.hostView.element.nativeElement.getBoundingClientRect().top;
                const halfOfContainerHeight = currentContainerHeight / halfDelimiter;
                const halfOfTooltipHeight = overlayElemHeight / halfDelimiter;

                overlay.style.top = `${(containerPositionTop + halfOfContainerHeight) - halfOfTooltipHeight + 1}px`;

                this.updateArrowPosition(halfOfTooltipHeight);
            } else {
                const pos = (overlayElemHeight - currentContainerHeight) / halfDelimiter;
                const defaultTooltipPlacementTop = parseInt(overlay.style.top || '0px', 10);

                overlay.style.top = `${defaultTooltipPlacementTop + pos - 1}px`;
            }
        }
    }

    getOverlayHandleComponentType(): Type<McTooltipComponent> {
        return McTooltipComponent;
    }

    updateClassMap(newPlacement: string = this.placement) {
        if (!this.instance) { return; }

        this.instance.updateClassMap(newPlacement, this.customClass);
        this.instance.markForCheck();
    }

    /** Inverts an overlay position. */
    private invertPosition(x: HorizontalConnectionPos, y: VerticalConnectionPos) {
        let newX: HorizontalConnectionPos = x;
        let newY: VerticalConnectionPos = y;

        if (['top', 'bottom'].includes(this.placement)) {
            if (y === 'top') {
                newY = 'bottom';
            } else if (y === 'bottom') {
                newY = 'top';
            }
        } else {
            if (x === 'end') {
                newX = 'start';
            } else if (x === 'start') {
                newX = 'end';
            }
        }

        return { x: newX, y: newY };
    }

    private updateArrowPosition(top: number) {
        const className = 'mc-tooltip-arrow';
        const arrowElement = this.overlayRef?.overlayElement.getElementsByClassName(className)[0];

        if (arrowElement) {
            arrowElement.setAttribute('style', `top: ${top - 1}px`);
        }
    }
}
