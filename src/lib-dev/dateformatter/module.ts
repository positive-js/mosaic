// tslint:disable:no-console
// tslint:disable:no-magic-numbers
import { Component, NgModule, ViewEncapsulation, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
    DateAdapter,
    MC_DATE_LOCALE
} from '@ptsecurity/cdk/datetime';
import {
    McMomentDateModule,
    MomentDateAdapter
} from '@ptsecurity/mosaic-moment-adapter/adapter';
import { McDatepickerModule } from '@ptsecurity/mosaic/datepicker';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
// tslint:disable-next-line:ordered-imports
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';


const moment = _rollupMoment || _moment;

@Component({
    selector: 'app',
    template: require('./template.html'),
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [
        {provide: MC_DATE_LOCALE, useValue: 'ru'},
        {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MC_DATE_LOCALE]}
    ]
})
export class DemoComponent {
    // ABSOLUTE LONG
    // ru
    ruLongDateCurrentYear: string;
    ruLongDateNotCurrentYear: string;
    ruLongDateTimeCurrentYear: string;
    ruLongDateTimeNotCurrentYear: string;
    // en
    enLongDateCurrentYear: string;
    enLongDateNotCurrentYear: string;
    enLongDateTimeCurrentYear: string;
    enLongDateTimeNotCurrentYear: string;

    // ABSOLUTE SHORT
    // ru
    ruShortDateCurrentYear: string;
    ruShortDateNotCurrentYear: string;
    ruShortDateTimeCurrentYear: string;
    ruShortDateTimeNotCurrentYear: string;
    // en
    enShortDateCurrentYear: string;
    enShortDateNotCurrentYear: string;
    enShortDateTimeCurrentYear: string;
    enShortDateTimeNotCurrentYear: string;

    // RELATIVE LONG
    // ru
    ruRelativeLongSecondsAgo: string;
    ruRelativeLongMinutesAgo: string;
    ruRelativeLongToday: string;
    ruRelativeLongYesterday: string;
    ruRelativeLongBeforeYesterdayCurrentYear: string;
    ruRelativeLongBeforeYesterdayNotCurrentYear: string;
    // en
    enRelativeLongSecondsAgo: string;
    enRelativeLongMinutesAgo: string;
    enRelativeLongToday: string;
    enRelativeLongYesterday: string;
    enRelativeLongBeforeYesterdayCurrentYear: string;
    enRelativeLongBeforeYesterdayNotCurrentYear: string;

    // RELATIVE SHORT
    // ru
    ruRelativeShortSecondsAgo: string;
    ruRelativeShortMinutesAgo: string;
    ruRelativeShortToday: string;
    ruRelativeShortYesterday: string;
    ruRelativeShortBeforeYesterdayCurrentYear: string;
    ruRelativeShortBeforeYesterdayNotCurrentYear: string;
    // en
    enRelativeShortSecondsAgo: string;
    enRelativeShortMinutesAgo: string;
    enRelativeShortToday: string;
    enRelativeShortYesterday: string;
    enRelativeShortBeforeYesterdayCurrentYear: string;
    enRelativeShortBeforeYesterdayNotCurrentYear: string;

    // RANGE LONG
    // ru
    ruRangeLongCurrentMonth: string;
    ruRangeLongDateNotCurrentYear: string;
    ruRangeLongDateStartsNotCurrentYear: string;
    ruRangeLongDateEndsNotCurrentYear: string;
    ruRangeLongDateTimeSameDateCurrentYear: string;
    ruRangeLongDateTimeSameDateNotCurrentYear: string;
    ruRangeLongDateTimeNotCurrentMonth: string;
    ruRangeLongDateTimeStartsNotCurrentYear: string;
    ruRangeLongDateTimeEndsNotCurrentYear: string;
    // en
    enRangeLongCurrentMonth: string;
    enRangeLongDateNotCurrentYear: string;
    enRangeLongDateStartsNotCurrentYear: string;
    enRangeLongDateEndsNotCurrentYear: string;
    enRangeLongDateTimeSameDateCurrentYear: string;
    enRangeLongDateTimeSameDateNotCurrentYear: string;
    enRangeLongDateTimeNotCurrentMonth: string;
    enRangeLongDateTimeStartsNotCurrentYear: string;
    enRangeLongDateTimeEndsNotCurrentYear: string;

