import { FocusMonitor } from '@angular/cdk/a11y';
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import {
    AfterContentInit, AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, ContentChildren, Directive, ElementRef, EventEmitter, forwardRef,
    Input, OnDestroy, OnInit, Optional, Output, QueryList,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
    CanColor, CanColorCtor,
    CanDisable, CanDisableCtor,
    HasTabIndex, HasTabIndexCtor,
    mixinColor,
    mixinDisabled,
    mixinTabIndex,
    toBoolean
} from '@ptsecurity/mosaic/core';


// Increasing integer for generating unique ids for radio components.
let nextUniqueId = 0;

/** Change event object emitted by McRadio. */
export class McRadioChange {
    constructor(
        /** The McRadioButton that emits the change event. */
        public source: McRadioButton,
        /** The value of the McRadioButton. */
        public value: any) {}
}

// Boilerplate for applying mixins to McRadioGroup.
/** @docs-private */
export class McRadioGroupBase {}
// tslint:disable-next-line:naming-convention
export const McRadioGroupMixinBase: CanDisableCtor & typeof McRadioGroupBase = mixinDisabled(McRadioGroupBase);

/**
 * Provider Expression that allows mc-radio-group to register as a ControlValueAccessor. This
 * allows it to support [(ngModel)] and ngControl.
 * @docs-private
 */
export const MC_RADIO_GROUP_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => McRadioGroup),
    multi: true
};

