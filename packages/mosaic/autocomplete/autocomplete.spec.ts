// tslint:disable:no-magic-numbers
// tslint:disable:mocha-no-side-effect-code
// tslint:disable:max-func-body-length
// tslint:disable:no-inferred-empty-object-type
// tslint:disable:chai-vague-errors

// TODO: fixed linters
// tslint:disable
import { Directionality } from '@angular/cdk/bidi';
import { Overlay, OverlayContainer } from '@angular/cdk/overlay';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import {
    ChangeDetectionStrategy,
    Component,
    NgZone,
    OnDestroy,
    OnInit,
    Provider,
    QueryList,
    ViewChild,
    ViewChildren,
    Type
} from '@angular/core';
import {
    waitForAsync,
    ComponentFixture,
    fakeAsync,
    flush,
    inject,
    TestBed,
    tick
} from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DOWN_ARROW, ENTER, ESCAPE, SPACE, TAB, UP_ARROW } from '@ptsecurity/cdk/keycodes';
import {
    createKeyboardEvent,
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    MockNgZone,
    typeInElement,
    dispatchEvent
} from '@ptsecurity/cdk/testing';
import { McOption, McOptionSelectionChange } from '@ptsecurity/mosaic/core';
import { McFormField, McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { Observable, Subject, Subscription, EMPTY } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { McInputModule } from '../input/index';

import {
    getMcAutocompleteMissingPanelError,
    MC_AUTOCOMPLETE_DEFAULT_OPTIONS,
    MC_AUTOCOMPLETE_SCROLL_STRATEGY,
    McAutocomplete,
    McAutocompleteModule,
    McAutocompleteSelectedEvent,
    McAutocompleteTrigger,
    McAutocompleteOrigin
} from './index';


describe('McAutocomplete', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let zone: MockNgZone;

    // Creates a test component fixture.
    function createComponent<T>(component: Type<T>, providers: Provider[] = []) {
        TestBed.configureTestingModule({
            imports: [
                McAutocompleteModule,
                McFormFieldModule,
                McInputModule,
                FormsModule,
                ReactiveFormsModule,
                NoopAnimationsModule
            ],
            declarations: [component],
            providers: [
                { provide: NgZone, useFactory: () => zone = new MockNgZone() },
                { provide: MC_AUTOCOMPLETE_DEFAULT_OPTIONS, useFactory: () => ({ autoActiveFirstOption: false }) },
                ...providers
            ]
        });

        TestBed.compileComponents();

        inject([OverlayContainer], (oc: OverlayContainer) => {
            overlayContainer = oc;
            overlayContainerElement = oc.getContainerElement();
        })();

        return TestBed.createComponent<T>(component);
    }

    afterEach(inject([OverlayContainer], (currentOverlayContainer: OverlayContainer) => {
        // Since we're resetting the testing module in some of the tests,
        // we can potentially have multiple overlay containers.
        currentOverlayContainer.ngOnDestroy();
        overlayContainer.ngOnDestroy();
    }));

    describe('panel toggling', () => {
        let fixture: ComponentFixture<SimpleAutocomplete>;
        let input: HTMLInputElement;

        beforeEach(() => {
            fixture = createComponent(SimpleAutocomplete);
            fixture.detectChanges();
            input = fixture.debugElement.query(By.css('input')).nativeElement;
        });

        it('should open the panel when the input is focused', () => {
            expect(fixture.componentInstance.trigger.panelOpen)
                .toBe(false, `Expected panel state to start out closed.`);

            dispatchFakeEvent(input, 'focusin');
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger.panelOpen)
                .toBe(true, `Expected panel state to read open when input is focused.`);
            expect(overlayContainerElement.textContent)
                .toContain('Alabama', `Expected panel to display when input is focused.`);
            expect(overlayContainerElement.textContent)
                .toContain('California', `Expected panel to display when input is focused.`);
        });

        it('should not open the panel on focus if the input is readonly', fakeAsync(() => {
            const trigger = fixture.componentInstance.trigger;
            input.readOnly = true;
            fixture.detectChanges();

            expect(trigger.panelOpen).toBe(false, 'Expected panel state to start out closed.');
            dispatchFakeEvent(input, 'focusin');
            flush();

            fixture.detectChanges();
            expect(trigger.panelOpen).toBe(false, 'Expected panel to stay closed.');
        }));

        it('should not open using the arrow keys when the input is readonly', fakeAsync(() => {
            const trigger = fixture.componentInstance.trigger;
            input.readOnly = true;
            fixture.detectChanges();

            expect(trigger.panelOpen).toBe(false, 'Expected panel state to start out closed.');
            dispatchKeyboardEvent(input, 'keydown', DOWN_ARROW);
            flush();

            fixture.detectChanges();
            expect(trigger.panelOpen).toBe(false, 'Expected panel to stay closed.');
        }));

        it('should open the panel programmatically', () => {
            expect(fixture.componentInstance.trigger.panelOpen)
                .toBe(false, `Expected panel state to start out closed.`);

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger.panelOpen)
                .toBe(true, `Expected panel state to read open when opened programmatically.`);
            expect(overlayContainerElement.textContent)
                .toContain('Alabama', `Expected panel to display when opened programmatically.`);
            expect(overlayContainerElement.textContent)
                .toContain('California', `Expected panel to display when opened programmatically.`);
        });

        it('should show the panel when the first open is after the initial zone stabilization',
            waitForAsync(() => {
                // Note that we're running outside the Angular zone, in order to be able
                // to test properly without the subscription from `_subscribeToClosingActions`
                // giving us a false positive.
                fixture.ngZone!.runOutsideAngular(() => {
                    fixture.componentInstance.trigger.openPanel();

                    Promise.resolve().then(() => {
                        expect(fixture.componentInstance.panel.showPanel)
                            .toBe(true, `Expected panel to be visible.`);
                    });
                });
            }));

        it('should close the panel when the user clicks away', fakeAsync(() => {
            dispatchFakeEvent(input, 'focusin');
            fixture.detectChanges();
            zone.simulateZoneExit();
            dispatchFakeEvent(document, 'click');

            expect(fixture.componentInstance.trigger.panelOpen)
                .toBe(false, `Expected clicking outside the panel to set its state to closed.`);
            expect(overlayContainerElement.textContent)
                .toEqual('', `Expected clicking outside the panel to close the panel.`);
        }));

        it('should close the panel when the user taps away on a touch device', fakeAsync(() => {
            dispatchFakeEvent(input, 'focus');
            fixture.detectChanges();
            flush();
            dispatchFakeEvent(document, 'touchend');

            expect(fixture.componentInstance.trigger.panelOpen)
                .toBe(false, `Expected tapping outside the panel to set its state to closed.`);
            expect(overlayContainerElement.textContent)
                .toEqual('', `Expected tapping outside the panel to close the panel.`);
        }));

        it('should close the panel when an option is clicked', fakeAsync(() => {
            dispatchFakeEvent(input, 'focusin');
            fixture.detectChanges();
            flush();
            zone.simulateZoneExit();

            const option = overlayContainerElement.querySelector('mc-option') as HTMLElement;
            option.click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.trigger.panelOpen)
                .toBe(false, `Expected clicking an option to set the panel state to closed.`);
            expect(overlayContainerElement.textContent)
                .toEqual('', `Expected clicking an option to close the panel.`);
        }));

        it('should close the panel when a newly created option is clicked', fakeAsync(() => {
            dispatchFakeEvent(input, 'focusin');
            fixture.detectChanges();
            zone.simulateZoneExit();

            // Filter down the option list to a subset of original options ('Alabama', 'California')
            typeInElement('al', input);
            fixture.detectChanges();
            tick();

            let options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');
            options[0].click();

            // Changing value from 'Alabama' to 'al' to re-populate the option list,
            // ensuring that 'California' is created new.
            dispatchFakeEvent(input, 'focusin');
            typeInElement('al', input);
            fixture.detectChanges();
            tick();

            options = overlayContainerElement.querySelectorAll('mc-option');
            options[1].click();
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger.panelOpen)
                .toBe(false, `Expected clicking a new option to set the panel state to closed.`);
            expect(overlayContainerElement.textContent)
                .toEqual('', `Expected clicking a new option to close the panel.`);
        }));

        it('should close the panel programmatically', () => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            fixture.componentInstance.trigger.closePanel();
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger.panelOpen)
                .toBe(false, `Expected closing programmatically to set the panel state to closed.`);
            expect(overlayContainerElement.textContent)
                .toEqual('', `Expected closing programmatically to close the panel.`);
        });

        it('should not throw when attempting to close the panel of a destroyed autocomplete', () => {
            const trigger = fixture.componentInstance.trigger;

            trigger.openPanel();
            fixture.detectChanges();
            fixture.destroy();

            expect(() => trigger.closePanel()).not.toThrow();
        });

        it('should hide the panel when the options list is empty', fakeAsync(() => {
            dispatchFakeEvent(input, 'focusin');
            fixture.detectChanges();

            const panel = overlayContainerElement.querySelector('.mc-autocomplete-panel') as HTMLElement;

            expect(panel.classList)
                .toContain('mc-autocomplete_visible', `Expected panel to start out visible.`);

            // Filter down the option list such that no options match the value
            typeInElement('af', input);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(panel.classList)
                .toContain('mc-autocomplete_hidden', `Expected panel to hide itself when empty.`);
        }));

        it('should not open the panel when the `input` event is invoked on a non-focused input', () => {
            expect(fixture.componentInstance.trigger.panelOpen)
                .toBe(false, `Expected panel state to start out closed.`);

            input.value = 'Alabama';
            dispatchFakeEvent(input, 'input');
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger.panelOpen)
                .toBe(false, `Expected panel state to stay closed.`);
        });

        it('should toggle the visibility when typing and closing the panel', fakeAsync(() => {
            fixture.componentInstance.trigger.openPanel();
            tick();
            fixture.detectChanges();

            expect(overlayContainerElement.querySelector('.mc-autocomplete-panel')!.classList)
                .toContain('mc-autocomplete_visible', 'Expected panel to be visible.');

            typeInElement('x', input);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(overlayContainerElement.querySelector('.mc-autocomplete-panel')!.classList)
                .toContain('mc-autocomplete_hidden', 'Expected panel to be hidden.');

            fixture.componentInstance.trigger.closePanel();
            fixture.detectChanges();

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            typeInElement('al', input);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(overlayContainerElement.querySelector('.mc-autocomplete-panel')!.classList)
                .toContain('mc-autocomplete_visible', 'Expected panel to be visible.');
        }));

        it('should provide the open state of the panel', fakeAsync(() => {
            expect(fixture.componentInstance.panel.isOpen).toBeFalsy(
                `Expected the panel to be unopened initially.`);

            dispatchFakeEvent(input, 'focusin');
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.panel.isOpen).toBeTruthy(
                `Expected the panel to be opened on focus.`);
        }));

        it('should emit an event when the panel is opened', () => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            expect(fixture.componentInstance.openedSpy).toHaveBeenCalled();
        });

        it('should not emit the `opened` event when no options are being shown', () => {
            fixture.componentInstance.filteredStates = fixture.componentInstance.states = [];
            fixture.detectChanges();

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            expect(fixture.componentInstance.openedSpy).not.toHaveBeenCalled();
        });

        it('should emit the `opened` event if the options come in after the panel is shown',
            fakeAsync(() => {
                fixture.componentInstance.filteredStates = fixture.componentInstance.states = [];
                fixture.detectChanges();

                fixture.componentInstance.trigger.openPanel();
                fixture.detectChanges();

                expect(fixture.componentInstance.openedSpy).not.toHaveBeenCalled();

                fixture.componentInstance.filteredStates = fixture.componentInstance.states =
                    [{name: 'California', code: 'CA'}];
                fixture.detectChanges();
                tick();
                fixture.detectChanges();

                expect(fixture.componentInstance.openedSpy).toHaveBeenCalled();
            }));

        it('should not emit the opened event multiple times while typing', fakeAsync(() => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            expect(fixture.componentInstance.openedSpy).toHaveBeenCalledTimes(1);

            typeInElement('Alabam', input);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(fixture.componentInstance.openedSpy).toHaveBeenCalledTimes(1);
        }));

        it('should emit an event when the panel is closed', () => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            fixture.componentInstance.trigger.closePanel();
            fixture.detectChanges();

            expect(fixture.componentInstance.closedSpy).toHaveBeenCalled();
        });

        it('should not emit the `closed` event when no options were shown', () => {
            fixture.componentInstance.filteredStates = fixture.componentInstance.states = [];
            fixture.detectChanges();

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            fixture.componentInstance.trigger.closePanel();
            fixture.detectChanges();

            expect(fixture.componentInstance.closedSpy).not.toHaveBeenCalled();
        });

        it('should not be able to open the panel if the autocomplete is disabled', () => {
            expect(fixture.componentInstance.trigger.panelOpen)
                .toBe(false, `Expected panel state to start out closed.`);

            fixture.componentInstance.autocompleteDisabled = true;
            fixture.detectChanges();

            dispatchFakeEvent(input, 'focusin');
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger.panelOpen)
                .toBe(false, `Expected panel to remain closed.`);
        });

        it('should continue to update the model if the autocomplete is disabled', () => {
            fixture.componentInstance.autocompleteDisabled = true;
            fixture.detectChanges();

            typeInElement('hello', input);
            fixture.detectChanges();

            expect(fixture.componentInstance.stateCtrl.value).toBe('hello');
        });

        xit('should set aria-haspopup depending on whether the autocomplete is disabled', () => {
            expect(input.getAttribute('aria-haspopup')).toBe('true');

            fixture.componentInstance.autocompleteDisabled = true;
            fixture.detectChanges();

            expect(input.getAttribute('aria-haspopup')).toBe('false');
        });

    });

    it('should have the correct text direction in RTL', () => {
        const rtlFixture = createComponent(SimpleAutocomplete, [
            { provide: Directionality, useFactory: () => ({ value: 'rtl', change: EMPTY }) }
        ]);

        rtlFixture.detectChanges();
        rtlFixture.componentInstance.trigger.openPanel();
        rtlFixture.detectChanges();

        const boundingBox =
            overlayContainerElement.querySelector('.cdk-overlay-connected-position-bounding-box')!;
        expect(boundingBox.getAttribute('dir')).toEqual('rtl');
    });

    it('should update the panel direction if it changes for the trigger', () => {
        const dirProvider = { value: 'rtl', change: EMPTY };
        const rtlFixture = createComponent(SimpleAutocomplete, [
            { provide: Directionality, useFactory: () => dirProvider }
        ]);

        rtlFixture.detectChanges();
        rtlFixture.componentInstance.trigger.openPanel();
        rtlFixture.detectChanges();

        let boundingBox =
            overlayContainerElement.querySelector('.cdk-overlay-connected-position-bounding-box')!;
        expect(boundingBox.getAttribute('dir')).toEqual('rtl');

        rtlFixture.componentInstance.trigger.closePanel();
        rtlFixture.detectChanges();

        dirProvider.value = 'ltr';
        rtlFixture.componentInstance.trigger.openPanel();
        rtlFixture.detectChanges();

        boundingBox =
            overlayContainerElement.querySelector('.cdk-overlay-connected-position-bounding-box')!;
        expect(boundingBox.getAttribute('dir')).toEqual('ltr');
    });

    it('should be able to set a custom value for the `autocomplete` attribute', () => {
        const fixture = createComponent(AutocompleteWithNativeAutocompleteAttribute);
        const input = fixture.nativeElement.querySelector('input');

        fixture.detectChanges();

        expect(input.getAttribute('autocomplete')).toBe('changed');
    });

    it('should not throw when typing in an element with a null and disabled autocomplete', () => {
        const fixture = createComponent(InputWithoutAutocompleteAndDisabled);
        fixture.detectChanges();

        expect(() => {
            dispatchKeyboardEvent(fixture.nativeElement.querySelector('input'), 'keydown', SPACE);
            fixture.detectChanges();
        }).not.toThrow();
    });

    describe('forms integration', () => {
        let fixture: ComponentFixture<SimpleAutocomplete>;
        let input: HTMLInputElement;

        beforeEach(() => {
            fixture = createComponent(SimpleAutocomplete);
            fixture.detectChanges();

            input = fixture.debugElement.query(By.css('input')).nativeElement;
        });

        it('should update control value as user types with input value', () => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();

            typeInElement('a', input);
            fixture.detectChanges();

            expect(fixture.componentInstance.stateCtrl.value)
                .toEqual('a', 'Expected control value to be updated as user types.');

            typeInElement('al', input);
            fixture.detectChanges();

            expect(fixture.componentInstance.stateCtrl.value)
                .toEqual('al', 'Expected control value to be updated as user types.');
        });

        it('should update control value when autofilling', () => {
            // Simulate the browser autofilling the input by setting a value and
            // dispatching an `input` event while the input is out of focus.
            expect(document.activeElement).not.toBe(input, 'Expected input not to have focus.');
            input.value = 'Alabama';
            dispatchFakeEvent(input, 'input');
            fixture.detectChanges();

            expect(fixture.componentInstance.stateCtrl.value)
                .toBe('Alabama', 'Expected value to be propagated to the form control.');
        });

        it('should update control value when option is selected with option value', fakeAsync(() => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');
            options[1].click();
            fixture.detectChanges();

            expect(fixture.componentInstance.stateCtrl.value)
                .toEqual({ code: 'CA', name: 'California' },
                    'Expected control value to equal the selected option value.');
        }));

        it('should update the control back to a string if user types after an option is selected',
            fakeAsync(() => {
                fixture.componentInstance.trigger.openPanel();
                fixture.detectChanges();
                zone.simulateZoneExit();

                const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');
                options[1].click();
                fixture.detectChanges();

                typeInElement('Californi', input);
                fixture.detectChanges();
                tick();

                expect(fixture.componentInstance.stateCtrl.value)
                    .toEqual('Californi', 'Expected control value to revert back to string.');
            }));

        it('should fill the text field with display value when an option is selected', fakeAsync(() => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');
            options[1].click();
            fixture.detectChanges();

            expect(input.value)
                .toContain('California', `Expected text field to fill with selected value.`);
        }));

        it('should fill the text field with value if displayWith is not set', fakeAsync(() => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();

            fixture.componentInstance.panel.displayWith = null;
            fixture.componentInstance.options.toArray()[1].value = 'test value';
            fixture.detectChanges();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');
            options[1].click();

            fixture.detectChanges();
            expect(input.value)
                .toContain('test value', `Expected input to fall back to selected option's value.`);
        }));

        it('should fill the text field correctly if value is set to obj programmatically',
            fakeAsync(() => {
                fixture.componentInstance.stateCtrl.setValue({ code: 'AL', name: 'Alabama' });
                fixture.detectChanges();
                tick();
                fixture.detectChanges();

                expect(input.value)
                    .toContain('Alabama', `Expected input to fill with matching option's viewValue.`);
            }));

        it('should clear the text field if value is reset programmatically', fakeAsync(() => {
            typeInElement('Alabama', input);
            fixture.detectChanges();
            tick();

            fixture.componentInstance.stateCtrl.reset();
            tick();

            fixture.detectChanges();
            tick();

            expect(input.value).toEqual('', `Expected input value to be empty after reset.`);
        }));

        it('should disable input in view when disabled programmatically', () => {
            const formFieldElement = fixture.debugElement.query(By.css('.mc-form-field')).nativeElement;

            expect(input.disabled)
                .toBe(false, `Expected input to start out enabled in view.`);
            expect(formFieldElement.classList.contains('mc-disabled'))
                .toBe(false, `Expected input underline to start out with normal styles.`);

            fixture.componentInstance.stateCtrl.disable();
            fixture.detectChanges();

            expect(input.disabled)
                .toBe(true, `Expected input to be disabled in view when disabled programmatically.`);
            expect(formFieldElement.classList.contains('mc-disabled'))
                .toBe(true, `Expected input underline to display disabled styles.`);
        });

        it('should mark the autocomplete control as dirty as user types', () => {
            expect(fixture.componentInstance.stateCtrl.dirty)
                .toBe(false, `Expected control to start out pristine.`);

            typeInElement('a', input);
            fixture.detectChanges();

            expect(fixture.componentInstance.stateCtrl.dirty)
                .toBe(true, `Expected control to become dirty when the user types into the input.`);
        });

        it('should mark the autocomplete control as dirty when an option is selected', fakeAsync(() => {
            expect(fixture.componentInstance.stateCtrl.dirty)
                .toBe(false, `Expected control to start out pristine.`);

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');
            options[1].click();
            fixture.detectChanges();

            expect(fixture.componentInstance.stateCtrl.dirty)
                .toBe(true, `Expected control to become dirty when an option was selected.`);
        }));

        it('should not mark the control dirty when the value is set programmatically', () => {
            expect(fixture.componentInstance.stateCtrl.dirty)
                .toBe(false, `Expected control to start out pristine.`);

            fixture.componentInstance.stateCtrl.setValue('AL');
            fixture.detectChanges();

            expect(fixture.componentInstance.stateCtrl.dirty)
                .toBe(false, `Expected control to stay pristine if value is set programmatically.`);
        });

        it('should mark the autocomplete control as touched on blur', () => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            expect(fixture.componentInstance.stateCtrl.touched)
                .toBe(false, `Expected control to start out untouched.`);

            dispatchFakeEvent(input, 'blur');
            fixture.detectChanges();

            expect(fixture.componentInstance.stateCtrl.touched)
                .toBe(true, `Expected control to become touched on blur.`);
        });

        it('should disable the input when used with a value accessor and without `mcInput`', () => {
            overlayContainer.ngOnDestroy();
            fixture.destroy();
            TestBed.resetTestingModule();

            const plainFixture = createComponent(PlainAutocompleteInputWithFormControl);
            plainFixture.detectChanges();
            input = plainFixture.nativeElement.querySelector('input');

            expect(input.disabled).toBe(false);

            plainFixture.componentInstance.formControl.disable();
            plainFixture.detectChanges();

            expect(input.disabled).toBe(true);
        });

    });

    describe('keyboard events', () => {
        let fixture: ComponentFixture<SimpleAutocomplete>;
        let input: HTMLInputElement;
        let DOWN_ARROW_EVENT: KeyboardEvent;
        let UP_ARROW_EVENT: KeyboardEvent;
        let ENTER_EVENT: KeyboardEvent;

        beforeEach(fakeAsync(() => {
            fixture = createComponent(SimpleAutocomplete);
            fixture.detectChanges();

            input = fixture.debugElement.query(By.css('input')).nativeElement;
            DOWN_ARROW_EVENT = createKeyboardEvent('keydown', DOWN_ARROW);
            UP_ARROW_EVENT = createKeyboardEvent('keydown', UP_ARROW);
            ENTER_EVENT = createKeyboardEvent('keydown', ENTER);

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();
        }));

        it('should not focus the option when DOWN key is pressed', () => {
            spyOn(fixture.componentInstance.options.first, 'focus');

            fixture.componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
            expect(fixture.componentInstance.options.first.focus).not.toHaveBeenCalled();
        });

        it('should not close the panel when DOWN key is pressed', () => {
            fixture.componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);

            expect(fixture.componentInstance.trigger.panelOpen)
                .toBe(true, `Expected panel state to stay open when DOWN key is pressed.`);
            expect(overlayContainerElement.textContent)
                .toContain('Alabama', `Expected panel to keep displaying when DOWN key is pressed.`);
            expect(overlayContainerElement.textContent)
                .toContain('California', `Expected panel to keep displaying when DOWN key is pressed.`);
        });

        it('should set the active item to the first option when DOWN key is pressed', () => {
            const componentInstance = fixture.componentInstance;
            const optionEls: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');

            expect(componentInstance.trigger.panelOpen)
                .toBe(true, 'Expected first down press to open the pane.');

            componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
            fixture.detectChanges();

            expect(componentInstance.trigger.activeOption === componentInstance.options.first)
                .toBe(true, 'Expected first option to be active.');
            expect(optionEls[0].classList).toContain('mc-active');
            expect(optionEls[1].classList).not.toContain('mc-active');

            componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
            fixture.detectChanges();

            expect(componentInstance.trigger.activeOption === componentInstance.options.toArray()[1])
                .toBe(true, 'Expected second option to be active.');
            expect(optionEls[0].classList).not.toContain('mc-active');
            expect(optionEls[1].classList).toContain('mc-active');
        });

        it('should not set the active item to the last option when UP key is pressed', () => {
            const componentInstance = fixture.componentInstance;
            const optionEls: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');

            expect(componentInstance.trigger.panelOpen)
                .toBe(true, 'Expected first up press to open the pane.');

            componentInstance.trigger.handleKeydown(UP_ARROW_EVENT);
            fixture.detectChanges();

            expect(componentInstance.trigger.activeOption !== componentInstance.options.first)
                .toBe(true, 'Expected last option to be active.');
            expect(optionEls[0].classList).not.toContain('mc-active');

            componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
            fixture.detectChanges();

            expect(componentInstance.trigger.activeOption === componentInstance.options.first)
                .toBe(true, 'Expected first option to be active.');
            expect(optionEls[0].classList).toContain('mc-active');
        });

        it('should set the active item properly after filtering', fakeAsync(() => {
            const componentInstance = fixture.componentInstance;

            componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
            tick();
            fixture.detectChanges();
        }));

        it('should set the active item properly after filtering', () => {
            const componentInstance = fixture.componentInstance;

            typeInElement('o', input);
            fixture.detectChanges();

            componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
            fixture.detectChanges();

            const optionEls: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');

            expect(componentInstance.trigger.activeOption === componentInstance.options.first)
                .toBe(true, 'Expected first option to be active.');
            expect(optionEls[0].classList).toContain('mc-active');
            expect(optionEls[1].classList).not.toContain('mc-active');
        });

        it('should fill the text field when an option is selected with ENTER', fakeAsync(() => {
            fixture.componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
            flush();
            fixture.detectChanges();

            fixture.componentInstance.trigger.handleKeydown(ENTER_EVENT);
            fixture.detectChanges();
            expect(input.value)
                .toContain('Alabama', `Expected text field to fill with selected value on ENTER.`);
        }));

        it('should prevent the default enter key action', fakeAsync(() => {
            fixture.componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
            flush();

            fixture.componentInstance.trigger.handleKeydown(ENTER_EVENT);

            expect(ENTER_EVENT.defaultPrevented)
                .toBe(true, 'Expected the default action to have been prevented.');
        }));

        it('should not prevent the default enter action for a closed panel after a user action', () => {
            fixture.componentInstance.trigger.handleKeydown(UP_ARROW_EVENT);
            fixture.detectChanges();

            fixture.componentInstance.trigger.closePanel();
            fixture.detectChanges();
            fixture.componentInstance.trigger.handleKeydown(ENTER_EVENT);

            expect(ENTER_EVENT.defaultPrevented).toBe(false, 'Default action should not be prevented.');
        });

        it('should fill the text field, not select an option, when SPACE is entered', () => {
            typeInElement('New', input);
            fixture.detectChanges();

            const SPACE_EVENT = createKeyboardEvent('keydown', SPACE);
            fixture.componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
            fixture.detectChanges();

            fixture.componentInstance.trigger.handleKeydown(SPACE_EVENT);
            fixture.detectChanges();

            expect(input.value).not.toContain('New York', `Expected option not to be selected on SPACE.`);
        });

        it('should mark the control dirty when selecting an option from the keyboard', fakeAsync(() => {
            expect(fixture.componentInstance.stateCtrl.dirty)
                .toBe(false, `Expected control to start out pristine.`);

            fixture.componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
            flush();
            fixture.componentInstance.trigger.handleKeydown(ENTER_EVENT);
            fixture.detectChanges();

            expect(fixture.componentInstance.stateCtrl.dirty)
                .toBe(true, `Expected control to become dirty when option was selected by ENTER.`);
        }));

        it('should open the panel again when typing after making a selection', fakeAsync(() => {
            fixture.componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
            flush();
            fixture.componentInstance.trigger.handleKeydown(ENTER_EVENT);
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger.panelOpen)
                .toBe(false, `Expected panel state to read closed after ENTER key.`);
            expect(overlayContainerElement.textContent)
                .toEqual('', `Expected panel to close after ENTER key.`);

            dispatchFakeEvent(input, 'focusin');
            typeInElement('Alabama', input);
            fixture.detectChanges();
            tick();

            expect(fixture.componentInstance.trigger.panelOpen)
                .toBe(true, `Expected panel state to read open when typing in input.`);
            expect(overlayContainerElement.textContent)
                .toContain('Alabama', `Expected panel to display when typing in input.`);
        }));

        it('should not open the panel if the `input` event was dispatched with changing the value',
            fakeAsync(() => {
                const trigger = fixture.componentInstance.trigger;

                dispatchFakeEvent(input, 'focusin');
                typeInElement('A', input);
                fixture.detectChanges();
                tick();

                expect(trigger.panelOpen).toBe(true, 'Expected panel to be open.');

                trigger.closePanel();
                fixture.detectChanges();

                expect(trigger.panelOpen).toBe(false, 'Expected panel to be closed.');

                // Dispatch the event without actually changing the value
                // to simulate what happen in some cases on IE.
                dispatchFakeEvent(input, 'input');
                fixture.detectChanges();
                tick();

                expect(trigger.panelOpen).toBe(false, 'Expected panel to stay closed.');
            }));

        it('should scroll to active options below the fold', () => {
            const trigger = fixture.componentInstance.trigger;
            const scrollContainer = document.querySelector('.cdk-overlay-pane .mc-autocomplete-panel')!;

            trigger.handleKeydown(DOWN_ARROW_EVENT);
            fixture.detectChanges();
            expect(scrollContainer.scrollTop).toEqual(0, `Expected panel not to scroll.`);

            // These down arrows will set the 6th option active, below the fold.
            [1, 2, 3, 4, 5, 6, 7, 8].forEach(() => trigger.handleKeydown(DOWN_ARROW_EVENT));

            // Expect option bottom minus the panel height (288 - 256 = 32)
            expect(scrollContainer.scrollTop)
                .toEqual(32, `Expected panel to reveal the sixth option.`);
        });

        it('should not scroll to active options on UP arrow', () => {
            const scrollContainer = document.querySelector('.cdk-overlay-pane .mc-autocomplete-panel')!;

            fixture.componentInstance.trigger.handleKeydown(UP_ARROW_EVENT);
            fixture.detectChanges();

            expect(scrollContainer.scrollTop).toEqual(0, `Expected panel to reveal last option.`);
        });

        it('should not scroll to active options that are fully in the panel', () => {
            const trigger = fixture.componentInstance.trigger;
            const scrollContainer = document.querySelector('.cdk-overlay-pane .mc-autocomplete-panel')!;

            trigger.handleKeydown(DOWN_ARROW_EVENT);
            fixture.detectChanges();

            expect(scrollContainer.scrollTop).toEqual(0, `Expected panel not to scroll.`);

            // These down arrows will set the 6th option active, below the fold.
            [1, 2, 3, 4, 5, 6, 7, 8].forEach(() => trigger.handleKeydown(DOWN_ARROW_EVENT));

            // Expect option bottom minus the panel height (288 - 256 = 32)
            expect(scrollContainer.scrollTop)
                .toEqual(32, `Expected panel to reveal the sixth option.`);

            // These up arrows will set the 2nd option active
            [4, 3, 2, 1].forEach(() => trigger.handleKeydown(UP_ARROW_EVENT));

            // Expect no scrolling to have occurred. Still showing bottom of 6th option.
            expect(scrollContainer.scrollTop)
                .toEqual(32, `Expected panel not to scroll up since sixth option still fully visible.`);
        });

        it('should scroll to active options that are above the panel', () => {
            const trigger = fixture.componentInstance.trigger;
            const scrollContainer = document.querySelector('.cdk-overlay-pane .mc-autocomplete-panel')!;

            trigger.handleKeydown(DOWN_ARROW_EVENT);
            fixture.detectChanges();

            expect(scrollContainer.scrollTop).toEqual(0, `Expected panel not to scroll.`);

            // These down arrows will set the 7th option active, below the fold.
            [1, 2, 3, 4, 5, 6, 7, 8].forEach(() => trigger.handleKeydown(DOWN_ARROW_EVENT));

            // These up arrows will set the 2nd option active
            [7, 6, 5, 4, 3, 2, 1].forEach(() => trigger.handleKeydown(UP_ARROW_EVENT));

            // Expect to show the top of the 2nd option at the top of the panel
            expect(scrollContainer.scrollTop)
                .toEqual(32, `Expected panel to scroll up when option is above panel.`);
        });

        it('should close the panel when pressing escape', fakeAsync(() => {
            const trigger = fixture.componentInstance.trigger;

            input.focus();
            flush();
            fixture.detectChanges();

            expect(document.activeElement).toBe(input, 'Expected input to be focused.');
            expect(trigger.panelOpen).toBe(true, 'Expected panel to be open.');

            dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
            fixture.detectChanges();
            flush();

            expect(document.activeElement).toBe(input, 'Expected input to continue to be focused.');
            expect(trigger.panelOpen).toBe(false, 'Expected panel to be closed.');
        }));

        it('should prevent the default action when pressing escape', fakeAsync(() => {
            const escapeEvent = dispatchKeyboardEvent(input, 'keydown', ESCAPE);
            fixture.detectChanges();
            flush();

            expect(escapeEvent.defaultPrevented).toBe(true);
        }));

        it('should close the panel when pressing ALT + UP_ARROW', fakeAsync(() => {
            const trigger = fixture.componentInstance.trigger;
            const upArrowEvent = createKeyboardEvent('keydown', UP_ARROW);
            Object.defineProperty(upArrowEvent, 'altKey', { get: () => true });

            input.focus();
            flush();
            fixture.detectChanges();

            expect(document.activeElement).toBe(input, 'Expected input to be focused.');
            expect(trigger.panelOpen).toBe(true, 'Expected panel to be open.');

            dispatchEvent(document.body, upArrowEvent);
            fixture.detectChanges();
            flush();

            expect(document.activeElement).toBe(input, 'Expected input to continue to be focused.');
            expect(trigger.panelOpen).toBe(false, 'Expected panel to be closed.');
        }));

        it('should close the panel when tabbing away from a trigger without results', fakeAsync(() => {
            fixture.componentInstance.states = [];
            fixture.componentInstance.filteredStates = [];
            fixture.detectChanges();
            input.focus();
            flush();

            expect(overlayContainerElement.querySelector('.mc-autocomplete-panel'))
                .toBeTruthy('Expected panel to be rendered.');

            dispatchKeyboardEvent(input, 'keydown', TAB);
            fixture.detectChanges();
            flush();

            expect(overlayContainerElement.querySelector('.mc-autocomplete-panel'))
                .toBeFalsy('Expected panel to be removed.');
        }));

        it('should reset the active option when closing with the escape key', fakeAsync(() => {
            const trigger = fixture.componentInstance.trigger;

            trigger.openPanel();
            fixture.detectChanges();
            flush();

            expect(trigger.panelOpen).toBe(true, 'Expected panel to be open.');
            expect(!!trigger.activeOption).toBe(false, 'Expected no active option.');

            // Press the down arrow a few times.
            [1, 2, 3].forEach(() => {
                trigger.handleKeydown(DOWN_ARROW_EVENT);
                tick();
                fixture.detectChanges();
            });

            // Note that this casts to a boolean, in order to prevent Jasmine
            // from crashing when trying to stringify the option if the test fails.
            expect(!!trigger.activeOption).toBe(true, 'Expected to find an active option.');

            dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
            flush();

            expect(!!trigger.activeOption).toBe(false, 'Expected no active options.');
        }));

        it('should reset the active option when closing by selecting with enter', fakeAsync(() => {
            const trigger = fixture.componentInstance.trigger;

            trigger.openPanel();
            fixture.detectChanges();
            tick();

            expect(trigger.panelOpen).toBe(true, 'Expected panel to be open.');
            expect(!!trigger.activeOption).toBe(false, 'Expected no active option.');

            // Press the down arrow a few times.
            [1, 2, 3].forEach(() => {
                trigger.handleKeydown(DOWN_ARROW_EVENT);
                tick();
                fixture.detectChanges();
            });

            // Note that this casts to a boolean, in order to prevent Jasmine
            // from crashing when trying to stringify the option if the test fails.
            expect(!!trigger.activeOption).toBe(true, 'Expected to find an active option.');

            trigger.handleKeydown(ENTER_EVENT);
            tick();

            expect(!!trigger.activeOption).toBe(false, 'Expected no active options.');
        }));

    });

    xdescribe('option groups', () => {
        let fixture: ComponentFixture<AutocompleteWithGroups>;
        let DOWN_ARROW_EVENT: KeyboardEvent;
        let UP_ARROW_EVENT: KeyboardEvent;
        let container: HTMLElement;

        beforeEach(fakeAsync(() => {
            fixture = createComponent(AutocompleteWithGroups);
            fixture.detectChanges();

            DOWN_ARROW_EVENT = createKeyboardEvent('keydown', DOWN_ARROW);
            UP_ARROW_EVENT = createKeyboardEvent('keydown', UP_ARROW);

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            container = document.querySelector('.mc-autocomplete-panel') as HTMLElement;
        }));

        it('should scroll to active options below the fold', fakeAsync(() => {
            fixture.componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
            tick();
            fixture.detectChanges();
            expect(container.scrollTop).toBe(0, 'Expected the panel not to scroll.');

            // Press the down arrow five times.
            [1, 2, 3, 4, 5].forEach(() => {
                fixture.componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
                tick();
            });

            // <option bottom> - <panel height> + <2x group labels> = 128
            // 288 - 256 + 96 = 128
            expect(container.scrollTop)
                .toBe(128, 'Expected panel to reveal the sixth option.');
        }));

        it('should scroll to active options on UP arrow', fakeAsync(() => {
            fixture.componentInstance.trigger.handleKeydown(UP_ARROW_EVENT);
            tick();
            fixture.detectChanges();

            // <option bottom> - <panel height> + <3x group label> = 464
            // 576 - 256 + 144 = 464
            expect(container.scrollTop).toBe(464, 'Expected panel to reveal last option.');
        }));

        it('should scroll to active options that are above the panel', fakeAsync(() => {
            fixture.componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
            tick();
            fixture.detectChanges();
            expect(container.scrollTop).toBe(0, 'Expected panel not to scroll.');

            // These down arrows will set the 7th option active, below the fold.
            [1, 2, 3, 4, 5, 6].forEach(() => {
                fixture.componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
                tick();
            });

            // These up arrows will set the 2nd option active
            [5, 4, 3, 2, 1].forEach(() => {
                fixture.componentInstance.trigger.handleKeydown(UP_ARROW_EVENT);
                tick();
            });

            // Expect to show the top of the 2nd option at the top of the panel.
            // It is offset by 48, because there's a group label above it.
            expect(container.scrollTop)
                .toBe(96, 'Expected panel to scroll up when option is above panel.');
        }));
    });

    xdescribe('aria', () => {
        let fixture: ComponentFixture<SimpleAutocomplete>;
        let input: HTMLInputElement;

        beforeEach(() => {
            fixture = createComponent(SimpleAutocomplete);
            fixture.detectChanges();

            input = fixture.debugElement.query(By.css('input')).nativeElement;
        });

        it('should set role of input to combobox', () => {
            expect(input.getAttribute('role'))
                .toEqual('combobox', 'Expected role of input to be combobox.');
        });

        it('should set role of autocomplete panel to listbox', () => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            const panel = fixture.debugElement.query(By.css('.mc-autocomplete-panel')).nativeElement;

            expect(panel.getAttribute('role'))
                .toEqual('listbox', 'Expected role of the panel to be listbox.');
        });

        it('should set aria-autocomplete to list', () => {
            expect(input.getAttribute('aria-autocomplete'))
                .toEqual('list', 'Expected aria-autocomplete attribute to equal list.');
        });

        it('should set aria-activedescendant based on the active option', fakeAsync(() => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            expect(input.hasAttribute('aria-activedescendant'))
                .toBe(false, 'Expected aria-activedescendant to be absent if no active item.');

            const DOWN_ARROW_EVENT = createKeyboardEvent('keydown', DOWN_ARROW);

            fixture.componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
            tick();
            fixture.detectChanges();

            expect(input.getAttribute('aria-activedescendant'))
                .toEqual(fixture.componentInstance.options.first.id,
                    'Expected aria-activedescendant to match the active item after 1 down arrow.');

            fixture.componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
            tick();
            fixture.detectChanges();

            expect(input.getAttribute('aria-activedescendant'))
                .toEqual(fixture.componentInstance.options.toArray()[1].id,
                    'Expected aria-activedescendant to match the active item after 2 down arrows.');
        }));

        it('should set aria-expanded based on whether the panel is open', () => {
            expect(input.getAttribute('aria-expanded'))
                .toBe('false', 'Expected aria-expanded to be false while panel is closed.');

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            expect(input.getAttribute('aria-expanded'))
                .toBe('true', 'Expected aria-expanded to be true while panel is open.');

            fixture.componentInstance.trigger.closePanel();
            fixture.detectChanges();

            expect(input.getAttribute('aria-expanded'))
                .toBe('false', 'Expected aria-expanded to be false when panel closes again.');
        });

        it('should set aria-expanded properly when the panel is hidden', fakeAsync(() => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            expect(input.getAttribute('aria-expanded'))
                .toBe('true', 'Expected aria-expanded to be true while panel is open.');

            typeInElement('zz', input);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(input.getAttribute('aria-expanded'))
                .toBe('false', 'Expected aria-expanded to be false when panel hides itself.');
        }));

        it('should set aria-owns based on the attached autocomplete', () => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            const panel = fixture.debugElement.query(By.css('.mc-autocomplete-panel')).nativeElement;

            expect(input.getAttribute('aria-owns'))
                .toBe(panel.getAttribute('id'), 'Expected aria-owns to match attached autocomplete.');
        });

        it('should not set aria-owns while the autocomplete is closed', () => {
            expect(input.getAttribute('aria-owns')).toBeFalsy();

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            expect(input.getAttribute('aria-owns')).toBeTruthy();
        });

        it('should restore focus to the input when clicking to select a value', fakeAsync(() => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();

            const option = overlayContainerElement.querySelector('mc-option') as HTMLElement;

            // Focus the option manually since the synthetic click may not do it.
            option.focus();
            option.click();
            fixture.detectChanges();

            expect(document.activeElement).toBe(input, 'Expected focus to be restored to the input.');
        }));

        it('should remove autocomplete-specific aria attributes when autocomplete is disabled', () => {
            fixture.componentInstance.autocompleteDisabled = true;
            fixture.detectChanges();

            expect(input.getAttribute('role')).toBeFalsy();
            expect(input.getAttribute('aria-autocomplete')).toBeFalsy();
            expect(input.getAttribute('aria-expanded')).toBeFalsy();
            expect(input.getAttribute('aria-owns')).toBeFalsy();
        });

    });

    xdescribe('Fallback positions', () => {
        it('should use below positioning by default', fakeAsync(() => {
            const fixture = createComponent(SimpleAutocomplete);
            fixture.detectChanges();
            const inputReference = fixture.debugElement.query(By.css('.mc-form-field-flex')).nativeElement;

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();
            fixture.detectChanges();

            const inputBottom = inputReference.getBoundingClientRect().bottom;
            const panel = overlayContainerElement.querySelector('.mc-autocomplete-panel')!;
            const panelTop = panel.getBoundingClientRect().top;

            expect(Math.floor(inputBottom))
                .toEqual(Math.floor(panelTop), `Expected panel top to match input bottom by default.`);
            expect(panel.classList).not.toContain('mc-autocomplete-panel-above');
        }));

        it('should reposition the panel on scroll', () => {
            const scrolledSubject = new Subject();
            const spacer = document.createElement('div');
            const fixture = createComponent(SimpleAutocomplete, [{
                provide: ScrollDispatcher,
                useValue: { scrolled: () => scrolledSubject.asObservable() }
            }]);

            fixture.detectChanges();

            const inputReference = fixture.debugElement.query(By.css('.mc-form-field-flex')).nativeElement;
            spacer.style.height = '1000px';
            document.body.appendChild(spacer);

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            window.scroll(0, 100);
            scrolledSubject.next();
            fixture.detectChanges();

            const inputBottom = inputReference.getBoundingClientRect().bottom;
            const panel = overlayContainerElement.querySelector('.cdk-overlay-pane')!;
            const panelTop = panel.getBoundingClientRect().top;

            expect(Math.floor(inputBottom)).toEqual(Math.floor(panelTop),
                'Expected panel top to match input bottom after scrolling.');

            document.body.removeChild(spacer);
            window.scroll(0, 0);
        });

        it('should fall back to above position if panel cannot fit below', fakeAsync(() => {
            const fixture = createComponent(SimpleAutocomplete);
            fixture.detectChanges();
            const inputReference = fixture.debugElement.query(By.css('.mc-form-field-flex')).nativeElement;

            // Push the autocomplete trigger down so it won't have room to open "below"
            inputReference.style.bottom = '0';
            inputReference.style.position = 'fixed';

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();
            fixture.detectChanges();

            const inputTop = inputReference.getBoundingClientRect().top;
            const panel = overlayContainerElement.querySelector('.cdk-overlay-pane')!;
            const panelBottom = panel.getBoundingClientRect().bottom;

            expect(Math.floor(inputTop))
                .toEqual(Math.floor(panelBottom), `Expected panel to fall back to above position.`);

            expect(panel.classList).toContain('mc-autocomplete-panel-above');
        }));

        it('should allow the panel to expand when the number of results increases', fakeAsync(() => {
            const fixture = createComponent(SimpleAutocomplete);
            fixture.detectChanges();

            const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
            const inputReference = fixture.debugElement.query(By.css('.mc-form-field-flex')).nativeElement;

            // Push the element down so it has a little bit of space, but not enough to render.
            inputReference.style.bottom = '10px';
            inputReference.style.position = 'fixed';

            // Type enough to only show one option.
            typeInElement('California', inputEl);
            fixture.detectChanges();
            tick();

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();

            let panel = overlayContainerElement.querySelector('.cdk-overlay-pane')!;
            const initialPanelHeight = panel.getBoundingClientRect().height;

            fixture.componentInstance.trigger.closePanel();
            fixture.detectChanges();

            // Change the text so we get more than one result.
            typeInElement('C', inputEl);
            fixture.detectChanges();
            tick();

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();

            panel = overlayContainerElement.querySelector('.cdk-overlay-pane')!;

            expect(panel.getBoundingClientRect().height).toBeGreaterThan(initialPanelHeight);
        }));

        it('should align panel properly when filtering in "above" position', fakeAsync(() => {
            const fixture = createComponent(SimpleAutocomplete);
            fixture.detectChanges();

            const input = fixture.debugElement.query(By.css('input')).nativeElement;
            const inputReference = fixture.debugElement.query(By.css('.mc-form-field-flex')).nativeElement;

            // Push the autocomplete trigger down so it won't have room to open "below"
            inputReference.style.bottom = '0';
            inputReference.style.position = 'fixed';

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();

            typeInElement('f', input);
            fixture.detectChanges();
            tick();

            const inputTop = inputReference.getBoundingClientRect().top;
            const panel = overlayContainerElement.querySelector('.mc-autocomplete-panel')!;
            const panelBottom = panel.getBoundingClientRect().bottom;

            expect(Math.floor(inputTop))
                .toEqual(Math.floor(panelBottom), `Expected panel to stay aligned after filtering.`);
        }));

        it('should fall back to above position when requested if options are added while ' +
            'the panel is open', fakeAsync(() => {
            const fixture = createComponent(SimpleAutocomplete);
            fixture.componentInstance.states = fixture.componentInstance.states.slice(0, 1);
            fixture.componentInstance.filteredStates = fixture.componentInstance.states.slice();
            fixture.detectChanges();

            const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
            const inputReference = fixture.debugElement.query(By.css('.mc-form-field-flex')).nativeElement;

            // Push the element down so it has a little bit of space, but not enough to render.
            inputReference.style.bottom = '75px';
            inputReference.style.position = 'fixed';

            dispatchFakeEvent(inputEl, 'focusin');
            fixture.detectChanges();
            zone.simulateZoneExit();
            fixture.detectChanges();

            const panel = overlayContainerElement.querySelector('.mc-autocomplete-panel')!;
            let inputRect = inputReference.getBoundingClientRect();
            let panelRect = panel.getBoundingClientRect();

            expect(Math.floor(panelRect.top))
                .toBe(Math.floor(inputRect.bottom),
                    `Expected panel top to be below input before repositioning.`);

            for (let i = 0; i < 20; i++) {
                fixture.componentInstance.filteredStates.push({ code: 'FK', name: 'Fake State' });
                fixture.detectChanges();
            }

            // Request a position update now that there are too many suggestions to fit in the viewport.
            fixture.componentInstance.trigger.updatePosition();

            inputRect = inputReference.getBoundingClientRect();
            panelRect = panel.getBoundingClientRect();

            expect(Math.floor(panelRect.bottom))
                .toBe(Math.floor(inputRect.top),
                    `Expected panel to fall back to above position after repositioning.`);
            tick();
        }));

        it('should not throw if a panel reposition is requested while the panel is closed', () => {
            const fixture = createComponent(SimpleAutocomplete);
            fixture.detectChanges();

            expect(() => fixture.componentInstance.trigger.updatePosition()).not.toThrow();
        });
    });

    describe('Option selection', () => {
        let fixture: ComponentFixture<SimpleAutocomplete>;

        beforeEach(() => {
            fixture = createComponent(SimpleAutocomplete);
            fixture.detectChanges();
        });

        it('should deselect any other selected option', fakeAsync(() => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            let options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');
            options[0].click();
            fixture.detectChanges();
            zone.simulateZoneExit();
            fixture.detectChanges();

            const componentOptions = fixture.componentInstance.options.toArray();
            expect(componentOptions[0].selected)
                .toBe(true, `Clicked option should be selected.`);

            options = overlayContainerElement.querySelectorAll('mc-option');
            options[1].click();
            fixture.detectChanges();

            expect(componentOptions[0].selected)
                .toBe(false, `Previous option should not be selected.`);
            expect(componentOptions[1].selected)
                .toBe(true, `New Clicked option should be selected.`);
        }));

        it('should call deselect only on the previous selected option', fakeAsync(() => {
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            let options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');
            options[0].click();
            fixture.detectChanges();
            zone.simulateZoneExit();
            fixture.detectChanges();

            const componentOptions = fixture.componentInstance.options.toArray();
            componentOptions.forEach((option) => spyOn(option, 'deselect'));

            expect(componentOptions[0].selected)
                .toBe(true, `Clicked option should be selected.`);

            options = overlayContainerElement.querySelectorAll('mc-option');
            options[1].click();
            fixture.detectChanges();

            expect(componentOptions[0].deselect).toHaveBeenCalled();
            componentOptions.slice(1).forEach((option) => expect(option.deselect).not.toHaveBeenCalled());
        }));

        it('should be able to preselect the first option', fakeAsync(() => {
            fixture.componentInstance.trigger.autocomplete.autoActiveFirstOption = true;
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();
            fixture.detectChanges();

            expect(overlayContainerElement.querySelectorAll('mc-option')[0].classList)
                .toContain('mc-active', 'Expected first option to be highlighted.');
        }));

        it('should be able to configure preselecting the first option globally', fakeAsync(() => {
            overlayContainer.ngOnDestroy();
            fixture.destroy();
            TestBed.resetTestingModule();
            fixture = createComponent(SimpleAutocomplete, [
                { provide: MC_AUTOCOMPLETE_DEFAULT_OPTIONS, useValue: { autoActiveFirstOption: true } }
            ]);

            fixture.detectChanges();
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();
            fixture.detectChanges();

            expect(overlayContainerElement.querySelectorAll('mc-option')[0].classList)
                .toContain('mc-active', 'Expected first option to be highlighted.');
        }));

        it('should handle `optionSelections` being accessed too early', fakeAsync(() => {
            overlayContainer.ngOnDestroy();
            fixture.destroy();
            fixture = TestBed.createComponent(SimpleAutocomplete);

            const spy = jasmine.createSpy('option selection spy');
            let subscription: Subscription;

            expect(fixture.componentInstance.trigger.autocomplete).toBeFalsy();
            expect(() => {
                subscription = fixture.componentInstance.trigger.optionSelections.subscribe(spy);
            }).not.toThrow();

            fixture.detectChanges();
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();

            const option = overlayContainerElement.querySelector('mc-option') as HTMLElement;

            option.click();
            fixture.detectChanges();
            zone.simulateZoneExit();

            expect(spy).toHaveBeenCalledWith(jasmine.any(McOptionSelectionChange));
            // @ts-ignore
            subscription.unsubscribe();
        }));

        xit('should reposition the panel when the amount of options changes', fakeAsync(() => {
            const formField = fixture.debugElement.query(By.css('.mc-form-field')).nativeElement;
            const inputReference = formField.querySelector('.mc-form-field-flex');
            const input = inputReference.querySelector('input');

            formField.style.bottom = '100px';
            formField.style.position = 'fixed';

            typeInElement('Cali', input);
            fixture.detectChanges();
            tick();
            zone.simulateZoneExit();
            fixture.detectChanges();

            const inputBottom = inputReference.getBoundingClientRect().bottom;
            const panel = overlayContainerElement.querySelector('.mc-autocomplete-panel')!;
            const panelTop = panel.getBoundingClientRect().top;

            expect(Math.floor(inputBottom)).toBe(Math.floor(panelTop),
                `Expected panel top to match input bottom when there is only one option.`);

            typeInElement('', input);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            const inputTop = inputReference.getBoundingClientRect().top;
            const panelBottom = panel.getBoundingClientRect().bottom;

            expect(Math.floor(inputTop)).toBe(Math.floor(panelBottom),
                `Expected panel switch to the above position if the options no longer fit.`);
        }));

    });

    describe('panel closing', () => {
        let fixture: ComponentFixture<SimpleAutocomplete>;
        let input: HTMLInputElement;
        let trigger: McAutocompleteTrigger;
        let closingActionSpy: jasmine.Spy;
        let closingActionsSub: Subscription;

        beforeEach(fakeAsync(() => {
            fixture = createComponent(SimpleAutocomplete);
            fixture.detectChanges();

            input = fixture.debugElement.query(By.css('input')).nativeElement;

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            flush();

            trigger = fixture.componentInstance.trigger;
            closingActionSpy = jasmine.createSpy('closing action listener');
            closingActionsSub = trigger.panelClosingActions.subscribe(closingActionSpy);
        }));

        afterEach(() => {
            closingActionsSub.unsubscribe();
        });

        it('should emit panel close event when clicking away', () => {
            expect(closingActionSpy).not.toHaveBeenCalled();
            dispatchFakeEvent(document, 'click');
            expect(closingActionSpy).toHaveBeenCalledWith(null);
        });

        it('should emit panel close event when tabbing out', () => {
            const tabEvent = createKeyboardEvent('keydown', TAB);
            input.focus();

            expect(closingActionSpy).not.toHaveBeenCalled();
            trigger.handleKeydown(tabEvent);
            expect(closingActionSpy).toHaveBeenCalledWith(null);
        });

        it('should not emit when tabbing away from a closed panel', () => {
            const tabEvent = createKeyboardEvent('keydown', TAB);

            input.focus();
            zone.simulateZoneExit();

            trigger.handleKeydown(tabEvent);

            // Ensure that it emitted once while the panel was open.
            expect(closingActionSpy).toHaveBeenCalledTimes(1);

            trigger.handleKeydown(tabEvent);

            // Ensure that it didn't emit again when tabbing out again.
            expect(closingActionSpy).toHaveBeenCalledTimes(1);
        });

        it('should emit panel close event when selecting an option', () => {
            const option = overlayContainerElement.querySelector('mc-option') as HTMLElement;

            expect(closingActionSpy).not.toHaveBeenCalled();
            option.click();
            expect(closingActionSpy).toHaveBeenCalledWith(jasmine.any(McOptionSelectionChange));
        });

        it('should close the panel when pressing escape', () => {
            expect(closingActionSpy).not.toHaveBeenCalled();
            dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
            expect(closingActionSpy).toHaveBeenCalledWith(null);
        });
    });

    describe('without mcInput', () => {
        let fixture: ComponentFixture<AutocompleteWithNativeInput>;

        beforeEach(() => {
            fixture = createComponent(AutocompleteWithNativeInput);
            fixture.detectChanges();
        });

        it('should not throw when clicking outside', fakeAsync(() => {
            dispatchFakeEvent(fixture.debugElement.query(By.css('input')).nativeElement, 'focus');
            fixture.detectChanges();
            flush();

            expect(() => dispatchFakeEvent(document, 'click')).not.toThrow();
        }));
    });

    describe('misc', () => {

        it('should allow basic use without any forms directives', () => {
            expect(() => {
                const fixture = createComponent(AutocompleteWithoutForms);
                fixture.detectChanges();

                const input = fixture.debugElement.query(By.css('input')).nativeElement;
                typeInElement('d', input);
                fixture.detectChanges();

                const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');
                expect(options.length).toBe(1);
            }).not.toThrowError();
        });

        it('should display an empty input when the value is undefined with ngModel', () => {
            const fixture = createComponent(AutocompleteWithNgModel);
            fixture.detectChanges();

            expect(fixture.debugElement.query(By.css('input')).nativeElement.value).toBe('');
        });

        it('should display the number when the selected option is the number zero', fakeAsync(() => {
            const fixture = createComponent(AutocompleteWithNumbers);

            fixture.componentInstance.selectedNumber = 0;
            fixture.detectChanges();
            tick();

            expect(fixture.debugElement.query(By.css('input')).nativeElement.value).toBe('0');
        }));

        it('should work when input is wrapped in ngIf', () => {
            const fixture = createComponent(NgIfAutocomplete);
            fixture.detectChanges();

            dispatchFakeEvent(fixture.debugElement.query(By.css('input')).nativeElement, 'focusin');
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger.panelOpen)
                .toBe(true, `Expected panel state to read open when input is focused.`);
            expect(overlayContainerElement.textContent)
                .toContain('One', `Expected panel to display when input is focused.`);
            expect(overlayContainerElement.textContent)
                .toContain('Two', `Expected panel to display when input is focused.`);
        });

        it('should filter properly with ngIf after setting the active item', () => {
            const fixture = createComponent(NgIfAutocomplete);
            fixture.detectChanges();

            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();

            const DOWN_ARROW_EVENT = createKeyboardEvent('keydown', DOWN_ARROW);
            fixture.componentInstance.trigger.handleKeydown(DOWN_ARROW_EVENT);
            fixture.detectChanges();

            const input = fixture.debugElement.query(By.css('input')).nativeElement;
            typeInElement('o', input);
            fixture.detectChanges();

            expect(fixture.componentInstance.mcOptions.length).toBe(2);
        });

        it('should throw if the user attempts to open the panel too early', () => {
            const fixture = createComponent(AutocompleteWithoutPanel);
            fixture.detectChanges();

            expect(() => {
                fixture.componentInstance.trigger.openPanel();
            }).toThrow(getMcAutocompleteMissingPanelError());
        });

        it('should not throw on init, even if the panel is not defined', fakeAsync(() => {
            expect(() => {
                const fixture = createComponent(AutocompleteWithoutPanel);
                fixture.componentInstance.control.setValue('Something');
                fixture.detectChanges();
                tick();
            }).not.toThrow();
        }));

        xit('should hide the label with a preselected form control value ' +
            'and a disabled floating label', fakeAsync(() => {
            const fixture = createComponent(AutocompleteWithFormsAndNonfloatingLabel);

            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            const input = fixture.nativeElement.querySelector('input');
            const label = fixture.nativeElement.querySelector('.mc-form-field-label');

            expect(input.value).toBe('California');
            expect(label.classList).not.toContain('mc-form-field-empty');
        }));

        it('should transfer the mc-autocomplete classes to the panel element', fakeAsync(() => {
            const fixture = createComponent(SimpleAutocomplete);
            fixture.detectChanges();

            fixture.componentInstance.trigger.openPanel();
            tick();
            fixture.detectChanges();

            const autocomplete = fixture.debugElement.nativeElement.querySelector('mc-autocomplete');
            const panel = overlayContainerElement.querySelector('.mc-autocomplete-panel')!;

            expect(autocomplete.classList).not.toContain('class-one');
            expect(autocomplete.classList).not.toContain('class-two');

            expect(panel.classList).toContain('class-one');
            expect(panel.classList).toContain('class-two');
        }));

        it('should reset correctly when closed programmatically', fakeAsync(() => {
            const scrolledSubject = new Subject();
            const fixture = createComponent(SimpleAutocomplete, [
                {
                    provide: ScrollDispatcher,
                    useValue: { scrolled: () => scrolledSubject.asObservable() }
                },
                {
                    provide: MC_AUTOCOMPLETE_SCROLL_STRATEGY,
                    useFactory: (overlay: Overlay) => () => overlay.scrollStrategies.close(),
                    deps: [Overlay]
                }
            ]);

            fixture.detectChanges();
            const trigger = fixture.componentInstance.trigger;

            trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();

            expect(trigger.panelOpen).toBe(true, 'Expected panel to be open.');

            scrolledSubject.next();
            fixture.detectChanges();

            expect(trigger.panelOpen).toBe(false, 'Expected panel to be closed.');
        }));

        it('should handle autocomplete being attached to number inputs', fakeAsync(() => {
            const fixture = createComponent(AutocompleteWithNumberInputAndNgModel);
            fixture.detectChanges();
            const input = fixture.debugElement.query(By.css('input')).nativeElement;

            typeInElement('1337', input);
            fixture.detectChanges();

            expect(fixture.componentInstance.selectedValue).toBe(1337);
        }));

    });

    it('should have correct width when opened', () => {
        const widthFixture = createComponent(SimpleAutocomplete);
        widthFixture.componentInstance.width = 300;
        widthFixture.detectChanges();

        widthFixture.componentInstance.trigger.openPanel();
        widthFixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
        // Firefox, edge return a decimal value for width, so we need to parse and round it to verify
        expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(298);

        widthFixture.componentInstance.trigger.closePanel();
        widthFixture.detectChanges();

        widthFixture.componentInstance.width = 500;
        widthFixture.detectChanges();

        widthFixture.componentInstance.trigger.openPanel();
        widthFixture.detectChanges();

        // Firefox, edge return a decimal value for width, so we need to parse and round it to verify
        expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(498);
    });

    it('should update the width while the panel is open', () => {
        const widthFixture = createComponent(SimpleAutocomplete);

        widthFixture.componentInstance.width = 300;
        widthFixture.detectChanges();

        widthFixture.componentInstance.trigger.openPanel();
        widthFixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
        const input = widthFixture.debugElement.query(By.css('input')).nativeElement;

        expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(298);

        widthFixture.componentInstance.width = 500;
        widthFixture.detectChanges();

        input.focus();
        dispatchFakeEvent(input, 'input');
        widthFixture.detectChanges();

        expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(498);
    });

    it('should not reopen a closed autocomplete when returning to a blurred tab', () => {
        const fixture = createComponent(SimpleAutocomplete);
        fixture.detectChanges();

        const trigger = fixture.componentInstance.trigger;
        const input = fixture.debugElement.query(By.css('input')).nativeElement;

        input.focus();
        fixture.detectChanges();

        expect(trigger.panelOpen).toBe(true, 'Expected panel to be open.');

        trigger.closePanel();
        fixture.detectChanges();

        expect(trigger.panelOpen).toBe(false, 'Expected panel to be closed.');

        // Simulate the user going to a different tab.
        dispatchFakeEvent(window, 'blur');
        input.blur();
        fixture.detectChanges();

        // Simulate the user coming back.
        dispatchFakeEvent(window, 'focus');
        input.focus();
        fixture.detectChanges();

        expect(trigger.panelOpen).toBe(false, 'Expected panel to remain closed.');
    });

    it('should update the panel width if the window is resized', fakeAsync(() => {
        const widthFixture = createComponent(SimpleAutocomplete);

        widthFixture.componentInstance.width = 300;
        widthFixture.detectChanges();

        widthFixture.componentInstance.trigger.openPanel();
        widthFixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

        expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(298);

        widthFixture.componentInstance.width = 400;
        widthFixture.detectChanges();

        dispatchFakeEvent(window, 'resize');
        tick(20);

        expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(398);
    }));

    it('should have panel width match host width by default', () => {
        const widthFixture = createComponent(SimpleAutocomplete);

        widthFixture.componentInstance.width = 300;
        widthFixture.detectChanges();

        widthFixture.componentInstance.trigger.openPanel();
        widthFixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

        expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(298);
    });

    it('should have panel width set to string value', () => {
        const widthFixture = createComponent(SimpleAutocomplete);

        widthFixture.componentInstance.width = 300;
        widthFixture.detectChanges();

        widthFixture.componentInstance.trigger.autocomplete.panelWidth = 'auto';
        widthFixture.componentInstance.trigger.openPanel();
        widthFixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

        expect(overlayPane.style.width).toBe('auto');
    });

    it('should have panel width set to number value', () => {
        const widthFixture = createComponent(SimpleAutocomplete);

        widthFixture.componentInstance.width = 300;
        widthFixture.detectChanges();

        widthFixture.componentInstance.trigger.autocomplete.panelWidth = 400;
        widthFixture.componentInstance.trigger.openPanel();
        widthFixture.detectChanges();

        const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

        expect(Math.ceil(parseFloat(overlayPane.style.width as string))).toBe(400);
    });

    it('should show the panel when the options are initialized later within a component with ' +
        'OnPush change detection', fakeAsync(() => {
        const fixture = createComponent(AutocompleteWithOnPushDelay);

        fixture.detectChanges();
        dispatchFakeEvent(fixture.debugElement.query(By.css('input')).nativeElement, 'focusin');
        tick(1000);

        fixture.detectChanges();
        tick();

        Promise.resolve().then(() => {
            const panel = overlayContainerElement.querySelector('.mc-autocomplete-panel') as HTMLElement;
            const visibleClass = 'mc-autocomplete_visible';

            fixture.detectChanges();
            expect(panel.classList).toContain(visibleClass, `Expected panel to be visible.`);
        });
    }));

    it('should emit an event when an option is selected', fakeAsync(() => {
        const fixture = createComponent(AutocompleteWithSelectEvent);

        fixture.detectChanges();
        fixture.componentInstance.trigger.openPanel();
        zone.simulateZoneExit();
        fixture.detectChanges();

        const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');
        const spy = fixture.componentInstance.optionSelected;

        options[1].click();
        tick();
        fixture.detectChanges();

        expect(spy).toHaveBeenCalledTimes(1);

        const event = spy.calls.mostRecent().args[0] as McAutocompleteSelectedEvent;

        expect(event.source).toBe(fixture.componentInstance.autocomplete);
        expect(event.option.value).toBe('Washington');
    }));

    it('should emit an event when a newly-added option is selected', fakeAsync(() => {
        const fixture = createComponent(AutocompleteWithSelectEvent);

        fixture.detectChanges();
        fixture.componentInstance.trigger.openPanel();
        tick();
        fixture.detectChanges();

        fixture.componentInstance.states.push('Puerto Rico');
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mc-option');
        const spy = fixture.componentInstance.optionSelected;

        options[3].click();
        tick();
        fixture.detectChanges();

        expect(spy).toHaveBeenCalledTimes(1);

        const event = spy.calls.mostRecent().args[0] as McAutocompleteSelectedEvent;

        expect(event.source).toBe(fixture.componentInstance.autocomplete);
        expect(event.option.value).toBe('Puerto Rico');
    }));

    xit('should be able to set a custom panel connection element', () => {
        const fixture = createComponent(AutocompleteWithDifferentOrigin);

        fixture.detectChanges();
        fixture.componentInstance.connectedTo = fixture.componentInstance.alternateOrigin;
        fixture.detectChanges();
        fixture.componentInstance.trigger.openPanel();
        fixture.detectChanges();
        zone.simulateZoneExit();

        const overlayRect = overlayContainerElement.querySelector('.cdk-overlay-pane')!.getBoundingClientRect();
        const originRect = fixture.nativeElement.querySelector('.origin').getBoundingClientRect();

        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.bottom),
            'Expected autocomplete panel to align with the bottom of the new origin.');
    });

    xit('should be able to change the origin after the panel has been opened', () => {
        const fixture = createComponent(AutocompleteWithDifferentOrigin);

        fixture.detectChanges();
        fixture.componentInstance.trigger.openPanel();
        fixture.detectChanges();
        zone.simulateZoneExit();

        fixture.componentInstance.trigger.closePanel();
        fixture.detectChanges();

        fixture.componentInstance.connectedTo = fixture.componentInstance.alternateOrigin;
        fixture.detectChanges();

        fixture.componentInstance.trigger.openPanel();
        fixture.detectChanges();
        zone.simulateZoneExit();

        const overlayRect =
            overlayContainerElement.querySelector('.cdk-overlay-pane')!.getBoundingClientRect();
        const originRect = fixture.nativeElement.querySelector('.origin').getBoundingClientRect();

        expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.bottom),
            'Expected autocomplete panel to align with the bottom of the new origin.');
    });

    it('should be able to re-type the same value when it is reset while open', fakeAsync(() => {
        const fixture = createComponent(SimpleAutocomplete);
        fixture.detectChanges();
        const input = fixture.debugElement.query(By.css('input')).nativeElement;
        const formControl = fixture.componentInstance.stateCtrl;

        typeInElement('Cal', input);
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        expect(formControl.value).toBe('Cal', 'Expected initial value to be propagated to model');

        formControl.setValue('');
        fixture.detectChanges();

        expect(input.value).toBe('', 'Expected input value to reset when model is reset');

        typeInElement('Cal', input);
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        expect(formControl.value).toBe('Cal', 'Expected new value to be propagated to model');
    }));

    it('should not close when clicking inside alternate origin', () => {
        const fixture = createComponent(AutocompleteWithDifferentOrigin);
        fixture.detectChanges();
        fixture.componentInstance.connectedTo = fixture.componentInstance.alternateOrigin;
        fixture.detectChanges();
        fixture.componentInstance.trigger.openPanel();
        fixture.detectChanges();
        zone.simulateZoneExit();

        expect(fixture.componentInstance.trigger.panelOpen).toBe(true);

        const origin = fixture.nativeElement.querySelector('.origin');
        origin.click();
        fixture.detectChanges();

        expect(fixture.componentInstance.trigger.panelOpen).toBe(true);
    });

    describe('Option selection with disabled items', () => {
        let fixture: ComponentFixture<AutocompleteWithDisabledItems>;

        beforeEach(() => {
            fixture = createComponent(AutocompleteWithDisabledItems);
            fixture.detectChanges();
        });

        it('should not autofocus on first item when it disabled', () => {
            fixture.componentInstance.trigger.autocomplete.autoActiveFirstOption = true;
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();
            fixture.detectChanges();

            expect(overlayContainerElement.querySelectorAll('mc-option')[1].classList)
                .toContain('mc-active', 'Expected second option to be highlighted.');
        });

        it('should not autofocus on first and second item when it disabled', () => {
            fixture.componentInstance.states[1].disabled = true;

            fixture.componentInstance.trigger.autocomplete.autoActiveFirstOption = true;
            fixture.componentInstance.trigger.openPanel();
            fixture.detectChanges();
            zone.simulateZoneExit();
            fixture.detectChanges();

            expect(overlayContainerElement.querySelectorAll('mc-option')[2].classList)
                .toContain('mc-active', 'Expected second option to be highlighted.');
        });

    });

    describe('Manage dropdown opening with openOnFocus when focus', () => {
        let fixture: ComponentFixture<AutocompleteWithDisabledItems>;
        let input: HTMLInputElement;

        beforeEach(() => {
            fixture = createComponent(AutocompleteWithOpenOnFocus);
            fixture.detectChanges();
            input = fixture.debugElement.query(By.css('input')).nativeElement;
        });

        it('should not open dropdown with disabled openOnFocus', () => {
            fixture.componentInstance.trigger.autocomplete.openOnFocus = false;

            expect(fixture.componentInstance.trigger.panelOpen)
                .toBe(false, `Expected panel state to start out closed.`);

            dispatchFakeEvent(input, 'focusin');
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger.panelOpen)
                .toBe(false, `Expected panel state to closed when input is focused.`);
        });

        it('should open dropdown with enabled openOnFocus', () => {
            fixture.componentInstance.trigger.autocomplete.openOnFocus = true;

            expect(fixture.componentInstance.trigger.panelOpen)
                .toBe(false, `Expected panel state to start out closed.`);

            dispatchFakeEvent(input, 'focusin');
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger.panelOpen)
                .toBe(true, `Expected panel state to read open when input is focused.`);
        });
    });

    describe('Manage dropdown opening with openOnFocus when focus in default state', () => {
        let fixture: ComponentFixture<SimpleAutocomplete>;
        let input: HTMLInputElement;

        beforeEach(() => {
            fixture = createComponent(SimpleAutocomplete);
            fixture.detectChanges();
            input = fixture.debugElement.query(By.css('input')).nativeElement;
        });

        it('should open dropdown when no openOnFocus attribute', () => {
            expect(fixture.componentInstance.trigger.panelOpen)
                .toBe(false, `Expected panel state to start out closed.`);

            dispatchFakeEvent(input, 'focusin');
            fixture.detectChanges();

            expect(fixture.componentInstance.trigger.panelOpen)
                .toBe(true, `Expected panel state to read open when input is focused.`);
        });
    });
});

