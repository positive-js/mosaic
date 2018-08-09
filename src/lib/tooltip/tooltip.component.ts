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
import { Directionality } from '@ptsecurity/cdk/bidi';
import { coerceBooleanProperty } from '@ptsecurity/cdk/coercion';
import { ESCAPE } from '@ptsecurity/cdk/keycodes';
import {
    ConnectedOverlayPositionChange,
    ConnectionPositionPair,
    Overlay,
    OverlayRef,
    ScrollDispatcher,
    IScrollStrategy,
    FlexibleConnectedPositionStrategy,
    IOverlayConnectionPosition,
    IOriginConnectionPosition,
    HorizontalConnectionPos,
    VerticalConnectionPos
} from '@ptsecurity/cdk/overlay';
import { ComponentPortal } from '@ptsecurity/cdk/portal';
import {
    fadeAnimation,
    DEFAULT_4_POSITIONS,
    POSITION_MAP
} from '@ptsecurity/mosaic/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';


@Component({
    selector: 'mc-tooltip',
    animations: [ fadeAnimation ],
    templateUrl: './tooltip.component.html',
    preserveWhitespaces: false,
    styleUrls: ['./tooltip.css'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(body:click)': 'this._handleBodyInteraction()'
    }
})

export class McToolTipComponent {
    _prefix = 'mc-tooltip_placement';
    _positions: ConnectionPositionPair[] = [ ...DEFAULT_4_POSITIONS ];
    _classMap = {};
    _placement = 'top';
    _trigger = 'hover';
    isTitleString: boolean;
    visibleSource = new BehaviorSubject<boolean>(false);
    $visible: Observable<boolean> = this.visibleSource.asObservable();
    _title: string | TemplateRef<void>;
    showTId: number;
    hideTId: number;
    availablePositions: any;

    @Output() mcVisibleChange: EventEmitter<boolean> = new EventEmitter();

    @Input() mcMouseEnterDelay = 400;

    @Input() mcMouseLeaveDelay = 0;

    @Input()
    set mcTitle(value: string | TemplateRef<void>) {
        this.isTitleString = !(value instanceof TemplateRef);

        if (this.isTitleString) {
            this._title = value;
        }
    }

    get mcTitle(): string | TemplateRef<void> {
        return this._title;
    }

    @Input()
    set mcVisible(value: boolean) {
        const visible = coerceBooleanProperty(value);

        if (this.visibleSource.value !== visible) {
            this.visibleSource.next(visible);
            this.mcVisibleChange.emit(visible);
        }
    }

    get mcVisible(): boolean {
        return this.visibleSource.value;
    }

    @Input()
    set mcTrigger(value: string) {
        this._trigger = value;
    }

    get mcTrigger(): string {
        return this._trigger;
    }

    @Input()
    set mcPlacement(value: string) {
        if (value !== this._placement) {
            this._placement = value;
            this._positions.unshift(POSITION_MAP[ this.mcPlacement ]);
        } else if (!value) {
            this._placement = 'top';
        }
    }
    get mcPlacement(): string {
        return this._placement;
    }

    /** Subject for notifying that the tooltip has been hidden from the view */
    private readonly _onHide: Subject<any> = new Subject();
    private _closeOnInteraction: boolean = false;

    constructor(public cdr: ChangeDetectorRef) {
        this.availablePositions = POSITION_MAP;
    }

    show(): void {
        if (this.hideTId) {
            clearTimeout(this.hideTId);
        }

        if (!this.isContentEmpty()) {
            this._closeOnInteraction = true;
            this.showTId = setTimeout(() => {
                this.mcVisible = true;
                this.mcVisibleChange.emit(true);

                // Mark for check so if any parent component has set the
                // ChangeDetectionStrategy to OnPush it will be checked anyways
                this._markForCheck();
            }, this.mcMouseEnterDelay);
        }
    }

    hide(): void {
        if (this.showTId) {
            clearTimeout(this.showTId);
        }

        this.hideTId = setTimeout(() => {
            this.mcVisible = false;
            this.mcVisibleChange.emit(false);
            this._onHide.next();

            // Mark for check so if any parent component has set the
            // ChangeDetectionStrategy to OnPush it will be checked anyways
            this._markForCheck();
        }, this.mcMouseLeaveDelay);
    }

    setClassMap(): void {
        this._classMap = {
            [ `${this._prefix}-${this._placement}` ]: true
        };
    }

    isContentEmpty(): boolean {
        return this.isTitleString ? (this.mcTitle === '' || !this.mcTitle) : false;
    }

    /** Returns an observable that notifies when the tooltip has been hidden from view. */
    afterHidden(): Observable<void> {
        return this._onHide.asObservable();
    }

    _markForCheck(): void {
        this.cdr.markForCheck();
    }

