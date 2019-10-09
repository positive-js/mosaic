import { Directive, forwardRef, Input, OnChanges, Provider, SimpleChanges } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn, Validators } from '@angular/forms';


export const MIN_VALIDATOR: Provider = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => MinValidator),
    multi: true
};

/**
 * A directive which installs the {@link MinValidator} for any `formControlName`,
 * `formControl`, or control with `ngModel` that also has a `min` attribute.
 *
 * @experimental
 */
@Directive({
    selector: '[min][formControlName],[min][formControl],[min][ngModel]',
    providers: [MIN_VALIDATOR],
    host: {'[attr.min]': 'min ? min : null'}
})
export class MinValidator implements Validator, OnChanges {

    @Input() min: string;
    private validator: ValidatorFn;
    private onChange: () => void;

    ngOnChanges(changes: SimpleChanges): void {
        if ('min' in changes) {
            this.createValidator();
            if (this.onChange) { this.onChange(); }
        }
    }

    validate(c: AbstractControl): ValidationErrors | null { return this.validator(c); }

    registerOnValidatorChange(fn: () => void): void { this.onChange = fn; }

    private createValidator(): void { this.validator = Validators.min(parseInt(this.min, 10)); }
}


export const MAX_VALIDATOR: Provider = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => MaxValidator),
    multi: true
};

/**
 * A directive which installs the {@link MaxValidator} for any `formControlName`,
 * `formControl`, or control with `ngModel` that also has a `min` attribute.
 *
 * @experimental
 */
@Directive({
    selector: '[max][formControlName],[max][formControl],[max][ngModel]',
    providers: [MAX_VALIDATOR],
    host: {
        '[attr.max]': 'max ? max : null'
    }
})
export class MaxValidator implements Validator,
    OnChanges {

    @Input() max: string;
    private validator: ValidatorFn;
    private onChange: () => void;

    ngOnChanges(changes: SimpleChanges): void {
        if ('max' in changes) {
            this.createValidator();
            if (this.onChange) { this.onChange(); }
        }
    }

    validate(c: AbstractControl): ValidationErrors | null { return this.validator(c); }

    registerOnValidatorChange(fn: () => void): void { this.onChange = fn; }

    private createValidator(): void { this.validator = Validators.max(parseInt(this.max, 10)); }
}
