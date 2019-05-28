import {
    Attribute,
    Directive, DoCheck, ElementRef, Inject, Input, OnChanges,
    OnDestroy, Optional, Self
} from '@angular/core';
import {
    FormGroupDirective,
    NgControl,
    NgForm, NgModel
} from '@angular/forms';
import { coerceBooleanProperty } from '@ptsecurity/cdk/coercion';
import {
    END, C, V, X, A, DELETE, BACKSPACE, TAB, ENTER,
    ESCAPE, ZERO, NINE, NUMPAD_ZERO, NUMPAD_NINE, NUMPAD_MINUS, DASH,
    FF_MINUS, LEFT_ARROW, RIGHT_ARROW, HOME, UP_ARROW, DOWN_ARROW, F1, F12
} from '@ptsecurity/cdk/keycodes';
import { getSupportedInputTypes, Platform } from '@ptsecurity/cdk/platform';
import {
    CanUpdateErrorState,
    CanUpdateErrorStateCtor,
    ErrorStateMatcher,
    mixinErrorState
} from '@ptsecurity/mosaic/core';
import { McFormFieldControl, McFormFieldNumberControl } from '@ptsecurity/mosaic/form-field';
import { Subject } from 'rxjs';

import { getMcInputUnsupportedTypeError } from './input-errors';
import { MC_INPUT_VALUE_ACCESSOR } from './input-value-accessor';
import { stepDown, stepUp } from './stepperUtils';


const MC_INPUT_INVALID_TYPES = [
    'button',
    'checkbox',
    'file',
    'hidden',
    'image',
    'radio',
    'range',
    'reset',
    'submit'
];

export const BIG_STEP = 10;
export const SMALL_STEP = 1;

let nextUniqueId = 0;

export class McInputBase {
    constructor(public defaultErrorStateMatcher: ErrorStateMatcher,
                public parentForm: NgForm,
                public parentFormGroup: FormGroupDirective,
                public ngControl: NgControl) {
    }
}

export const _McInputMixinBase: CanUpdateErrorStateCtor & typeof McInputBase = mixinErrorState(McInputBase);


@Directive({
    selector: `input[mcInput][type="number"]`,
    exportAs: 'mcNumericalInput',
    providers: [NgModel, { provide: McFormFieldNumberControl, useExisting: McNumberInput }],
    host: {
        '(blur)': '_focusChanged(false)',
        '(focus)': '_focusChanged(true)',
        '(paste)': 'onPaste($event)',
        '(keydown)': 'onKeyDown($event)'
    }
})
export class McNumberInput implements McFormFieldNumberControl<any> {

    /**
     * Implemented as part of McFormFieldNumberControl.
     * @docs-private
     */
    @Input()
    bigStep: number;

    /**
     * Implemented as part of McFormFieldNumberControl.
     * @docs-private
     */
    @Input()
    step: number;

    @Input()
    min: number;

    @Input()
    max: number;

    /**
     * Implemented as part of McFormFieldNumberControl.
     * @docs-private
     */
    value: any;

    /**
     * Implemented as part of McFormFieldNumberControl.
     * @docs-private
     */
    focused: boolean = false;

    /**
     * Implemented as part of McFormFieldNumberControl.
     * @docs-private
     */
    readonly stateChanges: Subject<void> = new Subject<void>();

    private readonly _host: HTMLInputElement;

    constructor(
        private _platform: Platform ,
        private _elementRef: ElementRef,
        private _model: NgModel,
        @Attribute('step') step: string,
        @Attribute('big-step') bigStep: string,
        @Attribute('min') min: string,
        @Attribute('max') max: string
    ) {
        this.step = this.isDigit(step) ? parseFloat(step) : SMALL_STEP;
        this.bigStep = this.isDigit(bigStep) ? parseFloat(bigStep) : BIG_STEP;
        this.min = this.isDigit(min) ? parseFloat(min) : -Infinity;
        this.max = this.isDigit(max) ? parseFloat(max) : Infinity;

        this._host = this._elementRef.nativeElement;

        const self = this;

        if ('valueAsNumber' in this._host) {
            Object.defineProperty(Object.getPrototypeOf(this._host), 'valueAsNumber', {
                // tslint:disable-next-line:no-reserved-keywords
                get() {
                    const res = parseFloat(self.normalizeSplitter(this.value));

                    return isNaN(res) ? null : res;
                }
            });
        }
    }

    _focusChanged(isFocused: boolean) {
        if (isFocused !== this.focused) {
            this.focused = isFocused;
            this.stateChanges.next();
        }
    }

