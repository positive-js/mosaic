/* tslint:disable:no-magic-numbers no-empty */
// tslint:disable:mocha-no-side-effect-code
// tslint:disable:max-func-body-length
import { animate, style, transition, trigger } from '@angular/animations';
import { Directionality, Direction } from '@angular/cdk/bidi';
import {
    Component,
    DebugElement,
    NgZone,
    Provider,
    QueryList,
    Type,
    ViewChild,
    ViewChildren
} from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormControl, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FocusKeyManager } from '@ptsecurity/cdk/a11y';
import {
    BACKSPACE,
    DELETE,
    ENTER,
    LEFT_ARROW,
    RIGHT_ARROW,
    SPACE,
    TAB,
    HOME,
    END
} from '@ptsecurity/cdk/keycodes';
import {
    createKeyboardEvent,
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    dispatchMouseEvent,
    typeInElement,
    MockNgZone
} from '@ptsecurity/cdk/testing';
import { McFormField, McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { Subject } from 'rxjs';

import { McInputModule } from '../input/index';

import { McTagEvent, McTagList, McTagRemove, McTagsModule } from './index';
import { McTagInputEvent } from './tag-input';
import { McTag } from './tag.component';


describe('McTagList', () => {
    let fixture: ComponentFixture<any>;
    let tagListDebugElement: DebugElement;
    let tagListNativeElement: HTMLElement;
    let tagListInstance: McTagList;
    let testComponent: StandardTagList;
    let tags: QueryList<McTag>;
    let manager: FocusKeyManager<McTag>;
    let zone: MockNgZone;
    let dirChange: Subject<Direction>;

    describe('StandardTagList', () => {
        describe('basic behaviors', () => {
            beforeEach(() => {
                setupStandardList();
            });

            it('should add the `mc-tag-list` class', () => {
                expect(tagListNativeElement.classList).toContain('mc-tag-list');
            });

            it('height should be 30px', () => {
                expect(tagListNativeElement.getBoundingClientRect().height).toBe(30);
            });

            it('should not have the aria-selected attribute when is not selectable', () => {
                testComponent.selectable = false;
                fixture.detectChanges();

                const tagsValid = tags.toArray().every((tag) =>
                    !tag.selectable && !tag._elementRef.nativeElement.hasAttribute('aria-selected'));

                expect(tagsValid).toBe(true);
            });

            it('should toggle the tags disabled state based on whether it is disabled', () => {
                expect(tags.toArray().every((tag) => tag.disabled)).toBe(false);

                tagListInstance.disabled = true;
                fixture.detectChanges();

                expect(tags.toArray().every((tag) => tag.disabled)).toBe(true);

                tagListInstance.disabled = false;
                fixture.detectChanges();

                expect(tags.toArray().every((tag) => tag.disabled)).toBe(false);
            });

            it('should disable a tag that is added after the list became disabled', fakeAsync(() => {
                expect(tags.toArray().every((tag) => tag.disabled)).toBe(false);

                tagListInstance.disabled = true;
                fixture.detectChanges();

                expect(tags.toArray().every((tag) => tag.disabled)).toBe(true);

                fixture.componentInstance.tags.push(5, 6);
                fixture.detectChanges();
                tick();
                fixture.detectChanges();

                expect(tags.toArray().every((tag) => tag.disabled)).toBe(true);
            }));

        });

        describe('with selected tags', () => {
            beforeEach(() => {
                fixture = createComponent(SelectedTagList);
                fixture.detectChanges();
                tagListDebugElement = fixture.debugElement.query(By.directive(McTagList));
                tagListNativeElement = tagListDebugElement.nativeElement;
            });

            it('should not override tags selected', () => {
                const instanceTags = fixture.componentInstance.tags.toArray();

                expect(instanceTags[0].selected).toBe(true, 'Expected first option to be selected.');
                expect(instanceTags[1].selected).toBe(false, 'Expected second option to be not selected.');
                expect(instanceTags[2].selected).toBe(true, 'Expected third option to be selected.');
            });

            it('should not have role when empty', () => {
                fixture.componentInstance.foods = [];
                fixture.detectChanges();

                expect(tagListNativeElement.getAttribute('role')).toBeNull('Expect no role attribute');
            });
        });

        describe('focus behaviors', () => {
            beforeEach(() => {
                setupStandardList();
                manager = tagListInstance.keyManager;
            });

            it('should focus the first tag on focus', () => {
                tagListInstance.focus();
                fixture.detectChanges();

                expect(manager.activeItemIndex).toBe(0);
            });

            it('should watch for tag focus', () => {
                const array = tags.toArray();
                const lastIndex = array.length - 1;
                const lastItem = array[lastIndex];
                lastItem.focus();
                fixture.detectChanges();

                expect(manager.activeItemIndex).toBe(lastIndex);
            });

            it('should watch for tag focus', () => {
                const array = tags.toArray();
                const lastIndex = array.length - 1;
                const lastItem = array[lastIndex];

                lastItem.focus();
                fixture.detectChanges();

                expect(manager.activeItemIndex).toBe(lastIndex);
            });

            it('should be able to become focused when disabled', () => {
                expect(tagListInstance.focused).toBe(false, 'Expected list to not be focused.');

                tagListInstance.disabled = true;
                fixture.detectChanges();

                tagListInstance.focus();
                fixture.detectChanges();

                expect(tagListInstance.focused).toBe(false, 'Expected list to continue not to be focused');
            });

            it('should remove the tabindex from the list if it is disabled', () => {
                expect(tagListNativeElement.getAttribute('tabindex')).toBeTruthy();

                tagListInstance.disabled = true;
                fixture.detectChanges();

                expect(tagListNativeElement.hasAttribute('tabindex')).toBeFalsy();
            });

            describe('on tag destroy', () => {

                it('should focus the next item', () => {
                    const array = tags.toArray();
                    const midItem = array[2];

                    // Focus the middle item
                    midItem.focus();

                    // Destroy the middle item
                    testComponent.tags.splice(2, 1);
                    fixture.detectChanges();

                    // It focuses the 4th item (now at index 2)
                    expect(manager.activeItemIndex).toEqual(2);
                });

                it('should focus the previous item', fakeAsync(() => {
                    const array = tags.toArray();
                    const lastIndex = array.length - 1;
                    const lastItem = array[lastIndex];

                    // Focus the last item
                    lastItem.focus();
                    flush();

                    // Destroy the last item
                    testComponent.tags.pop();
                    fixture.detectChanges();

                    // It focuses the next-to-last item
                    expect(manager.activeItemIndex).toEqual(lastIndex - 1);
                }));

                it('should not focus if tag list is not focused', () => {
                    const array = tags.toArray();
                    const midItem = array[2];

                    // Focus and blur the middle item
                    midItem.focus();
                    midItem.blur();
                    zone.simulateZoneExit();

                    // Destroy the middle item
                    testComponent.tags.splice(2, 1);
                    fixture.detectChanges();

                    // Should not have focus
                    expect(tagListInstance.keyManager.activeItemIndex).toEqual(-1);
                });

                it(
                    'should move focus to the last tag when the focused tag was deleted inside a component with animations',
                    fakeAsync(() => {
                        fixture.destroy();
                        TestBed.resetTestingModule();
                        fixture = createComponent(StandardTagListWithAnimations, [], BrowserAnimationsModule);
                        fixture.detectChanges();

                        tagListDebugElement = fixture.debugElement.query(By.directive(McTagList));
                        tagListNativeElement = tagListDebugElement.nativeElement;
                        tagListInstance = tagListDebugElement.componentInstance;
                        testComponent = fixture.debugElement.componentInstance;
                        tags = tagListInstance.tags;

                        tags.last.focus();
                        flush();
                        fixture.detectChanges();

                        expect(tagListInstance.keyManager.activeItemIndex).toBe(tags.length - 1);

                        dispatchKeyboardEvent(tags.last._elementRef.nativeElement, 'keydown', BACKSPACE);
                        fixture.detectChanges();
                        tick(500);

                        expect(tagListInstance.keyManager.activeItemIndex).toBe(tags.length - 1);
                    })
                );

            });
        });

        describe('keyboard behavior', () => {
            describe('LTR (default)', () => {
                beforeEach(() => {
                    setupStandardList();
                    manager = tagListInstance.keyManager;
                });

                it('should focus previous item when press LEFT ARROW', fakeAsync(() => {
                    const nativeTags = tagListNativeElement.querySelectorAll('mc-tag');
                    const lastNativeChip = nativeTags[nativeTags.length - 1] as HTMLElement;

                    const LEFT_EVENT = createKeyboardEvent('keydown', LEFT_ARROW, lastNativeChip);
                    const array = tags.toArray();
                    const lastIndex = array.length - 1;
                    const lastItem = array[lastIndex];

                    // Focus the last item in the array
                    lastItem.focus();
                    flush();
                    expect(manager.activeItemIndex).toEqual(lastIndex);

                    // Press the LEFT arrow
                    tagListInstance.keydown(LEFT_EVENT);
                    tagListInstance.blur(); // Simulate focus leaving the list and going to the tag.
                    fixture.detectChanges();

                    // It focuses the next-to-last item
                    expect(manager.activeItemIndex).toEqual(lastIndex - 1);
                }));

                it('should focus next item when press RIGHT ARROW', fakeAsync(() => {
                    const nativeTags = tagListNativeElement.querySelectorAll('mc-tag');
                    const firstNativeChip = nativeTags[0] as HTMLElement;

                    const RIGHT_EVENT: KeyboardEvent = createKeyboardEvent('keydown', RIGHT_ARROW, firstNativeChip);
                    const array = tags.toArray();
                    const firstItem = array[0];

                    // Focus the last item in the array
                    firstItem.focus();
                    flush();
                    expect(manager.activeItemIndex).toEqual(0);

                    // Press the RIGHT arrow
                    tagListInstance.keydown(RIGHT_EVENT);
                    tagListInstance.blur(); // Simulate focus leaving the list and going to the tag.
                    fixture.detectChanges();

                    // It focuses the next-to-last item
                    expect(manager.activeItemIndex).toEqual(1);
                }));

                it('should not handle arrow key events from non-chip elements', () => {
                    const event: KeyboardEvent = createKeyboardEvent('keydown', RIGHT_ARROW, tagListNativeElement);
                    const initialActiveIndex = manager.activeItemIndex;

                    tagListInstance.keydown(event);
                    fixture.detectChanges();

                    expect(manager.activeItemIndex)
                        .toBe(initialActiveIndex, 'Expected focused item not to have changed.');
                });

                it('should focus the first item when pressing HOME', () => {
                    const nativeTags = tagListNativeElement.querySelectorAll('mc-tag');
                    const lastNativeChip = nativeTags[nativeTags.length - 1] as HTMLElement;
                    const HOME_EVENT = createKeyboardEvent('keydown', HOME, lastNativeChip);
                    const array = tags.toArray();
                    const lastItem = array[array.length - 1];

                    lastItem.focus();
                    expect(manager.activeItemIndex).toBe(array.length - 1);

                    tagListInstance.keydown(HOME_EVENT);
                    fixture.detectChanges();

                    expect(manager.activeItemIndex).toBe(0);
                    expect(HOME_EVENT.defaultPrevented).toBe(true);
                });

                it('should focus the last item when pressing END', () => {
                    const nativeTags = tagListNativeElement.querySelectorAll('mc-tag');
                    const END_EVENT = createKeyboardEvent('keydown', END, nativeTags[0]);

                    expect(manager.activeItemIndex).toBe(-1);

                    tagListInstance.keydown(END_EVENT);
                    fixture.detectChanges();

                    expect(manager.activeItemIndex).toBe(tags.length - 1);
                    expect(END_EVENT.defaultPrevented).toBe(true);
                });

            });

            describe('RTL', () => {
                beforeEach(() => {
                    setupStandardList('rtl');
                    manager = tagListInstance.keyManager;
                });

                it('should focus previous item when press RIGHT ARROW', fakeAsync(() => {
                    const nativeTags = tagListNativeElement.querySelectorAll('mc-tag');
                    const lastNativeChip = nativeTags[nativeTags.length - 1] as HTMLElement;

                    const RIGHT_EVENT: KeyboardEvent =
                        createKeyboardEvent('keydown', RIGHT_ARROW, lastNativeChip);
                    const array = tags.toArray();
                    const lastIndex = array.length - 1;
                    const lastItem = array[lastIndex];

                    // Focus the last item in the array
                    lastItem.focus();
                    flush();
                    expect(manager.activeItemIndex).toEqual(lastIndex);

                    // Press the RIGHT arrow
                    tagListInstance.keydown(RIGHT_EVENT);
                    tagListInstance.blur(); // Simulate focus leaving the list and going to the tag.
                    fixture.detectChanges();

                    // It focuses the next-to-last item
                    expect(manager.activeItemIndex).toEqual(lastIndex - 1);
                }));

                it('should focus next item when press LEFT ARROW', fakeAsync(() => {
                    const nativeTags = tagListNativeElement.querySelectorAll('mc-tag');
                    const firstNativeChip = nativeTags[0] as HTMLElement;

                    const LEFT_EVENT: KeyboardEvent =
                        createKeyboardEvent('keydown', LEFT_ARROW, firstNativeChip);
                    const array = tags.toArray();
                    const firstItem = array[0];

                    // Focus the last item in the array
                    firstItem.focus();
                    flush();
                    expect(manager.activeItemIndex).toEqual(0);

                    // Press the LEFT arrow
                    tagListInstance.keydown(LEFT_EVENT);
                    tagListInstance.blur(); // Simulate focus leaving the list and going to the tag.
                    fixture.detectChanges();

                    // It focuses the next-to-last item
                    expect(manager.activeItemIndex).toEqual(1);
                }));

                it('should allow focus to escape when tabbing away', fakeAsync(() => {
                    tagListInstance.keyManager.onKeydown(createKeyboardEvent('keydown', TAB));

                    expect(tagListInstance.tabIndex)
                        .toBe(-1, 'Expected tabIndex to be set to -1 temporarily.');

                    tick();

                    expect(tagListInstance.tabIndex).toBe(0, 'Expected tabIndex to be reset back to 0');
                }));

                it(`should use user defined tabIndex`, fakeAsync(() => {
                    tagListInstance.tabIndex = 4;

                    fixture.detectChanges();

                    expect(tagListInstance.tabIndex)
                        .toBe(4, 'Expected tabIndex to be set to user defined value 4.');

                    tagListInstance.keyManager.onKeydown(createKeyboardEvent('keydown', TAB));

                    expect(tagListInstance.tabIndex)
                        .toBe(-1, 'Expected tabIndex to be set to -1 temporarily.');

                    tick();

                    expect(tagListInstance.tabIndex).toBe(4, 'Expected tabIndex to be reset back to 4');
                }));
            });

            it('should account for the direction changing', fakeAsync(() => {
                setupStandardList();
                manager = tagListInstance.keyManager;

                const nativeTags = tagListNativeElement.querySelectorAll('mc-tag');
                const firstNativeChip = nativeTags[0] as HTMLElement;

                const RIGHT_EVENT: KeyboardEvent =
                    createKeyboardEvent('keydown', RIGHT_ARROW, firstNativeChip);
                const array = tags.toArray();
                const firstItem = array[0];

                firstItem.focus();
                flush();
                expect(manager.activeItemIndex).toBe(0);

                tagListInstance.keydown(RIGHT_EVENT);
                tagListInstance.blur();
                fixture.detectChanges();

                expect(manager.activeItemIndex).toBe(1);

                dirChange.next('rtl');
                fixture.detectChanges();

                tagListInstance.keydown(RIGHT_EVENT);
                tagListInstance.blur();
                fixture.detectChanges();

                expect(manager.activeItemIndex).toBe(0);
            }));
        });
    });

    describe('FormFieldTagList', () => {

        beforeEach(setupInputList);

        describe('keyboard behavior', () => {
            beforeEach(() => {
                manager = tagListInstance.keyManager;
            });

            it('should maintain focus if the active tag is deleted', fakeAsync(() => {
                const secondTag = fixture.nativeElement.querySelectorAll('.mc-tag')[1];

                secondTag.focus();
                fixture.detectChanges();
                flush();

                expect(tagListInstance.tags.toArray().findIndex((tag) => tag.hasFocus)).toBe(1);

                dispatchKeyboardEvent(secondTag, 'keydown', DELETE);
                fixture.detectChanges();
                flush();

                expect(tagListInstance.tags.toArray().findIndex((tag) => tag.hasFocus)).toBe(1);
            }));

            describe('when the input has focus', () => {

                it('should not focus the last tag when press DELETE', () => {
                    const nativeInput = fixture.nativeElement.querySelector('input');
                    const DELETE_EVENT: KeyboardEvent = createKeyboardEvent('keydown', DELETE, nativeInput);

                    nativeInput.focus();
                    expect(manager.activeItemIndex).toBe(-1);

                    tagListInstance.keydown(DELETE_EVENT);
                    fixture.detectChanges();

                    // It doesn't focus the last tag
                    expect(manager.activeItemIndex).toEqual(-1);
                });

                it('should focus the last tag when press BACKSPACE', () => {
                    const nativeInput = fixture.nativeElement.querySelector('input');
                    const BACKSPACE_EVENT: KeyboardEvent =
                        createKeyboardEvent('keydown', BACKSPACE, nativeInput);

                    // Focus the input
                    nativeInput.focus();
                    expect(manager.activeItemIndex).toBe(-1);

                    // Press the BACKSPACE key
                    tagListInstance.keydown(BACKSPACE_EVENT);
                    fixture.detectChanges();

                    // It focuses the last chip
                    expect(manager.activeItemIndex).toEqual(tags.length - 1);
                });

            });
        });

        // TODO Expected pixels
        xit('height should be 32px', () => {
            const formFieldElement = fixture.debugElement.query(By.directive(McFormField)).nativeElement;
            expect(formFieldElement.getBoundingClientRect().height).toBe(32);
        });

        it('should complete the stateChanges stream on destroy', () => {
            const spy = jasmine.createSpy('stateChanges complete');
            const subscription = tagListInstance.stateChanges.subscribe({complete: spy});

            fixture.destroy();
            expect(spy).toHaveBeenCalled();
            subscription.unsubscribe();
        });

        xit('should point the label id to the tag input', () => {
            const label = fixture.nativeElement.querySelector('label');
            const input = fixture.nativeElement.querySelector('input');

            fixture.detectChanges();

            expect(label.getAttribute('for')).toBeTruthy();
            expect(label.getAttribute('for')).toBe(input.getAttribute('id'));
            expect(label.getAttribute('aria-owns')).toBe(input.getAttribute('id'));
        });

    });

    describe('with tag remove', () => {
        let tagList: McTagList;
        let chipRemoveDebugElements: DebugElement[];

        beforeEach(() => {
            fixture = createComponent(TagListWithRemove);
            fixture.detectChanges();

            tagList = fixture.debugElement.query(By.directive(McTagList)).componentInstance;
            chipRemoveDebugElements = fixture.debugElement.queryAll(By.directive(McTagRemove));
            tags = tagList.tags;
        });

        it('should properly focus next item if tag is removed through click', () => {
            tags.toArray()[2].focus();

            // Destroy the third focused tag by dispatching a bubbling click event on the
            // associated tag remove element.
            dispatchMouseEvent(chipRemoveDebugElements[2].nativeElement, 'click');
            fixture.detectChanges();

            expect(tags.toArray()[2].value).not.toBe(2, 'Expected the third tag to be removed.');
            expect(tagList.keyManager.activeItemIndex).toBe(2);
        });
    });

    // todo need rethink this selection logic
    xdescribe('selection logic', () => {
        let nativeTags: HTMLElement[];

        beforeEach(() => {
            fixture = createComponent(BasicTagList);
            fixture.detectChanges();

            nativeTags = fixture.debugElement.queryAll(By.css('mc-tag'))
                .map((tag) => tag.nativeElement);

            tagListDebugElement = fixture.debugElement.query(By.directive(McTagList));
            tagListInstance = tagListDebugElement.componentInstance;
            tags = tagListInstance.tags;
        });

        it('should remove selection if tag has been removed', fakeAsync(() => {
            const instanceTags = fixture.componentInstance.tags;
            const tagList = fixture.componentInstance.tagList;
            const firstTag = nativeTags[0];
            dispatchKeyboardEvent(firstTag, 'keydown', SPACE);
            fixture.detectChanges();

            expect(instanceTags.first.selected).toBe(true, 'Expected first option to be selected.');
            expect(tagList.selected).toBe(tags.first, 'Expected first option to be selected.');

            fixture.componentInstance.foods = [];
            fixture.detectChanges();
            tick();

            expect(tagList.selected)
                .toBe(undefined, 'Expected selection to be removed when option no longer exists.');
        }));


        it('should select an option that was added after initialization', () => {
            fixture.componentInstance.foods.push({ viewValue: 'Potatoes', value: 'potatoes-8' });
            fixture.detectChanges();

            nativeTags = fixture.debugElement.queryAll(By.css('mc-tag'))
                .map((tag) => tag.nativeElement);
            const lastChip = nativeTags[8];
            dispatchKeyboardEvent(lastChip, 'keydown', SPACE);
            fixture.detectChanges();

            expect(fixture.componentInstance.tagList.value)
                .toContain('potatoes-8', 'Expect value contain the value of the last option');
            expect(fixture.componentInstance.tags.last.selected)
                .toBeTruthy('Expect last option selected');
        });

        // todo need rethink this selection logic
        xit('should not select disabled tags', () => {
            const array = tags.toArray();
            const disabledTag = nativeTags[2];
            dispatchKeyboardEvent(disabledTag, 'keydown', SPACE);
            fixture.detectChanges();

            expect(fixture.componentInstance.tagList.value)
                .toBeUndefined('Expect value to be undefined');
            expect(array[2].selected).toBeFalsy('Expect disabled tag not selected');
            expect(fixture.componentInstance.tagList.selected)
                .toBeUndefined('Expect no selected tags');
        });

    });

    describe('forms integration', () => {
        let nativeTags: HTMLElement[];

        describe('single selection', () => {
            beforeEach(() => {
                fixture = createComponent(BasicTagList);
                fixture.detectChanges();

                nativeTags = fixture.debugElement.queryAll(By.css('mc-tag'))
                    .map((tag) => tag.nativeElement);
                tags = fixture.componentInstance.tags;
            });

            it('should take an initial view value with reactive forms', () => {
                fixture.componentInstance.control = new FormControl('pizza-1');
                fixture.detectChanges();

                const array = tags.toArray();

                expect(array[1].selected).toBeTruthy('Expect pizza-1 tag to be selected');

                dispatchKeyboardEvent(nativeTags[1], 'keydown', SPACE);
                fixture.detectChanges();

                expect(array[1].selected).toBeFalsy('Expect tag to be not selected after toggle selected');
            });

            // todo need rethink this selection logic
            xit('should set the view value from the form', () => {
                const tagList = fixture.componentInstance.tagList;
                const array = tags.toArray();

                expect(tagList.value).toBeFalsy('Expect tag list to have no initial value');

                fixture.componentInstance.control.setValue('pizza-1');
                fixture.detectChanges();

                expect(array[1].selected).toBeTruthy('Expect tag to be selected');
            });

            // todo need rethink this selection logic
            xit('should update the form value when the view changes', () => {

                expect(fixture.componentInstance.control.value)
                    .toEqual(null, `Expected the control's value to be empty initially.`);

                dispatchKeyboardEvent(nativeTags[0], 'keydown', SPACE);
                fixture.detectChanges();

                expect(fixture.componentInstance.control.value)
                    .toEqual('steak-0', `Expected control's value to be set to the new option.`);
            });

            it('should clear the selection when a nonexistent option value is selected', () => {
                const array = tags.toArray();

                fixture.componentInstance.control.setValue('pizza-1');
                fixture.detectChanges();

                expect(array[1].selected)
                    .toBeTruthy(`Expected tag with the value to be selected.`);

                fixture.componentInstance.control.setValue('gibberish');

                fixture.detectChanges();

                expect(array[1].selected)
                    .toBeFalsy(`Expected tag with the old value not to be selected.`);
            });


            it('should clear the selection when the control is reset', () => {
                const array = tags.toArray();

                fixture.componentInstance.control.setValue('pizza-1');
                fixture.detectChanges();

                fixture.componentInstance.control.reset();
                fixture.detectChanges();

                expect(array[1].selected)
                    .toBeFalsy(`Expected tag with the old value not to be selected.`);
            });

            it('should set the control to touched when the tag list is touched', () => {
                expect(fixture.componentInstance.control.touched)
                    .toBe(false, 'Expected the control to start off as untouched.');

                const nativeTagList = fixture.debugElement.query(By.css('.mc-tag-list')).nativeElement;
                dispatchFakeEvent(nativeTagList, 'blur');

                expect(fixture.componentInstance.control.touched)
                    .toBe(true, 'Expected the control to be touched.');
            });

            it('should not set touched when a disabled tag list is touched', () => {
                expect(fixture.componentInstance.control.touched)
                    .toBe(false, 'Expected the control to start off as untouched.');

                fixture.componentInstance.control.disable();
                const nativeTagList = fixture.debugElement.query(By.css('.mc-tag-list')).nativeElement;
                dispatchFakeEvent(nativeTagList, 'blur');

                expect(fixture.componentInstance.control.touched)
                    .toBe(false, 'Expected the control to stay untouched.');
            });

            // todo need rethink this selection logic
            xit('should set the control to dirty when the tag list\'s value changes in the DOM', () => {
                expect(fixture.componentInstance.control.dirty)
                    .toEqual(false, `Expected control to start out pristine.`);

                dispatchKeyboardEvent(nativeTags[1], 'keydown', SPACE);
                fixture.detectChanges();

                expect(fixture.componentInstance.control.dirty)
                    .toEqual(true, `Expected control to be dirty after value was changed by user.`);
            });

            // todo need rethink this selection logic
            xit('should not set the control to dirty when the value changes programmatically', () => {
                expect(fixture.componentInstance.control.dirty)
                    .toEqual(false, `Expected control to start out pristine.`);

                fixture.componentInstance.control.setValue('pizza-1');

                expect(fixture.componentInstance.control.dirty)
                    .toEqual(false, `Expected control to stay pristine after programmatic change.`);
            });


            xit('should set an asterisk after the placeholder if the control is required', () => {
                let requiredMarker = fixture.debugElement.query(By.css('.mc-form-field-required-marker'));
                expect(requiredMarker)
                    .toBeNull(`Expected placeholder not to have an asterisk, as control was not required.`);

                fixture.componentInstance.isRequired = true;
                fixture.detectChanges();

                requiredMarker = fixture.debugElement.query(By.css('.mc-form-field-required-marker'));
                expect(requiredMarker)
                    .not.toBeNull(`Expected placeholder to have an asterisk, as control was required.`);
            });

            it('should be able to programmatically select a falsy option', () => {
                fixture.destroy();
                TestBed.resetTestingModule();

                const falsyFixture = createComponent(FalsyValueTagList);
                falsyFixture.detectChanges();

                falsyFixture.componentInstance.control.setValue([0]);
                falsyFixture.detectChanges();
                falsyFixture.detectChanges();

                expect(falsyFixture.componentInstance.tags.first.selected)
                    .toBe(true, 'Expected first option to be selected');
            });

            it('should not focus the active tag when the value is set programmatically', () => {
                const chipArray = fixture.componentInstance.tags.toArray();

                spyOn(chipArray[4], 'focus').and.callThrough();

                fixture.componentInstance.control.setValue('tags-4');
                fixture.detectChanges();

                expect(chipArray[4].focus).not.toHaveBeenCalled();
            });

            it('should blur the form field when the active tag is blurred', fakeAsync(() => {
                const formField: HTMLElement = fixture.nativeElement.querySelector('.mc-form-field');

                nativeTags[0].focus();
                flush();
                fixture.detectChanges();

                expect(formField.classList).toContain('cdk-focused');

                nativeTags[0].blur();
                fixture.detectChanges();
                zone.simulateZoneExit();
                fixture.detectChanges();

                expect(formField.classList).not.toContain('cdk-focused');
            }));
        });

        xdescribe('multiple selection', () => {
            beforeEach(() => {
                fixture = createComponent(MultiSelectionTagList);
                fixture.detectChanges();

                nativeTags = fixture.debugElement.queryAll(By.css('mc-tag'))
                    .map((tag) => tag.nativeElement);
                tags = fixture.componentInstance.tags;
            });

            it('should take an initial view value with reactive forms', () => {
                fixture.componentInstance.control = new FormControl(['pizza-1']);
                fixture.detectChanges();

                const array = tags.toArray();

                expect(array[1].selected).toBeTruthy('Expect pizza-1 tag to be selected');

                dispatchKeyboardEvent(nativeTags[1], 'keydown', SPACE);
                fixture.detectChanges();

                expect(array[1].selected).toBeFalsy('Expect tag to be not selected after toggle selected');
            });

            it('should set the view value from the form', () => {
                const tagList = fixture.componentInstance.tagList;
                const array = tags.toArray();

                expect(tagList.value).toBeFalsy('Expect tag list to have no initial value');

                fixture.componentInstance.control.setValue(['pizza-1']);
                fixture.detectChanges();

                expect(array[1].selected).toBeTruthy('Expect tag to be selected');
            });

            it('should update the form value when the view changes', () => {

                expect(fixture.componentInstance.control.value)
                    .toEqual(null, `Expected the control's value to be empty initially.`);

                dispatchKeyboardEvent(nativeTags[0], 'keydown', SPACE);
                fixture.detectChanges();

                expect(fixture.componentInstance.control.value)
                    .toEqual(['steak-0'], `Expected control's value to be set to the new option.`);
            });

            it('should clear the selection when a nonexistent option value is selected', () => {
                const array = tags.toArray();

                fixture.componentInstance.control.setValue(['pizza-1']);
                fixture.detectChanges();

                expect(array[1].selected)
                    .toBeTruthy(`Expected tag with the value to be selected.`);

                fixture.componentInstance.control.setValue(['gibberish']);

                fixture.detectChanges();

                expect(array[1].selected)
                    .toBeFalsy(`Expected tag with the old value not to be selected.`);
            });


            it('should clear the selection when the control is reset', () => {
                const array = tags.toArray();

                fixture.componentInstance.control.setValue(['pizza-1']);
                fixture.detectChanges();

                fixture.componentInstance.control.reset();
                fixture.detectChanges();

                expect(array[1].selected)
                    .toBeFalsy(`Expected tag with the old value not to be selected.`);
            });
        });
    });

    describe('tag list with tag input', () => {
        let nativeTags: HTMLElement[];

        beforeEach(() => {
            fixture = createComponent(InputTagList);
            fixture.detectChanges();

            nativeTags = fixture.debugElement.queryAll(By.css('mc-tag'))
                .map((tag) => tag.nativeElement);
        });

        it('should take an initial view value with reactive forms', () => {
            fixture.componentInstance.control = new FormControl(['pizza-1']);
            fixture.detectChanges();

            const array = fixture.componentInstance.tags.toArray();

            expect(array[1].selected).toBeTruthy('Expect pizza-1 tag to be selected');

            dispatchKeyboardEvent(nativeTags[1], 'keydown', SPACE);
            fixture.detectChanges();

            expect(array[1].selected).toBeFalsy('Expect tag to be not selected after toggle selected');
        });

        it('should set the view value from the form', () => {
            const array = fixture.componentInstance.tags.toArray();

            expect(array[1].selected).toBeFalsy('Expect tag to not be selected');

            fixture.componentInstance.control.setValue(['pizza-1']);
            fixture.detectChanges();

            expect(array[1].selected).toBeTruthy('Expect tag to be selected');
        });

        xit('should update the form value when the view changes', () => {
            expect(fixture.componentInstance.control.value)
                .toEqual(null, `Expected the control's value to be empty initially.`);

            dispatchKeyboardEvent(nativeTags[0], 'keydown', SPACE);
            fixture.detectChanges();

            expect(fixture.componentInstance.control.value)
                .toEqual(['steak-0'], `Expected control's value to be set to the new option.`);
        });

        it('should clear the selection when a nonexistent option value is selected', () => {
            const array = fixture.componentInstance.tags.toArray();

            fixture.componentInstance.control.setValue(['pizza-1']);
            fixture.detectChanges();

            expect(array[1].selected)
                .toBeTruthy(`Expected tag with the value to be selected.`);

            fixture.componentInstance.control.setValue(['gibberish']);

            fixture.detectChanges();

            expect(array[1].selected)
                .toBeFalsy(`Expected tag with the old value not to be selected.`);
        });


        it('should clear the selection when the control is reset', () => {
            const array = fixture.componentInstance.tags.toArray();

            fixture.componentInstance.control.setValue(['pizza-1']);
            fixture.detectChanges();

            fixture.componentInstance.control.reset();
            fixture.detectChanges();

            expect(array[1].selected)
                .toBeFalsy(`Expected tag with the old value not to be selected.`);
        });

        it('should set the control to touched when the tag list is touched', fakeAsync(() => {
            expect(fixture.componentInstance.control.touched)
                .toBe(false, 'Expected the control to start off as untouched.');

            const nativeTagList = fixture.debugElement.query(By.css('.mc-tag-list')).nativeElement;

            dispatchFakeEvent(nativeTagList, 'blur');
            tick();

            expect(fixture.componentInstance.control.touched)
                .toBe(true, 'Expected the control to be touched.');
        }));

        it('should not set touched when a disabled tag list is touched', () => {
            expect(fixture.componentInstance.control.touched)
                .toBe(false, 'Expected the control to start off as untouched.');

            fixture.componentInstance.control.disable();
            const nativeTagList = fixture.debugElement.query(By.css('.mc-tag-list')).nativeElement;
            dispatchFakeEvent(nativeTagList, 'blur');

            expect(fixture.componentInstance.control.touched)
                .toBe(false, 'Expected the control to stay untouched.');
        });

        xit('should set the control to dirty when the tag list\'s value changes in the DOM', () => {
            expect(fixture.componentInstance.control.dirty)
                .toEqual(false, `Expected control to start out pristine.`);

            dispatchKeyboardEvent(nativeTags[1], 'keydown', SPACE);
            fixture.detectChanges();

            expect(fixture.componentInstance.control.dirty)
                .toEqual(true, `Expected control to be dirty after value was changed by user.`);
        });

        // todo need rethink this selection logic
        xit('should not set the control to dirty when the value changes programmatically', () => {
            expect(fixture.componentInstance.control.dirty)
                .toEqual(false, `Expected control to start out pristine.`);

            fixture.componentInstance.control.setValue(['pizza-1']);

            expect(fixture.componentInstance.control.dirty)
                .toEqual(false, `Expected control to stay pristine after programmatic change.`);
        });


        xit('should set an asterisk after the placeholder if the control is required', () => {
            let requiredMarker = fixture.debugElement.query(By.css('.mc-form-field-required-marker'));
            expect(requiredMarker)
                .toBeNull(`Expected placeholder not to have an asterisk, as control was not required.`);

            fixture.componentInstance.isRequired = true;
            fixture.detectChanges();

            requiredMarker = fixture.debugElement.query(By.css('.mc-form-field-required-marker'));
            expect(requiredMarker)
                .not.toBeNull(`Expected placeholder to have an asterisk, as control was required.`);
        });

        it('should keep focus on the input after adding the first chip', fakeAsync(() => {
            const nativeInput = fixture.nativeElement.querySelector('input');
            const chipEls = Array.from<HTMLElement>(
                fixture.nativeElement.querySelectorAll('.mc-tag')).reverse();

            // Remove the tags via backspace to simulate the user removing them.
            chipEls.forEach((tag) => {
                tag.focus();
                flush();
                dispatchKeyboardEvent(tag, 'keydown', BACKSPACE);
                fixture.detectChanges();
                tick();
            });

            nativeInput.focus();
            expect(fixture.componentInstance.foods).toEqual([], 'Expected all tags to be removed.');
            expect(document.activeElement).toBe(nativeInput, 'Expected input to be focused.');

            typeInElement('123', nativeInput);
            fixture.detectChanges();
            dispatchKeyboardEvent(nativeInput, 'keydown', ENTER);
            fixture.detectChanges();
            flush();

            expect(document.activeElement).toBe(nativeInput, 'Expected input to remain focused.');
        }));

        describe('keyboard behavior', () => {
            beforeEach(() => {
                tagListDebugElement = fixture.debugElement.query(By.directive(McTagList));
                tagListInstance = tagListDebugElement.componentInstance;
                tags = tagListInstance.tags;
                manager = fixture.componentInstance.tagList.keyManager;
            });

            describe('when the input has focus', () => {

                it('should not focus the last tag when press DELETE', () => {
                    const nativeInput = fixture.nativeElement.querySelector('input');
                    const DELETE_EVENT: KeyboardEvent = createKeyboardEvent('keydown', DELETE, nativeInput);

                    // Focus the input
                    nativeInput.focus();
                    expect(manager.activeItemIndex).toBe(-1);

                    // Press the DELETE key
                    tagListInstance.keydown(DELETE_EVENT);
                    fixture.detectChanges();

                    // It doesn't focus the last chip
                    expect(manager.activeItemIndex).toEqual(-1);
                });

                it('should focus the last tag when press BACKSPACE', () => {
                    const nativeInput = fixture.nativeElement.querySelector('input');
                    const BACKSPACE_EVENT: KeyboardEvent = createKeyboardEvent('keydown', BACKSPACE, nativeInput);

                    // Focus the input
                    nativeInput.focus();
                    expect(manager.activeItemIndex).toBe(-1);

                    // Press the BACKSPACE key
                    tagListInstance.keydown(BACKSPACE_EVENT);
                    fixture.detectChanges();

                    // It focuses the last chip
                    expect(manager.activeItemIndex).toEqual(tags.length - 1);
                });

            });
        });
    });

    xdescribe('error messages', () => {
        let errorTestComponent: TagListWithFormErrorMessages;
        let containerEl: HTMLElement;
        let tagListEl: HTMLElement;

        beforeEach(() => {
            fixture = createComponent(TagListWithFormErrorMessages);
            fixture.detectChanges();
            errorTestComponent = fixture.componentInstance;
            containerEl = fixture.debugElement.query(By.css('mc-form-field')).nativeElement;
            tagListEl = fixture.debugElement.query(By.css('mc-tag-list')).nativeElement;
        });

        it('should not show any errors if the user has not interacted', () => {
            expect(errorTestComponent.formControl.untouched)
                .toBe(true, 'Expected untouched form control');
            expect(containerEl.querySelectorAll('mc-error').length).toBe(0, 'Expected no error message');
            expect(tagListEl.getAttribute('aria-invalid'))
                .toBe('false', 'Expected aria-invalid to be set to "false".');
        });

        it('should display an error message when the list is touched and invalid', fakeAsync(() => {
            expect(errorTestComponent.formControl.invalid)
                .toBe(true, 'Expected form control to be invalid');
            expect(containerEl.querySelectorAll('mc-error').length)
                .toBe(0, 'Expected no error message');

            errorTestComponent.formControl.markAsTouched();
            fixture.detectChanges();
            tick();

            expect(containerEl.classList)
                .toContain('mc-form-field-invalid', 'Expected container to have the invalid CSS class.');
            expect(containerEl.querySelectorAll('mc-error').length)
                .toBe(1, 'Expected one error message to have been rendered.');
            expect(tagListEl.getAttribute('aria-invalid'))
                .toBe('true', 'Expected aria-invalid to be set to "true".');
        }));

        it('should display an error message when the parent form is submitted', fakeAsync(() => {
            expect(errorTestComponent.form.submitted)
                .toBe(false, 'Expected form not to have been submitted');
            expect(errorTestComponent.formControl.invalid)
                .toBe(true, 'Expected form control to be invalid');
            expect(containerEl.querySelectorAll('mc-error').length).toBe(0, 'Expected no error message');

            dispatchFakeEvent(fixture.debugElement.query(By.css('form')).nativeElement, 'submit');
            fixture.detectChanges();

            fixture.whenStable().then(() => {
                expect(errorTestComponent.form.submitted)
                    .toBe(true, 'Expected form to have been submitted');
                expect(containerEl.classList)
                    .toContain('mc-form-field-invalid', 'Expected container to have the invalid CSS class.');
                expect(containerEl.querySelectorAll('mc-error').length)
                    .toBe(1, 'Expected one error message to have been rendered.');
                expect(tagListEl.getAttribute('aria-invalid'))
                    .toBe('true', 'Expected aria-invalid to be set to "true".');
            });
        }));

        it(
            'should hide the errors and show the hints once the tag list becomes valid',
            fakeAsync(() => {
                errorTestComponent.formControl.markAsTouched();
                fixture.detectChanges();

                fixture.whenStable().then(() => {
                    expect(containerEl.classList)
                        .toContain('mc-form-field-invalid', 'Expected container to have the invalid CSS class.');
                    expect(containerEl.querySelectorAll('mc-error').length)
                        .toBe(1, 'Expected one error message to have been rendered.');
                    expect(containerEl.querySelectorAll('mc-hint').length)
                        .toBe(0, 'Expected no hints to be shown.');

                    errorTestComponent.formControl.setValue('something');
                    fixture.detectChanges();

                    fixture.whenStable().then(() => {
                        expect(containerEl.classList).not.toContain(
                            'mc-form-field-invalid',
                            'Expected container not to have the invalid class when valid.'
                        );
                        expect(containerEl.querySelectorAll('mc-error').length)
                            .toBe(0, 'Expected no error messages when the input is valid.');
                        expect(containerEl.querySelectorAll('mc-hint').length)
                            .toBe(1, 'Expected one hint to be shown once the input is valid.');
                    });
                });
            })
        );

        it('should set the proper role on the error messages', () => {
            errorTestComponent.formControl.markAsTouched();
            fixture.detectChanges();

            expect(containerEl.querySelector('mc-error')!.getAttribute('role')).toBe('alert');
        });

        it('sets the aria-describedby to reference errors when in error state', () => {
            const hintId = fixture.debugElement
                .query(By.css('.mc-hint'))
                .nativeElement.getAttribute('id');
            let describedBy = tagListEl.getAttribute('aria-describedby');

            expect(hintId).toBeTruthy('hint should be shown');
            expect(describedBy).toBe(hintId);

            fixture.componentInstance.formControl.markAsTouched();
            fixture.detectChanges();

            const errorIds = fixture.debugElement.queryAll(By.css('.mc-error'))
                .map((el) => el.nativeElement.getAttribute('id')).join(' ');
            describedBy = tagListEl.getAttribute('aria-describedby');

            expect(errorIds).toBeTruthy('errors should be shown');
            expect(describedBy).toBe(errorIds);
        });
    });

    function createComponent<T>(component: Type<T>, providers: Provider[] = [], animationsModule:
        Type<NoopAnimationsModule> | Type<BrowserAnimationsModule> = NoopAnimationsModule):
        ComponentFixture<T> {
        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                ReactiveFormsModule,
                McTagsModule,
                McFormFieldModule,
                McInputModule,
                animationsModule
            ],
            declarations: [component],
            providers: [
                { provide: NgZone, useFactory: () => zone = new MockNgZone() },
                ...providers
            ]
        }).compileComponents();

        return TestBed.createComponent<T>(component);
    }

    function setupStandardList(direction: Direction = 'ltr') {
        dirChange = new Subject();
        fixture = createComponent(StandardTagList, [{
            provide: Directionality, useFactory: () => ({
                value: direction.toLowerCase(),
                change: dirChange
            })
        }]);
        fixture.detectChanges();

        tagListDebugElement = fixture.debugElement.query(By.directive(McTagList));
        tagListNativeElement = tagListDebugElement.nativeElement;
        tagListInstance = tagListDebugElement.componentInstance;
        testComponent = fixture.debugElement.componentInstance;
        tags = tagListInstance.tags;
    }

    function setupInputList() {
        fixture = createComponent(FormFieldTagList);
        fixture.detectChanges();

        tagListDebugElement = fixture.debugElement.query(By.directive(McTagList));
        tagListNativeElement = tagListDebugElement.nativeElement;
        tagListInstance = tagListDebugElement.componentInstance;
        testComponent = fixture.debugElement.componentInstance;
        tags = tagListInstance.tags;
    }

});

