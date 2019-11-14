import { AnimationEvent } from '@angular/animations';
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
    EXTENDED_OVERLAY_POSITIONS,
    POSITION_MAP,
    POSITION_TO_CSS_MAP
} from '@ptsecurity/mosaic/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { mcPopoverAnimations } from './popover-animations';


enum PopoverTriggers {
    Click = 'click',
    Focus = 'focus',
    Hover = 'hover'
}


export type PopoverVisibility = 'initial' | 'visible' | 'hidden';

@Component({
    selector: 'mc-popover',
    templateUrl: './popover.component.html',
    preserveWhitespaces: false,
    styleUrls: ['./popover.css'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [mcPopoverAnimations.popoverState],
    host: {
        '[class]': 'getCssClassesList'
    }
})
export class McPopoverComponent {
    positions: ConnectionPositionPair[] = [ ...EXTENDED_OVERLAY_POSITIONS ];
    availablePositions: any;
    popoverVisibility: PopoverVisibility = 'initial';
    closeOnInteraction: boolean = false;
    mcContent: string | TemplateRef<any>;
    mcHeader: string | TemplateRef<any>;
    mcFooter: string | TemplateRef<any>;

    @Output('mcPopoverVisibleChange') mcVisibleChange: EventEmitter<boolean> = new EventEmitter();

    get mcTrigger(): string {
        return this._mcTrigger;
    }
    set mcTrigger(value: string) {
        this._mcTrigger = value;
    }
    private _mcTrigger: string = PopoverTriggers.Hover;

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

    get mcPopoverSize(): string {
        return this.popoverSize;
    }
    set mcPopoverSize(value: string) {
        if (value !== this.popoverSize) {
            this.popoverSize = value;
        } else if (!value) {
            this.popoverSize = 'normal';
        }
    }
    private popoverSize: string;

    get mcVisible(): boolean {
        return this._mcVisible.value;
    }
    set mcVisible(value: boolean) {
        const visible = coerceBooleanProperty(value);

        if (this._mcVisible.value !== visible) {
            this._mcVisible.next(visible);
            this.mcVisibleChange.emit(visible);
        }
    }
    private _mcVisible: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    get classList() {
        return this._classList.join(' ');
    }
    set classList(value: string | string[]) {
        let list: string[] = [];

        if (Array.isArray(value)) {
            list = value;
        } else {
            list.push(value);
        }

        this._classList = list;
    }
    private _classList: string[] = [];

    get getCssClassesList(): string {
        return `${this.classList} mc-popover-${this.mcPopoverSize} mc-popover_placement-${this.getPlacementClass}`;
    }

    get getPlacementClass(): string {
        return POSITION_TO_CSS_MAP[this.mcPlacement];
    }

    /** Subject for notifying that the popover has been hidden from the view */
    private readonly onHideSubject: Subject<any> = new Subject();

    constructor(public changeDetectorRef: ChangeDetectorRef, public componentElementRef: ElementRef) {
        this.availablePositions = POSITION_MAP;
    }

    show(): void {
        if (this.isNonEmptyContent()) {
            this.closeOnInteraction = true;
            this.popoverVisibility = 'visible';
            // Mark for check so if any parent component has set the
            // ChangeDetectionStrategy to OnPush it will be checked anyways
            this.markForCheck();
        }
    }

    hide(): void {
        this.popoverVisibility = 'hidden';
        this.mcVisibleChange.emit(false);

        // Mark for check so if any parent component has set the
        // ChangeDetectionStrategy to OnPush it will be checked anyways
        this.markForCheck();
    }

    isNonEmptyContent(): boolean {
        return !!this.mcContent && (this.isTemplateRef(this.mcContent) || this.isNonEmptyString(this.mcContent));
    }

    /** Returns an observable that notifies when the popover has been hidden from view. */
    afterHidden(): Observable<void> {
        return this.onHideSubject.asObservable();
    }

    isVisible(): boolean {
        return this.popoverVisibility === 'visible';
    }

    markForCheck(): void {
        this.changeDetectorRef.markForCheck();
    }

    isTemplateRef(value: any): boolean {
        return value instanceof TemplateRef;
    }

    isNonEmptyString(value: any): boolean {
        return typeof value === 'string' && value !== '';
    }

    animationStart() {
            this.closeOnInteraction = false;
    }

    animationDone(event: AnimationEvent): void {
        const toState = event.toState as PopoverVisibility;

        if (toState === 'hidden' && !this.isVisible()) {
            this.onHideSubject.next();
        }

        if (toState === 'visible' || toState === 'hidden') {
            this.closeOnInteraction = true;
        }
    }

    ngOnDestroy() {
        this.onHideSubject.complete();
    }
}

export const MC_POPOVER_SCROLL_STRATEGY =
    new InjectionToken<() => ScrollStrategy>('mc-popover-scroll-strategy');

/** @docs-private */
export function mcPopoverScrollStrategyFactory(overlay: Overlay): () => ScrollStrategy {
    return () => overlay.scrollStrategies.reposition({scrollThrottle: 20});
}

/** @docs-private */
export const MC_POPOVER_SCROLL_STRATEGY_FACTORY_PROVIDER = {
    provide: MC_POPOVER_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: mcPopoverScrollStrategyFactory
};

/** Creates an error to be thrown if the user supplied an invalid popover position. */
export function getMcPopoverInvalidPositionError(position: string) {
    return Error(`McPopover position "${position}" is invalid.`);
}

const VIEWPORT_MARGIN: number = 8;
/** @docs-private
 * Minimal width of anchor element should be equal or greater than popover arrow width plus arrow offset right/left
 * MIN_ANCHOR_ELEMENT_WIDTH used for positioning update inside handlePositionUpdate()
 */
const MIN_ANCHOR_ELEMENT_WIDTH: number = 40;

@Directive({
    selector: '[mcPopover]',
    exportAs: 'mcPopover',
    host: {
        '(keydown)': 'handleKeydown($event)',
        '(touchend)': 'handleTouchend()',
        '[class.mc-popover_open]': 'isOpen'
    }
})
export class McPopover implements OnInit, OnDestroy {
    isPopoverOpen: boolean = false;
    isDynamicPopover = false;
    overlayRef: OverlayRef | null;
    portal: ComponentPortal<McPopoverComponent>;
    availablePositions: any;
    popover: McPopoverComponent | null;

    @Output('mcPopoverVisibleChange') mcVisibleChange = new EventEmitter<boolean>();

    @Input('mcPopoverHeader')
    get mcHeader(): string | TemplateRef<any> {
        return this._mcHeader;
    }
    set mcHeader(value: string | TemplateRef<any>) {
        this._mcHeader = value;
        this.updateCompValue('mcHeader', value);

        if (this.isPopoverOpen) {
            this.updatePosition(true);
        }
    }
    private _mcHeader: string | TemplateRef<any>;

    @Input('mcPopoverContent')
    get mcContent(): string | TemplateRef<any> {
        return this._mcContent;
    }
    set mcContent(value: string | TemplateRef<any>) {
        this._mcContent = value;
        this.updateCompValue('mcContent', value);

        if (this.isPopoverOpen) {
            this.updatePosition(true);
        }
    }
    private _mcContent: string | TemplateRef<any>;

    @Input('mcPopoverFooter')
    get mcFooter(): string | TemplateRef<any> {
        return this._mcFooter;
    }
    set mcFooter(value: string | TemplateRef<any>) {
        this._mcFooter = value;
        this.updateCompValue('mcFooter', value);

        if (this.isPopoverOpen) {
            this.updatePosition(true);
        }
    }
    private _mcFooter: string | TemplateRef<any>;

    private $unsubscribe = new Subject<void>();

    @Input('mcPopoverDisabled')
    get disabled(): boolean {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
    }
    private _disabled: boolean = false;

    @Input('mcPopoverMouseEnterDelay')
    get mcMouseEnterDelay(): number {
        return this._mcMouseEnterDelay;
    }
    set mcMouseEnterDelay(value: number) {
        this._mcMouseEnterDelay = value;
        this.updateCompValue('mcMouseEnterDelay', value);
    }
    private _mcMouseEnterDelay: number;

    @Input('mcPopoverMouseLeaveDelay')
    get mcMouseLeaveDelay(): number {
        return this._mcMouseLeaveDelay;
    }
    set mcMouseLeaveDelay(value: number) {
        this._mcMouseLeaveDelay = value;
        this.updateCompValue('mcMouseLeaveDelay', value);
    }
    private _mcMouseLeaveDelay: number;

    @Input('mcPopoverTrigger')
    get mcTrigger(): string {
        return this._mcTrigger;
    }

    set mcTrigger(value: string) {
        if (value) {
            this._mcTrigger = value;
            this.updateCompValue('mcTrigger', value);
        } else {
            this._mcTrigger = PopoverTriggers.Click;
        }
    }

    private _mcTrigger: string = PopoverTriggers.Click;

    @Input('mcPopoverSize')
    get mcPopoverSize(): string {
        return this.popoverSize;
    }
    set mcPopoverSize(value: string) {
        if (value && (value === 'small' || value === 'normal' || value === 'large')) {
            this.popoverSize = value;
            this.updateCompValue('mcPopoverSize', value);
        } else {
            this.popoverSize = 'normal';
        }
    }
    private popoverSize: string = 'normal';

    @Input('mcPopoverPlacement')
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

    @Input('mcPopoverClass')
    get classList() {
        return this._classList;
    }
    set classList(value: string | string[]) {
        this._classList = value;
        this.updateCompValue('classList', this._classList);
    }
    private _classList: string | string[];

    @Input('mcPopoverVisible')
    get mcVisible(): boolean {
        return this._mcVisible;
    }

    set mcVisible(externalValue: boolean) {
        const value = coerceBooleanProperty(externalValue);
        this._mcVisible = value;
        this.updateCompValue('mcVisible', value);

        if (value) {
            this.show();
        } else {
            this.hide();
        }
    }

    private _mcVisible: boolean;

    get isOpen(): boolean {
        return this.isPopoverOpen;
    }

    private manualListeners = new Map<string, EventListenerOrEventListenerObject>();
    private readonly destroyed = new Subject<void>();

    constructor(
        private overlay: Overlay,
        private elementRef: ElementRef,
        private ngZone: NgZone,
        private scrollDispatcher: ScrollDispatcher,
        private hostView: ViewContainerRef,
        @Inject(MC_POPOVER_SCROLL_STRATEGY) private scrollStrategy,
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
            .withTransformOriginOn('.mc-popover')
            .withFlexibleDimensions(false)
            .withViewportMargin(VIEWPORT_MARGIN)
            .withPositions([ ...EXTENDED_OVERLAY_POSITIONS ]);

        const scrollableAncestors = this.scrollDispatcher
            .getAncestorScrollContainers(this.elementRef);

        strategy.withScrollableContainers(scrollableAncestors);

        strategy.positionChanges.pipe(takeUntil(this.destroyed)).subscribe((change) => {
            if (this.popover) {
                this.onPositionChange(change);
                if (change.scrollableViewProperties.isOverlayClipped && this.popover.mcVisible) {
                    // After position changes occur and the overlay is clipped by
                    // a parent scrollable then close the popover.
                    this.ngZone.run(() => this.hide());
                }
            }
        });

        this.overlayRef = this.overlay.create({
            direction: this.direction,
            positionStrategy: strategy,
            panelClass: 'mc-popover__panel',
            scrollStrategy: this.scrollStrategy(),
            hasBackdrop: this.mcTrigger === PopoverTriggers.Click,
            backdropClass: 'no-class'
        });

        if (this.mcTrigger === PopoverTriggers.Click) {
            this.overlayRef.backdropClick()
                .subscribe(() => {
                    if (!this.popover) { return; }

                    this.popover.hide();
                });
        }

        this.updatePosition();

        this.overlayRef.detachments()
            .pipe(takeUntil(this.destroyed))
            .subscribe(() => this.detach());

        return this.overlayRef;
    }

    detach() {
        if (this.overlayRef && this.overlayRef.hasAttached() && this.popover) {
            this.overlayRef.detach();
            this.popover = null;
        }
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

        if (this.popover) {
            this.updateCompValue('classList', this.classList);
            this.popover.markForCheck();
        }

        this.handlePositionUpdate();
    }

    handlePositionUpdate() {
        if (!this.overlayRef) {
            this.overlayRef = this.createOverlay();
        }

        const verticalOffset = this.hostView.element.nativeElement.clientHeight / 2; // tslint:disable-line
        const anchorElementWidth = this.hostView.element.nativeElement.clientWidth; // tslint:disable-line

        if (this.mcPlacement === 'rightTop' || this.mcPlacement === 'leftTop') {
            const currentContainer = this.overlayRef.overlayElement.style.top || '0px';
            this.overlayRef.overlayElement.style.top =
                `${parseInt(currentContainer.split('px')[0], 10) + verticalOffset - 20}px`; // tslint:disable-line
        }

        if (this.mcPlacement === 'rightBottom' || this.mcPlacement === 'leftBottom') {
            const currentContainer = this.overlayRef.overlayElement.style.bottom || '0px';
            this.overlayRef.overlayElement.style.bottom =
                `${parseInt(currentContainer.split('px')[0], 10) + verticalOffset - 22}px`; // tslint:disable-line
        }

        if ((this.mcPlacement === 'topRight' || this.mcPlacement === 'bottomRight') &&
            anchorElementWidth < MIN_ANCHOR_ELEMENT_WIDTH) {
            const currentContainer = this.overlayRef.overlayElement.style.right || '0px';
            this.overlayRef.overlayElement.style.right =
                `${parseInt(currentContainer.split('px')[0], 10) - 18}px`; // tslint:disable-line
        }

        if ((this.mcPlacement === 'topLeft' || this.mcPlacement === 'bottomLeft') &&
            anchorElementWidth < MIN_ANCHOR_ELEMENT_WIDTH) {
            const currentContainer = this.overlayRef.overlayElement.style.left || '0px';
            this.overlayRef.overlayElement.style.left =
                `${parseInt(currentContainer.split('px')[0], 10) - 20}px`; // tslint:disable-line
        }
    }

    // tslint:disable-next-line:no-any
    updateCompValue(key: string, value: any): void {
        if (this.isDynamicPopover && value) {
            if (this.popover) {
                this.popover[key] = value;
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

        this.manualListeners.forEach((listener, event) => {
            this.elementRef.nativeElement.removeEventListener(event, listener);
        });

        this.manualListeners.clear();

        this.$unsubscribe.next();
        this.$unsubscribe.complete();
    }

    handleKeydown(e: KeyboardEvent) {
        // tslint:disable-next-line: deprecation
        if (this.isOpen && e.keyCode === ESCAPE) {
            this.hide();
        }
    }

    handleTouchend() {
        this.hide();
    }

    initElementRefListeners() {
        if (this.mcTrigger === PopoverTriggers.Click) {
            this.manualListeners
                .set('click', () => this.show())
                .forEach((listener, event) => {
                    this.elementRef.nativeElement.addEventListener(event, listener);
                });
        } else if (this.mcTrigger === PopoverTriggers.Hover) {
            this.manualListeners
                .set('mouseenter', () => this.show())
                .set('mouseleave', () => this.hide())
                .forEach((listener, event) => {
                    this.elementRef.nativeElement.addEventListener(event, listener);
                });
        } else if (this.mcTrigger === PopoverTriggers.Focus) {
            this.manualListeners
                .set('focus', () => this.show())
                .set('blur', () => this.hide())
                .forEach((listener, event) => {
                    this.elementRef.nativeElement.addEventListener(event, listener);
                });
        }
    }

    show(): void {
        if (!this.disabled) {
            if (!this.popover) {
                const overlayRef = this.createOverlay();
                this.detach();

                this.portal = this.portal || new ComponentPortal(McPopoverComponent, this.hostView);

                this.popover = overlayRef.attach(this.portal).instance;
                this.isDynamicPopover = true;
                const properties = [
                    'mcPlacement',
                    'mcPopoverSize',
                    'mcTrigger',
                    'mcMouseEnterDelay',
                    'mcMouseLeaveDelay',
                    'classList',
                    'mcVisible',
                    'mcHeader',
                    'mcContent',
                    'mcFooter'
                ];

                properties.forEach((property) => this.updateCompValue(property, this[ property ]));

                this.popover.mcVisibleChange.pipe(takeUntil(this.$unsubscribe), distinctUntilChanged())
                    .subscribe((data) => {
                        this.mcVisible = data;
                        this.mcVisibleChange.emit(data);
                        this.isPopoverOpen = data;
                    });
                this.popover.afterHidden()
                    .pipe(takeUntil(this.destroyed))
                    .subscribe(() => this.detach());
            }
            this.updatePosition();
            this.popover.show();
        }
    }

    hide(): void {
        if (this.popover) {
            this.popover.hide();
        }
    }

    /** Updates the position of the current popover. */
    updatePosition(reapplyPosition: boolean = false) {
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

        //
        // FIXME: Необходимо в некоторых моментах форсировать позиционировать только после рендеринга всего контента
        //
        if (reapplyPosition) {
            setTimeout(() => {
                position.reapplyLastPosition();
            });
        }
    }

    /**
     * Returns the origin position and a fallback position based on the user's position preference.
     * The fallback position is the inverse of the origin (e.g. `'below' -> 'above'`).
     */
    getOrigin(): {main: OriginConnectionPosition; fallback: OriginConnectionPosition} {
        let originPosition: OriginConnectionPosition;
        const originXPosition = this.getOriginXaxis();
        const originYPosition = this.getOriginYaxis();
        originPosition = {originX: originXPosition, originY: originYPosition};

        const {x, y} = this.invertPosition(originPosition.originX, originPosition.originY);

        return {
            main: originPosition,
            fallback: {originX: x, originY: y}
        };
    }

    getOriginXaxis(): HorizontalConnectionPos {
        const position = this.mcPlacement;
        let origX: HorizontalConnectionPos;
        const isLtr = !this.direction || this.direction.value === 'ltr';
        if (position === 'top' || position === 'bottom') {
            origX = 'center';
        } else if (position.toLowerCase().includes('right') && !isLtr ||
            position.toLowerCase().includes('left') && isLtr) {
            origX = 'start';
        } else if (position.toLowerCase().includes('right') && isLtr ||
            position.toLowerCase().includes('left') && !isLtr) {
            origX = 'end';
        } else {
            throw getMcPopoverInvalidPositionError(position);
        }

        return origX;
    }

    getOriginYaxis(): VerticalConnectionPos {
        const position = this.mcPlacement;
        let origY: VerticalConnectionPos;
        if (position === 'right' || position === 'left') {
            origY = 'center';
        } else if (position.toLowerCase().includes('top')) {
            origY = 'top';
        } else if (position.toLowerCase().includes('bottom')) {
            origY = 'bottom';
        } else {
            throw getMcPopoverInvalidPositionError(position);
        }

        return origY;
    }

    /** Returns the overlay position and a fallback position based on the user's preference */
    getOverlayPosition(): {main: OverlayConnectionPosition; fallback: OverlayConnectionPosition} {
        const position = this.mcPlacement;
        let overlayPosition: OverlayConnectionPosition;
        if (this.availablePositions[position]) {
            overlayPosition = {
                overlayX : this.availablePositions[position].overlayX,
                overlayY: this.availablePositions[position].overlayY
            };
        } else {
            throw getMcPopoverInvalidPositionError(position);
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
