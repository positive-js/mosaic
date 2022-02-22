import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    Directive,
    DoCheck,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    OnChanges,
    OnDestroy,
    Optional,
    Self,
    ViewEncapsulation
} from '@angular/core';
import {
    FormControlName,
    FormGroupDirective,
    NG_VALIDATORS,
    NgControl,
    NgForm,
    NgModel,
    Validator
} from '@angular/forms';
import {
    CanUpdateErrorState,
    ErrorStateMatcher,
    MC_VALIDATION,
    McValidationOptions,
    setMosaicValidation
} from '@ptsecurity/mosaic/core';
import { McFormField, McFormFieldControl } from '@ptsecurity/mosaic/form-field';
import { Subject } from 'rxjs';

import { McInputMixinBase } from './input';
import { MC_INPUT_VALUE_ACCESSOR } from './input-value-accessor';


let nextUniqueId = 0;


@Component({
    selector: `mc-password-toggle`,
    exportAs: 'mcPasswordToggle',
    template: '<i class="mc mc-calendar_16"></i>',
    host: {
        class: 'mc-password-toggle',
        '[attr.tabindex]': '0',
        '(click)': 'toggle()',
        '(keydown.ENTER)': 'toggle()',
        '(keydown.SPACE)': 'toggle()'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class McPasswordToggle implements OnDestroy {
    constructor(
        private elementRef: ElementRef,
        private focusMonitor: FocusMonitor,
        private formField: McFormField
    ) {
        this.runFocusMonitor();
    }

    ngOnDestroy() {
        this.stopFocusMonitor();
    }

    toggle() {
        (this.formField.control as McInputPassword).toggleType();
    }

    private runFocusMonitor() {
        this.focusMonitor.monitor(this.elementRef.nativeElement, true);
    }

    private stopFocusMonitor() {
        this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }

}

@Directive({
    selector: `input[mcInputPassword]`,
    exportAs: 'mcInputPassword',
    host: {
        class: 'mc-input mc-input-password',
        // Native input properties that are overwritten by Angular inputs need to be synced with
        // the native input element. Otherwise property bindings for those don't work.
        '[attr.id]': 'id',
        '[attr.type]': 'elementType',
        '[attr.placeholder]': 'placeholder',
        '[attr.disabled]': 'disabled || null',
        '[required]': 'required',

        '(blur)': 'onBlur()',
        '(focus)': 'focusChanged(true)',
        '(input)': 'onInput()'
    },
    providers: [{
        provide: McFormFieldControl, useExisting: McInputPassword
    }]
})
export class McInputPassword extends McInputMixinBase implements McFormFieldControl<any>, OnChanges, OnDestroy, DoCheck,
    CanUpdateErrorState, AfterContentInit, OnChanges {

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
    controlType: string = 'input-password';

    elementType: string = 'password';

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    @Input() placeholder: string;

    protected uid = `mc-input-${nextUniqueId++}`;
    protected previousNativeValue: any;

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    @Input()
    get disabled(): boolean {
        if (this.ngControl?.disabled !== null) {
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

    private _disabled = false;

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    @Input()
    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value || this.uid;
    }

    private _id: string;

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

    private _required = false;

    // this.elementRef.nativeElement.type = this._type;

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    @Input()
    get value(): string {
        return this._inputValueAccessor.value;
    }

    set value(value: string) {
        if (value === this.value) { return; }

        this._inputValueAccessor.value = value;
        this.stateChanges.next();
    }

    // tslint:disable-next-line: orthodox-getter-and-setter
    private _inputValueAccessor: { value: any };

    // tslint:disable-next-line: naming-convention
    constructor(
        protected elementRef: ElementRef,
        @Optional() @Self() @Inject(NG_VALIDATORS) public rawValidators: Validator[],
        @Optional() @Inject(MC_VALIDATION) private mcValidation: McValidationOptions,
        @Optional() @Self() ngControl: NgControl,
        @Optional() @Self() public ngModel: NgModel,
        @Optional() @Self() public formControlName: FormControlName,
        @Optional() parentForm: NgForm,
        @Optional() parentFormGroup: FormGroupDirective,
        defaultErrorStateMatcher: ErrorStateMatcher,
        @Optional() @Self() @Inject(MC_INPUT_VALUE_ACCESSOR) inputValueAccessor: any
    ) {
        super(defaultErrorStateMatcher, parentForm, parentFormGroup, ngControl);

        // If no input value accessor was explicitly specified, use the element as the input value
        // accessor.
        this._inputValueAccessor = inputValueAccessor || this.elementRef.nativeElement;

        this.previousNativeValue = this.value;

        // Force setter to be called in case id was not specified.
        this.id = this.id;
    }

    ngAfterContentInit(): void {
        if (!this.ngControl) { return; }

        if (this.mcValidation.useValidation) {
            setMosaicValidation(this);
        }
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
        this.dirtyCheckNativeValue();
    }

    toggleType() {
        this.elementType = this.elementType === 'password' ? 'text' : 'password';
    }

    /** Focuses the input. */
    focus(): void {
        this.elementRef.nativeElement.focus();
    }

    onBlur(): void {
        this.focusChanged(false);

        if (this.ngControl?.control) {
            const control = this.ngControl.control;

            control.updateValueAndValidity({ emitEvent: false });
            (control.statusChanges as EventEmitter<string>).emit(control.status);
        }
    }

    /** Callback for the cases where the focused state of the input changes. */
    focusChanged(isFocused: boolean) {
        if (isFocused === this.focused) { return; }

        this.focused = isFocused;
        this.stateChanges.next();
    }

    onInput() {
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
        return !this.elementRef.nativeElement.value && !this.isBadInput();
    }

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    onContainerClick() {
        this.focus();
    }

    /** Does some manual dirty checking on the native input `value` property. */
    protected dirtyCheckNativeValue() {
        if (this.previousNativeValue !== this.value) {
            this.previousNativeValue = this.value;
            this.stateChanges.next();
        }
    }

    /** Checks whether the input is invalid based on the native validation. */
    protected isBadInput() {
        // The `validity` property won't be present on platform-server.
        return (this.elementRef.nativeElement as HTMLInputElement).validity?.badInput;
    }
}
