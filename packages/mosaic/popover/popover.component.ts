import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    ConnectionPositionPair,
    FlexibleConnectedPositionStrategy,
    Overlay,
    ScrollDispatcher,
    ScrollStrategy
} from '@angular/cdk/overlay';
import { OverlayConfig } from '@angular/cdk/overlay/overlay-config';
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
    Optional,
    Output,
    TemplateRef,
    Type,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import {
    McBasePopUp,
    McBasePopUpTrigger,
    TooltipTriggers,
    POSITION_PRIORITY_STRATEGY,
    POSITION_TO_CSS_MAP
} from '@ptsecurity/mosaic/core';
import { merge, NEVER } from 'rxjs';

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
export class McPopoverComponent extends McBasePopUp {
    prefix = 'mc-popover';

    header: string | TemplateRef<any>;
    footer: string | TemplateRef<any>;

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
export class McPopover extends McBasePopUpTrigger<McPopoverComponent> {
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
            this._trigger = TooltipTriggers.Click;
        }

        this.initListeners();
    }

    private _trigger: string = TooltipTriggers.Click;

    @Input('mcPopoverSize')
    get size(): string {
        return this._size;
    }

    set size(value: string) {
        if (['small', 'normal', 'large'].includes(value)) {
            this._size = value;

            if (this.instance) {
                this.instance.updateClassMap(POSITION_TO_CSS_MAP[this.placement], this.customClass, this.size);
            }
        } else {
            this._size = 'normal';
        }
    }

    private _size: string = 'normal';

    @Input('mcPopoverPlacementPriority')
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

    @Input('mcPopoverPlacement')
    get placement(): string {
        return this._placement;
    }

    set placement(value: string) {
        if (value) {
            this._placement = value;

            if (this.instance) {
                this.instance.updateClassMap(POSITION_TO_CSS_MAP[this.placement], this.customClass, this.size);
            }
        } else {
            this._placement = 'top';
        }
    }

    private _placement: string = 'top';

    @Input('mcPopoverClass')
    get customClass() {
        return this._customClass;
    }

    set customClass(value: string) {
        this._customClass = value;

        if (this.instance) {
            this.instance.updateClassMap(POSITION_TO_CSS_MAP[this.placement], this.customClass, this.size);
        }
    }

    private _customClass: string;

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

    @Input('mcPopoverEnterDelay') enterDelay: number = 0;
    @Input('mcPopoverLeaveDelay') leaveDelay: number = 0;

    @Output('mcPopoverVisibleChange') visibleChange = new EventEmitter<boolean>();

    @Output('mcPopoverPlacementChange') placementChange: EventEmitter<string> = new EventEmitter();

    @Input() backdropClass: string = 'cdk-overlay-transparent-backdrop';

    protected originSelector = '.mc-popover';

    protected overlayConfig: OverlayConfig = {
        panelClass: 'mc-popover__panel',
        hasBackdrop: this.hasBackdrop,
        backdropClass: this.backdropClass
    };

    constructor(
        overlay: Overlay,
        elementRef: ElementRef,
        ngZone: NgZone,
        scrollDispatcher: ScrollDispatcher,
        hostView: ViewContainerRef,
        @Inject(MC_POPOVER_SCROLL_STRATEGY) scrollStrategy,
        @Optional() direction: Directionality
    ) {
        super(overlay, elementRef, ngZone, scrollDispatcher, hostView, scrollStrategy, direction);
    }

    updateData() {
        this.instance.header = this.header;
        this.instance.content = this.content;
        this.instance.footer = this.footer;
    }

    /** Updates the position of the current popover. */
    updatePosition(reapplyPosition: boolean = false) {
        this.overlayRef = this.createOverlay();

        const position = (this.overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy)
            .withPositions(this.getPrioritizedPositions())
            .withPush(true);

        if (reapplyPosition) {
            setTimeout(() => position.reapplyLastPosition());
        }
    }

    getOverlayHandleComponentType(): Type<McPopoverComponent> {
        return McPopoverComponent;
    }

    handlePositioningUpdate(placement: string) {
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

        const styleProperty = placement.split(/(?=[A-Z])/)[1].toLowerCase();

        if (
            ['top', 'bottom'].includes(styleProperty) && clientHeight > ANCHOR_MIN_HEIGHT_WIDTH ||
            ['left', 'right'].includes(styleProperty) && clientWidth > ANCHOR_MIN_HEIGHT_WIDTH
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

    updateClassMap(newPlacement: string = this.placement) {
        if (!this.instance) { return; }

        this.instance.updateClassMap(POSITION_TO_CSS_MAP[newPlacement], this.customClass, this.size);
        this.instance.markForCheck();
    }

    /** Create the overlay config and position strategy */
    closingActions() {
        return merge(
            this.overlayRef!.backdropClick(),
            this.hasBackdrop ? NEVER : this.overlayRef!.outsidePointerEvents(),
            this.overlayRef!.detachments()
        );
    }

    // tslint:disable-next-line:no-any
    private updateCompValue(key: string, value: any): void {
        if (value && this.instance) {
            this.instance[key] = value;
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
        if (this.placementPriority) {
            return this.getPriorityPlacementStrategy(this.placementPriority);
        }

        return POSITION_PRIORITY_STRATEGY[this.placement];
    }
}
