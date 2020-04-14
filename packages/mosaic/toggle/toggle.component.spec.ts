// tslint:disable:no-magic-numbers
// tslint:disable:no-empty
import { Component, DebugElement, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, flush } from '@angular/core/testing';
import { FormControl, FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { McToggleComponent, McToggleModule } from './index';


describe('McToggle', () => {
    let fixture: ComponentFixture<any>;

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, McToggleModule, FormsModule, ReactiveFormsModule],
            declarations: [
                SingleToggle,
                ToggleWithFormDirectives,
                MultipleToggles,
                ToggleWithTabIndex,
                ToggleWithAriaLabel,
                ToggleWithAriaLabelledby,
                ToggleWithNameAttribute,
                ToggleWithFormControl,
                ToggleWithoutLabel,
                ToggleUsingViewChild
            ]
        });

        TestBed.compileComponents();
    }));

    describe('basic behaviors', () => {
        let toggleDebugElement: DebugElement;
        let toggleNativeElement: HTMLElement;
        let toggleInstance: McToggleComponent;
        let testComponent: SingleToggle;
        let inputElement: HTMLInputElement;
        let labelElement: HTMLLabelElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(SingleToggle);
            fixture.detectChanges();

            toggleDebugElement = fixture.debugElement.query(By.directive(McToggleComponent));
            toggleNativeElement = toggleDebugElement.nativeElement;
            toggleInstance = toggleDebugElement.componentInstance;
            testComponent = fixture.debugElement.componentInstance;
            inputElement = <HTMLInputElement> toggleNativeElement.querySelector('input');
            labelElement = <HTMLLabelElement> toggleNativeElement.querySelector('label');
        });

        it('should add and remove the checked state', () => {
            expect(toggleInstance.checked).toBe(false);
            expect(inputElement.checked).toBe(false);

            testComponent.value = true;

            fixture.detectChanges();

            expect(toggleInstance.checked).toBe(true);
            expect(inputElement.checked).toBe(true);

            testComponent.value = false;
            fixture.detectChanges();

            expect(toggleInstance.checked).toBe(false);
            expect(inputElement.checked).toBe(false);
        });

        it('should change native element checked when check programmatically', () => {
            expect(inputElement.checked).toBe(false);

            toggleInstance.checked = true;
            fixture.detectChanges();

            expect(inputElement.checked).toBe(true);
        });

        it('should toggle checked state on click', () => {
            expect(toggleInstance.checked).toBe(false);

            labelElement.click();
            fixture.detectChanges();

            expect(toggleInstance.checked).toBe(true);

            labelElement.click();
            fixture.detectChanges();

            expect(toggleInstance.checked).toBe(false);
        });

        it('should add and remove disabled state', () => {
            expect(toggleInstance.disabled).toBe(false);
            expect(toggleNativeElement.classList).not.toContain('mc-disabled');
            expect(inputElement.tabIndex).toBe(0);
            expect(inputElement.disabled).toBe(false);

            testComponent.isDisabled = true;
            fixture.detectChanges();

            expect(toggleInstance.disabled).toBe(true);
            expect(toggleNativeElement.classList).toContain('mc-disabled');
            expect(inputElement.disabled).toBe(true);

            testComponent.isDisabled = false;
            fixture.detectChanges();

            expect(toggleInstance.disabled).toBe(false);
            expect(toggleNativeElement.classList).not.toContain('mc-disabled');
            expect(inputElement.tabIndex).toBe(0);
            expect(inputElement.disabled).toBe(false);
        });

        it('should not toggle `checked` state upon interation while disabled', () => {
            testComponent.isDisabled = true;
            fixture.detectChanges();

            toggleNativeElement.click();
            expect(toggleInstance.checked).toBe(false);
        });

        it('should preserve the user-provided id', () => {
            expect(toggleNativeElement.id).toBe('simple-check');
            expect(inputElement.id).toBe('simple-check-input');
        });

        it('should generate a unique id for the toggle input if no id is set', () => {
            testComponent.toggleId = null;
            fixture.detectChanges();

            expect(toggleInstance.inputId).toMatch(/mc-toggle-\d+/);
            expect(inputElement.id).toBe(toggleInstance.inputId);
        });

        it('should project the toggle content into the label element', () => {
            const label = <HTMLLabelElement> toggleNativeElement.querySelector('.mc-toggle-label');
            expect(label.textContent!.trim()).toBe('Simple toggle');
        });

        it('should make the host element a tab stop', () => {
            expect(inputElement.tabIndex).toBe(0);
        });

        it('should add a css class to position the label before the toggle', () => {
            testComponent.labelPos = 'left';
            fixture.detectChanges();

            expect(toggleNativeElement.querySelector('.left')).not.toBeNull();
        });

        it('should not trigger the click event multiple times', () => {
            spyOn(testComponent, 'onToggleClick');

            expect(inputElement.checked).toBe(false);

            labelElement.click();
            fixture.detectChanges();

            expect(inputElement.checked).toBe(true);

            expect(testComponent.onToggleClick).toHaveBeenCalledTimes(1);
        });

        it('should trigger a change event when the native input does', fakeAsync(() => {
            spyOn(testComponent, 'onToggleChange');

            expect(inputElement.checked).toBe(false);

            labelElement.click();
            fixture.detectChanges();

            expect(inputElement.checked).toBe(true);

            fixture.detectChanges();
            flush();

            expect(testComponent.onToggleChange).toHaveBeenCalledTimes(1);
        }));

        it('should not trigger the change event by changing the native value', fakeAsync(() => {
            spyOn(testComponent, 'onToggleChange');

            expect(inputElement.checked).toBe(false);

            testComponent.value = true;
            fixture.detectChanges();

            expect(inputElement.checked).toBe(true);

            fixture.detectChanges();
            flush();

            // The change event shouldn't fire, because the value change was not caused
            // by any interaction.
            expect(testComponent.onToggleChange).not.toHaveBeenCalled();
        }));

        it('should focus on underlying input element when focus() is called', () => {
            expect(document.activeElement).not.toBe(inputElement);

            toggleInstance.focus();
            fixture.detectChanges();

            expect(document.activeElement).toBe(inputElement);
        });

        describe('color behaviour', () => {
            it('should apply class based on color attribute', () => {
                testComponent.toggleColor = 'primary';
                fixture.detectChanges();
                expect(toggleNativeElement.classList.contains('mc-primary')).toBe(true);

                testComponent.toggleColor = 'accent';
                fixture.detectChanges();
                expect(toggleNativeElement.classList.contains('mc-accent')).toBe(true);
            });

            it('should should not clear previous defined classes', () => {
                toggleNativeElement.classList.add('custom-class');

                testComponent.toggleColor = 'primary';
                fixture.detectChanges();

                expect(toggleNativeElement.classList.contains('mc-primary')).toBe(true);
                expect(toggleNativeElement.classList.contains('custom-class')).toBe(true);

                testComponent.toggleColor = 'accent';
                fixture.detectChanges();

                expect(toggleNativeElement.classList.contains('mc-primary')).toBe(false);
                expect(toggleNativeElement.classList.contains('mc-accent')).toBe(true);
                expect(toggleNativeElement.classList.contains('custom-class')).toBe(true);

            });
        });
    });

    describe('aria-label ', () => {
        let toggleDebugElement: DebugElement;
        let toggleNativeElement: HTMLElement;
        let inputElement: HTMLInputElement;

        it('should use the provided aria-label', () => {
            fixture = TestBed.createComponent(ToggleWithAriaLabel);
            toggleDebugElement = fixture.debugElement.query(By.directive(McToggleComponent));
            toggleNativeElement = toggleDebugElement.nativeElement;
            inputElement = <HTMLInputElement> toggleNativeElement.querySelector('input');

            fixture.detectChanges();
            expect(inputElement.getAttribute('aria-label')).toBe('Super effective');
        });

        it('should not set the aria-label attribute if no value is provided', () => {
            fixture = TestBed.createComponent(SingleToggle);
            fixture.detectChanges();

            expect(fixture.nativeElement.querySelector('input').hasAttribute('aria-label')).toBe(false);
        });
    });

    describe('with provided aria-labelledby ', () => {
        let toggleDebugElement: DebugElement;
        let toggleNativeElement: HTMLElement;
        let inputElement: HTMLInputElement;

        it('should use the provided aria-labelledby', () => {
            fixture = TestBed.createComponent(ToggleWithAriaLabelledby);
            toggleDebugElement = fixture.debugElement.query(By.directive(McToggleComponent));
            toggleNativeElement = toggleDebugElement.nativeElement;
            inputElement = <HTMLInputElement> toggleNativeElement.querySelector('input');

            fixture.detectChanges();
            expect(inputElement.getAttribute('aria-labelledby')).toBe('some-id');
        });

        it('should not assign aria-labelledby if none is provided', () => {
            fixture = TestBed.createComponent(SingleToggle);
            toggleDebugElement = fixture.debugElement.query(By.directive(McToggleComponent));
            toggleNativeElement = toggleDebugElement.nativeElement;
            inputElement = <HTMLInputElement> toggleNativeElement.querySelector('input');

            fixture.detectChanges();
            expect(inputElement.getAttribute('aria-labelledby')).toBe(null);
        });
    });

    describe('with provided tabIndex', () => {
        let toggleDebugElement: DebugElement;
        let toggleNativeElement: HTMLElement;
        let testComponent: ToggleWithTabIndex;
        let inputElement: HTMLInputElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(ToggleWithTabIndex);
            fixture.detectChanges();

            testComponent = fixture.debugElement.componentInstance;
            toggleDebugElement = fixture.debugElement.query(By.directive(McToggleComponent));
            toggleNativeElement = toggleDebugElement.nativeElement;
            inputElement = <HTMLInputElement> toggleNativeElement.querySelector('input');
        });

        it('should preserve any given tabIndex', () => {
            expect(inputElement.tabIndex).toBe(7);
        });

        it('should preserve given tabIndex when the toggle is disabled then enabled', () => {
            testComponent.isDisabled = true;
            fixture.detectChanges();

            testComponent.customTabIndex = 13;
            fixture.detectChanges();

            testComponent.isDisabled = false;
            fixture.detectChanges();

            expect(inputElement.tabIndex).toBe(13);
        });

    });

    describe('using ViewChild', () => {
        let toggleDebugElement: DebugElement;
        let toggleNativeElement: HTMLElement;
        let testComponent: ToggleUsingViewChild;

        beforeEach(() => {
            fixture = TestBed.createComponent(ToggleUsingViewChild);
            fixture.detectChanges();

            toggleDebugElement = fixture.debugElement.query(By.directive(McToggleComponent));
            toggleNativeElement = toggleDebugElement.nativeElement;
            testComponent = fixture.debugElement.componentInstance;
        });

        it('should toggle disabledness correctly', () => {
            const toggleInstance = toggleDebugElement.componentInstance;
            const inputElement = <HTMLInputElement> toggleNativeElement.querySelector('input');
            expect(toggleInstance.disabled).toBe(false);
            expect(toggleNativeElement.classList).not.toContain('mc-disabled');
            expect(inputElement.tabIndex).toBe(0);
            expect(inputElement.disabled).toBe(false);

            testComponent.isDisabled = true;
            fixture.detectChanges();

            expect(toggleInstance.disabled).toBe(true);
            expect(toggleNativeElement.classList).toContain('mc-disabled');
            expect(inputElement.disabled).toBe(true);

            testComponent.isDisabled = false;
            fixture.detectChanges();

            expect(toggleInstance.disabled).toBe(false);
            expect(toggleNativeElement.classList).not.toContain('mc-disabled');
            expect(inputElement.tabIndex).toBe(0);
            expect(inputElement.disabled).toBe(false);
        });
    });

    describe('with multiple toggles', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(MultipleToggles);
            fixture.detectChanges();
        });

        it('should assign a unique id to each toggle', () => {
            const [firstId, secondId] =
                fixture.debugElement.queryAll(By.directive(McToggleComponent))
                    .map((debugElement) => debugElement.nativeElement.querySelector('input').id);

            expect(firstId).toMatch(/mc-toggle-\d+-input/);
            expect(secondId).toMatch(/mc-toggle-\d+-input/);
            expect(firstId).not.toEqual(secondId);
        });
    });

    describe('with ngModel', () => {
        let toggleDebugElement: DebugElement;
        let toggleNativeElement: HTMLElement;
        let toggleInstance: McToggleComponent;
        let inputElement: HTMLInputElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(ToggleWithFormDirectives);
            fixture.detectChanges();

            toggleDebugElement = fixture.debugElement.query(By.directive(McToggleComponent));
            toggleNativeElement = toggleDebugElement.nativeElement;
            toggleInstance = toggleDebugElement.componentInstance;
            inputElement = <HTMLInputElement> toggleNativeElement.querySelector('input');
        });

        it('should be in pristine, untouched, and valid states initially', fakeAsync(() => {
            flush();

            const toggleElement = fixture.debugElement.query(By.directive(McToggleComponent));
            const ngModel = toggleElement.injector.get<NgModel>(NgModel);

            expect(ngModel.valid).toBe(true);
            expect(ngModel.pristine).toBe(true);
            expect(ngModel.touched).toBe(false);

            // TODO(jelbourn): test that `touched` and `pristine` state are modified appropriately.
            // This is currently blocked on issues with async() and fakeAsync().
        }));

        it('should toggle checked state on click', () => {
            expect(toggleInstance.checked).toBe(false);

            inputElement.click();
            fixture.detectChanges();

            expect(toggleInstance.checked).toBe(true);

            inputElement.click();
            fixture.detectChanges();

            expect(toggleInstance.checked).toBe(false);
        });
    });

    describe('with name attribute', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(ToggleWithNameAttribute);
            fixture.detectChanges();
        });

        it('should forward name value to input element', () => {
            const toggleElement = fixture.debugElement.query(By.directive(McToggleComponent));
            const inputElement = <HTMLInputElement> toggleElement.nativeElement.querySelector('input');

            expect(inputElement.getAttribute('name')).toBe('test-name');
        });
    });

    describe('with form control', () => {
        let toggleDebugElement: DebugElement;
        let toggleInstance: McToggleComponent;
        let testComponent: ToggleWithFormControl;
        let inputElement: HTMLInputElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(ToggleWithFormControl);
            fixture.detectChanges();

            toggleDebugElement = fixture.debugElement.query(By.directive(McToggleComponent));
            toggleInstance = toggleDebugElement.componentInstance;
            testComponent = fixture.debugElement.componentInstance;
            inputElement = <HTMLInputElement> toggleDebugElement.nativeElement.querySelector('input');
        });

        it('should toggle the disabled state', () => {
            expect(toggleInstance.disabled).toBe(false);

            testComponent.formControl.disable();
            fixture.detectChanges();

            expect(toggleInstance.disabled).toBe(true);
            expect(inputElement.disabled).toBe(true);

            testComponent.formControl.enable();
            fixture.detectChanges();

            expect(toggleInstance.disabled).toBe(false);
            expect(inputElement.disabled).toBe(false);
        });
    });

    describe('without label', () => {
        let toggleInnerContainer: HTMLElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(ToggleWithoutLabel);

            const toggleDebugEl = fixture.debugElement.query(By.directive(McToggleComponent));

            toggleInnerContainer = toggleDebugEl
                .query(By.css('.mc-toggle__container')).nativeElement;
        });

        it('should not add the "name" attribute if it is not passed in', () => {
            fixture.detectChanges();
            expect(toggleInnerContainer.querySelector('input')!.hasAttribute('name')).toBe(false);
        });

        it('should not add the "value" attribute if it is not passed in', () => {
            fixture.detectChanges();
            expect(toggleInnerContainer.querySelector('input')!.hasAttribute('value')).toBe(false);
        });
    });
});