    onKeyDown(event: KeyboardEvent) {
        // tslint:disable-next-line:deprecation
        const keyCode = event.keyCode;

        const isCtrlA = (e) => e.keyCode === A && (e.ctrlKey || e.metaKey);
        const isCtrlC = (e) => e.keyCode === C && (e.ctrlKey || e.metaKey);
        const isCtrlV = (e) => e.keyCode === V && (e.ctrlKey || e.metaKey);
        const isCtrlX = (e) => e.keyCode === X && (e.ctrlKey || e.metaKey);

        const isFKey = (e) => e.keyCode >= F1 && e.keyCode <= F12;

        const isNumber = (e) => (e.keyCode >= ZERO && e.keyCode <= NINE) ||
            (e.keyCode >= NUMPAD_ZERO && e.keyCode <= NUMPAD_NINE);

        const minuses = [NUMPAD_MINUS, DASH, FF_MINUS];
        const serviceKeys = [DELETE, BACKSPACE, TAB, ESCAPE, ENTER];
        const arrows = [LEFT_ARROW, RIGHT_ARROW];
        const allowedKeys =  [HOME, END].concat(arrows).concat(serviceKeys).concat(minuses);

        const isIEPeriod = (e) => e.key === '.' || e.key === 'Decimal';
        const isNotIEPeriod = (e) => e.key === '.' || e.key === ',';

        // Decimal is for IE
        const isPeriod = (e) => this._platform.EDGE || this._platform.TRIDENT
            ? isIEPeriod(e)
            : isNotIEPeriod(e);

        if (allowedKeys.indexOf(keyCode) !== -1 ||
            isCtrlA(event) ||
            isCtrlC(event) ||
            isCtrlV(event) ||
            isCtrlX(event) ||
            isFKey(event) ||
            isPeriod(event)
        ) {
            // let it happen, don't do anything
            return;
        }
        // Ensure that it is not a number and stop the keypress
        if (event.shiftKey || !isNumber(event)) {
            event.preventDefault();

            // process steps
            const step = event.shiftKey ? this.bigStep : this.step;

            if (keyCode === UP_ARROW) {
                this.stepUp(step);
            }

            if (keyCode === DOWN_ARROW) {
                this.stepDown(step);
            }
        }
    }

    onPaste(event) {
        let value = event.clipboardData.getData('text');
        value = this.normalizeSplitter(value);

        if (!this.isDigit(value)) {
            event.preventDefault();
        }
    }

    stepUp(step: number) {
        this._elementRef.nativeElement.focus();
        const res = stepUp(this._host.valueAsNumber, this.max, this.min, step);
        this._host.value = res === null ? '' : res.toString();
        this._model.update.emit(this._host.valueAsNumber);
    }

    stepDown(step: number) {
        this._elementRef.nativeElement.focus();
        const res = stepDown(this._host.valueAsNumber, this.max, this.min, step);
        this._host.value = res === null ? '' : res.toString();
        this._model.update.emit(this._host.valueAsNumber);
    }

    private normalizeSplitter(value: string): string {
        return value ? value.replace(/,/g, '.') : value;
    }

    private isDigit(value: string): boolean {
        return this.isFloat(value) || this.isInt(value);
    }

    private isFloat(value: string): boolean {
        return /^-?\d+\.\d+$/.test(value);
    }

    private isInt(value: string): boolean {
        return /^-?\d+$/.test(value);
    }
}

