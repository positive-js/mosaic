import {
    AfterContentChecked,
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren, Directive,
    ElementRef,
    QueryList, ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { ESCAPE } from '@ptsecurity/cdk/keycodes';
import { CanColor, CanColorCtor, mixinColor } from '@ptsecurity/mosaic/core';
import { EMPTY, merge } from 'rxjs';
import { startWith } from 'rxjs/operators';


import { McCleaner } from './cleaner';
import { McFormFieldControl } from './form-field-control';
import { getMcFormFieldMissingControlError } from './form-field-errors';
import { McFormFieldNumberControl } from './form-field-number-control';
import { McHint } from './hint';
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
        'form-field.css',
        '../input/input.css',
        '../textarea/textarea.css'
    ],
    host: {
        class: 'mc-form-field',
        '[class.mc-form-field_invalid]': 'control.errorState',
        '[class.mc-disabled]': 'control.disabled',
        '[class.mc-form-field_has-prefix]': 'hasPrefix',
        '[class.mc-form-field_has-suffix]': 'hasSuffix',
        '[class.mc-form-field_has-cleaner]': 'canShowCleaner',
        '[class.mc-form-field_has-stepper]': 'canShowStepper',
        '[class.mc-focused]': 'control.focused',
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
    AfterContentInit, AfterContentChecked, AfterViewInit, CanColor {

    @ContentChild(McFormFieldControl, {static: false}) control: McFormFieldControl<any>;
    @ContentChild(McFormFieldNumberControl, {static: false}) numberControl: McFormFieldNumberControl<any>;
    @ContentChild(McStepper, {static: false}) stepper: McStepper;

    @ContentChildren(McHint) hint: QueryList<McHint>;
    @ContentChildren(McSuffix) suffix: QueryList<McSuffix>;
    @ContentChildren(McPrefix) prefix: QueryList<McPrefix>;
    @ContentChildren(McCleaner) cleaner: QueryList<McCleaner>;

    @ViewChild('connectionContainer', {static: true}) connectionContainerRef: ElementRef;

    // Unique id for the internal form field label.
    labelId = `mc-form-field-label-${nextUniqueId++}`;

    hovered: boolean = false;

    canCleanerClearByEsc: boolean = true;

    // tslint:disable-next-line:naming-convention
    constructor(public _elementRef: ElementRef, private _changeDetectorRef: ChangeDetectorRef) {
        super(_elementRef);
    }

    ngAfterContentInit() {
        this.validateControlChild();

        if (this.control.controlType) {
            this._elementRef.nativeElement.classList
                .add(`mc-form-field-type-${this.control.controlType}`);

            if (this.numberControl && this.hasStepper) {
                this.stepper.stepUp.subscribe(this.onStepUp.bind(this));
                this.stepper.stepDown.subscribe(this.onStepDown.bind(this));
            }
        }

        // Subscribe to changes in the child control state in order to update the form field UI.
        this.control.stateChanges.pipe(startWith())
            .subscribe(() => {
                this._changeDetectorRef.markForCheck();
            });

        if (this.numberControl) {
            this.numberControl.stateChanges.pipe(startWith())
                .subscribe(() => {
                    this._changeDetectorRef.markForCheck();
                });
        }

        // Run change detection if the value changes.
        const valueChanges = this.control.ngControl && this.control.ngControl.valueChanges || EMPTY;

        merge(valueChanges)
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

        if (this.control && this.control.ngControl) {
            this.control.ngControl.reset();
            this.control.focus();
        }
    }

    onContainerClick($event) {
        if (this.control.onContainerClick) {
            this.control.onContainerClick($event);
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        // tslint:disable-next-line:deprecation
        if (this.canCleanerClearByEsc && event.keyCode === ESCAPE && this.control.focused && this.hasCleaner) {
            if (this.control && this.control.ngControl) {
                this.control.ngControl.reset();
            }

            event.preventDefault();
        }
    }

    onHoverChanged(isHovered: boolean) {
        if (isHovered !== this.hovered) {
            this.hovered  = isHovered;
            this._changeDetectorRef.markForCheck();
        }
    }

    onStepUp() {
        if (this.numberControl) {
            this.numberControl.stepUp(this.numberControl.step);
        }
    }

    onStepDown() {
        if (this.numberControl) {
            this.numberControl.stepDown(this.numberControl.step);
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

    /** Throws an error if the form field's control is missing. */
    protected validateControlChild() {
        if (!this.control) {
            throw getMcFormFieldMissingControlError();
        }
    }

    get hasHint(): boolean {
        return this.hint && this.hint.length > 0;
    }

    get hasSuffix(): boolean {
        return this.suffix && this.suffix.length > 0;
    }

    get hasPrefix(): boolean {
        return this.prefix && this.prefix.length > 0;
    }

    get hasCleaner(): boolean {
        return this.cleaner && this.cleaner.length > 0;
    }

    get hasStepper(): boolean {
        return !!this.stepper;
    }

    get canShowCleaner(): boolean {
        return this.hasCleaner &&
            this.control &&
            this.control.ngControl
                ? this.control.ngControl.value && !this.control.disabled
                : false;
    }


    get disabled(): boolean {
        return this.control && this.control.disabled;
    }

    get canShowStepper(): boolean {
        return this.numberControl &&
            !this.disabled &&
            (
                this.numberControl.focused ||
                this.hovered
            );
    }
}

@Directive({
    selector: 'mc-form-field[mcFormFieldWithoutBorders]',
    exportAs: 'mcFormFieldWithoutBorders',
    host: { class: 'mc-form-field_without-borders' }
})
export class McFormFieldWithoutBorders {}
