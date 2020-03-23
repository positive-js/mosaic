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
 * @title Basic progress relative-date-formatter
 */
@Component({
    selector: 'relative-date-formatter-example',
    templateUrl: 'relative-date-formatter-example.html',
    styleUrls: ['relative-date-formatter-example.css'],
    providers: [
        { provide: MC_DATE_LOCALE, useValue: 'ru' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MC_DATE_LOCALE] }
    ]
})
export class RelativeDateFormatterExample {
    formats: any = {
        ru: {
            relative: {
                long: {},
                short: {}
            }
        },
        en: {
            relative: {
                long: {},
                short: {}
            }
        }
    };

    constructor(private dateAdapter: DateAdapter<Moment>) {
        this.populateRelativeLong('ru');
        this.populateRelativeLong('en');

        this.populateRelativeShort('ru');
        this.populateRelativeShort('en');
    }

    private populateRelativeShort(locale: string) {
        this.dateAdapter.setLocale(locale);

        const relativeShort = this.formats[locale].relative.short;

        relativeShort.secondsAgo = this.dateAdapter.relativeShortDate(moment().subtract(1, 'seconds'));
        relativeShort.minutesAgo = this.dateAdapter.relativeShortDate(moment().subtract(1, 'minutes'));
        relativeShort.today = this.dateAdapter.relativeShortDate(moment().subtract(1, 'hours'));
        relativeShort.yesterday = this.dateAdapter.relativeShortDate(moment().subtract(1, 'days'));
        relativeShort.beforeYesterdayCurrentYear = this.dateAdapter.relativeShortDate(
            moment().subtract(2, 'days')
        );
        relativeShort.beforeYesterdayNotCurrentYear = this.dateAdapter.relativeShortDate(
            moment().subtract(1, 'years').subtract(2, 'days')
        );
    }

    private populateRelativeLong(locale: string) {
        this.dateAdapter.setLocale(locale);

        const relativeLong = this.formats[locale].relative.long;

        relativeLong.secondsAgo = this.dateAdapter.relativeLongDate(moment().subtract(1, 'seconds'));
        relativeLong.minutesAgo = this.dateAdapter.relativeLongDate(moment().subtract(1, 'minutes'));
        relativeLong.today = this.dateAdapter.relativeLongDate(moment().subtract(1, 'hours'));
        relativeLong.yesterday = this.dateAdapter.relativeLongDate(moment().subtract(1, 'days'));
        relativeLong.beforeYesterdayCurrentYear = this.dateAdapter.relativeLongDate(
            moment().subtract(2, 'days')
        );
        relativeLong.beforeYesterdayNotCurrentYear = this.dateAdapter.relativeLongDate(
            moment().subtract(1, 'years').subtract(2, 'days')
        );
    }
}
