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
 * @title Basic progress absolute-date-formatter
 */
@Component({
    selector: 'absolute-date-formatter-example',
    templateUrl: 'absolute-date-formatter-example.html',
    styleUrls: ['absolute-date-formatter-example.css'],
    providers: [
        { provide: MC_DATE_LOCALE, useValue: 'ru' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MC_DATE_LOCALE] }
    ]
})
export class AbsoluteDateFormatterExample {
    formats: any = {
        ru: {
            absolute: {
                long: {
                    date: {},
                    dateTime: {}
                },
                short: {
                    date: {},
                    dateTime: {}
                }
            }
        },
        en: {
            absolute: {
                long: {
                    date: {},
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
        this.populateAbsoluteLong('ru');
        this.populateAbsoluteLong('en');

        this.populateAbsoluteShort('ru');
        this.populateAbsoluteShort('en');
    }

    private populateAbsoluteShort(locale: string) {
        this.dateAdapter.setLocale(locale);

        const absoluteShort = this.formats[locale].absolute.short;

        absoluteShort.date.currentYear = this.dateAdapter.absoluteShortDate(moment());
        absoluteShort.date.notCurrentYear = this.dateAdapter.absoluteShortDate(moment().subtract(1, 'years'));
        absoluteShort.dateTime.currentYear = this.dateAdapter.absoluteShortDateTime(moment());
        absoluteShort.dateTime.notCurrentYear = this.dateAdapter.absoluteShortDateTime(
            moment().subtract(1, 'years')
        );
    }

    private populateAbsoluteLong(locale: string) {
        this.dateAdapter.setLocale(locale);

        const absoluteLong = this.formats[locale].absolute.long;

        absoluteLong.date.currentYear = this.dateAdapter.absoluteLongDate(moment());
        absoluteLong.date.notCurrentYear = this.dateAdapter.absoluteLongDate(moment().subtract(1, 'years'));
        absoluteLong.dateTime.currentYear = this.dateAdapter.absoluteLongDateTime(moment());
        absoluteLong.dateTime.notCurrentYear = this.dateAdapter.absoluteLongDateTime(
            moment().subtract(1, 'years')
        );
    }
}
