import { Component, DebugElement, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormControl, FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { McButtonModule } from '@ptsecurity/mosaic/button';

import { McButtonToggle, McButtonToggleChange, McButtonToggleGroup, McButtonToggleModule } from './index';


describe('McButtonToggle with forms', () => {

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [McButtonModule, McButtonToggleModule, FormsModule, ReactiveFormsModule],
            declarations: [
                ButtonToggleGroupWithNgModel,
                ButtonToggleGroupWithFormControl
            ]
        });

        TestBed.compileComponents();
    }));

    describe('using FormControl', () => {
        let fixture: ComponentFixture<ButtonToggleGroupWithFormControl>;
        let groupDebugElement: DebugElement;
        let groupInstance: McButtonToggleGroup;
        let testComponent: ButtonToggleGroupWithFormControl;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(ButtonToggleGroupWithFormControl);
            fixture.detectChanges();

            testComponent = fixture.debugElement.componentInstance;

            groupDebugElement = fixture.debugElement.query(By.directive(McButtonToggleGroup));
            groupInstance = groupDebugElement.injector.get<McButtonToggleGroup>(McButtonToggleGroup);
        }));

        it('should toggle the disabled state', () => {
            testComponent.control.disable();

            expect(groupInstance.disabled).toBe(true);

            testComponent.control.enable();

            expect(groupInstance.disabled).toBe(false);
        });

        it('should set the value', () => {
            testComponent.control.setValue('green');

            expect(groupInstance.value).toBe('green');

            testComponent.control.setValue('red');

            expect(groupInstance.value).toBe('red');
        });

        it('should register the on change callback', () => {
            const spy = jasmine.createSpy('onChange callback');

            testComponent.control.registerOnChange(spy);
            testComponent.control.setValue('blue');

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('button toggle group with ngModel and change event', () => {
        let fixture: ComponentFixture<ButtonToggleGroupWithNgModel>;
        let groupDebugElement: DebugElement;
        let buttonToggleDebugElements: DebugElement[];
        let groupInstance: McButtonToggleGroup;
        let buttonToggleInstances: McButtonToggle[];
        let testComponent: ButtonToggleGroupWithNgModel;
        let groupNgModel: NgModel;
        let innerButtons: HTMLElement[];

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(ButtonToggleGroupWithNgModel);
            fixture.detectChanges();
            testComponent = fixture.debugElement.componentInstance;

            groupDebugElement = fixture.debugElement.query(By.directive(McButtonToggleGroup));
            groupInstance = groupDebugElement.injector.get<McButtonToggleGroup>(McButtonToggleGroup);
            groupNgModel = groupDebugElement.injector.get<NgModel>(NgModel);

            buttonToggleDebugElements = fixture.debugElement.queryAll(By.directive(McButtonToggle));
            buttonToggleInstances = buttonToggleDebugElements.map((debugEl) => debugEl.componentInstance);
            innerButtons = buttonToggleDebugElements.map(
                (debugEl) => debugEl.query(By.css('button')).nativeElement);

            fixture.detectChanges();
        }));

        it('should update the model before firing change event', fakeAsync(() => {
            expect(testComponent.modelValue).toBeUndefined();
            expect(testComponent.lastEvent).toBeUndefined();

            innerButtons[0].click();
            fixture.detectChanges();

            tick();
            expect(testComponent.modelValue).toBe('red');
            expect(testComponent.lastEvent.value).toBe('red');
        }));

        it('should check the corresponding button toggle on a group value change', () => {
            expect(groupInstance.value).toBeFalsy();

            for (const buttonToggle of buttonToggleInstances) {
                expect(buttonToggle.checked).toBeFalsy();
            }

            groupInstance.value = 'red';

            for (const buttonToggle of buttonToggleInstances) {
                expect(buttonToggle.checked).toBe(groupInstance.value === buttonToggle.value);
            }

            const selected = groupInstance.selected as McButtonToggle;

            expect(selected.value).toBe(groupInstance.value);
        });

        it('should have the correct FormControl state initially and after interaction',
            fakeAsync(() => {
                expect(groupNgModel.valid).toBe(true);
                expect(groupNgModel.pristine).toBe(true);
                expect(groupNgModel.touched).toBe(false);

                buttonToggleInstances[1].checked = true;
                fixture.detectChanges();
                tick();

                expect(groupNgModel.valid).toBe(true);
                expect(groupNgModel.pristine).toBe(true);
                expect(groupNgModel.touched).toBe(false);

                // tslint:disable-next-line:no-magic-numbers
                innerButtons[2].click();
                fixture.detectChanges();
                tick();

                expect(groupNgModel.valid).toBe(true);
                expect(groupNgModel.pristine).toBe(false);
                expect(groupNgModel.touched).toBe(true);
            }));

        it('should update the ngModel value when selecting a button toggle', fakeAsync(() => {
            innerButtons[1].click();
            fixture.detectChanges();

            tick();

            expect(testComponent.modelValue).toBe('green');
        }));
    });
});

