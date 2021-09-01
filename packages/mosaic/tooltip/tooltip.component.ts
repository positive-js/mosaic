import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
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
    Inject,
    InjectionToken,
    Input,
    NgZone,
    Optional,
    TemplateRef,
    Type,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import { McPopUp, McPopUpTrigger, PopUpTriggers, POSITION_TO_CSS_MAP } from '@ptsecurity/mosaic/core';
import { merge } from 'rxjs';

import { mcTooltipAnimations } from './tooltip.animations';


@Component({
    selector: 'mc-tooltip-component',
    animations: [mcTooltipAnimations.tooltipState],
    templateUrl: './tooltip.component.html',
    styleUrls: ['./tooltip.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McTooltipComponent extends McPopUp {
    prefix = 'mc-tooltip';

    constructor(changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
    }
}

export const MC_TOOLTIP_SCROLL_STRATEGY =
    new InjectionToken<() => ScrollStrategy>('mc-tooltip-scroll-strategy');

/** @docs-private */
export function mcTooltipScrollStrategyFactory(overlay: Overlay): () => ScrollStrategy {
    return () => overlay.scrollStrategies.reposition({ scrollThrottle: 20 });
}

/** @docs-private */
export const MC_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER = {
    provide: MC_TOOLTIP_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: mcTooltipScrollStrategyFactory
};

/** Creates an error to be thrown if the user supplied an invalid tooltip position. */
export function getMcTooltipInvalidPositionError(position: string) {
    return Error(`McTooltip position "${position}" is invalid.`);
}

@Directive({
    selector: '[mcTooltip]',
    exportAs: 'mcTooltip',
    host: {
        '[class.mc-tooltip_open]': 'isOpen',

        '(keydown)': 'handleKeydown($event)',
        '(touchend)': 'handleTouchend()'
    }
})
export class McTooltipTrigger extends McPopUpTrigger<McTooltipComponent> {
    @Input('mcTooltip')
    get content(): string | TemplateRef<any> {
        return this._content;
    }

    set content(content: string | TemplateRef<any>) {
        this._content = content;

        if (this.instance) {
            this.instance!.content = content;
        }
    }

    @Input('mcTooltipDisabled')
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value) {
        this._disabled = coerceBooleanProperty(value);
    }

    @Input('mcEnterDelay') enterDelay = 400;

    @Input('mcTrigger')
    get trigger(): string {
        return this._trigger;
    }

    set trigger(value: string) {
        if (value) {
            this._trigger = value;
        } else {
            this._trigger = `${PopUpTriggers.Hover}, ${PopUpTriggers.Focus}`;
        }

        this.initListeners();
    }

    private _trigger = `${PopUpTriggers.Hover}, ${PopUpTriggers.Focus}`;

    @Input('mcTooltipClass')
    get customClass(): string {
        return this._customClass;
    }

    set customClass(value: string) {
        if (value) {
            this._customClass = value;

            this.updateClassMap();
        } else {
            this._customClass = '';
        }
    }

    protected originSelector = '.mc-tooltip';

    protected overlayConfig: OverlayConfig = {
        panelClass: 'mc-tooltip-panel'
    };

    constructor(
        overlay: Overlay,
        elementRef: ElementRef,
        ngZone: NgZone,
        scrollDispatcher: ScrollDispatcher,
        hostView: ViewContainerRef,
        @Inject(MC_TOOLTIP_SCROLL_STRATEGY) scrollStrategy,
        @Optional() direction: Directionality
    ) {
        super(overlay, elementRef, ngZone, scrollDispatcher, hostView, scrollStrategy, direction);
    }

    updateData() {
        this.instance.content = this.content;
    }

    closingActions() {
        return merge(
            this.overlayRef!.outsidePointerEvents(),
            this.overlayRef!.detachments()
        );
    }

    getOverlayHandleComponentType(): Type<McTooltipComponent> {
        return McTooltipComponent;
    }

    updateClassMap(newPlacement: string = this.placement) {
        if (!this.instance) { return; }

        this.instance.updateClassMap(POSITION_TO_CSS_MAP[newPlacement], this.customClass);
        this.instance.markForCheck();
    }
}
