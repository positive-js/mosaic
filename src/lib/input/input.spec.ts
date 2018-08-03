import { Component, DebugElement, Provider, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { McFormField, McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McInput, McInputModule } from '@ptsecurity/mosaic/input';


function createComponent<T>(component: Type<T>,
                            imports: any[] = [],
                            providers: Provider[] = []): ComponentFixture<T> {
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

