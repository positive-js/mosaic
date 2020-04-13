import { Component, DebugElement, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, flush } from '@angular/core/testing';
import { FormControl, FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { MC_CHECKBOX_CLICK_ACTION } from './checkbox-config';
import { McCheckbox, McCheckboxChange, McCheckboxModule } from './index';


// tslint:disable no-empty
// tslint:disable no-magic-numbers
describe('McCheckbox', () => {
    let fixture: ComponentFixture<any>;

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [McCheckboxModule, FormsModule, ReactiveFormsModule],
            declarations: [
                SingleCheckbox,
                CheckboxWithFormDirectives,
                MultipleCheckboxes,
                CheckboxWithNgModel,
                CheckboxWithTabIndex,
                CheckboxWithAriaLabel,
                CheckboxWithAriaLabelledby,
                CheckboxWithNameAttribute,
                CheckboxWithChangeEvent,
                CheckboxWithFormControl,
                CheckboxWithoutLabel,
                CheckboxUsingViewChild
            ]
        });

        TestBed.compileComponents();
    }));

    describe('basic behaviors', () => {
        let checkboxDebugElement: DebugElement;
        let checkboxNativeElement: HTMLElement;
        let checkboxInstance: McCheckbox;
        let testComponent: SingleCheckbox;
        let inputElement: HTMLInputElement;
        let labelElement: HTMLLabelElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(SingleCheckbox);
            fixture.detectChanges();

            checkboxDebugElement = fixture.debugElement.query(By.directive(McCheckbox));
            checkboxNativeElement = checkboxDebugElement.nativeElement;
            checkboxInstance = checkboxDebugElement.componentInstance;
            testComponent = fixture.debugElement.componentInstance;
            inputElement = <HTMLInputElement> checkboxNativeElement.querySelector('input');
            labelElement = <HTMLLabelElement> checkboxNativeElement.querySelector('label');
        });

        it('should add and remove the checked state', () => {
            expect(checkboxInstance.checked).toBe(false);
            expect(checkboxNativeElement.classList).not.toContain('mc-checked');
            expect(inputElement.checked).toBe(false);

            testComponent.isChecked = true;
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(true);
            expect(checkboxNativeElement.classList).toContain('mc-checked');
            expect(inputElement.checked).toBe(true);

            testComponent.isChecked = false;
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(false);
            expect(checkboxNativeElement.classList).not.toContain('mc-checked');
            expect(inputElement.checked).toBe(false);
        });

        it('should add and remove indeterminate state', () => {
            expect(checkboxNativeElement.classList).not.toContain('mc-checked');
            expect(inputElement.checked).toBe(false);
            expect(inputElement.indeterminate).toBe(false);
            expect(inputElement.getAttribute('aria-checked'))
                .toBe('false', 'Expect aria-checked to be false');

            testComponent.isIndeterminate = true;
            fixture.detectChanges();

            expect(checkboxNativeElement.classList).toContain('mc-indeterminate');
            expect(inputElement.checked).toBe(false);
            expect(inputElement.indeterminate).toBe(true);
            expect(inputElement.getAttribute('aria-checked'))
                .toBe('mixed', 'Expect aria checked to be mixed for indeterminate checkbox');

            testComponent.isIndeterminate = false;
            fixture.detectChanges();

            expect(checkboxNativeElement.classList).not.toContain('mc-indeterminate');
            expect(inputElement.checked).toBe(false);
            expect(inputElement.indeterminate).toBe(false);
        });

        it('should set indeterminate to false when input clicked', fakeAsync(() => {
            testComponent.isIndeterminate = true;
            fixture.detectChanges();

            expect(checkboxInstance.indeterminate).toBe(true);
            expect(inputElement.indeterminate).toBe(true);
            expect(testComponent.isIndeterminate).toBe(true);

            inputElement.click();
            fixture.detectChanges();

            // Flush the microtasks because the forms module updates the model state asynchronously.
            flush();

            // The checked property has been updated from the model and now the view needs
            // to reflect the state change.
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(true);
            expect(inputElement.indeterminate).toBe(false);
            expect(inputElement.checked).toBe(true);
            expect(testComponent.isIndeterminate).toBe(false);

            testComponent.isIndeterminate = true;
            fixture.detectChanges();

            expect(checkboxInstance.indeterminate).toBe(true);
            expect(inputElement.indeterminate).toBe(true);
            expect(inputElement.checked).toBe(true);
            expect(testComponent.isIndeterminate).toBe(true);
            expect(inputElement.getAttribute('aria-checked'))
                .toBe('true', 'Expect aria checked to be true');

            inputElement.click();
            fixture.detectChanges();

            // Flush the microtasks because the forms module updates the model state asynchronously.
            flush();

            // The checked property has been updated from the model and now the view needs
            // to reflect the state change.
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(false);
            expect(inputElement.indeterminate).toBe(false);
            expect(inputElement.checked).toBe(false);
            expect(testComponent.isIndeterminate).toBe(false);
        }));

        it('should not set indeterminate to false when checked is set programmatically', () => {
            testComponent.isIndeterminate = true;
            fixture.detectChanges();

            expect(checkboxInstance.indeterminate).toBe(true);
            expect(inputElement.indeterminate).toBe(true);
            expect(testComponent.isIndeterminate).toBe(true);

            testComponent.isChecked = true;
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(true);
            expect(inputElement.indeterminate).toBe(true);
            expect(inputElement.checked).toBe(true);
            expect(testComponent.isIndeterminate).toBe(true);

            testComponent.isChecked = false;
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(false);
            expect(inputElement.indeterminate).toBe(true);
            expect(inputElement.checked).toBe(false);
            expect(testComponent.isIndeterminate).toBe(true);
        });

        it('should change native element checked when check programmatically', () => {
            expect(inputElement.checked).toBe(false);

            checkboxInstance.checked = true;
            fixture.detectChanges();

            expect(inputElement.checked).toBe(true);
        });

        it('should toggle checked state on click', () => {
            expect(checkboxInstance.checked).toBe(false);

            labelElement.click();
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(true);

            labelElement.click();
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(false);
        });

        it('should change from indeterminate to checked on click', fakeAsync(() => {
            testComponent.isChecked = false;
            testComponent.isIndeterminate = true;
            fixture.detectChanges();
            const inputClickEvent = new Event('inputClick');

            expect(checkboxInstance.checked).toBe(false);
            expect(checkboxInstance.indeterminate).toBe(true);

            checkboxInstance.onInputClick(inputClickEvent);

            // Flush the microtasks because the indeterminate state will be updated in the next tick.
            flush();

            expect(checkboxInstance.checked).toBe(true);
            expect(checkboxInstance.indeterminate).toBe(false);

            checkboxInstance.onInputClick(inputClickEvent);
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(false);
            expect(checkboxInstance.indeterminate).toBe(false);
        }));

        it('should add and remove disabled state', () => {
            expect(checkboxInstance.disabled).toBe(false);
            expect(checkboxNativeElement.classList).not.toContain('mc-disabled');
            expect(inputElement.tabIndex).toBe(0);
            expect(inputElement.disabled).toBe(false);

            testComponent.isDisabled = true;
            fixture.detectChanges();

            expect(checkboxInstance.disabled).toBe(true);
            expect(checkboxNativeElement.classList).toContain('mc-disabled');
            expect(inputElement.disabled).toBe(true);

            testComponent.isDisabled = false;
            fixture.detectChanges();

            expect(checkboxInstance.disabled).toBe(false);
            expect(checkboxNativeElement.classList).not.toContain('mc-disabled');
            expect(inputElement.tabIndex).toBe(0);
            expect(inputElement.disabled).toBe(false);
        });

        it('should not toggle `checked` state upon interation while disabled', () => {
            testComponent.isDisabled = true;
            fixture.detectChanges();

            checkboxNativeElement.click();
            expect(checkboxInstance.checked).toBe(false);
        });

        it('should overwrite indeterminate state when clicked', fakeAsync(() => {
            testComponent.isIndeterminate = true;
            fixture.detectChanges();

            inputElement.click();
            fixture.detectChanges();

            // Flush the microtasks because the indeterminate state will be updated in the next tick.
            flush();

            expect(checkboxInstance.checked).toBe(true);
            expect(checkboxInstance.indeterminate).toBe(false);
        }));

        it('should preserve the user-provided id', () => {
            expect(checkboxNativeElement.id).toBe('simple-check');
            expect(inputElement.id).toBe('simple-check-input');
        });

        it('should generate a unique id for the checkbox input if no id is set', () => {
            testComponent.checkboxId = null;
            fixture.detectChanges();

            expect(checkboxInstance.inputId).toMatch(/mc-checkbox-\d+/);
            expect(inputElement.id).toBe(checkboxInstance.inputId);
        });

        it('should project the checkbox content into the label element', () => {
            const label = <HTMLLabelElement> checkboxNativeElement.querySelector('.mc-checkbox-label');
            expect(label.textContent!.trim()).toBe('Simple checkbox');
        });

        it('should make the host element a tab stop', () => {
            expect(inputElement.tabIndex).toBe(0);
        });

        it('should add a css class to position the label before the checkbox', () => {
            testComponent.labelPos = 'before';
            fixture.detectChanges();

            expect(checkboxNativeElement.classList).toContain('mc-checkbox-label-before');
        });

        it('should not trigger the click event multiple times', () => {
            // By default, when clicking on a label element, a generated click will be dispatched
            // on the associated input element.
            // Since we're using a label element and a visual hidden input, this behavior can led
            // to an issue, where the click events on the checkbox are getting executed twice.

            spyOn(testComponent, 'onCheckboxClick');

            expect(inputElement.checked).toBe(false);
            expect(checkboxNativeElement.classList).not.toContain('mc-checked');

            labelElement.click();
            fixture.detectChanges();

            expect(checkboxNativeElement.classList).toContain('mc-checked');
            expect(inputElement.checked).toBe(true);

            expect(testComponent.onCheckboxClick).toHaveBeenCalledTimes(1);
        });

        it('should trigger a change event when the native input does', fakeAsync(() => {
            spyOn(testComponent, 'onCheckboxChange');

            expect(inputElement.checked).toBe(false);
            expect(checkboxNativeElement.classList).not.toContain('mc-checked');

            labelElement.click();
            fixture.detectChanges();

            expect(inputElement.checked).toBe(true);
            expect(checkboxNativeElement.classList).toContain('mc-checked');

            fixture.detectChanges();
            flush();

            // The change event shouldn't fire, because the value change was not caused
            // by any interaction.
            expect(testComponent.onCheckboxChange).toHaveBeenCalledTimes(1);
        }));

        it('should not trigger the change event by changing the native value', fakeAsync(() => {
            spyOn(testComponent, 'onCheckboxChange');

            expect(inputElement.checked).toBe(false);
            expect(checkboxNativeElement.classList).not.toContain('mc-checked');

            testComponent.isChecked = true;
            fixture.detectChanges();

            expect(inputElement.checked).toBe(true);
            expect(checkboxNativeElement.classList).toContain('mc-checked');

            fixture.detectChanges();
            flush();

            // The change event shouldn't fire, because the value change was not caused
            // by any interaction.
            expect(testComponent.onCheckboxChange).not.toHaveBeenCalled();
        }));

        it('should forward the required attribute', () => {
            testComponent.isRequired = true;
            fixture.detectChanges();

            expect(inputElement.required).toBe(true);

            testComponent.isRequired = false;
            fixture.detectChanges();

            expect(inputElement.required).toBe(false);
        });

        it('should focus on underlying input element when focus() is called', () => {
            expect(document.activeElement).not.toBe(inputElement);

            checkboxInstance.focus();
            fixture.detectChanges();

            expect(document.activeElement).toBe(inputElement);
        });

        it('should forward the value to input element', () => {
            testComponent.checkboxValue = 'basic_checkbox';
            fixture.detectChanges();

            expect(inputElement.value).toBe('basic_checkbox');
        });

        describe('color behaviour', () => {
            it('should apply class based on color attribute', () => {
                testComponent.checkboxColor = 'primary';
                fixture.detectChanges();
                expect(checkboxNativeElement.classList.contains('mc-primary')).toBe(true);

                testComponent.checkboxColor = 'accent';
                fixture.detectChanges();
                expect(checkboxNativeElement.classList.contains('mc-accent')).toBe(true);
            });

            it('should should not clear previous defined classes', () => {
                checkboxNativeElement.classList.add('custom-class');

                testComponent.checkboxColor = 'primary';
                fixture.detectChanges();

                expect(checkboxNativeElement.classList.contains('mc-primary')).toBe(true);
                expect(checkboxNativeElement.classList.contains('custom-class')).toBe(true);

                testComponent.checkboxColor = 'accent';
                fixture.detectChanges();

                expect(checkboxNativeElement.classList.contains('mc-primary')).toBe(false);
                expect(checkboxNativeElement.classList.contains('mc-accent')).toBe(true);
                expect(checkboxNativeElement.classList.contains('custom-class')).toBe(true);

            });
        });

        describe(`when MC_CHECKBOX_CLICK_ACTION is 'check'`, () => {
            beforeEach(() => {
                TestBed.resetTestingModule();
                TestBed.configureTestingModule({
                    imports: [McCheckboxModule, FormsModule, ReactiveFormsModule],
                    declarations: [
                        SingleCheckbox
                    ],
                    providers: [
                        { provide: MC_CHECKBOX_CLICK_ACTION, useValue: 'check' }
                    ]
                });

                fixture = TestBed.createComponent(SingleCheckbox);
                fixture.detectChanges();

                checkboxDebugElement = fixture.debugElement.query(By.directive(McCheckbox));
                checkboxNativeElement = checkboxDebugElement.nativeElement;
                checkboxInstance = checkboxDebugElement.componentInstance;
                testComponent = fixture.debugElement.componentInstance;

                inputElement = checkboxNativeElement.querySelector('input') as HTMLInputElement;
                labelElement = checkboxNativeElement.querySelector('label') as HTMLLabelElement;
            });

            it('should not set `indeterminate` to false on click if check is set', fakeAsync(() => {
                testComponent.isIndeterminate = true;
                inputElement.click();

                fixture.detectChanges();
                flush();
                fixture.detectChanges();
                expect(inputElement.checked).toBe(true);
                expect(checkboxNativeElement.classList).toContain('mc-checked');
                expect(inputElement.indeterminate).toBe(true);
                expect(checkboxNativeElement.classList).toContain('mc-indeterminate');
            }));
        });

        describe(`when MC_CHECKBOX_CLICK_ACTION is 'noop'`, () => {
            beforeEach(() => {
                TestBed.resetTestingModule();
                TestBed.configureTestingModule({
                    imports: [McCheckboxModule, FormsModule, ReactiveFormsModule],
                    declarations: [
                        SingleCheckbox
                    ],
                    providers: [
                        { provide: MC_CHECKBOX_CLICK_ACTION, useValue: 'noop' }
                    ]
                });

                fixture = TestBed.createComponent(SingleCheckbox);
                fixture.detectChanges();

                checkboxDebugElement = fixture.debugElement.query(By.directive(McCheckbox));
                checkboxNativeElement = checkboxDebugElement.nativeElement;
                checkboxInstance = checkboxDebugElement.componentInstance;
                testComponent = fixture.debugElement.componentInstance;
                inputElement = checkboxNativeElement.querySelector('input') as HTMLInputElement;
                labelElement = checkboxNativeElement.querySelector('label') as HTMLLabelElement;
            });

            it('should not change `indeterminate` on click if noop is set', fakeAsync(() => {
                testComponent.isIndeterminate = true;
                inputElement.click();

                fixture.detectChanges();
                flush();
                fixture.detectChanges();

                expect(inputElement.checked).toBe(false);
                expect(checkboxNativeElement.classList).not.toContain('mc-checked');
                expect(inputElement.indeterminate).toBe(true);
                expect(checkboxNativeElement.classList).toContain('mc-indeterminate');
            }));


            it(`should not change 'checked' or 'indeterminate' on click if noop is set`, fakeAsync(() => {
                testComponent.isChecked = true;
                testComponent.isIndeterminate = true;
                inputElement.click();

                fixture.detectChanges();
                flush();
                fixture.detectChanges();

                expect(inputElement.checked).toBe(true);
                expect(checkboxNativeElement.classList).toContain('mc-checked');
                expect(inputElement.indeterminate).toBe(true);
                expect(checkboxNativeElement.classList).toContain('mc-indeterminate');

                testComponent.isChecked = false;
                inputElement.click();

                fixture.detectChanges();
                flush();
                fixture.detectChanges();

                expect(inputElement.checked).toBe(false);
                expect(checkboxNativeElement.classList).not.toContain('mc-checked');
                expect(inputElement.indeterminate).toBe(true, 'indeterminate should not change');
                expect(checkboxNativeElement.classList).toContain('mc-indeterminate');
            }));
        });
    });

    describe('with change event and no initial value', () => {
        let checkboxDebugElement: DebugElement;
        let checkboxNativeElement: HTMLElement;
        let checkboxInstance: McCheckbox;
        let testComponent: CheckboxWithChangeEvent;
        let inputElement: HTMLInputElement;
        let labelElement: HTMLLabelElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(CheckboxWithChangeEvent);
            fixture.detectChanges();

            checkboxDebugElement = fixture.debugElement.query(By.directive(McCheckbox));
            checkboxNativeElement = checkboxDebugElement.nativeElement;
            checkboxInstance = checkboxDebugElement.componentInstance;
            testComponent = fixture.debugElement.componentInstance;
            inputElement = <HTMLInputElement> checkboxNativeElement.querySelector('input');
            labelElement = <HTMLLabelElement> checkboxNativeElement.querySelector('label');
        });

        it('should emit the event to the change observable', () => {
            const changeSpy = jasmine.createSpy('onChangeObservable');

            checkboxInstance.change.subscribe(changeSpy);

            fixture.detectChanges();
            expect(changeSpy).not.toHaveBeenCalled();

            // When changing the native `checked` property the checkbox will not fire a change event,
            // because the element is not focused and it's not the native behavior of the input element.
            labelElement.click();
            fixture.detectChanges();

            expect(changeSpy).toHaveBeenCalledTimes(1);
        });

        it('should not emit a DOM event to the change output', fakeAsync(() => {
            fixture.detectChanges();
            expect(testComponent.lastEvent).toBeUndefined();

            // Trigger the click on the inputElement, because the input will probably
            // emit a DOM event to the change output.
            inputElement.click();
            fixture.detectChanges();
            flush();

            // We're checking the arguments type / emitted value to be a boolean, because sometimes the
            // emitted value can be a DOM Event, which is not valid.
            // See angular/angular#4059
            expect(testComponent.lastEvent.checked).toBe(true);
        }));
    });

    describe('aria-label ', () => {
        let checkboxDebugElement: DebugElement;
        let checkboxNativeElement: HTMLElement;
        let inputElement: HTMLInputElement;

        it('should use the provided aria-label', () => {
            fixture = TestBed.createComponent(CheckboxWithAriaLabel);
            checkboxDebugElement = fixture.debugElement.query(By.directive(McCheckbox));
            checkboxNativeElement = checkboxDebugElement.nativeElement;
            inputElement = <HTMLInputElement> checkboxNativeElement.querySelector('input');

            fixture.detectChanges();
            expect(inputElement.getAttribute('aria-label')).toBe('Super effective');
        });

        it('should not set the aria-label attribute if no value is provided', () => {
            fixture = TestBed.createComponent(SingleCheckbox);
            fixture.detectChanges();

            expect(fixture.nativeElement.querySelector('input').hasAttribute('aria-label')).toBe(false);
        });
    });

    describe('with provided aria-labelledby ', () => {
        let checkboxDebugElement: DebugElement;
        let checkboxNativeElement: HTMLElement;
        let inputElement: HTMLInputElement;

        it('should use the provided aria-labelledby', () => {
            fixture = TestBed.createComponent(CheckboxWithAriaLabelledby);
            checkboxDebugElement = fixture.debugElement.query(By.directive(McCheckbox));
            checkboxNativeElement = checkboxDebugElement.nativeElement;
            inputElement = <HTMLInputElement> checkboxNativeElement.querySelector('input');

            fixture.detectChanges();
            expect(inputElement.getAttribute('aria-labelledby')).toBe('some-id');
        });

        it('should not assign aria-labelledby if none is provided', () => {
            fixture = TestBed.createComponent(SingleCheckbox);
            checkboxDebugElement = fixture.debugElement.query(By.directive(McCheckbox));
            checkboxNativeElement = checkboxDebugElement.nativeElement;
            inputElement = <HTMLInputElement> checkboxNativeElement.querySelector('input');

            fixture.detectChanges();
            expect(inputElement.getAttribute('aria-labelledby')).toBe(null);
        });
    });

    describe('with provided tabIndex', () => {
        let checkboxDebugElement: DebugElement;
        let checkboxNativeElement: HTMLElement;
        let testComponent: CheckboxWithTabIndex;
        let inputElement: HTMLInputElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(CheckboxWithTabIndex);
            fixture.detectChanges();

            testComponent = fixture.debugElement.componentInstance;
            checkboxDebugElement = fixture.debugElement.query(By.directive(McCheckbox));
            checkboxNativeElement = checkboxDebugElement.nativeElement;
            inputElement = <HTMLInputElement> checkboxNativeElement.querySelector('input');
        });

        it('should preserve any given tabIndex', () => {
            expect(inputElement.tabIndex).toBe(7);
        });

        it('should preserve given tabIndex when the checkbox is disabled then enabled', () => {
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
        let checkboxDebugElement: DebugElement;
        let checkboxNativeElement: HTMLElement;
        let testComponent: CheckboxUsingViewChild;

        beforeEach(() => {
            fixture = TestBed.createComponent(CheckboxUsingViewChild);
            fixture.detectChanges();

            checkboxDebugElement = fixture.debugElement.query(By.directive(McCheckbox));
            checkboxNativeElement = checkboxDebugElement.nativeElement;
            testComponent = fixture.debugElement.componentInstance;
        });

        it('should toggle checkbox disabledness correctly', () => {
            const checkboxInstance = checkboxDebugElement.componentInstance;
            const inputElement = <HTMLInputElement> checkboxNativeElement.querySelector('input');
            expect(checkboxInstance.disabled).toBe(false);
            expect(checkboxNativeElement.classList).not.toContain('mc-disabled');
            expect(inputElement.tabIndex).toBe(0);
            expect(inputElement.disabled).toBe(false);

            testComponent.isDisabled = true;
            fixture.detectChanges();

            expect(checkboxInstance.disabled).toBe(true);
            expect(checkboxNativeElement.classList).toContain('mc-disabled');
            expect(inputElement.disabled).toBe(true);

            testComponent.isDisabled = false;
            fixture.detectChanges();

            expect(checkboxInstance.disabled).toBe(false);
            expect(checkboxNativeElement.classList).not.toContain('mc-disabled');
            expect(inputElement.tabIndex).toBe(0);
            expect(inputElement.disabled).toBe(false);
        });
    });

    describe('with multiple checkboxes', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(MultipleCheckboxes);
            fixture.detectChanges();
        });

        it('should assign a unique id to each checkbox', () => {
            const [firstId, secondId] =
                fixture.debugElement.queryAll(By.directive(McCheckbox))
                    .map((debugElement) => debugElement.nativeElement.querySelector('input').id);

            expect(firstId).toMatch(/mc-checkbox-\d+-input/);
            expect(secondId).toMatch(/mc-checkbox-\d+-input/);
            expect(firstId).not.toEqual(secondId);
        });
    });

    describe('with ngModel', () => {
        let checkboxDebugElement: DebugElement;
        let checkboxNativeElement: HTMLElement;
        let checkboxInstance: McCheckbox;
        let inputElement: HTMLInputElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(CheckboxWithFormDirectives);
            fixture.detectChanges();

            checkboxDebugElement = fixture.debugElement.query(By.directive(McCheckbox));
            checkboxNativeElement = checkboxDebugElement.nativeElement;
            checkboxInstance = checkboxDebugElement.componentInstance;
            inputElement = <HTMLInputElement> checkboxNativeElement.querySelector('input');
        });

        it('should be in pristine, untouched, and valid states initially', fakeAsync(() => {
            flush();

            const checkboxElement = fixture.debugElement.query(By.directive(McCheckbox));
            const ngModel = checkboxElement.injector.get<NgModel>(NgModel);

            expect(ngModel.valid).toBe(true);
            expect(ngModel.pristine).toBe(true);
            expect(ngModel.touched).toBe(false);

            // TODO(jelbourn): test that `touched` and `pristine` state are modified appropriately.
            // This is currently blocked on issues with async() and fakeAsync().
        }));

        it('should toggle checked state on click', () => {
            expect(checkboxInstance.checked).toBe(false);

            inputElement.click();
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(true);

            inputElement.click();
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(false);
        });
    });

    describe('with required ngModel', () => {
        let checkboxInstance: McCheckbox;
        let inputElement: HTMLInputElement;
        let testComponent: CheckboxWithNgModel;

        beforeEach(() => {
            fixture = TestBed.createComponent(CheckboxWithNgModel);
            fixture.detectChanges();

            const checkboxDebugElement = fixture.debugElement.query(By.directive(McCheckbox));
            const checkboxNativeElement = checkboxDebugElement.nativeElement;
            testComponent = fixture.debugElement.componentInstance;
            checkboxInstance = checkboxDebugElement.componentInstance;
            inputElement = <HTMLInputElement> checkboxNativeElement.querySelector('input');
        });

        it('should validate with RequiredTrue validator', () => {
            const checkboxElement = fixture.debugElement.query(By.directive(McCheckbox));
            const ngModel = checkboxElement.injector.get<NgModel>(NgModel);

            testComponent.isRequired = true;
            inputElement.click();
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(true);
            expect(ngModel.valid).toBe(true);

            inputElement.click();
            fixture.detectChanges();

            expect(checkboxInstance.checked).toBe(false);
            expect(ngModel.valid).toBe(false);
        });
    });

    describe('with name attribute', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(CheckboxWithNameAttribute);
            fixture.detectChanges();
        });

        it('should forward name value to input element', () => {
            const checkboxElement = fixture.debugElement.query(By.directive(McCheckbox));
            const inputElement = <HTMLInputElement> checkboxElement.nativeElement.querySelector('input');

            expect(inputElement.getAttribute('name')).toBe('test-name');
        });
    });

    describe('with form control', () => {
        let checkboxDebugElement: DebugElement;
        let checkboxInstance: McCheckbox;
        let testComponent: CheckboxWithFormControl;
        let inputElement: HTMLInputElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(CheckboxWithFormControl);
            fixture.detectChanges();

            checkboxDebugElement = fixture.debugElement.query(By.directive(McCheckbox));
            checkboxInstance = checkboxDebugElement.componentInstance;
            testComponent = fixture.debugElement.componentInstance;
            inputElement = <HTMLInputElement> checkboxDebugElement.nativeElement.querySelector('input');
        });

        it('should toggle the disabled state', () => {
            expect(checkboxInstance.disabled).toBe(false);

            testComponent.formControl.disable();
            fixture.detectChanges();

            expect(checkboxInstance.disabled).toBe(true);
            expect(inputElement.disabled).toBe(true);

            testComponent.formControl.enable();
            fixture.detectChanges();

            expect(checkboxInstance.disabled).toBe(false);
            expect(inputElement.disabled).toBe(false);
        });
    });

    describe('without label', () => {
        let testComponent: CheckboxWithoutLabel;
        let checkboxInnerContainer: HTMLElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(CheckboxWithoutLabel);

            const checkboxDebugEl = fixture.debugElement.query(By.directive(McCheckbox));

            testComponent = fixture.componentInstance;
            checkboxInnerContainer = checkboxDebugEl
                .query(By.css('.mc-checkbox-inner-container')).nativeElement;
        });

        it('should remove margin for checkbox without a label', () => {
            fixture.detectChanges();

            expect(checkboxInnerContainer.classList)
                .toContain('mc-checkbox-inner-container-no-side-margin');
        });

        it('should not remove margin if initial label is set through binding', () => {
            testComponent.label = 'Some content';
            fixture.detectChanges();

            expect(checkboxInnerContainer.classList)
                .not.toContain('mc-checkbox-inner-container-no-side-margin');
        });

        it('should not add the "name" attribute if it is not passed in', () => {
            fixture.detectChanges();
            expect(checkboxInnerContainer.querySelector('input')!.hasAttribute('name')).toBe(false);
        });

        it('should not add the "value" attribute if it is not passed in', () => {
            fixture.detectChanges();
            expect(checkboxInnerContainer.querySelector('input')!.hasAttribute('value')).toBe(false);
        });

    });
});