@Component({
    template: `
        <mc-form-field [style.width.px]="width">
            <input
                mcInput
                placeholder="State"
                [mcAutocomplete]="auto"
                [mcAutocompleteDisabled]="autocompleteDisabled"
                [formControl]="stateCtrl">
        </mc-form-field>

        <mc-autocomplete class="class-one class-two" #auto="mcAutocomplete" [displayWith]="displayFn"
                          (opened)="openedSpy()" (closed)="closedSpy()">
            <mc-option *ngFor="let state of filteredStates" [value]="state">
                <span>{{ state.code }}: {{ state.name }}</span>
            </mc-option>
        </mc-autocomplete>
    `
})
class SimpleAutocomplete implements OnDestroy {
    stateCtrl = new FormControl();
    filteredStates: any[];
    valueSub: Subscription;
    width: number;
    autocompleteDisabled = false;
    openedSpy = jasmine.createSpy('autocomplete opened spy');
    closedSpy = jasmine.createSpy('autocomplete closed spy');

    @ViewChild(McAutocompleteTrigger, {static: true}) trigger: McAutocompleteTrigger;
    @ViewChild(McAutocomplete, {static: false}) panel: McAutocomplete;
    @ViewChild(McFormField, {static: false}) formField: McFormField;
    @ViewChildren(McOption) options: QueryList<McOption>;

