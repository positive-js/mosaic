import { AnimationEvent } from '@angular/animations';
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    ConnectedOverlayPositionChange,
    ConnectionPositionPair,
    FlexibleConnectedPositionStrategy,
    Overlay,
    OverlayRef,
    ScrollDispatcher,
    ScrollStrategy
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
    DEFAULT_4_POSITIONS_TO_CSS_MAP,
    EXTENDED_OVERLAY_POSITIONS,
    POSITION_MAP, POSITION_PRIORITY_STRATEGY,
    POSITION_TO_CSS_MAP
} from '@ptsecurity/mosaic/core';
import { merge, NEVER, Observable, Subject, Subscription } from 'rxjs';
import { delay, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { mcPopoverAnimations } from './popover-animations';


enum PopoverTriggers {
    Click = 'click',
    Focus = 'focus',
    Hover = 'hover'
}

export enum PopoverVisibility {
    Initial = 'initial',
    Visible = 'visible',
    Hidden = 'hidden'
}


@Component({
    selector: 'mc-popover',
    templateUrl: './popover.component.html',
    preserveWhitespaces: false,
    styleUrls: ['./popover.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [mcPopoverAnimations.popoverState]
})
export class McPopoverComponent {
    classMap = {};

    visibility: PopoverVisibility = PopoverVisibility.Initial;
    closeOnInteraction: boolean = false;

    content: string | TemplateRef<any>;
    header: string | TemplateRef<any>;
    footer: string | TemplateRef<any>;

    mcVisibleChange: EventEmitter<boolean> = new EventEmitter();

    /** Subject for notifying that the popover has been hidden from the view */
    private readonly onHideSubject: Subject<any> = new Subject();

    constructor(public changeDetectorRef: ChangeDetectorRef) {}

    updateClassMap(size: string, placement: string, popoverClass: string): void {
        this.classMap = {
            [`mc-popover_placement-${POSITION_TO_CSS_MAP[placement]}`]: true,
            [`mc-popover_${size}`]: true,
            [popoverClass]: true
        };
    }

    show(): void {
        this.closeOnInteraction = true;
        this.visibility = PopoverVisibility.Visible;
        this.mcVisibleChange.emit(true);
        // Mark for check so if any parent component has set the
        // ChangeDetectionStrategy to OnPush it will be checked anyways
        this.markForCheck();
    }

    hide(): void {
        this.visibility = PopoverVisibility.Hidden;
        this.mcVisibleChange.emit(false);

        // Mark for check so if any parent component has set the
        // ChangeDetectionStrategy to OnPush it will be checked anyways
        this.markForCheck();
    }

    /** Returns an observable that notifies when the popover has been hidden from view. */
    afterHidden(): Observable<void> {
        return this.onHideSubject.asObservable();
    }

    isVisible(): boolean {
        return this.visibility === PopoverVisibility.Visible;
    }

    markForCheck(): void {
        this.changeDetectorRef.markForCheck();
    }

    isTemplateRef(value: any): boolean {
        return value instanceof TemplateRef;
    }

    animationStart() {
        this.closeOnInteraction = false;
    }

    animationDone(event: AnimationEvent): void {
        const toState = event.toState as PopoverVisibility;

        if (toState === PopoverVisibility.Hidden && !this.isVisible()) {
            this.onHideSubject.next();
        }

        if (toState === PopoverVisibility.Visible || toState === PopoverVisibility.Hidden) {
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

/* Constant distance between popover container border
*  corner according to popover placement and middle of arrow
* */
const POPOVER_ARROW_BORDER_DISTANCE: number = 20; // tslint:disable-line

/* Constant value for min height and width of anchor element used for popover.
*  Set as POPOVER_ARROW_BORDER_DISTANCE multiplied by 2
*  plus 2px border for both sides of element. Used in check of position management.
* */
const ANCHOR_MIN_HEIGHT_WIDTH: number = 44; // tslint:disable-line

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
    isOpen: boolean = false;

    @Input() backdropClass: string = 'cdk-overlay-transparent-backdrop';

    @Input('mcPopoverEnterDelay') enterDelay: number;
    @Input('mcPopoverLeaveDelay') leaveDelay: number;

    @Output('mcPopoverVisibleChange') mcVisibleChange = new EventEmitter<boolean>();

    @Output('mcPopoverPositionStrategyPlacementChange')
    mcPositionStrategyPlacementChange: EventEmitter<string> = new EventEmitter();

    @Input()
    get hasBackdrop(): boolean {
        return this._hasBackdrop;
    }

    set hasBackdrop(value: boolean) {
        this._hasBackdrop = coerceBooleanProperty(value);
    }

    private _hasBackdrop: boolean = false;

    @Input('mcPopoverHeader')
    get header(): string | TemplateRef<any> {
        return this._header;
    }
    set header(value: string | TemplateRef<any>) {
        this._header = value;
        this.updateCompValue('header', value);

        if (this.isOpen) {
            this.updatePosition(true);
        }
    }
    private _header: string | TemplateRef<any>;

    @Input('mcPopoverContent')
    get content(): string | TemplateRef<any> {
        return this._content;
    }
    set content(value: string | TemplateRef<any>) {
        this._content = value;
        this.updateCompValue('content', value);

        if (this.isOpen) {
            this.updatePosition(true);
        }
    }
    private _content: string | TemplateRef<any>;

    @Input('mcPopoverFooter')
    get footer(): string | TemplateRef<any> {
        return this._footer;
    }
    set footer(value: string | TemplateRef<any>) {
        this._footer = value;
        this.updateCompValue('footer', value);

        if (this.isOpen) {
            this.updatePosition(true);
        }
    }
    private _footer: string | TemplateRef<any>;

    private $unsubscribe = new Subject<void>();

    @Input('mcPopoverDisabled')
    get disabled(): boolean {
        return this._disabled;
    }
    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
    }
    private _disabled: boolean = false;

    @Input('mcPopoverTrigger')
    get trigger(): string {
        return this._trigger;
    }

    set trigger(value: string) {
        if (value) {
            this._trigger = value;
        } else {
            this._trigger = PopoverTriggers.Click;
        }

        this.resetListeners();
    }

    private _trigger: string = PopoverTriggers.Click;

    @Input('mcPopoverSize')
    get size(): string {
        return this.popoverSize;
    }
    set size(value: string) {
        if (['small', 'normal', 'large'].includes(value)) {
            this.popoverSize = value;

            if (this.popoverInstance) {
                this.popoverInstance.updateClassMap(this.size, this.placement, this.popoverClass);
            }
        } else {
            this.popoverSize = 'normal';
        }
    }

    private popoverSize: string = 'normal';

    @Input('mcPopoverPlacementPriority')
    get mcPlacementPriority() {
        return this._mcPlacementPriority;
    }
    set mcPlacementPriority(value) {
        if (value && value.length > 0) {
            this._mcPlacementPriority = value;
        } else {
            this._mcPlacementPriority = null;
        }
    }
    private _mcPlacementPriority: string | string[] | null = null;

    @Input('mcPopoverPlacement')
    get placement(): string {
        return this._placement;
    }
    set placement(value: string) {
        if (value) {
            this._placement = value;

            if (this.popoverInstance) {
                this.popoverInstance.updateClassMap(this.size, this.placement, this.popoverClass);
            }
        } else {
            this._placement = 'top';
        }
    }
    private _placement: string = 'top';

    @Input('mcPopoverClass')
    get popoverClass() {
        return this._popoverClass;
    }
    set popoverClass(value: string) {
        this._popoverClass = value;

        if (this.popoverInstance) {
            this.popoverInstance.updateClassMap(this.size, this.placement, this.popoverClass);
        }
    }
    private _popoverClass: string;

    @Input('mcPopoverVisible')
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

    private overlayRef: OverlayRef | null;
    private portal: ComponentPortal<McPopoverComponent>;
    private availablePositions: { [key: string]: ConnectionPositionPair };
    private defaultPositionsMap: { [key: string]: string};
    private popoverInstance: McPopoverComponent | null;

    private closeSubscription = Subscription.EMPTY;

    private manualListeners = new Map<string, EventListenerOrEventListenerObject>();
    private readonly destroyed = new Subject<void>();

    constructor(
        private overlay: Overlay,
        private elementRef: ElementRef,
        private ngZone: NgZone,
        private scrollDispatcher: ScrollDispatcher,
        private hostView: ViewContainerRef,
        @Inject(MC_POPOVER_SCROLL_STRATEGY) private scrollStrategy,
        @Optional() private direction: Directionality
    ) {
        this.availablePositions = POSITION_MAP;
        this.defaultPositionsMap = DEFAULT_4_POSITIONS_TO_CSS_MAP;
    }

    /** Create the overlay config and position strategy */
    createOverlay(): OverlayRef {
        if (this.overlayRef) {
            this.overlayRef.dispose();
        }

        // Create connected position strategy that listens for scroll events to reposition.
        const strategy = this.overlay.position()
            .flexibleConnectedTo(this.elementRef)
            .withTransformOriginOn('.mc-popover')
            .withFlexibleDimensions(false)
            .withViewportMargin(VIEWPORT_MARGIN)
            .withPositions([...EXTENDED_OVERLAY_POSITIONS]);

        const scrollableAncestors = this.scrollDispatcher.getAncestorScrollContainers(this.elementRef);

        strategy.withScrollableContainers(scrollableAncestors);

        strategy.positionChanges
            .pipe(takeUntil(this.destroyed))
            .subscribe((change) => {
            if (this.popoverInstance) {
                this.onPositionChange(change);
                if (change.scrollableViewProperties.isOverlayClipped && this.popoverInstance.isVisible()) {
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
            hasBackdrop: this.hasBackdrop,
            backdropClass: this.backdropClass
        });

        this.closeSubscription = this.closingActions()
            // need for close popover on trigger click, because popover fire unexpected events: hide and then show
            // todo need fix it
            .pipe(delay(0))
            .subscribe(() => this.hide());

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

        this.popoverInstance = null;
    }

    onPositionChange($event: ConnectedOverlayPositionChange): void {
        let updatedPlacement = this.placement;
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

        this.mcPositionStrategyPlacementChange.emit(updatedPlacement);

        if (this.popoverInstance) {
            this.popoverInstance.updateClassMap(this.size, this.placement, this.popoverClass);
            this.popoverInstance.markForCheck();
        }

        if (!this.defaultPositionsMap[updatedPlacement]) {
            this.handlePositionUpdate(updatedPlacement);
        }
    }

    handlePositionUpdate(updatedPlacement: string) {
        if (!this.overlayRef) {
            this.overlayRef = this.createOverlay();
        }

        const currentContainer = this.overlayRef.overlayElement.style;
        const elementHeight = this.hostView.element.nativeElement.clientHeight;
        const elementWidth = this.hostView.element.nativeElement.clientWidth;
        const verticalOffset: number = Math.floor(elementHeight / 2); // tslint:disable-line
        const horizontalOffset: number = Math.floor(elementWidth / 2 - 6); // tslint:disable-line
        const offsets: { [key: string]: number } = {
            top: verticalOffset,
            bottom: verticalOffset,
            right: horizontalOffset,
            left: horizontalOffset
        };

        const styleProperty = updatedPlacement.split(/(?=[A-Z])/)[1].toLowerCase();

        if (((styleProperty === 'top' || styleProperty === 'bottom') &&
            elementHeight > ANCHOR_MIN_HEIGHT_WIDTH) ||
            ((styleProperty === 'left' || styleProperty === 'right') &&
            elementWidth > ANCHOR_MIN_HEIGHT_WIDTH)) {
            return;
        }

        if (!this.overlayRef.overlayElement.style[styleProperty]) {
            this.overlayRef.overlayElement.style[styleProperty] = '0px';
        }

        this.overlayRef.overlayElement.style[styleProperty] =
            `${parseInt(currentContainer[styleProperty].split('px')[0], 10) +
            offsets[styleProperty] - POPOVER_ARROW_BORDER_DISTANCE}px`;
    }

    // tslint:disable-next-line:no-any
    updateCompValue(key: string, value: any): void {
        if (value && this.popoverInstance) {
            this.popoverInstance[key] = value;
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

        this.closeSubscription.unsubscribe();
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
        if (this.trigger === PopoverTriggers.Click) {
            this.manualListeners
                .set('click', () => this.show())
                .forEach((listener, event) => {
                    this.elementRef.nativeElement.addEventListener(event, listener);
                });
        } else if (this.trigger === PopoverTriggers.Hover) {
            this.manualListeners
                .set('mouseenter', () => this.show())
                .set('mouseleave', () => this.hide())
                .forEach((listener, event) => {
                    this.elementRef.nativeElement.addEventListener(event, listener);
                });
        } else if (this.trigger === PopoverTriggers.Focus) {
            this.manualListeners
                .set('focus', () => this.show())
                .set('blur', () => this.hide())
                .forEach((listener, event) => {
                    this.elementRef.nativeElement.addEventListener(event, listener);
                });
        }
    }

    registerResizeHandler() {
        // The resize handler is currently responsible for detecting slider dimension
        // changes and therefore doesn't cause a value change that needs to be propagated.
        this.ngZone.runOutsideAngular(() => {
            window.addEventListener('resize', this.resizeListener);
        });
    }

    deregisterResizeHandler() {
        window.removeEventListener('resize', this.resizeListener);
    }

    resetListeners() {
        if (this.manualListeners.size) {
            this.manualListeners.forEach((listener, event) => {
                this.elementRef.nativeElement.removeEventListener(event, listener);
            });
            this.manualListeners.clear();
            this.initElementRefListeners();
        }
    }

    show(): void {
        if (this.disabled) { return; }

        if (!this.popoverInstance) {
            this.detach();
            const overlayRef = this.createOverlay();

            this.portal = this.portal || new ComponentPortal(McPopoverComponent, this.hostView);

            this.popoverInstance = overlayRef.attach(this.portal).instance;
            this.popoverInstance.afterHidden()
                .pipe(takeUntil(this.destroyed))
                .subscribe(() => this.detach());

            const properties = [
                'header',
                'content',
                'footer'
            ];

            this.popoverInstance.updateClassMap(this.size, this.placement, this.popoverClass);

            properties.forEach((property) => this.updateCompValue(property, this[property]));

            this.popoverInstance.mcVisibleChange
                .pipe(takeUntil(this.$unsubscribe), distinctUntilChanged())
                .subscribe((data) => {
                    this.visible = data;
                    this.mcVisibleChange.emit(data);
                    this.isOpen = data;
                });
        }

        this.popoverInstance.show();
    }

    hide(): void {
        if (this.popoverInstance) {
            this.popoverInstance.hide();
        }
    }

    /** Updates the position of the current popover. */
    updatePosition(reapplyPosition: boolean = false) {
        if (!this.overlayRef) {
            this.overlayRef = this.createOverlay();
        }

        const position = this.overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy;
        position.withPositions(this.getPrioritizedPositions()).withPush(true);

        if (reapplyPosition) {
            setTimeout(() => position.reapplyLastPosition());
        }
    }

    private closingActions() {
        const backdrop = this.overlayRef!.backdropClick();
        const outsidePointerEvents = this.hasBackdrop ? NEVER : this.overlayRef!.outsidePointerEvents();
        const detachments = this.overlayRef!.detachments();

        return merge(backdrop, outsidePointerEvents, detachments);
    }

    private getPriorityPlacementStrategy(value: string | string[]): ConnectionPositionPair[] {
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

    private getPrioritizedPositions() {
        if (this.mcPlacementPriority) {
            return this.getPriorityPlacementStrategy(this.mcPlacementPriority);
        }

        return POSITION_PRIORITY_STRATEGY[this.placement];
    }

    private resizeListener = () => this.updatePosition();
}
