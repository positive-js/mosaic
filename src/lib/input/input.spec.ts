import { Component, DebugElement, Provider, Type } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ESCAPE } from '@ptsecurity/cdk/keycodes';
import { McFormField, McFormFieldModule } from '@ptsecurity/mosaic/form-field';
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


describe('McInput', () => {

    describe('basic behaviors', () => {

        it('should change state "disable"', fakeAsync(() => {
            const fixture = createComponent(McInputForBehaviors);
            fixture.detectChanges();

            const formFieldElement =
                fixture.debugElement.query(By.directive(McFormField)).nativeElement;
            const inputElement = fixture.debugElement.query(By.directive(McInput)).nativeElement;

            expect(formFieldElement.classList.contains('mc-form-field_disabled'))
                .toBe(false);
            expect(inputElement.disabled).toBe(false);

            fixture.componentInstance.disabled = true;
            fixture.detectChanges();

            fixture.whenStable().then(() => {
                expect(formFieldElement.classList.contains('mc-form-field_disabled'))
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
            inputElementDebug.triggerEventHandler('input', {target: inputElementDebug.nativeElement});

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
            inputElementDebug.triggerEventHandler('input', {target: inputElementDebug.nativeElement});
            inputElementDebug.triggerEventHandler('focus', {target: inputElementDebug.nativeElement});

            fixture.detectChanges();

            expect(formFieldElement.querySelectorAll('.mc-form-field__cleaner').length)
                .toBe(1);

            mcFormFieldDebug.triggerEventHandler('keydown', {
                target: formFieldElement,
                keyCode: ESCAPE
            });

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
            inputElementDebug.triggerEventHandler('input', {target: inputElementDebug.nativeElement});

            fixture.detectChanges();

            expect(formFieldElement.classList.contains('ng-invalid')).toBe(false);

            inputElement.value = '';
            inputElementDebug.triggerEventHandler('input', {target: inputElementDebug.nativeElement});

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
            <input mcInput [(ngModel)]="value" required minlength="4">
        </mc-form-field>
    `
})
class McInputInvalid {
    value: string = '';
}

@Component({
    template: `<mc-form-field>
        <input mcInput mcInputMonospace [(ngModel)]="value"/>
    </mc-form-field>`
})
class McInputWithMcInputMonospace {
    value: string = 'test';
}

@Component({
    template: `<mc-form-field>
        <input mcInput [(ngModel)]="value" [placeholder]="placeholder" [disabled]="disabled"/>
    </mc-form-field>`
})
class McInputForBehaviors {
    value: string = 'test';
    placeholder: string;
    disabled: boolean = false;
}

@Component({
    template: `<mc-form-field>
        <input mcInput/>
        <mc-hint>Hint</mc-hint>
    </mc-form-field>`
})
class McFormFieldWithHint {
}

@Component({
    template: `<mc-form-field>
        <i mcPrefix mc-icon="mc-search_16"></i>
        <input mcInput/>
    </mc-form-field>`
})
class McFormFieldWithPrefix {
}

@Component({
    template: `<mc-form-field>
        <input mcInput/>
        <i mcSuffix mc-icon="mc-search_16"></i>
    </mc-form-field>`
})
class McFormFieldWithSuffix {
}

@Component({
    template: `<mc-form-field>
        <input mcInput [(ngModel)]="value"/>
        <mc-cleaner></mc-cleaner>
    </mc-form-field>`
})
class McFormFieldWithCleaner {
    value: string;
}

@Component({
    template: `<mc-form-field mcFormFieldWithoutBorders>
        <input mcInput/>
    </mc-form-field>`
})
class McFormFieldWithoutBorders {
}
// tslint:enable no-unnecessary-class