describe('McButtonToggle without forms', () => {

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [McButtonModule, McButtonToggleModule],
            declarations: [
                ButtonTogglesInsideButtonToggleGroup,
                ButtonTogglesInsideButtonToggleGroupMultiple,
                FalsyButtonTogglesInsideButtonToggleGroupMultiple,
                ButtonToggleGroupWithInitialValue,
                StandaloneButtonToggle,
                RepeatedButtonTogglesWithPreselectedValue
            ]
        });

        TestBed.compileComponents();
    }));

    describe('inside of an exclusive selection group', () => {

        let fixture: ComponentFixture<ButtonTogglesInsideButtonToggleGroup>;
        let groupDebugElement: DebugElement;
        let groupNativeElement: HTMLElement;
        let buttonToggleDebugElements: DebugElement[];
        let buttonToggleNativeElements: HTMLElement[];
        let buttonToggleLabelElements: HTMLLabelElement[];
        let groupInstance: McButtonToggleGroup;
        let buttonToggleInstances: McButtonToggle[];
        let testComponent: ButtonTogglesInsideButtonToggleGroup;

        beforeEach(() => {
            fixture = TestBed.createComponent(ButtonTogglesInsideButtonToggleGroup);
            fixture.detectChanges();

            testComponent = fixture.debugElement.componentInstance;

            groupDebugElement = fixture.debugElement.query(By.directive(McButtonToggleGroup));
            groupNativeElement = groupDebugElement.nativeElement;
            groupInstance = groupDebugElement.injector.get<McButtonToggleGroup>(McButtonToggleGroup);

            buttonToggleDebugElements = fixture.debugElement.queryAll(By.directive(McButtonToggle));

            buttonToggleNativeElements = buttonToggleDebugElements
                .map((debugEl) => debugEl.nativeElement);

            buttonToggleLabelElements = fixture.debugElement.queryAll(By.css('button'))
                .map((debugEl) => debugEl.nativeElement);

            buttonToggleInstances = buttonToggleDebugElements.map((debugEl) => debugEl.componentInstance);
        });

        it('should disable click interactions when the group is disabled', () => {
            testComponent.isGroupDisabled = true;
            fixture.detectChanges();

            buttonToggleNativeElements[0].click();

            expect(buttonToggleInstances[0].checked).toBe(false);
            testComponent.isGroupDisabled = false;

            fixture.detectChanges();

            buttonToggleLabelElements[0].click();
            fixture.detectChanges();

            expect(buttonToggleInstances[0].checked).toBe(true);
        });

        it('should disable the underlying button when the group is disabled', () => {
            const buttons = buttonToggleNativeElements.map((toggle) => toggle.querySelector('button')!);

            expect(buttons.every((input) => input.disabled)).toBe(false);

            testComponent.isGroupDisabled = true;
            fixture.detectChanges();

            expect(buttons.every((input) => input.disabled)).toBe(true);
        });

        it('should update the group value when one of the toggles changes', () => {
            expect(groupInstance.value).toBeFalsy();
            buttonToggleLabelElements[0].click();
            fixture.detectChanges();

            expect(groupInstance.value).toBe('test1');
            expect(groupInstance.selected).toBe(buttonToggleInstances[0]);
        });

        it('should propagate the value change back up via a two-way binding', () => {
            expect(groupInstance.value).toBeFalsy();
            buttonToggleLabelElements[0].click();
            fixture.detectChanges();

            expect(groupInstance.value).toBe('test1');
            expect(testComponent.groupValue).toBe('test1');
        });

        it('should update the group and toggles when one of the button toggles is clicked', () => {
            expect(groupInstance.value).toBeFalsy();
            buttonToggleLabelElements[0].click();
            fixture.detectChanges();

            expect(groupInstance.value).toBe('test1');
            expect(groupInstance.selected).toBe(buttonToggleInstances[0]);
            expect(buttonToggleInstances[0].checked).toBe(true);
            expect(buttonToggleInstances[1].checked).toBe(false);

            buttonToggleLabelElements[1].click();
            fixture.detectChanges();

            expect(groupInstance.value).toBe('test2');
            expect(groupInstance.selected).toBe(buttonToggleInstances[1]);
            expect(buttonToggleInstances[0].checked).toBe(false);
            expect(buttonToggleInstances[1].checked).toBe(true);
        });

        it('should check a button toggle upon interaction with underlying native radio button', () => {
            buttonToggleLabelElements[0].click();
            fixture.detectChanges();

            expect(buttonToggleInstances[0].checked).toBe(true);
            expect(groupInstance.value);
        });

        it('should change the vertical state', () => {
            expect(groupNativeElement.classList).not.toContain('mc-button-toggle_vertical');

            groupInstance.vertical = true;
            fixture.detectChanges();

            expect(groupNativeElement.classList).toContain('mc-button-toggle_vertical');
        });

        it('should emit a change event from button toggles', fakeAsync(() => {
            expect(buttonToggleInstances[0].checked).toBe(false);

            const changeSpy = jasmine.createSpy('button-toggle change listener');
            buttonToggleInstances[0].change.subscribe(changeSpy);

            buttonToggleLabelElements[0].click();
            fixture.detectChanges();
            tick();
            expect(changeSpy).toHaveBeenCalledTimes(1);

            buttonToggleLabelElements[0].click();
            fixture.detectChanges();
            tick();

            // Always emit change event when button toggle is clicked
            // tslint:disable-next-line:no-magic-numbers
            expect(changeSpy).toHaveBeenCalledTimes(2);
        }));

        it('should emit a change event from the button toggle group', fakeAsync(() => {
            expect(groupInstance.value).toBeFalsy();

            const changeSpy = jasmine.createSpy('button-toggle-group change listener');
            groupInstance.change.subscribe(changeSpy);

            buttonToggleLabelElements[0].click();
            fixture.detectChanges();
            tick();
            expect(changeSpy).toHaveBeenCalled();

            buttonToggleLabelElements[1].click();
            fixture.detectChanges();
            tick();
            // tslint:disable-next-line:no-magic-numbers
            expect(changeSpy).toHaveBeenCalledTimes(2);
        }));

        it('should update the group and button toggles when updating the group value', () => {
            expect(groupInstance.value).toBeFalsy();

            testComponent.groupValue = 'test1';
            fixture.detectChanges();

            expect(groupInstance.value).toBe('test1');
            expect(groupInstance.selected).toBe(buttonToggleInstances[0]);
            expect(buttonToggleInstances[0].checked).toBe(true);
            expect(buttonToggleInstances[1].checked).toBe(false);

            testComponent.groupValue = 'test2';
            fixture.detectChanges();

            expect(groupInstance.value).toBe('test2');
            expect(groupInstance.selected).toBe(buttonToggleInstances[1]);
            expect(buttonToggleInstances[0].checked).toBe(false);
            expect(buttonToggleInstances[1].checked).toBe(true);
        });

        it('should deselect all of the checkboxes when the group value is cleared', () => {
            buttonToggleInstances[0].checked = true;

            expect(groupInstance.value).toBeTruthy();

            groupInstance.value = null;

            expect(buttonToggleInstances.every((toggle) => !toggle.checked)).toBe(true);
        });

        it('should update the model if a selected toggle is removed', fakeAsync(() => {
            expect(groupInstance.value).toBeFalsy();
            buttonToggleLabelElements[0].click();
            fixture.detectChanges();

            expect(groupInstance.value).toBe('test1');
            expect(groupInstance.selected).toBe(buttonToggleInstances[0]);

            testComponent.renderFirstToggle = false;
            fixture.detectChanges();
            tick();

            expect(groupInstance.value).toBeFalsy();
            expect(groupInstance.selected).toBeFalsy();
        }));

    });

    describe('with initial value and change event', () => {

        it('should not fire an initial change event', () => {
            const fixture = TestBed.createComponent(ButtonToggleGroupWithInitialValue);
            const testComponent = fixture.debugElement.componentInstance;
            const groupDebugElement = fixture.debugElement.query(By.directive(McButtonToggleGroup));
            const groupInstance: McButtonToggleGroup = groupDebugElement.injector
                .get<McButtonToggleGroup>(McButtonToggleGroup);

            fixture.detectChanges();

            // Note that we cast to a boolean, because the event has some circular references
            // which will crash the runner when Jasmine attempts to stringify them.
            expect(!!testComponent.lastEvent).toBe(false);
            expect(groupInstance.value).toBe('red');

            groupInstance.value = 'green';
            fixture.detectChanges();

            expect(!!testComponent.lastEvent).toBe(false);
            expect(groupInstance.value).toBe('green');
        });

    });

    describe('inside of a multiple selection group', () => {
        let fixture: ComponentFixture<ButtonTogglesInsideButtonToggleGroupMultiple>;
        let groupDebugElement: DebugElement;
        let groupNativeElement: HTMLElement;
        let buttonToggleDebugElements: DebugElement[];
        let buttonToggleNativeElements: HTMLElement[];
        let buttonToggleButtonElements: HTMLLabelElement[];
        let groupInstance: McButtonToggleGroup;
        let buttonToggleInstances: McButtonToggle[];
        let testComponent: ButtonTogglesInsideButtonToggleGroupMultiple;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(ButtonTogglesInsideButtonToggleGroupMultiple);
            fixture.detectChanges();

            testComponent = fixture.debugElement.componentInstance;

            groupDebugElement = fixture.debugElement.query(By.directive(McButtonToggleGroup));
            groupNativeElement = groupDebugElement.nativeElement;
            groupInstance = groupDebugElement.injector.get<McButtonToggleGroup>(McButtonToggleGroup);

            buttonToggleDebugElements = fixture.debugElement.queryAll(By.directive(McButtonToggle));
            buttonToggleNativeElements = buttonToggleDebugElements
                .map((debugEl) => debugEl.nativeElement);
            buttonToggleButtonElements = fixture.debugElement.queryAll(By.css('button'))
                .map((debugEl) => debugEl.nativeElement);
            buttonToggleInstances = buttonToggleDebugElements.map((debugEl) => debugEl.componentInstance);
        }));

        it('should disable click interactions when the group is disabled', () => {
            testComponent.isGroupDisabled = true;
            fixture.detectChanges();

            buttonToggleNativeElements[0].click();
            expect(buttonToggleInstances[0].checked).toBe(false);
        });

        it('should check a button toggle when clicked', () => {
            expect(buttonToggleInstances.every((buttonToggle) => !buttonToggle.checked)).toBe(true);

            const nativeCheckboxLabel = buttonToggleDebugElements[0].query(By.css('button')).nativeElement;

            nativeCheckboxLabel.click();

            expect(groupInstance.value).toEqual(['eggs']);
            expect(buttonToggleInstances[0].checked).toBe(true);
        });

        it('should allow for multiple toggles to be selected', () => {
            buttonToggleInstances[0].checked = true;
            fixture.detectChanges();

            expect(groupInstance.value).toEqual(['eggs']);
            expect(buttonToggleInstances[0].checked).toBe(true);

            buttonToggleInstances[1].checked = true;
            fixture.detectChanges();

            expect(groupInstance.value).toEqual(['eggs', 'flour']);
            expect(buttonToggleInstances[1].checked).toBe(true);
            expect(buttonToggleInstances[0].checked).toBe(true);
        });

        it('should check a button toggle upon interaction with underlying native checkbox', () => {
            const nativeCheckboxButton = buttonToggleDebugElements[0].query(By.css('button')).nativeElement;

            nativeCheckboxButton.click();
            fixture.detectChanges();

            expect(groupInstance.value).toEqual(['eggs']);
            expect(buttonToggleInstances[0].checked).toBe(true);
        });

        it('should change the vertical state', () => {
            expect(groupNativeElement.classList).not.toContain('mc-button-toggle_vertical');

            groupInstance.vertical = true;
            fixture.detectChanges();

            expect(groupNativeElement.classList).toContain('mc-button-toggle_vertical');
        });

        it('should deselect a button toggle when selected twice', fakeAsync(() => {
            buttonToggleButtonElements[0].click();
            fixture.detectChanges();
            tick();

            expect(buttonToggleInstances[0].checked).toBe(true);
            expect(groupInstance.value).toEqual(['eggs']);

            buttonToggleButtonElements[0].click();
            fixture.detectChanges();
            tick();

            expect(groupInstance.value).toEqual([]);
            expect(buttonToggleInstances[0].checked).toBe(false);
        }));

        it('should emit a change event for state changes', fakeAsync(() => {
            expect(buttonToggleInstances[0].checked).toBe(false);

            const changeSpy = jasmine.createSpy('button-toggle change listener');
            buttonToggleInstances[0].change.subscribe(changeSpy);

            buttonToggleButtonElements[0].click();
            fixture.detectChanges();
            tick();
            expect(changeSpy).toHaveBeenCalled();
            expect(groupInstance.value).toEqual(['eggs']);

            buttonToggleButtonElements[0].click();
            fixture.detectChanges();
            tick();
            expect(groupInstance.value).toEqual([]);

            // The default browser behavior is to emit an event, when the value was set
            // to false. That's because the current input type is set to `checkbox` when
            // using the multiple mode.
            // tslint:disable-next-line:no-magic-numbers
            expect(changeSpy).toHaveBeenCalledTimes(2);
        }));

        it('should throw when attempting to assign a non-array value', () => {
            expect(() => {
                groupInstance.value = 'not-an-array';
            }).toThrowError(/Value must be an array/);
        });
    });

    describe('as standalone', () => {
        let fixture: ComponentFixture<StandaloneButtonToggle>;
        let buttonToggleDebugElement: DebugElement;
        let buttonToggleButtonElement: HTMLLabelElement;
        let buttonToggleInstance: McButtonToggle;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(StandaloneButtonToggle);
            fixture.detectChanges();

            buttonToggleDebugElement = fixture.debugElement.query(By.directive(McButtonToggle));
            buttonToggleButtonElement = fixture.debugElement.query(By.css('button')).nativeElement;

            buttonToggleInstance = buttonToggleDebugElement.componentInstance;
        }));

        it('should toggle when clicked', fakeAsync(() => {
            buttonToggleButtonElement.click();
            fixture.detectChanges();
            flush();

            expect(buttonToggleInstance.checked).toBe(true);

            buttonToggleButtonElement.click();
            fixture.detectChanges();
            flush();

            expect(buttonToggleInstance.checked).toBe(false);
        }));

        it('should emit a change event for state changes', fakeAsync(() => {

            expect(buttonToggleInstance.checked).toBe(false);

            const changeSpy = jasmine.createSpy('button-toggle change listener');
            buttonToggleInstance.change.subscribe(changeSpy);

            buttonToggleButtonElement.click();
            fixture.detectChanges();
            tick();
            expect(changeSpy).toHaveBeenCalled();

            buttonToggleButtonElement.click();
            fixture.detectChanges();
            tick();

            // The default browser behavior is to emit an event, when the value was set
            // to false. That's because the current input type is set to `checkbox`.
            // tslint:disable-next-line:no-magic-numbers
            expect(changeSpy).toHaveBeenCalledTimes(2);
        }));
    });

    it('should not throw on init when toggles are repeated and there is an initial value', () => {
        const fixture = TestBed.createComponent(RepeatedButtonTogglesWithPreselectedValue);

        expect(() => fixture.detectChanges()).not.toThrow();
        expect(fixture.componentInstance.toggleGroup.value).toBe('Two');
        expect(fixture.componentInstance.toggles.toArray()[1].checked).toBe(true);
    });

    it('should maintain the selected state when the value and toggles are swapped out at ' +
        'the same time', () => {
        const fixture = TestBed.createComponent(RepeatedButtonTogglesWithPreselectedValue);
        fixture.detectChanges();

        expect(fixture.componentInstance.toggleGroup.value).toBe('Two');
        expect(fixture.componentInstance.toggles.toArray()[1].checked).toBe(true);

        fixture.componentInstance.possibleValues = ['Five', 'Six', 'Seven'];
        fixture.componentInstance.value = 'Seven';
        fixture.detectChanges();

        expect(fixture.componentInstance.toggleGroup.value).toBe('Seven');
        // tslint:disable-next-line:no-magic-numbers
        expect(fixture.componentInstance.toggles.toArray()[2].checked).toBe(true);
    });

    it('should select falsy button toggle value in multiple selection', () => {
        const fixture = TestBed.createComponent(FalsyButtonTogglesInsideButtonToggleGroupMultiple);
        fixture.detectChanges();

        expect(fixture.componentInstance.toggles.toArray()[0].checked).toBe(true);
        expect(fixture.componentInstance.toggles.toArray()[1].checked).toBe(false);
        // tslint:disable-next-line:no-magic-numbers
        expect(fixture.componentInstance.toggles.toArray()[2].checked).toBe(false);

        fixture.componentInstance.value = [0, false];
        fixture.detectChanges();

        expect(fixture.componentInstance.toggles.toArray()[0].checked).toBe(true);
        expect(fixture.componentInstance.toggles.toArray()[1].checked).toBe(false);
        // tslint:disable-next-line:no-magic-numbers
        expect(fixture.componentInstance.toggles.toArray()[2].checked).toBe(true);
    });
});