@Component({
    template: `
        <div (click)="parentElementClicked = true" (keyup)="parentElementKeyedUp = true">
            <mc-toggle
                [id]="toggleId"
                [labelPosition]="labelPos"
                [checked]="value"
                [disabled]="isDisabled"
                [color]="toggleColor"
                (click)="onToggleClick($event)"
                (change)="onToggleChange($event)">
                Simple toggle
            </mc-toggle>
        </div>`
})
class SingleToggle {
    labelPos: 'left' | 'right' = 'left';
    value: boolean = false;
    isDisabled: boolean = false;
    parentElementClicked: boolean = false;
    parentElementKeyedUp: boolean = false;
    toggleId: string | null = 'simple-check';
    toggleColor: string = 'primary';

    onToggleClick: (event?: Event) => void = () => {};
    onToggleChange: (event?: any) => void = () => {};
}


@Component({
    template: `
    <form>
      <mc-toggle name="cb" [(ngModel)]="isGood">Be good</mc-toggle>
    </form>
  `
})
class ToggleWithFormDirectives {
    isGood: boolean = false;
}

@Component(({
    template: `
    <mc-toggle>Option 1</mc-toggle>
    <mc-toggle>Option 2</mc-toggle>
  `
}))
class MultipleToggles {}

@Component({
    template: `
    <mc-toggle
        [tabIndex]="customTabIndex"
        [disabled]="isDisabled">
    </mc-toggle>`
})
class ToggleWithTabIndex {
    customTabIndex: number = 7;
    isDisabled: boolean = false;
}

@Component({
    template: `
    <mc-toggle></mc-toggle>`
})
class ToggleUsingViewChild {
    @ViewChild(McToggleComponent, {static: false}) toggle;

    set isDisabled(value: boolean) {
        this.toggle.disabled = value;
    }
}

@Component({
    template: `<mc-toggle aria-label="Super effective"></mc-toggle>`
})
class ToggleWithAriaLabel {
}

@Component({
    template: `<mc-toggle aria-labelledby="some-id"></mc-toggle>`
})
class ToggleWithAriaLabelledby {
}

@Component({
    template: `<mc-toggle name="test-name"></mc-toggle>`
})
class ToggleWithNameAttribute {
}

@Component({
    template: `<mc-toggle [formControl]="formControl"></mc-toggle>`
})
class ToggleWithFormControl {
    formControl = new FormControl();
}

@Component({
    template: `<mc-toggle>{{ label }}</mc-toggle>`
})
class ToggleWithoutLabel {
    label: string;
}
