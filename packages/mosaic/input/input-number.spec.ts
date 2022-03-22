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
import { DOWN_ARROW, UP_ARROW } from '@ptsecurity/cdk/keycodes';
import {
    createKeyboardEvent,
    dispatchEvent,
    dispatchFakeEvent,
    dispatchKeyboardEvent
} from '@ptsecurity/cdk/testing';
import {
    getMcFormFieldYouCanNotUseCleanerInNumberInputError,
    McFormFieldModule
} from '@ptsecurity/mosaic/form-field';

import { McInput, McInputModule } from './index';


function createComponent<T>(component: Type<T>, imports: any[] = [], providers: Provider[] = []): ComponentFixture<T> {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
        imports: [
            ReactiveFormsModule,
            FormsModule,
            McInputModule,
            McFormFieldModule,
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
            <input mcInput [(ngModel)]="value" type="number">
            <mc-stepper></mc-stepper>
        </mc-form-field>
    `
})
class McNumberInput {
    value: number | null = null;
}

@Component({
    template: `
        <mc-form-field>
            <input mcInput [formControl]="formControl" type="number">
            <mc-stepper></mc-stepper>
        </mc-form-field>
    `
})
class McNumberInputWithFormControl {
    formControl = new FormControl(10);
}

@Component({
    template: `
        <form [formGroup]="reactiveForm" novalidate>
            <mc-form-field>
                <input mcInput formControlName="reactiveInputValue" type="number">
                <mc-stepper></mc-stepper>
            </mc-form-field>
        </form>
    `
})
class McNumberInputWithFormControlName {
    reactiveForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.reactiveForm = this.formBuilder.group({
            reactiveInputValue: new FormControl(10)
        });
    }
}

@Component({
    template: `
        <mc-form-field>
            <input mcInput [(ngModel)]="value" type="number" max="10" min="3" step="0.5" big-step="2">
            <mc-stepper></mc-stepper>
        </mc-form-field>
    `
})
class McNumberInputMaxMinStep {
    value: number | null = null;
}

@Component({
    template: `
        <mc-form-field>
            <input mcInput [(ngModel)]="value" type="number" [max]="max" [min]="min" [step]="step" [bigStep]="bigStep">
            <mc-stepper></mc-stepper>
        </mc-form-field>
    `
})
class McNumberInputMaxMinStepInput {
    value: number | null = null;
    max: number = 10;
    min: number = 3;
    step: number = 0.5;
    bigStep: number = 2;
}

@Component({
    template: `
        <mc-form-field>
            <input mcInput [(ngModel)]="value" type="number">
            <mc-cleaner></mc-cleaner>
        </mc-form-field>
    `
})
class McNumberInputWithCleaner {
    value: number = 0;
}

describe('McNumberInput', () => {
    it('should have stepper on focus', fakeAsync(() => {
        const fixture = createComponent(McNumberInput);
        fixture.detectChanges();

        const inputElementDebug = fixture.debugElement.query(By.directive(McInput));
        const inputElement = inputElementDebug.nativeElement;

        dispatchFakeEvent(inputElement, 'focus');
        fixture.detectChanges();

        const mcStepper = fixture.debugElement.query(By.css('mc-stepper'));
        const icons = mcStepper.queryAll(By.css('.mc-icon'));

        expect(mcStepper).not.toBeNull();
        expect(icons.length).toBe(2);
    }));

    it('should throw error with stepper', fakeAsync(() => {
        const fixture = createComponent(McNumberInputWithCleaner);

        expect(() => {
            try {
                fixture.detectChanges();
                flush();
            } catch {
                flush();
            }
        }).toThrow(getMcFormFieldYouCanNotUseCleanerInNumberInputError());
    }));

    it('should throw an exception with mc-cleaner', fakeAsync(() => {
        const fixture = createComponent(McNumberInput);
        fixture.detectChanges();

        const mcStepper = fixture.debugElement.query(By.css('mc-cleaner'));

        expect(mcStepper).toBeNull();
    }));

    describe('formControl', () => {
        it('should step up', fakeAsync(() => {
            const fixture = createComponent(McNumberInputWithFormControl);
            fixture.detectChanges();

            expect(fixture.componentInstance.formControl.value).toBe(10);

            const inputElementDebug = fixture.debugElement.query(By.directive(McInput));
            const inputElement = inputElementDebug.nativeElement;

            dispatchFakeEvent(inputElement, 'focus');
            fixture.detectChanges();

            const mcStepper = fixture.debugElement.query(By.css('mc-stepper'));
            const icons = mcStepper.queryAll(By.css('.mc-icon'));
            const iconUp = icons[0];

            dispatchFakeEvent(iconUp.nativeElement, 'mousedown');

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.formControl.value).toBe(11);
        }));

        it('should step down', fakeAsync(() => {
            const fixture = createComponent(McNumberInputWithFormControl);
            fixture.detectChanges();

            expect(fixture.componentInstance.formControl.value).toBe(10);

            const inputElementDebug = fixture.debugElement.query(By.directive(McInput));
            const inputElement = inputElementDebug.nativeElement;

            dispatchFakeEvent(inputElement, 'focus');
            fixture.detectChanges();

            const mcStepper = fixture.debugElement.query(By.css('mc-stepper'));
            const icons = mcStepper.queryAll(By.css('.mc-icon'));
            const iconDown = icons[1];

            dispatchFakeEvent(iconDown.nativeElement, 'mousedown');

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.formControl.value).toBe(9);
        }));
    });

    describe('formControlName', () => {
        it('should step up', fakeAsync(() => {
            const fixture = createComponent(McNumberInputWithFormControlName);
            fixture.detectChanges();

            expect(fixture.componentInstance.reactiveForm.value['reactiveInputValue']).toBe(10);

            const inputElementDebug = fixture.debugElement.query(By.directive(McInput));
            const inputElement = inputElementDebug.nativeElement;

            dispatchFakeEvent(inputElement, 'focus');
            fixture.detectChanges();

            const mcStepper = fixture.debugElement.query(By.css('mc-stepper'));
            const icons = mcStepper.queryAll(By.css('.mc-icon'));
            const iconUp = icons[0];

            dispatchFakeEvent(iconUp.nativeElement, 'mousedown');

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.reactiveForm.value['reactiveInputValue']).toBe(11);
        }));

        it('should step down', fakeAsync(() => {
            const fixture = createComponent(McNumberInputWithFormControlName);
            fixture.detectChanges();

            expect(fixture.componentInstance.reactiveForm.value['reactiveInputValue']).toBe(10);

            const inputElementDebug = fixture.debugElement.query(By.directive(McInput));
            const inputElement = inputElementDebug.nativeElement;

            dispatchFakeEvent(inputElement, 'focus');
            fixture.detectChanges();

            const mcStepper = fixture.debugElement.query(By.css('mc-stepper'));
            const icons = mcStepper.queryAll(By.css('.mc-icon'));
            const iconDown = icons[1];

            dispatchFakeEvent(iconDown.nativeElement, 'mousedown');

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.reactiveForm.value['reactiveInputValue']).toBe(9);
        }));
    });

    describe('empty value', () => {
        it('should step up when no max', fakeAsync(() => {
            const fixture = createComponent(McNumberInput);
            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(McInput));
            const inputElement = inputElementDebug.nativeElement;

            dispatchFakeEvent(inputElement, 'focus');
            fixture.detectChanges();

            const mcStepper = fixture.debugElement.query(By.css('mc-stepper'));
            const icons = mcStepper.queryAll(By.css('.mc-icon'));
            const iconUp = icons[0];

            dispatchFakeEvent(iconUp.nativeElement, 'mousedown');

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(1);
        }));

        it('should step down when no min', fakeAsync(() => {
            const fixture = createComponent(McNumberInput);
            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(McInput));
            const inputElement = inputElementDebug.nativeElement;

            dispatchFakeEvent(inputElement, 'focus');
            fixture.detectChanges();

            const mcStepper = fixture.debugElement.query(By.css('mc-stepper'));
            const icons = mcStepper.queryAll(By.css('.mc-icon'));
            const iconDown = icons[0];

            dispatchFakeEvent(iconDown.nativeElement, 'mousedown');

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(1);
        }));

        it('should step up when max is set', fakeAsync(() => {
            const fixture = createComponent(McNumberInputMaxMinStep);
            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(McInput));
            const inputElement = inputElementDebug.nativeElement;

            dispatchFakeEvent(inputElement, 'focus');
            fixture.detectChanges();

            const mcStepper = fixture.debugElement.query(By.css('mc-stepper'));
            const icons = mcStepper.queryAll(By.css('.mc-icon'));
            const iconUp = icons[0];

            dispatchFakeEvent(iconUp.nativeElement, 'mousedown');
            fixture.detectChanges();

            expect(fixture.componentInstance.value).toBe(3);

            dispatchFakeEvent(iconUp.nativeElement, 'mousedown');
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(3.5);
        }));

        it('should step down when min is set', fakeAsync(() => {
            const fixture = createComponent(McNumberInputMaxMinStep);
            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(McInput));
            const inputElement = inputElementDebug.nativeElement;

            dispatchFakeEvent(inputElement, 'focus');

            fixture.detectChanges();

            const mcStepper = fixture.debugElement.query(By.css('mc-stepper'));
            const icons = mcStepper.queryAll(By.css('.mc-icon'));
            const iconDown = icons[1];

            dispatchFakeEvent(iconDown.nativeElement, 'mousedown');
            fixture.detectChanges();

            expect(fixture.componentInstance.value).toBe(3);

            dispatchFakeEvent(iconDown.nativeElement, 'mousedown');
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(3);
        }));

        it('should be able to set min', fakeAsync(() => {
            const min = 1;

            const fixture = createComponent(McNumberInputMaxMinStepInput);
            fixture.detectChanges();

            fixture.componentInstance.min = min;

            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(McInput));
            const inputElement = inputElementDebug.nativeElement;

            dispatchFakeEvent(inputElement, 'focus');
            fixture.detectChanges();

            const mcStepper = fixture.debugElement.query(By.css('mc-stepper'));
            const icons = mcStepper.queryAll(By.css('.mc-icon'));
            const iconUp = icons[0];

            dispatchFakeEvent(iconUp.nativeElement, 'mousedown');

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(min);
        }));

        it('should be able to set max', fakeAsync(() => {
            const max = 3.5;

            const fixture = createComponent(McNumberInputMaxMinStepInput);
            fixture.componentInstance.max = max;

            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(McInput));
            const inputElement = inputElementDebug.nativeElement;

            dispatchFakeEvent(inputElement, 'focus');
            fixture.detectChanges();

            const mcStepper = fixture.debugElement.query(By.css('mc-stepper'));
            const icons = mcStepper.queryAll(By.css('.mc-icon'));
            const stepUp = icons[0];

            dispatchFakeEvent(stepUp.nativeElement, 'mousedown');
            fixture.detectChanges();

            expect(fixture.componentInstance.value).toBe(fixture.componentInstance.min);

            dispatchFakeEvent(stepUp.nativeElement, 'mousedown');
            fixture.detectChanges();

            expect(fixture.componentInstance.value).toBe(max);

            dispatchFakeEvent(stepUp.nativeElement, 'mousedown');
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(max);
        }));

        it('should be able to set step', fakeAsync(() => {
            const fixture = createComponent(McNumberInputMaxMinStepInput);
            fixture.detectChanges();

            fixture.componentInstance.step = 2;

            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(McInput));
            const inputElement = inputElementDebug.nativeElement;

            dispatchFakeEvent(inputElement, 'focus');
            fixture.detectChanges();

            const mcStepper = fixture.debugElement.query(By.css('mc-stepper'));
            const icons = mcStepper.queryAll(By.css('.mc-icon'));
            const iconDown = icons[1];

            dispatchFakeEvent(iconDown.nativeElement, 'mousedown');
            fixture.detectChanges();

            expect(fixture.componentInstance.value).toBe(3);

            dispatchFakeEvent(iconDown.nativeElement, 'mousedown');
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(3);
        }));

        it('should be able to set big-step', fakeAsync(() => {
            const fixture = createComponent(McNumberInputMaxMinStepInput);
            fixture.detectChanges();

            fixture.componentInstance.bigStep = 3;

            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(McInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = 5;
            dispatchFakeEvent(inputElement, 'input');

            const event = createKeyboardEvent('keydown', UP_ARROW);
            Object.defineProperty(event, 'shiftKey', { get: () => true });
            dispatchEvent(inputElementDebug.nativeElement, event);

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(8);
        }));
    });

    describe('not empty value', () => {
        it('should step up when no min', fakeAsync(() => {
            const fixture = createComponent(McNumberInput);
            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(McInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = 1;
            dispatchFakeEvent(inputElement, 'input');
            dispatchFakeEvent(inputElement, 'focus');

            fixture.detectChanges();

            const mcStepper = fixture.debugElement.query(By.css('mc-stepper'));
            const icons = mcStepper.queryAll(By.css('.mc-icon'));
            const iconUp = icons[0];

            dispatchFakeEvent(iconUp.nativeElement, 'mousedown');

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(2);
        }));

        it('should step down when no max', fakeAsync(() => {
            const fixture = createComponent(McNumberInput);
            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(McInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = 1;
            dispatchFakeEvent(inputElement, 'input');
            dispatchFakeEvent(inputElement, 'focus');

            fixture.detectChanges();

            const mcStepper = fixture.debugElement.query(By.css('mc-stepper'));
            const icons = mcStepper.queryAll(By.css('.mc-icon'));
            const iconDown = icons[1];

            dispatchFakeEvent(iconDown.nativeElement, 'mousedown');

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(0);
        }));
    });

    describe('keys', () => {
        it('should step up on up arrow key', fakeAsync(() => {
            const fixture = createComponent(McNumberInput);
            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(McInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = 1;
            dispatchFakeEvent(inputElement, 'input');

            dispatchKeyboardEvent(inputElementDebug.nativeElement, 'keydown', UP_ARROW);

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(2);
        }));

        it('should step down on down arrow key', fakeAsync(() => {
            const fixture = createComponent(McNumberInput);
            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(McInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = 1;
            dispatchFakeEvent(inputElement, 'input');

            dispatchKeyboardEvent(inputElementDebug.nativeElement, 'keydown', DOWN_ARROW);

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(0);
        }));

        it('should step up with bug step on shift and up arrow key', fakeAsync(() => {
            const fixture = createComponent(McNumberInputMaxMinStep);
            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(McInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = 5;
            dispatchFakeEvent(inputElement, 'input');

            const event = createKeyboardEvent('keydown', UP_ARROW);
            Object.defineProperty(event, 'shiftKey', { get: () => true });
            dispatchEvent(inputElementDebug.nativeElement, event);

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(7);
        }));

        it('should step down with bug step on shift and down arrow key', fakeAsync(() => {
            const fixture = createComponent(McNumberInputMaxMinStep);
            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(McInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = 6;
            dispatchFakeEvent(inputElement, 'input');

            const event = createKeyboardEvent('keydown', DOWN_ARROW);
            Object.defineProperty(event, 'shiftKey', { get: () => true });
            dispatchEvent(inputElementDebug.nativeElement, event);

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(4);
        }));

        it('should ignore wrong chars', fakeAsync(() => {
            const fixture = createComponent(McNumberInputMaxMinStep);
            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(McInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = 123;
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            expect(fixture.componentInstance.value).toBe(123);

            inputElement.value = 'blahblah';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            expect(fixture.componentInstance.value).toBeNull();

            inputElement.value = '1.2';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            expect(fixture.componentInstance.value).toBe(1.2);

            inputElement.value = '1..2';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            expect(fixture.componentInstance.value).toBeNull();

            inputElement.value = '1..';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            expect(fixture.componentInstance.value).toBeNull();

            inputElement.value = '--1';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            expect(fixture.componentInstance.value).toBeNull();

            inputElement.value = '-1-';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            expect(fixture.componentInstance.value).toBeNull();

            inputElement.value = '.';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            expect(fixture.componentInstance.value).toBeNull();

            inputElement.value = '-';
            dispatchFakeEvent(inputElement, 'input');
            fixture.detectChanges();
            expect(fixture.componentInstance.value).toBeNull();
        }));
    });

    describe('truncate to bounds', () => {
        it('should set max when value > max on step up', fakeAsync(() => {
            const fixture = createComponent(McNumberInputMaxMinStep);
            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(McInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = 20;
            dispatchFakeEvent(inputElement, 'input');
            dispatchFakeEvent(inputElement, 'focus');

            fixture.detectChanges();

            const mcStepper = fixture.debugElement.query(By.css('mc-stepper'));
            const icons = mcStepper.queryAll(By.css('.mc-icon'));
            const iconUp = icons[0];

            dispatchFakeEvent(iconUp.nativeElement, 'mousedown');

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(10);
        }));

        it('should set min when value < min on step down', fakeAsync(() => {
            const fixture = createComponent(McNumberInputMaxMinStep);
            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.directive(McInput));
            const inputElement = inputElementDebug.nativeElement;

            inputElement.value = 1;
            dispatchFakeEvent(inputElement, 'input');
            dispatchFakeEvent(inputElement, 'focus');

            fixture.detectChanges();

            const mcStepper = fixture.debugElement.query(By.css('mc-stepper'));
            const icons = mcStepper.queryAll(By.css('.mc-icon'));
            const iconDown = icons[1];

            dispatchFakeEvent(iconDown.nativeElement, 'mousedown');

            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.value).toBe(3);
        }));
    });
});
