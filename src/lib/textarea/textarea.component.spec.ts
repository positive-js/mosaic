import { Component, Provider, Type } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, ComponentFixtureAutoDetect, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { dispatchFakeEvent } from '@ptsecurity/cdk/testing';
import { McFormField, McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';

import { McTextarea, McTextareaModule } from './index';


const MIN_TEXTAREA_HEIGHT = 50;

function createComponent<T>(component: Type<T>,
                            imports: any[] = [],
                            providers: Provider[] = []): ComponentFixture<T> {
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
        imports: [
            FormsModule,
            McTextareaModule,
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
            <textarea mcTextarea [(ngModel)]="value" required minlength="4"></textarea>
        </mc-form-field>
    `
})
class McTextareaInvalid {
    value: string = '';
}

@Component({
    template: `
        <mc-form-field>
            <textarea mcTextarea mcTextareaMonospace [(ngModel)]="value"></textarea>
        </mc-form-field>`
})
class McTextareaWithMonospace {
    value: string = 'test';
}

@Component({
    template: `
        <mc-form-field>
            <textarea mcTextarea [(ngModel)]="value" [placeholder]="placeholder" [disabled]="disabled"></textarea>
        </mc-form-field>`
})
class McTextareaForBehaviors {
    value: string = 'test\ntest\ntest';
    placeholder: string;
    disabled: boolean = false;
}

@Component({
    template: `
        <mc-form-field>
            <textarea mcTextarea [canGrow]="false" [(ngModel)]="value"></textarea>
        </mc-form-field>`
})
class McTextareaGrowOff {
    value: string = 'test\ntest\ntest';
    placeholder: string;
    disabled: boolean = false;
}

@Component({
    template: `
        <mc-form-field mcFormFieldWithoutBorders>
            <textarea mcTextarea></textarea>
        </mc-form-field>`
})
class McFormFieldWithoutBorders {
}

// tslint:enable no-unnecessary-class


describe('McTextarea', () => {

    describe('basic behaviors', () => {

        it('should change state "disable"', fakeAsync(() => {
            const fixture = createComponent(McTextareaForBehaviors);
            fixture.detectChanges();

            tick();

            const formFieldElement =
                fixture.debugElement.query(By.directive(McFormField)).nativeElement;
            const textareaElement = fixture.debugElement.query(By.directive(McTextarea)).nativeElement;

            expect(formFieldElement.classList.contains('mc-disabled'))
                .toBe(false);
            expect(textareaElement.disabled).toBe(false);

            fixture.componentInstance.disabled = true;
            fixture.detectChanges();

            fixture.whenStable().then(() => {
                expect(formFieldElement.classList.contains('mc-disabled'))
                    .toBe(true);
                expect(textareaElement.disabled).toBe(true);
            });
        }));

        it('should has placeholder', fakeAsync(() => {
            const fixture = createComponent(McTextareaForBehaviors);
            fixture.detectChanges();

            tick();

            const testComponent = fixture.debugElement.componentInstance;

            const textareaElement = fixture.debugElement.query(By.directive(McTextarea)).nativeElement;

            expect(textareaElement.getAttribute('placeholder')).toBe(null);

            testComponent.placeholder = 'placeholder';
            fixture.detectChanges();

            expect(textareaElement.getAttribute('placeholder')).toBe('placeholder');

            testComponent.placeholder = '';
            fixture.detectChanges();

            expect(textareaElement.getAttribute('placeholder')).toBe('');

        }));
    });

    describe('apperance', () => {

        it('should change font to monospace', () => {
            const fixture = createComponent(McTextareaWithMonospace);
            fixture.detectChanges();

            const mcTextareaDebug = fixture.debugElement.query(By.directive(McTextarea));
            const textareaElement = mcTextareaDebug.nativeElement;

            expect(textareaElement.classList).toContain('mc-textarea_monospace');
        });

        it('should has invalid state', fakeAsync(() => {
            const fixture = createComponent(McTextareaInvalid);
            fixture.detectChanges();

            tick();

            const formFieldElement =
                fixture.debugElement.query(By.directive(McFormField)).nativeElement;
            const textareaElementDebug = fixture.debugElement.query(By.directive(McTextarea));
            const textareaElement = textareaElementDebug.nativeElement;

            expect(formFieldElement.classList.contains('ng-invalid'))
                .toBe(true);

            textareaElement.value = 'four';
            dispatchFakeEvent(textareaElement, 'input');

            fixture.detectChanges();

            expect(formFieldElement.classList.contains('ng-invalid')).toBe(false);

            textareaElement.value = '';
            dispatchFakeEvent(textareaElement, 'input');

            fixture.detectChanges();

            expect(formFieldElement.classList.contains('ng-invalid')).toBe(true);
        }));

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


    describe('grow', () => {

        it('should grow initially', fakeAsync(() => {
            const fixture = createComponent(McTextareaForBehaviors);
            fixture.detectChanges();

            tick();

            const textareaElement = fixture.debugElement.query(By.directive(McTextarea)).nativeElement;

            expect(textareaElement.getBoundingClientRect().height).toBeGreaterThan(MIN_TEXTAREA_HEIGHT);
        }));

        it('should grow on input', fakeAsync(() => {
            const fixture = createComponent(McTextareaForBehaviors);
            fixture.componentInstance.value = 'test\ntest';
            fixture.detectChanges();

            tick();

            const textareaElement = fixture.debugElement.query(By.directive(McTextarea)).nativeElement;

            const firstSize = textareaElement.getBoundingClientRect().height;

            expect(firstSize).toBeGreaterThan(MIN_TEXTAREA_HEIGHT);

            textareaElement.value = 'test\ntest\ntest\ntest\ntest\ntest';
            dispatchFakeEvent(textareaElement, 'input');

            fixture.detectChanges();

            tick();

            const secondSize = textareaElement.getBoundingClientRect().height;

            expect(firstSize).toBeLessThan(secondSize);
        }));

        it('should grow on input', fakeAsync(() => {
            const fixture = createComponent(McTextareaForBehaviors);
            fixture.componentInstance.value = 'test\ntest\ntest\ntest\ntest\ntest';
            fixture.detectChanges();

            tick();

            const textareaElement = fixture.debugElement.query(By.directive(McTextarea)).nativeElement;

            const firstSize = textareaElement.getBoundingClientRect().height;

            expect(firstSize).toBeGreaterThan(MIN_TEXTAREA_HEIGHT);

            textareaElement.value = 'test\ntest';
            dispatchFakeEvent(textareaElement, 'input');

            fixture.detectChanges();

            tick();

            const secondSize = textareaElement.getBoundingClientRect().height;

            expect(firstSize).toBeGreaterThan(secondSize);
        }));

        it('should has the class when glow is off', fakeAsync(() => {
            const fixture = createComponent(McTextareaGrowOff);
            fixture.detectChanges();

            tick();

            const textareaElement = fixture.debugElement.query(By.directive(McTextarea)).nativeElement;

            expect(textareaElement.classList.contains('mc-textarea-resizable')).toBeTruthy();
        }));
    });
});
