// tslint:disable:no-magic-numbers
// tslint:disable:no-unbound-method
// tslint:disable:no-typeof-undefined
// tslint:disable:no-empty
import { Component, FactoryProvider, Type, ValueProvider, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, inject, TestBed, tick } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Directionality } from '@ptsecurity/cdk/bidi';
import { DOWN_ARROW, ENTER, ESCAPE, RIGHT_ARROW, UP_ARROW } from '@ptsecurity/cdk/keycodes';
import { Overlay, OverlayContainer } from '@ptsecurity/cdk/overlay';
import { ScrollDispatcher } from '@ptsecurity/cdk/scrolling';
import {
  createKeyboardEvent,
  dispatchEvent,
  dispatchFakeEvent,
  dispatchKeyboardEvent,
  dispatchMouseEvent
} from '@ptsecurity/cdk/testing';
import { MC_DATE_LOCALE, McNativeDateModule, NativeDateModule, ThemePalette } from '@ptsecurity/mosaic/core';
import { McFormField, McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { DEC, JAN, JUL, JUN, SEP } from '@ptsecurity/mosaic/testing';
import { Subject } from 'rxjs';

import { McInputModule } from '../input/index';

import { McDatepicker } from './datepicker';
import { McDatepickerInput } from './datepicker-input';
import { McDatepickerToggle } from './datepicker-toggle';
import { MC_DATEPICKER_SCROLL_STRATEGY, McDatepickerIntl, McDatepickerModule } from './index';


describe('McDatepicker', () => {
  // tslint:disable-next-line:mocha-no-side-effect-code
  const SUPPORTS_INTL = typeof Intl !== 'undefined';

  // Creates a test component fixture.
  function createComponent(
    component: Type<any>,
    imports: Type<any>[] = [],
    providers: (FactoryProvider | ValueProvider)[] = [],
    entryComponents: Type<any>[] = []): ComponentFixture<any> {

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        McDatepickerModule,
        McFormFieldModule,
        McInputModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
        ...imports
      ],
      providers,
      declarations: [component, ...entryComponents]
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [entryComponents]
      }
    }).compileComponents();

    return TestBed.createComponent(component);
  }

  afterEach(inject([OverlayContainer], (container: OverlayContainer) => {
    container.ngOnDestroy();
  }));

  describe('with McNativeDateModule', () => {
    describe('standard datepicker', () => {
      let fixture: ComponentFixture<StandardDatepicker>;
      let testComponent: StandardDatepicker;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(StandardDatepicker, [McNativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
        flush();
      }));

      it('should initialize with correct value shown in input', () => {
        if (SUPPORTS_INTL) {
          expect(fixture.nativeElement.querySelector('input').value).toBe('1/1/2020');
        }
      });

      it('open non-touch should open popup', () => {
        expect(document.querySelector('.cdk-overlay-pane.mc-datepicker-popup')).toBeNull();

        testComponent.datepicker.open();
        fixture.detectChanges();

        expect(document.querySelector('.cdk-overlay-pane.mc-datepicker-popup')).not.toBeNull();
      });

      it('touch should open dialog', () => {
        testComponent.touch = true;
        fixture.detectChanges();

        expect(document.querySelector('.mc-datepicker-dialog mc-dialog-container')).toBeNull();

        testComponent.datepicker.open();
        fixture.detectChanges();

        expect(document.querySelector('.mc-datepicker-dialog mc-dialog-container'))
            .not.toBeNull();
      });

      it('should not be able to open more than one dialog', fakeAsync(() => {
        testComponent.touch = true;
        fixture.detectChanges();

        expect(document.querySelectorAll('.mc-datepicker-dialog').length).toBe(0);

        testComponent.datepicker.open();
        fixture.detectChanges();
        tick(500);
        fixture.detectChanges();

        dispatchKeyboardEvent(document.querySelector('.mc-calendar-body')!, 'keydown', ENTER);
        fixture.detectChanges();
        tick(100);

        testComponent.datepicker.open();
        tick(500);
        fixture.detectChanges();

        expect(document.querySelectorAll('.mc-datepicker-dialog').length).toBe(1);
      }));

      it('should open datepicker if opened input is set to true', fakeAsync(() => {
        testComponent.opened = true;
        fixture.detectChanges();
        flush();

        expect(document.querySelector('.mc-datepicker-content')).not.toBeNull();

        testComponent.opened = false;
        fixture.detectChanges();
        flush();

        expect(document.querySelector('.mc-datepicker-content')).toBeNull();
      }));

      it('open in disabled mode should not open the calendar', () => {
        testComponent.disabled = true;
        fixture.detectChanges();

        expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
        expect(document.querySelector('mc-dialog-container')).toBeNull();

        testComponent.datepicker.open();
        fixture.detectChanges();

        expect(document.querySelector('.cdk-overlay-pane')).toBeNull();
        expect(document.querySelector('mc-dialog-container')).toBeNull();
      });

      it('disabled datepicker input should open the calendar if datepicker is enabled', () => {
        testComponent.datepicker.disabled = false;
        testComponent.datepickerInput.disabled = true;
        fixture.detectChanges();

        expect(document.querySelector('.cdk-overlay-pane')).toBeNull();

        testComponent.datepicker.open();
        fixture.detectChanges();

        expect(document.querySelector('.cdk-overlay-pane')).not.toBeNull();
      });

      it('close should close popup', fakeAsync(() => {
        testComponent.datepicker.open();
        fixture.detectChanges();
        flush();

        const popup = document.querySelector('.cdk-overlay-pane')!;
        expect(popup).not.toBeNull();
        expect(parseInt(getComputedStyle(popup).height as string)).not.toBe(0);

        testComponent.datepicker.close();
        fixture.detectChanges();
        flush();

        expect(parseInt(getComputedStyle(popup).height as string)).toBe(0);
      }));

      it('should close the popup when pressing ESCAPE', fakeAsync(() => {
        testComponent.datepicker.open();
        fixture.detectChanges();

        expect(testComponent.datepicker.opened).toBe(true, 'Expected datepicker to be open.');

        dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
        fixture.detectChanges();
        flush();

        expect(testComponent.datepicker.opened).toBe(false, 'Expected datepicker to be closed.');
      }));

      it('should set the proper role on the popup', fakeAsync(() => {
        testComponent.datepicker.open();
        fixture.detectChanges();
        flush();

        const popup = document.querySelector('.cdk-overlay-pane')!;
        expect(popup).toBeTruthy();
        expect(popup.getAttribute('role')).toBe('dialog');
      }));

      it('close should close dialog', fakeAsync(() => {
        testComponent.touch = true;
        fixture.detectChanges();

        testComponent.datepicker.open();
        fixture.detectChanges();

        expect(document.querySelector('mc-dialog-container')).not.toBeNull();

        testComponent.datepicker.close();
        fixture.detectChanges();
        flush();

        expect(document.querySelector('mc-dialog-container')).toBeNull();
      }));

      it('setting selected via click should update input and close calendar', fakeAsync(() => {
        testComponent.touch = true;
        fixture.detectChanges();

        testComponent.datepicker.open();
        fixture.detectChanges();
        flush();

        expect(document.querySelector('mc-dialog-container')).not.toBeNull();
        expect(testComponent.datepickerInput.value).toEqual(new Date(2020, JAN, 1));

        const cells = document.querySelectorAll('.mc-calendar-body-cell');
        dispatchMouseEvent(cells[1], 'click');
        fixture.detectChanges();
        flush();

        expect(document.querySelector('mc-dialog-container')).toBeNull();
        expect(testComponent.datepickerInput.value).toEqual(new Date(2020, JAN, 2));
      }));

      it('setting selected via enter press should update input and close calendar',
        fakeAsync(() => {
          testComponent.touch = true;
          fixture.detectChanges();

          testComponent.datepicker.open();
          fixture.detectChanges();
          flush();

          expect(document.querySelector('mc-dialog-container')).not.toBeNull();
          expect(testComponent.datepickerInput.value).toEqual(new Date(2020, JAN, 1));

          const calendarBodyEl = document.querySelector('.mc-calendar-body') as HTMLElement;

          dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
          fixture.detectChanges();
          flush();
          dispatchKeyboardEvent(calendarBodyEl, 'keydown', ENTER);
          fixture.detectChanges();
          flush();

          expect(document.querySelector('mc-dialog-container')).toBeNull();
          expect(testComponent.datepickerInput.value).toEqual(new Date(2020, JAN, 2));
        }));

      it('clicking the currently selected date should close the calendar ' +
         'without firing selectedChanged', fakeAsync(() => {
        const selectedChangedSpy =
            spyOn(testComponent.datepicker.selectedChanged, 'next').and.callThrough();

        for (let changeCount = 1; changeCount < 3; changeCount++) {
          const currentDay = changeCount;
          testComponent.datepicker.open();
          fixture.detectChanges();

          expect(document.querySelector('mc-datepicker-content')).not.toBeNull();
          expect(testComponent.datepickerInput.value).toEqual(new Date(2020, JAN, currentDay));

          const cells = document.querySelectorAll('.mc-calendar-body-cell');
          dispatchMouseEvent(cells[1], 'click');
          fixture.detectChanges();
          flush();
        }

        expect(selectedChangedSpy.calls.count()).toEqual(1);
        expect(document.querySelector('mc-dialog-container')).toBeNull();
        expect(testComponent.datepickerInput.value).toEqual(new Date(2020, JAN, 2));
      }));

      it('pressing enter on the currently selected date should close the calendar without ' +
         'firing selectedChanged', () => {
        const selectedChangedSpy =
            spyOn(testComponent.datepicker.selectedChanged, 'next').and.callThrough();

        testComponent.datepicker.open();
        fixture.detectChanges();

        const calendarBodyEl = document.querySelector('.mc-calendar-body') as HTMLElement;
        expect(calendarBodyEl).not.toBeNull();
        expect(testComponent.datepickerInput.value).toEqual(new Date(2020, JAN, 1));

        dispatchKeyboardEvent(calendarBodyEl, 'keydown', ENTER);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          expect(selectedChangedSpy.calls.count()).toEqual(0);
          expect(document.querySelector('mc-dialog-container')).toBeNull();
          expect(testComponent.datepickerInput.value).toEqual(new Date(2020, JAN, 1));
        });
      });

      it('startAt should fallback to input value', () => {
        expect(testComponent.datepicker.startAt).toEqual(new Date(2020, JAN, 1));
      });

      it('input should aria-owns calendar after opened in non-touch mode', fakeAsync(() => {
        const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
        expect(inputEl.getAttribute('aria-owns')).toBeNull();

        testComponent.datepicker.open();
        fixture.detectChanges();
        flush();

        const ownedElementId = inputEl.getAttribute('aria-owns');
        expect(ownedElementId).not.toBeNull();

        const ownedElement = document.getElementById(ownedElementId);
        expect(ownedElement).not.toBeNull();
        expect((ownedElement as Element).tagName.toLowerCase()).toBe('mc-calendar');
      }));

      it('input should aria-owns calendar after opened in touch mode', () => {
        testComponent.touch = true;
        fixture.detectChanges();

        const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;
        expect(inputEl.getAttribute('aria-owns')).toBeNull();

        testComponent.datepicker.open();
        fixture.detectChanges();

        const ownedElementId = inputEl.getAttribute('aria-owns');
        expect(ownedElementId).not.toBeNull();

        const ownedElement = document.getElementById(ownedElementId);
        expect(ownedElement).not.toBeNull();
        expect((ownedElement as Element).tagName.toLowerCase()).toBe('mc-calendar');
      });

      it('should not throw when given wrong data type', () => {
        testComponent.date = '1/1/2017' as any;

        expect(() => fixture.detectChanges()).not.toThrow();
      });

      it('should clear out the backdrop subscriptions on close', fakeAsync(() => {
        for (let i = 0; i < 3; i++) {
          testComponent.datepicker.open();
          fixture.detectChanges();

          testComponent.datepicker.close();
          fixture.detectChanges();
        }

        testComponent.datepicker.open();
        fixture.detectChanges();

        const spy = jasmine.createSpy('close event spy');
        const subscription = testComponent.datepicker.closedStream.subscribe(spy);
        const backdrop = document.querySelector('.cdk-overlay-backdrop')! as HTMLElement;

        backdrop.click();
        fixture.detectChanges();
        flush();

        expect(spy).toHaveBeenCalledTimes(1);
        expect(testComponent.datepicker.opened).toBe(false);
        subscription.unsubscribe();
      }));

      it('should reset the datepicker when it is closed externally',
        fakeAsync(inject([OverlayContainer], (oldOverlayContainer: OverlayContainer) => {

          // Destroy the old container manually since resetting the testing module won't do it.
          oldOverlayContainer.ngOnDestroy();
          TestBed.resetTestingModule();

          // tslint:disable-next-line:no-inferred-empty-object-type
          const scrolledSubject = new Subject();

          // Stub out a `CloseScrollStrategy` so we can trigger a detachment via the `OverlayRef`.
          fixture = createComponent(StandardDatepicker, [McNativeDateModule], [
            {
              provide: ScrollDispatcher,
              useValue: {scrolled: () => scrolledSubject}
            },
            {
              provide: MC_DATEPICKER_SCROLL_STRATEGY,
              deps: [Overlay],
              useFactory: (overlay: Overlay) => () => overlay.scrollStrategies.close()
            }
          ]);

          fixture.detectChanges();
          testComponent = fixture.componentInstance;

          testComponent.datepicker.open();
          fixture.detectChanges();

          expect(testComponent.datepicker.opened).toBe(true);

          scrolledSubject.next();
          flush();
          fixture.detectChanges();

          expect(testComponent.datepicker.opened).toBe(false);
        }))
      );

      it('should close the datpeicker using ALT + UP_ARROW', fakeAsync(() => {
        testComponent.datepicker.open();
        fixture.detectChanges();
        flush();

        expect(testComponent.datepicker.opened).toBe(true);

        const event = createKeyboardEvent('keydown', UP_ARROW);
        Object.defineProperty(event, 'altKey', {get: () => true});

        dispatchEvent(document.body, event);
        fixture.detectChanges();
        flush();

        expect(testComponent.datepicker.opened).toBe(false);
      }));

      it('should open the datepicker using ALT + DOWN_ARROW', fakeAsync(() => {
        expect(testComponent.datepicker.opened).toBe(false);

        const event = createKeyboardEvent('keydown', DOWN_ARROW);
        Object.defineProperty(event, 'altKey', {get: () => true});

        dispatchEvent(fixture.nativeElement.querySelector('input'), event);
        fixture.detectChanges();
        flush();

        expect(testComponent.datepicker.opened).toBe(true);
        expect(event.defaultPrevented).toBe(true);
      }));

      it('should not open for ALT + DOWN_ARROW on readonly input', fakeAsync(() => {
        const input = fixture.nativeElement.querySelector('input');

        expect(testComponent.datepicker.opened).toBe(false);

        input.setAttribute('readonly', 'true');

        const event = createKeyboardEvent('keydown', DOWN_ARROW);
        Object.defineProperty(event, 'altKey', {get: () => true});

        dispatchEvent(input, event);
        fixture.detectChanges();
        flush();

        expect(testComponent.datepicker.opened).toBe(false);
        expect(event.defaultPrevented).toBe(false);
      }));

    });

    describe('datepicker with too many inputs', () => {
      it('should throw when multiple inputs registered', fakeAsync(() => {
        const fixture = createComponent(MultiInputDatepicker, [McNativeDateModule]);
        expect(() => fixture.detectChanges()).toThrow();
      }));
    });

    describe('datepicker that is assigned to input at a later point', () => {
      it('should not throw on ALT + DOWN_ARROW for input without datepicker', fakeAsync(() => {
        const fixture = createComponent(DelayedDatepicker, [McNativeDateModule]);
        fixture.detectChanges();

        expect(() => {
          const event = createKeyboardEvent('keydown', DOWN_ARROW);
          Object.defineProperty(event, 'altKey', {get: () => true});
          dispatchEvent(fixture.nativeElement.querySelector('input'), event);
          fixture.detectChanges();
          flush();
        }).not.toThrow();
      }));

      it('should handle value changes when a datepicker is assigned after init', fakeAsync(() => {
        const fixture = createComponent(DelayedDatepicker, [McNativeDateModule]);
        const testComponent: DelayedDatepicker = fixture.componentInstance;
        const toSelect = new Date(2017, JAN, 1);

        fixture.detectChanges();

        expect(testComponent.datepickerInput.value).toBeNull();
        expect(testComponent.datepicker.selected).toBeNull();

        testComponent.assignedDatepicker = testComponent.datepicker;
        fixture.detectChanges();

        testComponent.assignedDatepicker.select(toSelect);
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(testComponent.datepickerInput.value).toEqual(toSelect);
        expect(testComponent.datepicker.selected).toEqual(toSelect);
      }));
    });

    describe('datepicker with no inputs', () => {
      let fixture: ComponentFixture<NoInputDatepicker>;
      let testComponent: NoInputDatepicker;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(NoInputDatepicker, [McNativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should not throw when accessing disabled property', () => {
        expect(() => testComponent.datepicker.disabled).not.toThrow();
      });

      it('should throw when opened with no registered inputs', fakeAsync(() => {
        expect(() => testComponent.datepicker.open()).toThrow();
      }));
    });

    describe('datepicker with startAt', () => {
      let fixture: ComponentFixture<DatepickerWithStartAt>;
      let testComponent: DatepickerWithStartAt;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithStartAt, [McNativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('explicit startAt should override input value', () => {
        expect(testComponent.datepicker.startAt).toEqual(new Date(2010, JAN, 1));
      });
    });

    describe('datepicker with startView set to year', () => {
      let fixture: ComponentFixture<DatepickerWithStartViewYear>;
      let testComponent: DatepickerWithStartViewYear;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithStartViewYear, [McNativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
        flush();
      }));

      it('should start at the specified view', () => {
        testComponent.datepicker.open();
        fixture.detectChanges();

        const firstCalendarCell = document.querySelector('.mc-calendar-body-cell')!;

        // When the calendar is in year view, the first cell should be for a month rather than
        // for a date.
        expect(firstCalendarCell.textContent!.trim())
            .toBe('JAN', 'Expected the calendar to be in year-view');
      });

      it('should fire yearSelected when user selects calendar year in year view',
        fakeAsync(() => {
          spyOn(testComponent, 'onYearSelection');
          expect(testComponent.onYearSelection).not.toHaveBeenCalled();

          testComponent.datepicker.open();
          fixture.detectChanges();

          const cells = document.querySelectorAll('.mc-calendar-body-cell');

          dispatchMouseEvent(cells[0], 'click');
          fixture.detectChanges();
          flush();

          expect(testComponent.onYearSelection).toHaveBeenCalled();
        })
      );
    });

    describe('datepicker with startView set to multiyear', () => {
      let fixture: ComponentFixture<DatepickerWithStartViewMultiYear>;
      let testComponent: DatepickerWithStartViewMultiYear;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithStartViewMultiYear, [McNativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;

        spyOn(testComponent, 'onMultiYearSelection');
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
        flush();
      }));

      it('should start at the specified view', () => {
        testComponent.datepicker.open();
        fixture.detectChanges();

        const firstCalendarCell = document.querySelector('.mc-calendar-body-cell')!;

        // When the calendar is in year view, the first cell should be for a month rather than
        // for a date.
        expect(firstCalendarCell.textContent!.trim())
            .toBe('2016', 'Expected the calendar to be in multi-year-view');
      });

      it('should fire yearSelected when user selects calendar year in multiyear view',
        fakeAsync(() => {
          expect(testComponent.onMultiYearSelection).not.toHaveBeenCalled();

          testComponent.datepicker.open();
          fixture.detectChanges();

          const cells = document.querySelectorAll('.mc-calendar-body-cell');

          dispatchMouseEvent(cells[0], 'click');
          fixture.detectChanges();
          flush();

          expect(testComponent.onMultiYearSelection).toHaveBeenCalled();
        })
      );
    });

    describe('datepicker with ngModel', () => {
      let fixture: ComponentFixture<DatepickerWithNgModel>;
      let testComponent: DatepickerWithNgModel;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithNgModel, [McNativeDateModule]);
        fixture.detectChanges();

        fixture.whenStable().then(() => {
          fixture.detectChanges();

          testComponent = fixture.componentInstance;
        });
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should update datepicker when model changes', fakeAsync(() => {
        expect(testComponent.datepickerInput.value).toBeNull();
        expect(testComponent.datepicker.selected).toBeNull();

        const selected = new Date(2017, JAN, 1);
        testComponent.selected = selected;
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(testComponent.datepickerInput.value).toEqual(selected);
        expect(testComponent.datepicker.selected).toEqual(selected);
      }));

      it('should update model when date is selected', fakeAsync(() => {
        expect(testComponent.selected).toBeNull();
        expect(testComponent.datepickerInput.value).toBeNull();

        const selected = new Date(2017, JAN, 1);
        testComponent.datepicker.select(selected);
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(testComponent.selected).toEqual(selected);
        expect(testComponent.datepickerInput.value).toEqual(selected);
      }));

      it('should mark input dirty after input event', () => {
        const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

        expect(inputEl.classList).toContain('ng-pristine');

        inputEl.value = '2001-01-01';
        dispatchFakeEvent(inputEl, 'input');
        fixture.detectChanges();

        expect(inputEl.classList).toContain('ng-dirty');
      });

      it('should mark input dirty after date selected', fakeAsync(() => {
        const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

        expect(inputEl.classList).toContain('ng-pristine');

        testComponent.datepicker.select(new Date(2017, JAN, 1));
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(inputEl.classList).toContain('ng-dirty');
      }));

      it('should not mark dirty after model change', fakeAsync(() => {
        const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

        expect(inputEl.classList).toContain('ng-pristine');

        testComponent.selected = new Date(2017, JAN, 1);
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(inputEl.classList).toContain('ng-pristine');
      }));

      it('should mark input touched on blur', () => {
        const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

        expect(inputEl.classList).toContain('ng-untouched');

        dispatchFakeEvent(inputEl, 'focus');
        fixture.detectChanges();

        expect(inputEl.classList).toContain('ng-untouched');

        dispatchFakeEvent(inputEl, 'blur');
        fixture.detectChanges();

        expect(inputEl.classList).toContain('ng-touched');
      });

      it('should reformat the input value on blur', () => {
        if (SUPPORTS_INTL) {
          // Skip this test if the internationalization API is not supported in the current
          // browser. Browsers like Safari 9 do not support the "Intl" API.
          return;
        }

        const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

        inputEl.value = '2001-01-01';
        dispatchFakeEvent(inputEl, 'input');
        fixture.detectChanges();

        dispatchFakeEvent(inputEl, 'blur');
        fixture.detectChanges();

        expect(inputEl.value).toBe('1/1/2001');
      });

      it('should not reformat invalid dates on blur', () => {
        const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

        inputEl.value = 'very-valid-date';
        dispatchFakeEvent(inputEl, 'input');
        fixture.detectChanges();

        dispatchFakeEvent(inputEl, 'blur');
        fixture.detectChanges();

        expect(inputEl.value).toBe('very-valid-date');
      });

      it('should mark input touched on calendar selection', fakeAsync(() => {
        const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

        expect(inputEl.classList).toContain('ng-untouched');

        testComponent.datepicker.select(new Date(2017, JAN, 1));
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(inputEl.classList).toContain('ng-touched');
      }));
    });

    describe('datepicker with formControl', () => {
      let fixture: ComponentFixture<DatepickerWithFormControl>;
      let testComponent: DatepickerWithFormControl;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithFormControl, [McNativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should update datepicker when formControl changes', () => {
        expect(testComponent.datepickerInput.value).toBeNull();
        expect(testComponent.datepicker.selected).toBeNull();

        const selected = new Date(2017, JAN, 1);
        testComponent.formControl.setValue(selected);
        fixture.detectChanges();

        expect(testComponent.datepickerInput.value).toEqual(selected);
        expect(testComponent.datepicker.selected).toEqual(selected);
      });

      it('should update formControl when date is selected', () => {
        expect(testComponent.formControl.value).toBeNull();
        expect(testComponent.datepickerInput.value).toBeNull();

        const selected = new Date(2017, JAN, 1);
        testComponent.datepicker.select(selected);
        fixture.detectChanges();

        expect(testComponent.formControl.value).toEqual(selected);
        expect(testComponent.datepickerInput.value).toEqual(selected);
      });

      it('should disable input when form control disabled', () => {
        const inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

        expect(inputEl.disabled).toBe(false);

        testComponent.formControl.disable();
        fixture.detectChanges();

        expect(inputEl.disabled).toBe(true);
      });

      it('should disable toggle when form control disabled', () => {
        expect(testComponent.datepickerToggle.disabled).toBe(false);

        testComponent.formControl.disable();
        fixture.detectChanges();

        expect(testComponent.datepickerToggle.disabled).toBe(true);
      });
    });

    describe('datepicker with mc-datepicker-toggle', () => {
      let fixture: ComponentFixture<DatepickerWithToggle>;
      let testComponent: DatepickerWithToggle;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithToggle, [McNativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
        flush();
      }));

      it('should set `aria-haspopup` on the toggle button', () => {
        const button = fixture.debugElement.query(By.css('button'));

        expect(button).toBeTruthy();
        expect(button.nativeElement.getAttribute('aria-haspopup')).toBe('true');
      });

      it('should open calendar when toggle clicked', () => {
        expect(document.querySelector('mc-dialog-container')).toBeNull();

        const toggle = fixture.debugElement.query(By.css('button'));
        dispatchMouseEvent(toggle.nativeElement, 'click');
        fixture.detectChanges();

        expect(document.querySelector('mc-dialog-container')).not.toBeNull();
      });

      it('should not open calendar when toggle clicked if datepicker is disabled', () => {
        testComponent.datepicker.disabled = true;
        fixture.detectChanges();
        const toggle = fixture.debugElement.query(By.css('button')).nativeElement;

        expect(toggle.hasAttribute('disabled')).toBe(true);
        expect(document.querySelector('mc-dialog-container')).toBeNull();

        dispatchMouseEvent(toggle, 'click');
        fixture.detectChanges();

        expect(document.querySelector('mc-dialog-container')).toBeNull();
      });

      it('should not open calendar when toggle clicked if input is disabled', () => {
        expect(testComponent.datepicker.disabled).toBe(false);

        testComponent.input.disabled = true;
        fixture.detectChanges();
        const toggle = fixture.debugElement.query(By.css('button')).nativeElement;

        expect(toggle.hasAttribute('disabled')).toBe(true);
        expect(document.querySelector('mc-dialog-container')).toBeNull();

        dispatchMouseEvent(toggle, 'click');
        fixture.detectChanges();

        expect(document.querySelector('mc-dialog-container')).toBeNull();
      });

      it('should set the `button` type on the trigger to prevent form submissions', () => {
        const toggle = fixture.debugElement.query(By.css('button')).nativeElement;
        expect(toggle.getAttribute('type')).toBe('button');
      });

      it('should remove the underlying SVG icon from the tab order', () => {
        const icon = fixture.debugElement.nativeElement.querySelector('svg');
        expect(icon.getAttribute('focusable')).toBe('false');
      });

      it('should restore focus to the toggle after the calendar is closed', () => {
        const toggle = fixture.debugElement.query(By.css('button')).nativeElement;

        fixture.componentInstance.touchUI = false;
        fixture.detectChanges();

        toggle.focus();
        expect(document.activeElement).toBe(toggle, 'Expected toggle to be focused.');

        fixture.componentInstance.datepicker.open();
        fixture.detectChanges();

        const pane = document.querySelector('.cdk-overlay-pane')!;

        expect(pane).toBeTruthy('Expected calendar to be open.');
        expect(pane.contains(document.activeElement))
            .toBe(true, 'Expected focus to be inside the calendar.');

        fixture.componentInstance.datepicker.close();
        fixture.detectChanges();

        expect(document.activeElement).toBe(toggle, 'Expected focus to be restored to toggle.');
      });

      it('should re-render when the i18n labels change',
        inject([McDatepickerIntl], (intl: McDatepickerIntl) => {
          const toggle = fixture.debugElement.query(By.css('button')).nativeElement;

          intl.openCalendarLabel = 'Open the calendar, perhaps?';
          intl.changes.next();
          fixture.detectChanges();

          expect(toggle.getAttribute('aria-label')).toBe('Open the calendar, perhaps?');
        }));

      it('should toggle the active state of the datepicker toggle', fakeAsync(() => {
        const toggle = fixture.debugElement.query(By.css('mc-datepicker-toggle')).nativeElement;

        expect(toggle.classList).not.toContain('mc-datepicker-toggle-active');

        fixture.componentInstance.datepicker.open();
        fixture.detectChanges();
        flush();

        expect(toggle.classList).toContain('mc-datepicker-toggle-active');

        fixture.componentInstance.datepicker.close();
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(toggle.classList).not.toContain('mc-datepicker-toggle-active');
      }));
    });

    describe('datepicker with custom mc-datepicker-toggle icon', () => {
      it('should be able to override the mc-datepicker-toggle icon', fakeAsync(() => {
        const fixture = createComponent(DatepickerWithCustomIcon, [McNativeDateModule]);
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.mc-datepicker-toggle .custom-icon'))
            .toBeTruthy('Expected custom icon to be rendered.');

        expect(fixture.nativeElement.querySelector('.mc-datepicker-toggle mc-icon'))
            .toBeFalsy('Expected default icon to be removed.');
      }));
    });

    describe('datepicker with tabindex on mc-datepicker-toggle', () => {
      it('should forward the tabindex to the underlying button', () => {
        const fixture = createComponent(DatepickerWithTabindexOnToggle, [McNativeDateModule]);
        fixture.detectChanges();

        const button = fixture.nativeElement.querySelector('.mc-datepicker-toggle button');

        expect(button.getAttribute('tabindex')).toBe('7');
      });

      it('should clear the tabindex from the mc-datepicker-toggle host', () => {
        const fixture = createComponent(DatepickerWithTabindexOnToggle, [McNativeDateModule]);
        fixture.detectChanges();

        const host = fixture.nativeElement.querySelector('.mc-datepicker-toggle');

        expect(host.getAttribute('tabindex')).toBe('-1');
      });

      it('should forward focus to the underlying button when the host is focused', () => {
        const fixture = createComponent(DatepickerWithTabindexOnToggle, [McNativeDateModule]);
        fixture.detectChanges();

        const host = fixture.nativeElement.querySelector('.mc-datepicker-toggle');
        const button = host.querySelector('button');

        expect(document.activeElement).not.toBe(button);

        host.focus();

        expect(document.activeElement).toBe(button);
      });

    });

    describe('datepicker inside mc-form-field', () => {
      let fixture: ComponentFixture<FormFieldDatepicker>;
      let testComponent: FormFieldDatepicker;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(FormFieldDatepicker, [McNativeDateModule]);
        fixture.detectChanges();
        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
        flush();
      }));

      it('should float the placeholder when an invalid value is entered', () => {
        testComponent.datepickerInput.value = 'totally-not-a-date' as any;
        fixture.debugElement.nativeElement.querySelector('input').value = 'totally-not-a-date';
        fixture.detectChanges();

        expect(fixture.debugElement.nativeElement.querySelector('mc-form-field').classList)
          .toContain('mc-form-field-should-float');
      });

      it('should pass the form field theme color to the overlay', fakeAsync(() => {
        testComponent.formField.color = ThemePalette.Primary;
        testComponent.datepicker.open();
        fixture.detectChanges();
        flush();

        let contentEl = document.querySelector('.mc-datepicker-content')!;

        expect(contentEl.classList).toContain('mc-primary');

        testComponent.datepicker.close();
        fixture.detectChanges();
        flush();

        testComponent.formField.color = ThemePalette.Error;
        testComponent.datepicker.open();

        contentEl = document.querySelector('.mc-datepicker-content')!;
        fixture.detectChanges();
        flush();

        expect(contentEl.classList).toContain('mc-warn');
        expect(contentEl.classList).not.toContain('mc-primary');
      }));

      it('should prefer the datepicker color over the form field one', fakeAsync(() => {
        testComponent.datepicker.color = ThemePalette.Error;
        testComponent.formField.color = ThemePalette.Error;
        testComponent.datepicker.open();
        fixture.detectChanges();
        flush();

        const contentEl = document.querySelector('.mc-datepicker-content')!;

        expect(contentEl.classList).toContain('mc-accent');
        expect(contentEl.classList).not.toContain('mc-warn');
      }));
    });

    describe('datepicker with min and max dates and validation', () => {
      let fixture: ComponentFixture<DatepickerWithMinAndMaxValidation>;
      let testComponent: DatepickerWithMinAndMaxValidation;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithMinAndMaxValidation, [McNativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should use min and max dates specified by the input', () => {
        expect(testComponent.datepicker.minDate).toEqual(new Date(2010, JAN, 1));
        expect(testComponent.datepicker.maxDate).toEqual(new Date(2020, JAN, 1));
      });

      it('should mark invalid when value is before min', fakeAsync(() => {
        testComponent.date = new Date(2009, DEC, 31);
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('input')).nativeElement.classList)
            .toContain('ng-invalid');
      }));

      it('should mark invalid when value is after max', fakeAsync(() => {
        testComponent.date = new Date(2020, JAN, 2);
        fixture.detectChanges();
        flush();

        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('input')).nativeElement.classList)
            .toContain('ng-invalid');
      }));

      it('should not mark invalid when value equals min', fakeAsync(() => {
        testComponent.date = testComponent.datepicker.minDate;
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('input')).nativeElement.classList)
            .not.toContain('ng-invalid');
      }));

      it('should not mark invalid when value equals max', fakeAsync(() => {
        testComponent.date = testComponent.datepicker.maxDate;
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('input')).nativeElement.classList)
            .not.toContain('ng-invalid');
      }));

      it('should not mark invalid when value is between min and max', fakeAsync(() => {
        testComponent.date = new Date(2010, JAN, 2);
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('input')).nativeElement.classList)
            .not.toContain('ng-invalid');
      }));
    });

    describe('datepicker with filter and validation', () => {
      let fixture: ComponentFixture<DatepickerWithFilterAndValidation>;
      let testComponent: DatepickerWithFilterAndValidation;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithFilterAndValidation, [McNativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
        flush();
      }));

      it('should mark input invalid', fakeAsync(() => {
        testComponent.date = new Date(2017, JAN, 1);
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('input')).nativeElement.classList)
            .toContain('ng-invalid');

        testComponent.date = new Date(2017, JAN, 2);
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('input')).nativeElement.classList)
            .not.toContain('ng-invalid');
      }));

      it('should disable filtered calendar cells', () => {
        fixture.detectChanges();

        testComponent.datepicker.open();
        fixture.detectChanges();

        expect(document.querySelector('mc-dialog-container')).not.toBeNull();

        const cells = document.querySelectorAll('.mc-calendar-body-cell');
        expect(cells[0].classList).toContain('mc-calendar-body-disabled');
        expect(cells[1].classList).not.toContain('mc-calendar-body-disabled');
      });
    });

    describe('datepicker with change and input events', () => {
      let fixture: ComponentFixture<DatepickerWithChangeAndInputEvents>;
      let testComponent: DatepickerWithChangeAndInputEvents;
      let inputEl: HTMLInputElement;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithChangeAndInputEvents, [McNativeDateModule]);
        fixture.detectChanges();

        testComponent = fixture.componentInstance;
        inputEl = fixture.debugElement.query(By.css('input')).nativeElement;

        spyOn(testComponent, 'onChange');
        spyOn(testComponent, 'onInput');
        spyOn(testComponent, 'onDateChange');
        spyOn(testComponent, 'onDateInput');
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should fire input and dateInput events when user types input', () => {
        expect(testComponent.onChange).not.toHaveBeenCalled();
        expect(testComponent.onDateChange).not.toHaveBeenCalled();
        expect(testComponent.onInput).not.toHaveBeenCalled();
        expect(testComponent.onDateInput).not.toHaveBeenCalled();

        inputEl.value = '2001-01-01';
        dispatchFakeEvent(inputEl, 'input');
        fixture.detectChanges();

        expect(testComponent.onChange).not.toHaveBeenCalled();
        expect(testComponent.onDateChange).not.toHaveBeenCalled();
        expect(testComponent.onInput).toHaveBeenCalled();
        expect(testComponent.onDateInput).toHaveBeenCalled();
      });

      it('should fire change and dateChange events when user commits typed input', () => {
        expect(testComponent.onChange).not.toHaveBeenCalled();
        expect(testComponent.onDateChange).not.toHaveBeenCalled();
        expect(testComponent.onInput).not.toHaveBeenCalled();
        expect(testComponent.onDateInput).not.toHaveBeenCalled();

        dispatchFakeEvent(inputEl, 'change');
        fixture.detectChanges();

        expect(testComponent.onChange).toHaveBeenCalled();
        expect(testComponent.onDateChange).toHaveBeenCalled();
        expect(testComponent.onInput).not.toHaveBeenCalled();
        expect(testComponent.onDateInput).not.toHaveBeenCalled();
      });

      it('should fire dateChange and dateInput events when user selects calendar date',
        fakeAsync(() => {
          expect(testComponent.onChange).not.toHaveBeenCalled();
          expect(testComponent.onDateChange).not.toHaveBeenCalled();
          expect(testComponent.onInput).not.toHaveBeenCalled();
          expect(testComponent.onDateInput).not.toHaveBeenCalled();

          testComponent.datepicker.open();
          fixture.detectChanges();

          expect(document.querySelector('mc-dialog-container')).not.toBeNull();

          const cells = document.querySelectorAll('.mc-calendar-body-cell');
          dispatchMouseEvent(cells[0], 'click');
          fixture.detectChanges();
          flush();

          expect(testComponent.onChange).not.toHaveBeenCalled();
          expect(testComponent.onDateChange).toHaveBeenCalled();
          expect(testComponent.onInput).not.toHaveBeenCalled();
          expect(testComponent.onDateInput).toHaveBeenCalled();
        })
      );

      it('should not fire the dateInput event if the value has not changed', () => {
        expect(testComponent.onDateInput).not.toHaveBeenCalled();

        inputEl.value = '12/12/2012';
        dispatchFakeEvent(inputEl, 'input');
        fixture.detectChanges();

        expect(testComponent.onDateInput).toHaveBeenCalledTimes(1);

        dispatchFakeEvent(inputEl, 'input');
        fixture.detectChanges();

        expect(testComponent.onDateInput).toHaveBeenCalledTimes(1);
      });

    });

    describe('with ISO 8601 strings as input', () => {
      let fixture: ComponentFixture<DatepickerWithISOStrings>;
      let testComponent: DatepickerWithISOStrings;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithISOStrings, [McNativeDateModule]);
        testComponent = fixture.componentInstance;
      }));

      afterEach(fakeAsync(() => {
        testComponent.datepicker.close();
        fixture.detectChanges();
      }));

      it('should coerce ISO strings', fakeAsync(() => {
        expect(() => fixture.detectChanges()).not.toThrow();
        flush();
        fixture.detectChanges();

        expect(testComponent.datepicker.startAt).toEqual(new Date(2017, JUL, 1));
        expect(testComponent.datepickerInput.value).toEqual(new Date(2017, JUN, 1));
        expect(testComponent.datepickerInput.min).toEqual(new Date(2017, JAN, 1));
        expect(testComponent.datepickerInput.max).toEqual(new Date(2017, DEC, 31));
      }));
    });

    describe('with events', () => {
      let fixture: ComponentFixture<DatepickerWithEvents>;
      let testComponent: DatepickerWithEvents;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerWithEvents, [McNativeDateModule]);
        fixture.detectChanges();
        testComponent = fixture.componentInstance;
      }));

      it('should dispatch an event when a datepicker is opened', () => {
        testComponent.datepicker.open();
        fixture.detectChanges();

        expect(testComponent.openedSpy).toHaveBeenCalled();
      });

      it('should dispatch an event when a datepicker is closed', fakeAsync(() => {
        testComponent.datepicker.open();
        fixture.detectChanges();

        testComponent.datepicker.close();
        flush();
        fixture.detectChanges();

        expect(testComponent.closedSpy).toHaveBeenCalled();
      }));

    });

    describe('datepicker that opens on focus', () => {
      let fixture: ComponentFixture<DatepickerOpeningOnFocus>;
      let testComponent: DatepickerOpeningOnFocus;
      let input: HTMLInputElement;

      beforeEach(fakeAsync(() => {
        fixture = createComponent(DatepickerOpeningOnFocus, [McNativeDateModule]);
        fixture.detectChanges();
        testComponent = fixture.componentInstance;
        input = fixture.debugElement.query(By.css('input')).nativeElement;
      }));

      it('should not reopen if the browser fires the focus event asynchronously', fakeAsync(() => {
        // Stub out the real focus method so we can call it reliably.
        spyOn(input, 'focus').and.callFake(() => {
          // Dispatch the event handler async to simulate the IE11 behavior.
          Promise.resolve().then(() => dispatchFakeEvent(input, 'focus'));
        });

        // Open initially by focusing.
        input.focus();
        fixture.detectChanges();
        flush();

        // Due to some browser limitations we can't install a stub on `document.activeElement`
        // so instead we have to override the previously-focused element manually.
        (fixture.componentInstance.datepicker as any)._focusedElementBeforeOpen = input;

        // Ensure that the datepicker is actually open.
        expect(testComponent.datepicker.opened).toBe(true, 'Expected datepicker to be open.');

        // Close the datepicker.
        testComponent.datepicker.close();
        fixture.detectChanges();

        // Schedule the input to be focused asynchronously.
        input.focus();
        fixture.detectChanges();

        // Flush out the scheduled tasks.
        flush();

        expect(testComponent.datepicker.opened).toBe(false, 'Expected datepicker to be closed.');
      }));
    });

    describe('datepicker directionality', () => {
      it('should pass along the directionality to the popup', () => {
        const fixture = createComponent(StandardDatepicker, [McNativeDateModule], [{
          provide: Directionality,
          useValue: ({value: 'rtl'})
        }]);

        fixture.detectChanges();
        fixture.componentInstance.datepicker.open();
        fixture.detectChanges();

        const overlay = document.querySelector('.cdk-overlay-connected-position-bounding-box')!;

        expect(overlay.getAttribute('dir')).toBe('rtl');
      });

      it('should update the popup direction if the directionality value changes', fakeAsync(() => {
        const dirProvider = {value: 'ltr'};
        const fixture = createComponent(StandardDatepicker, [McNativeDateModule], [{
          provide: Directionality,
          useFactory: () => dirProvider
        }]);

        fixture.detectChanges();
        fixture.componentInstance.datepicker.open();
        fixture.detectChanges();

        let overlay = document.querySelector('.cdk-overlay-connected-position-bounding-box')!;

        expect(overlay.getAttribute('dir')).toBe('ltr');

        fixture.componentInstance.datepicker.close();
        fixture.detectChanges();
        flush();

        dirProvider.value = 'rtl';
        fixture.componentInstance.datepicker.open();
        fixture.detectChanges();

        overlay = document.querySelector('.cdk-overlay-connected-position-bounding-box')!;

        expect(overlay.getAttribute('dir')).toBe('rtl');
      }));

      it('should pass along the directionality to the dialog in touch mode', () => {
        const fixture = createComponent(StandardDatepicker, [McNativeDateModule], [{
          provide: Directionality,
          useValue: ({value: 'rtl'})
        }]);

        fixture.componentInstance.touch = true;
        fixture.detectChanges();
        fixture.componentInstance.datepicker.open();
        fixture.detectChanges();

        const overlay = document.querySelector('.cdk-global-overlay-wrapper')!;

        expect(overlay.getAttribute('dir')).toBe('rtl');
      });

    });

  });

  describe('with missing DateAdapter and MC_DATE_FORMATS', () => {
    it('should throw when created', () => {
      expect(() => createComponent(StandardDatepicker))
        .toThrowError(/McDatepicker: No provider found for .*/);
    });
  });

  describe('popup positioning', () => {
    let fixture: ComponentFixture<StandardDatepicker>;
    let testComponent: StandardDatepicker;
    let input: HTMLElement;

    beforeEach(fakeAsync(() => {
      fixture = createComponent(StandardDatepicker, [McNativeDateModule]);
      fixture.detectChanges();
      testComponent = fixture.componentInstance;
      input = fixture.debugElement.query(By.css('input')).nativeElement;
      input.style.position = 'fixed';
    }));

    it('should be below and to the right when there is plenty of space', () => {
      input.style.top = input.style.left = '20px';
      testComponent.datepicker.open();
      fixture.detectChanges();

      const overlayRect = document.querySelector('.cdk-overlay-pane')!.getBoundingClientRect();
      const inputRect = input.getBoundingClientRect();

      expect(Math.floor(overlayRect.top))
          .toBe(Math.floor(inputRect.bottom), 'Expected popup to align to input bottom.');
      expect(Math.floor(overlayRect.left))
          .toBe(Math.floor(inputRect.left), 'Expected popup to align to input left.');
    });

    it('should be above and to the right when there is no space below', () => {
      input.style.bottom = input.style.left = '20px';
      testComponent.datepicker.open();
      fixture.detectChanges();

      const overlayRect = document.querySelector('.cdk-overlay-pane')!.getBoundingClientRect();
      const inputRect = input.getBoundingClientRect();

      expect(Math.floor(overlayRect.bottom))
          .toBe(Math.floor(inputRect.top), 'Expected popup to align to input top.');
      expect(Math.floor(overlayRect.left))
          .toBe(Math.floor(inputRect.left), 'Expected popup to align to input left.');
    });

    it('should be below and to the left when there is no space on the right', () => {
      input.style.top = input.style.right = '20px';
      testComponent.datepicker.open();
      fixture.detectChanges();

      const overlayRect = document.querySelector('.cdk-overlay-pane')!.getBoundingClientRect();
      const inputRect = input.getBoundingClientRect();

      expect(Math.floor(overlayRect.top))
          .toBe(Math.floor(inputRect.bottom), 'Expected popup to align to input bottom.');
      expect(Math.floor(overlayRect.right))
          .toBe(Math.floor(inputRect.right), 'Expected popup to align to input right.');
    });

    it('should be above and to the left when there is no space on the bottom', () => {
      input.style.bottom = input.style.right = '20px';
      testComponent.datepicker.open();
      fixture.detectChanges();

      const overlayRect = document.querySelector('.cdk-overlay-pane')!.getBoundingClientRect();
      const inputRect = input.getBoundingClientRect();

      expect(Math.floor(overlayRect.bottom))
          .toBe(Math.floor(inputRect.top), 'Expected popup to align to input top.');
      expect(Math.floor(overlayRect.right))
          .toBe(Math.floor(inputRect.right), 'Expected popup to align to input right.');
    });

  });

  describe('internationalization', () => {
    let fixture: ComponentFixture<DatepickerWithi18n>;
    let testComponent: DatepickerWithi18n;
    let input: HTMLInputElement;

    beforeEach(fakeAsync(() => {
      fixture = createComponent(DatepickerWithi18n, [McNativeDateModule, NativeDateModule],
        [{provide: MC_DATE_LOCALE, useValue: 'de-DE'}]);
      fixture.detectChanges();
      testComponent = fixture.componentInstance;
      input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    }));

    it('should have the correct input value even when inverted date format', fakeAsync(() => {
      if (typeof Intl === 'undefined') {
        // Skip this test if the internationalization API is not supported in the current
        // browser. Browsers like Safari 9 do not support the "Intl" API.
        return;
      }

      const selected = new Date(2017, SEP, 1);
      testComponent.date = selected;
      fixture.detectChanges();
      flush();
      fixture.detectChanges();

      // Normally the proper date format would 01.09.2017, but some browsers seem format the
      // date without the leading zero. (e.g. 1.9.2017).
      expect(input.value).toMatch(/0?1\.0?9\.2017/);
      expect(testComponent.datepickerInput.value).toBe(selected);
    }));
  });

  describe('datepicker with custom header', () => {
    let fixture: ComponentFixture<DatepickerWithCustomHeader>;
    let testComponent: DatepickerWithCustomHeader;

    beforeEach(fakeAsync(() => {
      fixture = createComponent(
        DatepickerWithCustomHeader,
        [McNativeDateModule],
        [],
        [CustomHeaderForDatepicker]
      );
      fixture.detectChanges();
      testComponent = fixture.componentInstance;
    }));

    it('should instantiate a datepicker with a custom header', fakeAsync(() => {
      expect(testComponent).toBeTruthy();
    }));

    it('should find the standard header element', fakeAsync(() => {
      testComponent.datepicker.open();
      fixture.detectChanges();
      flush();
      fixture.detectChanges();

      expect(document.querySelector('mc-calendar-header')).toBeTruthy();
    }));

    it('should find the custom element', fakeAsync(() => {
        testComponent.datepicker.open();
        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        expect(document.querySelector('.custom-element')).toBeTruthy();
    }));
  });

});


