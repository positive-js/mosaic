// tslint:disable:no-magic-numbers
// tslint:disable:mocha-no-side-effect-code
// tslint:disable:max-func-body-length
// tslint:disable:no-empty

import { Component, DebugElement, ChangeDetectionStrategy, QueryList, ViewChildren } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, flush, waitForAsync } from '@angular/core/testing';
import { FormControl, FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { DOWN_ARROW, SPACE, ENTER, UP_ARROW, HOME, END } from '@ptsecurity/cdk/keycodes';
import {
    createKeyboardEvent,
    dispatchFakeEvent,
    dispatchEvent,
    dispatchKeyboardEvent, createMouseEvent
} from '@ptsecurity/cdk/testing';

import {
    McListModule,
    McListOption,
    McListSelection,
    McListSelectionChange
} from './index';


describe('McListSelection without forms', () => {
    describe('with list option', () => {
        let fixture: ComponentFixture<SelectionListWithListOptions>;
        let listOptions: DebugElement[];
        let selectionList: DebugElement;

        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [McListModule],
                declarations: [
                    SelectionListWithListOptions,
                    SelectionListWithCheckboxPositionAfter,
                    SelectionListWithListDisabled,
                    SelectionListWithOnlyOneOption
                ]
            });

            TestBed.compileComponents();
        }));

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(SelectionListWithListOptions);
            fixture.detectChanges();

            listOptions = fixture.debugElement.queryAll(By.directive(McListOption));
            selectionList = fixture.debugElement.query(By.directive(McListSelection));
        }));

        it('should add and remove focus class on focus/blur', fakeAsync(() => {
            // Use the second list item, because the first one is always disabled.
            const listItem = listOptions[1].nativeElement;

            expect(listItem.classList).not.toContain('mc-focused');

            dispatchFakeEvent(listItem, 'focusin');
            flush();
            fixture.detectChanges();
            expect(listItem.className).toContain('mc-focused');

            dispatchFakeEvent(listItem, 'blur');
            fixture.detectChanges();
            expect(listItem.className).not.toContain('mc-focused');
        }));

        it('should be able to set a value on a list option', () => {
            const optionValues = ['inbox', 'starred', 'sent-mail', 'drafts'];

            optionValues.forEach((optionValue, index) => {
                expect(listOptions[index].componentInstance.value).toBe(optionValue);
            });
        });

        it('should not emit a selectionChange event if an option changed programmatically', () => {
            spyOn(fixture.componentInstance, 'onValueChange');

            expect(fixture.componentInstance.onValueChange).toHaveBeenCalledTimes(0);

            listOptions[2].componentInstance.toggle();
            fixture.detectChanges();

            expect(fixture.componentInstance.onValueChange).toHaveBeenCalledTimes(0);
        });

        it('should emit a selectionChange event if an option got clicked', () => {
            spyOn(fixture.componentInstance, 'onValueChange');

            expect(fixture.componentInstance.onValueChange).toHaveBeenCalledTimes(0);

            dispatchFakeEvent(listOptions[2].nativeElement, 'click');
            fixture.detectChanges();

            expect(fixture.componentInstance.onValueChange).toHaveBeenCalledTimes(1);
        });

        it('should be able to dispatch one selected item', () => {
            const testListItem = listOptions[2].injector.get<McListOption>(McListOption);
            const selectList =
                selectionList.injector.get<McListSelection>(McListSelection).selectionModel;

            expect(selectList.selected.length).toBe(0);

            testListItem.toggle();
            fixture.detectChanges();

            expect(selectList.selected.length).toBe(1);
        });

        it('should be able to dispatch multiple selected items', () => {
            const testListItem = listOptions[2].injector.get<McListOption>(McListOption);
            const testListItem2 = listOptions[1].injector.get<McListOption>(McListOption);
            const selectList = selectionList.injector.get<McListSelection>(McListSelection).selectionModel;

            expect(selectList.selected.length).toBe(0);

            testListItem.toggle();
            fixture.detectChanges();

            testListItem2.toggle();
            fixture.detectChanges();

            expect(selectList.selected.length).toBe(2);
        });

        it('should be able to deselect an option', () => {
            const testListItem = listOptions[2].injector.get<McListOption>(McListOption);
            const selectList =
                selectionList.injector.get<McListSelection>(McListSelection).selectionModel;

            expect(selectList.selected.length).toBe(0);

            testListItem.toggle();
            fixture.detectChanges();

            expect(selectList.selected.length).toBe(1);

            testListItem.toggle();
            fixture.detectChanges();

            expect(selectList.selected.length).toBe(0);
        });

        it('should not allow selection of disabled items', () => {
            const testListItem = listOptions[0].injector.get<McListOption>(McListOption);
            const selectList =
                selectionList.injector.get<McListSelection>(McListSelection).selectionModel;

            expect(selectList.selected.length).toBe(0);

            const event = createMouseEvent('click');

            testListItem.handleClick(event);
            fixture.detectChanges();

            expect(selectList.selected.length).toBe(0);
        });

        it('should be able to use keyboard select with SPACE', () => {
            const manager = selectionList.componentInstance.keyManager;
            const SPACE_EVENT: KeyboardEvent = createKeyboardEvent('keydown', SPACE);
            const selectList =
                selectionList.injector.get<McListSelection>(McListSelection).selectionModel;
            expect(selectList.selected.length).toBe(0);

            manager.updateActiveItem(1);
            selectionList.componentInstance.onKeyDown(SPACE_EVENT);

            fixture.detectChanges();

            expect(selectList.selected.length).toBe(1);
            expect(SPACE_EVENT.defaultPrevented).toBe(true);
        });

        it('should be able to select an item using ENTER', () => {
            const manager = selectionList.componentInstance.keyManager;
            const testListItem: HTMLElement = listOptions[1].nativeElement;
            const ENTER_EVENT: KeyboardEvent = createKeyboardEvent('keydown', ENTER, testListItem);
            const selectList = selectionList.injector.get<McListSelection>(McListSelection).selectionModel;
            expect(selectList.selected.length).toBe(0);

            manager.updateActiveItem(1);
            selectionList.componentInstance.onKeyDown(ENTER_EVENT);

            fixture.detectChanges();

            expect(selectList.selected.length).toBe(1);
            expect(ENTER_EVENT.defaultPrevented).toBe(true);
        });

        // todo restore this TC
        xit('should restore focus if active option is destroyed', () => {
            const manager = selectionList.componentInstance.keyManager;

            listOptions[3].componentInstance.focus();

            expect(manager.activeItemIndex).toBe(3);

            fixture.componentInstance.showLastOption = false;
            fixture.detectChanges();

            expect(manager.activeItemIndex).toBe(2);
        });

        it('should focus previous item when press UP ARROW', () => {
            const testListItem = listOptions[2].nativeElement as HTMLElement;
            const UP_EVENT: KeyboardEvent =
                createKeyboardEvent('keydown', UP_ARROW, testListItem);
            const manager = selectionList.componentInstance.keyManager;

            manager.setActiveItem(2);
            expect(manager.activeItemIndex).toEqual(2);

            selectionList.componentInstance.onKeyDown(UP_EVENT);

            fixture.detectChanges();

            expect(manager.activeItemIndex).toEqual(1);
        });

        it('should focus and toggle the next item when pressing SHIFT + UP_ARROW', () => {
            const manager = selectionList.componentInstance.keyManager;
            const upKeyEvent = createKeyboardEvent('keydown', UP_ARROW);
            Object.defineProperty(upKeyEvent, 'shiftKey', { get: () => true });

            manager.setActiveItem(3);
            expect(manager.activeItemIndex).toBe(3);

            expect(listOptions[1].componentInstance.selected).toBe(false);
            expect(listOptions[2].componentInstance.selected).toBe(false);

            selectionList.componentInstance.onKeyDown(upKeyEvent);
            fixture.detectChanges();

            expect(listOptions[1].componentInstance.selected).toBe(false);
            expect(listOptions[2].componentInstance.selected).toBe(true);

            selectionList.componentInstance.onKeyDown(upKeyEvent);
            fixture.detectChanges();

            expect(listOptions[1].componentInstance.selected).toBe(true);
            expect(listOptions[2].componentInstance.selected).toBe(true);
        });

        it('should focus next item when press DOWN ARROW', () => {
            const manager = selectionList.componentInstance.keyManager;

            manager.setActiveItem(2);
            expect(manager.activeItemIndex).toEqual(2);

            selectionList.componentInstance.onKeyDown(createKeyboardEvent('keydown', DOWN_ARROW));
            fixture.detectChanges();

            expect(manager.activeItemIndex).toEqual(3);
        });

        it('should focus and toggle the next item when pressing SHIFT + DOWN_ARROW', () => {
            const manager = selectionList.componentInstance.keyManager;
            const downKeyEvent = createKeyboardEvent('keydown', DOWN_ARROW);
            Object.defineProperty(downKeyEvent, 'shiftKey', { get: () => true });

            manager.setActiveItem(1);
            expect(manager.activeItemIndex).toBe(1);

            expect(listOptions[2].componentInstance.selected).toBe(false);
            expect(listOptions[3].componentInstance.selected).toBe(false);

            selectionList.componentInstance.onKeyDown(downKeyEvent);
            fixture.detectChanges();

            expect(listOptions[2].componentInstance.selected).toBe(true);
            expect(listOptions[3].componentInstance.selected).toBe(false);

            selectionList.componentInstance.onKeyDown(downKeyEvent);
            fixture.detectChanges();

            expect(listOptions[2].componentInstance.selected).toBe(true);
            expect(listOptions[3].componentInstance.selected).toBe(true);
        });

        it('should be able to focus the first item when pressing HOME', () => {
            const manager = selectionList.componentInstance.keyManager;
            expect(manager.activeItemIndex).toBe(-1);

            const event = dispatchKeyboardEvent(selectionList.nativeElement, 'keydown', HOME);
            fixture.detectChanges();

            expect(manager.activeItemIndex).toBe(1);
            expect(event.defaultPrevented).toBe(true);
        });

        it('should focus the last item when pressing END', () => {
            const manager = selectionList.componentInstance.keyManager;
            expect(manager.activeItemIndex).toBe(-1);

            const event = dispatchKeyboardEvent(selectionList.nativeElement, 'keydown', END);
            fixture.detectChanges();

            expect(manager.activeItemIndex).toBe(3);
            expect(event.defaultPrevented).toBe(true);
        });

        xit('should be able to jump focus down to an item by typing', fakeAsync(() => {
            const listEl = selectionList.nativeElement;
            const manager = selectionList.componentInstance.keyManager;

            expect(manager.activeItemIndex).toBe(-1);

            dispatchEvent(listEl, createKeyboardEvent('keydown', 83, undefined, 's'));
            fixture.detectChanges();
            tick(201);

            expect(manager.activeItemIndex).toBe(1);

            dispatchEvent(listEl, createKeyboardEvent('keydown', 68, undefined, 'd'));
            fixture.detectChanges();
            tick(200);

            expect(manager.activeItemIndex).toBe(3);
        }));

        it('should be able to select all options', () => {
            const list: McListSelection = selectionList.componentInstance;

            expect(list.options.toArray().every((option) => option.selected)).toBe(false);

            list.selectAll();
            fixture.detectChanges();

            expect(list.options.toArray().every((option) => option.selected)).toBe(true);
        });

        it('should be able to deselect all options', () => {
            const list: McListSelection = selectionList.componentInstance;

            list.options.forEach((option) => option.toggle());
            expect(list.options.toArray().every((option) => option.selected)).toBe(true);

            list.deselectAll();
            fixture.detectChanges();

            expect(list.options.toArray().every((option) => option.selected)).toBe(false);
        });

        it('should update the list value when an item is selected programmatically', () => {
            const list: McListSelection = selectionList.componentInstance;

            expect(list.selectionModel.isEmpty()).toBe(true);

            listOptions[0].componentInstance.selected = true;
            listOptions[2].componentInstance.selected = true;
            fixture.detectChanges();

            expect(list.selectionModel.isEmpty()).toBe(false);
            expect(list.selectionModel.isSelected(listOptions[0].componentInstance)).toBe(true);
            expect(list.selectionModel.isSelected(listOptions[2].componentInstance)).toBe(true);
        });

        it('should update the item selected state when it is selected via the model', () => {
            const list: McListSelection = selectionList.componentInstance;
            const item: McListOption = listOptions[0].componentInstance;

            expect(item.selected).toBe(false);

            list.selectionModel.select(item);
            fixture.detectChanges();

            expect(item.selected).toBe(true);
        });
    });

    describe('with list option selected', () => {
        let fixture: ComponentFixture<SelectionListWithSelectedOption>;
        let listItemEl: DebugElement;
        let selectionList: DebugElement;

        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [McListModule],
                declarations: [SelectionListWithSelectedOption]
            });

            TestBed.compileComponents();
        }));

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(SelectionListWithSelectedOption);
            listItemEl = fixture.debugElement.query(By.directive(McListOption));
            selectionList = fixture.debugElement.query(By.directive(McListSelection));
            fixture.detectChanges();
        }));

        it('should set its initial selected state in the selectionModel', () => {
            const optionEl = listItemEl.injector.get<McListOption>(McListOption);
            const selectedOptions = selectionList.componentInstance.selectionModel;
            expect(selectedOptions.isSelected(optionEl)).toBeTruthy();
        });
    });

    describe('with tabindex', () => {

        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [McListModule],
                declarations: [
                    SelectionListWithTabindexAttr,
                    SelectionListWithTabindexInDisabledState
                ]
            });

            TestBed.compileComponents();
        }));

        it('should properly handle native tabindex attribute', () => {
            const fixture = TestBed.createComponent(SelectionListWithTabindexAttr);
            fixture.detectChanges();
            const selectionList = fixture.debugElement.query(By.directive(McListSelection));

            expect(selectionList.componentInstance.tabIndex)
                .toBe(5, 'Expected the selection-list tabindex to be set to the property value.');
        });

        it('should set tabindex to "-1" in disabled state', () => {
            const fixture = TestBed.createComponent(SelectionListWithTabindexInDisabledState);
            const selectionList = fixture.debugElement.query(By.directive(McListSelection));

            expect(selectionList.componentInstance.tabIndex)
                .toBe(0, 'Expected the tabIndex to be set to "0" by default.');

            fixture.componentInstance.disabled = true;
            fixture.detectChanges();

            expect(selectionList.componentInstance.tabIndex)
                .toBe(-1, 'Expected the tabIndex to be set to "-1".');
        });
    });

    describe('with single option', () => {
        let fixture: ComponentFixture<SelectionListWithOnlyOneOption>;
        let listOption: DebugElement;
        let listItemEl: DebugElement;

        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [McListModule],
                declarations: [
                    SelectionListWithListOptions,
                    SelectionListWithCheckboxPositionAfter,
                    SelectionListWithListDisabled,
                    SelectionListWithOnlyOneOption
                ]
            });

            TestBed.compileComponents();
        }));

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(SelectionListWithOnlyOneOption);
            listOption = fixture.debugElement.query(By.directive(McListOption));
            listItemEl = fixture.debugElement.query(By.css('.mc-list-option'));
            fixture.detectChanges();
        }));

        it('should be focused when focus on nativeElements', fakeAsync(() => {
            dispatchFakeEvent(listOption.nativeElement, 'focusin');
            flush();
            fixture.detectChanges();

            expect(listItemEl.nativeElement.className).toContain('mc-focused');

            dispatchFakeEvent(listOption.nativeElement, 'blur');
            fixture.detectChanges();

            expect(listItemEl.nativeElement.className).not.toContain('mc-focused');
        }));
    });

    xdescribe('with option disabled', () => {
        let fixture: ComponentFixture<SelectionListWithDisabledOption>;

        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [McListModule],
                declarations: [SelectionListWithDisabledOption]
            });

            TestBed.compileComponents();
        }));

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(SelectionListWithDisabledOption);

            fixture.debugElement.query(By.directive(McListOption));

            fixture.detectChanges();
        }));
    });

    describe('with list disabled', () => {
        let fixture: ComponentFixture<SelectionListWithListDisabled>;
        let listOption: DebugElement[];
        let selectionList: DebugElement;

        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [McListModule],
                declarations: [
                    SelectionListWithListOptions,
                    SelectionListWithCheckboxPositionAfter,
                    SelectionListWithListDisabled,
                    SelectionListWithOnlyOneOption
                ]
            });

            TestBed.compileComponents();
        }));

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(SelectionListWithListDisabled);
            listOption = fixture.debugElement.queryAll(By.directive(McListOption));
            selectionList = fixture.debugElement.query(By.directive(McListSelection));
            fixture.detectChanges();
        }));

        it('should not allow selection on disabled selection-list', () => {
            const testListItem = listOption[2].injector.get<McListOption>(McListOption);
            const selectList =
                selectionList.injector.get<McListSelection>(McListSelection).selectionModel;

            expect(selectList.selected.length).toBe(0);

            const event = createMouseEvent('click');

            testListItem.handleClick(event);
            fixture.detectChanges();

            expect(selectList.selected.length).toBe(0);
        });
    });

    xdescribe('with checkbox position after', () => {
        let fixture: ComponentFixture<SelectionListWithCheckboxPositionAfter>;

        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [McListModule],
                declarations: [
                    SelectionListWithListOptions,
                    SelectionListWithCheckboxPositionAfter,
                    SelectionListWithListDisabled,
                    SelectionListWithOnlyOneOption
                ]
            });

            TestBed.compileComponents();
        }));

        beforeEach(waitForAsync(() => {
            fixture = TestBed.createComponent(SelectionListWithCheckboxPositionAfter);
            fixture.detectChanges();
        }));

        // it('should be able to customize checkbox position', () => {
        //     const listItemContent = fixture.debugElement.query(By.css('.mc-list-item-content'));
        //     expect(listItemContent.nativeElement.classList).toContain('mc-list-item-content-reverse');
        // });
    });
});