@Component({
    template: `
        <mc-tag-list [tabIndex]="tabIndex" [selectable]="selectable">
            <mc-tag *ngFor="let i of tags" (select)="chipSelect(i)" (deselect)="chipDeselect(i)">
                {{name}} {{i + 1}}
            </mc-tag>
        </mc-tag-list>`
})
class StandardTagList {
    name: string = 'Test';
    selectable: boolean = true;
    tabIndex: number = 0;
    tags = [0, 1, 2, 3, 4];

    chipSelect: (index?: number) => void = () => {};
    chipDeselect: (index?: number) => void = () => {};
}

@Component({
    template: `
        <mc-form-field>
            <mc-tag-list #tagList>
                <mc-tag *ngFor="let tag of tags" (removed)="remove(tag)">{{ tag }}</mc-tag>
                <input name="test" [mcTagInputFor]="tagList"/>
            </mc-tag-list>
        </mc-form-field>
    `
})
class FormFieldTagList {
    tags = ['Chip 0', 'Chip 1', 'Chip 2'];

    remove(chip: string) {
        const index = this.tags.indexOf(chip);

        if (index > -1) {
            this.tags.splice(index, 1);
        }
    }
}


@Component({
    selector: 'basic-tag-list',
    template: `
        <mc-form-field>
            <mc-tag-list placeholder="Food" [formControl]="control" [required]="isRequired"
                           [tabIndex]="tabIndexOverride" [selectable]="selectable">
                <mc-tag *ngFor="let food of foods" [value]="food.value" [disabled]="food.disabled">
                    {{ food.viewValue }}
                </mc-tag>
            </mc-tag-list>
        </mc-form-field>
    `
})
class BasicTagList {
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: 'tacos-2', viewValue: 'Tacos', disabled: true },
        { value: 'sandwich-3', viewValue: 'Sandwich' },
        { value: 'tags-4', viewValue: 'Chips' },
        { value: 'eggs-5', viewValue: 'Eggs' },
        { value: 'pasta-6', viewValue: 'Pasta' },
        { value: 'sushi-7', viewValue: 'Sushi' }
    ];
    control = new FormControl();
    isRequired: boolean;
    tabIndexOverride: number;
    selectable: boolean;

    @ViewChild(McTagList, {static: false}) tagList: McTagList;
    @ViewChildren(McTag) tags: QueryList<McTag>;
}


