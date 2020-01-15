import { Component, Provider, Type } from '@angular/core';
import {
    ComponentFixture,
    fakeAsync,
    TestBed,
    ComponentFixtureAutoDetect,
    flush
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { DOWN_ARROW, ESCAPE, UP_ARROW } from '@ptsecurity/cdk/keycodes';
import {
    createKeyboardEvent,
    dispatchEvent,
    dispatchFakeEvent,
    dispatchKeyboardEvent
} from '@ptsecurity/cdk/testing';
import {
    getMcFormFieldYouCanNotUseCleanerInNumberInputError,
    McFormField,
    McFormFieldModule
} from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';

import { McInput, McInputModule } from './index';


function createComponent<T>(component: Type<T>,
                            imports: any[] = [],
                            providers: Provider[] = []): ComponentFixture<T> {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
        imports: [
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


// tslint:disable no-unnecessary-class
@Component({
    template: `
        <mc-form-field>
            <input mcInput [(ngModel)]="value" required minlength="4">
        </mc-form-field>
    `
})
class McInputInvalid {
    value: string = '';
}

@Component({
    template: `
        <mc-form-field>
            <input mcInput mcInputMonospace [(ngModel)]="value"/>
        </mc-form-field>`
})
class McInputWithMcInputMonospace {
    value: string = 'test';
}

@Component({
    template: `
        <mc-form-field>
            <input mcInput [(ngModel)]="value" [placeholder]="placeholder" [disabled]="disabled"/>
        </mc-form-field>`
})
class McInputForBehaviors {
    value: string = 'test';
    placeholder: string;
    disabled: boolean = false;
}

@Component({
    template: `
        <mc-form-field>
            <input mcInput/>
            <mc-hint>Hint</mc-hint>
        </mc-form-field>`
})
class McFormFieldWithHint {
}

@Component({
    template: `
        <mc-form-field>
            <i mcPrefix mc-icon="mc-search_16"></i>
            <input mcInput/>
        </mc-form-field>`
})
class McFormFieldWithPrefix {
}

@Component({
    template: `
        <mc-form-field>
            <input mcInput/>
            <i mcSuffix mc-icon="mc-search_16"></i>
        </mc-form-field>`
})
class McFormFieldWithSuffix {
}

@Component({
    template: `
        <mc-form-field>
            <input mcInput [(ngModel)]="value"/>
            <mc-cleaner></mc-cleaner>
        </mc-form-field>`
})
class McFormFieldWithCleaner {
    value: string;
}

@Component({
    template: `
        <mc-form-field mcFormFieldWithoutBorders>
            <input mcInput/>
        </mc-form-field>`
})
class McFormFieldWithoutBorders {
}

// tslint:enable no-unnecessary-class


describe('McInput', () => {

    describe('basic behaviors', () => {

        it('should change state "disable"', fakeAsync(() => {
            const fixture = createComponent(McInputForBehaviors);
            fixture.detectChanges();

            const formFieldElement =
                fixture.debugElement.query(By.directive(McFormField)).nativeElement;
            const inputElement = fixture.debugElement.query(By.directive(McInput)).nativeElement;

            expect(formFieldElement.classList.contains('mc-disabled'))
                .toBe(false);
            expect(inputElement.disabled).toBe(false);

            fixture.componentInstance.disabled = true;
            fixture.detectChanges();

            fixture.whenStable().then(() => {
                expect(formFieldElement.classList.contains('mc-disabled'))
                    .toBe(true);
                expect(inputElement.disabled).toBe(true);
            });
        }));

        it('should has placeholder', fakeAsync(() => {
            const fixture = createComponent(McInputForBehaviors);
            fixture.detectChanges();

            const testComponent = fixture.debugElement.componentInstance;

            const inputElement = fixture.debugElement.query(By.directive(McInput)).nativeElement;

            expect(inputElement.getAttribute('placeholder')).toBe(null);

            testComponent.placeholder = 'placeholder';
            fixture.detectChanges();

            expect(inputElement.getAttribute('placeholder')).toBe('placeholder');

            testComponent.placeholder = '';
            fixture.detectChanges();

            expect(inputElement.getAttribute('placeholder')).toBe('');

        }));

        it('should has cleaner', () => {
            const fixture = createComponent(McFormFieldWithCleaner, [
                McIconModule
            ]);
            fixture.detectChanges();

            const testComponent = fixture.debugElement.componentInstance;

            const formFieldElement =
                fixture.debugElement.query(By.directive(McFormField)).nativeElement;
            const inputElementDebug = fixture.debugElement.query(By.directive(McInput));
            const inputElement = inputElementDebug.nativeElement;


            expect(formFieldElement.querySelectorAll('.mc-form-field__cleaner').length)
                .toBe(0);

            inputElement.value = 'test';
            dispatchFakeEvent(inputElement, 'input');

            fixture.detectChanges();

            expect(formFieldElement.querySelectorAll('.mc-form-field__cleaner').length)
                .toBe(1);

            const mcCleaner = fixture.debugElement.query(By.css('.mc-form-field__cleaner'));
            const mcCleanerElement = mcCleaner.nativeElement;
            mcCleanerElement.click();

            fixture.detectChanges();

            expect(formFieldElement.querySelectorAll('.mc-form-field__cleaner').length)
                .toBe(0);
            expect(testComponent.value).toBe(null);
        });

        it('with cleaner on keydown "ESC" should clear field', () => {
            const fixture = createComponent(McFormFieldWithCleaner, [
                McIconModule
            ]);
            const mcFormFieldDebug = fixture.debugElement.query(By.directive(McFormField));
            const formFieldElement = mcFormFieldDebug.nativeElement;
            const inputElementDebug = fixture.debugElement.query(By.directive(McInput));
            const inputElement = inputElementDebug.nativeElement;

            fixture.detectChanges();

            const testComponent = fixture.debugElement.componentInstance;

            inputElement.value = 'test';
            dispatchFakeEvent(inputElement, 'input');
            dispatchFakeEvent(inputElement, 'focus');

            fixture.detectChanges();

            expect(formFieldElement.querySelectorAll('.mc-form-field__cleaner').length)
                .toBe(1);

            dispatchKeyboardEvent(mcFormFieldDebug.nativeElement, 'keydown', ESCAPE);

            fixture.detectChanges();

            expect(formFieldElement.querySelectorAll('.mc-form-field__cleaner').length)
                .toBe(0);
            expect(testComponent.value).toBe(null);
        });
    });

    describe('apperance', () => {

        it('should change font to monospace', () => {
            const fixture = createComponent(McInputWithMcInputMonospace);
            fixture.detectChanges();

            const mcInputDebug = fixture.debugElement.query(By.directive(McInput));
            const inputElement = mcInputDebug.nativeElement;

            expect(inputElement.classList).toContain('mc-input_monospace');
        });

        it('should has invalid state', fakeAsync(() => {
            const fixture = createComponent(McInputInvalid);
            fixture.detectChanges();

            const formFieldElement =
                fixture.debugElement.query(By.directive(McFormField)).nativeElement;
            const inputElementDebug = fixture.debugElement.query(By.directive(McInput));
            const inputElement = inputElementDebug.nativeElement;

            expect(formFieldElement.classList.contains('ng-invalid'))
                .toBe(true);

            inputElement.value = 'four';
            dispatchFakeEvent(inputElement, 'input');

            fixture.detectChanges();

            expect(formFieldElement.classList.contains('ng-invalid')).toBe(false);

            inputElement.value = '';
            dispatchFakeEvent(inputElement, 'input');

            fixture.detectChanges();

            expect(formFieldElement.classList.contains('ng-invalid')).toBe(true);
        }));

        it('should has hint', fakeAsync(() => {
            const fixture = createComponent(McFormFieldWithHint);
            fixture.detectChanges();

            const mcFormFieldDebug = fixture.debugElement.query(By.directive(McFormField));
            const formFieldElement = mcFormFieldDebug.nativeElement;

            expect(formFieldElement.querySelectorAll('.mc-form-field__hint').length)
                .toBe(1);
            expect(formFieldElement.querySelectorAll('.mc-form-field__hint')[0].textContent)
                .toBe('Hint');
        }));

        it('should has prefix', () => {
            const fixture = createComponent(McFormFieldWithPrefix, [
                McIconModule
            ]);
            fixture.detectChanges();

            const mcFormFieldDebug = fixture.debugElement.query(By.directive(McFormField));
            const formFieldElement = mcFormFieldDebug.nativeElement;

            expect(formFieldElement.querySelectorAll('.mc-form-field__prefix').length)
                .toBe(1);
            expect(formFieldElement.querySelectorAll('[mc-icon]').length)
                .toBe(1);
        });

        it('should has suffix', () => {
            const fixture = createComponent(McFormFieldWithSuffix, [
                McIconModule
            ]);
            fixture.detectChanges();

            const mcFormFieldDebug = fixture.debugElement.query(By.directive(McFormField));
            const formFieldElement = mcFormFieldDebug.nativeElement;

            expect(formFieldElement.querySelectorAll('.mc-form-field__suffix').length)
                .toBe(1);
            expect(formFieldElement.querySelectorAll('[mc-icon]').length)
                .toBe(1);
        });

        it('should be without borders', () => {
            const fixture = createComponent(McFormFieldWithoutBorders, [
                McIconModule
            ]);
            fixture.detectChanges();

            const mcFormFieldDebug = fixture.debugElement.query(By.directive(McFormField));
            const formFieldElement = mcFormFieldDebug.nativeElement;

            expect(formFieldElement.classList.contains('mc-form-field_without-borders'))
                .toBe(true);
        });
    });
});


// tslint:disable no-unnecessary-class
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
// tslint:enable no-unnecessary-class

// tslint:disable no-magic-numbers
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

            expect(fixture.componentInstance.value).toBe(3);
        }));
    });
});
// tslint:enable no-magic-numbers