@Component({
    template: `
        <mc-button-toggle-group [disabled]="isGroupDisabled"
                                [vertical]="isVertical"
                                [(value)]="groupValue">
            <mc-button-toggle value="test1" *ngIf="renderFirstToggle">
                Test1
            </mc-button-toggle>
            <mc-button-toggle value="test2">
                Test2
            </mc-button-toggle>
            <mc-button-toggle value="test3">
                Test3
            </mc-button-toggle>
        </mc-button-toggle-group>
    `
})
class ButtonTogglesInsideButtonToggleGroup {
    isGroupDisabled: boolean = false;
    isVertical: boolean = false;
    groupValue: string;
    renderFirstToggle = true;
}

@Component({
    template: `
        <mc-button-toggle-group
            [name]="groupName"
            [(ngModel)]="modelValue"
            (change)="lastEvent = $event">
            <mc-button-toggle *ngFor="let option of options" [value]="option.value">
                {{option.label}}
            </mc-button-toggle>
        </mc-button-toggle-group>
    `
})
class ButtonToggleGroupWithNgModel {
    groupName = 'group-name';
    modelValue: string;
    options = [
        {label: 'Red', value: 'red'},
        {label: 'Green', value: 'green'},
        {label: 'Blue', value: 'blue'}
    ];
    lastEvent: McButtonToggleChange;
}