    // RANGE MIDDLE
    // ru
    ruRangeMiddleDateTimeCurrentYear: string;
    ruRangeMiddleDateTimeSameDateCurrentYear: string;
    ruRangeMiddleDateTimeSameDateNotCurrentYear: string;
    ruRangeMiddleDateTimeNotCurrentMonth: string;
    ruRangeMiddleDateTimeStartsNotCurrentYear: string;
    ruRangeMiddleDateTimeEndsNotCurrentYear: string;
    // en
    enRangeMiddleDateTimeCurrentYear: string;
    enRangeMiddleDateTimeSameDateCurrentYear: string;
    enRangeMiddleDateTimeSameDateNotCurrentYear: string;
    enRangeMiddleDateTimeNotCurrentMonth: string;
    enRangeMiddleDateTimeStartsNotCurrentYear: string;
    enRangeMiddleDateTimeEndsNotCurrentYear: string;

    // RANGE SHORT
    // ru
    ruRangeShortCurrentMonth: string;
    ruRangeShortDateNotCurrentYear: string;
    ruRangeShortDateStartsNotCurrentYear: string;
    ruRangeShortDateEndsNotCurrentYear: string;
    ruRangeShortDateTimeSameDateCurrentYear: string;
    ruRangeShortDateTimeSameDateNotCurrentYear: string;
    ruRangeShortDateTimeNotCurrentMonth: string;
    ruRangeShortDateTimeStartsNotCurrentYear: string;
    ruRangeShortDateTimeEndsNotCurrentYear: string;
    // en
    enRangeShortCurrentMonth: string;
    enRangeShortDateNotCurrentYear: string;
    enRangeShortDateStartsNotCurrentYear: string;
    enRangeShortDateEndsNotCurrentYear: string;
    enRangeShortDateTimeSameDateCurrentYear: string;
    enRangeShortDateTimeSameDateNotCurrentYear: string;
    enRangeShortDateTimeNotCurrentMonth: string;
    enRangeShortDateTimeStartsNotCurrentYear: string;
    enRangeShortDateTimeEndsNotCurrentYear: string;

    // tslint:disable-next-line:max-func-body-length
    constructor(
        @Inject(DateAdapter) public dateAdapter: DateAdapter<Moment>
    ) {
        this.populateRuLongDate();
        this.populateEnLongDate();

        this.populateRuShortDate();
        this.populateEnShortDate();

        this.populateRuRelativeLong();
        this.populateEnRelativeLong();

        this.populateRuRelativeShort();
        this.populateEnRelativeShort();

        this.populateRuRangeLong();
        this.populateEnRangeLong();

        this.populateRuRangeMiddle();
        this.populateEnRangeMiddle();

        this.populateRuRangeShort();
        this.populateEnRangeShort();
    }

    private populateEnRangeShort() {
        this.dateAdapter.setLocale('en');
        this.enRangeShortCurrentMonth = this.dateAdapter.rangeShortDate(moment().date(1), moment().date(10));
        this.enRangeShortDateNotCurrentYear = this.dateAdapter.rangeShortDate(
            moment().date(1).month(1),
            moment().date(10).month(2)
        );
        this.enRangeShortDateStartsNotCurrentYear = this.dateAdapter.rangeShortDate(
            moment().date(1).month(1).subtract(1, 'years'),
            moment().date(10).month(2)
        );
        this.enRangeShortDateEndsNotCurrentYear = this.dateAdapter.rangeShortDate(
            moment().date(1).month(1).subtract(1, 'years'),
            moment().date(10).month(2).subtract(1, 'years')
        );
        this.enRangeShortDateTimeSameDateCurrentYear = this.dateAdapter.rangeShortDateTime(
            moment().date(10).hour(10).minutes(14),
            moment().date(10).hour(11).minutes(28)
        );
        this.enRangeShortDateTimeSameDateNotCurrentYear = this.dateAdapter.rangeShortDateTime(
            moment().date(11).month(1).subtract(1, 'years').hour(10).minutes(14),
            moment().date(11).month(1).subtract(1, 'years').hour(11).minutes(28)
        );
        this.enRangeShortDateTimeNotCurrentMonth = this.dateAdapter.rangeShortDateTime(
            moment().date(1).month(1).hour(10).minutes(14),
            moment().date(1).month(2).hour(11).minutes(28)
        );
        this.enRangeShortDateTimeStartsNotCurrentYear = this.dateAdapter.rangeShortDateTime(
            moment().date(1).month(1).subtract(1, 'years').hour(10).minutes(14),
            moment().date(1).month(2).hour(11).minutes(28)
        );
        this.enRangeShortDateTimeEndsNotCurrentYear = this.dateAdapter.rangeShortDateTime(
            moment().date(1).month(1).hour(10).minutes(14),
            moment().date(1).month(2).add(1, 'years').hour(11).minutes(28)
        );
    }

