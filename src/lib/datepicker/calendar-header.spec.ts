// tslint:disable:no-magic-numbers
import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Directionality } from '@ptsecurity/cdk/bidi';
import { McMosaicDateModule } from '@ptsecurity/mosaic-date-adapters/mosaic-date-adapter';

import { McCalendar } from './calendar';
import { McDatepickerIntl } from './datepicker-intl';
import { McDatepickerModule } from './datepicker-module';
import { yearsPerPage } from './multi-year-view';


describe('McCalendarHeader', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                McMosaicDateModule,
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
        let calendarInstance: McCalendar<Date>;

        beforeEach(() => {
            fixture = TestBed.createComponent(StandardCalendar);
            fixture.detectChanges();

            const calendarDebugElement = fixture.debugElement.query(By.directive(McCalendar));
            calendarElement = calendarDebugElement.nativeElement;
            periodButton = calendarElement.querySelector('.mc-calendar-period-button') as HTMLElement;
            prevButton = calendarElement.querySelector('.mc-calendar-previous-button') as HTMLElement;
            nextButton = calendarElement.querySelector('.mc-calendar-next-button') as HTMLElement;

            calendarInstance = calendarDebugElement.componentInstance;
            testComponent = fixture.componentInstance;
        });

        it('should be in month view with specified month active', () => {
            expect(calendarInstance.currentView).toBe('month');
            expect(calendarInstance.activeDate).toEqual(new Date(2017, 0, 31));
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
            expect(calendarInstance.activeDate).toEqual(new Date(2017, 0, 31));

            nextButton.click();
            fixture.detectChanges();

            expect(calendarInstance.activeDate).toEqual(new Date(2017, 1, 28));

            prevButton.click();
            fixture.detectChanges();

            expect(calendarInstance.activeDate).toEqual(new Date(2017, 0, 28));
        });

        it('should go to previous and next year', () => {
            periodButton.click();
            fixture.detectChanges();

            expect(calendarInstance.currentView).toBe('multi-year');
            expect(calendarInstance.activeDate).toEqual(new Date(2017, 0, 31));

            (calendarElement.querySelector('.mc-calendar-body-active') as HTMLElement).click();
            fixture.detectChanges();

            expect(calendarInstance.currentView).toBe('year');

            nextButton.click();
            fixture.detectChanges();

            expect(calendarInstance.activeDate).toEqual(new Date(2018, 0, 31));

            prevButton.click();
            fixture.detectChanges();

            expect(calendarInstance.activeDate).toEqual(new Date(2017, 0, 31));
        });

        it('should go to previous and next multi-year range', () => {
            periodButton.click();
            fixture.detectChanges();

            expect(calendarInstance.currentView).toBe('multi-year');
            expect(calendarInstance.activeDate).toEqual(new Date(2017, 0, 31));

            nextButton.click();
            fixture.detectChanges();

            expect(calendarInstance.activeDate).toEqual(new Date(yearsPerPage + 2017, 0, 31));

            prevButton.click();
            fixture.detectChanges();

            expect(calendarInstance.activeDate).toEqual(new Date(2017, 0, 31));
        });

        it('should go back to month view after selecting year and month', () => {
            periodButton.click();
            fixture.detectChanges();

            expect(calendarInstance.currentView).toBe('multi-year');
            expect(calendarInstance.activeDate).toEqual(new Date(2017, 0, 31));

            const yearCells = calendarElement.querySelectorAll('.mc-calendar-body-cell');
            (yearCells[0] as HTMLElement).click();
            fixture.detectChanges();

            expect(calendarInstance.currentView).toBe('year');
            expect(calendarInstance.activeDate).toEqual(new Date(2016, 0, 31));

            const monthCells = calendarElement.querySelectorAll('.mc-calendar-body-cell');
            (monthCells[monthCells.length - 1] as HTMLElement).click();
            fixture.detectChanges();

            expect(calendarInstance.currentView).toBe('month');
            expect(calendarInstance.activeDate).toEqual(new Date(2016, 11, 31));
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
    selected: Date;
    selectedYear: Date;
    selectedMonth: Date;
    startDate = new Date(2017, 0, 31);
}