    states = [
        { code: 'AL', name: 'Alabama' },
        { code: 'CA', name: 'California' },
        { code: 'FL', name: 'Florida' },
        { code: 'KS', name: 'Kansas' },
        { code: 'MA', name: 'Massachusetts' },
        { code: 'NY', name: 'New York' },
        { code: 'OR', name: 'Oregon' },
        { code: 'PA', name: 'Pennsylvania' },
        { code: 'TN', name: 'Tennessee' },
        { code: 'VA', name: 'Virginia' },
        { code: 'WY', name: 'Wyoming' }
    ];


    constructor() {
        this.filteredStates = this.states;
        this.valueSub = this.stateCtrl.valueChanges.subscribe((val) => {
            this.filteredStates = val ? this.states.filter((s) => s.name.match(new RegExp(val, 'gi')))
                : this.states;
        });
    }

    displayFn(value: any): string {
        return value ? value.name : value;
    }

    ngOnDestroy() {
        this.valueSub.unsubscribe();
    }

}

@Component({
    template: `
        <mc-form-field *ngIf="isVisible">
            <input mcInput placeholder="Choose" [mcAutocomplete]="auto" [formControl]="optionCtrl">
        </mc-form-field>

        <mc-autocomplete #auto="mcAutocomplete">
            <mc-option *ngFor="let option of filteredOptions | async" [value]="option">
                {{option}}
            </mc-option>
        </mc-autocomplete>
    `
})
class NgIfAutocomplete {
    optionCtrl = new FormControl();
    filteredOptions: Observable<any>;
    isVisible = true;
    options = ['One', 'Two', 'Three'];