@Directive({
    selector: 'mc-radio-group',
    exportAs: 'mcRadioGroup',
    providers: [MC_RADIO_GROUP_CONTROL_VALUE_ACCESSOR],
    host: {
        role: 'radiogroup',
        class: 'mc-radio-group'
    },
    inputs: ['disabled']
})
export class McRadioGroup extends McRadioGroupMixinBase
    implements AfterContentInit, ControlValueAccessor, CanDisable {

    /** Name of the radio button group. All radio buttons inside this group will use this name. */
    @Input()
    get name(): string { return this._name; }
    set name(value: string) {
        this._name = value;
        this.updateRadioButtonNames();
    }

    /** Whether the labels should appear after or before the radio-buttons. Defaults to 'after' */
    @Input()
    get labelPosition(): 'before' | 'after' {
        return this._labelPosition;
    }
    set labelPosition(v) {
        this._labelPosition = v === 'before' ? 'before' : 'after';
        this.markRadiosForCheck();
    }

    /** Value of the radio button. */
    @Input()
    get value(): any { return this._value; }
    set value(newValue: any) {
        if (this._value !== newValue) {
            // Set this before proceeding to ensure no circular loop occurs with selection.
            this._value = newValue;

            this.updateSelectedRadioFromValue();
            this.checkSelectedRadioButton();
        }
    }

    /** Whether the radio button is selected. */
    @Input()
    get selected() { return this._selected; }
    set selected(selected: McRadioButton | null) {
        this._selected = selected;
        this.value = selected ? selected.value : null;
        this.checkSelectedRadioButton();
    }

    /** Whether the radio group is disabled */
    @Input()
    get disabled(): boolean { return this._disabled; }
    set disabled(value) {
        this._disabled = toBoolean(value);
        this.markRadiosForCheck();
    }

    /** Whether the radio group is required */
    @Input()
    get required(): boolean { return this._required; }
    set required(value: boolean) {
        this._required = toBoolean(value);
        this.markRadiosForCheck();
    }

    /**
     * Event emitted when the group value changes.
     * Change events are only emitted when the value changes due to user interaction with
     * a radio button (the same behavior as `<input type-"radio">`).
     */
    @Output() readonly change: EventEmitter<McRadioChange> = new EventEmitter<McRadioChange>();

    /** Child radio buttons. */
    @ContentChildren(forwardRef(() => McRadioButton), { descendants: true })
    radios: QueryList<McRadioButton>;

    /**
     * Selected value for group. Should equal the value of the selected radio button if there *is*
     * a corresponding radio button with a matching value. If there is *not* such a corresponding
     * radio button, this value persists to be applied in case a new radio button is added with a
     * matching value.
     */
    private _value: any = null;

    /** The HTML name attribute applied to radio buttons in this group. */
    private _name: string = `mc-radio-group-${nextUniqueId++}`;

    /** The currently selected radio button. Should match value. */
    private _selected: McRadioButton | null = null;

    /** Whether the `value` has been set to its initial value. */
    private isInitialized: boolean = false;

    /** Whether the labels should appear after or before the radio-buttons. Defaults to 'after' */
    private _labelPosition: 'before' | 'after' = 'after';

    /** Whether the radio group is disabled. */
    private _disabled: boolean = false;

    /** Whether the radio group is required. */
    private _required: boolean = false;

    constructor(
        private readonly _changeDetector: ChangeDetectorRef
    ) {
        super();
    }

    /** The method to be called in order to update ngModel */
    // tslint:disable-next-line
    controlValueAccessorChangeFn: (value: any) => void = () => {};

    /**
     * onTouch function registered via registerOnTouch (ControlValueAccessor).
     * @docs-private
     */
    // tslint:disable-next-line
    onTouched: () => any = () => {};

    checkSelectedRadioButton() {
        if (this._selected && !this._selected.checked) {
            this._selected.checked = true;
        }
    }

    /**
     * Initialize properties once content children are available.
     * This allows us to propagate relevant attributes to associated buttons.
     */
    ngAfterContentInit() {
        // Mark this component as initialized in AfterContentInit because the initial value can
        // possibly be set by NgModel on McRadioGroup, and it is possible that the OnInit of the
        // NgModel occurs *after* the OnInit of the McRadioGroup.
        this.isInitialized = true;
    }

    /**
     * Mark this group as being "touched" (for ngModel). Meant to be called by the contained
     * radio buttons upon their blur.
     */
    touch() {
        if (this.onTouched) {
            this.onTouched();
        }
    }

    /** Dispatch change event with current selection and group value. */
    emitChangeEvent(): void {
        if (this.isInitialized) {
            this.change.emit(new McRadioChange(this._selected!, this._value));
        }
    }

    markRadiosForCheck() {
        if (this.radios) {
            this.radios.forEach((radio) => radio.markForCheck());
        }
    }

    /**
     * Sets the model value. Implemented as part of ControlValueAccessor.
     */
    writeValue(value: any) {
        this.value = value;
        this._changeDetector.markForCheck();
    }

    /**
     * Registers a callback to be triggered when the model value changes.
     * Implemented as part of ControlValueAccessor.
     * @param fn Callback to be registered.
     */
    registerOnChange(fn: (value: any) => void) {
        this.controlValueAccessorChangeFn = fn;
    }

    /**
     * Registers a callback to be triggered when the control is touched.
     * Implemented as part of ControlValueAccessor.
     * @param fn Callback to be registered.
     */
    registerOnTouched(fn: any) {
        this.onTouched = fn;
    }

    /**
     * Sets the disabled state of the control. Implemented as a part of ControlValueAccessor.
     * @param isDisabled Whether the control should be disabled.
     */
    setDisabledState(isDisabled: boolean) {
        this.disabled = isDisabled;
        this._changeDetector.markForCheck();
    }

    private updateRadioButtonNames(): void {
        if (this.radios) {
            this.radios.forEach((radio) => {
                radio.name = this.name;
            });
        }
    }

    /** Updates the `selected` radio button from the internal _value state. */
    private updateSelectedRadioFromValue(): void {
        // If the value already matches the selected radio, do nothing.
        const isAlreadySelected = this._selected !== null && this._selected.value === this._value;

        if (this.radios != null && !isAlreadySelected) {
            this._selected = null;
            this.radios.forEach((radio) => {
                radio.checked = this.value === radio.value;
                if (radio.checked) {
                    this._selected = radio;
                }
            });
        }
    }
}


