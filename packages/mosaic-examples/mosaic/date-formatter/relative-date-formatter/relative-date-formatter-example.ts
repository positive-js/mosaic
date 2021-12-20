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
                    beforeYesterdayNotCurrentYear: '',
                    beforeYesterdayCurrentYear: '',
                    yesterday: '',
                    today: '',
                    tomorrow: '',
                    afterTomorrowCurrentYear: '',
                    afterTomorrowNotCurrentYear: ''
                },
                short: {
                    beforeYesterdayNotCurrentYear: '',
                    beforeYesterdayCurrentYear: '',
                    yesterday: '',
                    today: '',
                    tomorrow: '',
                    afterTomorrowCurrentYear: '',
                    afterTomorrowNotCurrentYear: ''
                }
            }
        },
        en: {
            relative: {
                long: {
                    beforeYesterdayNotCurrentYear: '',
                    beforeYesterdayCurrentYear: '',
                    yesterday: '',
                    today: '',
                    tomorrow: '',
                    afterTomorrowCurrentYear: '',
                    afterTomorrowNotCurrentYear: ''
                },
                short: {
                    beforeYesterdayNotCurrentYear: '',
                    beforeYesterdayCurrentYear: '',
                    yesterday: '',
                    today: '',
                    tomorrow: '',
                    afterTomorrowCurrentYear: '',
                    afterTomorrowNotCurrentYear: ''
                }
            }
        }
    };

    constructor(private adapter: DateAdapter<DateTime>, private dateFormatter: DateFormatter<DateTime>) {
        this.populateRelativeLong('ru');
        this.populateRelativeLong('en');

        this.populateRelativeShort('ru');
        this.populateRelativeShort('en');
    }

    private populateRelativeShort(locale: string) {
        this.dateFormatter.setLocale(locale);
        this.adapter.setLocale(locale);

        const relativeShort = this.formats[locale].relative.short;
        const now = this.adapter.today();

        relativeShort.beforeYesterdayNotCurrentYear = this.dateFormatter.relativeShortDate(
            now.minus({ years: 1, days: 2 })
        );
        relativeShort.beforeYesterdayCurrentYear = this.dateFormatter.relativeShortDate(now.minus({ days: 2 }));
        relativeShort.yesterday = this.dateFormatter.relativeShortDate(now.minus({ days: 1 }));

        relativeShort.today = this.dateFormatter.relativeShortDate(now.minus({ hours: 1 }));

        relativeShort.tomorrow = this.dateFormatter.relativeShortDate(now.plus({ days: 1 }));
        relativeShort.afterTomorrowCurrentYear = this.dateFormatter.relativeShortDate(now.plus({ days: 2 }));
        relativeShort.afterTomorrowNotCurrentYear = this.dateFormatter.relativeShortDate(
            now.plus({ years: 1, days: 2 })
        );
    }

    private populateRelativeLong(locale: string) {
        this.dateFormatter.setLocale(locale);
        this.adapter.setLocale(locale);

        const relativeLong = this.formats[locale].relative.long;
        const now = this.adapter.today();

        relativeShort.beforeYesterdayNotCurrentYear = this.dateFormatter.relativeShortDate(
            now.minus({ years: 1, days: 2 })
        );
        relativeLong.beforeYesterdayCurrentYear = this.dateFormatter.relativeLongDate(now.minus({ days: 2 }));
        relativeLong.yesterday = this.dateFormatter.relativeLongDate(now.minus({ days: 1 }));

        relativeLong.today = this.dateFormatter.relativeLongDate(now.minus({ hours: 1 }));

        relativeLong.tomorrow = this.dateFormatter.relativeLongDate(now.plus({ days: 1 }));
        relativeLong.afterTomorrowCurrentYear = this.dateFormatter.relativeLongDate(now.plus({ days: 2 }));
        relativeLong.afterTomorrowNotCurrentYear = this.dateFormatter.relativeLongDate(
            now.plus({ years: 1, days: 2 })
        );
    }
}