/** Simple component for testing a single checkbox. */
@Component({
    template: `
  <div (click)="parentElementClicked = true" (keyup)="parentElementKeyedUp = true">
    <mc-checkbox
        [id]="checkboxId"
        [required]="isRequired"
        [labelPosition]="labelPos"
        [checked]="isChecked"
        [(indeterminate)]="isIndeterminate"
        [disabled]="isDisabled"
        [color]="checkboxColor"
        [value]="checkboxValue"
        (click)="onCheckboxClick($event)"
        (change)="onCheckboxChange($event)">
      Simple checkbox
    </mc-checkbox>
  </div>`
})
class SingleCheckbox {
    labelPos: 'before' | 'after' = 'after';
    isChecked: boolean = false;
    isRequired: boolean = false;
    isIndeterminate: boolean = false;
    isDisabled: boolean = false;
    parentElementClicked: boolean = false;
    parentElementKeyedUp: boolean = false;
    checkboxId: string | null = 'simple-check';
    checkboxColor: string = 'primary';
    checkboxValue: string = 'single_checkbox';

    onCheckboxClick: (event?: Event) => void = () => {};
    onCheckboxChange: (event?: McCheckboxChange) => void = () => {};
}

/** Simple component for testing an McCheckbox with ngModel in a form. */
@Component({
    template: `
    <form>
      <mc-checkbox name="cb" [(ngModel)]="isGood">Be good</mc-checkbox>
    </form>
  `
})
class CheckboxWithFormDirectives {
    isGood: boolean = false;
}