@Component({
    selector: 'multi-selection-tag-list',
    template: `
        <mc-form-field>
            <mc-tag-list [multiple]="true" placeholder="Food" [formControl]="control"
                           [required]="isRequired"
                           [tabIndex]="tabIndexOverride" [selectable]="selectable">
                <mc-tag *ngFor="let food of foods" [value]="food.value" [disabled]="food.disabled">
                    {{ food.viewValue }}
                </mc-tag>
            </mc-tag-list>
        </mc-form-field>
    `
})
class MultiSelectionTagList {
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: 'tacos-2', viewValue: 'Tacos', disabled: true },
        { value: 'sandwich-3', viewValue: 'Sandwich' },
        { value: 'tags-4', viewValue: 'Chips' },
        { value: 'eggs-5', viewValue: 'Eggs' },
        { value: 'pasta-6', viewValue: 'Pasta' },
        { value: 'sushi-7', viewValue: 'Sushi' }
    ];
    control = new FormControl();
    isRequired: boolean;
    tabIndexOverride: number;
    selectable: boolean;

    @ViewChild(McTagList, {static: false}) tagList: McTagList;
    @ViewChildren(McTag) tags: QueryList<McTag>;
}

@Component({
    selector: 'input-tag-list',
    template: `
        <mc-form-field>
            <mc-tag-list [multiple]="true"
                           placeholder="Food" [formControl]="control" [required]="isRequired" #tagList1>
                <mc-tag *ngFor="let food of foods" [value]="food.value" (removed)="remove(food)">
                    {{ food.viewValue }}
                </mc-tag>
            </mc-tag-list>
            <input placeholder="New food..."
                   [mcTagInputFor]="tagList1"
                   [mcTagInputSeparatorKeyCodes]="separatorKeyCodes"
                   [mcTagInputAddOnBlur]="addOnBlur"
                   (mcTagInputTokenEnd)="add($event)"/>
        </mc-form-field>
    `
})
class InputTagList {
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: 'tacos-2', viewValue: 'Tacos', disabled: true },
        { value: 'sandwich-3', viewValue: 'Sandwich' },
        { value: 'tags-4', viewValue: 'Chips' },
        { value: 'eggs-5', viewValue: 'Eggs' },
        { value: 'pasta-6', viewValue: 'Pasta' },
        { value: 'sushi-7', viewValue: 'Sushi' }
    ];
    control = new FormControl();

    separatorKeyCodes = [ENTER, SPACE];
    addOnBlur: boolean = true;
    isRequired: boolean;

    @ViewChild(McTagList, {static: false}) tagList: McTagList;
    @ViewChildren(McTag) tags: QueryList<McTag>;

    add(event: McTagInputEvent): void {
        const input = event.input;
        const value = event.value;

        // Add our foods
        if ((value || '').trim()) {
            this.foods.push({
                value: `${value.trim().toLowerCase()}-${this.foods.length}`,
                viewValue: value.trim()
            });
        }

        // Reset the input value
        if (input) {
            input.value = '';
        }
    }

    remove(food: any): void {
        const index = this.foods.indexOf(food);

        if (index > -1) {
            this.foods.splice(index, 1);
        }
    }
}

