import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    ConnectedOverlayPositionChange,
    ConnectionPositionPair,
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
    HostBinding,
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
    fadeAnimation,
    DEFAULT_4_POSITIONS,
    POSITION_MAP
} from '@ptsecurity/mosaic/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';


@Component({
    selector: 'mc-tooltip-component',
    inputs: [
        'mcMouseEnterDelay',
        'mcMouseLeaveDelay',
        'mcTitle',
        'mcVisible',
        'mcTrigger',
        'mcPlacement'
    ],
    outputs: ['mcVisibleChange'],
    animations: [ fadeAnimation ],
    templateUrl: './tooltip.component.html',
    preserveWhitespaces: false,
    styleUrls: ['./tooltip.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(body:click)': 'this.handleBodyInteraction()'
    }
})
export class McTooltipComponent {
    prefix = 'mc-tooltip_placement';
    positions: ConnectionPositionPair[] = [...DEFAULT_4_POSITIONS];
    classMap = {};
    isTitleString: boolean;
    showTid: any;
    hideTid: any;
    availablePositions: any;
    $visible: Observable<boolean>;

    @Output() mcVisibleChange: EventEmitter<boolean> = new EventEmitter();

    @Input() mcMouseEnterDelay = 400;

    @Input() mcMouseLeaveDelay = 0;

    @Input()
    get mcTitle(): string | TemplateRef<void> {
        return this._mcTitle;
    }

    set mcTitle(value: string | TemplateRef<void>) {
        this.isTitleString = !(value instanceof TemplateRef);

        if (this.isTitleString) {
            this._mcTitle = value;
        }
    }

    private _mcTitle: string | TemplateRef<void>;

    @Input()
    get mcTrigger(): string {
        return this._mcTrigger;
    }

    set mcTrigger(value: string) {
        this._mcTrigger = value;
    }

    private _mcTrigger: string = 'hover';

    @Input()
    get mcPlacement(): string {
        return this._mcPlacement;
    }

    set mcPlacement(value: string) {
        if (value !== this._mcPlacement) {
            this._mcPlacement = value;
            this.positions.unshift(POSITION_MAP[ this.mcPlacement ]);
        } else if (!value) {
            this._mcPlacement = 'top';
        }
    }

    private _mcPlacement: string = 'top';

    @Input()
    get mcVisible(): boolean {
        return this._mcVisible.value;
    }

    set mcVisible(value: boolean) {
        const visible = coerceBooleanProperty(value);

        if (visible && this._mcVisible.value !== visible) {
            this.show();
        } else {
            this.hide();
        }
    }

    private _mcVisible: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    /** Subject for notifying that the tooltip has been hidden from the view */
    private readonly onHideSubject: Subject<any> = new Subject();
    private closeOnInteraction: boolean = false;

    constructor(public cdr: ChangeDetectorRef) {
        this.availablePositions = POSITION_MAP;
        this.$visible = this._mcVisible.asObservable();
    }

    show(): void {
        if (this.hideTid) {
            clearTimeout(this.hideTid);
        }

        if (!this.isContentEmpty()) {
            if (this.mcTrigger !== 'manual') {
                this.closeOnInteraction = true;
            }

            this.showTid = setTimeout(() => {
                this._mcVisible.next(true);
                this.mcVisibleChange.emit(true);

                // Mark for check so if any parent component has set the
                // ChangeDetectionStrategy to OnPush it will be checked anyways
                this.markForCheck();
            }, this.mcMouseEnterDelay);
        }
    }

    hide(): void {
        if (this.showTid) {
            clearTimeout(this.showTid);
        }

        this.hideTid = setTimeout(() => {
            this._mcVisible.next(false);
            this.mcVisibleChange.emit(false);
            this.onHideSubject.next();

            // Mark for check so if any parent component has set the
            // ChangeDetectionStrategy to OnPush it will be checked anyways
            this.markForCheck();
        }, this.mcMouseLeaveDelay);
    }

    setClassMap(): void {
        this.classMap = `${this.prefix}-${this.mcPlacement}`;
    }

    isContentEmpty(): boolean {
        return this.isTitleString ? (this.mcTitle === '' || !this.mcTitle) : false;
    }

    /** Returns an observable that notifies when the tooltip has been hidden from view. */
    afterHidden(): Observable<void> {
        return this.onHideSubject.asObservable();
    }

