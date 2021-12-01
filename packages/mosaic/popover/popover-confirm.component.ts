import { Directionality } from '@angular/cdk/bidi';
import { Overlay, ScrollDispatcher } from '@angular/cdk/overlay';
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
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import { ThemePalette } from '@ptsecurity/mosaic/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { mcPopoverAnimations } from './popover-animations';
import { MC_POPOVER_SCROLL_STRATEGY, McPopoverComponent, McPopoverTrigger } from './popover.component';

export const POPOVER_CONFIRM_TEXT = new InjectionToken<string>('');
export const POPOVER_CONFIRM_BUTTON_TEXT = new InjectionToken<string>('');

@Component({
    selector: 'mc-popover-confirm-component',
    templateUrl: './popover-confirm.component.html',
    preserveWhitespaces: false,
    styleUrls: ['./popover.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [mcPopoverAnimations.popoverState]
})
export class McPopoverConfirmComponent extends McPopoverComponent {
    themePalette = ThemePalette;

    onConfirm = new Subject<void>();
    confirmButtonText: string;

    confirmText: string;

    constructor(changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
    }
}


@Directive({
    selector: '[mcPopoverConfirm]',
    exportAs: 'mcPopoverConfirm',
    host: {
        '[class.mc-popover_open]': 'isOpen',
        '(keydown)': 'handleKeydown($event)',
        '(touchend)': 'handleTouchend()'
    }
})
export class McPopoverConfirmTrigger extends McPopoverTrigger {
    @Output() confirm: EventEmitter<void> = new EventEmitter<void>();

    @Input('mcPopoverConfirmText')
    get confirmText(): string {
        return this._confirmText;
    }

    set confirmText(value: string) {
        this._confirmText = value;

        this.updateData();
    }

    private _confirmText: string = 'Вы уверены, что хотите продолжить?';

    @Input('mcPopoverConfirmButtonText')
    get confirmButtonText(): string {
        return this._confirmButtonText;
    }

    set confirmButtonText(value: string) {
        this._confirmButtonText = value;

        this.updateData();
    }

    private _confirmButtonText: string = 'Да';

    constructor(
        overlay: Overlay,
        elementRef: ElementRef,
        ngZone: NgZone,
        scrollDispatcher: ScrollDispatcher,
        hostView: ViewContainerRef,
        @Inject(MC_POPOVER_SCROLL_STRATEGY) scrollStrategy,
        @Optional() direction: Directionality,
        @Optional() @Inject(POPOVER_CONFIRM_TEXT) confirmText: string,
        @Optional() @Inject(POPOVER_CONFIRM_BUTTON_TEXT) confirmButtonText: string
    ) {
        super(overlay, elementRef, ngZone, scrollDispatcher, hostView, scrollStrategy, direction);

        if (confirmText) {
            this.confirmText = confirmText;
        }
        if (confirmButtonText) {
            this.confirmButtonText = confirmButtonText;
        }
    }

    updateData() {
        if (!this.instance) { return; }
        super.updateData();
        this.setupButtonEvents();
        this.instance.confirmButtonText = this.confirmButtonText;
        this.instance.confirmText = this.confirmText;
    }

    setupButtonEvents() {
        this.instance.onConfirm.pipe(takeUntil(this.destroyed)).subscribe(() => {
            this.confirm.emit();
            this.hide();
        });
    }

    getOverlayHandleComponentType() {
        return McPopoverConfirmComponent;
    }
}
