import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    Directive, DoCheck, ElementRef, Inject,
    Input, OnChanges, OnDestroy, Optional,
    Self, InjectionToken, NgZone, OnInit
} from '@angular/core';
import { FormGroupDirective, NgControl, NgForm } from '@angular/forms';
import {
    CanUpdateErrorState,
    CanUpdateErrorStateCtor,
    ErrorStateMatcher,
    mixinErrorState
} from '@ptsecurity/mosaic/core';
import { McFormFieldControl } from '@ptsecurity/mosaic/form-field';
import { fromEvent, Subscription, Subject } from 'rxjs';


export const MC_TEXTAREA_VALUE_ACCESSOR =
    new InjectionToken<{ value: any }>('MC_TEXTAREA_VALUE_ACCESSOR');

let nextUniqueId = 0;

const ROW_SEPARATOR = '\n';

export class McTextareaBase {
    constructor(public defaultErrorStateMatcher: ErrorStateMatcher,
                public parentForm: NgForm,
                public parentFormGroup: FormGroupDirective,
                public ngControl: NgControl) {
    }
}

// tslint:disable-next-line:naming-convention
export const McTextareaMixinBase: CanUpdateErrorStateCtor & typeof McTextareaBase = mixinErrorState(McTextareaBase);

@Directive({
    selector: 'textarea[mcTextarea]',
    exportAs: 'mcTextarea',
    host: {
        class: 'mc-textarea',
        '[class.mc-textarea-resizable]': '!canGrow',
        '[attr.id]': 'id',
        '[attr.placeholder]': 'placeholder',
        '[attr.aria-invalid]': 'errorState',
        '[disabled]': 'disabled',
        '[required]': 'required',
        '(blur)': 'focusChanged(false)',
        '(focus)': 'focusChanged(true)'
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
    private _disabled = false;
    private _id: string;
    private _required = false;

    private valueAccessor: { value: any };
    private growSubscription: Subscription;

    private lineHeight: number = 0;
    private freeRowsHeight: number = 0;
    private minHeight: number = 0;

    constructor(protected elementRef: ElementRef,
                @Optional() @Self() public ngControl: NgControl,
                @Optional() parentForm: NgForm,
                @Optional() parentFormGroup: FormGroupDirective,
                defaultErrorStateMatcher: ErrorStateMatcher,
                @Optional() @Self() @Inject(MC_TEXTAREA_VALUE_ACCESSOR) inputValueAccessor: any,
                private ngZone: NgZone) {
        super(defaultErrorStateMatcher, parentForm, parentFormGroup, ngControl);
        // If no input value accessor was explicitly specified, use the element as the textarea value
        // accessor.
        this.valueAccessor = inputValueAccessor || this.elementRef.nativeElement;

        this.previousNativeValue = this.value;

        // Force setter to be called in case id was not specified.
        this.id = this.id;

        const growObserver = fromEvent(elementRef.nativeElement, 'input')
            /*.pipe(
                map((event: any) => this.getGrowHeight()),
                // map((event: any) => event.target.scrollHeight),
                distinctUntilChanged()
            )*/;
        this.growSubscription = growObserver.subscribe(this.grow.bind(this));
    }

    ngOnInit() {
        setTimeout(() => this.grow(), 0);
        this.lineHeight = parseInt(getComputedStyle(this.elementRef.nativeElement).lineHeight!, 10);

        const paddingTop = parseInt(getComputedStyle(this.elementRef.nativeElement).paddingTop!, 10);
        const paddingBottom = parseInt(getComputedStyle(this.elementRef.nativeElement).paddingBottom!, 10);

        // tslint:disable-next-line:no-magic-numbers
        this.minHeight = this.lineHeight * 2 + paddingTop + paddingBottom;
        this.freeRowsHeight = this.lineHeight;
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
            const textarea = this.elementRef.nativeElement;

            const outerHeight = parseInt(window.getComputedStyle(textarea).height!, 10);
            const diff = outerHeight - textarea.clientHeight;

            textarea.style.height = 0; // this line is important to height recalculation

            const height = Math.max(this.minHeight, +textarea.scrollHeight + diff + this.freeRowsHeight);
            textarea.style.height = `${height}px`;
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

    private getGrowHeight(): number {
        const textarea = this.elementRef.nativeElement;
        const outerHeight = parseInt(window.getComputedStyle(textarea).height!.toString(), 10);
        const diff = outerHeight - textarea.clientHeight;

        return Math.max(this.minHeight, +textarea.scrollHeight + diff);
    }
}
