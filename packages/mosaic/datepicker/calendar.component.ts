import { ComponentPortal, ComponentType, Portal } from '@angular/cdk/portal';
import {
    AfterContentInit,
    AfterViewChecked,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    forwardRef,
    Inject,
    Input,
    OnChanges,
    OnDestroy,
    Optional,
    Output,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { DateAdapter, MC_DATE_FORMATS, McDateFormats } from '@ptsecurity/cdk/datetime';
import { Subject, Subscription } from 'rxjs';

import { McCalendarCellCssClasses } from './calendar-body.component';
import { createMissingDateImplError } from './datepicker-errors';
import { McDatepickerIntl } from './datepicker-intl';
import { McMonthView } from './month-view.component';
import { McMultiYearView, yearsPerPage } from './multi-year-view.component';
import { McYearView } from './year-view.component';


/**
 * Possible views for the calendar.
 * @docs-private
 */
export enum McCalendarView {
    Month = 'month',
    Year = 'year',
    MultiYear = 'multi-year'
}

/** Default header for McCalendar */
@Component({
    selector: 'mc-calendar-header',
    templateUrl: 'calendar-header.html',
    exportAs: 'mcCalendarHeader',
    host: {
        class: 'mc-calendar-header'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McCalendarHeader<D> {
    constructor(
        private readonly intl: McDatepickerIntl,
        @Inject(forwardRef(() => McCalendar)) public calendar: McCalendar<D>,
        @Optional() private readonly dateAdapter: DateAdapter<D>,
        @Optional() @Inject(MC_DATE_FORMATS) private readonly dateFormats: McDateFormats,
        changeDetectorRef: ChangeDetectorRef
    ) {
        this.calendar.stateChanges.subscribe(() => changeDetectorRef.markForCheck());
    }

    /** The label for the current calendar view. */
    get periodButtonText(): string {
        if (this.calendar.currentView === McCalendarView.Month) {
            const label = this.dateAdapter.format(this.calendar.activeDate, this.dateFormats.monthYearLabel);

            return label[0].toLocaleUpperCase() + label.substr(1);
        }

        if (this.calendar.currentView === McCalendarView.Year) {
            return this.dateAdapter.getYearName(this.calendar.activeDate);
        }

        const activeYear = this.dateAdapter.getYear(this.calendar.activeDate);
        const firstYearInView = this.dateAdapter.getYearName(
            // tslint:disable-next-line:no-magic-numbers
            this.dateAdapter.createDate(activeYear - activeYear % 24, 0, 1)
        );
        const lastYearInView = this.dateAdapter.getYearName(
            // tslint:disable-next-line:no-magic-numbers
            this.dateAdapter.createDate(activeYear + yearsPerPage - 1 - activeYear % 24, 0, 1)
        );

        return `${firstYearInView} \u2013 ${lastYearInView}`;
    }

    get periodButtonLabel(): string {
        return this.calendar.currentView === McCalendarView.Month ?
            this.intl.switchToMultiYearViewLabel : this.intl.switchToMonthViewLabel;
    }

    /** The label for the previous button. */
    get prevButtonLabel(): string {
        return {
            [McCalendarView.Month]: this.intl.prevMonthLabel,
            [McCalendarView.Year]: this.intl.prevYearLabel,
            [McCalendarView.MultiYear]: this.intl.prevMultiYearLabel
        }[this.calendar.currentView];
    }

    /** The label for the next button. */
    get nextButtonLabel(): string {
        return {
            [McCalendarView.Month]: this.intl.nextMonthLabel,
            [McCalendarView.Year]: this.intl.nextYearLabel,
            [McCalendarView.MultiYear]: this.intl.nextMultiYearLabel
        }[this.calendar.currentView];
    }

    /** Handles user clicks on the period label. */
    currentPeriodClicked(): void {
        if (([McCalendarView.Month, McCalendarView.MultiYear] as McCalendarView[]).includes(this.calendar.currentView)) {
            this.calendar.currentView = McCalendarView.Year;
        } else if (this.calendar.currentView === McCalendarView.Year) {
            this.calendar.currentView = McCalendarView.Month;
        }
    }

    /** Handles user clicks on the previous button. */
    previousClicked(): void {
        if (this.calendar.currentView === McCalendarView.Month) {
            this.calendar.activeDate = this.dateAdapter.addCalendarMonths(this.calendar.activeDate, -1);
        } else {
            this.calendar.activeDate = this.dateAdapter.addCalendarYears(
                this.calendar.activeDate,
                this.calendar.currentView === McCalendarView.Year ? -1 : -yearsPerPage
            );
        }
    }

    /** Handles user clicks on the next button. */
    nextClicked(): void {
        if (this.calendar.currentView === McCalendarView.Month) {
            this.calendar.activeDate = this.dateAdapter.addCalendarMonths(this.calendar.activeDate, 1);
        } else {
            this.calendar.activeDate = this.dateAdapter.addCalendarYears(
                this.calendar.activeDate,
                this.calendar.currentView === McCalendarView.Year ? 1 : yearsPerPage
            );
        }
    }

    /** Whether the previous period button is enabled. */
    previousEnabled(): boolean {
        if (!this.calendar.minDate) { return true; }

        return !this.calendar.minDate || !this.isSameView(this.calendar.activeDate, this.calendar.minDate);
    }

    /** Whether the next period button is enabled. */
    nextEnabled(): boolean {
        return !this.calendar.maxDate || !this.isSameView(this.calendar.activeDate, this.calendar.maxDate);
    }

    /** Whether the two dates represent the same view in the current view mode (month or year). */
    private isSameView(firstDate: D, secondDate: D): boolean {
        const firstYear = this.dateAdapter.getYear(firstDate);
        const secondYear = this.dateAdapter.getYear(secondDate);

        const firstMonth = this.dateAdapter.getMonth(firstDate);
        const secondMonth = this.dateAdapter.getMonth(secondDate);

        if (this.calendar.currentView === McCalendarView.Month) {
            return firstYear === secondYear && firstMonth === secondMonth;
        }

        if (this.calendar.currentView === McCalendarView.Year) { return firstYear === secondYear; }

        // Otherwise we are in 'multi-year' view.
        return Math.floor(firstYear / yearsPerPage) === Math.floor(secondYear / yearsPerPage);
    }
}

/**
 * A calendar that is used as part of the datepicker.
 * @docs-private
 */
@Component({
    selector: 'mc-calendar',
    exportAs: 'mcCalendar',
    templateUrl: 'calendar.html',
    styleUrls: ['calendar.scss'],
    host: {
        class: 'mc-calendar'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McCalendar<D> implements AfterContentInit, AfterViewChecked, OnDestroy, OnChanges {

    /** A date representing the period (month or year) to start the calendar in. */
    @Input()
    get startAt(): D | null {
        return this._startAt;
    }

    set startAt(value: D | null) {
        this._startAt = this.getValidDateOrNull(this.dateAdapter.deserialize(value));
    }

    /** The currently selected date. */
    @Input()
    get selected(): D | null {
        return this._selected;
    }

    set selected(value: D | null) {
        this._selected = this.getValidDateOrNull(this.dateAdapter.deserialize(value));
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

    /**
     * The current active date. This determines which time period is shown and which date is
     * highlighted when using keyboard navigation.
     */
    get activeDate(): D {
        return this.clampedActiveDate;
    }

    set activeDate(value: D) {
        this.clampedActiveDate = this.dateAdapter.clampDate(value, this.minDate, this.maxDate);
        this.stateChanges.next();
    }

    /** Whether the calendar is in month view. */
    get currentView(): McCalendarView {
        return this._currentView;
    }

    set currentView(value: McCalendarView) {
        this._currentView = value;
        this.moveFocusOnNextTick = true;
    }

    /** An input indicating the type of the header component, if set. */
    @Input() headerComponent: ComponentType<any>;

    /** A portal containing the header component type for this calendar. */
    calendarHeaderPortal: Portal<any>;

    /** Whether the calendar should be started in month or year view. */
    @Input() startView: McCalendarView = McCalendarView.Month;

    /** Function used to filter which dates are selectable. */
    @Input() dateFilter: (date: D) => boolean;

    /** Function that can be used to add custom CSS classes to dates. */
    @Input() dateClass: (date: D) => McCalendarCellCssClasses;

    /** Emits when the currently selected date changes. */
    @Output() readonly selectedChange: EventEmitter<D> = new EventEmitter<D>();

    /**
     * Emits the year chosen in multiyear view.
     * This doesn't imply a change on the selected date.
     */
    @Output() readonly yearSelected: EventEmitter<D> = new EventEmitter<D>();

    /**
     * Emits the month chosen in year view.
     * This doesn't imply a change on the selected date.
     */
    @Output() readonly monthSelected: EventEmitter<D> = new EventEmitter<D>();

    /** Emits when any date is selected. */
    @Output() readonly userSelection: EventEmitter<void> = new EventEmitter<void>();

    /** Reference to the current month view component. */
    @ViewChild(McMonthView, {static: false}) monthView: McMonthView<D>;

    /** Reference to the current year view component. */
    @ViewChild(McYearView, {static: false}) yearView: McYearView<D>;

    /** Reference to the current multi-year view component. */
    @ViewChild(McMultiYearView, {static: false}) multiYearView: McMultiYearView<D>;

    /**
     * Emits whenever there is a state change that the header may need to respond to.
     */
    stateChanges = new Subject<void>();

    private readonly intlChanges: Subscription;

    /**
     * Used for scheduling that focus should be moved to the active cell on the next tick.
     * We need to schedule it, rather than do it immediately, because we have to wait
     * for Angular to re-evaluate the view children.
     */
    private moveFocusOnNextTick = false;
    private _startAt: D | null;
    private _selected: D | null;
    private _minDate: D | null;
    private _maxDate: D | null;
    private clampedActiveDate: D;
    private _currentView: McCalendarView;

    constructor(
        intl: McDatepickerIntl,
        @Optional() private readonly dateAdapter: DateAdapter<D>,
        @Optional() @Inject(MC_DATE_FORMATS) private readonly dateFormats: McDateFormats,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        if (!this.dateAdapter) {
            throw createMissingDateImplError('DateAdapter');
        }

        if (!this.dateFormats) {
            throw createMissingDateImplError('MC_DATE_FORMATS');
        }

        this.intlChanges = intl.changes.subscribe(() => {
            changeDetectorRef.markForCheck();
            this.stateChanges.next();
        });
    }

    ngAfterContentInit() {
        this.calendarHeaderPortal = new ComponentPortal(this.headerComponent || McCalendarHeader);
        this.activeDate = this.startAt || this.dateAdapter.today();

        // Assign to the private property since we don't want to move focus on init.
        this._currentView = this.startView;
    }

    ngAfterViewChecked() {
        if (this.moveFocusOnNextTick) {
            this.moveFocusOnNextTick = false;
            this.focusActiveCell();
        }
    }

    ngOnDestroy() {
        this.intlChanges.unsubscribe();
        this.stateChanges.complete();
    }

    ngOnChanges(changes: SimpleChanges) {
        const change = changes.minDate || changes.maxDate || changes.dateFilter;

        if (change && !change.firstChange) {
            const view = this.getCurrentViewComponent();

            if (view) {
                // We need to `detectChanges` manually here, because the `minDate`, `maxDate` etc. are
                // passed down to the view via data bindings which won't be up-to-date when we call `init`.
                this.changeDetectorRef.detectChanges();
                view.init();
            }
        }

        this.stateChanges.next();
    }

    focusActiveCell() {
        this.getCurrentViewComponent().focusActiveCell();
    }

    /** Updates today's date after an update of the active date */
    updateTodaysDate() {
        const view = this.currentView === McCalendarView.Month ? this.monthView :
            (this.currentView === McCalendarView.Year ? this.yearView : this.multiYearView);

        view.ngAfterContentInit();
    }

    /** Handles date selection in the month view. */
    dateSelected(date: D): void {
        if (!this.dateAdapter.sameDate(date, this.selected)) {
            this.selectedChange.emit(date);
        }
    }

    /** Handles year selection in the multiyear view. */
    yearSelectedInMultiYearView(normalizedYear: D) {
        this.yearSelected.emit(normalizedYear);
    }

    /** Handles month selection in the year view. */
    monthSelectedInYearView(normalizedMonth: D) {
        this.monthSelected.emit(normalizedMonth);
    }

    userSelected(): void {
        this.userSelection.emit();
    }

    /** Handles year/month selection in the multi-year/year views. */
    goToDateInView(date: D, view: McCalendarView | string): void {
        this.activeDate = date;
        this.currentView = view as McCalendarView;
    }

    /**
     * @param obj The object to check.
     * @returns The given object if it is both a date instance and valid, otherwise null.
     */
    private getValidDateOrNull(obj: any): D | null {
        return (this.dateAdapter.isDateInstance(obj) && this.dateAdapter.isValid(obj)) ? obj : null;
    }

    /** Returns the component instance that corresponds to the current calendar view. */
    private getCurrentViewComponent() {
        return this.monthView || this.yearView || this.multiYearView;
    }
}
