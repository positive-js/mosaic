// tslint:disable:no-magic-numbers
import { Direction, Directionality } from '@angular/cdk/bidi';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
    DOWN_ARROW,
    END,
    ENTER,
    HOME,
    LEFT_ARROW,
    PAGE_DOWN,
    PAGE_UP,
    RIGHT_ARROW,
    SPACE,
    UP_ARROW
} from '@ptsecurity/cdk/keycodes';
import { dispatchFakeEvent, dispatchKeyboardEvent } from '@ptsecurity/cdk/testing';
import { McLuxonDateModule } from '@ptsecurity/mosaic-luxon-adapter/adapter';
import { DateTime } from 'luxon';

import { McCalendarBody } from './calendar-body.component';
import { McMonthView } from './month-view.component';


describe('McMonthView', () => {
    let dir: { value: Direction };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                McLuxonDateModule
            ],
            declarations: [
                McCalendarBody,
                McMonthView,

                // Test components.
                StandardMonthView,
                MonthViewWithDateFilter,
                MonthViewWithDateClass
            ],
            providers: [
                { provide: Directionality, useFactory: () => dir = { value: 'ltr' } }
            ]
        });

        TestBed.compileComponents();
    }));

    describe('standard month view', () => {
        let fixture: ComponentFixture<StandardMonthView>;
        let testComponent: StandardMonthView;
        let monthViewNativeElement: Element;

        beforeEach(() => {
            fixture = TestBed.createComponent(StandardMonthView);
            fixture.detectChanges();

            const monthViewDebugElement = fixture.debugElement.query(By.directive(McMonthView));
            monthViewNativeElement = monthViewDebugElement.nativeElement;
            testComponent = fixture.componentInstance;
        });

        it('has correct month label', () => {
            const labelEl = monthViewNativeElement.querySelector('.mc-calendar__body-label')!;
            expect(labelEl.innerHTML.trim()).toBe('Jan');
        });

        it('has 31 days', () => {
            const cellEls = monthViewNativeElement.querySelectorAll('.mc-calendar__body-cell');
            expect(cellEls.length).toBe(31);
        });

        it('shows selected date if in same month', () => {
            const selectedEl = monthViewNativeElement.querySelector('.mc-selected')!;
            expect(selectedEl.innerHTML.trim()).toBe('10');
        });

        it('does not show selected date if in different month', () => {
            testComponent.selected = DateTime.local(2017, 2, 10);
            fixture.detectChanges();

            const selectedEl = monthViewNativeElement.querySelector('.mc-selected');
            expect(selectedEl).toBeNull();
        });

        it('fires selected change event on cell clicked', () => {
            const cellEls = monthViewNativeElement.querySelectorAll('.mc-calendar__body-cell');
            (cellEls[cellEls.length - 1] as HTMLElement).click();
            fixture.detectChanges();

            const selectedEl = monthViewNativeElement.querySelector('.mc-selected')!;
            expect(selectedEl.innerHTML.trim()).toBe('31');
        });

        it('should mark active date', () => {
            const cellEls = monthViewNativeElement.querySelectorAll('.mc-calendar__body-cell');
            expect((cellEls[4] as HTMLElement).innerText.trim()).toBe('5');
            expect(cellEls[4].classList).toContain('mc-calendar__body_active');
        });

        describe('a11y', () => {
            describe('calendar body', () => {
                let calendarBodyEl: HTMLElement;
                let calendarInstance: StandardMonthView;

                beforeEach(() => {
                    calendarInstance = fixture.componentInstance;
                    calendarBodyEl =
                        fixture.debugElement.nativeElement.querySelector('.mc-calendar__body') as HTMLElement;
                    expect(calendarBodyEl).not.toBeNull();
                    dir.value = 'ltr';
                    fixture.componentInstance.date = DateTime.local(2017, 1, 5);
                    dispatchFakeEvent(calendarBodyEl, 'focus');
                    fixture.detectChanges();
                });

                it('should decrement date on left arrow press', () => {
                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toJSDate()).toEqual(DateTime.local(2017, 1, 4).toJSDate());

                    calendarInstance.date = DateTime.local(2017, 1, 1);
                    fixture.detectChanges();

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toJSDate()).toEqual(new Date(2016, 11, 31));
                });

                it('should increment date on left arrow press in rtl', () => {
                    dir.value = 'rtl';

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toJSDate()).toEqual(new Date(2017, 0, 6));

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toJSDate()).toEqual(new Date(2017, 0, 7));
                });

                it('should increment date on right arrow press', () => {
                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toJSDate()).toEqual(new Date(2017, 0, 6));

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toJSDate()).toEqual(new Date(2017, 0, 7));
                });

                it('should decrement date on right arrow press in rtl', () => {
                    dir.value = 'rtl';

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toJSDate()).toEqual(new Date(2017, 0, 4));

                    calendarInstance.date = DateTime.local(2017, 1, 1);
                    fixture.detectChanges();

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', RIGHT_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toJSDate()).toEqual(new Date(2016, 11, 31));
                });

                it('should go up a row on up arrow press', () => {
                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toJSDate()).toEqual(new Date(2016, 11, 29));

                    calendarInstance.date = DateTime.local(2017, 1, 7);
                    fixture.detectChanges();

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', UP_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toJSDate()).toEqual(new Date(2016, 11, 31));
                });

                it('should go down a row on down arrow press', () => {
                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toJSDate()).toEqual(new Date(2017, 0, 12));

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', DOWN_ARROW);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toJSDate()).toEqual(new Date(2017, 0, 19));
                });

                it('should go to beginning of the month on home press', () => {
                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', HOME);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toJSDate()).toEqual(new Date(2017, 0, 1));

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', HOME);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toJSDate()).toEqual(new Date(2017, 0, 1));
                });

                it('should go to end of the month on end press', () => {
                    calendarInstance.date = DateTime.local(2017, 1, 10);

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', END);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toJSDate()).toEqual(new Date(2017, 0, 31));

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', END);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toJSDate()).toEqual(new Date(2017, 0, 31));
                });

                it('should go back one month on page up press', () => {
                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_UP);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toJSDate()).toEqual(new Date(2016, 11, 5));

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_UP);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toJSDate()).toEqual(new Date(2016, 10, 5));
                });

                it('should go forward one month on page down press', () => {
                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_DOWN);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toJSDate()).toEqual(new Date(2017, 1, 5));

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', PAGE_DOWN);
                    fixture.detectChanges();

                    expect(calendarInstance.date.toJSDate()).toEqual(new Date(2017, 2, 5));
                });

                it('should select active date on enter', () => {
                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
                    fixture.detectChanges();

                    expect(testComponent.selected.toJSDate()).toEqual(new Date(2017, 0, 10));

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', ENTER);
                    fixture.detectChanges();

                    expect(testComponent.selected.toJSDate()).toEqual(new Date(2017, 0, 4));
                });

                it('should select active date on space', () => {
                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', LEFT_ARROW);
                    fixture.detectChanges();

                    expect(testComponent.selected.toJSDate()).toEqual(new Date(2017, 0, 10));

                    dispatchKeyboardEvent(calendarBodyEl, 'keydown', SPACE);
                    fixture.detectChanges();

                    expect(testComponent.selected.toJSDate()).toEqual(new Date(2017, 0, 4));
                });
            });
        });
    });

    describe('month view with date filter', () => {
        let fixture: ComponentFixture<MonthViewWithDateFilter>;
        let monthViewNativeElement: Element;

        beforeEach(() => {
            fixture = TestBed.createComponent(MonthViewWithDateFilter);
            fixture.detectChanges();

            const monthViewDebugElement = fixture.debugElement.query(By.directive(McMonthView));
            monthViewNativeElement = monthViewDebugElement.nativeElement;
        });

        it('should disable filtered dates', () => {
            const cells = monthViewNativeElement.querySelectorAll('.mc-calendar__body-cell');
            expect(cells[0].classList).toContain('mc-calendar__body_disabled');
            expect(cells[1].classList).not.toContain('mc-calendar__body_disabled');
        });
    });

    describe('month view with custom date classes', () => {
        let fixture: ComponentFixture<MonthViewWithDateClass>;
        let monthViewNativeElement: Element;

        beforeEach(() => {
            fixture = TestBed.createComponent(MonthViewWithDateClass);
            fixture.detectChanges();

            const monthViewDebugElement = fixture.debugElement.query(By.directive(McMonthView));
            monthViewNativeElement = monthViewDebugElement.nativeElement;
        });

        it('should be able to add a custom class to some dates', () => {
            const cells = monthViewNativeElement.querySelectorAll('.mc-calendar__body-cell');
            expect(cells[0].classList).not.toContain('even');
            expect(cells[1].classList).toContain('even');
        });
    });

});


@Component({
    template: `
        <mc-month-view [(activeDate)]="date" [(selected)]="selected"></mc-month-view>`
})
class StandardMonthView {
    date = DateTime.local(2017, 1, 5);
    selected = DateTime.local(2017, 1, 10);
}


@Component({
    template: `
        <mc-month-view [activeDate]="activeDate" [dateFilter]="dateFilter"></mc-month-view>`
})
class MonthViewWithDateFilter {
    activeDate = DateTime.local(2017, 1, 1);

    dateFilter(date: DateTime): any {
        return date.day % 2 === 0;
    }
}

@Component({
    template: `
        <mc-month-view [activeDate]="activeDate" [dateClass]="dateClass"></mc-month-view>`
})
class MonthViewWithDateClass {
    activeDate = DateTime.local(2017, 1, 1);

    dateClass(date: DateTime) {
        return date.day % 2 === 0 ? 'even' : undefined;
    }
}