xdescribe('McListSelection with forms', () => {

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [McListModule, FormsModule, ReactiveFormsModule],
            declarations: [
                SelectionListWithModel,
                SelectionListWithFormControl,
                SelectionListWithPreselectedOption,
                SelectionListWithPreselectedOptionAndModel,
                SelectionListWithPreselectedFormControlOnPush
            ]
        });

        TestBed.compileComponents();
    }));

    describe('and ngModel', () => {
        let fixture: ComponentFixture<SelectionListWithModel>;
        let selectionListDebug: DebugElement;
        let listOptions: McListOption[];
        let ngModel: NgModel;

        beforeEach(() => {
            fixture = TestBed.createComponent(SelectionListWithModel);
            fixture.detectChanges();

            selectionListDebug = fixture.debugElement.query(By.directive(McListSelection));
            ngModel = selectionListDebug.injector.get<NgModel>(NgModel);
            listOptions = fixture.debugElement.queryAll(By.directive(McListOption))
                .map((optionDebugEl) => optionDebugEl.componentInstance);
        });

        it('should update the model if an option got selected programmatically', fakeAsync(() => {
            expect(fixture.componentInstance.selectedOptions.length)
                .toBe(0, 'Expected no options to be selected by default');

            listOptions[0].toggle();
            fixture.detectChanges();

            tick();

            expect(fixture.componentInstance.selectedOptions.length)
                .toBe(1, 'Expected first list option to be selected');
        }));

        it('should update the model if an option got clicked', fakeAsync(() => {
            expect(fixture.componentInstance.selectedOptions.length)
                .toBe(0, 'Expected no options to be selected by default');

            dispatchFakeEvent(listOptions[0].getHostElement(), 'click');
            fixture.detectChanges();

            tick();

            expect(fixture.componentInstance.selectedOptions.length)
                .toBe(1, 'Expected first list option to be selected');
        }));

        it('should update the options if a model value is set', fakeAsync(() => {
            expect(fixture.componentInstance.selectedOptions.length)
                .toBe(0, 'Expected no options to be selected by default');

            fixture.componentInstance.selectedOptions = ['opt3'];
            fixture.detectChanges();

            tick();

            expect(fixture.componentInstance.selectedOptions.length)
                .toBe(1, 'Expected first list option to be selected');
        }));

        it('should set the selection-list to touched on blur', fakeAsync(() => {
            expect(ngModel.touched)
                .toBe(false, 'Expected the selection-list to be untouched by default.');

            dispatchFakeEvent(selectionListDebug.nativeElement, 'blur');
            fixture.detectChanges();

            tick();

            expect(ngModel.touched).toBe(true, 'Expected the selection-list to be touched after blur');
        }));

        it('should be pristine by default', fakeAsync(() => {
            fixture = TestBed.createComponent(SelectionListWithModel);
            fixture.componentInstance.selectedOptions = ['opt2'];
            fixture.detectChanges();

            ngModel =
                fixture.debugElement.query(By.directive(McListSelection)).injector.get<NgModel>(NgModel);
            listOptions = fixture.debugElement.queryAll(By.directive(McListOption))
                .map((optionDebugEl) => optionDebugEl.componentInstance);

            // Flush the initial tick to ensure that every action from the ControlValueAccessor
            // happened before the actual test starts.
            tick();

            expect(ngModel.pristine)
                .toBe(true, 'Expected the selection-list to be pristine by default.');

            listOptions[1].toggle();
            fixture.detectChanges();

            tick();

            expect(ngModel.pristine)
                .toBe(false, 'Expected the selection-list to be dirty after state change.');
        }));

        it('should remove a selected option from the value on destroy', fakeAsync(() => {
            listOptions[1].selected = true;
            listOptions[2].selected = true;

            fixture.detectChanges();

            expect(fixture.componentInstance.selectedOptions).toEqual(['opt2', 'opt3']);

            fixture.componentInstance.renderLastOption = false;
            fixture.detectChanges();
            tick();

            expect(fixture.componentInstance.selectedOptions).toEqual(['opt2']);
        }));

        it('should update the model if an option got selected via the model', fakeAsync(() => {
            expect(fixture.componentInstance.selectedOptions).toEqual([]);

            selectionListDebug.componentInstance.selectionModel.select(listOptions[0]);
            fixture.detectChanges();
            tick();

            expect(fixture.componentInstance.selectedOptions).toEqual(['opt1']);
        }));

    });

    describe('and formControl', () => {
        let fixture: ComponentFixture<SelectionListWithFormControl>;
        let listOptions: McListOption[];

        beforeEach(() => {
            fixture = TestBed.createComponent(SelectionListWithFormControl);
            fixture.detectChanges();

            listOptions = fixture.debugElement.queryAll(By.directive(McListOption))
                .map((optionDebugEl) => optionDebugEl.componentInstance);
        });

        it('should be able to disable options from the control', () => {
            expect(listOptions.every((option) => !option.disabled))
                .toBe(true, 'Expected every list option to be enabled.');

            fixture.componentInstance.formControl.disable();
            fixture.detectChanges();

            expect(listOptions.every((option) => option.disabled))
                .toBe(true, 'Expected every list option to be disabled.');
        });

        it('should be able to set the value through the form control', () => {
            expect(listOptions.every((option) => !option.selected))
                .toBe(true, 'Expected every list option to be unselected.');

            fixture.componentInstance.formControl.setValue(['opt2', 'opt3']);
            fixture.detectChanges();

            expect(listOptions[1].selected).toBe(true, 'Expected second option to be selected.');
            expect(listOptions[2].selected).toBe(true, 'Expected third option to be selected.');

            fixture.componentInstance.formControl.setValue(null);
            fixture.detectChanges();

            expect(listOptions.every((option) => !option.selected))
                .toBe(true, 'Expected every list option to be unselected.');
        });

        it('should mark options as selected when the value is set before they are initialized', () => {
            fixture.destroy();
            fixture = TestBed.createComponent(SelectionListWithFormControl);

            fixture.componentInstance.formControl.setValue(['opt2', 'opt3']);
            fixture.detectChanges();

            listOptions = fixture.debugElement.queryAll(By.directive(McListOption))
                .map((optionDebugEl) => optionDebugEl.componentInstance);

            expect(listOptions[1].selected).toBe(true, 'Expected second option to be selected.');
            expect(listOptions[2].selected).toBe(true, 'Expected third option to be selected.');
        });
    });

    describe('preselected values', () => {
        it('should add preselected options to the model value', fakeAsync(() => {
            const fixture = TestBed.createComponent(SelectionListWithPreselectedOption);
            const listOptions = fixture.debugElement.queryAll(By.directive(McListOption))
                .map((optionDebugEl) => optionDebugEl.componentInstance);

            fixture.detectChanges();
            tick();

            expect(listOptions[1].selected).toBe(true);
            expect(fixture.componentInstance.selectedOptions).toEqual(['opt2']);
        }));

        it('should handle preselected option both through the model and the view', fakeAsync(() => {
            const fixture = TestBed.createComponent(SelectionListWithPreselectedOptionAndModel);
            const listOptions = fixture.debugElement.queryAll(By.directive(McListOption))
                .map((optionDebugEl) => optionDebugEl.componentInstance);

            fixture.detectChanges();
            tick();

            expect(listOptions[0].selected).toBe(true);
            expect(listOptions[1].selected).toBe(true);
            expect(fixture.componentInstance.selectedOptions).toEqual(['opt1', 'opt2']);
        }));

        it('should show the item as selected when preselected inside OnPush parent', fakeAsync(() => {
            const fixture = TestBed.createComponent(SelectionListWithPreselectedFormControlOnPush);
            fixture.detectChanges();

            const option = fixture.debugElement.queryAll(By.directive(McListOption))[1];

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            expect(option.componentInstance.selected).toBe(true);
        }));
    });

    describe('with custom compare function', () => {
        it('should use a custom comparator to determine which options are selected', fakeAsync(() => {
            const fixture = TestBed.createComponent(SelectionListWithCustomComparator);
            const testComponent = fixture.componentInstance;

            testComponent.compareWith = jasmine.createSpy('comparator', (o1: any, o2: any) => {
                return o1 && o2 && o1.id === o2.id;
            }).and.callThrough();

            testComponent.selectedOptions = [{id: 2, label: 'Two'}];
            fixture.detectChanges();
            tick();

            expect(testComponent.compareWith).toHaveBeenCalled();
            expect(testComponent.optionInstances.toArray()[1].selected).toBe(true);
        }));
    });
});