    markForCheck(): void {
        this.cdr.markForCheck();
    }

    handleBodyInteraction(): void {
        if (this.closeOnInteraction) {
            this.hide();
        }
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
    selector: '[mcTooltip], [attribute^="mcTooltip"]',
    exportAs: 'mcTooltip',
    host: {
        '(keydown)': 'handleKeydown($event)',
        '(touchend)': 'handleTouchend()'
    }
})
export class McTooltip implements OnInit, OnDestroy {
    isTooltipOpen: boolean = false;
    isDynamicTooltip = false;
    parentDisabled: boolean = false;
    overlayRef: OverlayRef | null;
    portal: ComponentPortal<McTooltipComponent>;
    availablePositions: any;
    tooltip: McTooltipComponent | null;

    @Output() mcVisibleChange = new EventEmitter<boolean>();
    private $unsubscribe = new Subject<void>();

    @Input('mcTooltip')
    get mcTitle(): string {
        return this._mcTitle;
    }
    set mcTitle(title: string) {
        this._mcTitle = title;
        this.updateCompValue('mcTitle', title);
    }
    private _mcTitle: string;

    @Input('mcTitle')
    set setTitle(title: string) {
        this.mcTitle = title;
    }

    @Input('mcTooltipDisabled')
    get disabled(): boolean { return this._disabled; }
    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
        this.updateCompValue('mcTooltipDisabled', value);
    }
    private _disabled: boolean = false;

    @Input('mcMouseEnterDelay')
    get mcMouseEnterDelay(): number {
        return this._mcMouseEnterDelay;
    }
    set mcMouseEnterDelay(value: number) {
        this._mcMouseEnterDelay = value;
        this.updateCompValue('mcMouseEnterDelay', value);
    }
    private _mcMouseEnterDelay: number;

    @Input('mcMouseLeaveDelay')
    get mcMouseLeaveDelay(): number {
        return this._mcMouseLeaveDelay;
    }
    set mcMouseLeaveDelay(value: number) {
        this._mcMouseLeaveDelay = value;
        this.updateCompValue('mcMouseLeaveDelay', value);
    }
    private _mcMouseLeaveDelay: number;

    @Input('mcTrigger')
    get mcTrigger(): string {
        return this._mcTrigger;
    }
    set mcTrigger(value: string) {
        if (value) {
            this._mcTrigger = value;
            this.updateCompValue('mcTrigger', value);
        } else {
            this._mcTrigger = 'hover';
        }
    }
    private _mcTrigger: string = 'hover';

    @Input('mcPlacement')
    get mcPlacement(): string {
        return this._mcPlacement;
    }
    set mcPlacement(value: string) {
        if (value) {
            this._mcPlacement = value;
            this.updateCompValue('mcPlacement', value);
        } else {
            this._mcPlacement = 'top';
        }
    }
    private _mcPlacement: string = 'top';

    @Input('mcTooltipClass')
    get mcTooltipClass() { return this._mcTooltipClass; }
    set mсTooltipClass(value: string | string[] | Set<string> | {[key: string]: any}) {
        this._mcTooltipClass = value;

        if (this.tooltip) {
            this.tooltip.setClassMap();
        }
    }
    private _mcTooltipClass: string | string[] | Set<string> | {[key: string]: any};

    @Input('mcVisible')
    get mcVisible(): boolean {
        return this._mcVisible;
    }
    set mcVisible(externalValue: boolean) {
        const value = coerceBooleanProperty(externalValue);

        if (this._mcVisible !== value) {
            this._mcVisible = value;
            this.updateCompValue('mcVisible', value);

            if (value) {
                this.show();
            } else {
                this.hide();
            }
        }
    }
    private _mcVisible: boolean;

    @HostBinding('class.mc-tooltip-open')
    get isOpen(): boolean {
        return this.isTooltipOpen;
    }

    @HostBinding('class.disabled')
    get isParentDisabled(): boolean {
        return this.parentDisabled;
    }

    private manualListeners = new Map<string, EventListenerOrEventListenerObject>();
    private readonly destroyed = new Subject<void>();

    constructor(
        private overlay: Overlay,
        private elementRef: ElementRef,
        private ngZone: NgZone,
        private scrollDispatcher: ScrollDispatcher,
        private hostView: ViewContainerRef,
        @Inject(MC_TOOLTIP_SCROLL_STRATEGY) private scrollStrategy,
        @Optional() private direction: Directionality) {
            this.availablePositions = POSITION_MAP;
        }

    /** Create the overlay config and position strategy */
    createOverlay(): OverlayRef {
        if (this.overlayRef) {
            return this.overlayRef;
        }

        // Create connected position strategy that listens for scroll events to reposition.
        const strategy = this.overlay.position()
            .flexibleConnectedTo(this.elementRef)
            .withTransformOriginOn('.mc-tooltip')
            .withFlexibleDimensions(false)
            .withViewportMargin(VIEWPORT_MARGIN)
            .withPositions([ ...DEFAULT_4_POSITIONS ]);

        const scrollableAncestors = this.scrollDispatcher
            .getAncestorScrollContainers(this.elementRef);

        strategy.withScrollableContainers(scrollableAncestors);

        strategy.positionChanges.pipe(takeUntil(this.destroyed)).subscribe((change) => {
            if (this.tooltip) {
                this.onPositionChange(change);
                if (change.scrollableViewProperties.isOverlayClipped && this.tooltip.mcVisible) {
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

        return this.overlayRef;
    }

    detach() {
        if (this.overlayRef && this.overlayRef.hasAttached()) {
            this.overlayRef.detach();
        }

        this.tooltip = null;
    }

    onPositionChange($event: ConnectedOverlayPositionChange): void {
        let updatedPlacement = this.mcPlacement;
        Object.keys(this.availablePositions).some((key) => {
            if ($event.connectionPair.originX === this.availablePositions[key].originX &&
                $event.connectionPair.originY === this.availablePositions[key].originY &&
                $event.connectionPair.overlayX === this.availablePositions[key].overlayX &&
                $event.connectionPair.overlayY === this.availablePositions[key].overlayY) {
                updatedPlacement = key;

                return true;
            }

            return false;
        });
        this.updateCompValue('mcPlacement', updatedPlacement);

        if (this.tooltip) {
            this.tooltip.setClassMap();
            this.tooltip.markForCheck();
        }

        this.handlePositioningUpdate();
    }

    handlePositioningUpdate() {
        if (!this.overlayRef) {
            this.overlayRef = this.createOverlay();
        }
        if (this.mcPlacement === 'right' || this.mcPlacement === 'left') {
            const pos =
                (this.overlayRef.overlayElement.clientHeight -
                    this.hostView.element.nativeElement.clientHeight) / 2; // tslint:disable-line
            const currentContainer = this.overlayRef.overlayElement.style.top || '0px';
            this.overlayRef.overlayElement.style.top =
                `${parseInt(currentContainer.split('px')[0], 10) + pos - 1}px`;
            // TODO: обновлять положение стрелки\указателя\"дятла"
        }
    }

    // tslint:disable-next-line:no-any
    updateCompValue(key: string, value: any): void {
        if (this.isDynamicTooltip && value) {
            if (this.tooltip) {
                this.tooltip[key] = value;
            }
        }
    }

    ngOnInit(): void {
        this.initElementRefListeners();
    }

    ngOnDestroy(): void {
        if (this.overlayRef) {
            this.overlayRef.dispose();
        }
        this.manualListeners.forEach((listener, event) =>
            this.elementRef.nativeElement.removeEventListener(event, listener));
        this.manualListeners.clear();

        this.$unsubscribe.next();
        this.$unsubscribe.complete();
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
        if (this.mcTrigger === 'hover') {

            this.manualListeners
                .set('mouseenter', () => this.show())
                .set('mouseleave', () => this.hide())
                .forEach((listener, event) => this.elementRef.nativeElement.addEventListener(event, listener));
        }

        if (this.mcTrigger === 'focus') {

            this.manualListeners
                .set('focus', () => this.show())
                .set('blur', () => this.hide())
                .forEach((listener, event) => this.elementRef.nativeElement.addEventListener(event, listener));
        }
    }

    show(): void {
        if (!this.disabled) {
            if (!this.tooltip) {
                const overlayRef = this.createOverlay();
                this.detach();

                this.portal = this.portal || new ComponentPortal(McTooltipComponent, this.hostView);

                this.tooltip = overlayRef.attach(this.portal).instance;
                this.tooltip.afterHidden()
                    .pipe(takeUntil(this.destroyed))
                    .subscribe(() => this.detach());
                this.isDynamicTooltip = true;
                const properties = [
                    'mcTitle',
                    'mcPlacement',
                    'mcTrigger',
                    'mcTooltipDisabled',
                    'mcMouseEnterDelay',
                    'mcMouseLeaveDelay',
                    'mсTooltipClass'
                ];
                properties.forEach((property) => this.updateCompValue(property, this[ property ]));
                this.tooltip.mcVisibleChange.pipe(takeUntil(this.$unsubscribe), distinctUntilChanged())
                    .subscribe((data) => {
                        this.mcVisible = data;
                        this.mcVisibleChange.emit(data);
                        this.isTooltipOpen = data;
                    });
            }
            this.updatePosition();
            this.tooltip.show();
        }
    }

    hide(): void {
        if (this.tooltip) {
            this.tooltip.hide();
        }
    }

    /** Updates the position of the current tooltip. */
    updatePosition() {
        if (!this.overlayRef) {
            this.overlayRef = this.createOverlay();
        }
        const position =
            this.overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy;
        const origin = this.getOrigin();
        const overlay = this.getOverlayPosition();

        position.withPositions([
            {...origin.main, ...overlay.main},
            {...origin.fallback, ...overlay.fallback}
        ]);
    }

    /**
     * Returns the origin position and a fallback position based on the user's position preference.
     * The fallback position is the inverse of the origin (e.g. `'below' -> 'above'`).
     */
    getOrigin(): {main: OriginConnectionPosition; fallback: OriginConnectionPosition} {
        const position = this.mcPlacement;
        const isLtr = !this.direction || this.direction.value === 'ltr';
        let originPosition: OriginConnectionPosition;

        if (position === 'top' || position === 'bottom') {
            originPosition = {originX: 'center', originY: position === 'top' ? 'top' : 'bottom'};
        } else if (
            position === 'top' ||
            (position === 'left' && isLtr) ||
            (position === 'right' && !isLtr)) {
            originPosition = {originX: 'start', originY: 'center'};
        } else if (
            position === 'bottom' ||
            (position === 'right' && isLtr) ||
            (position === 'left' && !isLtr)) {
            originPosition = {originX: 'end', originY: 'center'};
        } else {
            throw getMcTooltipInvalidPositionError(position);
        }

        const {x, y} = this.invertPosition(originPosition.originX, originPosition.originY);

        return {
            main: originPosition,
            fallback: {originX: x, originY: y}
        };
    }

    /** Returns the overlay position and a fallback position based on the user's preference */
    getOverlayPosition(): {main: OverlayConnectionPosition; fallback: OverlayConnectionPosition} {
        const position = this.mcPlacement;
        const isLtr = !this.direction || this.direction.value === 'ltr';
        let overlayPosition: OverlayConnectionPosition;

        if (position === 'top') {
            overlayPosition = {overlayX: 'center', overlayY: 'bottom'};
        } else if (position === 'bottom') {
            overlayPosition = {overlayX: 'center', overlayY: 'top'};
        } else if (
            position === 'top' ||
            (position === 'left' && isLtr) ||
            (position === 'right' && !isLtr)) {
            overlayPosition = {overlayX: 'end', overlayY: 'center'};
        } else if (
            position === 'bottom' ||
            (position === 'right' && isLtr) ||
            (position === 'left' && !isLtr)) {
            overlayPosition = {overlayX: 'start', overlayY: 'center'};
        } else {
            throw getMcTooltipInvalidPositionError(position);
        }

        const {x, y} = this.invertPosition(overlayPosition.overlayX, overlayPosition.overlayY);

        return {
            main: overlayPosition,
            fallback: {overlayX: x, overlayY: y}
        };
    }

    /** Inverts an overlay position. */
    private invertPosition(x: HorizontalConnectionPos, y: VerticalConnectionPos) {
        let newX: HorizontalConnectionPos = x;
        let newY: VerticalConnectionPos = y;
        if (this.mcPlacement === 'top' || this.mcPlacement === 'bottom') {
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

        return {x: newX, y: newY};
    }
}
