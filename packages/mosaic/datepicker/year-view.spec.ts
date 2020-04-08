// tslint:disable:no-magic-numbers
import { Direction, Directionality } from '@angular/cdk/bidi';
import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
    DOWN_ARROW,
    END,
    HOME,
    LEFT_ARROW,
    PAGE_DOWN,
    PAGE_UP,
    RIGHT_ARROW,
    UP_ARROW
} from '@ptsecurity/cdk/keycodes';
import { dispatchFakeEvent, dispatchKeyboardEvent } from '@ptsecurity/cdk/testing';
import { McMomentDateModule } from '@ptsecurity/mosaic-moment-adapter/adapter';

import { McCalendarBody } from './calendar-body';
import { McYearView } from './year-view';

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

describe('McYearView', () => {
    let dir: { value: Direction };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                McMomentDateModule
            ],
            declarations: [
                McCalendarBody,
                McYearView,

                // Test components.
                StandardYearView,
                YearViewWithDateFilter
            ],
            providers: [
                { provide: Directionality, useFactory: () => dir = { value: 'ltr' } }
            ]
        });

        TestBed.compileComponents();
    }));

    describe('standard year view', () => {
        let fixture: ComponentFixture<StandardYearView>;
        let testComponent: StandardYearView;
        let yearViewNativeElement: Element;

        beforeEach(() => {
            fixture = TestBed.createComponent(StandardYearView);
            fixture.detectChanges();

            const yearViewDebugElement = fixture.debugElement.query(By.directive(McYearView));
            yearViewNativeElement = yearViewDebugElement.nativeElement;
            testComponent = fixture.componentInstance;
        });

        it('has correct year label', () => {
            const labelEl = yearViewNativeElement.querySelector('.mc-calendar__body-label')!;
            expect(labelEl.innerHTML.trim()).toBe('2017');
        });

        it('has 12 months', () => {
            const cellEls = yearViewNativeElement.querySelectorAll('.mc-calendar__body-cell');
            expect(cellEls.length).toBe(12);
        });

        it('shows selected month if in same year', () => {
            const selectedEl = yearViewNativeElement.querySelector('.mc-selected')!;
            expect(selectedEl.innerHTML.trim()).toBe('Mar');
        });

        it('does not show selected month if in different year', () => {
            testComponent.selected = moment([2016, 2, 10]);
            fixture.detectChanges();

            const selectedEl = yearViewNativeElement.querySelector('.mc-selected');
            expect(selectedEl).toBeNull();
        });

        it('fires selected change event on cell clicked', () => {
            const cellEls = yearViewNativeElement.querySelectorAll('.mc-calendar__body-cell');
            (cellEls[cellEls.length - 1] as HTMLElement).click();
            fixture.detectChanges();

            const selectedEl = yearViewNativeElement.querySelector('.mc-selected')!;
            expect(selectedEl.innerHTML.trim()).toBe('Dec');
        });

        it('should emit the selected month on cell clicked', () => {
            const cellEls = yearViewNativeElement.querySelectorAll('.mc-calendar__body-cell');

            (cellEls[cellEls.length - 1] as HTMLElement).click();
            fixture.detectChanges();

            const normalizedMonth: Moment = fixture.componentInstance.selectedMonth;
            expect(normalizedMonth.month()).toEqual(11);
        });

        it('should mark active date', () => {
            const cellEls = yearViewNativeElement.querySelectorAll('.mc-calendar__body-cell');
            expect((cellEls[0] as HTMLElement).innerText.trim()).toBe('Jan');
            expect(cellEls[0].classList).toContain('mc-calendar__body_active');
        });

        it('should allow selection of month with less days than current active date', () => {
            testComponent.date = moment([2017, 6, 31]);
            fixture.detectChanges();

            // tslint:disable-next-line:no-void-expression
            expect(testComponent.yearView.onMonthSelected(5));
            fixture.detectChanges();

            expect(testComponent.selected.toDate()).toEqual(new Date(2017, 5, 30));
        });

        describe('a11y', () => {
            describe('calendar body', () => {
                let calendarBodyEl: HTMLElement;
                let calendarInstance: StandardYearView;

                beforeEach(() => {
                    calendarInstance = fixture.componentInstance;
                    calendarBodyEl =
                        fixture.debugElement.nativeElement.querySelector('.mc-calendar__body') as HTMLElement;
                    expect(calendarBodyEl).not.toBeNull();
                    dir.value = 'ltr';
                    fixture.componentInstance.date = moment([2017, 0, 5]);
                    dispatchFakeEvent(calendarBodyEl, 'focus');
                    fixture.detectChanges();
                });

                it('should decrement month on left arrow press', () => {
                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate()).toEqual(new Date(2016, 11, 5));

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate()).toEqual(new Date(2016, 10, 5));
                });

                it('should increment month on left arrow press in rtl', () => {
                    dir.value = 'rtl';

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate()).toEqual(new Date(2017, 1, 5));

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate()).toEqual(new Date(2017, 2, 5));
                });

                it('should increment month on right arrow press', () => {
                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate()).toEqual(new Date(2017, 1, 5));

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate()).toEqual(new Date(2017, 2, 5));
                });

                it('should decrement month on right arrow press in rtl', () => {
                    dir.value = 'rtl';

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate()).toEqual(new Date(2016, 11, 5));

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate()).toEqual(new Date(2016, 10, 5));
                });

                it('should go up a row on up arrow press', () => {
                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate()).toEqual(new Date(2016, 8, 5));

                    calendarInstance.date = moment([2017, 6, 1]);
                    fixture.detectChanges();

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate()).toEqual(new Date(2017, 2, 1));

                    calendarInstance.date = moment([2017, 11, 10]);
                    fixture.detectChanges();

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate()).toEqual(new Date(2017, 7, 10));
                });

                it('should go down a row on down arrow press', () => {
                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate()).toEqual(new Date(2017, 4, 5));

                    calendarInstance.date = moment([2017, 5, 1]);
                    fixture.detectChanges();

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate()).toEqual(new Date(2017, 9, 1));

                    calendarInstance.date = moment([2017, 8, 30]);
                    fixture.detectChanges();

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate()).toEqual(new Date(2018, 0, 30));
                });

                it('should go to first month of the year on home press', () => {
                    calendarInstance.date = moment([2017, 8, 30]);
                    fixture.detectChanges();

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', HOME);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate()).toEqual(new Date(2017, 0, 30));

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', HOME);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate()).toEqual(new Date(2017, 0, 30));
                });

                it('should go to last month of the year on end press', () => {
                    calendarInstance.date = moment([2017, 9, 31]);
                    fixture.detectChanges();

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', END);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate()).toEqual(new Date(2017, 11, 31));

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', END);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate()).toEqual(new Date(2017, 11, 31));
                });

                it('should go back one year on page up press', () => {
                    calendarInstance.date = moment([2016, 1, 29]);
                    fixture.detectChanges();

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_UP);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate()).toEqual(new Date(2015, 1, 28));

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_UP);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate()).toEqual(new Date(2014, 1, 28));
                });

                it('should go forward one year on page down press', () => {
                    calendarInstance.date = moment([2016, 1, 29]);
                    fixture.detectChanges();

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_DOWN);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate()).toEqual(new Date(2017, 1, 28));

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_DOWN);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate()).toEqual(new Date(2018, 1, 28));
                });
            });
        });
    });

    describe('year view with date filter', () => {
        let fixture: ComponentFixture<YearViewWithDateFilter>;
        let yearViewNativeElement: Element;

        beforeEach(() => {
            fixture = TestBed.createComponent(YearViewWithDateFilter);
            fixture.detectChanges();

            const yearViewDebugElement = fixture.debugElement.query(By.directive(McYearView));
            yearViewNativeElement = yearViewDebugElement.nativeElement;
        });

        it('should disable months with no enabled days', () => {
            const cells = yearViewNativeElement.querySelectorAll('.mc-calendar__body-cell');
            expect(cells[0].classList).not.toContain('mc-calendar__body_disabled');
            expect(cells[1].classList).toContain('mc-calendar__body_disabled');
        });
    });
});


@Component({
    template: `
        <mc-year-view [(activeDate)]="date" [(selected)]="selected"
                      (monthSelected)="selectedMonth=$event"></mc-year-view>`
})
class StandardYearView {
    date = moment([2017, 0, 5]);
    selected = moment([2017, 2, 10]);
    selectedMonth: Moment;

    @ViewChild(McYearView, {static: false}) yearView: McYearView<Moment>;
}


@Component({
    template: `
        <mc-year-view [activeDate]="activeDate" [dateFilter]="dateFilter"></mc-year-view>`
})
class YearViewWithDateFilter {
    activeDate = moment([2017, 0, 1]);

    dateFilter(date: Moment) {
        if (date.month() === 0) {
            return date.date() === 10;
        }

        if (date.month() === 1) {
            return false;
        }

        return true;
    }
}
