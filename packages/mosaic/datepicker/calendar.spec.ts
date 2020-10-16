// tslint:disable:no-magic-numbers
// tslint:disable:no-unbound-method
import { Directionality } from '@angular/cdk/bidi';
import { Component, NgZone } from '@angular/core';
import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DateAdapter } from '@ptsecurity/cdk/datetime';
import { ENTER, RIGHT_ARROW, SPACE } from '@ptsecurity/cdk/keycodes';
import {
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    dispatchMouseEvent,
    MockNgZone
} from '@ptsecurity/cdk/testing';
import { McMomentDateModule } from '@ptsecurity/mosaic-moment-adapter/adapter';

import { McCalendar } from './calendar';
import { McDatepickerIntl } from './datepicker-intl';
import { McDatepickerModule } from './datepicker-module';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
// tslint:disable-next-line:ordered-imports
import * as _moment from 'moment';
// @ts-ignore
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';


// tslint:disable-next-line
const moment = _rollupMoment || _moment;

describe('McCalendar', () => {
    let zone: MockNgZone;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                McMomentDateModule,
                McDatepickerModule
            ],
            declarations: [
                // Test components.
                StandardCalendar,
                CalendarWithMinMax,
                CalendarWithDateFilter,
                CalendarWithSelectableMinDate
            ],
            providers: [
                McDatepickerIntl,
                { provide: NgZone, useFactory: () => zone = new MockNgZone() },
                { provide: Directionality, useFactory: () => ({ value: 'ltr' }) }
            ]
        });

        TestBed.compileComponents();
    }));

    describe('standard calendar', () => {
        let fixture: ComponentFixture<StandardCalendar>;
        let testComponent: StandardCalendar;
        let calendarElement: HTMLElement;
        let periodButton: HTMLElement;
        let calendarInstance: McCalendar<Moment>;

        beforeEach(() => {
            fixture = TestBed.createComponent(StandardCalendar);
            fixture.detectChanges();

            const calendarDebugElement = fixture.debugElement.query(By.directive(McCalendar));
            calendarElement = calendarDebugElement.nativeElement;
            periodButton = calendarElement.querySelector('.mc-calendar__period-button') as HTMLElement;

            calendarInstance = calendarDebugElement.componentInstance;
            testComponent = fixture.componentInstance;
        });

        it(`should update today's date`, inject([DateAdapter], (adapter: DateAdapter<Moment>) => {
            let fakeToday = moment([2018, 0, 1]);
            spyOn(adapter, 'today').and.callFake(() => fakeToday);

            calendarInstance.activeDate = fakeToday;
            calendarInstance.updateTodaysDate();
            fixture.detectChanges();

            let todayCell = calendarElement.querySelector('.mc-calendar__body-today')!;
            expect(todayCell).not.toBeNull();
            expect(todayCell.innerHTML.trim()).toBe('1');

            fakeToday = moment([2018, 0, 10]);
            calendarInstance.updateTodaysDate();
            fixture.detectChanges();

            todayCell = calendarElement.querySelector('.mc-calendar__body-today')!;
            expect(todayCell).not.toBeNull();
            expect(todayCell.innerHTML.trim()).toBe('10');
        }));

        it('should be in month view with specified month active', () => {
            expect(calendarInstance.currentView).toBe('month');
            expect(calendarInstance.activeDate.toDate()).toEqual(new Date(2017, 0, 31));
        });

        it('should select date in month view', () => {
            const monthCells = calendarElement.querySelectorAll('.mc-calendar__body-cell');
            (monthCells[monthCells.length - 1] as HTMLElement).click();
            fixture.detectChanges();

            expect(calendarInstance.currentView).toBe('month');
            expect(testComponent.selected.toDate()).toEqual(new Date(2017, 0, 31));
        });

        it('should emit the selected month on cell clicked in year view', () => {
            periodButton.click();
            fixture.detectChanges();

            expect(calendarInstance.currentView).toBe('multi-year');
            expect(calendarInstance.activeDate.toDate()).toEqual(new Date(2017, 0, 31));

            (calendarElement.querySelector('.mc-calendar__body_active') as HTMLElement).click();

            fixture.detectChanges();

            expect(calendarInstance.currentView).toBe('year');

            (calendarElement.querySelector('.mc-calendar__body_active') as HTMLElement).click();

            const normalizedMonth: Moment = fixture.componentInstance.selectedMonth;
            expect(normalizedMonth.month()).toEqual(0);
        });

        it('should emit the selected year on cell clicked in multiyear view', () => {
            periodButton.click();
            fixture.detectChanges();

            expect(calendarInstance.currentView).toBe('multi-year');
            expect(calendarInstance.activeDate.toDate()).toEqual(new Date(2017, 0, 31));

            (calendarElement.querySelector('.mc-calendar__body_active') as HTMLElement).click();

            fixture.detectChanges();

            const normalizedYear: Moment = fixture.componentInstance.selectedYear;
            expect(normalizedYear.year()).toEqual(2017);
        });

        it('should re-render when the i18n labels have changed',
            inject([McDatepickerIntl], (intl: McDatepickerIntl) => {
                const button = fixture.debugElement.nativeElement
                    .querySelector('.mc-calendar__period-button');

                intl.switchToMultiYearViewLabel = 'Go to multi-year view?';
                intl.changes.next();
                fixture.detectChanges();

                expect(button.getAttribute('aria-label')).toBe('Go to multi-year view?');
            }));

        it('should set all buttons to be `type="button"`', () => {
            const invalidButtons = calendarElement.querySelectorAll('button:not([type="button"])');
            expect(invalidButtons.length).toBe(0);
        });

        it('should complete the stateChanges stream', () => {
            const spy = jasmine.createSpy('complete spy');
            const subscription = calendarInstance.stateChanges.subscribe({complete: spy});

            fixture.destroy();

            expect(spy).toHaveBeenCalled();
            subscription.unsubscribe();
        });

        describe('a11y', () => {
            describe('calendar body', () => {
                let calendarBodyEl: HTMLElement;

                beforeEach(() => {
                    calendarBodyEl = calendarElement.querySelector('.mc-calendar__content') as HTMLElement;
                    expect(calendarBodyEl).not.toBeNull();

                    dispatchFakeEvent(calendarBodyEl, 'focus');
                    fixture.detectChanges();
                });

                it('should initially set start date active', () => {
                    expect(calendarInstance.activeDate.toDate()).toEqual(new Date(2017, 0, 31));
                });

                it('should make the calendar body focusable', () => {
                    expect(calendarBodyEl.getAttribute('tabindex')).toBe('-1');
                });

                it('should not move focus to the active cell on init', () => {
                    const activeCell =
                        calendarBodyEl.querySelector('.mc-calendar__body_active')! as HTMLElement;

                    spyOn(activeCell, 'focus').and.callThrough();
                    fixture.detectChanges();
                    zone.simulateZoneExit();

                    expect(activeCell.focus).not.toHaveBeenCalled();
                });

                it('should move focus to the active cell when the view changes', () => {
                    const activeCell =
                        calendarBodyEl.querySelector('.mc-calendar__body_active')! as HTMLElement;

                    spyOn(activeCell, 'focus').and.callThrough();
                    fixture.detectChanges();
                    zone.simulateZoneExit();

                    expect(activeCell.focus).not.toHaveBeenCalled();

                    calendarInstance.currentView = 'multi-year';
                    fixture.detectChanges();
                    zone.simulateZoneExit();

                    expect(activeCell.focus).toHaveBeenCalled();
                });

                describe('year view', () => {
                    beforeEach(() => {
                        dispatchMouseEvent(periodButton, 'click');
                        fixture.detectChanges();

                        expect(calendarInstance.currentView).toBe('multi-year');

                        (calendarBodyEl.querySelector('.mc-calendar__body_active') as HTMLElement).click();
                        fixture.detectChanges();

                        expect(calendarInstance.currentView).toBe('year');
                    });

                    it('should return to month view on enter', () => {
                        const tableBodyEl = calendarBodyEl.querySelector('.mc-calendar__body') as HTMLElement;

                        dispatchKeyboardEvent(tableBodyEl, 'keydown', RIGHT_ARROW);
                        fixture.detectChanges();

                        dispatchKeyboardEvent(tableBodyEl, 'keydown', ENTER);
                        fixture.detectChanges();

                        expect(calendarInstance.currentView).toBe('month');
                        expect(calendarInstance.activeDate.toDate()).toEqual(new Date(2017, 1, 28));
                        expect(testComponent.selected).toBeUndefined();
                    });

                    it('should return to month view on space', () => {
                        const tableBodyEl = calendarBodyEl.querySelector('.mc-calendar__body') as HTMLElement;

                        dispatchKeyboardEvent(tableBodyEl, 'keydown', RIGHT_ARROW);
                        fixture.detectChanges();

                        dispatchKeyboardEvent(tableBodyEl, 'keydown', SPACE);
                        fixture.detectChanges();

                        expect(calendarInstance.currentView).toBe('month');
                        expect(calendarInstance.activeDate.toDate()).toEqual(new Date(2017, 1, 28));
                        expect(testComponent.selected).toBeUndefined();
                    });
                });

                describe('multi-year view', () => {
                    beforeEach(() => {
                        dispatchMouseEvent(periodButton, 'click');
                        fixture.detectChanges();

                        expect(calendarInstance.currentView).toBe('multi-year');
                    });

                    it('should go to year view on enter', () => {
                        const tableBodyEl = calendarBodyEl.querySelector('.mc-calendar__body') as HTMLElement;

                        dispatchKeyboardEvent(tableBodyEl, 'keydown', RIGHT_ARROW);
                        fixture.detectChanges();

                        dispatchKeyboardEvent(tableBodyEl, 'keydown', ENTER);
                        fixture.detectChanges();

                        expect(calendarInstance.currentView).toBe('year');
                        expect(calendarInstance.activeDate.toDate()).toEqual(new Date(2018, 0, 31));
                        expect(testComponent.selected).toBeUndefined();
                    });

                    it('should go to year view on space', () => {
                        const tableBodyEl = calendarBodyEl.querySelector('.mc-calendar__body') as HTMLElement;

                        dispatchKeyboardEvent(tableBodyEl, 'keydown', RIGHT_ARROW);
                        fixture.detectChanges();

                        dispatchKeyboardEvent(tableBodyEl, 'keydown', SPACE);
                        fixture.detectChanges();

                        expect(calendarInstance.currentView).toBe('year');
                        expect(calendarInstance.activeDate.toDate()).toEqual(new Date(2018, 0, 31));
                        expect(testComponent.selected).toBeUndefined();
                    });

                });

            });
        });

    });

    describe('calendar with min and max date', () => {
        let fixture: ComponentFixture<CalendarWithMinMax>;
        let testComponent: CalendarWithMinMax;
        let calendarElement: HTMLElement;
        let calendarInstance: McCalendar<Moment>;

        beforeEach(() => {
            fixture = TestBed.createComponent(CalendarWithMinMax);

            const calendarDebugElement = fixture.debugElement.query(By.directive(McCalendar));
            calendarElement = calendarDebugElement.nativeElement;
            calendarInstance = calendarDebugElement.componentInstance;
            testComponent = fixture.componentInstance;
        });

        it('should clamp startAt value below min date', () => {
            testComponent.startAt = moment([2000, 0, 1]);
            fixture.detectChanges();

            expect(calendarInstance.activeDate.toDate()).toEqual(new Date(2016, 0, 1));
        });

        it('should clamp startAt value above max date', () => {
            testComponent.startAt = moment([2020, 0, 1]);
            fixture.detectChanges();

            expect(calendarInstance.activeDate.toDate()).toEqual(new Date(2018, 0, 1));
        });

        it('should not go back past min date', () => {
            testComponent.startAt = moment([2016, 1, 1]);
            fixture.detectChanges();

            const prevButton =
                calendarElement.querySelector('.mc-calendar__previous-button') as HTMLButtonElement;

            expect(prevButton.disabled).toBe(false, 'previous button should not be disabled');
            expect(calendarInstance.activeDate.toDate()).toEqual(new Date(2016, 1, 1));

            prevButton.click();
            fixture.detectChanges();

            expect(prevButton.disabled).toBe(true, 'previous button should be disabled');
            expect(calendarInstance.activeDate.toDate()).toEqual(new Date(2016, 0, 1));

            prevButton.click();
            fixture.detectChanges();

            expect(calendarInstance.activeDate.toDate()).toEqual(new Date(2016, 0, 1));
        });

        it('should not go forward past max date', () => {
            testComponent.startAt = moment([2017, 11, 1]);
            fixture.detectChanges();

            const nextButton =
                calendarElement.querySelector('.mc-calendar__next-button') as HTMLButtonElement;

            expect(nextButton.disabled).toBe(false, 'next button should not be disabled');
            expect(calendarInstance.activeDate.toDate()).toEqual(new Date(2017, 11, 1));

            nextButton.click();
            fixture.detectChanges();

            expect(nextButton.disabled).toBe(true, 'next button should be disabled');
            expect(calendarInstance.activeDate.toDate()).toEqual(new Date(2018, 0, 1));

            nextButton.click();
            fixture.detectChanges();

            expect(calendarInstance.activeDate.toDate()).toEqual(new Date(2018, 0, 1));
        });

        it('should re-render the month view when the minDate changes', () => {
            fixture.detectChanges();
            spyOn(calendarInstance.monthView, 'init').and.callThrough();

            testComponent.minDate = moment([2017, 10, 1]);
            fixture.detectChanges();

            expect(calendarInstance.monthView.init).toHaveBeenCalled();
        });

        it('should re-render the month view when the maxDate changes', () => {
            fixture.detectChanges();
            spyOn(calendarInstance.monthView, 'init').and.callThrough();

            testComponent.maxDate = moment([2017, 11, 1]);
            fixture.detectChanges();

            expect(calendarInstance.monthView.init).toHaveBeenCalled();
        });

        it('should re-render the year view when the minDate changes', () => {
            fixture.detectChanges();
            const periodButton =
                calendarElement.querySelector('.mc-calendar__period-button') as HTMLElement;
            periodButton.click();
            fixture.detectChanges();

            (calendarElement.querySelector('.mc-calendar__body_active') as HTMLElement).click();
            fixture.detectChanges();

            spyOn(calendarInstance.yearView, 'init').and.callThrough();

            testComponent.minDate = moment([2017, 10, 1]);
            fixture.detectChanges();

            expect(calendarInstance.yearView.init).toHaveBeenCalled();
        });

        it('should re-render the year view when the maxDate changes', () => {
            fixture.detectChanges();
            const periodButton =
                calendarElement.querySelector('.mc-calendar__period-button') as HTMLElement;
            periodButton.click();
            fixture.detectChanges();

            (calendarElement.querySelector('.mc-calendar__body_active') as HTMLElement).click();
            fixture.detectChanges();

            spyOn(calendarInstance.yearView, 'init').and.callThrough();

            testComponent.maxDate = moment([2017, 11, 1]);
            fixture.detectChanges();

            expect(calendarInstance.yearView.init).toHaveBeenCalled();
        });

        it('should re-render the multi-year view when the minDate changes', () => {
            fixture.detectChanges();
            const periodButton =
                calendarElement.querySelector('.mc-calendar__period-button') as HTMLElement;
            periodButton.click();
            fixture.detectChanges();

            spyOn(calendarInstance.multiYearView, 'init').and.callThrough();

            testComponent.minDate = moment([2017, 10, 1]);
            fixture.detectChanges();

            expect(calendarInstance.multiYearView.init).toHaveBeenCalled();
        });

        it('should re-render the multi-year view when the maxDate changes', () => {
            fixture.detectChanges();
            const periodButton =
                calendarElement.querySelector('.mc-calendar__period-button') as HTMLElement;
            periodButton.click();
            fixture.detectChanges();

            spyOn(calendarInstance.multiYearView, 'init').and.callThrough();

            testComponent.maxDate = moment([2017, 11, 1]);
            fixture.detectChanges();

            expect(calendarInstance.multiYearView.init).toHaveBeenCalled();
        });

        it('should update the minDate in the child view if it changed after an interaction', () => {
            fixture.destroy();

            const dynamicFixture = TestBed.createComponent(CalendarWithSelectableMinDate);
            dynamicFixture.detectChanges();

            const calendarDebugElement = dynamicFixture.debugElement.query(By.directive(McCalendar));
            const disabledClass = 'mc-calendar__body_disabled';
            calendarElement = calendarDebugElement.nativeElement;
            calendarInstance = calendarDebugElement.componentInstance;

            let cells = Array.from(calendarElement.querySelectorAll('.mc-calendar__body-cell'));

            expect(cells.slice(0, 9).every((c) => c.classList.contains(disabledClass)))
                .toBe(true, 'Expected dates up to the 10th to be disabled.');

            expect(cells.slice(9).every((c) => c.classList.contains(disabledClass)))
                .toBe(false, 'Expected dates after the 10th to be enabled.');

            (cells[14] as HTMLElement).click();
            dynamicFixture.detectChanges();
            cells = Array.from(calendarElement.querySelectorAll('.mc-calendar__body-cell'));

            expect(cells.slice(0, 14).every((c) => c.classList.contains(disabledClass)))
                .toBe(true, 'Expected dates up to the 14th to be disabled.');

            expect(cells.slice(14).every((c) => c.classList.contains(disabledClass)))
                .toBe(false, 'Expected dates after the 14th to be enabled.');
        });

    });

    describe('calendar with date filter', () => {
        let fixture: ComponentFixture<CalendarWithDateFilter>;
        let testComponent: CalendarWithDateFilter;
        let calendarElement: HTMLElement;
        let calendarInstance: McCalendar<Moment>;

        beforeEach(() => {
            fixture = TestBed.createComponent(CalendarWithDateFilter);
            fixture.detectChanges();

            const calendarDebugElement = fixture.debugElement.query(By.directive(McCalendar));
            calendarElement = calendarDebugElement.nativeElement;
            calendarInstance = calendarDebugElement.componentInstance;
            testComponent = fixture.componentInstance;
        });

        it('should disable and prevent selection of filtered dates', () => {
            const cells = calendarElement.querySelectorAll('.mc-calendar__body-cell');
            (cells[0] as HTMLElement).click();
            fixture.detectChanges();

            expect(testComponent.selected).toBeFalsy();

            (cells[1] as HTMLElement).click();
            fixture.detectChanges();

            expect(testComponent.selected.toDate()).toEqual(new Date(2017, 0, 2));
        });

        describe('a11y', () => {
            let tableBodyEl: HTMLElement;

            beforeEach(() => {
                tableBodyEl = calendarElement.querySelector('.mc-calendar__body') as HTMLElement;
                expect(tableBodyEl).not.toBeNull();

                dispatchFakeEvent(tableBodyEl, 'focus');
                fixture.detectChanges();
            });

            it('should not allow selection of disabled date in month view', () => {
                expect(calendarInstance.currentView).toBe('month');
                expect(calendarInstance.activeDate.toDate()).toEqual(new Date(2017, 0, 1));

                dispatchKeyboardEvent(tableBodyEl, 'keydown', ENTER);
                fixture.detectChanges();

                expect(testComponent.selected).toBeUndefined();
            });

            it('should allow entering month view at disabled month', () => {
                const periodButton =
                    calendarElement.querySelector('.mc-calendar__period-button') as HTMLElement;
                dispatchMouseEvent(periodButton, 'click');
                fixture.detectChanges();

                (calendarElement.querySelector('.mc-calendar__body_active') as HTMLElement).click();
                fixture.detectChanges();

                calendarInstance.activeDate = moment([2017, 10, 1]);
                fixture.detectChanges();

                expect(calendarInstance.currentView).toBe('year');

                tableBodyEl = calendarElement.querySelector('.mc-calendar__body') as HTMLElement;
                dispatchKeyboardEvent(tableBodyEl, 'keydown', ENTER);
                fixture.detectChanges();

                expect(calendarInstance.currentView).toBe('month');
                expect(testComponent.selected).toBeUndefined();
            });
        });

    });
});