    private populateRuRangeShort() {
        this.dateAdapter.setLocale('ru');
        this.ruRangeShortCurrentMonth = this.dateAdapter.rangeShortDate(moment().date(1), moment().date(10));
        this.ruRangeShortDateNotCurrentYear = this.dateAdapter.rangeShortDate(
            moment().date(1).month(1),
            moment().date(10).month(2)
        );
        this.ruRangeShortDateStartsNotCurrentYear = this.dateAdapter.rangeShortDate(
            moment().date(1).month(1).subtract(1, 'years'),
            moment().date(10).month(2)
        );
        this.ruRangeShortDateEndsNotCurrentYear = this.dateAdapter.rangeShortDate(
            moment().date(1).month(1),
            moment().date(10).month(2).add(1, 'years')
        );
        this.ruRangeShortDateTimeSameDateCurrentYear = this.dateAdapter.rangeShortDateTime(
            moment().date(10).hour(10).minutes(14),
            moment().date(10).hour(11).minutes(28)
        );
        this.ruRangeShortDateTimeSameDateNotCurrentYear = this.dateAdapter.rangeShortDateTime(
            moment().date(11).month(1).subtract(1, 'years').hour(10).minutes(14),
            moment().date(11).month(1).subtract(1, 'years').hour(11).minutes(28)
        );
        this.ruRangeShortDateTimeNotCurrentMonth = this.dateAdapter.rangeShortDateTime(
            moment().date(1).month(1).hour(10).minutes(14),
            moment().date(1).month(2).hour(11).minutes(28)
        );
        this.ruRangeShortDateTimeStartsNotCurrentYear = this.dateAdapter.rangeShortDateTime(
            moment().date(1).month(1).subtract(1, 'years').hour(10).minutes(14),
            moment().date(1).month(2).hour(11).minutes(28)
        );
        this.ruRangeShortDateTimeEndsNotCurrentYear = this.dateAdapter.rangeShortDateTime(
            moment().date(1).month(1).hour(10).minutes(14),
            moment().date(1).month(2).add(1, 'years').hour(11).minutes(28)
        );
    }

    private populateEnRangeMiddle() {
        this.dateAdapter.setLocale('en');
        this.enRangeMiddleDateTimeCurrentYear = this.dateAdapter.rangeMiddleDateTime(
            moment().date(1),
            moment().date(10)
        );
        this.enRangeMiddleDateTimeSameDateCurrentYear = this.dateAdapter.rangeMiddleDateTime(
            moment().date(10).hour(10).minutes(14),
            moment().date(10).hour(11).minutes(28)
        );
        this.enRangeMiddleDateTimeSameDateNotCurrentYear = this.dateAdapter.rangeMiddleDateTime(
            moment().date(11).month(1).subtract(1, 'years').hour(10).minutes(14),
            moment().date(11).month(1).subtract(1, 'years').hour(11).minutes(28)
        );
        this.enRangeMiddleDateTimeNotCurrentMonth = this.dateAdapter.rangeMiddleDateTime(
            moment().date(1).month(1).hour(10).minutes(14),
            moment().date(1).month(2).hour(11).minutes(28)
        );
        this.enRangeMiddleDateTimeStartsNotCurrentYear = this.dateAdapter.rangeMiddleDateTime(
            moment().date(1).month(1).subtract(1, 'years').hour(10).minutes(14),
            moment().date(1).month(2).hour(11).minutes(28)
        );
        this.enRangeMiddleDateTimeEndsNotCurrentYear = this.dateAdapter.rangeMiddleDateTime(
            moment().date(1).month(1).hour(10).minutes(14),
            moment().date(1).month(2).add(1, 'years').hour(11).minutes(28)
        );
    }

