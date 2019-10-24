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
    // tslint:disable-next-line: naming-convention
    constructor(public _elementRef: ElementRef) {}
}

// tslint:disable-next-line: naming-convention
export const McToggleMixinBase:
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
export class McToggleComponent extends McToggleMixinBase
    implements ControlValueAccessor, CanColor, CanDisable, HasTabIndex {

    @ViewChild('input', {static: false}) inputElement: ElementRef;

    @Input() labelPosition: ToggleLabelPositionType = 'right';

    @Input('aria-label') ariaLabel: string = '';
    @Input('aria-labelledby') ariaLabelledby: string | null = null;

    @Input() id: string;

    get inputId(): string {
        return `${this.id || this.uniqueId}-input`;
    }

    @Input() name: string | null = null;

    @Input() value: string;

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

    private _disabled: boolean = false;

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

    private _checked: boolean = false;

    @Output() readonly change: EventEmitter<McToggleChange> =
        new EventEmitter<McToggleChange>();

    private uniqueId: string = `mc-toggle-${++nextUniqueId}`;

    // tslint:disable-next-line:naming-convention
    constructor(public _elementRef: ElementRef,
                private _focusMonitor: FocusMonitor,
                private _changeDetectorRef: ChangeDetectorRef,
                @Attribute('tabindex') tabIndex: string
    ) {
        super(_elementRef);

        this.id =  this.uniqueId;

        this.tabIndex = parseInt(tabIndex) || 0;

        this._focusMonitor.monitor(this._elementRef.nativeElement, true);
    }

    ngOnDestroy() {
        this._focusMonitor.stopMonitoring(this._elementRef.nativeElement);
    }

    focus(): void {
        this._focusMonitor.focusVia(this.inputElement.nativeElement, 'keyboard');
    }

    getAriaChecked(): boolean {
        return this.checked;
    }

    onInteractionEvent(event: Event) {
        event.stopPropagation();
    }

    onLabelTextChange() {
        this._changeDetectorRef.markForCheck();
    }

    onInputClick(event: MouseEvent) {
        event.stopPropagation();
        this.updateModelValue();
        this.emitChangeEvent();
    }

    writeValue(value: any) {
        this.checked = !!value;
    }

    registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }

    registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
    }

    setDisabledState(isDisabled: boolean) {
        this.disabled = isDisabled;
    }

    // tslint:disable-next-line:no-empty
    private onTouchedCallback = () => {};

    // tslint:disable-next-line:no-empty
    private onChangeCallback = (_: any) => {};

    private updateModelValue() {
        this._checked = !this.checked;
        this.onChangeCallback(this.checked);
        this.onTouchedCallback();
    }

    private emitChangeEvent() {
        const event = new McToggleChange();
        event.source = this;
        event.checked = this.checked;

        this.onChangeCallback(this.checked);
        this.change.emit(event);
    }
}