@Component({
    template: `
        <mc-form-field>
            <mc-tag-list [formControl]="control">
                <mc-tag *ngFor="let food of foods" [value]="food.value">{{ food.viewValue }}</mc-tag>
            </mc-tag-list>
        </mc-form-field>
    `
})
class FalsyValueTagList {
    foods: any[] = [
        { value: 0, viewValue: 'Steak' },
        { value: 1, viewValue: 'Pizza' }
    ];
    control = new FormControl();
    @ViewChildren(McTag) tags: QueryList<McTag>;
}

@Component({
    template: `
        <mc-tag-list>
            <mc-tag *ngFor="let food of foods" [value]="food.value" [selected]="food.selected">
                {{ food.viewValue }}
            </mc-tag>
        </mc-tag-list>
    `
})
class SelectedTagList {
    foods: any[] = [
        { value: 0, viewValue: 'Steak', selected: true },
        { value: 1, viewValue: 'Pizza', selected: false },
        { value: 2, viewValue: 'Pasta', selected: true }
    ];
    @ViewChildren(McTag) tags: QueryList<McTag>;
}

@Component({
    template: `
        <form #form="ngForm" novalidate>
            <mc-form-field>
                <mc-tag-list [formControl]="formControl">
                    <mc-tag *ngFor="let food of foods" [value]="food.value" [selected]="food.selected">
                        {{food.viewValue}}
                    </mc-tag>
                </mc-tag-list>
                <mc-hint>Please select a chip, or type to add a new chip</mc-hint>
<!--                <mc-error>Should have value</mc-error>-->
            </mc-form-field>
        </form>
    `
})
class TagListWithFormErrorMessages {
    foods: any[] = [
        { value: 0, viewValue: 'Steak', selected: true },
        { value: 1, viewValue: 'Pizza', selected: false },
        { value: 2, viewValue: 'Pasta', selected: true }
    ];