    private populateRuRangeMiddle() {
        this.dateAdapter.setLocale('ru');
        this.ruRangeMiddleDateTimeCurrentYear = this.dateAdapter.rangeMiddleDateTime(
            moment().date(1),
            moment().date(10)
        );
        this.ruRangeMiddleDateTimeSameDateCurrentYear = this.dateAdapter.rangeMiddleDateTime(
            moment().date(10).hour(10).minutes(14),
            moment().date(10).hour(11).minutes(28)
        );
        this.ruRangeMiddleDateTimeSameDateNotCurrentYear = this.dateAdapter.rangeMiddleDateTime(
            moment().date(11).month(1).subtract(1, 'years').hour(10).minutes(14),
            moment().date(11).month(1).subtract(1, 'years').hour(11).minutes(28)
        );
        this.ruRangeMiddleDateTimeNotCurrentMonth = this.dateAdapter.rangeMiddleDateTime(
            moment().date(1).month(1).hour(10).minutes(14),
            moment().date(1).month(2).hour(11).minutes(28)
        );
        this.ruRangeMiddleDateTimeStartsNotCurrentYear = this.dateAdapter.rangeMiddleDateTime(
            moment().date(1).month(1).subtract(1, 'years').hour(10).minutes(14),
            moment().date(1).month(2).hour(11).minutes(28)
        );
        this.ruRangeMiddleDateTimeEndsNotCurrentYear = this.dateAdapter.rangeMiddleDateTime(
            moment().date(1).month(1).hour(10).minutes(14),
            moment().date(1).month(2).add(1, 'years').hour(11).minutes(28)
        );
    }

    private populateEnRangeLong() {
        this.dateAdapter.setLocale('en');
        this.enRangeLongCurrentMonth = this.dateAdapter.rangeLongDate(moment().date(1), moment().date(10));
        this.enRangeLongDateNotCurrentYear = this.dateAdapter.rangeLongDate(
            moment().date(1).month(1),
            moment().date(10).month(2)
        );
        this.enRangeLongDateStartsNotCurrentYear = this.dateAdapter.rangeLongDate(
            moment().date(1).month(1).subtract(1, 'years'),
            moment().date(10).month(2)
        );
        this.enRangeLongDateEndsNotCurrentYear = this.dateAdapter.rangeLongDate(
            moment().date(1).month(1).subtract(1, 'years'),
            moment().date(10).month(2).subtract(1, 'years')
        );
        this.enRangeLongDateTimeSameDateCurrentYear = this.dateAdapter.rangeLongDateTime(
            moment().date(10).hour(10).minutes(14),
            moment().date(10).hour(11).minutes(28)
        );
        this.enRangeLongDateTimeSameDateNotCurrentYear = this.dateAdapter.rangeLongDateTime(
            moment().date(11).month(1).subtract(1, 'years').hour(10).minutes(14),
            moment().date(11).month(1).subtract(1, 'years').hour(11).minutes(28)
        );
        this.enRangeLongDateTimeNotCurrentMonth = this.dateAdapter.rangeLongDateTime(
            moment().date(1).month(1).hour(10).minutes(14),
            moment().date(1).month(2).hour(11).minutes(28)
        );
        this.enRangeLongDateTimeStartsNotCurrentYear = this.dateAdapter.rangeLongDateTime(
            moment().date(1).month(1).subtract(1, 'years').hour(10).minutes(14),
            moment().date(1).month(2).hour(11).minutes(28)
        );
        this.enRangeLongDateTimeEndsNotCurrentYear = this.dateAdapter.rangeLongDateTime(
            moment().date(1).month(1).hour(10).minutes(14),
            moment().date(1).month(2).add(1, 'years').hour(11).minutes(28)
        );
    }

