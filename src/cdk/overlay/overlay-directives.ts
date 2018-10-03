import {
    Directive,
    ElementRef,
    EventEmitter,
    Inject,
    InjectionToken,
    Input,
    OnChanges,
    OnDestroy,
    Optional,
    Output,
    SimpleChanges,
    TemplateRef,
    ViewContainerRef
} from '@angular/core';
import { Direction, Directionality } from '@ptsecurity/cdk/bidi';
import { coerceBooleanProperty } from '@ptsecurity/cdk/coercion';
import { ESCAPE } from '@ptsecurity/cdk/keycodes';
import { TemplatePortal } from '@ptsecurity/cdk/portal';
import { Subscription } from 'rxjs';

import { Overlay } from './overlay';
import { OverlayConfig } from './overlay-config';
import { OverlayRef } from './overlay-ref';
import { ConnectedOverlayPositionChange } from './position/connected-position';
import {
    IConnectedPosition,
    FlexibleConnectedPositionStrategy
} from './position/flexible-connected-position-strategy';
import {
    RepositionScrollStrategy,
    IRepositionScrollStrategyConfig,
    IScrollStrategy
} from './scroll/index';


/** Default set of positions for the overlay. Follows the behavior of a dropdown. */
const defaultPositionList: IConnectedPosition[] = [
    {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top'
    },
    {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'bottom'
    },
    {
        originX: 'end',
        originY: 'top',
        overlayX: 'end',
        overlayY: 'bottom'
    },
    {
        originX: 'end',
        originY: 'bottom',
        overlayX: 'end',
        overlayY: 'top'
    }
];

/** Injection token that determines the scroll handling while the connected overlay is open. */
export const CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY =
    new InjectionToken<() => IScrollStrategy>('cdk-connected-overlay-scroll-strategy');

/** @docs-private @deprecated @deletion-target 7.0.0 */
export function CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_FACTORY(overlay: Overlay):
    () => IScrollStrategy {
    return (config?: IRepositionScrollStrategyConfig) => overlay.scrollStrategies.reposition(config);
}

/**
 * Directive applied to an element to make it usable as an origin for an Overlay using a
 * ConnectedPositionStrategy.
 */
@Directive({
    selector: '[cdk-overlay-origin], [overlay-origin], [cdkOverlayOrigin]',
    exportAs: 'cdkOverlayOrigin'
})
export class CdkOverlayOrigin {
    constructor(
        /** Reference to the element on which the directive is applied. */
        public elementRef: ElementRef) {
    }
}


/**
 * Directive to facilitate declarative creation of an
 * Overlay using a FlexibleConnectedPositionStrategy.
 */
@Directive({
    selector: '[cdk-connected-overlay], [connected-overlay], [cdkConnectedOverlay]',
    exportAs: 'cdkConnectedOverlay'
})
export class CdkConnectedOverlay implements OnDestroy, OnChanges {
    /** Origin for the connected overlay. */
    @Input('cdkConnectedOverlayOrigin') origin: CdkOverlayOrigin;

    /** Registered connected position pairs. */
    @Input('cdkConnectedOverlayPositions') positions: IConnectedPosition[];

    /** The offset in pixels for the overlay connection point on the x-axis */
    @Input('cdkConnectedOverlayOffsetX')
    get offsetX(): number {
        return this._offsetX;
    }

    set offsetX(offsetX: number) {
        this._offsetX = offsetX;

        if (this._position) {
            this._setPositions(this._position);
        }
    }

    /** The offset in pixels for the overlay connection point on the y-axis */
    @Input('cdkConnectedOverlayOffsetY')
    get offsetY() {
        return this._offsetY;
    }

    set offsetY(offsetY: number) {
        this._offsetY = offsetY;

        if (this._position) {
            this._setPositions(this._position);
        }
    }

    /** The width of the overlay panel. */
    @Input('cdkConnectedOverlayWidth') width: number | string;

    /** The height of the overlay panel. */
    @Input('cdkConnectedOverlayHeight') height: number | string;

    /** The min width of the overlay panel. */
    @Input('cdkConnectedOverlayMinWidth') minWidth: number | string;