    @ViewChild(McAutocompleteTrigger, {static: false}) trigger: McAutocompleteTrigger;
    @ViewChildren(McOption) mcOptions: QueryList<McOption>;

    constructor() {
        this.filteredOptions = this.optionCtrl.valueChanges.pipe(
            startWith(null),
            map((val: string) => {
                return val ? this.options.filter((option) => new RegExp(val, 'gi').test(option))
                    : this.options.slice();
            }));
    }
}


@Component({
    template: `
        <mc-form-field>
            <input mcInput placeholder="State" [mcAutocomplete]="auto"
                   (input)="onInput($event.target?.value)">
        </mc-form-field>

        <mc-autocomplete #auto="mcAutocomplete">
            <mc-option *ngFor="let state of filteredStates" [value]="state">
                <span> {{ state }}  </span>
            </mc-option>
        </mc-autocomplete>
    `
})
class AutocompleteWithoutForms {
    filteredStates: any[];
    states = ['Alabama', 'California', 'Florida'];

    constructor() {
        this.filteredStates = this.states.slice();
    }

    onInput(value: any) {
        this.filteredStates = this.states.filter((s) => new RegExp(value, 'gi').test(s));
    }
}


@Component({
    template: `
        <mc-form-field>
            <input mcInput placeholder="State" [mcAutocomplete]="auto" [(ngModel)]="selectedState"
                   (ngModelChange)="onInput($event)">
        </mc-form-field>

        <mc-autocomplete #auto="mcAutocomplete">
            <mc-option *ngFor="let state of filteredStates" [value]="state">
                <span>{{ state }}</span>
            </mc-option>
        </mc-autocomplete>
    `
})
class AutocompleteWithNgModel {
    filteredStates: any[];
    selectedState: string;
    states = ['New York', 'Washington', 'Oregon'];