    private populateRuRangeLong() {
        this.dateAdapter.setLocale('ru');
        this.ruRangeLongCurrentMonth = this.dateAdapter.rangeLongDate(moment().date(1), moment().date(10));
        this.ruRangeLongDateNotCurrentYear = this.dateAdapter.rangeLongDate(
            moment().date(1).month(1),
            moment().date(10).month(2)
        );
        this.ruRangeLongDateStartsNotCurrentYear = this.dateAdapter.rangeLongDate(
            moment().date(1).month(1).subtract(1, 'years'),
            moment().date(10).month(2)
        );
        this.ruRangeLongDateEndsNotCurrentYear = this.dateAdapter.rangeLongDate(
            moment().date(1).month(1),
            moment().date(10).month(2).add(1, 'years')
        );
        this.ruRangeLongDateTimeSameDateCurrentYear = this.dateAdapter.rangeLongDateTime(
            moment().date(10).hour(10).minutes(14),
            moment().date(10).hour(11).minutes(28)
        );
        this.ruRangeLongDateTimeSameDateNotCurrentYear = this.dateAdapter.rangeLongDateTime(
            moment().date(11).month(1).subtract(1, 'years').hour(10).minutes(14),
            moment().date(11).month(1).subtract(1, 'years').hour(11).minutes(28)
        );
        this.ruRangeLongDateTimeNotCurrentMonth = this.dateAdapter.rangeLongDateTime(
            moment().date(1).month(1).hour(10).minutes(14),
            moment().date(1).month(2).hour(11).minutes(28)
        );
        this.ruRangeLongDateTimeStartsNotCurrentYear = this.dateAdapter.rangeLongDateTime(
            moment().date(1).month(1).subtract(1, 'years').hour(10).minutes(14),
            moment().date(1).month(2).hour(11).minutes(28)
        );
        this.ruRangeLongDateTimeEndsNotCurrentYear = this.dateAdapter.rangeLongDateTime(
            moment().date(1).month(1).hour(10).minutes(14),
            moment().date(1).month(2).add(1, 'years').hour(11).minutes(28)
        );
    }

    private populateEnRelativeShort() {
        this.dateAdapter.setLocale('en');
        this.enRelativeShortSecondsAgo = this.dateAdapter.relativeShortDate(moment().subtract(1, 'seconds'));
        this.enRelativeShortMinutesAgo = this.dateAdapter.relativeShortDate(moment().subtract(1, 'minutes'));
        this.enRelativeShortToday = this.dateAdapter.relativeShortDate(moment().subtract(1, 'hours'));
        this.enRelativeShortYesterday = this.dateAdapter.relativeShortDate(moment().subtract(1, 'days'));
        this.enRelativeShortBeforeYesterdayCurrentYear =
            this.dateAdapter.relativeShortDate(moment().subtract(2, 'days'));
        this.enRelativeShortBeforeYesterdayNotCurrentYear =
            this.dateAdapter.relativeShortDate(moment().subtract(1, 'years').subtract(2, 'days'));
    }

    private populateRuRelativeShort() {
        this.dateAdapter.setLocale('ru');
        this.ruRelativeShortSecondsAgo = this.dateAdapter.relativeShortDate(moment().subtract(1, 'seconds'));
        this.ruRelativeShortMinutesAgo = this.dateAdapter.relativeShortDate(moment().subtract(1, 'minutes'));
        this.ruRelativeShortToday = this.dateAdapter.relativeShortDate(moment().subtract(1, 'hours'));
        this.ruRelativeShortYesterday = this.dateAdapter.relativeShortDate(moment().subtract(1, 'days'));
        this.ruRelativeShortBeforeYesterdayCurrentYear =
            this.dateAdapter.relativeShortDate(moment().subtract(2, 'days'));
        this.ruRelativeShortBeforeYesterdayNotCurrentYear =
            this.dateAdapter.relativeShortDate(moment().subtract(1, 'years').subtract(2, 'days'));
    }