// Boilerplate for applying mixins to McRadioButton.
/** @docs-private */
export class McRadioButtonBase {
    // Since the disabled property is manually defined for the McRadioButton and isn't set up in
    // the mixin base class. To be able to use the tabindex mixin, a disabled property must be
    // defined to properly work.
    disabled: boolean;

    // tslint:disable-next-line:naming-convention
    constructor(public _elementRef: ElementRef) {}
}

// tslint:disable-next-line:naming-convention
export const McRadioButtonMixinBase:
    CanColorCtor &
    HasTabIndexCtor &
    typeof McRadioButtonBase =
        mixinColor(mixinTabIndex(McRadioButtonBase));


@Component({
    selector: 'mc-radio-button',
    templateUrl: 'radio.component.html',
    styleUrls: ['radio.css'],
    inputs: ['color', 'tabIndex'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'mcRadioButton',
    host: {
        class: 'mc-radio-button',
        '[attr.id]': 'id',
        '[class.mc-checked]': 'checked',
        '[class.mc-disabled]': 'disabled'
    }
})
export class McRadioButton extends McRadioButtonMixinBase
    implements OnInit, AfterViewInit, OnDestroy, CanColor, HasTabIndex {

    /** Whether this radio button is checked. */
    @Input()
    get checked(): boolean { return this._checked; }
    set checked(value: boolean) {
        const newCheckedState = toBoolean(value);

        if (this._checked !== newCheckedState) {
            this._checked = newCheckedState;

            if (newCheckedState && this.radioGroup && this.radioGroup.value !== this.value) {
                this.radioGroup.selected = this;
            } else if (!newCheckedState && this.radioGroup && this.radioGroup.value === this.value) {
                // When unchecking the selected radio button, update the selected radio
                // property on the group.
                this.radioGroup.selected = null;
            }

            if (newCheckedState) {
                // Notify all radio buttons with the same name to un-check.
                this._radioDispatcher.notify(this.id, this.name);
            }
            this._changeDetector.markForCheck();
        }
    }

    /** The value of this radio button. */
    @Input()
    get value(): any { return this._value; }
    set value(value: any) {
        if (this._value !== value) {
            this._value = value;
            if (this.radioGroup != null) {
                if (!this.checked) {
                    // Update checked when the value changed to match the radio group's value
                    this.checked = this.radioGroup.value === value;
                }
                if (this.checked) {
                    this.radioGroup.selected = this;
                }
            }
        }
    }

    /** Whether the radio button is disabled. */
    @Input()
    get disabled(): boolean {
        return this._disabled || (this.radioGroup != null && this.radioGroup.disabled);
    }
    set disabled(value: boolean) {
        const newDisabledState = toBoolean(value);

        if (this._disabled !== newDisabledState) {

            this._disabled = newDisabledState;
            this._changeDetector.markForCheck();
        }
    }

    /** Whether the radio button is required. */
    @Input()
    get required(): boolean {
        return this._required || (this.radioGroup && this.radioGroup.required);
    }
    set required(value: boolean) {
        this._required = toBoolean(value);
    }

    /** Whether the label should appear after or before the radio button. Defaults to 'after' */
    @Input()
    get labelPosition(): 'before' | 'after' {
        return this._labelPosition || (this.radioGroup && this.radioGroup.labelPosition) || 'after';
    }
    set labelPosition(value) {
        this._labelPosition = value;
    }

    /** Analog to HTML 'name' attribute used to group radios for unique selection. */
    @Input() name: string;

    /** Used to set the 'aria-label' attribute on the underlying input element. */
    @Input('aria-label') ariaLabel: string;

    /** The 'aria-labelledby' attribute takes precedence as the element's text alternative. */
    @Input('aria-labelledby') ariaLabelledby: string;

    /** The 'aria-describedby' attribute is read after the element's label and field type. */
    @Input('aria-describedby') ariaDescribedby: string;

    /** The native `<input type=radio>` element */
    @ViewChild('input', {static: false}) inputElement: ElementRef;

    /**
     * Event emitted when the checked state of this radio button changes.
     * Change events are only emitted when the value changes due to user interaction with
     * the radio button (the same behavior as `<input type-"radio">`).
     */
    @Output() readonly change: EventEmitter<McRadioChange> = new EventEmitter<McRadioChange>();

    /** The parent radio group. May or may not be present. */
    radioGroup: McRadioGroup;

    @Input()
    isFocused: boolean = false;

    /** The unique ID for the radio button. */
    @Input() id: string;

    /** ID of the native input element inside `<mc-radio-button>` */
    get inputId(): string { return `${this.id || this.uniqueId}-input`; }

    private _labelPosition: 'before' | 'after';

    /* tslint:disable:member-ordering */
    private readonly uniqueId: string = `mc-radio-${++nextUniqueId}`;

    /** Whether this radio is checked. */
    private _checked: boolean = false;

    /** Whether this radio is disabled. */
    private _disabled: boolean;

    /** Whether this radio is required. */
    private _required: boolean;

    /** Value assigned to this radio. */
    private _value: any = null;

    constructor(
        @Optional() radioGroup: McRadioGroup,
        elementRef: ElementRef,
        private readonly _changeDetector: ChangeDetectorRef,
        private focusMonitor: FocusMonitor,
        private readonly _radioDispatcher: UniqueSelectionDispatcher
    ) {

        super(elementRef);

        this.id = this.uniqueId;

        this.radioGroup = radioGroup;

        this.removeUniqueSelectionListener =
            _radioDispatcher.listen((id: string, name: string) => {
                if (id !== this.id && name === this.name) {
                    this.checked = false;
                }
            });
    }

    ngOnInit() {
        if (this.radioGroup) {
            // If the radio is inside a radio group, determine if it should be checked
            this.checked = this.radioGroup.value === this._value;
            // Copy name from parent radio group
            this.name = this.radioGroup.name;
        }
    }

    ngAfterViewInit() {
        this.focusMonitor
            .monitor(this._elementRef, true)
            .subscribe((focusOrigin) => {
                if (!focusOrigin && this.radioGroup) {
                    this.radioGroup.touch();
                }
            });
    }

    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this._elementRef);
        this.removeUniqueSelectionListener();
    }

    /** Focuses the radio button. */
    focus(): void {
        this.inputElement.nativeElement.focus();
    }

    /**
     * Marks the radio button as needing checking for change detection.
     * This method is exposed because the parent radio group will directly
     * update bound properties of the radio button.
     */
    markForCheck() {
        // When group value changes, the button will not be notified. Use `markForCheck` to explicit
        // update radio button's status
        this._changeDetector.markForCheck();
    }

    onInputClick(event: Event) {
        // We have to stop propagation for click events on the visual hidden input element.
        // By default, when a user clicks on a label element, a generated click event will be
        // dispatched on the associated input element. Since we are using a label element as our
        // root container, the click event on the `radio-button` will be executed twice.
        // The real click event will bubble up, and the generated click event also tries to bubble up.
        // This will lead to multiple click events.
        // Preventing bubbling for the second event will solve that issue.
        event.stopPropagation();
    }

    onInputChange(event: Event) {
        // We always have to stop propagation on the change event.
        // Otherwise the change event, from the input element, will bubble up and
        // emit its event object to the `change` output.
        event.stopPropagation();

        const groupValueChanged = this.radioGroup && this.value !== this.radioGroup.value;
        this.checked = true;
        this.emitChangeEvent();

        if (this.radioGroup) {
            this.radioGroup.controlValueAccessorChangeFn(this.value);
            this.radioGroup.touch();
            if (groupValueChanged) {
                this.radioGroup.emitChangeEvent();
            }
        }
    }

    /** Unregister function for _radioDispatcher */
    // tslint:disable-next-line
    private readonly removeUniqueSelectionListener: () => void = () => {};

    /** Dispatch change event with current value. */
    private emitChangeEvent(): void {
        this.change.emit(new McRadioChange(this, this._value));
    }
}