@Directive({
    selector: `input[mcInput]`,
    exportAs: 'mcInput',
    host: {
        class: 'mc-input',
        // Native input properties that are overwritten by Angular inputs need to be synced with
        // the native input element. Otherwise property bindings for those don't work.
        '[attr.id]': 'id',
        '[attr.placeholder]': 'placeholder',
        '[disabled]': 'disabled',
        '[required]': 'required',
        '(blur)': '_focusChanged(false)',
        '(focus)': '_focusChanged(true)',
        '(input)': '_onInput()'
    },
    providers: [{ provide: McFormFieldControl, useExisting: McInput }]
})
export class McInput extends _McInputMixinBase implements McFormFieldControl<any>, OnChanges,
    OnDestroy, DoCheck, CanUpdateErrorState {

    /** An object used to control when error messages are shown. */
    @Input() errorStateMatcher: ErrorStateMatcher;

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    focused: boolean = false;

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    readonly stateChanges: Subject<void> = new Subject<void>();

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    controlType: string = 'mc-input';

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    @Input()
    get disabled(): boolean {
        if (this.ngControl && this.ngControl.disabled !== null) {
            return this.ngControl.disabled;
        }

        return this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value);

        // Browsers may not fire the blur event if the input is disabled too quickly.
        // Reset from here to ensure that the element doesn't become stuck.
        if (this.focused) {
            this.focused = false;
            this.stateChanges.next();
        }
    }

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    @Input()
    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value || this._uid;
    }

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    @Input() placeholder: string;

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    @Input()
    get required(): boolean {
        return this._required;
    }

    set required(value: boolean) {
        this._required = coerceBooleanProperty(value);
    }

    // tslint:disable no-reserved-keywords
    /** Input type of the element. */
    @Input()
    get type(): string {
        return this._type;
    }

    set type(value: string) {
        this._type = value || 'text';
        this._validateType();

        // When using Angular inputs, developers are no longer able to set the properties on the native
        // input element. To ensure that bindings for `type` work, we need to sync the setter
        // with the native property. Textarea elements don't support the type property or attribute.
        if (getSupportedInputTypes().has(this._type)) {
            this._elementRef.nativeElement.type = this._type;
        }
    }
    // tslint:enable no-reserved-keywords

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    @Input()
    get value(): string {
        return this._inputValueAccessor.value;
    }

    set value(value: string) {
        if (value !== this.value) {
            this._inputValueAccessor.value = value;
            this.stateChanges.next();
        }
    }

    protected _uid = `mc-input-${nextUniqueId++}`;
    protected _previousNativeValue: any;
    protected _disabled = false;
    protected _id: string;
    protected _required = false;
    protected _type = 'text';
    protected _neverEmptyInputTypes = [
        'date',
        'datetime',
        'datetime-local',
        'month',
        'time',
        'week'
    ].filter((t) => getSupportedInputTypes().has(t));

    private _inputValueAccessor: { value: any };

    constructor(protected _elementRef: ElementRef,
                @Optional() @Self() public ngControl: NgControl,
                @Optional() parentForm: NgForm,
                @Optional() parentFormGroup: FormGroupDirective,
                defaultErrorStateMatcher: ErrorStateMatcher,
                @Optional() @Self() @Inject(MC_INPUT_VALUE_ACCESSOR) inputValueAccessor: any) {
        super(defaultErrorStateMatcher, parentForm, parentFormGroup, ngControl);
        // If no input value accessor was explicitly specified, use the element as the input value
        // accessor.
        this._inputValueAccessor = inputValueAccessor || this._elementRef.nativeElement;

        this._previousNativeValue = this.value;

        // Force setter to be called in case id was not specified.
        this.id = this.id;
    }

    ngOnChanges() {
        this.stateChanges.next();
    }

    ngOnDestroy() {
        this.stateChanges.complete();
    }

    ngDoCheck() {
        if (this.ngControl) {
            // We need to re-evaluate this on every change detection cycle, because there are some
            // error triggers that we can't subscribe to (e.g. parent form submissions). This means
            // that whatever logic is in here has to be super lean or we risk destroying the performance.
            this.updateErrorState();
        }

        // We need to dirty-check the native element's value, because there are some cases where
        // we won't be notified when it changes (e.g. the consumer isn't using forms or they're
        // updating the value using `emitEvent: false`).
        this._dirtyCheckNativeValue();
    }

    /** Focuses the input. */
    focus(): void {
        this._elementRef.nativeElement.focus();
    }

    /** Callback for the cases where the focused state of the input changes. */
    _focusChanged(isFocused: boolean) {
        if (isFocused !== this.focused) {
            this.focused = isFocused;
            this.stateChanges.next();
        }
    }

    _onInput() {
        // This is a noop function and is used to let Angular know whenever the value changes.
        // Angular will run a new change detection each time the `input` event has been dispatched.
        // It's necessary that Angular recognizes the value change, because when floatingLabel
        // is set to false and Angular forms aren't used, the placeholder won't recognize the
        // value changes and will not disappear.
        // Listening to the input event wouldn't be necessary when the input is using the
        // FormsModule or ReactiveFormsModule, because Angular forms also listens to input events.
    }

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    get empty(): boolean {
        return !this._isNeverEmpty() && !this._elementRef.nativeElement.value && !this._isBadInput();
    }

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    onContainerClick() {
        this.focus();
    }

    /** Does some manual dirty checking on the native input `value` property. */
    protected _dirtyCheckNativeValue() {
        const newValue = this.value;

        if (this._previousNativeValue !== newValue) {
            this._previousNativeValue = newValue;
            this.stateChanges.next();
        }
    }

    /** Make sure the input is a supported type. */
    protected _validateType() {
        if (MC_INPUT_INVALID_TYPES.indexOf(this._type) > -1) {
            throw getMcInputUnsupportedTypeError(this._type);
        }
    }

    /** Checks whether the input type is one of the types that are never empty. */
    protected _isNeverEmpty() {
        return this._neverEmptyInputTypes.indexOf(this._type) > -1;
    }

    /** Checks whether the input is invalid based on the native validation. */
    protected _isBadInput() {
        // The `validity` property won't be present on platform-server.
        const validity = (this._elementRef.nativeElement as HTMLInputElement).validity;

        return validity && validity.badInput;
    }
}

@Directive({
    selector: 'input[mcInputMonospace]',
    exportAs: 'McInputMonospace',
    host: { class: 'mc-input_monospace' }
})
export class McInputMono {
}
