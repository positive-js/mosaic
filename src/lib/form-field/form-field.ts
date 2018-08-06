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
    QueryList,
    ViewEncapsulation
} from '@angular/core';
import { EMPTY, merge } from 'rxjs';
import { startWith } from 'rxjs/operators';


import { McCleaner } from './cleaner';
import { McFormFieldControl } from './form-field-control';
import { getMcFormFieldMissingControlError } from './form-field-errors';
import { McHint } from './hint';
import { McPrefix } from './prefix';
import { McSuffix } from './suffix';


export class McFormFieldBase {
    constructor(public _elementRef: ElementRef) {
    }
}

@Component({
    selector: 'mc-form-field',
    exportAs: 'mcFormField',
    templateUrl: 'form-field.html',
    // McInput is a directive and can't have styles, so we need to include its styles here.
    // The McInput styles are fairly minimal so it shouldn't be a big deal for people who
    // aren't using McInput.
    styleUrls: [
        'form-field.css',
        '../input/input.css'
    ],
    host: {
        class: 'mc-form-field',
        '[class.mc-form-field_invalid]': '_control.errorState',
        '[class.mc-form-field_disabled]': '_control.disabled',
        '[class.mc-form-field_has-prefix]': 'hasPrefix',
        '[class.mc-form-field_has-suffix]': 'hasSuffix',
        '[class.mc-form-field_has-cleaner]': 'canShowCleaner',
        '[class.mc-focused]': '_control.focused',
        '[class.ng-untouched]': '_shouldForward("untouched")',
        '[class.ng-touched]': '_shouldForward("touched")',
        '[class.ng-pristine]': '_shouldForward("pristine")',
        '[class.ng-dirty]': '_shouldForward("dirty")',
        '[class.ng-valid]': '_shouldForward("valid")',
        '[class.ng-invalid]': '_shouldForward("invalid")',
        '[class.ng-pending]': '_shouldForward("pending")',
        '(keydown)': 'onKeyDown($event)'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class McFormField extends McFormFieldBase
    implements AfterContentInit, AfterContentChecked, AfterViewInit {

    static KEY_CODE_ESC: number = 27;

    @ContentChild(McFormFieldControl) _control: McFormFieldControl<any>;
    @ContentChildren(McHint) _hint: QueryList<McHint>;
    @ContentChildren(McSuffix) _suffix: QueryList<McSuffix>;
    @ContentChildren(McPrefix) _prefix: QueryList<McPrefix>;
    @ContentChildren(McCleaner) _cleaner: QueryList<McCleaner>;


    constructor(
        public _elementRef: ElementRef,
        private _changeDetectorRef: ChangeDetectorRef) {
        super(_elementRef);
    }

    ngAfterContentInit() {
        this._validateControlChild();
        if (this._control.controlType) {
            this._elementRef.nativeElement.classList
                .add(`mc-form-field-type-${this._control.controlType}`);
        }

        // Subscribe to changes in the child control state in order to update the form field UI.
        this._control.stateChanges.pipe(startWith()).subscribe(() => {
            this._changeDetectorRef.markForCheck();
        });

        // Run change detection if the value changes.
        const valueChanges = this._control.ngControl && this._control.ngControl.valueChanges || EMPTY;
        merge(valueChanges)
            .subscribe(() => this._changeDetectorRef.markForCheck());
    }

    ngAfterContentChecked() {
        this._validateControlChild();
    }

    ngAfterViewInit() {
        // Avoid animations on load.
        this._changeDetectorRef.detectChanges();
    }

    clearValue($event) {
        $event.stopPropagation();

        if (this._control && this._control.ngControl) {
            this._control.ngControl.reset();
        }
    }

    onContainerClick($event) {
        return this._control.onContainerClick && this._control.onContainerClick($event);
    }

    onKeyDown(e: KeyboardEvent): void {
        if (e.keyCode === McFormField.KEY_CODE_ESC &&
            this._control.focused &&
            this.hasCleaner) {
            if (this._control && this._control.ngControl) {
                this._control.ngControl.reset();
            }
            e.preventDefault();
        }
    }

    /** Determines whether a class from the NgControl should be forwarded to the host element. */
    _shouldForward(prop: string): boolean {
        const ngControl = this._control ? this._control.ngControl : null;

        return ngControl && ngControl[prop];
    }

    /** Throws an error if the form field's control is missing. */
    protected _validateControlChild() {
        if (!this._control) {
            throw getMcFormFieldMissingControlError();
        }
    }

    get hasHint() {
        return this._hint && this._hint.length > 0;
    }

    get hasSuffix() {
        return this._suffix && this._suffix.length > 0;
    }

    get hasPrefix() {
        return this._prefix && this._prefix.length > 0;
    }

    get hasCleaner() {
        return this._cleaner && this._cleaner.length > 0;
    }

    get canShowCleaner() {
        return  this.hasCleaner &&
        this._control && this._control.ngControl
            ? this._control.ngControl.value && !this._control.disabled
            : false;
    }
}

@Directive({
    selector: 'mc-form-field[mcFormFieldWithoutBorders]',
    exportAs: 'mcFormFieldWithoutBorders',
    host: { class: 'mc-form-field_without-borders' }
})
export class McFormFieldWithoutBorders {
}
