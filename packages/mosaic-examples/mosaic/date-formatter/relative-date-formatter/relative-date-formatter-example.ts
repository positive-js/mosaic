/* tslint:disable:no-magic-numbers */
import { Component } from '@angular/core';
import { DateAdapter, MC_DATE_LOCALE } from '@ptsecurity/cdk/datetime';
import { LuxonDateAdapter } from '@ptsecurity/mosaic-luxon-adapter/adapter';
import { DateFormatter } from '@ptsecurity/mosaic/core';
import { DateTime } from 'luxon';


/**
 * @title Basic progress relative-date-formatter
 */
@Component({
    selector: 'relative-date-formatter-example',
    templateUrl: 'relative-date-formatter-example.html',
    styleUrls: ['relative-date-formatter-example.css'],
    providers: [
        { provide: MC_DATE_LOCALE, useValue: 'ru' },
        { provide: DateAdapter, useClass: LuxonDateAdapter, deps: [MC_DATE_LOCALE] }
    ]
})
export class RelativeDateFormatterExample {
    formats = {
        ru: {
            relative: {
                long: {
                    today: '',
                    yesterday: '',
                    beforeYesterdayCurrentYear: '',
                    beforeYesterdayNotCurrentYear: ''
                },
                short: {
                    today: '',
                    yesterday: '',
                    beforeYesterdayCurrentYear: '',
                    beforeYesterdayNotCurrentYear: ''
                }
            }
        },
        en: {
            relative: {
                long: {
                    today: '',
                    yesterday: '',
                    beforeYesterdayCurrentYear: '',
                    beforeYesterdayNotCurrentYear: ''
                },
                short: {
                    today: '',
                    yesterday: '',
                    beforeYesterdayCurrentYear: '',
                    beforeYesterdayNotCurrentYear: ''
                }
            }
        }
    };

    constructor(private adapter: DateAdapter<DateTime>, private formatter: DateFormatter<DateTime>) {
        this.populateRelativeLong('ru');
        this.populateRelativeLong('en');

        this.populateRelativeShort('ru');
        this.populateRelativeShort('en');
    }

    private populateRelativeShort(locale: string) {
        this.formatter.setLocale(locale);
        this.adapter.setLocale(locale);

        const relativeShort = this.formats[locale].relative.short;
        const now = this.adapter.today();

        relativeShort.today = this.formatter.relativeShortDate(now.minus({ hours: 1 }));
        relativeShort.yesterday = this.formatter.relativeShortDate(now.minus({ days: 1 }));
        relativeShort.beforeYesterdayCurrentYear = this.formatter.relativeShortDate(now.minus({ days: 2 }));
        relativeShort.beforeYesterdayNotCurrentYear = this.formatter.relativeShortDate(
            now.minus({ years: 1, days: 2 })
        );
    }

    private populateRelativeLong(locale: string) {
        this.formatter.setLocale(locale);
        this.adapter.setLocale(locale);

        const relativeLong = this.formats[locale].relative.long;
        const now = this.adapter.today();

        relativeLong.today = this.formatter.relativeLongDate(now.minus({ hours: 1 }));
        relativeLong.yesterday = this.formatter.relativeLongDate(now.minus({ days: 1 }));
        relativeLong.beforeYesterdayCurrentYear = this.formatter.relativeLongDate(now.minus({ days: 2 }));
        relativeLong.beforeYesterdayNotCurrentYear = this.formatter.relativeLongDate(
            now.minus({ years: 1, days: 2 })
        );
    }
}