    private populateEnRelativeLong() {
        this.dateAdapter.setLocale('en');
        this.enRelativeLongSecondsAgo = this.dateAdapter.relativeLongDate(moment().subtract(1, 'seconds'));
        this.enRelativeLongMinutesAgo = this.dateAdapter.relativeLongDate(moment().subtract(1, 'minutes'));
        this.enRelativeLongToday = this.dateAdapter.relativeLongDate(moment().subtract(1, 'hours'));
        this.enRelativeLongYesterday = this.dateAdapter.relativeLongDate(moment().subtract(1, 'days'));
        this.enRelativeLongBeforeYesterdayCurrentYear = this.dateAdapter.relativeLongDate(moment().subtract(2, 'days'));
        this.enRelativeLongBeforeYesterdayNotCurrentYear =
            this.dateAdapter.relativeLongDate(moment().subtract(1, 'years').subtract(2, 'days'));
    }

    private populateRuRelativeLong() {
        this.dateAdapter.setLocale('ru');
        this.ruRelativeLongSecondsAgo = this.dateAdapter.relativeLongDate(moment().subtract(1, 'seconds'));
        this.ruRelativeLongMinutesAgo = this.dateAdapter.relativeLongDate(moment().subtract(1, 'minutes'));
        this.ruRelativeLongToday = this.dateAdapter.relativeLongDate(moment().subtract(1, 'hours'));
        this.ruRelativeLongYesterday = this.dateAdapter.relativeLongDate(moment().subtract(1, 'days'));
        this.ruRelativeLongBeforeYesterdayCurrentYear = this.dateAdapter.relativeLongDate(moment().subtract(2, 'days'));
        this.ruRelativeLongBeforeYesterdayNotCurrentYear =
            this.dateAdapter.relativeLongDate(moment().subtract(1, 'years').subtract(2, 'days'));
    }

    private populateEnShortDate() {
        this.dateAdapter.setLocale('en');
        this.enShortDateCurrentYear = this.dateAdapter.absoluteShortDate(moment());
        this.enShortDateNotCurrentYear = this.dateAdapter.absoluteShortDate(moment().subtract(1, 'years'));
        this.enShortDateTimeCurrentYear = this.dateAdapter.absoluteShortDateTime(moment());
        this.enShortDateTimeNotCurrentYear = this.dateAdapter.absoluteShortDateTime(moment().subtract(1, 'years'));
    }

    private populateRuShortDate() {
        this.dateAdapter.setLocale('ru');
        this.ruShortDateCurrentYear = this.dateAdapter.absoluteShortDate(moment());
        this.ruShortDateNotCurrentYear = this.dateAdapter.absoluteShortDate(moment().subtract(1, 'years'));
        this.ruShortDateTimeCurrentYear = this.dateAdapter.absoluteShortDateTime(moment());
        this.ruShortDateTimeNotCurrentYear = this.dateAdapter.absoluteShortDateTime(moment().subtract(1, 'years'));
    }

    private populateEnLongDate() {
        this.dateAdapter.setLocale('en');
        this.enLongDateCurrentYear = this.dateAdapter.absoluteLongDate(moment());
        this.enLongDateNotCurrentYear = this.dateAdapter.absoluteLongDate(moment().subtract(1, 'years'));
        this.enLongDateTimeCurrentYear = this.dateAdapter.absoluteLongDateTime(moment());
        this.enLongDateTimeNotCurrentYear = this.dateAdapter.absoluteLongDateTime(moment().subtract(1, 'years'));
    }

    private populateRuLongDate() {
        this.dateAdapter.setLocale('ru');
        this.ruLongDateCurrentYear = this.dateAdapter.absoluteLongDate(moment());
        this.ruLongDateNotCurrentYear = this.dateAdapter.absoluteLongDate(moment().subtract(1, 'years'));
        this.ruLongDateTimeCurrentYear = this.dateAdapter.absoluteLongDateTime(moment());
        this.ruLongDateTimeNotCurrentYear = this.dateAdapter.absoluteLongDateTime(moment().subtract(1, 'years'));
    }
}

@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        McFormFieldModule,
        McDatepickerModule,
        McMomentDateModule,
        McInputModule,
        McIconModule
    ],
    bootstrap: [
        DemoComponent
    ],
    providers: []
})
export class DemoModule {}

platformBrowserDynamic()
    .bootstrapModule(DemoModule)
    .catch((error) => console.error(error));
