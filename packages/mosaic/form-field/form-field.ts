import { FocusMonitor } from '@angular/cdk/a11y';
import {
    AfterContentChecked,
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    Directive,
    ElementRef,
    OnDestroy,
    QueryList,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { ESCAPE, F8 } from '@ptsecurity/cdk/keycodes';
import { CanColor, CanColorCtor, mixinColor } from '@ptsecurity/mosaic/core';
import { EMPTY, merge, Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';

import { McCleaner } from './cleaner';
import { McFormFieldControl } from './form-field-control';
import {
    getMcFormFieldMissingControlError,
    getMcFormFieldYouCanNotUseCleanerInNumberInputError
} from './form-field-errors';
import { McHint } from './hint';
import { McPasswordHint } from './password-hint';
import { McPrefix } from './prefix';
import { McStepper } from './stepper';
import { McSuffix } from './suffix';


let nextUniqueId = 0;

export class McFormFieldBase {
    // tslint:disable-next-line:naming-convention
    constructor(public _elementRef: ElementRef) {}
}

// tslint:disable-next-line:naming-convention
export const McFormFieldMixinBase: CanColorCtor & typeof McFormFieldBase = mixinColor(McFormFieldBase);

@Component({
    selector: 'mc-form-field',
    exportAs: 'mcFormField',
    templateUrl: 'form-field.html',
    // McInput is a directive and can't have styles, so we need to include its styles here.
    // The McInput styles are fairly minimal so it shouldn't be a big deal for people who
    // aren't using McInput.
    styleUrls: [
        'form-field.scss',
        '../input/input.scss',
        '../timepicker/timepicker.scss',
        '../datepicker/datepicker-input.scss',
        '../textarea/textarea.scss'
    ],
    host: {
        class: 'mc-form-field',
        '[class.mc-form-field_invalid]': 'control.errorState',
        '[class.mc-form-field_has-prefix]': 'hasPrefix',
        '[class.mc-form-field_has-suffix]': 'hasSuffix',
        '[class.mc-form-field_has-cleaner]': 'canShowCleaner',
        '[class.mc-form-field_has-stepper]': 'canShowStepper',

        '[class.mc-disabled]': 'control.disabled',

        '[class.ng-untouched]': 'shouldForward("untouched")',
        '[class.ng-touched]': 'shouldForward("touched")',
        '[class.ng-pristine]': 'shouldForward("pristine")',
        '[class.ng-dirty]': 'shouldForward("dirty")',
        '[class.ng-valid]': 'shouldForward("valid")',
        '[class.ng-invalid]': 'shouldForward("invalid")',
        '[class.ng-pending]': 'shouldForward("pending")',

        '(keydown)': 'onKeyDown($event)',
        '(mouseenter)': 'onHoverChanged(true)',
        '(mouseleave)': 'onHoverChanged(false)'
    },
    inputs: ['color'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McFormField extends McFormFieldMixinBase implements
    AfterContentInit, AfterContentChecked, AfterViewInit, CanColor, OnDestroy {

    @ContentChild(McFormFieldControl, { static: false }) control: McFormFieldControl<any>;
    @ContentChild(McStepper, { static: false }) stepper: McStepper;
    @ContentChild(McCleaner, { static: false }) cleaner: McCleaner | null;

    @ContentChildren(McHint) hint: QueryList<McHint>;
    @ContentChildren(McPasswordHint) passwordHints: QueryList<McPasswordHint>;
    @ContentChildren(McSuffix) suffix: QueryList<McSuffix>;
    @ContentChildren(McPrefix) prefix: QueryList<McPrefix>;

    @ViewChild('connectionContainer', { static: true }) connectionContainerRef: ElementRef;

    // Unique id for the internal form field label.
    labelId = `mc-form-field-label-${nextUniqueId++}`;

    hovered: boolean = false;

    canCleanerClearByEsc: boolean = true;

    private $unsubscribe = new Subject<void>();

    get hasHint(): boolean {
        return this.hint?.length > 0;
    }

    get hasPasswordStrengthError(): boolean {
        return this.passwordHints?.some((hint) => hint.hasError);
    }

    get hasSuffix(): boolean {
        return this.suffix?.length > 0;
    }

    get hasPrefix(): boolean {
        return this.prefix?.length > 0;
    }

    get hasCleaner(): boolean {
        return !!this.cleaner;
    }

    get hasStepper(): boolean {
        return !!this.stepper;
    }

    get canShowCleaner(): boolean {
        return this.hasCleaner &&
        this.control?.ngControl
            ? this.control.ngControl.value && !this.control.disabled
            : false;
    }

    get disabled(): boolean {
        return this.control?.disabled;
    }

    get canShowStepper(): boolean {
        return this.hasStepper &&
            !this.disabled &&
            (this.control?.focused || this.hovered);
    }

    constructor(
        // tslint:disable-next-line:naming-convention
        public _elementRef: ElementRef,
        private _changeDetectorRef: ChangeDetectorRef,
        private focusMonitor: FocusMonitor
    ) {
        super(_elementRef);

        this.runFocusMonitor();
    }

    ngAfterContentInit() {
        if ((this.control as any).numberInput && this.hasCleaner) {
            this.cleaner = null;
            throw getMcFormFieldYouCanNotUseCleanerInNumberInputError();
        }

        this.validateControlChild();

        if (this.control.controlType) {
            this._elementRef.nativeElement.classList.add(`mc-form-field-type-${this.control.controlType}`);
        }

        // Subscribe to changes in the child control state in order to update the form field UI.
        this.control.stateChanges
            .pipe(startWith())
            .subscribe((state: any) => {
                if (!state?.focused && this.hasPasswordStrengthError) {
                    this.control.ngControl?.control?.setErrors({ passwordStrength: true });
                }

                this._changeDetectorRef.markForCheck();
            });

        if (this.hasStepper) {
            this.stepper.connectTo((this.control as any).numberInput);
        }

        // Run change detection if the value changes.
        const valueChanges = this.control.ngControl?.valueChanges || EMPTY;

        merge(valueChanges)
            .pipe(takeUntil(this.$unsubscribe))
            .subscribe(() => this._changeDetectorRef.markForCheck());
    }

    ngAfterContentChecked() {
        this.validateControlChild();
    }

    ngAfterViewInit() {
        // Avoid animations on load.
        this._changeDetectorRef.detectChanges();
    }

    clearValue($event) {
        $event.stopPropagation();

        this.control?.ngControl?.reset();
        this.control?.focus();
    }

    onContainerClick($event) {
        if (this.control.onContainerClick) {
            this.control.onContainerClick($event);
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        // tslint:disable-next-line:deprecation
        if (this.control.controlType === 'input-password' && event.altKey && event.keyCode === F8) {
            (this.control as unknown as { toggleType(): void }).toggleType();
        }
        // tslint:disable-next-line:deprecation
        if (this.canCleanerClearByEsc && event.keyCode === ESCAPE && this.control.focused && this.hasCleaner) {
            this.control?.ngControl?.reset();

            event.preventDefault();
        }
    }

    onHoverChanged(isHovered: boolean) {
        if (isHovered !== this.hovered) {
            this.hovered = isHovered;
            this._changeDetectorRef.markForCheck();
        }
    }

    /**
     * Gets an ElementRef for the element that a overlay attached to the form-field should be
     * positioned relative to.
     */
    getConnectedOverlayOrigin(): ElementRef {
        return this.connectionContainerRef || this._elementRef;
    }

    /** Determines whether a class from the NgControl should be forwarded to the host element. */
    shouldForward(prop: keyof NgControl): boolean {
        const ngControl = this.control ? this.control.ngControl : null;

        return ngControl && ngControl[prop];
    }

    ngOnDestroy(): void {
        this.$unsubscribe.next();
        this.$unsubscribe.complete();

        this.stopFocusMonitor();
    }

    /** Throws an error if the form field's control is missing. */
    protected validateControlChild() {
        if (!this.control) {
            throw getMcFormFieldMissingControlError();
        }
    }

    private runFocusMonitor() {
        this.focusMonitor.monitor(this._elementRef.nativeElement, true);
    }

    private stopFocusMonitor() {
        this.focusMonitor.stopMonitoring(this._elementRef.nativeElement);
    }
}

@Directive({
    selector: 'mc-form-field[mcFormFieldWithoutBorders]',
    exportAs: 'mcFormFieldWithoutBorders',
    host: { class: 'mc-form-field_without-borders' }
})
export class McFormFieldWithoutBorders {}
