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
                        beforeYesterdayCurrentYearSeconds: '',
                        beforeYesterdayCurrentYearMilliseconds: '',

                        yesterday: '',
                        yesterdaySeconds: '',
                        yesterdayMilliseconds: '',

                        today: '',
                        todaySeconds: '',
                        todayMilliseconds: '',

                        tomorrow: '',
                        tomorrowSeconds: '',
                        tomorrowMilliseconds: '',

                        afterTomorrowCurrentYear: '',
                        afterTomorrowCurrentYearSeconds: '',
                        afterTomorrowCurrentYearMilliseconds: '',

                        afterTomorrowNotCurrentYear: ''
                },
                short: {
                        beforeYesterdayNotCurrentYear: '',

                        beforeYesterdayCurrentYear: '',
                        beforeYesterdayCurrentYearSeconds: '',
                        beforeYesterdayCurrentYearMilliseconds: '',

                        yesterday: '',
                        yesterdaySeconds: '',
                        yesterdayMilliseconds: '',

                        today: '',
                        todaySeconds: '',
                        todayMilliseconds: '',

                        tomorrow: '',
                        tomorrowSeconds: '',
                        tomorrowMilliseconds: '',

                        afterTomorrowCurrentYear: '',
                        afterTomorrowCurrentYearSeconds: '',
                        afterTomorrowCurrentYearMilliseconds: '',

                        afterTomorrowNotCurrentYear: ''
                }
            }
        },
        en: {
            relative: {
                long: {
                        beforeYesterdayNotCurrentYear: '',

                        beforeYesterdayCurrentYear: '',
                        beforeYesterdayCurrentYearSeconds: '',
                        beforeYesterdayCurrentYearMilliseconds: '',

                        yesterday: '',
                        yesterdaySeconds: '',
                        yesterdayMilliseconds: '',

                        today: '',
                        todaySeconds: '',
                        todayMilliseconds: '',

                        tomorrow: '',
                        tomorrowSeconds: '',
                        tomorrowMilliseconds: '',

                        afterTomorrowCurrentYear: '',
                        afterTomorrowCurrentYearSeconds: '',
                        afterTomorrowCurrentYearMilliseconds: '',

                        afterTomorrowNotCurrentYear: ''
                },
                short: {
                        beforeYesterdayNotCurrentYear: '',

                        beforeYesterdayCurrentYear: '',
                        beforeYesterdayCurrentYearSeconds: '',
                        beforeYesterdayCurrentYearMilliseconds: '',

                        yesterday: '',
                        yesterdaySeconds: '',
                        yesterdayMilliseconds: '',

                        today: '',
                        todaySeconds: '',
                        todayMilliseconds: '',

                        tomorrow: '',
                        tomorrowSeconds: '',
                        tomorrowMilliseconds: '',

                        afterTomorrowCurrentYear: '',
                        afterTomorrowCurrentYearSeconds: '',
                        afterTomorrowCurrentYearMilliseconds: '',

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
        relativeShort.beforeYesterdayCurrentYearSeconds = this.dateFormatter.relativeShortDateTime(
            now.minus({ days: 2 }), {seconds: true}
        );
        relativeShort.beforeYesterdayCurrentYearMilliseconds = this.dateFormatter.relativeShortDateTime(
            now.minus({ days: 2 }), {milliseconds: true}
        );

        relativeShort.yesterday = this.dateFormatter.relativeShortDate(now.minus({ days: 1 }));
        relativeShort.yesterdaySeconds = this.dateFormatter.relativeShortDateTime(
            now.minus({ days: 1 }), {seconds: true}
        );
        relativeShort.yesterdayMilliseconds = this.dateFormatter.relativeShortDateTime(
            now.minus({ days: 1 }), {milliseconds: true}
        );

        relativeShort.today = this.dateFormatter.relativeShortDate(now.minus({ hours: 1 }));
        relativeShort.todaySeconds = this.dateFormatter.relativeShortDateTime(
            now.minus({ hours: 1 }), {seconds: true}
        );
        relativeShort.todayMilliseconds = this.dateFormatter.relativeShortDateTime(
            now.minus({ hours: 1 }), {milliseconds: true}
        );

        relativeShort.tomorrow = this.dateFormatter.relativeShortDate(now.plus({ days: 1, hours: 1 }));
        relativeShort.tomorrowSeconds = this.dateFormatter.relativeShortDateTime(
            now.plus({ days: 1, hours: 1 }), {seconds: true}
        );
        relativeShort.tomorrowMilliseconds = this.dateFormatter.relativeShortDateTime(
            now.plus({ days: 1, hours: 1 }), {milliseconds: true}
        );

        relativeShort.afterTomorrowCurrentYear = this.dateFormatter.relativeShortDate(now.plus({ days: 2 }));
        relativeShort.afterTomorrowCurrentYearSeconds = this.dateFormatter.relativeShortDateTime(
            now.plus({ days: 2 }), {seconds: true}
        );
        relativeShort.afterTomorrowCurrentYearMilliseconds = this.dateFormatter.relativeShortDateTime(
            now.plus({ days: 2 }), {milliseconds: true}
        );

        relativeShort.afterTomorrowNotCurrentYear = this.dateFormatter.relativeShortDate(
            now.plus({ years: 1, days: 2 })
        );
    }

    private populateRelativeLong(locale: string) {
        this.dateFormatter.setLocale(locale);
        this.adapter.setLocale(locale);

        const relativeLong = this.formats[locale].relative.long;
        const now = this.adapter.today();

        relativeLong.beforeYesterdayNotCurrentYear = this.dateFormatter.relativeLongDate(
            now.minus({ years: 1, days: 2 })
        );
        relativeLong.beforeYesterdayCurrentYear = this.dateFormatter.relativeLongDate(now.minus({ days: 2 }));
        relativeLong.beforeYesterdayCurrentYearSeconds = this.dateFormatter.relativeLongDateTime(now.minus({ days: 2 }), {seconds: true});
        relativeLong.beforeYesterdayCurrentYearMilliseconds = this.dateFormatter.relativeLongDateTime(
            now.minus({ days: 2 }), {milliseconds: true}
        );

        relativeLong.yesterday = this.dateFormatter.relativeLongDate(now.minus({ days: 1 }));
        relativeLong.yesterdaySeconds = this.dateFormatter.relativeLongDateTime(now.minus({ days: 1 }), {seconds: true});
        relativeLong.yesterdayMilliseconds = this.dateFormatter.relativeLongDateTime(now.minus({ days: 1 }), {milliseconds: true});

        relativeLong.today = this.dateFormatter.relativeLongDate(now.minus({ hours: 1 }));
        relativeLong.todaySeconds = this.dateFormatter.relativeLongDateTime(now.minus({ hours: 1 }), {seconds: true});
        relativeLong.todayMilliseconds = this.dateFormatter.relativeLongDateTime(now.minus({ hours: 1 }), {milliseconds: true});

        relativeLong.tomorrow = this.dateFormatter.relativeLongDate(now.plus({ days: 1, hours: 1 }));
        relativeLong.tomorrowSeconds = this.dateFormatter.relativeLongDateTime(now.plus({ days: 1, hours: 1 }), {seconds: true});
        relativeLong.tomorrowMilliseconds = this.dateFormatter.relativeLongDateTime(now.plus({ days: 1, hours: 1 }), {milliseconds: true});

        relativeLong.afterTomorrowCurrentYear = this.dateFormatter.relativeLongDate(now.plus({ days: 2 }));
        relativeLong.afterTomorrowCurrentYearSeconds = this.dateFormatter.relativeLongDateTime(now.plus({ days: 2 }), {seconds: true});
        relativeLong.afterTomorrowCurrentYearMilliseconds = this.dateFormatter.relativeLongDateTime(
            now.plus({ days: 2 }), {milliseconds: true}
        );

        relativeLong.afterTomorrowNotCurrentYear = this.dateFormatter.relativeLongDate(
            now.plus({ years: 1, days: 2 })
        );
    }
}
