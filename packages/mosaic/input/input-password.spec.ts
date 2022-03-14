/* tslint:disable */
import { Component, Provider, Type } from '@angular/core';
import {
    ComponentFixture,
    fakeAsync,
    TestBed,
    ComponentFixtureAutoDetect,
    flush
} from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { dispatchFakeEvent } from '@ptsecurity/cdk/testing';
import { McFormFieldModule, PasswordRules } from '@ptsecurity/mosaic/form-field';

import { McInputModule, McInputPassword, McPasswordToggle } from './index';


function createComponent<T>(component: Type<T>, imports: any[] = [], providers: Provider[] = []): ComponentFixture<T> {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
        imports: [
            FormsModule,
            ReactiveFormsModule,
            McFormFieldModule,
            McInputModule,
            ...imports
        ],
        declarations: [component],
        providers: [
            { provide: ComponentFixtureAutoDetect, useValue: true },
            ...providers
        ]
    }).compileComponents();

    return TestBed.createComponent<T>(component);
}


@Component({
    template: `
        <mc-form-field>
            <input mcInputPassword [(ngModel)]="value">
            <mc-password-toggle></mc-password-toggle>

            <mc-password-hint [rule]="passwordRules.Length" [min]="8" [max]="64">От 8 до 64 символов</mc-password-hint>

            <mc-password-hint [rule]="passwordRules.UpperLatin">Заглавная латинская буква</mc-password-hint>

            <mc-password-hint [rule]="passwordRules.LowerLatin">Строчная латинская буква</mc-password-hint>

            <mc-password-hint [rule]="passwordRules.Digit">Цифра</mc-password-hint>

            <mc-password-hint [rule]="passwordRules.SpecialSymbols">Только латинские буквы, цифры, пробелы и спецсимволы</mc-password-hint>
        </mc-form-field>
    `
})
class McPasswordInputDefault {
    passwordRules = PasswordRules;

    value: any = '1';
}

@Component({
    template: `
        <mc-form-field>
            <input mcInputPassword [formControl]="formControl">
        </mc-form-field>
    `
})
class McPasswordInputWithFormControl {
    formControl = new FormControl('');
}

@Component({
    template: `
        <form [formGroup]="reactiveForm" novalidate>
            <mc-form-field>
                <input mcInputPassword formControlName="reactiveInputValue">
            </mc-form-field>
        </form>
    `
})
class McPasswordInputWithFormControlName {
    reactiveForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.reactiveForm = this.formBuilder.group({
            reactiveInputValue: new FormControl('')
        });
    }
}


describe('McPasswordInput', () => {
    it('should have toggle', fakeAsync(() => {
        const fixture = createComponent(McPasswordInputDefault);
        fixture.detectChanges();

        const mcPasswordToggle = fixture.debugElement.query(By.css('.mc-password-toggle'));

        expect(mcPasswordToggle).not.toBeNull();
    }));

    it('toggle should change input type', fakeAsync(() => {
        const fixture = createComponent(McPasswordInputDefault);
        fixture.detectChanges();

        const passwordToggle = fixture.debugElement.query(By.directive(McPasswordToggle)).nativeElement;
        const passwordInput = fixture.debugElement.query(By.directive(McInputPassword)).nativeElement;

        expect(passwordInput.getAttribute('type')).toBe('password');

        dispatchFakeEvent(passwordToggle, 'click');
        fixture.detectChanges();

        expect(passwordInput.getAttribute('type')).toBe('text');

        dispatchFakeEvent(passwordToggle, 'click');
        fixture.detectChanges();

        expect(passwordInput.getAttribute('type')).toBe('password');
    }));

    it('should have password hints', fakeAsync(() => {
        const fixture = createComponent(McPasswordInputDefault);
        fixture.detectChanges();

        const mcPasswordHints = fixture.debugElement.queryAll(By.css('.mc-password-hint'));

        expect(mcPasswordHints.length).toBe(5);
    }));

    it('password length rule', fakeAsync(() => {
        const fixture = createComponent(McPasswordInputDefault);
        fixture.detectChanges();
        flush();
        //
        // const formFieldElement = fixture.debugElement.query(By.directive(McFormField)).nativeElement;
        // const passwordLengthHint: DebugElement = fixture.debugElement.queryAll(By.directive(McPasswordHint))[0];
        // const passwordInput: any = fixture.debugElement.query(By.directive(McInputPassword));
        // const input = passwordInput.nativeElement;
        // const passwordToggle = fixture.debugElement.query(By.directive(McPasswordToggle)).nativeElement;
        // console.log('mcPasswordInput: ', passwordInput);
        //
        // expect(formFieldElement.classList.contains('ng-valid')).toBe(true);
        //
        // expect(passwordLengthHint.nativeElement.classList.contains('mc-password-hint__icon_error')).toBe(false);
        //
        // console.log('input.value: ', input.value);
        // console.log('passwordInput.value: ', passwordInput.value);
        // passwordInput.value = '5';
        // dispatchFakeEvent(input, 'input');
        // dispatchFakeEvent(input, 'focus');
        // dispatchFakeEvent(passwordToggle, 'click');
        // fixture.detectChanges();
        //
        // flush();
        // fixture.detectChanges();
        //
        // console.log('formFieldElement.classList', formFieldElement.classList);
        // console.log('mcPasswordInput.classList: ', input.classList);
        // console.log('mcPasswordLengthHint.classList: ', passwordLengthHint.nativeElement.classList);
        //
        // expect(passwordLengthHint.nativeElement.classList.contains('mc-password-hint__icon_error')).toBe(true);
    }));

    describe('formControl', () => {
        it('should step up', fakeAsync(() => {
            const fixture = createComponent(McPasswordInputWithFormControl);
            fixture.detectChanges();
        }));
    });

    describe('formControlName', () => {
        it('should step up', fakeAsync(() => {
            const fixture = createComponent(McPasswordInputWithFormControlName);
            fixture.detectChanges();
        }));
    });

    describe('empty value', () => {});
});
