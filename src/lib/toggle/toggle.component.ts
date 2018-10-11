// tslint:disable:no-empty
import { animate, state, style, transition, trigger } from '@angular/animations';
import {
    Attribute,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Input,
    ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FocusMonitor } from '@ptsecurity/cdk/a11y';
import {
    CanColor,
    CanColorCtor,
    CanDisable,
    CanDisableCtor,
    HasTabIndex, HasTabIndexCtor,
    mixinColor,
    mixinDisabled, mixinTabIndex
} from '@ptsecurity/mosaic/core';


let nextUniqueId = 0;

export class McToggleBase {
    constructor(public _elementRef: ElementRef) {}
}

export const _McToggleMixinBase:
    HasTabIndexCtor &
    CanDisableCtor &
    CanColorCtor &
    typeof McToggleBase = mixinTabIndex(mixinColor(mixinDisabled(McToggleBase)));

@Component({
    selector: 'mc-toggle',
    exportAs: 'mcToggle',
    template: `
        <label [attr.for]="inputId" class="mc-toggle-layout" #label>
            <div class="mc-toggle__container">
                <input type="checkbox"
                       class="mc-toggle-input cdk-visually-hidden"
                       [id]="inputId"
                       [value]="modelValue"
                       [required]="required"
                       [checked]="checked"
                       [attr.value]="value"
                       [disabled]="disabled"
                       [attr.name]="name"
                       [tabIndex]="tabIndex"
                       [indeterminate]="indeterminate"
                       [attr.aria-label]="ariaLabel || null"
                       [attr.aria-labelledby]="ariaLabelledby"
                       [attr.aria-checked]="_getAriaChecked()"
                       (click)="updateModelValue()" />
                <!--<div class="mc-toggle__focus-container"></div>-->
                <div class="mc-toggle__capsule">
                    <div class="mc-toggle__circle" [@switch]="modelValue"></div>
                </div>
                <div class="mc-toggle__content-container">
                    <ng-content></ng-content>
                </div>
            </div>
        </label>
    `,
    styleUrls: ['./toggle.css'],
    providers: [
        {provide: NG_VALUE_ACCESSOR, useExisting: McToggleComponent, multi: true}
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['disabled', 'color'],
    host: {
        '[class.mc-toggle-off]': '!modelValue'
    },
    animations: [
        trigger('switch', [
            state('true' , style({ right: '-1px' })),
            state('false', style({ right: '*' })),
            transition('* => *', animate('300ms'))
        ])
    ]
})
export class McToggleComponent extends _McToggleMixinBase
    implements ControlValueAccessor, CanColor, CanDisable, HasTabIndex {

    modelValue: boolean = false;

    @Input('aria-label') ariaLabel: string = '';
    @Input('aria-labelledby') ariaLabelledby: string | null = null;

    private _uniqueId: string = `mc-toggle-${++nextUniqueId}`;

    // tslint:disable:member-ordering
    @Input() id: string = this._uniqueId;

    _getAriaChecked(): 'true' | 'false' {
        return this.modelValue ? 'true' : 'false';
    }

    get inputId(): string {
        return `${this.id || this._uniqueId}-input`;
    }

    @Input() name: string | null = null;

    constructor(public _elementRef: ElementRef,
                private _focusMonitor: FocusMonitor,
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
        this._getHostElement().focus();
    }

    _getHostElement() {
        return this._elementRef.nativeElement;
    }

    updateModelValue() {
        this.modelValue = !this.modelValue;
        this.onChangeCallback(this.modelValue);
        this.onTouchedCallback();
    }

    writeValue(value: boolean) {
        if (value !== this.modelValue) {
            this.modelValue = value;
        }
    }

    registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }

    registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
    }

    private onTouchedCallback = () => {};

    private onChangeCallback = (_: any) => {};
}