@Component({
  template: `
    <input [mcDatepicker]="d" [value]="date">
    <mc-datepicker #d [touchUi]="touch" [disabled]="disabled" [opened]="opened"></mc-datepicker>
  `
})
class StandardDatepicker {
  opened = false;
  touch = false;
  disabled = false;
  date: Date | null = new Date(2020, JAN, 1);
  @ViewChild('d') datepicker: McDatepicker<Date>;
  @ViewChild(McDatepickerInput) datepickerInput: McDatepickerInput<Date>;
}


@Component({
  template: `
    <input [mcDatepicker]="d"><input [mcDatepicker]="d"><mc-datepicker #d></mc-datepicker>
  `
})
class MultiInputDatepicker {}


@Component({
  template: `<mc-datepicker #d></mc-datepicker>`
})
class NoInputDatepicker {
  @ViewChild('d') datepicker: McDatepicker<Date>;
}


@Component({
  template: `
    <input [mcDatepicker]="d" [value]="date">
    <mc-datepicker #d [startAt]="startDate"></mc-datepicker>
  `
})
class DatepickerWithStartAt {
  date = new Date(2020, JAN, 1);
  startDate = new Date(2010, JAN, 1);
  @ViewChild('d') datepicker: McDatepicker<Date>;
}


@Component({
  template: `
    <input [mcDatepicker]="d" [value]="date">
    <mc-datepicker #d startView="year" (monthSelected)="onYearSelection()"></mc-datepicker>
  `
})
class DatepickerWithStartViewYear {
  date = new Date(2020, JAN, 1);
  @ViewChild('d') datepicker: McDatepicker<Date>;

