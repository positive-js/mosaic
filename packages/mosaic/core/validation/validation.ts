import { InjectionToken } from '@angular/core';
import {
    AbstractControl,
    NgControl,
    NgForm,
    RequiredValidator,
    ValidationErrors,
    Validator,
    ValidatorFn
} from '@angular/forms';


// tslint:disable-next-line:naming-convention
export interface McValidationOptions {
    useValidation: boolean;
}

export const MC_VALIDATION = new InjectionToken<McValidationOptions>(
    'McUseValidation',
    { factory: () => ({ useValidation: true }) }
    );


export enum ControlTypes {
    FormControl = 'FormControlDirective',
    FormControlName = 'FormControlName',
    ModelControl = 'NgModel'
}

function getControlType(constructorName: string): ControlTypes {
    if (constructorName === ControlTypes.FormControl || constructorName === ControlTypes.FormControlName) {
        return ControlTypes.FormControl;
    } else if (constructorName === ControlTypes.ModelControl) {
        return  ControlTypes.ModelControl;
    }

    throw Error(`Unknown constructor name: ${constructorName}`);
}

function setValidState(control: AbstractControl, validator: ValidatorFn): void {
    if (!control) { return; }

    control.clearValidators();
    control.updateValueAndValidity({ emitEvent: false });
    control.setValidators(validator);
}


/** This function do next:
 * - run validation on submitting parent form
 * - prevent validation in required validator if form doesn't submitted
 * - if control focused and untouched validation will be prevented
 */
export function setMosaicValidation(validators: Validator[], parentForm: NgForm, ngControl: NgControl) {
    if (!ngControl) { return; }

    if (parentForm) {
        parentForm.ngSubmit.subscribe(() => {
            // tslint:disable-next-line: no-unnecessary-type-assertion
            ngControl.control!.updateValueAndValidity();
        });
    }

    if (getControlType(ngControl.constructor.name) === ControlTypes.ModelControl) {
        if (!validators) { return; }

        validators.forEach((validator: Validator) => {
            // tslint:disable-next-line: no-unbound-method
            const originalValidate = validator.validate;

            if (validator instanceof RequiredValidator) {
                // changed required validation logic
                validator.validate = (control: AbstractControl): ValidationErrors | null => {
                    if (parentForm && !parentForm.submitted) { return null; }

                    return originalValidate.call(validator, control);
                };
            } else {
                // changed all other validation logic
                validator.validate = (control: AbstractControl): ValidationErrors | null => {
                    if (this.focused) { return null; }

                    return originalValidate.call(validator, control);
                };
            }
        });
    } else if (getControlType(ngControl.constructor.name) === ControlTypes.FormControl) {
        const originalValidator = ngControl.control!.validator;

        // changed required validation logic after initialization
        if (ngControl.invalid && ngControl.errors!.required) {
            setValidState(ngControl.control!, originalValidator!);
        }

        // check dynamic updates
        ngControl.statusChanges!
            .subscribe(() => {
                // changed required validation logic
                if (ngControl.invalid && !parentForm.submitted && ngControl.errors!.required) {
                    setValidState(ngControl.control!, originalValidator!);
                }

                // changed all other validation logic
                if (ngControl.invalid && this.focused) {
                    setValidState(ngControl.control!, originalValidator!);
                }
            });
    }
}