@Component({
    template: `
    <mat-selection-list [(ngModel)]="selectedOptions" [compareWith]="compareWith">
      <mat-list-option *ngFor="let option of options" [value]="option">
        {{option.label}}
      </mat-list-option>
    </mat-selection-list>`
})
class SelectionListWithCustomComparator {
    @ViewChildren(McListOption) optionInstances: QueryList<McListOption>;
    selectedOptions: { id: number; label: string }[] = [];
    compareWith?: (o1: any, o2: any) => boolean;
    options = [
        {id: 1, label: 'One'},
        {id: 2, label: 'Two'},
        {id: 3, label: 'Three'}
    ];
}

@Component({
    template: `
        <mc-list-selection
                id="selection-list-1"
                [autoSelect]="false"
                [noUnselectLast]="false"
                multiple="keyboard"
                (selectionChange)="onValueChange($event)">
            <mc-list-option checkboxPosition="before" disabled="true" [value]="'inbox'">
                Inbox (disabled selection-option)
            </mc-list-option>
            <mc-list-option id="testSelect" checkboxPosition="before" [value]="'starred'">
                Starred
            </mc-list-option>
            <mc-list-option checkboxPosition="before" [value]="'sent-mail'">
                Sent Mail
            </mc-list-option>
            <mc-list-option checkboxPosition="before" [value]="'drafts'" *ngIf="showLastOption">
                Drafts
            </mc-list-option>
        </mc-list-selection>`
})
class SelectionListWithListOptions {
    showLastOption: boolean = true;