    _handleBodyInteraction(): void {
        if (this._closeOnInteraction) {
            this.hide();
        }
    }
}

export const MC_TOOLTIP_SCROLL_STRATEGY =
    new InjectionToken<() => IScrollStrategy>('mc-tooltip-scroll-strategy');

/** @docs-private */
export function MC_TOOLTIP_SCROLL_STRATEGY_FACTORY(overlay: Overlay): () => IScrollStrategy {
    return () => overlay.scrollStrategies.reposition({scrollThrottle: 20});
}

/** @docs-private */
export const MC_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER = {
    provide: MC_TOOLTIP_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: MC_TOOLTIP_SCROLL_STRATEGY_FACTORY
};

/** Creates an error to be thrown if the user supplied an invalid tooltip position. */
export function getMcTooltipInvalidPositionError(position: string) {
    return Error(`McTooltip position "${position}" is invalid.`);
}

const VIEWPORT_MARGIN: number = 8;

@Directive({
    selector: '[mc-tooltip]',
    host: {
        '(keydown)': 'handleKeydown($event)',
        '(touchend)': 'handleTouchend()'
    }
})

export class McTooltipDirective implements OnInit, OnDestroy {
    isTooltipOpen: boolean = false;
    isDynamicTooltip = false;
    parentDisabled: boolean = false;
    _title: string;
    _disabled: boolean = false;
    _mouseEnterDelay: number;
    _mouseLeaveDelay: number;
    _visible: boolean;
    _trigger: string = 'hover';
    _placement: string = 'top';
    _overlayRef: OverlayRef | null;
    _portal: ComponentPortal<McToolTipComponent>;
    availablePositions: any;
    tooltip: McToolTipComponent | null;

    @Output() mcVisibleChange = new EventEmitter<boolean>();
    private $unsubscribe = new Subject<void>();

    @Input('mc-tooltip')
    set mcTitle(title: string) {
        this._title = title;
        this.updateCompValue('mcTitle', title);
    }

    get mcTitle(): string {
        return this._title;
    }

    @Input('mcTitle')
    set setTitle(title: string) {
        this.mcTitle = title;
    }

