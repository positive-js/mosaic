// tslint:disable:no-magic-numbers
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    ViewEncapsulation,
    NgZone,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import { take } from 'rxjs/operators';


/**
 * Extra CSS classes that can be associated with a calendar cell.
 */
export type McCalendarCellCssClasses = string | string[] | Set<string> | { [key: string]: any };

/**
 * An internal class that represents the data corresponding to a single calendar cell.
 * @docs-private
 */
export class McCalendarCell {
    constructor(
        public value: number,
        public displayValue: string,
        public ariaLabel: string,
        public enabled: boolean,
        public cssClasses?: McCalendarCellCssClasses
    ) {
    }
}


/**
 * An internal component used to display calendar data in a table.
 * @docs-private
 */
@Component({
    selector: '[mc-calendar-body]',
    exportAs: 'mcCalendarBody',
    templateUrl: 'calendar-body.html',
    styleUrls: ['calendar-body.scss'],
    host: {
        class: 'mc-calendar__body',
        role: 'grid',
        'aria-readonly': 'true'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McCalendarBody implements OnChanges {
    /** The label for the table. (e.g. "Jan 2017"). */
    @Input() label: string;

    /** The cells to display in the table. */
    @Input() rows: McCalendarCell[][];

    /** The value in the table that corresponds to today. */
    @Input() todayValue: number;

    /** The value in the table that is currently selected. */
    @Input() selectedValue: number;

    /** The minimum number of free cells needed to fit the label in the first row. */
    @Input() labelMinRequiredCells: number;

    /** The number of columns in the table. */
    @Input() numCols = 7;

    /** The cell number of the active cell in the table. */
    @Input() activeCell = 0;

    /**
     * The aspect ratio (width / height) to use for the cells in the table. This aspect ratio will be
     * maintained even as the table resizes.
     */
    @Input() cellAspectRatio = 1;

    /** Emits when a new value is selected. */
    @Output() readonly selectedValueChange: EventEmitter<number> = new EventEmitter<number>();

    /** The number of blank cells to put at the beginning for the first row. */
    firstRowOffset: number;

    /** Padding for the individual date cells. */
    cellPadding: string;

    /** Width of an individual cell. */
    cellWidth: string;

    constructor(private elementRef: ElementRef<HTMLElement>, private ngZone: NgZone) {
    }

    cellClicked(cell: McCalendarCell): void {
        if (cell.enabled) {
            this.selectedValueChange.emit(cell.value);
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        const columnChanges = changes.numCols;
        // tslint:disable-next-line:no-this-assignment
        const { rows, numCols } = this;

        if (changes.rows || columnChanges) {
            this.firstRowOffset = rows && rows.length && rows[0].length ? numCols - rows[0].length : 0;
        }

        if (changes.cellAspectRatio || columnChanges || !this.cellPadding) {
            this.cellPadding = `${this.cellAspectRatio * 50 / numCols}%`;
        }

        if (columnChanges || !this.cellWidth) {
            this.cellWidth = `${100 / numCols}%`;
        }
    }

    isActiveCell(rowIndex: number, colIndex: number): boolean {
        let cellNumber = rowIndex * this.numCols + colIndex;

        // Account for the fact that the first row may not have as many cells.
        if (rowIndex) {
            cellNumber -= this.firstRowOffset;
        }

        return cellNumber === this.activeCell;
    }

    /** Focuses the active cell after the microtask queue is empty. */
    focusActiveCell() {
        this.ngZone.runOutsideAngular(() => {
            this.ngZone.onStable.asObservable().pipe(take(1)).subscribe(() => {
                const activeCell: HTMLElement | null =
                    this.elementRef.nativeElement.querySelector('.mc-calendar__body_active');

                if (activeCell) {
                    activeCell.focus();
                }
            });
        });
    }
}
