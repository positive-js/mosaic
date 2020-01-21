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


function setValidState(control: AbstractControl, validator: ValidatorFn): void {
    if (!control) { return; }

    control.clearValidators();
    control.updateValueAndValidity({ emitEvent: false });
    control.setValidators(validator);
}


/** This function do next:
 * - run validation on submitting parent form
 * - prevent validation in required validator if form doesn't submitted
 * - if control focused validation will be prevented
 */
export function setMosaicValidation(component) {
    const ngControl = component.ngControl;

    if (!ngControl) { return; }

    const parentForm: NgForm = component.parentForm || component.parentFormGroup;

    if (parentForm) {
        parentForm.ngSubmit.subscribe(() => {
            // tslint:disable-next-line: no-unnecessary-type-assertion
            ngControl.control!.updateValueAndValidity();
        });
    }

    if (component.ngModel) {
        setMosaicValidationForModelControl(component, component.rawValidators, parentForm);
    } else if (component.formControlName) {
        setMosaicValidationForFormControl(component, parentForm, ngControl);
    }
}
export function setMosaicValidationForModelControl(component, validators: Validator[], parentForm: NgForm) {
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
                if (component.focused) { return null; }

                return originalValidate.call(validator, control);
            };
        }
    });
}

export function setMosaicValidationForFormControl(component, parentForm: NgForm, ngControl: NgControl) {
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
            if (ngControl.invalid && component.focused) {
                setValidState(ngControl.control!, originalValidator!);
            }
        });
}
