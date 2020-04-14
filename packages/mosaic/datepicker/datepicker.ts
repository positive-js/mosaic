// tslint:disable:no-unbound-method
// tslint:disable:no-magic-numbers
import { Directionality } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    Overlay,
    OverlayConfig,
    OverlayRef,
    PositionStrategy,
    ScrollStrategy
} from '@angular/cdk/overlay';
import { ComponentPortal, ComponentType } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ComponentRef,
    EventEmitter,
    Inject,
    InjectionToken,
    Input,
    NgZone,
    OnDestroy,
    Optional,
    Output,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import { DateAdapter } from '@ptsecurity/cdk/datetime';
import { ESCAPE, UP_ARROW } from '@ptsecurity/cdk/keycodes';
import { McFormFieldControl } from '@ptsecurity/mosaic/form-field';
import { merge, Observable, Subject, Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { McCalendar } from './calendar';
import { McCalendarCellCssClasses } from './calendar-body';
import { mcDatepickerAnimations } from './datepicker-animations';
import { createMissingDateImplError } from './datepicker-errors';
import { McDatepickerInput } from './datepicker-input';


/** Used to generate a unique ID for each datepicker instance. */
let datepickerUid = 0;

/** Injection token that determines the scroll handling while the calendar is open. */
export const MC_DATEPICKER_SCROLL_STRATEGY =
    new InjectionToken<() => ScrollStrategy>('mc-datepicker-scroll-strategy');

/** @docs-private */
// tslint:disable-next-line:naming-convention
export function MC_DATEPICKER_SCROLL_STRATEGY_FACTORY(overlay: Overlay): () => ScrollStrategy {
    return () => overlay.scrollStrategies.reposition();
}

/** @docs-private */
export const MC_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER = {
    provide: MC_DATEPICKER_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: MC_DATEPICKER_SCROLL_STRATEGY_FACTORY
};

/**
 * Component used as the content for the datepicker dialog and popup. We use this instead of using
 * McCalendar directly as the content so we can control the initial focus. This also gives us a
 * place to put additional features of the popup that are not part of the calendar itself in the
 * future. (e.g. confirmation buttons).
 * @docs-private
 */
@Component({
    selector: 'mc-datepicker__content',
    exportAs: 'mcDatepickerContent',
    templateUrl: 'datepicker-content.html',
    styleUrls: ['datepicker-content.scss'],
    host: {
        class: 'mc-datepicker__content',
        '[@transformPanel]': '"enter"'
    },
    animations: [
        mcDatepickerAnimations.transformPanel,
        mcDatepickerAnimations.fadeInCalendar
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McDatepickerContent<D> implements AfterViewInit {

    /** Reference to the internal calendar component. */
    @ViewChild(McCalendar, { static: false }) calendar: McCalendar<D>;

    /** Reference to the datepicker that created the overlay. */
    datepicker: McDatepicker<D>;

    ngAfterViewInit() {
        this.calendar.focusActiveCell();
    }
}


// TODO: We use a component instead of a directive here so the user can use implicit
// template reference variables (e.g. #d vs #d="mcDatepicker"). We can change this to a directive
// if angular adds support for `exportAs: '$implicit'` on directives.
/** Component responsible for managing the datepicker popup/dialog. */
@Component({
    selector: 'mc-datepicker',
    template: '',
    exportAs: 'mcDatepicker',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: McFormFieldControl, useExisting: McDatepicker }]
})
export class McDatepicker<D> implements OnDestroy {

    /** The date to open the calendar to initially. */
    @Input()
    get startAt(): D | null {
        // If an explicit startAt is set we start there, otherwise we start at whatever the currently
        // selected value is.
        return this._startAt || (this.datepickerInput ? this.datepickerInput.value : null);
    }

    set startAt(value: D | null) {
        this._startAt = this.getValidDateOrNull(this.dateAdapter.deserialize(value));
    }

    /** Whether the datepicker pop-up should be disabled. */
    @Input()
    get disabled(): boolean {
        return this._disabled === undefined && this.datepickerInput ?
            this.datepickerInput.disabled : !!this._disabled;
    }

    set disabled(value: boolean) {
        const newValue = coerceBooleanProperty(value);

        if (newValue !== this._disabled) {
            this._disabled = newValue;
            this.disabledChange.next(newValue);
        }
    }

    /** Whether the calendar is open. */
    @Input()
    get opened(): boolean {
        return this._opened;
    }

    set opened(value: boolean) {
        if (value) {
            this.open();
        } else {
            this.close();
        }
    }

    /** The currently selected date. */
    get selected(): D | null {
        return this.validSelected;
    }

    set selected(value: D | null) {
        this.validSelected = value;
    }

    /** The minimum selectable date. */
    get minDate(): D | null {
        return this.datepickerInput && this.datepickerInput.min;
    }

    /** The maximum selectable date. */
    get maxDate(): D | null {
        return this.datepickerInput && this.datepickerInput.max;
    }

    get dateFilter(): (date: D | null) => boolean {
        return this.datepickerInput && this.datepickerInput.dateFilter;
    }


    get value(): D | null {
        return this.selected;
    }

    /** An input indicating the type of the custom header component for the calendar, if set. */
    @Input() calendarHeaderComponent: ComponentType<any>;

    /** The view that the calendar should start in. */
    @Input() startView: 'month' | 'year' | 'multi-year' = 'month';

    /**
     * Emits selected year in multiyear view.
     * This doesn't imply a change on the selected date.
     */
    @Output() readonly yearSelected: EventEmitter<D> = new EventEmitter<D>();

    /**
     * Emits selected month in year view.
     * This doesn't imply a change on the selected date.
     */
    @Output() readonly monthSelected: EventEmitter<D> = new EventEmitter<D>();

    /** Classes to be passed to the date picker panel. Supports the same syntax as `ngClass`. */
    @Input() panelClass: string | string[];

    /** Function that can be used to add custom CSS classes to dates. */
    @Input() dateClass: (date: D) => McCalendarCellCssClasses;

    /** Emits when the datepicker has been opened. */
    @Output('opened') openedStream: EventEmitter<void> = new EventEmitter<void>();

    /** Emits when the datepicker has been closed. */
    @Output('closed') closedStream: EventEmitter<void> = new EventEmitter<void>();

    /** The id for the datepicker calendar. */
    id: string = `mc-datepicker-${datepickerUid++}`;

    /** A reference to the overlay when the calendar is opened as a popup. */
    popupRef: OverlayRef;

    /** The input element this datepicker is associated with. */
    datepickerInput: McDatepickerInput<D>;

    readonly stateChanges: Observable<void> = new Subject<void>();

    /** Emits when the datepicker is disabled. */
    readonly disabledChange = new Subject<boolean>();

    /** Emits new selected date when selected date changes. */
    readonly selectedChanged = new Subject<D>();
    private scrollStrategy: () => ScrollStrategy;
    private _startAt: D | null;
    private _disabled: boolean;
    private _opened = false;
    private validSelected: D | null = null;

    /** A portal containing the calendar for this datepicker. */
    private calendarPortal: ComponentPortal<McDatepickerContent<D>>;

    /** Reference to the component instantiated in popup mode. */
    private popupComponentRef: ComponentRef<McDatepickerContent<D>> | null;

    /** The element that was focused before the datepicker was opened. */
    private focusedElementBeforeOpen: HTMLElement | null = null;

    /** Subscription to value changes in the associated input element. */
    private inputSubscription = Subscription.EMPTY;

    constructor(
        private overlay: Overlay,
        private ngZone: NgZone,
        private viewContainerRef: ViewContainerRef,
        @Inject(MC_DATEPICKER_SCROLL_STRATEGY) scrollStrategy: any,
        @Optional() private dateAdapter: DateAdapter<D>,
        @Optional() private dir: Directionality,
        @Optional() @Inject(DOCUMENT) private document: any
    ) {
        if (!this.dateAdapter) {
            throw createMissingDateImplError('DateAdapter');
        }

        this.scrollStrategy = scrollStrategy;
    }

    ngOnDestroy() {
        this.close();
        this.inputSubscription.unsubscribe();
        this.disabledChange.complete();

        if (this.popupRef) {
            this.popupRef.dispose();
            this.popupComponentRef = null;
        }
    }

    /** Selects the given date */
    select(date: D): void {
        const oldValue = this.selected;
        this.selected = date;
        if (!this.dateAdapter.sameDate(oldValue, this.selected)) {
            this.selectedChanged.next(date);
        }
    }

    /** Emits the selected year in multiyear view */
    selectYear(normalizedYear: D): void {
        this.yearSelected.emit(normalizedYear);
    }

    /** Emits selected month in year view */
    selectMonth(normalizedMonth: D): void {
        this.monthSelected.emit(normalizedMonth);
    }

    /**
     * Register an input with this datepicker.
     * @param input The datepicker input to register with this datepicker.
     */
    registerInput(input: McDatepickerInput<D>): void {
        if (this.datepickerInput) {
            throw Error('A McDatepicker can only be associated with a single input.');
        }
        this.datepickerInput = input;
        this.inputSubscription =
            this.datepickerInput.valueChange.subscribe((value: D | null) => this.selected = value);
    }

    /** Open the calendar. */
    open(): void {
        if (this._opened || this.disabled) {
            return;
        }
        if (!this.datepickerInput) {
            throw Error('Attempted to open an McDatepicker with no associated input.');
        }
        if (this.document) {
            this.focusedElementBeforeOpen = this.document.activeElement;
        }

        this.openAsPopup();

        this._opened = true;
        this.openedStream.emit();
    }

    /** Close the calendar. */
    close(): void {
        if (!this._opened) {
            return;
        }

        if (this.popupRef && this.popupRef.hasAttached()) {
            this.popupRef.detach();
        }

        if (this.calendarPortal && this.calendarPortal.isAttached) {
            this.calendarPortal.detach();
        }

        const completeClose = () => {
            // The `_opened` could've been reset already if
            // we got two events in quick succession.
            if (this._opened) {
                this._opened = false;
                this.closedStream.emit();
                this.focusedElementBeforeOpen = null;

                this.datepickerInput.elementRef.nativeElement.focus();
            }
        };

        if (this.focusedElementBeforeOpen &&
            typeof this.focusedElementBeforeOpen.focus === 'function') {
            // Because IE moves focus asynchronously, we can't count on it being restored before we've
            // marked the datepicker as closed. If the event fires out of sequence and the element that
            // we're refocusing opens the datepicker on focus, the user could be stuck with not being
            // able to close the calendar at all. We work around it by making the logic, that marks
            // the datepicker as closed, async as well.
            this.focusedElementBeforeOpen.focus();
            setTimeout(completeClose);
        } else {
            completeClose();
        }
    }

    /** Open the calendar as a popup. */
    private openAsPopup(): void {
        if (!this.calendarPortal) {
            this.calendarPortal = new ComponentPortal<McDatepickerContent<D>>(McDatepickerContent,
                this.viewContainerRef);
        }

        if (!this.popupRef) {
            this.createPopup();
        }

        if (!this.popupRef.hasAttached()) {
            this.popupComponentRef = this.popupRef.attach(this.calendarPortal);
            this.popupComponentRef.instance.datepicker = this;

            // Update the position once the calendar has rendered.
            this.ngZone.onStable.asObservable().pipe(take(1)).subscribe(() => {
                this.popupRef.updatePosition();
            });
        }
    }

    /** Create the popup. */
    private createPopup(): void {
        const overlayConfig = new OverlayConfig({
            positionStrategy: this.createPopupPositionStrategy(),
            hasBackdrop: true,
            backdropClass: 'mc-overlay-transparent-backdrop',
            direction: this.dir,
            scrollStrategy: this.scrollStrategy(),
            panelClass: 'mc-datepicker__popup'
        });

        this.popupRef = this.overlay.create(overlayConfig);
        this.popupRef.overlayElement.setAttribute('role', 'dialog');

        merge(
            this.popupRef.backdropClick(),
            this.popupRef.detachments(),
            this.popupRef.keydownEvents().pipe(filter((event) => {
                // Closing on alt + up is only valid when there's an input associated with the datepicker.
                // tslint:disable-next-line:deprecation
                return event.keyCode === ESCAPE || (this.datepickerInput && event.altKey && event.keyCode === UP_ARROW);
            }))
        ).subscribe(() => this.close());
    }

    /** Create the popup PositionStrategy. */
    private createPopupPositionStrategy(): PositionStrategy {
        return this.overlay.position()
            .flexibleConnectedTo(this.datepickerInput.elementRef)
            .withTransformOriginOn('.mc-datepicker__content')
            .withFlexibleDimensions(false)
            .withViewportMargin(8)
            .withLockedPosition()
            .withPositions([
                {
                    originX: 'start',
                    originY: 'bottom',
                    overlayX: 'start',
                    overlayY: 'top'
                },
                {
                    originX: 'start',
                    originY: 'top',
                    overlayX: 'start',
                    overlayY: 'bottom'
                },
                {
                    originX: 'end',
                    originY: 'bottom',
                    overlayX: 'end',
                    overlayY: 'top'
                },
                {
                    originX: 'end',
                    originY: 'top',
                    overlayX: 'end',
                    overlayY: 'bottom'
                }
            ]);
    }

    /**
     * @param obj The object to check.
     * @returns The given object if it is both a date instance and valid, otherwise null.
     */
    private getValidDateOrNull(obj: any): D | null {
        return (this.dateAdapter.isDateInstance(obj) && this.dateAdapter.isValid(obj)) ? obj : null;
    }
}