  onYearSelection() {}
}


@Component({
  template: `
    <input [mcDatepicker]="d" [value]="date">
    <mc-datepicker #d startView="multi-year"
        (yearSelected)="onMultiYearSelection()"></mc-datepicker>
  `
})
class DatepickerWithStartViewMultiYear {
  date = new Date(2020, JAN, 1);
  @ViewChild('d') datepicker: McDatepicker<Date>;

  onMultiYearSelection() {}
}


@Component({
  template: `
    <input [(ngModel)]="selected" [mcDatepicker]="d">
    <mc-datepicker #d></mc-datepicker>
  `
})
class DatepickerWithNgModel {
  selected: Date | null = null;
  @ViewChild('d') datepicker: McDatepicker<Date>;
  @ViewChild(McDatepickerInput) datepickerInput: McDatepickerInput<Date>;
}


@Component({
  template: `
    <input [formControl]="formControl" [mcDatepicker]="d">
    <mc-datepicker-toggle [for]="d"></mc-datepicker-toggle>
    <mc-datepicker #d></mc-datepicker>
  `
})
class DatepickerWithFormControl {
  formControl = new FormControl();
  @ViewChild('d') datepicker: McDatepicker<Date>;
  @ViewChild(McDatepickerInput) datepickerInput: McDatepickerInput<Date>;
  @ViewChild(McDatepickerToggle) datepickerToggle: McDatepickerToggle<Date>;
}


