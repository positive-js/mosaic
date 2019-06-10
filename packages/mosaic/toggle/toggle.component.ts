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
    ThemePalette,
    CanColor, CanColorCtor,
    CanDisable, CanDisableCtor,
    HasTabIndex, HasTabIndexCtor,
    mixinColor,
    mixinDisabled,
    mixinTabIndex
} from '@ptsecurity/mosaic/core';


let nextUniqueId = 0;

type ToggleLabelPositionType = 'left' | 'right';

export class McToggleBase {
    constructor(public _elementRef: ElementRef) {}
}

export const _McToggleMixinBase:
    HasTabIndexCtor &
    CanDisableCtor &
    CanColorCtor &
    typeof McToggleBase = mixinTabIndex(mixinColor(mixinDisabled(McToggleBase), ThemePalette.Primary));

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
        class: 'mc-toggle',
        '[id]': 'id',
        '[attr.id]': 'id',
        '[class.mc-disabled]': 'disabled',
        '[class.mc-toggle_off]': '!checked'
    },
    animations: [
        trigger('switch', [
            state('true' , style({ left: '50%' })),
            state('false', style({ left: '1px' })),
            transition('true <=> false', animate('150ms'))
        ])
    ]
})
export class McToggleComponent extends _McToggleMixinBase
    implements ControlValueAccessor, CanColor, CanDisable, HasTabIndex {

    @ViewChild('input', {static: false}) _inputElement: ElementRef;

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

    // tslint:disable-next-line:no-empty
    private _onTouchedCallback = () => {};

    // tslint:disable-next-line:no-empty
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
