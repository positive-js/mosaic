// tslint:disable:no-empty
import { animate, state, style, transition, trigger } from '@angular/animations';
import {
    Attribute,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    ElementRef, EventEmitter, forwardRef,
    Input, Output, ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FocusMonitor } from '@ptsecurity/cdk/a11y';
import {
    CanColor,
    CanColorCtor,
    CanDisable,
    CanDisableCtor,
    HasTabIndex,
    HasTabIndexCtor,
    mixinColor,
    mixinDisabled,
    mixinTabIndex
} from '@ptsecurity/mosaic/core';
import { ThemePalette } from '@ptsecurity/mosaic/core/common-behaviors/color';


let nextUniqueId = 0;

type ToggleLabelPositionType = 'left' | 'right';

export class McToggleBase {
    constructor(public _elementRef: ElementRef) {}
}

export const _McToggleMixinBase:
    HasTabIndexCtor &
    CanDisableCtor &
    CanColorCtor &
    typeof McToggleBase = mixinTabIndex(mixinColor(mixinDisabled(McToggleBase)));

export class McToggleChange {
    source: McToggleComponent;
    checked: boolean;
}

@Component({
    selector: 'mc-toggle',
    exportAs: 'mcToggle',
    templateUrl: './toggle.component.html',
    styleUrls: ['./toggle.css'],
    providers: [
        {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => McToggleComponent), multi: true}
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['disabled', 'color', 'tabIndex'],
    host: {
        '[id]': 'id',
        '[attr.id]': 'id',
        '[class.mc-toggle-disabled]': 'disabled',
        '[class.mc-toggle-off]': '!checked'
    },
    animations: [
        trigger('switch', [
            state('true' , style({ right: '-1px' })),
            state('false', style({ right: '*' })),
            transition('* => *', animate('150ms'))
        ])
    ]
})
export class McToggleComponent extends _McToggleMixinBase
    implements ControlValueAccessor, CanColor, CanDisable, HasTabIndex {

    color: ThemePalette = ThemePalette.Primary;

    @ViewChild('input') _inputElement: ElementRef;

    @Input() labelPosition: ToggleLabelPositionType = 'right';

    @Input('aria-label') ariaLabel: string = '';
    @Input('aria-labelledby') ariaLabelledby: string | null = null;

    private _uniqueId: string = `mc-toggle-${++nextUniqueId}`;

    // tslint:disable:member-ordering
    @Input() id: string = this._uniqueId;

    get inputId(): string {
        return `${this.id || this._uniqueId}-input`;
    }

    @Input() name: string | null = null;

    @Input() value: string;

    private _disabled: boolean = false;

    @Input()
    get disabled() {
        return this._disabled;
    }

    set disabled(value: any) {
        if (value !== this._disabled) {
            this._disabled = value;
            this._changeDetectorRef.markForCheck();
        }
    }

    private _checked: boolean = false;

    get checked() {
        return this._checked;
    }

    @Input()
    set checked(value: boolean) {
        if (value !== this._checked) {
            this._checked = value;
            this._changeDetectorRef.markForCheck();
        }
    }

    @Output() readonly change: EventEmitter<McToggleChange> =
        new EventEmitter<McToggleChange>();

    constructor(public _elementRef: ElementRef,
                private _focusMonitor: FocusMonitor,
                private _changeDetectorRef: ChangeDetectorRef,
                @Attribute('tabindex') tabIndex: string
    ) {
        super(_elementRef);

        this.tabIndex = parseInt(tabIndex) || 0;

        this._focusMonitor.monitor(this._elementRef.nativeElement, true);
    }

    ngOnDestroy() {
        this._focusMonitor.stopMonitoring(this._elementRef.nativeElement);
    }

    focus(): void {
        this._focusMonitor.focusVia(this._inputElement.nativeElement, 'keyboard');
    }

    _getAriaChecked(): boolean {
        return this.checked;
    }

    _onInteractionEvent(event: Event) {
        event.stopPropagation();
    }

    _onLabelTextChange() {
        this._changeDetectorRef.markForCheck();
    }

    _onInputClick(event: MouseEvent) {
        event.stopPropagation();
        this._updateModelValue();
        this._emitChangeEvent();
    }

    writeValue(value: any) {
        this.checked = !!value;
    }

    registerOnChange(fn: any) {
        this._onChangeCallback = fn;
    }

    registerOnTouched(fn: any) {
        this._onTouchedCallback = fn;
    }

    setDisabledState(isDisabled: boolean) {
        this.disabled = isDisabled;
    }

    private _onTouchedCallback = () => {};

    private _onChangeCallback = (_: any) => {};

    private _updateModelValue() {
        this._checked = !this.checked;
        this._onChangeCallback(this.checked);
        this._onTouchedCallback();
    }

    private _emitChangeEvent() {
        const event = new McToggleChange();
        event.source = this;
        event.checked = this.checked;

        this._onChangeCallback(this.checked);
        this.change.emit(event);
    }
}