@Component({
  template: `
    <input [mcDatepicker]="d">
    <mc-datepicker-toggle [for]="d"></mc-datepicker-toggle>
    <mc-datepicker #d [touchUi]="touchUI"></mc-datepicker>
  `
})
class DatepickerWithToggle {
  @ViewChild('d') datepicker: McDatepicker<Date>;
  @ViewChild(McDatepickerInput) input: McDatepickerInput<Date>;
  // tslint:disable-next-line:naming-convention
  touchUI = true;
}


@Component({
  template: `
    <input [mcDatepicker]="d">
    <mc-datepicker-toggle [for]="d">
      <div class="custom-icon" mcDatepickerToggleIcon></div>
    </mc-datepicker-toggle>
    <mc-datepicker #d></mc-datepicker>
  `
})
class DatepickerWithCustomIcon {}


@Component({
  template: `
      <mc-form-field>
        <input mcInput [mcDatepicker]="d">
        <mc-datepicker #d></mc-datepicker>
      </mc-form-field>
  `
})
class FormFieldDatepicker {
  @ViewChild('d') datepicker: McDatepicker<Date>;
  @ViewChild(McDatepickerInput) datepickerInput: McDatepickerInput<Date>;
  @ViewChild(McFormField) formField: McFormField;
}


@Component({
  template: `
    <input [mcDatepicker]="d" [(ngModel)]="date" [min]="minDate" [max]="maxDate">
    <mc-datepicker-toggle [for]="d"></mc-datepicker-toggle>
    <mc-datepicker #d></mc-datepicker>
  `
})
class DatepickerWithMinAndMaxValidation {
  @ViewChild('d') datepicker: McDatepicker<Date>;
  date: Date | null;
  minDate = new Date(2010, JAN, 1);
  maxDate = new Date(2020, JAN, 1);
}


