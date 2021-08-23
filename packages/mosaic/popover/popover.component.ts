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
import { merge, NEVER, Subject, Subscription } from 'rxjs';
import { delay as rxDelay, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { McBaseTooltip, PopoverTriggers } from '../core/tooltip';

import { mcPopoverAnimations } from './popover-animations';


@Component({
    selector: 'mc-popover',
    templateUrl: './popover.component.html',
    preserveWhitespaces: false,
    styleUrls: ['./popover.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [mcPopoverAnimations.popoverState]
})
export class McPopoverComponent extends McBaseTooltip {
    content: string | TemplateRef<any>;
    header: string | TemplateRef<any>;
    footer: string | TemplateRef<any>;

    prefix = 'mc-popover';

    constructor(changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
    }
}

export const MC_POPOVER_SCROLL_STRATEGY =
    new InjectionToken<() => ScrollStrategy>('mc-popover-scroll-strategy');

/** @docs-private */
export function mcPopoverScrollStrategyFactory(overlay: Overlay): () => ScrollStrategy {
    return () => overlay.scrollStrategies.reposition({ scrollThrottle: 20 });
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
        '[class.mc-popover_open]': 'isOpen',
        '(keydown)': 'handleKeydown($event)',
        '(touchend)': 'handleTouchend()'
    }
})
export class McPopover implements OnInit, OnDestroy {
    isOpen: boolean = false;

    @Input('mcPopoverEnterDelay') enterDelay: number = 0;
    @Input('mcPopoverLeaveDelay') leaveDelay: number = 0;

    @Output('mcPopoverVisibleChange') visibleChange = new EventEmitter<boolean>();

    @Output('mcPopoverPlacementChange') placementChange: EventEmitter<string> = new EventEmitter();

    @Input() backdropClass: string = 'cdk-overlay-transparent-backdrop';

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
                this.popoverInstance.updateClassMap(POSITION_TO_CSS_MAP[this.placement], this.popoverClass, this.size);
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
                this.popoverInstance.updateClassMap(POSITION_TO_CSS_MAP[this.placement], this.popoverClass, this.size);
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
            this.popoverInstance.updateClassMap(POSITION_TO_CSS_MAP[this.placement], this.popoverClass, this.size);
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

    private closingActionsSubscription = Subscription.EMPTY;

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

    ngOnInit(): void {
        this.initListeners();
    }

