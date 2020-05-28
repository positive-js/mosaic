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
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

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
    styleUrls: ['./popover.css'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [mcPopoverAnimations.popoverState],
    host: {
        '[class]': 'getCssClassesList',
        '(keydown)': 'handleKeydown($event)'
    }
})
export class McPopoverComponent {
    positions: ConnectionPositionPair[] = [ ...EXTENDED_OVERLAY_POSITIONS ];
    availablePositions: any;
    popoverVisibility: PopoverVisibility = PopoverVisibility.Initial;
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

    get isOpen(): boolean {
        return this.popoverVisibility === PopoverVisibility.Visible;
    }

    /** Subject for notifying that the popover has been hidden from the view */
    private readonly onHideSubject: Subject<any> = new Subject();

    constructor(public changeDetectorRef: ChangeDetectorRef, public componentElementRef: ElementRef) {
        this.availablePositions = POSITION_MAP;
    }

    handleKeydown(e: KeyboardEvent) {
        // tslint:disable-next-line: deprecation
        if (this.isOpen && e.keyCode === ESCAPE) {
            this.hide();
        }
    }

    show(): void {
        if (this.isNonEmptyContent()) {
            this.closeOnInteraction = true;
            this.popoverVisibility = PopoverVisibility.Visible;
            this._mcVisible.next(true);
            this.mcVisibleChange.emit(true);
            // Mark for check so if any parent component has set the
            // ChangeDetectionStrategy to OnPush it will be checked anyways
            this.markForCheck();
        }
    }

    hide(): void {
        this.popoverVisibility = PopoverVisibility.Hidden;
        this._mcVisible.next(false);
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
        return this.popoverVisibility === PopoverVisibility.Visible;
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
const POPOVER_ARROW_BORDER_DISTANCE: number = 20; // tslint:disable-line

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
    availablePositions: { [key: string]: ConnectionPositionPair };
    defaultPositionsMap: { [key: string]: string};
    popover: McPopoverComponent | null;

    @Output('mcPopoverVisibleChange') mcVisibleChange = new EventEmitter<boolean>();

    @Output('mcPopoverPositionStrategyPlacementChange')
    mcPositionStrategyPlacementChange: EventEmitter<string> = new EventEmitter();

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
        this.resetListeners();
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

    get isOpen(): boolean {
        return this.isPopoverOpen;
    }

    private manualListeners = new Map<string, EventListenerOrEventListenerObject>();
    private readonly destroyed = new Subject<void>();
    private backDropSubscription: Subscription;

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
            .withPositions([ ...EXTENDED_OVERLAY_POSITIONS ]);

        const scrollableAncestors = this.scrollDispatcher
            .getAncestorScrollContainers(this.elementRef);

        strategy.withScrollableContainers(scrollableAncestors);

        strategy.positionChanges
            .pipe(takeUntil(this.destroyed))
            .subscribe((change) => {
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

        this.updateOverlayBackdropClick();

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
        this.popover = null;
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
        this.mcPositionStrategyPlacementChange.emit(updatedPlacement);

        if (this.popover) {
            this.updateCompValue('classList', this.classList);
            this.popover.markForCheck();
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
        const offsets: { [key: string]: number} = {
            top: verticalOffset,
            bottom: verticalOffset,
            right: horizontalOffset,
            left: horizontalOffset
        };

        const styleProperty = updatedPlacement.split(/(?=[A-Z])/)[1].toLowerCase();

        if (!this.overlayRef.overlayElement.style[styleProperty]) {
            this.overlayRef.overlayElement.style[styleProperty] = '0px';
        }

        this.overlayRef.overlayElement.style[styleProperty] =
            `${parseInt(currentContainer[styleProperty].split('px')[0], 10) +
            offsets[styleProperty] - POPOVER_ARROW_BORDER_DISTANCE}px`;
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
        if (!this.disabled) {
            if (!this.popover) {
                this.detach();
                const overlayRef = this.createOverlay();

                this.portal = this.portal || new ComponentPortal(McPopoverComponent, this.hostView);

                this.popover = overlayRef.attach(this.portal).instance;
                this.popover.afterHidden()
                    .pipe(takeUntil(this.destroyed))
                    .subscribe(() => this.detach());

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

                properties.forEach((property) => this.updateCompValue(property, this[property]));

                this.popover.mcVisibleChange
                    .pipe(takeUntil(this.$unsubscribe), distinctUntilChanged())
                    .subscribe((data) => {
                        this.mcVisible = data;
                        this.mcVisibleChange.emit(data);
                        this.isPopoverOpen = data;
                    });
            }

            this.popover.show();
        }
    }

    hide(): void {
        if (this.popover) {
            this.popover.hide();
        }
    }

    updateOverlayBackdropClick() {
        if (this.mcTrigger === PopoverTriggers.Click && this.overlayRef) {
            this.backDropSubscription = this.overlayRef.backdropClick()
                .subscribe(() => {
                    if (!this.popover) { return; }

                    this.popover.hide();
                });
        } else if (this.backDropSubscription && this.overlayRef) {
            this.backDropSubscription.unsubscribe();
            this.overlayRef.detachBackdrop();
        }
    }

    /** Updates the position of the current popover. */
    updatePosition(reapplyPosition: boolean = false) {
        if (!this.overlayRef) {
            this.overlayRef = this.createOverlay();
        }
        const position =
            this.overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy;
        position.withPositions(this.getPrioritizedPositions()).withPush(true);

        if (reapplyPosition) {
            setTimeout(() => {
                position.reapplyLastPosition();
            });
        }
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

        return POSITION_PRIORITY_STRATEGY[this.mcPlacement];
    }

    private resizeListener = () => this.updatePosition();
}
