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
    selector: 'mc-popover',
    inputs: [
        'mcPopoverMouseEnterDelay',
        'mcPopoverMouseLeaveDelay',
        'mcPopoverTitle',
        'mcPopoverVisible',
        'mcPopoverTrigger',
        'mcPopoverPlacement',
        'mcPopoverHeader',
        'mcPopoverContent',
        'mcPopoverFooter'
    ],
    outputs: ['mcPopoverVisibleChange'],
    animations: [ fadeAnimation ],
    templateUrl: './popover.component.html',
    preserveWhitespaces: false,
    styleUrls: ['./popover.css'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(body:click)': 'this.handleBodyInteraction()'
    }
})
export class McPopoverComponent {
    prefix = 'mc-popover_placement';
    positions: ConnectionPositionPair[] = [ ...DEFAULT_4_POSITIONS ];
    classMap = {};
    showTid: number;
    hideTid: number;
    availablePositions: any;
    $visible: Observable<boolean>;

    @Output('mcPopoverVisibleChange') mcVisibleChange: EventEmitter<boolean> = new EventEmitter();

    @Input('mcPopoverMouseEnterDelay') mcMouseEnterDelay = 400;

    @Input('mcPopoverMouseLeaveDelay') mcMouseLeaveDelay = 0;

    @Input('mcPopoverHeader') mcHeader: string | TemplateRef<any>;

    @Input('mcPopoverContent') mcContent: string | TemplateRef<any>;

    @Input('mcPopoverFooter') mcFooter: string | TemplateRef<any>;

    @Input('mcPopoverTrigger')
    get mcTrigger(): string {
        return this._mcTrigger;
    }
    set mcTrigger(value: string) {
        this._mcTrigger = value;
    }
    private _mcTrigger: string = 'hover';

    @Input('mcPopoverPlacement')
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

    @Input('mcPopoverVisible')
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

    /** Subject for notifying that the popover has been hidden from the view */
    private readonly onHideSubject: Subject<any> = new Subject();
    private closeOnInteraction: boolean = false;

    constructor(public cdr: ChangeDetectorRef) {
        this.availablePositions = POSITION_MAP;
        this.$visible = this._mcVisible.asObservable();
    }

    //
    // FIXME: Нужно ли делать перерасчет позиционирования при изменения контента?
    //
    // ngAfterViewChecked() {
    //
    // }

    show(): void {
        if (this.hideTid) {
            clearTimeout(this.hideTid);
        }

        if (this.isNonEmptyContent()) {
            if (this.mcTrigger !== 'manual') {
                this.closeOnInteraction = true;
            }
            this.showTid = setTimeout(() => {
                this.mcVisible = true;
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
            this.mcVisible = false;
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

    isNonEmptyContent(): boolean {
        return !!this.mcContent && (this.isTemplateRef(this.mcContent) || this.isNonEmptyString(this.mcContent));
    }

    /** Returns an observable that notifies when the popover has been hidden from view. */
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

    isTemplateRef(value: any): boolean {
        return value instanceof TemplateRef;
    }

    isNonEmptyString(value: any): boolean {
        return typeof value === 'string' && value !== '';
    }
}

export const MC_POPOVER_SCROLL_STRATEGY =
    new InjectionToken<() => IScrollStrategy>('mc-popover-scroll-strategy');

/** @docs-private */
export function mcPopoverScrollStrategyFactory(overlay: Overlay): () => IScrollStrategy {
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

@Directive({
    selector: '[mcPopover]',
    exportAs: 'mcPopover',
    host: {
        '(keydown)': 'handleKeydown($event)',
        '(touchend)': 'handleTouchend()'
    }
})
export class McPopover implements OnInit, OnDestroy {
    isPopoverOpen: boolean = false;
    isDynamicPopover = false;
    parentDisabled: boolean = false;
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
            this._mcTrigger = 'hover';
        }
    }
    private _mcTrigger: string = 'hover';

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

    //
    // FIXME: Побросить в компонент
    //
    @Input('mcPopoverClass')
    get mcPopoverClass() {
        return this._mcPopoverClass;
    }
    set mcPopoverClass(value: string | string[] | Set<string> | {[key: string]: any}) {
        this._mcPopoverClass = value;

        if (this.popover) {
            this.popover.setClassMap();
        }
    }
    private _mcPopoverClass: string | string[] | Set<string> | {[key: string]: any};

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

    @HostBinding('class.mc-popover-open')
    get isOpen(): boolean {
        return this.isPopoverOpen;
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
            .withPositions([ ...DEFAULT_4_POSITIONS ]);

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
            panelClass: 'mc-popover-panel',
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

        if (this.popover) {
            this.popover.setClassMap();
            this.popover.markForCheck();
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
        this.manualListeners.forEach((listener, event) =>
            this.elementRef.nativeElement.removeEventListener(event, listener));
        this.manualListeners.clear();

        this.$unsubscribe.next();
        this.$unsubscribe.complete();
    }

    handleKeydown(e: KeyboardEvent) {
        if (this.isPopoverOpen && e.keyCode === ESCAPE) { // tslint:disable-line
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
            if (!this.popover) {
                const overlayRef = this.createOverlay();
                this.detach();

                this.portal = this.portal || new ComponentPortal(McPopoverComponent, this.hostView);

                this.popover = overlayRef.attach(this.portal).instance;
                this.popover.afterHidden()
                    .pipe(takeUntil(this.destroyed))
                    .subscribe(() => this.detach());
                this.isDynamicPopover = true;
                const properties = [
                    'mcPlacement',
                    'mcTrigger',
                    'mcPopoverDisabled',
                    'mcMouseEnterDelay',
                    'mcMouseLeaveDelay',
                    'mcPopoverClass',
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
    getOrigin(): {main: IOriginConnectionPosition; fallback: IOriginConnectionPosition} {
        const position = this.mcPlacement;
        const isLtr = !this.direction || this.direction.value === 'ltr';
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
            throw getMcPopoverInvalidPositionError(position);
        }

        const {x, y} = this.invertPosition(originPosition.originX, originPosition.originY);

        return {
            main: originPosition,
            fallback: {originX: x, originY: y}
        };
    }

    /** Returns the overlay position and a fallback position based on the user's preference */
    getOverlayPosition(): {main: IOverlayConnectionPosition; fallback: IOverlayConnectionPosition} {
        const position = this.mcPlacement;
        const isLtr = !this.direction || this.direction.value === 'ltr';
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