    constructor() {
        this.filteredStates = this.states.slice();
    }

    onInput(value: any) {
        this.filteredStates = this.states.filter((s) => new RegExp(value, 'gi').test(s));
    }
}

@Component({
    template: `
        <mc-form-field>
            <input mcInput placeholder="Number" [mcAutocomplete]="auto" [(ngModel)]="selectedNumber">
        </mc-form-field>

        <mc-autocomplete #auto="mcAutocomplete">
            <mc-option *ngFor="let number of numbers" [value]="number">
                <span>{{ number }}</span>
            </mc-option>
        </mc-autocomplete>
    `
})
class AutocompleteWithNumbers {
    selectedNumber: number;
    numbers = [0, 1, 2];
}

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <mc-form-field>
            <input type="text" mcInput [mcAutocomplete]="auto">
        </mc-form-field>

        <mc-autocomplete #auto="mcAutocomplete">
            <mc-option *ngFor="let option of options" [value]="option">{{ option }}</mc-option>
        </mc-autocomplete>
    `
})
class AutocompleteWithOnPushDelay implements OnInit {
    @ViewChild(McAutocompleteTrigger, {static: false}) trigger: McAutocompleteTrigger;
    options: string[];

    ngOnInit() {
        setTimeout(() => {
            this.options = ['One'];
        }, 1000);
    }
}

@Component({
    template: `
        <input placeholder="Choose" [mcAutocomplete]="auto" [formControl]="optionCtrl">

        <mc-autocomplete #auto="mcAutocomplete">
            <mc-option *ngFor="let option of filteredOptions | async" [value]="option">
                {{option}}
            </mc-option>
        </mc-autocomplete>
    `
})
class AutocompleteWithNativeInput {
    optionCtrl = new FormControl();
    filteredOptions: Observable<any>;
    options = ['En', 'To', 'Tre', 'Fire', 'Fem'];

    @ViewChild(McAutocompleteTrigger, {static: false}) trigger: McAutocompleteTrigger;
    @ViewChildren(McOption) mcOptions: QueryList<McOption>;

    constructor() {
        this.filteredOptions = this.optionCtrl.valueChanges.pipe(
            startWith(null),
            map((val: string) => {
                return val ? this.options.filter((option) => new RegExp(val, 'gi').test(option))
                    : this.options.slice();
            }));
    }
}


@Component({
    template: `<input placeholder="Choose" [mcAutocomplete]="auto" [formControl]="control">`
})
class AutocompleteWithoutPanel {
    @ViewChild(McAutocompleteTrigger, {static: false}) trigger: McAutocompleteTrigger;
    control = new FormControl();
}


@Component({
    template: `
        <mc-form-field>
            <input placeholder="State" mcInput [mcAutocomplete]="auto" [formControl]="formControl">
        </mc-form-field>

        <mc-autocomplete #auto="mcAutocomplete">
            <mc-option [value]="'California'">California</mc-option>
        </mc-autocomplete>
    `
})
class AutocompleteWithFormsAndNonfloatingLabel {
    formControl = new FormControl('California');
}


@Component({
    template: `
        <mc-form-field>
            <input mcInput placeholder="State" [mcAutocomplete]="auto" [(ngModel)]="selectedState">
        </mc-form-field>

        <mc-autocomplete #auto="mcAutocomplete">
            <mc-optgroup *ngFor="let group of stateGroups" [label]="group.label">
                <mc-option *ngFor="let state of group.states" [value]="state">
                    <span>{{ state }}</span>
                </mc-option>
            </mc-optgroup>
        </mc-autocomplete>
    `
})
class AutocompleteWithGroups {
    @ViewChild(McAutocompleteTrigger, {static: false}) trigger: McAutocompleteTrigger;
    selectedState: string;
    stateGroups = [
        {
            title: 'One',
            states: ['Alabama', 'California', 'Florida', 'Oregon']
        },
        {
            title: 'Two',
            states: ['Kansas', 'Massachusetts', 'New York', 'Pennsylvania']
        },
        {
            title: 'Three',
            states: ['Tennessee', 'Virginia', 'Wyoming', 'Alaska']
        }
    ];
}

@Component({
    template: `
        <mc-form-field>
            <input mcInput placeholder="State" [mcAutocomplete]="auto" [(ngModel)]="selectedState">
        </mc-form-field>

        <mc-autocomplete #auto="mcAutocomplete" (optionSelected)="optionSelected($event)">
            <mc-option *ngFor="let state of states" [value]="state">
                <span>{{ state }}</span>
            </mc-option>
        </mc-autocomplete>
    `
})
class AutocompleteWithSelectEvent {
    selectedState: string;
    states = ['New York', 'Washington', 'Oregon'];
    optionSelected = jasmine.createSpy('optionSelected callback');

    @ViewChild(McAutocompleteTrigger, {static: false}) trigger: McAutocompleteTrigger;
    @ViewChild(McAutocomplete, {static: false}) autocomplete: McAutocomplete;
}


@Component({
    template: `
        <input [formControl]="formControl" [mcAutocomplete]="auto"/>
        <mc-autocomplete #auto="mcAutocomplete"></mc-autocomplete>
    `
})
class PlainAutocompleteInputWithFormControl {
    formControl = new FormControl();
}


@Component({
    template: `
        <mc-form-field>
            <input type="number" mcInput [mcAutocomplete]="auto" [(ngModel)]="selectedValue">
        </mc-form-field>

        <mc-autocomplete #auto="mcAutocomplete">
            <mc-option *ngFor="let value of values" [value]="value">{{value}}</mc-option>
        </mc-autocomplete>
    `
})
class AutocompleteWithNumberInputAndNgModel {
    selectedValue: number;
    values = [1, 2, 3];
}


@Component({
    template: `
        <div>
            <mc-form-field>
                <input mcInput
                       [mcAutocomplete]="auto"
                       [mcAutocompleteConnectedTo]="connectedTo"
                       [(ngModel)]="selectedValue">
            </mc-form-field>
        </div>

        <div
            class="origin"
            mcAutocompleteOrigin
            #origin="mcAutocompleteOrigin"
            style="margin-top: 50px">
            Connection element
        </div>

        <mc-autocomplete #auto="mcAutocomplete">
            <mc-option *ngFor="let value of values" [value]="value">{{value}}</mc-option>
        </mc-autocomplete>
    `
})
class AutocompleteWithDifferentOrigin {
    @ViewChild(McAutocompleteTrigger, {static: false}) trigger: McAutocompleteTrigger;
    @ViewChild(McAutocompleteOrigin, {static: false}) alternateOrigin: McAutocompleteOrigin;

    selectedValue: string;
    values = ['one', 'two', 'three'];
    connectedTo?: McAutocompleteOrigin;
}

@Component({
    template: `
        <input autocomplete="changed" [(ngModel)]="value" [mcAutocomplete]="auto"/>
        <mc-autocomplete #auto="mcAutocomplete"></mc-autocomplete>
    `
})
class AutocompleteWithNativeAutocompleteAttribute {
    value: string;
}

@Component({
    template: '<input [mcAutocomplete]="null" mcAutocompleteDisabled>'
})
class InputWithoutAutocompleteAndDisabled {}

@Component({
    template: `
        <mc-form-field>
            <input mcInput placeholder="States" [mcAutocomplete]="auto" [(ngModel)]="selectedState">
        </mc-form-field>

        <mc-autocomplete #auto="mcAutocomplete">
            <mc-option *ngFor="let state of states" [value]="state.code" [disabled]="state.disabled">
                <span>{{ state.name }}</span>
            </mc-option>
        </mc-autocomplete>
    `
})
class AutocompleteWithDisabledItems {
    @ViewChild(McAutocompleteTrigger, {static: true}) trigger: McAutocompleteTrigger;

    selectedState: string;
    states = [
        { code: 'AL', name: 'Alabama', disabled: true },
        { code: 'CA', name: 'California' },
        { code: 'FL', name: 'Florida' },
        { code: 'KS', name: 'Kansas' },
        { code: 'MA', name: 'Massachusetts' },
        { code: 'NY', name: 'New York' },
        { code: 'OR', name: 'Oregon' },
        { code: 'PA', name: 'Pennsylvania' },
        { code: 'TN', name: 'Tennessee' },
        { code: 'VA', name: 'Virginia' },
        { code: 'WY', name: 'Wyoming' }
    ];
}

@Component({
    template: `
        <mc-form-field>
            <input mcInput placeholder="States" [mcAutocomplete]="auto" [(ngModel)]="selectedState">
        </mc-form-field>

        <mc-autocomplete #auto="mcAutocomplete" [openOnFocus]="false">
            <mc-option *ngFor="let state of states" [value]="state.code">
                <span>{{ state.name }}</span>
            </mc-option>
        </mc-autocomplete>
    `
})
class AutocompleteWithOpenOnFocus {
    @ViewChild(McAutocompleteTrigger, {static: true}) trigger: McAutocompleteTrigger;

    selectedState: string;
    states = [
        { code: 'AL', name: 'Alabama' },
        { code: 'CA', name: 'California' },
        { code: 'FL', name: 'Florida' },
        { code: 'KS', name: 'Kansas' },
        { code: 'MA', name: 'Massachusetts' },
        { code: 'NY', name: 'New York' },
        { code: 'OR', name: 'Oregon' },
        { code: 'PA', name: 'Pennsylvania' },
        { code: 'TN', name: 'Tennessee' },
        { code: 'VA', name: 'Virginia' },
        { code: 'WY', name: 'Wyoming' }
    ];
}
