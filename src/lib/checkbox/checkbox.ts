import {
    AfterViewInit,
    Attribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    Inject,
    Input,
    OnDestroy,
    Optional,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FocusMonitor, FocusOrigin } from '@ptsecurity/cdk/a11y';
import {
    CanColor, CanColorCtor,
    CanDisable, CanDisableCtor,
    HasTabIndex, HasTabIndexCtor,
    mixinColor,
    mixinDisabled,
    mixinTabIndex,
    toBoolean
} from '@ptsecurity/mosaic/core';

import { MC_CHECKBOX_CLICK_ACTION, McCheckboxClickAction } from './checkbox-config';


// Increasing integer for generating unique ids for checkbox components.
let nextUniqueId = 0;

/**
 * Provider Expression that allows mc-checkbox to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)].
 * @docs-private
 */
export const MC_CHECKBOX_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => McCheckbox),
    multi: true
};

/**
 * Represents the different states that require custom transitions between them.
 * @docs-private
 */
export enum TransitionCheckState {
    /** The initial state of the component before any user interaction. */
    Init,
    /** The state representing the component when it's becoming checked. */
    Checked,
    /** The state representing the component when it's becoming unchecked. */
    Unchecked,
    /** The state representing the component when it's becoming indeterminate. */
    Indeterminate
}

/** Change event object emitted by McCheckbox. */
export class McCheckboxChange {
    /** The source McCheckbox of the event. */
    source: McCheckbox;
    /** The new `checked` value of the checkbox. */
    checked: boolean;
}

// Boilerplate for applying mixins to McCheckbox.
/** @docs-private */
export class McCheckboxBase {
    constructor(public _elementRef: ElementRef) {
    }
}

export const _McCheckboxMixinBase:
    HasTabIndexCtor &
    CanColorCtor &
    CanDisableCtor &
    typeof McCheckboxBase =
        mixinTabIndex(mixinColor(mixinDisabled(McCheckboxBase)));


/**
 * A mosaic checkbox component. Supports all of the functionality of an HTML5 checkbox,
 * and exposes a similar API. A McCheckbox can be either checked, unchecked, indeterminate, or
 * disabled. Note that all additional accessibility attributes are taken care of by the component,
 * so there is no need to provide them yourself. However, if you want to omit a label and still
 * have the checkbox be accessible, you may supply an [aria-label] input.
 */