    onValueChange(_change: McListSelectionChange) {}
}

@Component({
    template: `
        <mc-list-selection id="selection-list-2">
            <mc-list-option checkboxPosition="after">
                Inbox (disabled selection-option)
            </mc-list-option>
            <mc-list-option id="testSelect" checkboxPosition="after">
                Starred
            </mc-list-option>
            <mc-list-option checkboxPosition="after">
                Sent Mail
            </mc-list-option>
            <mc-list-option checkboxPosition="after">
                Drafts
            </mc-list-option>
        </mc-list-selection>`
})
class SelectionListWithCheckboxPositionAfter {}

@Component({
    template: `
        <mc-list-selection id="selection-list-3" [disabled]=true>
            <mc-list-option checkboxPosition="after">
                Inbox (disabled selection-option)
            </mc-list-option>
            <mc-list-option id="testSelect" checkboxPosition="after">
                Starred
            </mc-list-option>
            <mc-list-option checkboxPosition="after">
                Sent Mail
            </mc-list-option>
            <mc-list-option checkboxPosition="after">
                Drafts
            </mc-list-option>
        </mc-list-selection>`
})
class SelectionListWithListDisabled {}

@Component({
    template: `
        <mc-list-selection>
            <mc-list-option [disabled]="disableItem">Item</mc-list-option>
        </mc-list-selection>
    `
})
class SelectionListWithDisabledOption {
    disableItem: boolean = false;
}