    formControl = new FormControl('', Validators.required);

    @ViewChildren(McTag) tags: QueryList<McTag>;

    @ViewChild('form', {static: false}) form: NgForm;
}


@Component({
    template: `
        <mc-tag-list>
            <mc-tag *ngFor="let i of numbers" (removed)="remove(i)">{{i}}</mc-tag>
        </mc-tag-list>`,
    animations: [
        // For the case we're testing this animation doesn't
        // have to be used anywhere, it just has to be defined.
        trigger('dummyAnimation', [
            transition(':leave', [
                style({ opacity: 0 }),
                animate('500ms', style({ opacity: 1 }))
            ])
        ])
    ]
})
class StandardTagListWithAnimations {
    numbers = [0, 1, 2, 3, 4];

    remove(item: number): void {
        const index = this.numbers.indexOf(item);

        if (index > -1) {
            this.numbers.splice(index, 1);
        }
    }
}

@Component({
    template: `
        <mc-form-field>
            <mc-tag-list>
                <mc-tag [value]="i" (removed)="removeChip($event)" *ngFor="let i of tags">
                    Chip {{i + 1}}
                    <span mcTagRemove>Remove</span>
                </mc-tag>
            </mc-tag-list>
        </mc-form-field>
    `
})
class TagListWithRemove {
    tags = [0, 1, 2, 3, 4];

    removeChip(event: McTagEvent) {
        this.tags.splice(event.tag.value, 1);
    }
}