/** Simple component for testing an McCheckbox with required ngModel. */
@Component({
    template: `<mc-checkbox [required]="isRequired" [(ngModel)]="isGood">Be good</mc-checkbox>`
})
class CheckboxWithNgModel {
    isGood: boolean = false;
    isRequired: boolean = true;
}

/** Simple test component with multiple checkboxes. */
@Component(({
    template: `
    <mc-checkbox>Option 1</mc-checkbox>
    <mc-checkbox>Option 2</mc-checkbox>
  `
}))
class MultipleCheckboxes {
}


/** Simple test component with tabIndex */
@Component({
    template: `
    <mc-checkbox
        [tabIndex]="customTabIndex"
        [disabled]="isDisabled">
    </mc-checkbox>`
})
class CheckboxWithTabIndex {
    customTabIndex: number = 7;
    isDisabled: boolean = false;
}


/** Simple test component that accesses McCheckbox using ViewChild. */
@Component({
    template: `
    <mc-checkbox></mc-checkbox>`
})
class CheckboxUsingViewChild {
    @ViewChild(McCheckbox, {static: false}) checkbox;

    set isDisabled(value: boolean) {
        this.checkbox.disabled = value;
    }
}

/** Simple test component with an aria-label set. */
@Component({
    template: `<mc-checkbox aria-label="Super effective"></mc-checkbox>`
})
class CheckboxWithAriaLabel {
}

/** Simple test component with an aria-label set. */
@Component({
    template: `<mc-checkbox aria-labelledby="some-id"></mc-checkbox>`
})
class CheckboxWithAriaLabelledby {
}

/** Simple test component with name attribute */
@Component({
    template: `<mc-checkbox name="test-name"></mc-checkbox>`
})
class CheckboxWithNameAttribute {
}

/** Simple test component with change event */
@Component({
    template: `<mc-checkbox (change)="lastEvent = $event"></mc-checkbox>`
})
class CheckboxWithChangeEvent {
    lastEvent: McCheckboxChange;
}

/** Test component with reactive forms */
@Component({
    template: `<mc-checkbox [formControl]="formControl"></mc-checkbox>`
})
class CheckboxWithFormControl {
    formControl = new FormControl();
}

/** Test component without label */
@Component({
    template: `<mc-checkbox>{{ label }}</mc-checkbox>`
})
class CheckboxWithoutLabel {
    label: string;
}