    /** The min height of the overlay panel. */
    @Input('cdkConnectedOverlayMinHeight') minHeight: number | string;

    /** The custom class to be set on the backdrop element. */
    @Input('cdkConnectedOverlayBackdropClass') backdropClass: string;

    /** Margin between the overlay and the viewport edges. */
    @Input('cdkConnectedOverlayViewportMargin') viewportMargin: number = 0;

    /** Strategy to be used when handling scroll events while the overlay is open. */
    @Input('cdkConnectedOverlayScrollStrategy') scrollStrategy: IScrollStrategy =
        this._scrollStrategy();

    /** Whether the overlay is open. */
    @Input('cdkConnectedOverlayOpen') open: boolean = false;

    /** Whether or not the overlay should attach a backdrop. */
    @Input('cdkConnectedOverlayHasBackdrop')
    get hasBackdrop() {
        return this._hasBackdrop;
    }

    set hasBackdrop(value: any) {
        this._hasBackdrop = coerceBooleanProperty(value);
    }

    /** Whether or not the overlay should be locked when scrolling. */
    @Input('cdkConnectedOverlayLockPosition')
    get lockPosition() {
        return this._lockPosition;
    }

    set lockPosition(value: any) {
        this._lockPosition = coerceBooleanProperty(value);
    }

    /** Whether the overlay's width and height can be constrained to fit within the viewport. */
    @Input('cdkConnectedOverlayFlexibleDimensions')
    get flexibleDiemsions() {
        return this._flexibleDimensions;
    }

    set flexibleDiemsions(value: boolean) {
        this._flexibleDimensions = coerceBooleanProperty(value);
    }

    /** Whether the overlay can grow after the initial open when flexible positioning is turned on. */
    @Input('cdkConnectedOverlayGrowAfterOpen')
    get growAfterOpen() {
        return this._growAfterOpen;
    }

    set growAfterOpen(value: boolean) {
        this._growAfterOpen = coerceBooleanProperty(value);
    }

    /** Whether the overlay can be pushed on-screen if none of the provided positions fit. */
    @Input('cdkConnectedOverlayPush')
    get push() {
        return this._push;
    }

    set push(value: boolean) {
        this._push = coerceBooleanProperty(value);
    }

    /** Event emitted when the backdrop is clicked. */
    @Output() backdropClick = new EventEmitter<MouseEvent>();

    /** Event emitted when the position has changed. */
    @Output() positionChange = new EventEmitter<ConnectedOverlayPositionChange>();

    /** Event emitted when the overlay has been attached. */
    @Output() attach = new EventEmitter<void>();

    /** Event emitted when the overlay has been detached. */
    @Output() detach = new EventEmitter<void>();

    private _overlayRef: OverlayRef;
    private _templatePortal: TemplatePortal;
    private _hasBackdrop = false;
    private _lockPosition = false;
    private _growAfterOpen = false;
    private _flexibleDimensions = false;
    private _push = false;
    private _backdropSubscription = Subscription.EMPTY;
    private _offsetX: number;
    private _offsetY: number;
    private _position: FlexibleConnectedPositionStrategy;

    constructor(
        private _overlay: Overlay,
        templateRef: TemplateRef<any>,
        viewContainerRef: ViewContainerRef,
        @Inject(CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY) private _scrollStrategy,
        @Optional() private _dir: Directionality) {
        this._templatePortal = new TemplatePortal(templateRef, viewContainerRef);
    }

    /** The associated overlay reference. */
    get overlayRef(): OverlayRef {
        return this._overlayRef;
    }

    /** The element's layout direction. */
    get dir(): Direction {
        return this._dir ? this._dir.value : 'ltr';
    }

    ngOnDestroy() {
        this._destroyOverlay();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this._position) {
            if (changes['positions']) { //tslint:disable-line
                this._position.withPositions(this.positions);
            }

            if (changes['lockPosition']) { //tslint:disable-line
                this._position.withLockedPosition(this.lockPosition);
            }

            if (changes['origin']) { //tslint:disable-line
                this._position.setOrigin(this.origin.elementRef);

                if (this.open) {
                    this._position.apply();
                }
            }
        }

