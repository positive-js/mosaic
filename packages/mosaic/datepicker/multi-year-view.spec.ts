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
import { McMultiYearView, yearsPerPage, yearsPerRow } from './multi-year-view';

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

describe('McMultiYearView', () => {
    let dir: { value: Direction };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                McMomentDateModule
            ],
            declarations: [
                McCalendarBody,
                McMultiYearView,

                // Test components.
                StandardMultiYearView,
                MultiYearViewWithDateFilter
            ],
            providers: [
                { provide: Directionality, useFactory: () => dir = { value: 'ltr' } }
            ]
        });

        TestBed.compileComponents();
    }));

    describe('standard multi-year view', () => {
        let fixture: ComponentFixture<StandardMultiYearView>;
        let testComponent: StandardMultiYearView;
        let multiYearViewNativeElement: Element;

        beforeEach(() => {
            fixture = TestBed.createComponent(StandardMultiYearView);
            fixture.detectChanges();

            const multiYearViewDebugElement = fixture.debugElement.query(By.directive(McMultiYearView));
            multiYearViewNativeElement = multiYearViewDebugElement.nativeElement;
            testComponent = fixture.componentInstance;
        });

        it('has correct number of years', () => {
            const cellEls = multiYearViewNativeElement.querySelectorAll('.mc-calendar__body-cell');
            expect(cellEls.length).toBe(yearsPerPage);
        });

        it('shows selected year if in same range', () => {
            const selectedEl = multiYearViewNativeElement.querySelector('.mc-selected')!;
            expect(selectedEl.innerHTML.trim()).toBe('2020');
        });

        it('does not show selected year if in different range', () => {
            testComponent.selected = moment([2040, 0, 10]);
            fixture.detectChanges();

            const selectedEl = multiYearViewNativeElement.querySelector('.mc-selected');
            expect(selectedEl).toBeNull();
        });

        it('fires selected change event on cell clicked', () => {
            const cellEls = multiYearViewNativeElement.querySelectorAll('.mc-calendar__body-cell');
            (cellEls[cellEls.length - 1] as HTMLElement).click();
            fixture.detectChanges();

            const selectedEl = multiYearViewNativeElement.querySelector('.mc-selected')!;
            expect(selectedEl.innerHTML.trim()).toBe('2039');
        });

        it('should emit the selected year on cell clicked', () => {
            const cellEls = multiYearViewNativeElement.querySelectorAll('.mc-calendar__body-cell');

            (cellEls[1] as HTMLElement).click();
            fixture.detectChanges();

            const normalizedYear: Moment = fixture.componentInstance.selectedYear;
            expect(normalizedYear.year()).toEqual(2017);
        });

        it('should mark active date', () => {
            const cellEls = multiYearViewNativeElement.querySelectorAll('.mc-calendar__body-cell');
            expect((cellEls[1] as HTMLElement).innerText.trim()).toBe('2017');
            expect(cellEls[1].classList).toContain('mc-calendar__body_active');
        });

        describe('a11y', () => {
            describe('calendar body', () => {
                let calendarBodyEl: HTMLElement;
                let calendarInstance: StandardMultiYearView;

                beforeEach(() => {
                    calendarInstance = fixture.componentInstance;
                    calendarBodyEl =
                        fixture.debugElement.nativeElement.querySelector('.mc-calendar__body') as HTMLElement;
                    expect(calendarBodyEl).not.toBeNull();
                    dir.value = 'ltr';
                    fixture.componentInstance.date = moment([2017, 0, 1]);
                    dispatchFakeEvent(calendarBodyEl, 'focus');
                    fixture.detectChanges();
                });

                it('should decrement year on left arrow press', () => {
                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate()).toEqual(new Date(2016, 0, 1));

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate()).toEqual(new Date(2015, 0, 1));
                });

                it('should increment year on right arrow press', () => {
                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate()).toEqual(new Date(2018, 0, 1));

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate()).toEqual(new Date(2019, 0, 1));
                });

                it('should go up a row on up arrow press', () => {
                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate())
                        .toEqual(new Date(2017 - yearsPerRow, 0, 1));

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate())
                        .toEqual(new Date(2017 - yearsPerRow * 2, 0, 1));
                });

                it('should go down a row on down arrow press', () => {
                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate())
                        .toEqual(new Date(yearsPerRow + 2017, 0, 1));

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate())
                        .toEqual(new Date(yearsPerRow * 2 + 2017, 0, 1));
                });

                it('should go to first year in current range on home press', () => {
                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', HOME);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate()).toEqual(new Date(2016, 0, 1));

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', HOME);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate()).toEqual(new Date(2016, 0, 1));
                });

                it('should go to last year in current range on end press', () => {
                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', END);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate()).toEqual(new Date(2039, 0, 1));

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', END);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate()).toEqual(new Date(2039, 0, 1));
                });

                it('should go to same index in previous year range page up press', () => {
                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_UP);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate())
                        .toEqual(new Date(2017 - yearsPerPage, 0, 1));

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_UP);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate())
                        .toEqual(new Date(2017 - yearsPerPage * 2, 0, 1));
                });

                it('should go to same index in next year range on page down press', () => {
                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_DOWN);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate())
                        .toEqual(new Date(yearsPerPage + 2017, 0, 1));

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_DOWN);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toDate())
                        .toEqual(new Date(yearsPerPage * 2 + 2017, 0, 1));
                });

            });
        });

    });

    describe('multi year view with date filter', () => {
        let fixture: ComponentFixture<MultiYearViewWithDateFilter>;
        let multiYearViewNativeElement: Element;

        beforeEach(() => {
            fixture = TestBed.createComponent(MultiYearViewWithDateFilter);
            fixture.detectChanges();

            const multiYearViewDebugElement = fixture.debugElement.query(By.directive(McMultiYearView));
            multiYearViewNativeElement = multiYearViewDebugElement.nativeElement;
        });

        it('should disablex years with no enabled days', () => {
            const cells = multiYearViewNativeElement.querySelectorAll('.mc-calendar__body-cell');
            expect(cells[0].classList).not.toContain('mc-calendar__body_disabled');
            expect(cells[1].classList).toContain('mc-calendar__body_disabled');
        });
    });
});


@Component({
    template: `
        <mc-multi-year-view [(activeDate)]="date" [(selected)]="selected"
                            (yearSelected)="selectedYear=$event"></mc-multi-year-view>`
})
class StandardMultiYearView {
    date = moment([2017, 0, 1]);
    selected = moment([2020, 0, 1]);
    selectedYear: Moment;

    @ViewChild(McMultiYearView, {static: false}) multiYearView: McMultiYearView<Moment>;
}

@Component({
    template: `
        <mc-multi-year-view [activeDate]="activeDate" [dateFilter]="dateFilter"></mc-multi-year-view>
    `
})
class MultiYearViewWithDateFilter {
    activeDate = moment([2017, 0, 1]);

    dateFilter(date: Moment) {
        return date.year() !== 2017;
    }
}
