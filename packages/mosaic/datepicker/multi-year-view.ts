// tslint:disable:no-magic-numbers
import { Directionality } from '@angular/cdk/bidi';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    Optional,
    Output,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { DateAdapter } from '@ptsecurity/cdk/datetime';
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


export const yearsPerPage = 24;

export const yearsPerRow = 4;


/**
 * An internal component used to display a year selector in the datepicker.
 * @docs-private
 */
@Component({
    selector: 'mc-multi-year-view',
    exportAs: 'mcMultiYearView',
    templateUrl: 'multi-year-view.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McMultiYearView<D> implements AfterContentInit {
    /** The date to display in this multi-year view (everything other than the year is ignored). */
    @Input()
    get activeDate(): D {
        return this._activeDate;
    }

    set activeDate(value: D) {
        const oldActiveDate = this._activeDate;
        const validDate =
            this.getValidDateOrNull(this.dateAdapter.deserialize(value)) || this.dateAdapter.today();
        this._activeDate = this.dateAdapter.clampDate(validDate, this.minDate, this.maxDate);

        if (Math.floor(this.dateAdapter.getYear(oldActiveDate) / yearsPerPage) !==
            Math.floor(this.dateAdapter.getYear(this._activeDate) / yearsPerPage)) {
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
        this.selectedYear = this._selected && this.dateAdapter.getYear(this._selected);
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

    /** Emits when a new year is selected. */
    @Output() readonly selectedChange: EventEmitter<D> = new EventEmitter<D>();

    /** Emits the selected year. This doesn't imply a change on the selected date */
    @Output() readonly yearSelected: EventEmitter<D> = new EventEmitter<D>();

    /** Emits when any date is activated. */
    @Output() readonly activeDateChange: EventEmitter<D> = new EventEmitter<D>();

    /** The body of calendar table */
    @ViewChild(McCalendarBody, {static: false}) mcCalendarBody: McCalendarBody;

    /** Grid of calendar cells representing the currently displayed years. */
    years: McCalendarCell[][];

    /** The year that today falls on. */
    todayYear: number;

    /** The year of the selected date. Null if the selected date is null. */
    selectedYear: number | null;
    private _activeDate: D;
    private _selected: D | null;
    private _minDate: D | null;
    private _maxDate: D | null;

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        @Optional() public dateAdapter: DateAdapter<D>,
        @Optional() private dir?: Directionality
    ) {
        if (!this.dateAdapter) {
            throw createMissingDateImplError('DateAdapter');
        }

        this._activeDate = this.dateAdapter.today();
    }

    ngAfterContentInit() {
        this.init();
    }

    /** Initializes this multi-year view. */
    init() {
        this.todayYear = this.dateAdapter.getYear(this.dateAdapter.today());
        const activeYear = this.dateAdapter.getYear(this._activeDate);
        const activeOffset = activeYear % yearsPerPage;
        this.years = [];
        for (let i = 0, row: number[] = []; i < yearsPerPage; i++) {
            row.push(activeYear - activeOffset + i);
            if (row.length === yearsPerRow) {
                this.years.push(row.map((year) => this.createCellForYear(year)));
                row = [];
            }
        }
        this.changeDetectorRef.markForCheck();
    }

    /** Handles when a new year is selected. */
    onYearSelected(year: number) {
        this.yearSelected.emit(this.dateAdapter.createDate(year, 0, 1));
        const month = this.dateAdapter.getMonth(this.activeDate);
        const daysInMonth =
            this.dateAdapter.getNumDaysInMonth(this.dateAdapter.createDate(year, month, 1));
        this.selectedChange.emit(this.dateAdapter.createDate(year, month,
            Math.min(this.dateAdapter.getDate(this.activeDate), daysInMonth)));
    }

    /** Handles keydown events on the calendar body when calendar is in multi-year view. */
    handleCalendarBodyKeydown(event: KeyboardEvent): void {
        // TODO(mmalerba): We currently allow keyboard navigation to disabled dates, but just prevent
        // disabled ones from being selected. This may not be ideal, we should look into whether
        // navigation should skip over disabled dates, and if so, how to implement that efficiently.

        const oldActiveDate = this._activeDate;
        const isRtl = this.isRtl();

        // tslint:disable-next-line:deprecation
        switch (event.keyCode) {
            case LEFT_ARROW:
                this.activeDate = this.dateAdapter.addCalendarYears(this._activeDate, isRtl ? 1 : -1);
                break;
            case RIGHT_ARROW:
                this.activeDate = this.dateAdapter.addCalendarYears(this._activeDate, isRtl ? -1 : 1);
                break;
            case UP_ARROW:
                this.activeDate = this.dateAdapter.addCalendarYears(this._activeDate, -yearsPerRow);
                break;
            case DOWN_ARROW:
                this.activeDate = this.dateAdapter.addCalendarYears(this._activeDate, yearsPerRow);
                break;
            case HOME:
                this.activeDate = this.dateAdapter.addCalendarYears(this._activeDate,
                    -this.dateAdapter.getYear(this._activeDate) % yearsPerPage);
                break;
            case END:
                this.activeDate = this.dateAdapter.addCalendarYears(this._activeDate,
                    yearsPerPage - this.dateAdapter.getYear(this._activeDate) % yearsPerPage - 1);
                break;
            case PAGE_UP:
                this.activeDate =
                    this.dateAdapter.addCalendarYears(
                        this._activeDate, event.altKey ? -yearsPerPage * 10 : -yearsPerPage);
                break;
            case PAGE_DOWN:
                this.activeDate =
                    this.dateAdapter.addCalendarYears(
                        this._activeDate, event.altKey ? yearsPerPage * 10 : yearsPerPage);
                break;
            case ENTER:
            case SPACE:
                this.onYearSelected(this.dateAdapter.getYear(this._activeDate));
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

    getActiveCell(): number {
        return this.dateAdapter.getYear(this.activeDate) % yearsPerPage;
    }

    /** Focuses the active cell after the microtask queue is empty. */
    focusActiveCell() {
        this.mcCalendarBody.focusActiveCell();
    }

    /** Creates an McCalendarCell for the given year. */
    private createCellForYear(year: number) {
        const yearName = this.dateAdapter.getYearName(this.dateAdapter.createDate(year, 0, 1));

        return new McCalendarCell(year, yearName, yearName, this.shouldEnableYear(year));
    }

    /** Whether the given year is enabled. */
    private shouldEnableYear(year: number) {
        // disable if the year is greater than maxDate lower than minDate
        if (year === undefined || year === null ||
            (this.maxDate && year > this.dateAdapter.getYear(this.maxDate)) ||
            (this.minDate && year < this.dateAdapter.getYear(this.minDate))) {
            return false;
        }

        // enable if it reaches here and there's no filter defined
        if (!this.dateFilter) {
            return true;
        }

        const firstOfYear = this.dateAdapter.createDate(year, 0, 1);

        // If any date in the year is enabled count the year as enabled.
        for (let date = firstOfYear; this.dateAdapter.getYear(date) === year;
             date = this.dateAdapter.addCalendarDays(date, 1)) {
            if (this.dateFilter(date)) {
                return true;
            }
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