    ngOnDestroy(): void {
        if (this.overlayRef) {
            this.overlayRef.dispose();
        }

        this.manualListeners.forEach(this.removeEventListener);

        this.manualListeners.clear();

        this.destroyed.next();
        this.destroyed.complete();

        this.closingActionsSubscription.unsubscribe();
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

    show(delay: number = this.enterDelay): void {
        if (this.disabled) { return; }

        if (!this.popoverInstance) {
            this.detach();
            const overlayRef = this.createOverlay();

            this.portal = this.portal || new ComponentPortal(McPopoverComponent, this.hostView);

            this.popoverInstance = overlayRef.attach(this.portal).instance;

            this.popoverInstance.afterHidden()
                .pipe(takeUntil(this.destroyed))
                .subscribe(this.detach);

            this.popoverInstance.updateClassMap(POSITION_TO_CSS_MAP[this.placement], this.popoverClass, this.size);

            const properties = [
                'header',
                'content',
                'footer'
            ];

            properties.forEach((property) => this.updateCompValue(property, this[property]));

            this.popoverInstance.visibleChange
                .pipe(takeUntil(this.destroyed), distinctUntilChanged())
                .subscribe((value) => {
                    this.visible = value;
                    this.visibleChange.emit(value);
                    this.isOpen = value;
                });
        }

        this.popoverInstance.show(delay);
    }

    hide(delay: number = this.leaveDelay): void {
        if (this.popoverInstance) {
            this.popoverInstance.hide(delay);
        }
    }

    /** Updates the position of the current popover. */
    updatePosition(reapplyPosition: boolean = false) {
        if (!this.overlayRef) {
            this.overlayRef = this.createOverlay();
        }

        const position = (this.overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy)
            .withPositions(this.getPrioritizedPositions())
            .withPush(true);

        if (reapplyPosition) {
            setTimeout(() => position.reapplyLastPosition());
        }
    }

    /** Create the overlay config and position strategy */
    private createOverlay(): OverlayRef {
        if (this.overlayRef) {
            this.overlayRef.dispose();
        }

        // Create connected position strategy that listens for scroll events to reposition.
        const strategy = this.overlay.position()
            .flexibleConnectedTo(this.elementRef)
            .withTransformOriginOn('.mc-popover')
            .withFlexibleDimensions(false)
            .withViewportMargin(VIEWPORT_MARGIN)
            .withPositions([...EXTENDED_OVERLAY_POSITIONS])
            .withScrollableContainers(this.scrollDispatcher.getAncestorScrollContainers(this.elementRef));

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

        this.closingActionsSubscription = this.closingActions()
            .pipe(rxDelay(0))
            .subscribe(() => this.hide());

        this.updatePosition();

        this.overlayRef.detachments()
            .pipe(takeUntil(this.destroyed))
            .subscribe(this.detach);

        return this.overlayRef;
    }

    private detach = () => {
        if (this.overlayRef && this.overlayRef.hasAttached()) {
            this.overlayRef.detach();
        }

        this.popoverInstance = null;
    }

    private handlePositionUpdate(updatedPlacement: string) {
        if (!this.overlayRef) {
            this.overlayRef = this.createOverlay();
        }

        const { clientHeight, clientWidth } = this.hostView.element.nativeElement;
        const verticalOffset: number = Math.floor(clientHeight / 2); // tslint:disable-line
        const horizontalOffset: number = Math.floor(clientWidth / 2 - 6); // tslint:disable-line
        const offsets = {
            top: verticalOffset,
            bottom: verticalOffset,
            right: horizontalOffset,
            left: horizontalOffset
        };

        const styleProperty = updatedPlacement.split(/(?=[A-Z])/)[1].toLowerCase();

        if (((styleProperty === 'top' || styleProperty === 'bottom') && clientHeight > ANCHOR_MIN_HEIGHT_WIDTH) ||
            ((styleProperty === 'left' || styleProperty === 'right') && clientWidth > ANCHOR_MIN_HEIGHT_WIDTH)
        ) {
            return;
        }

        const container = this.overlayRef.overlayElement.style;

        if (!container[styleProperty]) {
            container[styleProperty] = '0px';
        }

        const margin = parseInt(container[styleProperty].split('px')[0]);

        container[styleProperty] = `${margin + offsets[styleProperty] - POPOVER_ARROW_BORDER_DISTANCE}px`;
    }

    // tslint:disable-next-line:no-any
    private updateCompValue(key: string, value: any): void {
        if (value && this.popoverInstance) {
            this.popoverInstance[key] = value;
        }
    }

    private initListeners() {
        if (this.trigger === PopoverTriggers.Click) {
            this.manualListeners
                .set('click', () => this.show())
                .forEach(this.addEventListener);
        } else if (this.trigger === PopoverTriggers.Hover) {
            this.manualListeners
                .set('mouseenter', () => this.show())
                .set('mouseleave', () => this.hide())
                .forEach(this.addEventListener);
        } else if (this.trigger === PopoverTriggers.Focus) {
            this.manualListeners
                .set('focus', () => this.show())
                .set('blur', () => this.hide())
                .forEach(this.addEventListener);
        }
    }

    private addEventListener = (listener: EventListener | EventListenerObject, event: string) => {
        this.elementRef.nativeElement.addEventListener(event, listener);
    }

    private removeEventListener = (listener: EventListener | EventListenerObject, event: string) => {
        this.elementRef.nativeElement.addEventListener(event, listener);
    }

    private resetListeners() {
        if (this.manualListeners.size) {
            this.manualListeners.forEach(this.removeEventListener);

            this.manualListeners.clear();
            this.initListeners();
        }
    }

    private onPositionChange($event: ConnectedOverlayPositionChange): void {
        let updatedPlacement = this.placement;

        const { originX, originY, overlayX, overlayY } = $event.connectionPair;

        Object.keys(this.availablePositions).some((key) => {
            if (originX === this.availablePositions[key].originX && originY === this.availablePositions[key].originY &&
                overlayX === this.availablePositions[key].overlayX && overlayY === this.availablePositions[key].overlayY
            ) {
                updatedPlacement = key;

                return true;
            }

            return false;
        });

        this.placementChange.emit(updatedPlacement);

        this.popoverInstance!.updateClassMap(POSITION_TO_CSS_MAP[this.placement], this.popoverClass, this.size);
        this.popoverInstance!.markForCheck();

        if (!this.defaultPositionsMap[updatedPlacement]) {
            this.handlePositionUpdate(updatedPlacement);
        }
    }

    private closingActions() {
        return merge(
            this.overlayRef!.backdropClick(),
            this.hasBackdrop ? NEVER : this.overlayRef!.outsidePointerEvents(),
            this.overlayRef!.detachments()
        );
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
}