@Component({
  template: `
    <input [mcDatepicker]="d" [(ngModel)]="date" [mcDatepickerFilter]="filter">
    <mc-datepicker-toggle [for]="d"></mc-datepicker-toggle>
    <mc-datepicker #d [touchUi]="true"></mc-datepicker>
  `
})
class DatepickerWithFilterAndValidation {
  @ViewChild('d') datepicker: McDatepicker<Date>;
  date: Date;
  filter = (date: Date) => date.getDate() !== 1;
}


@Component({
  template: `
    <input [mcDatepicker]="d" (change)="onChange()" (input)="onInput()"
           (dateChange)="onDateChange()" (dateInput)="onDateInput()">
    <mc-datepicker #d [touchUi]="true"></mc-datepicker>
  `
})
class DatepickerWithChangeAndInputEvents {
  @ViewChild('d') datepicker: McDatepicker<Date>;

  onChange() {}

  onInput() {}

  onDateChange() {}

  onDateInput() {}
}


@Component({
  template: `
    <input [mcDatepicker]="d" [(ngModel)]="date">
    <mc-datepicker #d></mc-datepicker>
  `
})
class DatepickerWithi18n {
  date: Date | null = new Date(2010, JAN, 1);
  @ViewChild('d') datepicker: McDatepicker<Date>;
  @ViewChild(McDatepickerInput) datepickerInput: McDatepickerInput<Date>;
}


