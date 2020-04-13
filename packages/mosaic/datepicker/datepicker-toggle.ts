import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    Directive,
    Input,
    OnChanges,
    OnDestroy,
    SimpleChanges,
    ViewEncapsulation,
    ViewChild
} from '@angular/core';
import { McButton } from '@ptsecurity/mosaic/button';
import { merge, of as observableOf, Subscription } from 'rxjs';

import { McDatepicker } from './datepicker';
import { McDatepickerIntl } from './datepicker-intl';


/** Can be used to override the icon of a `mcDatepickerToggle`. */
@Directive({
    selector: '[mcDatepickerToggleIcon]'
})
export class McDatepickerToggleIcon {
}


@Component({
    selector: 'mc-datepicker-toggle',
    templateUrl: 'datepicker-toggle.html',
    styleUrls: ['datepicker-toggle.scss'],
    host: {
        class: 'mc-datepicker-toggle',
        '[class.mc-active]': 'datepicker && datepicker.opened'
    },
    exportAs: 'mcDatepickerToggle',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McDatepickerToggle<D> implements AfterContentInit, OnChanges, OnDestroy {

    /** Whether the toggle button is disabled. */
    @Input()
    get disabled(): boolean {
        return this._disabled === undefined ? this.datepicker.disabled : !!this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value);
    }

    /** Datepicker instance that the button will toggle. */
    @Input('for') datepicker: McDatepicker<D>;

    /** Tabindex for the toggle. */
    @Input() tabIndex: number | null;

    /** Custom icon set by the consumer. */
    @ContentChild(McDatepickerToggleIcon, {static: false}) customIcon: McDatepickerToggleIcon;

    /** Underlying button element. */
    @ViewChild('button', {static: false}) button: McButton;
    private stateChanges = Subscription.EMPTY;

    private _disabled: boolean;

    constructor(public intl: McDatepickerIntl, private changeDetectorRef: ChangeDetectorRef) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes.datepicker) {
            this.watchStateChanges();
        }
    }

    ngOnDestroy() {
        this.stateChanges.unsubscribe();
    }

    ngAfterContentInit() {
        this.watchStateChanges();
    }

    open(event: Event): void {
        if (this.datepicker && !this.disabled) {
            this.datepicker.open();
            event.stopPropagation();
        }
    }

    private watchStateChanges() {
        const datepickerDisabled = this.datepicker ? this.datepicker.disabledChange : observableOf();
        const inputDisabled = this.datepicker && this.datepicker.datepickerInput ?
            this.datepicker.datepickerInput.disabledChange : observableOf();
        const datepickerToggled = this.datepicker ?
            merge(this.datepicker.openedStream, this.datepicker.closedStream) :
            observableOf();

        this.stateChanges.unsubscribe();
        this.stateChanges = merge(
            this.intl.changes,
            datepickerDisabled,
            inputDisabled,
            datepickerToggled
        ).subscribe(() => this.changeDetectorRef.markForCheck());
    }
}
