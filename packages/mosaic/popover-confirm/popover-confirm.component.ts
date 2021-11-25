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
    PopUpTriggers,
    POSITION_TO_CSS_MAP
} from '@ptsecurity/mosaic/core';
import { merge, NEVER, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { mcPopoverConfirmAnimations } from './popover-confirm-animations';


@Component({
    selector: 'mc-popover-confirm-component',
    templateUrl: './popover-confirm.component.html',
    preserveWhitespaces: false,
    styleUrls: ['./popover-confirm.scss'],
    host: {
        '(keydown.esc)': 'hide(0)'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [mcPopoverConfirmAnimations.popoverState]
})
export class McPopoverConfirmComponent extends McPopUp {
    onConfirm$ = new Subject<void>();
    onReject$ = new Subject<void>();

    constructor(changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
    }

    updateClassMap(placement: string, customClass: string) {
        super.updateClassMap(
            placement,
            customClass,
        );
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

const DEFAULT_CONFIRM_MESSAGE = 'Вы уверены что хотите продолжить?';

@Directive({
    selector: '[mcPopoverConfirm]',
    exportAs: 'mcPopoverConfirm',
    host: {
        '[class.mc-popover_open]': 'isOpen',
        '(keydown)': 'handleKeydown($event)',
        '(touchend)': 'handleTouchend()'
    }
})
export class McPopoverConfirmTrigger extends McPopUpTrigger<McPopoverConfirmComponent> {
    @Input()
    get hasBackdrop(): boolean {
        return this._hasBackdrop;
    }

    set hasBackdrop(value: boolean) {
        this._hasBackdrop = coerceBooleanProperty(value);
    }

    private _hasBackdrop: boolean = false;

    @Input('mcPopoverMessage')
    get content(): string | TemplateRef<any> {
        return this._content || DEFAULT_CONFIRM_MESSAGE;
    }

    set content(value: string | TemplateRef<any>) {
        this._content = value;

        this.updateData();
    }

    @Input('mcPopoverDisabled')
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
    }

    trigger: string = PopUpTriggers.Click;

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

    protected originSelector = '.mc-popover';

    protected overlayConfig: OverlayConfig = {
        panelClass: 'mc-popover__panel',
        hasBackdrop: this.hasBackdrop,
        backdropClass: this.backdropClass
    };

    @Output() confirm: EventEmitter<void> = new EventEmitter<void>();

    @Output() reject: EventEmitter<void> = new EventEmitter<void>();

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

        this.instance.content = this.content;

        this.setupButtonEvents();

        if (this.isOpen) {
            this.updatePosition(true);
        }
    }

    setupButtonEvents() {
        this.instance.onConfirm$.pipe(takeUntil(this.destroyed)).subscribe(() => {
            this.confirm.emit();
        })
        this.instance.onReject$.pipe(takeUntil(this.destroyed)).subscribe(() => {
            this.reject.emit();
        })
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

    getOverlayHandleComponentType(): Type<McPopoverConfirmComponent> {
        return McPopoverConfirmComponent;
    }

    updateClassMap(newPlacement: string = this.placement) {
        if (!this.instance) { return; }

        this.instance.updateClassMap(POSITION_TO_CSS_MAP[newPlacement], this.customClass);
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