@Component({
  template: `
    <input [mcDatepicker]="d" [(ngModel)]="value" [min]="min" [max]="max">
    <mc-datepicker #d [startAt]="startAt"></mc-datepicker>
  `
})
// tslint:disable-next-line:naming-convention
class DatepickerWithISOStrings {
  value = new Date(2017, JUN, 1).toISOString();
  min = new Date(2017, JAN, 1).toISOString();
  max = new Date (2017, DEC, 31).toISOString();
  startAt = new Date(2017, JUL, 1).toISOString();
  @ViewChild('d') datepicker: McDatepicker<Date>;
  @ViewChild(McDatepickerInput) datepickerInput: McDatepickerInput<Date>;
}


@Component({
  template: `
    <input [(ngModel)]="selected" [mcDatepicker]="d">
    <mc-datepicker (opened)="openedSpy()" (closed)="closedSpy()" #d></mc-datepicker>
  `
})
class DatepickerWithEvents {
  selected: Date | null = null;
  openedSpy = jasmine.createSpy('opened spy');
  closedSpy = jasmine.createSpy('closed spy');
  @ViewChild('d') datepicker: McDatepicker<Date>;
}


@Component({
  template: `
    <input (focus)="d.open()" [mcDatepicker]="d">
    <mc-datepicker #d="mcDatepicker"></mc-datepicker>
  `
})
class DatepickerOpeningOnFocus {
  @ViewChild(McDatepicker) datepicker: McDatepicker<Date>;
}