    @Input('mcTooltipDisabled')
    get disabled(): boolean { return this._disabled; }
    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
    }

    @Input('mcMouseEnterDelay')
    set mcMouseEnterDelay(value: number) {
        this._mouseEnterDelay = value;
        this.updateCompValue('mcMouseEnterDelay', value);
    }

    get mcMouseEnterDelay(): number {
        return this._mouseEnterDelay;
    }

    @Input('mcMouseLeaveDelay')
    set mcMouseLeaveDelay(value: number) {
        this._mouseLeaveDelay = value;
        this.updateCompValue('mcMouseLeaveDelay', value);
    }

    get mcMouseLeaveDelay(): number {
        return this._mouseEnterDelay;
    }

    @Input('mcVisible')
    set mcVisible(value: boolean) {
        this._visible = value;
        this.updateCompValue('mcVisible', value);
    }

    get mcVisible(): boolean {
        return this._visible;
    }

    @Input('mcTrigger')
    set mcTrigger(value: string) {
        this._trigger = value;
        this.updateCompValue('mcTrigger', value);
    }

    get mcTrigger(): string {
        return this._trigger;
    }

    @Input('mcPlacement')
    set mcPlacement(value: string) {
        if (value) {
            this._placement = value;
            this.updateCompValue('mcPlacement', value);
        } else {
            this._placement = 'top';
        }
    }

    get mcPlacement(): string {
        return this._placement;
    }

    @HostBinding('class.mc-tooltip-open')
    get isOpen(): boolean {
        return this.isTooltipOpen;
    }

    @HostBinding('class.disabled')
    get isParentDisabled(): boolean {
        return this.parentDisabled;
    }

    private manualListeners = new Map<string, EventListenerOrEventListenerObject>();
    private readonly _destroyed = new Subject<void>();

    constructor(
        private _overlay: Overlay,
        private elementRef: ElementRef,
        private _ngZone: NgZone,
        private _scrollDispatcher: ScrollDispatcher,
        private hostView: ViewContainerRef,
        @Inject(MC_TOOLTIP_SCROLL_STRATEGY) private _scrollStrategy,
        @Optional() private _dir: Directionality) {
            this.availablePositions = POSITION_MAP;
        }

    /** Create the overlay config and position strategy */
    _createOverlay(): OverlayRef {
        if (this._overlayRef) {
            return this._overlayRef;
        }

        // Create connected position strategy that listens for scroll events to reposition.
        const strategy = this._overlay.position()
            .flexibleConnectedTo(this.elementRef)
            .withTransformOriginOn('.mc-tooltip')
            .withFlexibleDimensions(false)
            .withViewportMargin(VIEWPORT_MARGIN)
            .withPositions([ ...DEFAULT_4_POSITIONS ]);

        const scrollableAncestors = this._scrollDispatcher
            .getAncestorScrollContainers(this.elementRef);

        strategy.withScrollableContainers(scrollableAncestors);

        strategy.positionChanges.pipe(takeUntil(this._destroyed)).subscribe((change) => {
            if (this.tooltip) {
                this.onPositionChange(change);
                if (change.scrollableViewProperties.isOverlayClipped && this.tooltip.mcVisible) {
                    // After position changes occur and the overlay is clipped by
                    // a parent scrollable then close the tooltip.
                    this._ngZone.run(() => this.hide());
                }
            }
        });

        this._overlayRef = this._overlay.create({
            direction: this._dir,
            positionStrategy: strategy,
            panelClass: 'mc-tooltip-panel',
            scrollStrategy: this._scrollStrategy()
        });

        this._updatePosition();

        this._overlayRef.detachments()
            .pipe(takeUntil(this._destroyed))
            .subscribe(() => this._detach());

        return this._overlayRef;
    }

    _detach() {
        if (this._overlayRef && this._overlayRef.hasAttached()) {
            this._overlayRef.detach();
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
        }

        this.handlePositioningUpdate();
    }

    handlePositioningUpdate() {
        if (!this._overlayRef) {
            this._overlayRef = this._createOverlay();
        }
        if (this.mcPlacement === 'right' || this.mcPlacement === 'left') {
            const pos =
                (this._overlayRef.overlayElement.clientHeight -
                    this.hostView.element.nativeElement.clientHeight) / 2; // tslint:disable-line
            const currentContainer = this._overlayRef.overlayElement.style.top || '0px';
            this._overlayRef.overlayElement.style.top =
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

    ngOnDestroy(): void {
        if (this._overlayRef) {
            this._overlayRef.dispose();
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

    /** Updates the position of the current tooltip. */
    _updatePosition() {
        if (!this._overlayRef) {
            this._overlayRef = this._createOverlay();
        }
        const position =
            this._overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy;
        const origin = this._getOrigin();
        const overlay = this._getOverlayPosition();

        position.withPositions([
            {...origin.main, ...overlay.main},
            {...origin.fallback, ...overlay.fallback}
        ]);
    }

    /**
     * Returns the origin position and a fallback position based on the user's position preference.
     * The fallback position is the inverse of the origin (e.g. `'below' -> 'above'`).
     */
    _getOrigin(): {main: IOriginConnectionPosition; fallback: IOriginConnectionPosition} {
        const position = this.mcPlacement;
        const isLtr = !this._dir || this._dir.value === 'ltr';
        let originPosition: IOriginConnectionPosition;

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

        const {x, y} = this._invertPosition(originPosition.originX, originPosition.originY);

        return {
            main: originPosition,
            fallback: {originX: x, originY: y}
        };
    }

    /** Returns the overlay position and a fallback position based on the user's preference */
    _getOverlayPosition(): {main: IOverlayConnectionPosition; fallback: IOverlayConnectionPosition} {
        const position = this.mcPlacement;
        const isLtr = !this._dir || this._dir.value === 'ltr';
        let overlayPosition: IOverlayConnectionPosition;

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

        const {x, y} = this._invertPosition(overlayPosition.overlayX, overlayPosition.overlayY);

        return {
            main: overlayPosition,
            fallback: {overlayX: x, overlayY: y}
        };
    }

    /** Inverts an overlay position. */
    private _invertPosition(x: HorizontalConnectionPos, y: VerticalConnectionPos) {
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

    private show(): void {
        if (!this.disabled) {
            if (!this.tooltip) {
                const overlayRef = this._createOverlay();
                this._detach();
                this._portal = this._portal || new ComponentPortal(McToolTipComponent, this.hostView);
                this.tooltip = overlayRef.attach(this._portal).instance;
                this.tooltip.afterHidden()
                    .pipe(takeUntil(this._destroyed))
                    .subscribe(() => this._detach());
                this.isDynamicTooltip = true;
                const properties = [
                    'mcTitle',
                    'mcMouseEnterDelay',
                    'mcMouseLeaveDelay',
                    'mcVisible',
                    'mcTrigger',
                    'mcPlacement' ];
                properties.forEach((property) => this.updateCompValue(property, this[ property ]));
                this.tooltip.mcVisibleChange.pipe(takeUntil(this.$unsubscribe), distinctUntilChanged())
                    .subscribe((data) => {
                        this._visible = data;
                        this.mcVisibleChange.emit(data);
                    });
            }
            this._updatePosition();
            this.tooltip.show();
            this.isTooltipOpen = true;
        }
    }

    private hide(): void {
        if (this.tooltip) {
            this.tooltip.hide();
            this.isTooltipOpen = false;
        }
    }
}
