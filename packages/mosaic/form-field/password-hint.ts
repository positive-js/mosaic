import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input
} from '@angular/core';

import { McFormField } from './form-field';


let nextPasswordHintUniqueId = 0;

export enum PasswordRules {
    Length,
    UpperLatin,
    LowerLatin,
    Digit,
    SpecialSymbols
}

export const regExpPasswordValidator = {
    [PasswordRules.LowerLatin]: RegExp(/^(?=.*?[a-z])/),
    [PasswordRules.UpperLatin]: RegExp(/^(?=.*?[A-Z])/),
    [PasswordRules.Digit]: RegExp(/^(?=.*?[0-9])/),
    [PasswordRules.SpecialSymbols]: RegExp(/^(?=.*?[" !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~"])/)
};


@Component({
    selector: 'mc-password-hint',
    template: `
        <i *ngIf="!checked" class="mc-password-hint__icon" mc-icon="mc-close-M_16"></i>
        <i *ngIf="checked" class="mc-password-hint__icon" mc-icon="mc-check_16"></i>

        <span class="mc-password-hint__text">
            <ng-content></ng-content>
        </span>
    `,
    host: {
        class: 'mc-password-hint',
        '[class.mc-password-hint_valid]': 'checked',
        '[class.mc-password-hint_invalid]': 'hasError',
        '[attr.id]': 'id'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McPasswordHint implements AfterContentInit {
    @Input() id: string = `mc-hint-${nextPasswordHintUniqueId++}`;

    @Input() rule: PasswordRules | any;

    @Input() min: number;
    @Input() max: number;
    @Input() regex: RegExp | null;

    hasError: boolean = false;
    checked: boolean = false;

    private checkRule: (value: string) => boolean;

    private get control() {
        return this.formField.control;
    }

    private lastControlValue: string;

    constructor(private changeDetectorRef: ChangeDetectorRef, private formField: McFormField) {}

    ngAfterContentInit(): void {
        if (this.rule === null) {
            throw Error('You should set [rule] name');
        }

        if (this.rule === PasswordRules.Length && (this.min || this.max) === null) {
            throw Error('For [rule] "Length" need set [min] and [max]');
        }

        if (this.rule === PasswordRules.Length) {
            this.checkRule = this.checkLengthRule;
        } else if (
            [PasswordRules.UpperLatin, PasswordRules.LowerLatin, PasswordRules.Digit, PasswordRules.SpecialSymbols]
                .includes(this.rule)
        ) {
            this.regex = this.regex || regExpPasswordValidator[this.rule];
            this.checkRule = this.checkRegexRule;
        } else {
            throw Error(`Unknown [rule]=${this.rule}`);
        }

        this.formField.control.stateChanges
            .subscribe(this.checkValue);
    }

    private checkValue = () => {
        if (this.control.focused && this.isValueChanged()) {
            this.hasError = false;

            this.checked = this.checkRule(this.control.value);
        } else if (!this.control.focused && !this.isValueChanged()) {
            this.hasError = !this.checkRule(this.control.value);
        }

        this.lastControlValue = this.control.value;
        this.changeDetectorRef.markForCheck();
    }

    private checkLengthRule(value: string): boolean {
        return value.length >= this.min && value.length <= this.max;
    }

    private checkRegexRule(value: string): boolean {
        return !!this.regex?.test(value);
    }

    private isValueChanged(): boolean {
        return this.lastControlValue !== this.formField.control.value;
    }
}
