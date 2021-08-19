import { AnimationEvent } from '@angular/animations';
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    ConnectedOverlayPositionChange,
    Overlay,
    OverlayRef,
    ScrollDispatcher,
    ScrollStrategy,
    FlexibleConnectedPositionStrategy,
    OverlayConnectionPosition,
    OriginConnectionPosition,
    HorizontalConnectionPos,
    VerticalConnectionPos
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
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
    OnDestroy,
    OnInit,
    Optional,
    Output,
    TemplateRef,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import { ESCAPE } from '@ptsecurity/cdk/keycodes';
import {
    DEFAULT_4_POSITIONS,
    POSITION_MAP
} from '@ptsecurity/mosaic/core';
import { Observable, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { mcTooltipAnimations } from './tooltip.animations';


export type ArrowPlacements = HorizontalConnectionPos | VerticalConnectionPos;

// tslint:disable-next-line:naming-convention
export const ArrowPlacements = {
    Top: 'top' as ArrowPlacements,
    Center: 'center' as ArrowPlacements,
    Bottom: 'bottom' as ArrowPlacements,
    Right: 'right' as ArrowPlacements,
    Left: 'left' as ArrowPlacements
};

export type TooltipVisibility = 'initial' | 'visible' | 'hidden';


@Component({
    selector: 'mc-tooltip-component',
    animations: [mcTooltipAnimations.tooltipState],
    templateUrl: './tooltip.component.html',
    styleUrls: ['./tooltip.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false
})
export class McTooltipComponent {
    classMap = {};
    isTitleString: boolean;
    showTid: any;
    hideTid: any;

    visibleChange: EventEmitter<boolean> = new EventEmitter();

    title: string | TemplateRef<any>;

    placement: string;
    tooltipClass: string;

    /** Property watched by the animation framework to show or hide the tooltip */
    visibility: TooltipVisibility = 'initial';

    private prefix = 'mc-tooltip_placement';

    /** Subject for notifying that the tooltip has been hidden from the view */
    private readonly onHideSubject: Subject<any> = new Subject();
    private closeOnInteraction: boolean = false;

    constructor(private changeDetectorRef: ChangeDetectorRef) {}

    animationStart() {
        this.closeOnInteraction = false;
    }

    animationDone(event: AnimationEvent): void {
        const toState = event.toState as TooltipVisibility;

        if (toState === 'hidden' && !this.isVisible()) {
            this.onHideSubject.next();
        }

        if (toState === 'visible' || toState === 'hidden') {
            this.closeOnInteraction = true;
        }
    }

    show(delay: number): void {
        if (this.hideTid) {
            clearTimeout(this.hideTid);
        }

        this.closeOnInteraction = true;
        this.showTid = setTimeout(
            () => {
                this.visibility = 'visible';
                this.showTid = undefined;

                this.visibleChange.emit(true);

                // Mark for check so if any parent component has set the
                // ChangeDetectionStrategy to OnPush it will be checked anyways
                this.markForCheck();
            },
            delay
        );
    }

    hide(delay: number): void {
        if (this.showTid) {
            clearTimeout(this.showTid);
        }

        this.hideTid = setTimeout(
            () => {
                this.visibility = 'hidden';
                this.hideTid = undefined;

                this.visibleChange.emit(false);
                this.onHideSubject.next();

                // Mark for check so if any parent component has set the
                // ChangeDetectionStrategy to OnPush it will be checked anyways
                this.markForCheck();
            },
            delay
        );
    }

    isVisible(): boolean {
        return this.visibility === 'visible';
    }

    updateClassMap(): void {
        this.classMap = {
            [`${this.prefix}-${this.placement}`]: true,
            [this.tooltipClass]: true
        };
    }

    /** Returns an observable that notifies when the tooltip has been hidden from view. */
    afterHidden(): Observable<void> {
        return this.onHideSubject.asObservable();
    }

    markForCheck(): void {
        this.changeDetectorRef.markForCheck();
    }

    handleBodyInteraction(): void {
        if (this.closeOnInteraction) {
            this.hide(0);
        }
    }

    get isTemplateRef(): boolean {
        return this.title instanceof TemplateRef;
    }

    get isNonEmptyString(): boolean {
        return (typeof this.title === 'string' || typeof this.title === 'number') && this.title !== '';
    }
}

export const MC_TOOLTIP_SCROLL_STRATEGY =
    new InjectionToken<() => ScrollStrategy>('mc-tooltip-scroll-strategy');

/** @docs-private */
export function mcTooltipScrollStrategyFactory(overlay: Overlay): () => ScrollStrategy {
    return () => overlay.scrollStrategies.reposition({scrollThrottle: 20});
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

const VIEWPORT_MARGIN: number = 8;

@Directive({
    selector: '[mcTooltip]',
    exportAs: 'mcTooltip',
    host: {
        '[class.mc-tooltip-open]': 'isTooltipOpen',

        '(keydown)': 'handleKeydown($event)',
        '(touchend)': 'handleTouchend()'
    }
})
export class McTooltip implements OnInit, OnDestroy {
    isTooltipOpen: boolean = false;
    overlayRef: OverlayRef | null;
    portal: ComponentPortal<McTooltipComponent>;
    availablePositions: any;
    tooltipInstance: McTooltipComponent | null;

    @Input('mcArrowPlacement') arrowPlacement: ArrowPlacements;

    @Output() mcVisibleChange = new EventEmitter<boolean>();

    @Input('mcTooltip')
    get title(): string | TemplateRef<any> {
        return this._title;
    }

    set title(title: string | TemplateRef<any>) {
        this._title = title;

        if (this.tooltipInstance) {
            this.tooltipInstance.title = title;
        }
    }

    private _title: string | TemplateRef<any>;

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
        if (!value) { return; }

        this._trigger = value;
    }

    private _trigger: string = 'hover, focus';

    @Input('mcPlacement')
    get placement(): string {
        return this._placement;
    }

    set placement(value: string) {
        if (value) {
            this._placement = value;

            if (this.tooltipInstance) {
                this.tooltipInstance.placement = value;
            }
        } else {
            this._placement = 'top';
        }

        if (this.visible) {
            this.updatePosition();
        }
    }

    private _placement: string = 'top';

    @Input('mcTooltipClass')
    get tooltipClass(): string {
        return this._tooltipClass;
    }

    set tooltipClass(value: string) {
        if (value) {
            this._tooltipClass = value;

            if (this.tooltipInstance) {
                this.tooltipInstance.tooltipClass = value;
            }
        } else {
            this._tooltipClass = '';
        }
    }

    private _tooltipClass: string;

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

    private $unsubscribe = new Subject<void>();

    private manualListeners = new Map<string, EventListenerOrEventListenerObject>();
    private readonly destroyed = new Subject<void>();

    constructor(
        private overlay: Overlay,
        private elementRef: ElementRef,
        private ngZone: NgZone,
        private scrollDispatcher: ScrollDispatcher,
        private hostView: ViewContainerRef,
        @Inject(MC_TOOLTIP_SCROLL_STRATEGY) private scrollStrategy,
        @Optional() private direction: Directionality
    ) {
        this.availablePositions = POSITION_MAP;
    }

    ngOnInit(): void {
        this.initElementRefListeners();
    }

    ngOnDestroy(): void {
        if (this.overlayRef) {
            this.overlayRef.dispose();
        }

        this.manualListeners.forEach((listener, event) => {
            this.elementRef.nativeElement.removeEventListener(event, listener);
        });

        this.manualListeners.clear();

        this.$unsubscribe.next();
        this.$unsubscribe.complete();
    }

    /** Create the overlay config and position strategy */
    createOverlay(): OverlayRef {
        if (this.overlayRef) { return this.overlayRef; }

        // Create connected position strategy that listens for scroll events to reposition.
        const strategy = this.overlay.position()
            .flexibleConnectedTo(this.elementRef)
            .withTransformOriginOn('.mc-tooltip')
            .withFlexibleDimensions(false)
            .withViewportMargin(VIEWPORT_MARGIN)
            .withPositions([...DEFAULT_4_POSITIONS]);

        const scrollableAncestors = this.scrollDispatcher.getAncestorScrollContainers(this.elementRef);

        strategy.withScrollableContainers(scrollableAncestors);

        strategy.positionChanges
            .pipe(takeUntil(this.destroyed))
            .subscribe((change) => {
                if (this.tooltipInstance) {
                    this.onPositionChange(change);
                    if (change.scrollableViewProperties.isOverlayClipped && this.tooltipInstance.isVisible()) {
                        // After position changes occur and the overlay is clipped by
                        // a parent scrollable then close the tooltip.
                        this.ngZone.run(() => this.hide());
                    }
                }
            });

        this.overlayRef = this.overlay.create({
            direction: this.direction,
            positionStrategy: strategy,
            panelClass: 'mc-tooltip-panel',
            scrollStrategy: this.scrollStrategy()
        });

        this.updatePosition();

        this.overlayRef.detachments()
            .pipe(takeUntil(this.destroyed))
            .subscribe(() => this.detach());

        this.overlayRef.outsidePointerEvents()
            .pipe(takeUntil(this.destroyed))
            .subscribe(() => this.tooltipInstance?.handleBodyInteraction());

        return this.overlayRef;
    }

    detach() {
        if (this.overlayRef && this.overlayRef.hasAttached()) {
            this.overlayRef.detach();
        }

        this.tooltipInstance = null;
    }

    onPositionChange($event: ConnectedOverlayPositionChange): void {
        let newPlacement = this.placement;

        Object
            .keys(this.availablePositions)
            .some((key) => {
                if (
                    $event.connectionPair.originX === this.availablePositions[key].originX &&
                    $event.connectionPair.originY === this.availablePositions[key].originY &&
                    $event.connectionPair.overlayX === this.availablePositions[key].overlayX &&
                    $event.connectionPair.overlayY === this.availablePositions[key].overlayY
                ) {
                    newPlacement = key;

                    return true;
                }

                return false;
            });


        if (this.tooltipInstance) {
            this.tooltipInstance.placement = newPlacement;
            this.tooltipInstance.updateClassMap();
            this.tooltipInstance.markForCheck();
        }

        this.handlePositioningUpdate();
    }

    handlePositioningUpdate() {
        this.overlayRef = this.createOverlay();

        if (this.placement === 'right' || this.placement === 'left') {
            const halfDelimiter = 2;
            const overlayElemHeight = this.overlayRef.overlayElement.clientHeight;
            const currentContainerHeight = this.hostView.element.nativeElement.clientHeight;

            if (this.arrowPlacement === ArrowPlacements.Center) {
                const arrowElemRef = this.getTooltipArrowElem();
                const containerPositionTop: number = this.hostView.element.nativeElement.getBoundingClientRect().top;
                const halfOfContainerHeight = currentContainerHeight / halfDelimiter;
                const halfOfTooltipHeight = overlayElemHeight / halfDelimiter;

                this.overlayRef.overlayElement.style.top = `${
                    (containerPositionTop + halfOfContainerHeight) - halfOfTooltipHeight + 1
                }px`;

                if (arrowElemRef) {
                    arrowElemRef.setAttribute('style', `top: ${halfOfTooltipHeight - 1}px`);
                }
            } else {
                const pos = (overlayElemHeight - currentContainerHeight) / halfDelimiter;
                const defaultTooltipPlacementTop = parseInt(this.overlayRef.overlayElement.style.top || '0px', 10);

                this.overlayRef.overlayElement.style.top = `${defaultTooltipPlacementTop + pos - 1}px`;
            }
        }
    }

    handleKeydown(e: KeyboardEvent) {
        if (this.isTooltipOpen && e.keyCode === ESCAPE) { // tslint:disable-line
            this.hide();
        }
    }

    handleTouchend() {
        this.hide();
    }

    initElementRefListeners() {
        this.clearListeners();

        if (this.trigger.includes('hover')) {
            this.manualListeners
                .set('mouseenter', () => this.show())
                .set('mouseleave', () => this.hide())
                .forEach((listener, event) => this.elementRef.nativeElement.addEventListener(event, listener));
        }

        if (this.trigger.includes('focus')) {
            this.manualListeners
                .set('focus', () => this.show())
                .set('blur', () => this.hide())
                .forEach((listener, event) => this.elementRef.nativeElement.addEventListener(event, listener));
        }
    }

    clearListeners() {
        this.manualListeners.forEach((listener, event) => {
            this.elementRef.nativeElement.removeEventListener(event, listener);
        });

        this.manualListeners.clear();
    }

    show(delay: number = this.enterDelay): void {
        if (this.disabled) { return; }

        if (!this.tooltipInstance) {
            this.overlayRef = this.createOverlay();
            this.detach();

            this.portal = this.portal || new ComponentPortal(McTooltipComponent, this.hostView);

            this.tooltipInstance = this.overlayRef.attach(this.portal).instance;
            this.tooltipInstance.afterHidden()
                .pipe(takeUntil(this.destroyed))
                .subscribe(() => this.detach());

            this.tooltipInstance.tooltipClass = this.tooltipClass;
            this.tooltipInstance.placement = this.placement;
            this.tooltipInstance.title = this.title;

            this.tooltipInstance.visibleChange
                .pipe(takeUntil(this.$unsubscribe), distinctUntilChanged())
                .subscribe((data) => {
                    this.visible = data;
                    this.mcVisibleChange.emit(data);
                    this.isTooltipOpen = data;
                });
        }

        this.updatePosition();
        this.tooltipInstance.show(delay);
    }

    hide(delay: number = this.leaveDelay): void {
        if (this.tooltipInstance) {
            this.tooltipInstance.hide(delay);
        }
    }

    /** Updates the position of the current tooltip. */
    updatePosition() {
        if (!this.overlayRef) {
            this.overlayRef = this.createOverlay();
        }

        const position = this.overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy;
        const origin = this.getOrigin();
        const overlay = this.getOverlayPosition();

        position.withPositions([
            { ...origin.main, ...overlay.main },
            { ...origin.fallback, ...overlay.fallback }
        ]);

        if (this.tooltipInstance) {
            position.apply();
            window.dispatchEvent(new Event('resize'));
        }
    }

    /**
     * Returns the origin position and a fallback position based on the user's position preference.
     * The fallback position is the inverse of the origin (e.g. `'below' -> 'above'`).
     */
    getOrigin(): {main: OriginConnectionPosition; fallback: OriginConnectionPosition} {
        const position = this.placement;
        const isLtr = !this.direction || this.direction.value === 'ltr';
        let originPosition: OriginConnectionPosition;

        if (position === 'top' || position === 'bottom') {
            originPosition = { originX: 'center', originY: position === 'top' ? 'top' : 'bottom' };
        } else if (
            position === 'top' ||
            (position === 'left' && isLtr) ||
            (position === 'right' && !isLtr)) {
            originPosition = { originX: 'start', originY: 'center' };
        } else if (
            position === 'bottom' ||
            (position === 'right' && isLtr) ||
            (position === 'left' && !isLtr)) {
            originPosition = { originX: 'end', originY: 'center' };
        } else {
            throw getMcTooltipInvalidPositionError(position);
        }

        const {x, y} = this.invertPosition(originPosition.originX, originPosition.originY);

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
        } else if (
            position === 'top' ||
            (position === 'left' && isLtr) ||
            (position === 'right' && !isLtr)) {
            overlayPosition = { overlayX: 'end', overlayY: 'center' };
        } else if (
            position === 'bottom' ||
            (position === 'right' && isLtr) ||
            (position === 'left' && !isLtr)) {
            overlayPosition = { overlayX: 'start', overlayY: 'center' };
        } else {
            throw getMcTooltipInvalidPositionError(position);
        }

        const {x, y} = this.invertPosition(overlayPosition.overlayX, overlayPosition.overlayY);

        return {
            main: overlayPosition,
            fallback: { overlayX: x, overlayY: y }
        };
    }

    /** Inverts an overlay position. */
    private invertPosition(x: HorizontalConnectionPos, y: VerticalConnectionPos) {
        let newX: HorizontalConnectionPos = x;
        let newY: VerticalConnectionPos = y;
        if (this.placement === 'top' || this.placement === 'bottom') {
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

    private getTooltipArrowElem() {
        const arrowClassName = 'mc-tooltip-arrow';

        return this.overlayRef?.overlayElement.getElementsByClassName(arrowClassName)[0];
    }
}