@Component({
    template: `
        <mc-button-toggle-group [disabled]="isGroupDisabled" [vertical]="isVertical" multiple>
            <mc-button-toggle value="eggs">
                Eggs
            </mc-button-toggle>
            <mc-button-toggle value="flour">
                Flour
            </mc-button-toggle>
            <mc-button-toggle value="sugar">
                Sugar
            </mc-button-toggle>
        </mc-button-toggle-group>
    `
})
class ButtonTogglesInsideButtonToggleGroupMultiple {
    isGroupDisabled: boolean = false;
    isVertical: boolean = false;
}

@Component({
    template: `
        <mc-button-toggle-group multiple [value]="value">
            <mc-button-toggle [value]="0">
                Eggs
            </mc-button-toggle>
            <mc-button-toggle [value]="null">
                Flour
            </mc-button-toggle>
            <mc-button-toggle [value]="false">
                Sugar
            </mc-button-toggle>
            <mc-button-toggle>Sugar</mc-button-toggle>
        </mc-button-toggle-group>
    `
})
class FalsyButtonTogglesInsideButtonToggleGroupMultiple {
    value: ('' | number | null | undefined | boolean)[] = [0];
    @ViewChildren(McButtonToggle) toggles: QueryList<McButtonToggle>;
}

@Component({
    template: `
        <mc-button-toggle>
            Yes
        </mc-button-toggle>
    `
})
class StandaloneButtonToggle {
}