@Component({
    selector: 'mc-checkbox',
    templateUrl: 'checkbox.html',
    styleUrls: ['checkbox.css'],
    exportAs: 'mcCheckbox',
    host: {
        class: 'mc-checkbox',
        '[id]': 'id',
        '[attr.id]': 'id',
        '[class.mc-indeterminate]': 'indeterminate',
        '[class.mc-checked]': 'checked',
        '[class.mc-disabled]': 'disabled',
        '[class.mc-checkbox-label-before]': 'labelPosition == "before"'
    },
    providers: [MC_CHECKBOX_CONTROL_VALUE_ACCESSOR],
    inputs: ['color', 'tabIndex'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McCheckbox extends _McCheckboxMixinBase implements ControlValueAccessor,
    AfterViewInit, OnDestroy, CanColor, CanDisable, HasTabIndex {

    /**
     * Attached to the aria-label attribute of the host element. In most cases, arial-labelledby will
     * take precedence so this may be omitted.
     */
    @Input('aria-label') ariaLabel: string = '';

    /**
     * Users can specify the `aria-labelledby` attribute which will be forwarded to the input element
     */
    @Input('aria-labelledby') ariaLabelledby: string | null = null;

    private _uniqueId: string = `mc-checkbox-${++nextUniqueId}`;

    /** A unique id for the checkbox input. If none is supplied, it will be auto-generated. */
    @Input() id: string = this._uniqueId;

    /** Returns the unique id for the visual hidden input. */
    get inputId(): string {
        return `${this.id || this._uniqueId}-input`;
    }

    /** Whether the checkbox is required. */
    @Input()
    get required(): boolean {
        return this._required;
    }

    set required(value: boolean) {
        this._required = toBoolean(value);
    }

    private _required: boolean;

    /** Whether the label should appear after or before the checkbox. Defaults to 'after' */
    @Input() labelPosition: 'before' | 'after' = 'after';

    /** Name value will be applied to the input element if present */
    @Input() name: string | null = null;

    /** Event emitted when the checkbox's `checked` value changes. */
    @Output() readonly change: EventEmitter<McCheckboxChange> =
        new EventEmitter<McCheckboxChange>();

    /** Event emitted when the checkbox's `indeterminate` value changes. */
    @Output() readonly indeterminateChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    /** The value attribute of the native input element */
    @Input() value: string;

    /** The native `<input type="checkbox">` element */
    @ViewChild('input') _inputElement: ElementRef;

    /**
     * Called when the checkbox is blurred. Needed to properly implement ControlValueAccessor.
     * @docs-private
     */
    _onTouched: () => any = () => {
    }

    private _currentAnimationClass: string = '';

    private _currentCheckState: TransitionCheckState = TransitionCheckState.Init;

    private _controlValueAccessorChangeFn: (value: any) => void = () => {
    }

    constructor(elementRef: ElementRef,
                private _changeDetectorRef: ChangeDetectorRef,
                private _focusMonitor: FocusMonitor,
                @Attribute('tabindex') tabIndex: string,
                @Optional() @Inject(MC_CHECKBOX_CLICK_ACTION)
                private _clickAction: McCheckboxClickAction) {
        super(elementRef);

        this.tabIndex = parseInt(tabIndex) || 0;
    }

    ngAfterViewInit() {
        this._focusMonitor
            .monitor(this._inputElement.nativeElement)
            .subscribe((focusOrigin) => this._onInputFocusChange(focusOrigin));
    }

    ngOnDestroy() {
        this._focusMonitor.stopMonitoring(this._inputElement.nativeElement);
    }

    /**
     * Whether the checkbox is checked.
     */
    @Input()
    get checked(): boolean {
        return this._checked;
    }

    set checked(value: boolean) {
        if (value != this.checked) {
            this._checked = value;
            this._changeDetectorRef.markForCheck();
        }
    }

    private _checked: boolean = false;

    /**
     * Whether the checkbox is disabled. This fully overrides the implementation provided by
     * mixinDisabled, but the mixin is still required because mixinTabIndex requires it.
     */
    @Input()
    get disabled() {
        return this._disabled;
    }

    set disabled(value: any) {
        if (value != this.disabled) {
            this._disabled = value;
            this._changeDetectorRef.markForCheck();
        }
    }

    private _disabled: boolean = false;

    /**
     * Whether the checkbox is indeterminate. This is also known as "mixed" mode and can be used to
     * represent a checkbox with three states, e.g. a checkbox that represents a nested list of
     * checkable items. Note that whenever checkbox is manually clicked, indeterminate is immediately
     * set to false.
     */
    @Input()
    get indeterminate(): boolean {
        return this._indeterminate;
    }

    set indeterminate(value: boolean) {
        const changed = value != this._indeterminate;
        this._indeterminate = value;

        if (changed) {
            if (this._indeterminate) {
                this._transitionCheckState(TransitionCheckState.Indeterminate);
            } else {
                this._transitionCheckState(
                    this.checked ? TransitionCheckState.Checked : TransitionCheckState.Unchecked);
            }
            this.indeterminateChange.emit(this._indeterminate);
        }
    }

    private _indeterminate: boolean = false;

    /** Method being called whenever the label text changes. */
    _onLabelTextChange() {
        // This method is getting called whenever the label of the checkbox changes.
        // Since the checkbox uses the OnPush strategy we need to notify it about the change
        // that has been recognized by the cdkObserveContent directive.
        this._changeDetectorRef.markForCheck();
    }

    // Implemented as part of ControlValueAccessor.
    writeValue(value: any) {
        this.checked = !!value;
    }

    // Implemented as part of ControlValueAccessor.
    registerOnChange(fn: (value: any) => void) {
        this._controlValueAccessorChangeFn = fn;
    }

    // Implemented as part of ControlValueAccessor.
    registerOnTouched(fn: any) {
        this._onTouched = fn;
    }

    // Implemented as part of ControlValueAccessor.
    setDisabledState(isDisabled: boolean) {
        this.disabled = isDisabled;
    }

    _getAriaChecked(): 'true' | 'false' | 'mixed' {
        return this.checked ? 'true' : (this.indeterminate ? 'mixed' : 'false');
    }

    private _transitionCheckState(newState: TransitionCheckState) {
        const oldState = this._currentCheckState;
        const element: HTMLElement = this._elementRef.nativeElement;

        if (oldState === newState) {
            return;
        }
        if (this._currentAnimationClass.length > 0) {
            element.classList.remove(this._currentAnimationClass);
        }

        this._currentCheckState = newState;

        if (this._currentAnimationClass.length > 0) {
            element.classList.add(this._currentAnimationClass);
        }
    }

    private _emitChangeEvent() {
        const event = new McCheckboxChange();
        event.source = this;
        event.checked = this.checked;

        this._controlValueAccessorChangeFn(this.checked);
        this.change.emit(event);
    }

    /** Function is called whenever the focus changes for the input element. */
    private _onInputFocusChange(focusOrigin: FocusOrigin) {
        if (focusOrigin) {
            this._onTouched();
        }
    }

    /** Toggles the `checked` state of the checkbox. */
    toggle(): void {
        this.checked = !this.checked;
    }

    /**
     * Event handler for checkbox input element.
     * Toggles checked state if element is not disabled.
     * Do not toggle on (change) event since IE doesn't fire change event when
     *   indeterminate checkbox is clicked.
     * @param event
     */
    _onInputClick(event: Event) {
        // We have to stop propagation for click events on the visual hidden input element.
        // By default, when a user clicks on a label element, a generated click event will be
        // dispatched on the associated input element. Since we are using a label element as our
        // root container, the click event on the `checkbox` will be executed twice.
        // The real click event will bubble up, and the generated click event also tries to bubble up.
        // This will lead to multiple click events.
        // Preventing bubbling for the second event will solve that issue.
        event.stopPropagation();

        // If resetIndeterminate is false, and the current state is indeterminate, do nothing on click
        if (!this.disabled && this._clickAction !== 'noop') {
            // When user manually click on the checkbox, `indeterminate` is set to false.
            if (this.indeterminate && this._clickAction !== 'check') {

                Promise.resolve().then(() => {
                    this._indeterminate = false;
                    this.indeterminateChange.emit(this._indeterminate);
                });
            }

            this.toggle();
            this._transitionCheckState(
                this._checked ? TransitionCheckState.Checked : TransitionCheckState.Unchecked);

            // Emit our custom change event if the native input emitted one.
            // It is important to only emit it, if the native input triggered one, because
            // we don't want to trigger a change event, when the `checked` variable changes for example.
            this._emitChangeEvent();
        } else if (!this.disabled && this._clickAction === 'noop') {
            // Reset native input when clicked with noop. The native checkbox becomes checked after
            // click, reset it to be align with `checked` value of `mc-checkbox`.
            this._inputElement.nativeElement.checked = this.checked;
            this._inputElement.nativeElement.indeterminate = this.indeterminate;
        }
    }

    /** Focuses the checkbox. */
    focus(): void {
        this._focusMonitor.focusVia(this._inputElement.nativeElement, 'keyboard');
    }

    _onInteractionEvent(event: Event) {
        // We always have to stop propagation on the change event.
        // Otherwise the change event, from the input element, will bubble up and
        // emit its event object to the `change` output.
        event.stopPropagation();
    }
}
