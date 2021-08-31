import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    ConnectedOverlayPositionChange,
    ConnectionPositionPair,
    FlexibleConnectedPositionStrategy,
    Overlay,
    OverlayRef,
    ScrollDispatcher
} from '@angular/cdk/overlay';
import { OverlayConfig } from '@angular/cdk/overlay/overlay-config';
import { ComponentPortal } from '@angular/cdk/portal';
import {
    Directive,
    ElementRef,
    EventEmitter,
    Input,
    NgZone,
    Output,
    TemplateRef,
    Type,
    ViewContainerRef
} from '@angular/core';
import { ESCAPE } from '@ptsecurity/cdk/keycodes';
import { Observable, Subject } from 'rxjs';
import { delay as rxDelay, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import {
    DEFAULT_4_POSITIONS_TO_CSS_MAP,
    EXTENDED_OVERLAY_POSITIONS,
    POSITION_MAP,
    POSITION_PRIORITY_STRATEGY
} from '../overlay/overlay-position-map';

import { PopUpTriggers } from './constants';


const VIEWPORT_MARGIN: number = 8;

@Directive()
// tslint:disable-next-line:naming-convention
export abstract class McBasePopUpTrigger<T> {
    isOpen: boolean = false;

    @Input('mcEnterDelay') enterDelay: number = 0;
    @Input('mcLeaveDelay') leaveDelay: number = 0;

    @Output('mcPlacementChange') placementChange: EventEmitter<string> = new EventEmitter();

    @Output('mcVisibleChange') visibleChange = new EventEmitter<boolean>();

    @Input('mcPlacementPriority')
    get placementPriority() {
        return this._placementPriority;
    }

    set placementPriority(value) {
        if (value && value.length > 0) {
            this._placementPriority = value;
        } else {
            this._placementPriority = null;
        }
    }

    private _placementPriority: string | string[] | null = null;

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

    private _visible = false;

    abstract disabled: boolean;
    abstract trigger: string;
    abstract customClass: string;
    abstract content: string | TemplateRef<any>;

    protected abstract originSelector: string;
    protected abstract overlayConfig: OverlayConfig;

    // tslint:disable-next-line:naming-convention orthodox-getter-and-setter
    protected _disabled: boolean = false;
    // tslint:disable-next-line:naming-convention orthodox-getter-and-setter
    protected _customClass: string;

    protected overlayRef: OverlayRef | null;
    protected portal: ComponentPortal<T>;
    protected instance: any | null;

    protected listeners = new Map<string, EventListenerOrEventListenerObject>();

    protected readonly availablePositions: { [key: string]: ConnectionPositionPair };
    protected readonly defaultPositionsMap: { [key: string]: string };
    protected readonly destroyed = new Subject<void>();

    protected constructor(
        protected overlay: Overlay,
        protected elementRef: ElementRef,
        protected ngZone: NgZone,
        protected scrollDispatcher: ScrollDispatcher,
        protected hostView: ViewContainerRef,
        protected scrollStrategy,
        protected direction?: Directionality
    ) {
        this.availablePositions = POSITION_MAP;

        this.defaultPositionsMap = DEFAULT_4_POSITIONS_TO_CSS_MAP;
    }

    abstract updateClassMap(newPlacement?: string): void;

    abstract updateData(): void;

    abstract handlePositioningUpdate(placement?: string): void;

    abstract closingActions(): Observable<any>;

    abstract getOverlayHandleComponentType(): Type<T>;

    ngOnInit(): void {
        this.initListeners();
    }

    ngOnDestroy(): void {
        if (this.overlayRef) {
            this.overlayRef.dispose();
        }

        this.listeners.forEach(this.removeEventListener);

        this.listeners.clear();

        this.destroyed.next();
        this.destroyed.complete();
    }

    handleKeydown(event: KeyboardEvent) {
        if (this.isOpen && event.keyCode === ESCAPE) { // tslint:disable-line
            this.hide();
        }
    }

    handleTouchend() {
        this.hide();
    }

    show(delay: number = this.enterDelay): void {
        if (this.disabled || this.instance) { return; }

        this.overlayRef = this.createOverlay();
        this.detach();

        this.portal = this.portal || new ComponentPortal(this.getOverlayHandleComponentType(), this.hostView);

        this.instance = this.overlayRef.attach(this.portal).instance;

        this.instance.afterHidden()
            .pipe(takeUntil(this.destroyed))
            .subscribe(this.detach);

        this.updateClassMap();

        this.updateData();

        this.instance.visibleChange
            .pipe(takeUntil(this.destroyed), distinctUntilChanged())
            .subscribe((value) => {
                this.visible = value;
                this.visibleChange.emit(value);
                this.isOpen = value;
            });

        this.updatePosition();

        this.instance.show(delay);
    }

    hide(delay: number = this.leaveDelay): void {
        if (this.instance) {
            this.instance.hide(delay);
        }
    }

    detach = (): void => {
        if (this.overlayRef && this.overlayRef.hasAttached()) {
            this.overlayRef.detach();
        }

        this.instance = null;
    }

    /** Create the overlay config and position strategy */
    createOverlay(): OverlayRef {
        if (this.overlayRef) { return this.overlayRef; }

        // Create connected position strategy that listens for scroll events to reposition.
        const strategy = this.overlay.position()
            .flexibleConnectedTo(this.elementRef)
            .withTransformOriginOn(this.originSelector)
            .withFlexibleDimensions(false)
            .withViewportMargin(VIEWPORT_MARGIN)
            .withPositions([...EXTENDED_OVERLAY_POSITIONS])
            .withScrollableContainers(this.scrollDispatcher.getAncestorScrollContainers(this.elementRef));

        strategy.positionChanges
            .pipe(takeUntil(this.destroyed))
            .subscribe(this.onPositionChange);

        this.overlayRef = this.overlay.create({
            ...this.overlayConfig,
            direction: this.direction,
            positionStrategy: strategy,
            scrollStrategy: this.scrollStrategy()
        });

        // this.updatePosition();

        this.closingActions()
            .pipe(takeUntil(this.destroyed))
            .pipe(rxDelay(0))
            .subscribe(() => this.hide());

        this.overlayRef.outsidePointerEvents()
            .subscribe(() => this.instance!.handleBodyInteraction());

        this.overlayRef.detachments()
            .pipe(takeUntil(this.destroyed))
            .subscribe(this.detach);

        return this.overlayRef;
    }

    onPositionChange = ($event: ConnectedOverlayPositionChange): void => {
        if (!this.instance) { return; }

        let newPlacement = this.placement;

        const { originX, originY, overlayX, overlayY } = $event.connectionPair;

        Object.keys(this.availablePositions).some((key) => {
            if (
                originX === this.availablePositions[key].originX && originY === this.availablePositions[key].originY &&
                overlayX === this.availablePositions[key].overlayX && overlayY === this.availablePositions[key].overlayY
            ) {
                newPlacement = key;

                return true;
            }

            return false;
        });

        this.placementChange.emit(newPlacement);

        this.updateClassMap(newPlacement);

        if (!this.defaultPositionsMap[newPlacement]) {
            this.handlePositioningUpdate(newPlacement);
        }

        if ($event.scrollableViewProperties.isOverlayClipped && this.instance.isVisible()) {
            // After position changes occur and the overlay is clipped by
            // a parent scrollable then close the tooltip.
            this.ngZone.run(() => this.hide());
        }
    }

    initListeners() {
        this.clearListeners();

        if (this.trigger.includes(PopUpTriggers.Click)) {
            this.listeners
                .set('click', () => this.show())
                .forEach(this.addEventListener);
        }

        if (this.trigger.includes(PopUpTriggers.Hover)) {
            this.listeners
                .set('mouseenter', () => this.show())
                .set('mouseleave', () => this.hide())
                .forEach(this.addEventListener);
        }

        if (this.trigger.includes(PopUpTriggers.Focus)) {
            this.listeners
                .set('focus', () => this.show())
                .set('blur', () => this.hide())
                .forEach(this.addEventListener);
        }
    }

    /** Updates the position of the current popover. */
    updatePosition(reapplyPosition: boolean = false) {
        console.log('updatePosition: ');
        this.overlayRef = this.createOverlay();

        const position = (this.overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy)
            .withPositions(this.getPrioritizedPositions())
            .withPush(true);

        if (reapplyPosition) {
            setTimeout(() => position.reapplyLastPosition());
        }
    }

    protected getPriorityPlacementStrategy(value: string | string[]): ConnectionPositionPair[] {
        const result: ConnectionPositionPair[] = [];
        const possiblePositions = Object.keys(this.availablePositions);

        if (Array.isArray(value)) {
            value.forEach((position: string) => {
                if (possiblePositions.includes(position)) {
                    result.push(this.availablePositions[position]);
                }
            });
        } else if (possiblePositions.includes(value)) {
            result.push(this.availablePositions[value]);
        }

        return result;
    }

    protected getPrioritizedPositions() {
        if (this.placementPriority) {
            return this.getPriorityPlacementStrategy(this.placementPriority);
        }

        return POSITION_PRIORITY_STRATEGY[this.placement];
    }

    protected clearListeners() {
        this.listeners.forEach(this.removeEventListener);

        this.listeners.clear();
    }

    private addEventListener = (listener: EventListener | EventListenerObject, event: string) => {
        this.elementRef.nativeElement.addEventListener(event, listener);
    }

    private removeEventListener = (listener: EventListener | EventListenerObject, event: string) => {
        this.elementRef.nativeElement.addEventListener(event, listener);
    }
}