@Component({
    template: `
        <mc-button-toggle-group (change)="lastEvent = $event" value="red">
            <mc-button-toggle value="red">
                Value Red
            </mc-button-toggle>
            <mc-button-toggle value="green">
                Value Green
            </mc-button-toggle>
        </mc-button-toggle-group>
    `
})
class ButtonToggleGroupWithInitialValue {
    lastEvent: McButtonToggleChange;
}

@Component({
    template: `
        <mc-button-toggle-group [formControl]="control">
            <mc-button-toggle value="red">
                Value Red
            </mc-button-toggle>
            <mc-button-toggle value="green">
                Value Green
            </mc-button-toggle>
            <mc-button-toggle value="blue">
                Value Blue
            </mc-button-toggle>
        </mc-button-toggle-group>
    `
})
class ButtonToggleGroupWithFormControl {
    control = new FormControl();
}

@Component({
    template: `
        <mc-button-toggle-group [(value)]="value">
            <mc-button-toggle *ngFor="let toggle of possibleValues" [value]="toggle">
                {{toggle}}
             </mc-button-toggle>
        </mc-button-toggle-group>
    `
})
class RepeatedButtonTogglesWithPreselectedValue {
    @ViewChild(McButtonToggleGroup, {static: false}) toggleGroup: McButtonToggleGroup;
    @ViewChildren(McButtonToggle) toggles: QueryList<McButtonToggle>;

    possibleValues = ['One', 'Two', 'Three'];
    value = 'Two';
}