@Component({
    template: `
        <mc-list-selection>
            <mc-list-option [selected]="true">Item</mc-list-option>
        </mc-list-selection>`
})
class SelectionListWithSelectedOption {}

@Component({
    template: `
        <mc-list-selection id="selection-list-4">
            <mc-list-option checkboxPosition="after" id="123">
                Inbox
            </mc-list-option>
        </mc-list-selection>`
})
class SelectionListWithOnlyOneOption {}

@Component({
    template: `
        <mc-list-selection [tabIndex]="5"></mc-list-selection>`
})
class SelectionListWithTabindexAttr {}

@Component({
    template: `
        <mc-list-selection [disabled]="disabled"></mc-list-selection>`
})
class SelectionListWithTabindexInDisabledState {
    tabIndex: number;
    disabled: boolean;
}

@Component({
    template: `
        <mc-list-selection [(ngModel)]="selectedOptions" [autoSelect]="false">
            <mc-list-option [value]="'opt1'">Option 1</mc-list-option>
            <mc-list-option [value]="'opt2'">Option 2</mc-list-option>
            <mc-list-option [value]="'opt3'" *ngIf="renderLastOption">Option 3</mc-list-option>
        </mc-list-selection>`
})
class SelectionListWithModel {
    selectedOptions: string[] = [];
    renderLastOption = true;
}

