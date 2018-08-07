import { Component, DebugElement, Provider, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
        providers
    }).compileComponents();

    return TestBed.createComponent<T>(component);
}


describe('McInput', () => {

    describe('basic behaviors', () => {
        let fixture: ComponentFixture<any>;

        let inputElement: HTMLElement;
        let mcInputDebug: DebugElement;
        let mcInputComponent: McInput;

        let formFieldElement: HTMLElement;
        let mcFormFieldDebug: DebugElement;
        let mcFormFieldComponent: McFormField;

        let testComponent: McInputForBehaviors;

        beforeEach(() => {
            fixture = createComponent(McInputForBehaviors);
            fixture.detectChanges();

            testComponent = fixture.debugElement.componentInstance;

            mcInputDebug = fixture.debugElement.query(By.directive(McInput));
            mcInputComponent = mcInputDebug.componentInstance;
            inputElement = mcInputDebug.nativeElement;

            mcFormFieldDebug = fixture.debugElement.query(By.directive(McFormField));
            mcFormFieldComponent = mcFormFieldDebug.componentInstance;
            formFieldElement = mcFormFieldDebug.nativeElement;
        });

        it('should change state "disable"', () => {
            expect(formFieldElement.classList.contains('mc-form-field_disabled'))
                .toBe(false);
            expect(mcInputComponent.disabled).toBe(false);

            testComponent.disabled = true;
            fixture.detectChanges();

            fixture.whenStable().then(() => {
                expect(formFieldElement.classList.contains('mc-form-field_disabled'))
                    .toBe(true);
                expect(mcInputComponent.disabled).toBe(true);
            });

            testComponent.disabled = false;
            fixture.detectChanges();

            fixture.whenStable().then(() => {
                expect(formFieldElement.classList.contains('mc-form-field_disabled'))
                    .toBe(false);
                expect(mcInputComponent.disabled).toBe(false);
            });
        });

        it('should has placeholder', () => {
            expect(inputElement.getAttribute('placeholder')).toBe(null);

            testComponent.placeholder = 'placeholder';
            fixture.detectChanges();

            expect(inputElement.getAttribute('placeholder')).toBe('placeholder');

            testComponent.placeholder = '';
            fixture.detectChanges();

            expect(inputElement.getAttribute('placeholder')).toBe('');
        });

        it('should has cleaner', () => {
            fixture = createComponent(McFormFieldWithCleaner, [
                McIconModule
            ]);
            fixture.detectChanges();

            testComponent = fixture.debugElement.componentInstance;

            mcFormFieldDebug = fixture.debugElement.query(By.directive(McFormField));
            formFieldElement = mcFormFieldDebug.nativeElement;

            expect(formFieldElement.querySelectorAll('.mc-form-field__cleaner').length)
                .toBe(0);

            testComponent.value = 'test';
            fixture.detectChanges();

            fixture.whenStable().then(() => {
                expect(formFieldElement.querySelectorAll('.mc-form-field__cleaner').length)
                    .toBe(1);

                const mcCleaner = fixture.debugElement.query(By.css('.mc-form-field__cleaner'));
                mcCleaner.triggerEventHandler('click', {target: mcCleaner.nativeElement});
            });


            fixture.whenStable().then(() => {
                expect(formFieldElement.querySelectorAll('.mc-form-field__cleaner').length)
                    .toBe(0);
                expect(testComponent.value).toBe('');
            });
        });

        it('with cleaner on keydown "ESC" should clear field', () => {
            fixture = createComponent(McFormFieldWithCleaner, [
                McIconModule
            ]);
            fixture.detectChanges();

            testComponent = fixture.debugElement.componentInstance;

            testComponent.value = 'test';
            fixture.detectChanges();

            mcFormFieldDebug.triggerEventHandler('keydown', {
                target: formFieldElement,
                keyCode: ESCAPE
            });

            fixture.detectChanges();

            fixture.whenStable().then(() => {
                expect(formFieldElement.querySelectorAll('.mc-form-field__cleaner').length)
                    .toBe(0);
                expect(testComponent.value).toBe('');
            });
        });
    });

    describe('apperance', () => {
        let fixture: ComponentFixture<any>;

        let inputElement: HTMLElement;
        let mcInputDebug: DebugElement;
        let mcInputComponent: McInput;

        let formFieldElement: HTMLElement;
        let mcFormFieldDebug: DebugElement;
        let mcFormFieldComponent: McFormField;

        let testComponent: McInputForBehaviors;

        it('should change font to monospace', () => {
            fixture = createComponent(McInputWithMcInputMonospace);
            fixture.detectChanges();

            mcInputDebug = fixture.debugElement.query(By.directive(McInput));
            inputElement = mcInputDebug.nativeElement;

            expect(inputElement.classList).toContain('mc-input_monospace');
        });

        it('should be invalid', () => {
            fixture = createComponent(McInputInvalid);
            fixture.detectChanges();

            testComponent = fixture.debugElement.componentInstance;

            mcInputDebug = fixture.debugElement.query(By.directive(McInput));
            mcInputComponent = mcInputDebug.componentInstance;
            inputElement = mcInputDebug.nativeElement;

            mcFormFieldDebug = fixture.debugElement.query(By.directive(McFormField));
            mcFormFieldComponent = mcFormFieldDebug.componentInstance;
            formFieldElement = mcFormFieldDebug.nativeElement;

            expect(formFieldElement.classList.contains('ng-invalid'))
                .toBe(true);

            testComponent.value = 'four';
            fixture.detectChanges();

            fixture.whenStable().then(() => {
                expect(formFieldElement.classList.contains('ng-invalid'))
                    .toBe(false);
            });

            testComponent.value = '';
            fixture.detectChanges();

            fixture.whenStable().then(() => {
                expect(formFieldElement.classList.contains('ng-invalid'))
                    .toBe(true);
            });
        });

        it('should has hint', () => {
            fixture = createComponent(McFormFieldWithHint);
            fixture.detectChanges();

            mcFormFieldDebug = fixture.debugElement.query(By.directive(McFormField));
            formFieldElement = mcFormFieldDebug.nativeElement;

            expect(formFieldElement.querySelectorAll('.mc-form-field__hint').length)
                .toBe(1);
            expect(formFieldElement.querySelectorAll('.mc-form-field__hint')[0].textContent)
                .toBe('Hint');
        });

        it('should has prefix', () => {
            fixture = createComponent(McFormFieldWithPrefix, [
                McIconModule
            ]);
            fixture.detectChanges();

            mcFormFieldDebug = fixture.debugElement.query(By.directive(McFormField));
            formFieldElement = mcFormFieldDebug.nativeElement;

            expect(formFieldElement.querySelectorAll('.mc-form-field__prefix').length)
                .toBe(1);
            expect(formFieldElement.querySelectorAll('[mc-icon]').length)
                .toBe(1);
        });

        it('should has suffix', () => {
            fixture = createComponent(McFormFieldWithSuffix, [
                McIconModule
            ]);
            fixture.detectChanges();

            mcFormFieldDebug = fixture.debugElement.query(By.directive(McFormField));
            formFieldElement = mcFormFieldDebug.nativeElement;

            expect(formFieldElement.querySelectorAll('.mc-form-field__suffix').length)
                .toBe(1);
            expect(formFieldElement.querySelectorAll('[mc-icon]').length)
                .toBe(1);
        });

        it('should be without borders', () => {
            fixture = createComponent(McFormFieldWithoutBorders, [
                McIconModule
            ]);
            fixture.detectChanges();

            testComponent = fixture.debugElement.componentInstance;

            mcFormFieldDebug = fixture.debugElement.query(By.directive(McFormField));
            formFieldElement = mcFormFieldDebug.nativeElement;

            expect(formFieldElement.classList.contains('mc-form-field_without-borders'))
                .toBe(true);
        });
    });
});


@Component({
    template: `
        <mc-form-field>
            <input mcInput [(ngModel)]="value" required minlength="4">
        </mc-form-field>
    `
})
class McInputInvalid {
    value: string = 'two';
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