        if (changes['open']) { //tslint:disable-line
            this.open ? this._attachOverlay() : this._detachOverlay(); //tslint:disable-line
        }
    }

    /** Creates an overlay */
    private _createOverlay() {
        if (!this.positions || !this.positions.length) {
            this.positions = defaultPositionList;
        }

        this._overlayRef = this._overlay.create(this._buildConfig());
    }

    /** Builds the overlay config based on the directive's inputs */
    private _buildConfig(): OverlayConfig {
        const positionStrategy = this._position = this._createPositionStrategy();
        const overlayConfig = new OverlayConfig({
            direction: this._dir,
            positionStrategy,
            scrollStrategy: this.scrollStrategy,
            hasBackdrop: this.hasBackdrop
        });

        if (this.width || this.width === 0) {
            overlayConfig.width = this.width;
        }

        if (this.height || this.height === 0) {
            overlayConfig.height = this.height;
        }

        if (this.minWidth || this.minWidth === 0) {
            overlayConfig.minWidth = this.minWidth;
        }

        if (this.minHeight || this.minHeight === 0) {
            overlayConfig.minHeight = this.minHeight;
        }

        if (this.backdropClass) {
            overlayConfig.backdropClass = this.backdropClass;
        }

        return overlayConfig;
    }

    /** Returns the position strategy of the overlay to be set on the overlay config */
    private _createPositionStrategy(): FlexibleConnectedPositionStrategy {
        const strategy = this._overlay.position()
            .flexibleConnectedTo(this.origin.elementRef)
            .withFlexibleDimensions(this.flexibleDiemsions)
            .withPush(this.push)
            .withGrowAfterOpen(this.growAfterOpen)
            .withViewportMargin(this.viewportMargin)
            .withLockedPosition(this.lockPosition);

        this._setPositions(strategy);
        strategy.positionChanges.subscribe((position) => this.positionChange.emit(position));

        return strategy;
    }

    /**
     * Sets the primary and fallback positions of a positions strategy,
     * based on the current directive inputs.
     */
    private _setPositions(positionStrategy: FlexibleConnectedPositionStrategy) {
        const positions: IConnectedPosition[] = this.positions.map((pos) => ({
            originX: pos.originX,
            originY: pos.originY,
            overlayX: pos.overlayX,
            overlayY: pos.overlayY,
            offsetX: pos.offsetX || this.offsetX,
            offsetY: pos.offsetY || this.offsetY
        }));

        positionStrategy.withPositions(positions);
    }

    /** Attaches the overlay and subscribes to backdrop clicks if backdrop exists */
    private _attachOverlay() {
        if (!this._overlayRef) {
            this._createOverlay();

            this._overlayRef!.keydownEvents().subscribe((event: KeyboardEvent) => { //tslint:disable-line
                if (event.keyCode === ESCAPE) { //tslint:disable-line
                    this._detachOverlay();
                }
            });
        } else {
            // Update the overlay size, in case the directive's inputs have changed
            this._overlayRef.updateSize({
                width: this.width,
                minWidth: this.minWidth,
                height: this.height,
                minHeight: this.minHeight
            });
        }

        if (!this._overlayRef.hasAttached()) {
            this._overlayRef.attach(this._templatePortal);
            this.attach.emit();
        }

        if (this.hasBackdrop) {
            this._backdropSubscription = this._overlayRef.backdropClick().subscribe((event) => {
                this.backdropClick.emit(event);
            });
        }
    }

    /** Detaches the overlay and unsubscribes to backdrop clicks if backdrop exists */
    private _detachOverlay() {
        if (this._overlayRef) {
            this._overlayRef.detach();
            this.detach.emit();
        }

        this._backdropSubscription.unsubscribe();
    }

    /** Destroys the overlay created by this directive. */
    private _destroyOverlay() {
        if (this._overlayRef) {
            this._overlayRef.dispose();
        }

        this._backdropSubscription.unsubscribe();
    }
}


/** @docs-private */
export function CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER_FACTORY(overlay: Overlay):
    () => RepositionScrollStrategy {
    return () => overlay.scrollStrategies.reposition();
}

/** @docs-private */
export const CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER = {
    provide: CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: CDK_CONNECTED_OVERLAY_SCROLL_STRATEGY_PROVIDER_FACTORY
};