@Component({
    template: `
        <mc-calendar
            [startAt]="startDate"
            [(selected)]="selected"
            (yearSelected)="selectedYear=$event"
            (monthSelected)="selectedMonth=$event">
        </mc-calendar>`
})
class StandardCalendar {
    selected: Moment;
    selectedYear: Moment;
    selectedMonth: Moment;
    startDate = moment([2017, 0, 31]);
}


@Component({
    template: `
        <mc-calendar [startAt]="startAt" [minDate]="minDate" [maxDate]="maxDate"></mc-calendar>
    `
})
class CalendarWithMinMax {
    startAt: Moment;
    minDate = moment([2016, 0, 1]);
    maxDate = moment([2018, 0, 1]);
}


@Component({
    template: `
        <mc-calendar [startAt]="startDate" [(selected)]="selected" [dateFilter]="dateFilter">
        </mc-calendar>
    `
})
class CalendarWithDateFilter {
    selected: Moment;
    startDate = moment([2017, 0, 1]);

    dateFilter(date: Moment) {
        return !(date.date() % 2) && date.month() !== 10;
    }
}


@Component({
    template: `
        <mc-calendar
            [startAt]="startAt"
            (selectedChange)="select($event)"
            [selected]="selected"
            [minDate]="selected">
        </mc-calendar>
    `
})
class CalendarWithSelectableMinDate {
    startAt = new Date(2018, 6, 0);
    selected: Date;
    minDate: Date;

    constructor() {
        this.select(new Date(2018, 6, 10));
    }

    select(value: Date) {
        this.minDate = this.selected = value;
    }
}