@Component({
    template: `
        <mc-list-selection [formControl]="formControl">
            <mc-list-option [value]="'opt1'">Option 1</mc-list-option>
            <mc-list-option [value]="'opt2'">Option 2</mc-list-option>
            <mc-list-option [value]="'opt3'">Option 3</mc-list-option>
        </mc-list-selection>
    `
})
class SelectionListWithFormControl {
    formControl = new FormControl();
}


@Component({
    template: `
        <mc-list-selection [(ngModel)]="selectedOptions">
            <mc-list-option [value]="'opt1'">Option 1</mc-list-option>
            <mc-list-option [value]="'opt2'" selected>Option 2</mc-list-option>
        </mc-list-selection>`
})
class SelectionListWithPreselectedOption {
    selectedOptions: string[];
}


@Component({
    template: `
        <mc-list-selection [(ngModel)]="selectedOptions">
            <mc-list-option [value]="'opt1'">Option 1</mc-list-option>
            <mc-list-option [value]="'opt2'" selected>Option 2</mc-list-option>
        </mc-list-selection>`
})
class SelectionListWithPreselectedOptionAndModel {
    selectedOptions = ['opt1'];
}


@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <mc-list-selection [formControl]="formControl">
            <mc-list-option *ngFor="let opt of opts" [value]="opt">{{opt}}</mc-list-option>
        </mc-list-selection>
    `
})
class SelectionListWithPreselectedFormControlOnPush {
    opts = ['opt1', 'opt2', 'opt3'];
    formControl = new FormControl(['opt2']);
}
