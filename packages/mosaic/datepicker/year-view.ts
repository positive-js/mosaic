import { Directionality } from '@angular/cdk/bidi';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Inject,
    Input,
    Optional,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { DateAdapter, MC_DATE_FORMATS, McDateFormats } from '@ptsecurity/cdk/datetime';
import {
    DOWN_ARROW,
    END,
    ENTER,
    HOME,
    LEFT_ARROW,
    PAGE_DOWN,
    PAGE_UP,
    RIGHT_ARROW,
    UP_ARROW,
    SPACE
} from '@ptsecurity/cdk/keycodes';

import { McCalendarBody, McCalendarCell } from './calendar-body';
import { createMissingDateImplError } from './datepicker-errors';


/**
 * An internal component used to display a single year in the datepicker.
 * @docs-private
 */
@Component({
    selector: 'mc-year-view',
    exportAs: 'mcYearView',
    templateUrl: 'year-view.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McYearView<D> implements AfterContentInit {
    /** The date to display in this year view (everything other than the year is ignored). */
    @Input()
    get activeDate(): D {
        return this._activeDate;
    }

    set activeDate(value: D) {
        const oldActiveDate = this._activeDate;
        const validDate =
            this.getValidDateOrNull(this.dateAdapter.deserialize(value)) || this.dateAdapter.today();
        this._activeDate = this.dateAdapter.clampDate(validDate, this.minDate, this.maxDate);

        if (this.dateAdapter.getYear(oldActiveDate) !== this.dateAdapter.getYear(this._activeDate)) {
            this.init();
        }
    }

    /** The currently selected date. */
    @Input()
    get selected(): D | null {
        return this._selected;
    }

    set selected(value: D | null) {
        this._selected = this.getValidDateOrNull(this.dateAdapter.deserialize(value));
        this.selectedMonth = this.getMonthInCurrentYear(this._selected);
    }

    /** The minimum selectable date. */
    @Input()
    get minDate(): D | null {
        return this._minDate;
    }

    set minDate(value: D | null) {
        this._minDate = this.getValidDateOrNull(this.dateAdapter.deserialize(value));
    }

    /** The maximum selectable date. */
    @Input()
    get maxDate(): D | null {
        return this._maxDate;
    }

    set maxDate(value: D | null) {
        this._maxDate = this.getValidDateOrNull(this.dateAdapter.deserialize(value));
    }

    /** A function used to filter which dates are selectable. */
    @Input() dateFilter: (date: D) => boolean;

    /** Emits when a new month is selected. */
    @Output() readonly selectedChange: EventEmitter<D> = new EventEmitter<D>();

    /** Emits the selected month. This doesn't imply a change on the selected date */
    @Output() readonly monthSelected: EventEmitter<D> = new EventEmitter<D>();

    /** Emits when any date is activated. */
    @Output() readonly activeDateChange: EventEmitter<D> = new EventEmitter<D>();

    /** The body of calendar table */
    @ViewChild(McCalendarBody, {static: false}) mcCalendarBody: McCalendarBody;

    /** Grid of calendar cells representing the months of the year. */
    months: McCalendarCell[][];

    /** The label for this year (e.g. "2017"). */
    yearLabel: string;

    /** The month in this year that today falls on. Null if today is in a different year. */
    todayMonth: number | null;

    /**
     * The month in this year that the selected Date falls on.
     * Null if the selected Date is in a different year.
     */
    selectedMonth: number | null;
    private _activeDate: D;
    private _selected: D | null;
    private _minDate: D | null;
    private _maxDate: D | null;

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        @Optional() @Inject(MC_DATE_FORMATS) private dateFormats: McDateFormats,
        @Optional() public dateAdapter: DateAdapter<D>,
        @Optional() private dir?: Directionality
    ) {
        if (!this.dateAdapter) {
            throw createMissingDateImplError('DateAdapter');
        }

        if (!this.dateFormats) {
            throw createMissingDateImplError('MC_DATE_FORMATS');
        }

        this._activeDate = this.dateAdapter.today();
    }

    ngAfterContentInit() {
        this.init();
    }

    /** Handles when a new month is selected. */
    onMonthSelected(month: number) {
        const normalizedDate =
            this.dateAdapter.createDate(this.dateAdapter.getYear(this.activeDate), month, 1);

        this.monthSelected.emit(normalizedDate);

        const daysInMonth = this.dateAdapter.getNumDaysInMonth(normalizedDate);

        this.selectedChange.emit(this.dateAdapter.createDate(
            this.dateAdapter.getYear(this.activeDate), month,
            Math.min(this.dateAdapter.getDate(this.activeDate), daysInMonth)));
    }

    /** Handles keydown events on the calendar body when calendar is in year view. */
    handleCalendarBodyKeydown(event: KeyboardEvent): void {
        // TODO(mmalerba): We currently allow keyboard navigation to disabled dates, but just prevent
        // disabled ones from being selected. This may not be ideal, we should look into whether
        // navigation should skip over disabled dates, and if so, how to implement that efficiently.

        const oldActiveDate = this._activeDate;
        const isRtl = this.isRtl();

        const VERTICAL_SHIFT = 4;
        const PAGE_SHIFT = 10;
        const MAX_MONTH_INDEX = 11;

        // tslint:disable-next-line:deprecation
        switch (event.keyCode) {
            case LEFT_ARROW:
                this.activeDate = this.dateAdapter.addCalendarMonths(this._activeDate, isRtl ? 1 : -1);
                break;
            case RIGHT_ARROW:
                this.activeDate = this.dateAdapter.addCalendarMonths(this._activeDate, isRtl ? -1 : 1);
                break;
            case UP_ARROW:
                this.activeDate = this.dateAdapter.addCalendarMonths(this._activeDate, -VERTICAL_SHIFT);
                break;
            case DOWN_ARROW:
                this.activeDate = this.dateAdapter.addCalendarMonths(this._activeDate, VERTICAL_SHIFT);
                break;
            case HOME:
                this.activeDate = this.dateAdapter.addCalendarMonths(this._activeDate,
                    -this.dateAdapter.getMonth(this._activeDate));
                break;
            case END:
                this.activeDate = this.dateAdapter.addCalendarMonths(this._activeDate,
                    MAX_MONTH_INDEX - this.dateAdapter.getMonth(this._activeDate));
                break;
            case PAGE_UP:
                this.activeDate =
                    this.dateAdapter.addCalendarYears(this._activeDate, event.altKey ? -PAGE_SHIFT : -1);
                break;
            case PAGE_DOWN:
                this.activeDate =
                    this.dateAdapter.addCalendarYears(this._activeDate, event.altKey ? PAGE_SHIFT : 1);
                break;
            case ENTER:
            case SPACE:
                this.onMonthSelected(this.dateAdapter.getMonth(this._activeDate));
                break;
            default:
                // Don't prevent default or focus active cell on keys that we don't explicitly handle.
                return;
        }

        if (this.dateAdapter.compareDate(oldActiveDate, this.activeDate)) {
            this.activeDateChange.emit(this.activeDate);
        }

        this.focusActiveCell();
        // Prevent unexpected default actions such as form submission.
        event.preventDefault();
    }

    /** Initializes this year view. */
    init() {
        this.selectedMonth = this.getMonthInCurrentYear(this.selected);
        this.todayMonth = this.getMonthInCurrentYear(this.dateAdapter.today());
        this.yearLabel = this.dateAdapter.getYearName(this.activeDate);

        const monthNames = this.dateAdapter.getMonthNames('short');

        // First row of months only contains 5 elements so we can fit the year label on the same row.
        // tslint:disable-next-line:no-magic-numbers
        this.months = [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11]].map((row) => row.map(
            (month) => this.createCellForMonth(month, monthNames[month])));
        this.changeDetectorRef.markForCheck();
    }

    /** Focuses the active cell after the microtask queue is empty. */
    focusActiveCell() {
        this.mcCalendarBody.focusActiveCell();
    }

    /**
     * Gets the month in this year that the given Date falls on.
     * Returns null if the given Date is in another year.
     */
    private getMonthInCurrentYear(date: D | null) {
        return date && this.dateAdapter.getYear(date) === this.dateAdapter.getYear(this.activeDate) ?
            this.dateAdapter.getMonth(date) : null;
    }

    /** Creates an McCalendarCell for the given month. */
    private createCellForMonth(month: number, monthName: string) {
        const ariaLabel = this.dateAdapter.format(
            this.dateAdapter.createDate(this.dateAdapter.getYear(this.activeDate), month, 1),
            this.dateFormats.display.monthYearA11yLabel);

        const newMonthName = monthName[0].toLocaleUpperCase() + monthName.substr(1);

        return new McCalendarCell(
            month, newMonthName, ariaLabel, this.shouldEnableMonth(month));
    }

    /** Whether the given month is enabled. */
    private shouldEnableMonth(month: number) {

        const activeYear = this.dateAdapter.getYear(this.activeDate);

        if (month === undefined || month === null ||
            this.isYearAndMonthAfterMaxDate(activeYear, month) ||
            this.isYearAndMonthBeforeMinDate(activeYear, month)) {
            return false;
        }

        if (!this.dateFilter) {
            return true;
        }

        const firstOfMonth = this.dateAdapter.createDate(activeYear, month, 1);

        // If any date in the month is enabled count the month as enabled.
        for (let date = firstOfMonth; this.dateAdapter.getMonth(date) === month;
             date = this.dateAdapter.addCalendarDays(date, 1)) {
            if (this.dateFilter(date)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Tests whether the combination month/year is after this.maxDate, considering
     * just the month and year of this.maxDate
     */
    private isYearAndMonthAfterMaxDate(year: number, month: number) {
        if (this.maxDate) {
            const maxYear = this.dateAdapter.getYear(this.maxDate);
            const maxMonth = this.dateAdapter.getMonth(this.maxDate);

            return year > maxYear || (year === maxYear && month > maxMonth);
        }

        return false;
    }

    /**
     * Tests whether the combination month/year is before this.minDate, considering
     * just the month and year of this.minDate
     */
    private isYearAndMonthBeforeMinDate(year: number, month: number) {
        if (this.minDate) {
            const minYear = this.dateAdapter.getYear(this.minDate);
            const minMonth = this.dateAdapter.getMonth(this.minDate);

            return year < minYear || (year === minYear && month < minMonth);
        }

        return false;
    }

    /**
     * @param obj The object to check.
     * @returns The given object if it is both a date instance and valid, otherwise null.
     */
    private getValidDateOrNull(obj: any): D | null {
        return (this.dateAdapter.isDateInstance(obj) && this.dateAdapter.isValid(obj)) ? obj : null;
    }

    /** Determines whether the user has the RTL layout direction. */
    private isRtl() {
        return this.dir && this.dir.value === 'rtl';
    }
}
