import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
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
    McPopUp,
    McPopUpTrigger,
    PopUpPlacements,
    PopUpSizes,
    PopUpTriggers,
    POSITION_TO_CSS_MAP
} from '@ptsecurity/mosaic/core';
import { merge, NEVER } from 'rxjs';

import { mcPopoverAnimations } from './popover-animations';


@Component({
    selector: 'mc-popover-component',
    templateUrl: './popover.component.html',
    preserveWhitespaces: false,
    styleUrls: ['./popover.scss'],
    host: {
        '(keydown.esc)': 'hide(0)'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [mcPopoverAnimations.popoverState]
})
export class McPopoverComponent extends McPopUp {
    prefix = 'mc-popover';

    header: string | TemplateRef<any>;
    footer: string | TemplateRef<any>;

    isTrapFocus: boolean = false;

    constructor(changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
    }

    updateClassMap(placement: string, customClass: string, size: PopUpSizes) {
        super.updateClassMap(
            placement,
            customClass,
            { [`${this.prefix}_${size}`]: !!size }
        );
    }

    updateTrapFocus(isTrapFocus: boolean): void {
        this.isTrapFocus = isTrapFocus;
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


@Directive({
    selector: '[mcPopover]',
    exportAs: 'mcPopover',
    host: {
        '[class.mc-popover_open]': 'isOpen',
        '(keydown)': 'handleKeydown($event)',
        '(touchend)': 'handleTouchend()'
    }
})
export class McPopoverTrigger extends McPopUpTrigger<McPopoverComponent> {
    @Input('mcPopoverVisible')
    get popoverVisible(): boolean {
        return this.visible;
    }

    set popoverVisible(value: boolean) {
        super.updateVisible(value);
    }

    @Input('mcPopoverPlacement')
    get popoverPlacement(): PopUpPlacements {
        return this.placement;
    }

    set popoverPlacement(value: PopUpPlacements) {
        super.updatePlacement(value);
    }

    @Input('mcPopoverPlacementPriority')
    get popoverPlacementPriority() {
        return this.placementPriority;
    }

    set popoverPlacementPriority(value) {
        super.updatePlacementPriority(value);
    }

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

        this.updateData();
    }

    private _header: string | TemplateRef<any>;

    @Input('mcPopoverContent')
    get content(): string | TemplateRef<any> {
        return this._content;
    }

    set content(value: string | TemplateRef<any>) {
        this._content = value;

        this.updateData();
    }

    @Input('mcPopoverFooter')
    get footer(): string | TemplateRef<any> {
        return this._footer;
    }

    set footer(value: string | TemplateRef<any>) {
        this._footer = value;

        this.updateData();
    }

    private _footer: string | TemplateRef<any>;

    @Input('mcPopoverDisabled')
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
    }

    @Input('mcTrigger')
    get trigger(): string {
        return this._trigger;
    }

    set trigger(value: string) {
        if (value) {
            this._trigger = value;
        } else {
            this._trigger = PopUpTriggers.Click;
        }

        this.initListeners();
    }

    private _trigger: string = PopUpTriggers.Click;

    @Input('mcPopoverSize')
    get size(): PopUpSizes {
        return this._size;
    }

    set size(value: PopUpSizes) {
        if ([PopUpSizes.Small, PopUpSizes.Normal, PopUpSizes.Large].includes(value)) {
            this._size = value;

            this.updateClassMap();
        } else {
            this._size = PopUpSizes.Normal;
        }
    }

    private _size: PopUpSizes = PopUpSizes.Normal;

    @Input('mcPopoverClass')
    get customClass() {
        return this._customClass;
    }

    set customClass(value: string) {
        this._customClass = value;

        this.updateClassMap();
    }

    @Input()
    get closeOnScroll(): boolean {
        return this._closeOnScroll;
    }

    set closeOnScroll(value: boolean) {
        this._closeOnScroll = coerceBooleanProperty(value);
    }

    private _closeOnScroll: boolean = false;

    @Input() backdropClass: string = 'cdk-overlay-transparent-backdrop';

    @Output('mcPopoverPlacementChange') placementChange = new EventEmitter();

    @Output('mcPopoverVisibleChange') visibleChange = new EventEmitter<boolean>();

    protected originSelector = '.mc-popover';

    protected get overlayConfig(): OverlayConfig {
        return {
            panelClass: 'mc-popover__panel',
            hasBackdrop: this.hasBackdrop,
            backdropClass: this.backdropClass
        };
    }

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
        if (!this.instance) { return; }

        this.instance.header = this.header;
        this.instance.content = this.content;
        this.instance.footer = this.footer;

        this.instance.updateTrapFocus(this.trigger !== PopUpTriggers.Focus);

        if (this.isOpen) {
            this.updatePosition(true);
        }
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

    updateClassMap(newPlacement: string = this.placement) {
        if (!this.instance) { return; }

        this.instance.updateClassMap(POSITION_TO_CSS_MAP[newPlacement], this.customClass, this.size);
        this.instance.markForCheck();
    }

    closingActions() {
        return merge(
            this.overlayRef!.backdropClick(),
            this.hasBackdrop ? NEVER : this.overlayRef!.outsidePointerEvents(),
            this.closeOnScroll ? this.scrollDispatcher.scrolled() : NEVER,
            this.overlayRef!.detachments()
        );
    }
}
