/* tslint:disable:no-magic-numbers */
import { Component } from '@angular/core';
import { DateAdapter, MC_DATE_LOCALE } from '@ptsecurity/cdk/datetime';
import { MomentDateAdapter } from '@ptsecurity/mosaic-moment-adapter';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
// tslint:disable-next-line:ordered-imports
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';


const moment = _rollupMoment || _moment;

/**
 * @title Basic progress range-date-formatter
 */
@Component({
    selector: 'range-date-formatter-example',
    templateUrl: 'range-date-formatter-example.html',
    styleUrls: ['range-date-formatter-example.css'],
    providers: [
        { provide: MC_DATE_LOCALE, useValue: 'ru' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MC_DATE_LOCALE] }
    ]
})
export class RangeDateFormatterExample {
    formats: any = {
        ru: {
            range: {
                long: {
                    date: {},
                    dateTime: {}
                },
                middle: {
                    dateTime: {}
                },
                short: {
                    date: {},
                    dateTime: {}
                }
            }
        },
        en: {
            range: {
                long: {
                    date: {},
                    dateTime: {}
                },
                middle: {
                    dateTime: {}
                },
                short: {
                    date: {},
                    dateTime: {}
                }
            }
        }
    };

    constructor(private dateAdapter: DateAdapter<Moment>) {
        this.populateRangeLong('ru');
        this.populateRangeLong('en');

        this.populateRangeMiddle('ru');
        this.populateRangeMiddle('en');

        this.populateRangeShort('ru');
        this.populateRangeShort('en');
    }

    private populateRangeShort(locale: string) {
        this.dateAdapter.setLocale(locale);

        const shortRange = this.formats[locale].range.short;

        shortRange.date.currentMonth = this.dateAdapter.rangeShortDate(moment().date(1), moment().date(10));
        shortRange.date.notCurrentYear = this.dateAdapter.rangeShortDate(
            moment().date(1).month(1),
            moment().date(10).month(2)
        );
        shortRange.date.startsNotCurrentYear = this.dateAdapter.rangeShortDate(
            moment().date(1).month(1).subtract(1, 'years'),
            moment().date(10).month(2)
        );
        shortRange.date.endsNotCurrentYear = this.dateAdapter.rangeShortDate(
            moment().date(1).month(1),
            moment().date(10).month(2).add(1, 'years')
        );
        shortRange.dateTime.sameDateCurrentYear = this.dateAdapter.rangeShortDateTime(
            moment().date(10).hour(10).minutes(14),
            moment().date(10).hour(11).minutes(28)
        );
        shortRange.dateTime.sameDateNotCurrentYear = this.dateAdapter.rangeShortDateTime(
            moment().date(11).month(1).subtract(1, 'years').hour(10).minutes(14),
            moment().date(11).month(1).subtract(1, 'years').hour(11).minutes(28)
        );
        shortRange.dateTime.notCurrentMonth = this.dateAdapter.rangeShortDateTime(
            moment().date(1).month(1).hour(10).minutes(14),
            moment().date(1).month(2).hour(11).minutes(28)
        );
        shortRange.dateTime.startsNotCurrentYear = this.dateAdapter.rangeShortDateTime(
            moment().date(1).month(1).subtract(1, 'years').hour(10).minutes(14),
            moment().date(1).month(2).hour(11).minutes(28)
        );
        shortRange.dateTime.endsNotCurrentYear = this.dateAdapter.rangeShortDateTime(
            moment().date(1).month(1).hour(10).minutes(14),
            moment().date(1).month(2).add(1, 'years').hour(11).minutes(28)
        );
    }

    private populateRangeMiddle(locale: string) {
        this.dateAdapter.setLocale(locale);

        const middleRange = this.formats[locale].range.middle;

        middleRange.dateTime.currentYear = this.dateAdapter.rangeMiddleDateTime(
            moment().date(1), moment().date(10)
        );
        middleRange.dateTime.sameDateCurrentYear = this.dateAdapter.rangeMiddleDateTime(
            moment().date(10).hour(10).minutes(14),
            moment().date(10).hour(10).minutes(28)
        );
        middleRange.dateTime.sameDateNotCurrentYear = this.dateAdapter.rangeMiddleDateTime(
            moment().date(11).month(1).subtract(1, 'years').hour(10).minutes(14),
            moment().date(11).month(1).subtract(1, 'years').hour(11).minutes(28)
        );
        middleRange.dateTime.notCurrentMonth = this.dateAdapter.rangeMiddleDateTime(
            moment().date(1).month(1).hour(10).minutes(14),
            moment().date(1).month(2).hour(11).minutes(28)
        );
        middleRange.dateTime.startsNotCurrentYear = this.dateAdapter.rangeMiddleDateTime(
            moment().date(1).month(1).subtract(1, 'years').hour(10).minutes(14),
            moment().date(1).month(1).hour(11).minutes(28)
        );
        middleRange.dateTime.endsNotCurrentYear = this.dateAdapter.rangeMiddleDateTime(
            moment().date(1).month(1).hour(10).minutes(14),
            moment().date(1).month(1).add(1, 'years').hour(11).minutes(28)
        );
    }

    private populateRangeLong(locale: string) {
        this.dateAdapter.setLocale(locale);

        const longRange = this.formats[locale].range.long;

        longRange.date.currentMonth = this.dateAdapter.rangeLongDate(moment().date(1), moment().date(10));
        longRange.date.notCurrentYear = this.dateAdapter.rangeLongDate(
            moment().date(1).month(1),
            moment().date(10).month(2)
        );
        longRange.date.startsNotCurrentYear = this.dateAdapter.rangeLongDate(
            moment().date(1).month(1).subtract(1, 'years'),
            moment().date(10).month(2)
        );
        longRange.date.endsNotCurrentYear = this.dateAdapter.rangeLongDate(
            moment().date(1).month(1),
            moment().date(10).month(2).add(1, 'years')
        );
        longRange.dateTime.sameDateCurrentYear = this.dateAdapter.rangeLongDateTime(
            moment().date(10).hour(10).minutes(14),
            moment().date(10).hour(11).minutes(28)
        );
        longRange.dateTime.sameDateNotCurrentYear = this.dateAdapter.rangeLongDateTime(
            moment().date(11).month(1).subtract(1, 'years').hour(10).minutes(14),
            moment().date(11).month(1).subtract(1, 'years').hour(11).minutes(28)
        );
        longRange.dateTime.notCurrentMonth = this.dateAdapter.rangeLongDateTime(
            moment().date(1).month(1).hour(10).minutes(14),
            moment().date(1).month(2).hour(11).minutes(28)
        );
        longRange.dateTime.startsNotCurrentYear = this.dateAdapter.rangeLongDateTime(
            moment().date(1).month(1).subtract(1, 'years').hour(10).minutes(14),
            moment().date(1).month(2).hour(11).minutes(28)
        );
        longRange.dateTime.endsNotCurrentYear = this.dateAdapter.rangeLongDateTime(
            moment().date(1).month(1).hour(10).minutes(14),
            moment().date(1).month(2).add(1, 'years').hour(11).minutes(28)
        );
    }
}