@Component({
  template: `
    <input [mcDatepicker]="ch">
    <mc-datepicker #ch [calendarHeaderComponent]="customHeaderForDatePicker"></mc-datepicker>
  `
})
class DatepickerWithCustomHeader {
  @ViewChild('ch') datepicker: McDatepicker<Date>;
  customHeaderForDatePicker = CustomHeaderForDatepicker;
}

@Component({
  template: `
      <div class="custom-element">Custom element</div>
      <mc-calendar-header></mc-calendar-header>
  `
})
class CustomHeaderForDatepicker {}

@Component({
  template: `
    <input [mcDatepicker]="assignedDatepicker" [value]="date">
    <mc-datepicker #d [touchUi]="touch"></mc-datepicker>
  `
})
class DelayedDatepicker {
  @ViewChild('d') datepicker: McDatepicker<Date>;
  @ViewChild(McDatepickerInput) datepickerInput: McDatepickerInput<Date>;
  date: Date | null;
  assignedDatepicker: McDatepicker<Date>;
}



@Component({
  template: `
    <input [mcDatepicker]="d">
    <mc-datepicker-toggle tabIndex="7" [for]="d">
      <div class="custom-icon" mcDatepickerToggleIcon></div>
    </mc-datepicker-toggle>
    <mc-datepicker #d></mc-datepicker>
  `
})
class DatepickerWithTabindexOnToggle {}
