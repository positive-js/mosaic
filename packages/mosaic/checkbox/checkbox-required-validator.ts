import {
    Directive,
    forwardRef,
    Provider
} from '@angular/core';
import {
    CheckboxRequiredValidator,
    NG_VALIDATORS
} from '@angular/forms';


export const MC_CHECKBOX_REQUIRED_VALIDATOR: Provider = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => McCheckboxRequiredValidator),
    multi: true
};

/**
 * Validator for Mosaic checkbox's required attribute in template-driven checkbox.
 * Current CheckboxRequiredValidator only work with `input type=checkbox` and does not
 * work with `mc-checkbox`.
 */
@Directive({
    selector: `mc-checkbox[required][formControlName],
             mc-checkbox[required][formControl], mc-checkbox[required][ngModel]`,
    providers: [MC_CHECKBOX_REQUIRED_VALIDATOR],
    host: { '[attr.required]': 'required ? "" : null' }
})
export class McCheckboxRequiredValidator extends CheckboxRequiredValidator {
}
