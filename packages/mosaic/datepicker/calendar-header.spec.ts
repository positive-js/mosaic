// tslint:disable:no-magic-numbers
import { Directionality } from '@angular/cdk/bidi';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { McMomentDateModule } from '@ptsecurity/mosaic-moment-adapter/adapter';

import { McCalendar } from './calendar.component';
import { McDatepickerIntl } from './datepicker-intl';
import { McDatepickerModule } from './datepicker-module';
import { yearsPerPage } from './multi-year-view.component';

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

describe('McCalendarHeader', () => {
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                McMomentDateModule,
                McDatepickerModule
            ],
            declarations: [
                // Test components.
                StandardCalendar
            ],
            providers: [
                McDatepickerIntl,
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
        let prevButton: HTMLElement;
        let nextButton: HTMLElement;
        let calendarInstance: McCalendar<Moment>;

        beforeEach(() => {
            fixture = TestBed.createComponent(StandardCalendar);
            fixture.detectChanges();

            const calendarDebugElement = fixture.debugElement.query(By.directive(McCalendar));
            calendarElement = calendarDebugElement.nativeElement;
            periodButton = calendarElement.querySelector('.mc-calendar__period-button') as HTMLElement;
            prevButton = calendarElement.querySelector('.mc-calendar__previous-button') as HTMLElement;
            nextButton = calendarElement.querySelector('.mc-calendar__next-button') as HTMLElement;

            calendarInstance = calendarDebugElement.componentInstance;
            testComponent = fixture.componentInstance;
        });

        it('should be in month view with specified month active', () => {
            expect(calendarInstance.currentView).toBe('month');
            expect(calendarInstance.activeDate.toDate()).toEqual(new Date(2017, 0, 31));
        });

        it('should toggle view when period clicked', () => {
            expect(calendarInstance.currentView).toBe('month');

            periodButton.click();
            fixture.detectChanges();

            expect(calendarInstance.currentView).toBe('multi-year');

            periodButton.click();
            fixture.detectChanges();

            expect(calendarInstance.currentView).toBe('month');
        });

        it('should go to next and previous month', () => {
            expect(calendarInstance.activeDate.toDate()).toEqual(new Date(2017, 0, 31));

            nextButton.click();
            fixture.detectChanges();

            expect(calendarInstance.activeDate.toDate()).toEqual(new Date(2017, 1, 28));

            prevButton.click();
            fixture.detectChanges();

            expect(calendarInstance.activeDate.toDate()).toEqual(new Date(2017, 0, 28));
        });

        it('should go to previous and next year', () => {
            periodButton.click();
            fixture.detectChanges();

            expect(calendarInstance.currentView).toBe('multi-year');
            expect(calendarInstance.activeDate.toDate()).toEqual(new Date(2017, 0, 31));

            (calendarElement.querySelector('.mc-calendar__body_active') as HTMLElement).click();
            fixture.detectChanges();

            expect(calendarInstance.currentView).toBe('year');

            nextButton.click();
            fixture.detectChanges();

            expect(calendarInstance.activeDate.toDate()).toEqual(new Date(2018, 0, 31));

            prevButton.click();
            fixture.detectChanges();

            expect(calendarInstance.activeDate.toDate()).toEqual(new Date(2017, 0, 31));
        });

        it('should go to previous and next multi-year range', () => {
            periodButton.click();
            fixture.detectChanges();

            expect(calendarInstance.currentView).toBe('multi-year');
            expect(calendarInstance.activeDate.toDate()).toEqual(new Date(2017, 0, 31));

            nextButton.click();
            fixture.detectChanges();

            expect(calendarInstance.activeDate.toDate()).toEqual(new Date(yearsPerPage + 2017, 0, 31));

            prevButton.click();
            fixture.detectChanges();

            expect(calendarInstance.activeDate.toDate()).toEqual(new Date(2017, 0, 31));
        });

        it('should go back to month view after selecting year and month', () => {
            periodButton.click();
            fixture.detectChanges();

            expect(calendarInstance.currentView).toBe('multi-year');
            expect(calendarInstance.activeDate.toDate()).toEqual(new Date(2017, 0, 31));

            const yearCells = calendarElement.querySelectorAll('.mc-calendar__body-cell');
            (yearCells[0] as HTMLElement).click();
            fixture.detectChanges();

            expect(calendarInstance.currentView).toBe('year');
            expect(calendarInstance.activeDate.toDate()).toEqual(new Date(2016, 0, 31));

            const monthCells = calendarElement.querySelectorAll('.mc-calendar__body-cell');
            (monthCells[monthCells.length - 1] as HTMLElement).click();
            fixture.detectChanges();

            expect(calendarInstance.currentView).toBe('month');
            expect(calendarInstance.activeDate.toDate()).toEqual(new Date(2016, 11, 31));
            expect(testComponent.selected).toBeFalsy('no date should be selected yet');
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
