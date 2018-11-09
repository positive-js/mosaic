import {
    Directive, DoCheck, ElementRef, Inject,
    Input, OnChanges,
    OnDestroy,
    Optional, Self, InjectionToken, NgZone, OnInit
} from '@angular/core';
import { FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import { coerceBooleanProperty } from '@ptsecurity/cdk/coercion';
import {
    CanUpdateErrorState,
    CanUpdateErrorStateCtor,
    ErrorStateMatcher,
    mixinErrorState
} from '@ptsecurity/mosaic/core';
import { McFormFieldControl } from '@ptsecurity/mosaic/form-field';
import { Subject } from 'rxjs';
import { fromEvent, Subscription } from 'rxjs/index';
import { distinctUntilChanged, map } from 'rxjs/operators';


export const MC_TEXTAREA_VALUE_ACCESSOR =
    new InjectionToken<{ value: any }>('MC_TEXTAREA_VALUE_ACCESSOR');

let nextUniqueId = 0;

const ROW_SEPARATOR = '\n';

export class McTextareaBase {
    constructor(public _defaultErrorStateMatcher: ErrorStateMatcher,
                public _parentForm: NgForm,
                public _parentFormGroup: FormGroupDirective,
                public ngControl: NgControl) {
    }
}

// tslint:disable-next-line
export const McTextareaMixinBase: CanUpdateErrorStateCtor & typeof McTextareaBase =
    mixinErrorState(McTextareaBase);

@Directive({
    selector: `textarea[mcTextarea]`,
    exportAs: 'mcTextarea',
    host: {
        class: 'mc-textarea',
        '[class.mc-textarea-resizable]': '!canGrow',
        '[attr.id]': 'id',
        '[attr.placeholder]': 'placeholder',
        '[disabled]': 'disabled',
        '[required]': 'required',
        '(blur)': 'focusChanged(false)',
        '(focus)': 'focusChanged(true)',
        '(input)': 'onInput()'
    },
    providers: [{ provide: McFormFieldControl, useExisting: McTextarea }]
})
export class McTextarea extends McTextareaMixinBase implements McFormFieldControl<any>, OnInit, OnChanges,
    OnDestroy, DoCheck, CanUpdateErrorState {

    @Input() canGrow: boolean = true;

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
    controlType: string = 'mc-textarea';

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
        this._id = value || this.uid;
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

    /**
     * Implemented as part of McFormFieldControl.
     * @docs-private
     */
    @Input()
    get value(): string {
        return this.valueAccessor.value;
    }

    set value(value: string) {
        if (value !== this.value) {
            this.valueAccessor.value = value;
            this.stateChanges.next();
        }
    }

    protected uid = `mc-textsrea-${nextUniqueId++}`;
    protected previousNativeValue: any;
    protected _disabled = false;
    protected _id: string;
    protected _required = false;

    private valueAccessor: { value: any };
    private growSubscription: Subscription;

    constructor(protected elementRef: ElementRef,
                @Optional() @Self() public ngControl: NgControl,
                @Optional() _parentForm: NgForm,
                @Optional() _parentFormGroup: FormGroupDirective,
                _defaultErrorStateMatcher: ErrorStateMatcher,
                @Optional() @Self() @Inject(MC_TEXTAREA_VALUE_ACCESSOR) inputValueAccessor: any,
                private ngZone: NgZone) {
        super(_defaultErrorStateMatcher, _parentForm, _parentFormGroup, ngControl);
        // If no input value accessor was explicitly specified, use the element as the textarea value
        // accessor.
        this.valueAccessor = inputValueAccessor || this.elementRef.nativeElement;

        this.previousNativeValue = this.value;

        // Force setter to be called in case id was not specified.
        this.id = this.id;

        const growObserver = fromEvent(elementRef.nativeElement, 'input')
            .pipe(
                map((event: any) => `${event.target.scrollHeight} ${this.getRowCount()}`),
                distinctUntilChanged()
            );
        this.growSubscription = growObserver.subscribe(this.grow.bind(this));
    }

    ngOnInit() {
        setTimeout(() => this.grow(), 0);
    }

    ngOnChanges() {
        this.stateChanges.next();
    }

    ngOnDestroy() {
        this.stateChanges.complete();
        this.growSubscription.unsubscribe();
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

    /** Grow textarea height to avoid vertical scroll  */
    grow() {
        if (!this.canGrow) {
            return;
        }

        this.ngZone.runOutsideAngular(() => {
            this.elementRef.nativeElement.rows = this.getRowCount() + 1;

            const offsetHeight: number = this.elementRef.nativeElement.offsetHeight;
            const scrollHeight: number = this.elementRef.nativeElement.scrollHeight;

            if (scrollHeight > offsetHeight) {
                this.elementRef.nativeElement.style.height = 'auto';
            }
        });
    }

    /** Focuses the textarea. */
    focus(): void {
        this.elementRef.nativeElement.focus();
    }

    /** Callback for the cases where the focused state of the textarea changes. */
    focusChanged(isFocused: boolean) {
        if (isFocused !== this.focused) {
            this.focused = isFocused;
            this.stateChanges.next();
        }
    }

    onInput() {
        // This is a noop function and is used to let Angular know whenever the value changes.
        // Angular will run a new change detection each time the `input` event has been dispatched.
        // It's necessary that Angular recognizes the value change, because when floatingLabel
        // is set to false and Angular forms aren't used, the placeholder won't recognize the
        // value changes and will not disappear.
        // Listening to the input event wouldn't be necessary when the textarea is using the
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

    /** Does some manual dirty checking on the native textarea `value` property. */
    protected dirtyCheckNativeValue() {
        const newValue = this.value;

        if (this.previousNativeValue !== newValue) {
            this.previousNativeValue = newValue;
            this.stateChanges.next();
        }
    }

    /** Checks whether the textarea is invalid based on the native validation. */
    protected isBadInput(): boolean {
        // The `validity` property won't be present on platform-server.
        const validity = (this.elementRef.nativeElement as HTMLTextAreaElement).validity;

        return validity && validity.badInput;
    }

    private getRowCount(): number {
        const el: HTMLTextAreaElement = this.elementRef.nativeElement;
        const cols = el.cols - 1;
        const lines = el.value.split(ROW_SEPARATOR);
        let realLinesCount = 0;

        for (const line of lines) {
            realLinesCount += Math.ceil((line.length || 1) / cols);
        }

        return realLinesCount;
    }
}

@Directive({
    selector: 'textarea[mcTextareaMonospace]',
    exportAs: 'McTextareaMonospace',
    host: { class: 'mc-textarea_monospace' }
})
export class McTextareaMono {
}

