// tslint:disable:no-console
// tslint:disable:no-magic-numbers
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DateAdapter, MC_DATE_LOCALE } from '@ptsecurity/cdk/datetime';
import { LuxonDateAdapter } from '@ptsecurity/mosaic-luxon-adapter/adapter';
import { DateFormatter } from '@ptsecurity/mosaic/core';
import { DateTime } from 'luxon';


@Component({
    selector: 'app',
    templateUrl: 'template.html',
    styleUrls: ['../main.scss', 'styles.scss'],
    providers: [
        { provide: MC_DATE_LOCALE, useValue: 'ru' },
        { provide: DateAdapter, useClass: LuxonDateAdapter },
        { provide: DateFormatter, deps: [DateAdapter, MC_DATE_LOCALE] }
    ],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    ru = {
        absolute: {
            long: {
                date: {
                    currentYear: '',
                    notCurrentYear: ''
                },
                dateTime: {
                    currentYear: '',
                    currentYearSeconds: '',
                    currentYearMilliseconds: '',

                    notCurrentYear: '',
                    notCurrentYearSeconds: '',
                    notCurrentYearMilliseconds: ''
                }
            },
            short: {
                date: {
                    currentYear: '',
                    notCurrentYear: ''
                },
                dateTime: {
                    currentYear: '',
                    currentYearSeconds: '',
                    currentYearMilliseconds: '',

                    notCurrentYear: '',
                    notCurrentYearSeconds: '',
                    notCurrentYearMilliseconds: ''
                }
            }
        },
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
        },
        range: {
            long: {
                date: {
                    currentMonth: '',
                    notCurrentYear: '',
                    startsNotCurrentYear: '',
                    endsNotCurrentYear: ''
                },
                dateTime: {
                    startsNotCurrentYear: '',
                    startsNotCurrentYearSeconds: '',
                    startsNotCurrentYearMilliseconds: '',

                    endsNotCurrentYear: '',
                    endsNotCurrentYearSeconds: '',
                    endsNotCurrentYearMilliseconds: '',

                    sameDateCurrentYear: '',
                    sameDateCurrentYearSeconds: '',
                    sameDateCurrentYearMilliseconds: '',

                    sameDateNotCurrentYear: '',
                    sameDateNotCurrentYearSeconds: '',
                    sameDateNotCurrentYearMilliseconds: '',

                    notCurrentMonth: '',
                    notCurrentMonthSeconds: '',
                    notCurrentMonthMilliseconds: ''
                }
            },
            middle: {
                dateTime: {
                    currentYear: '',
                    currentYearSeconds: '',
                    currentYearMilliseconds: '',

                    sameDateCurrentYear: '',
                    sameDateCurrentYearSeconds: '',
                    sameDateCurrentYearMilliseconds: '',

                    sameDateNotCurrentYear: '',
                    sameDateNotCurrentYearSeconds: '',
                    sameDateNotCurrentYearMilliseconds: '',

                    notCurrentMonth: '',
                    notCurrentMonthSeconds: '',
                    notCurrentMonthMilliseconds: '',

                    startsNotCurrentYear: '',
                    startsNotCurrentYearSeconds: '',
                    startsNotCurrentYearMilliseconds: '',

                    endsNotCurrentYear: '',
                    endsNotCurrentYearSeconds: '',
                    endsNotCurrentYearMilliseconds: ''
                }
            },
            short: {
                date: {
                    currentMonth: '',
                    notCurrentYear: '',
                    startsNotCurrentYear: '',
                    endsNotCurrentYear: ''
                },
                dateTime: {
                    sameDateCurrentYear: '',
                    sameDateCurrentYearSeconds: '',
                    sameDateCurrentYearMilliseconds: '',

                    sameDateNotCurrentYear: '',
                    sameDateNotCurrentYearSeconds: '',
                    sameDateNotCurrentYearMilliseconds: '',

                    notCurrentMonth: '',
                    notCurrentMonthSeconds: '',
                    notCurrentMonthMilliseconds: '',

                    startsNotCurrentYear: '',
                    startsNotCurrentYearSeconds: '',
                    startsNotCurrentYearMilliseconds: '',

                    endsNotCurrentYear: '',
                    endsNotCurrentYearSeconds: '',
                    endsNotCurrentYearMilliseconds: ''
                }
            }
        }
    };

    en = JSON.parse(JSON.stringify(this.ru));

    constructor(
        private dateFormatter: DateFormatter<DateTime>,
        private dateAdapter: DateAdapter<DateTime>
    ) {
        ['ru', 'en'].forEach((language) => {
            this.populateAbsoluteLong(language);
            this.populateAbsoluteShort(language);
            this.populateRelativeLong(language);
            this.populateRelativeShort(language);
            this.populateRangeLong(language);
            this.populateRangeMiddle(language);
            this.populateRangeShort(language);
        });
    }

    private populateRangeShort(locale: string) {
        this.dateFormatter.setLocale(locale);

        const shortRange = this[locale].range.short;
        const now = this.dateAdapter.today();

        shortRange.date.currentMonth = this.dateFormatter.rangeShortDate(now.set({ day: 1 }), now.set({ day: 10 }));
        shortRange.date.notCurrentYear = this.dateFormatter.rangeShortDate(
            now.set({ day: 1, month: 1 }),
            now.set({ day: 10, month: 2 })
        );
        shortRange.date.startsNotCurrentYear = this.dateFormatter.rangeShortDate(
            now.set({ day: 1, month: 1 }).minus({ years: 1 }),
            now.set({ day: 10, month: 2 })
        );
        shortRange.date.endsNotCurrentYear = this.dateFormatter.rangeShortDate(
            now.set({ day: 1, month: 1 }),
            now.set({ day: 10, month: 2 }).plus({ years: 1 })
        );

        shortRange.dateTime.sameDateCurrentYear = this.dateFormatter.rangeShortDateTime(
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 11, minute: 28 })
        );
        shortRange.dateTime.sameDateCurrentYearSeconds = this.dateFormatter.rangeShortDateTime(
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 11, minute: 28 }),
            {seconds: true}
        );
        shortRange.dateTime.sameDateCurrentYearMilliseconds = this.dateFormatter.rangeShortDateTime(
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 11, minute: 28 }),
            {milliseconds: true}
        );

        shortRange.dateTime.sameDateNotCurrentYear = this.dateFormatter.rangeShortDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 })
        );
        shortRange.dateTime.sameDateNotCurrentYearSeconds = this.dateFormatter.rangeShortDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }),
            {seconds: true}
        );
        shortRange.dateTime.sameDateNotCurrentYearMilliseconds = this.dateFormatter.rangeShortDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }),
            {milliseconds: true}
        );

        shortRange.dateTime.notCurrentMonth = this.dateFormatter.rangeShortDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 })
        );
        shortRange.dateTime.notCurrentMonthSeconds = this.dateFormatter.rangeShortDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
            {seconds: true}
        );
        shortRange.dateTime.notCurrentMonthMilliseconds = this.dateFormatter.rangeShortDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
            {milliseconds: true}
        );

        shortRange.dateTime.startsNotCurrentYear = this.dateFormatter.rangeShortDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 })
        );
        shortRange.dateTime.startsNotCurrentYearSeconds = this.dateFormatter.rangeShortDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
            {seconds: true}
        );
        shortRange.dateTime.startsNotCurrentYearMilliseconds = this.dateFormatter.rangeShortDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
            {milliseconds: true}
        );

        shortRange.dateTime.endsNotCurrentYear = this.dateFormatter.rangeShortDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ day: 1, month: 2 }).plus({ years: 1 }).set({ hour: 11, minute: 28 })
        );
        shortRange.dateTime.endsNotCurrentYearSeconds = this.dateFormatter.rangeShortDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ day: 1, month: 2 }).plus({ years: 1 }).set({ hour: 11, minute: 28 }),
            {seconds: true}
        );
        shortRange.dateTime.endsNotCurrentYearMilliseconds = this.dateFormatter.rangeShortDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ day: 1, month: 2 }).plus({ years: 1 }).set({ hour: 11, minute: 28 }),
            {milliseconds: true}
        );
    }

    private populateRangeMiddle(locale: string) {
        this.dateFormatter.setLocale(locale);

        const middleRange = this[locale].range.middle;
        const now = this.dateAdapter.today();

        middleRange.dateTime.currentYear = this.dateFormatter.rangeMiddleDateTime(
            now.set({ day: 1 }),
            now.set({ day: 10 })
        );

        middleRange.dateTime.currentYearSeconds = this.dateFormatter.rangeMiddleDateTime(
            now.set({ day: 1 }),
            now.set({ day: 10 }),
            {seconds: true}
        );

        middleRange.dateTime.currentYearMilliseconds = this.dateFormatter.rangeMiddleDateTime(
            now.set({ day: 1 }),
            now.set({ day: 10 }),
            {milliseconds: true}
        );

        middleRange.dateTime.sameDateCurrentYear = this.dateFormatter.rangeMiddleDateTime(
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 10, minute: 28 })
        );
        middleRange.dateTime.sameDateCurrentYearSeconds = this.dateFormatter.rangeMiddleDateTime(
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 10, minute: 28 }),
            {seconds: true}
        );
        middleRange.dateTime.sameDateCurrentYearMilliseconds = this.dateFormatter.rangeMiddleDateTime(
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 10, minute: 28 }),
            {milliseconds: true}
        );

        middleRange.dateTime.sameDateNotCurrentYear = this.dateFormatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 })
        );
        middleRange.dateTime.sameDateNotCurrentYearSeconds = this.dateFormatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }),
            {seconds: true}
        );
        middleRange.dateTime.sameDateNotCurrentYearMilliseconds = this.dateFormatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }),
            {milliseconds: true}
        );

        middleRange.dateTime.notCurrentMonth = this.dateFormatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 })
        );
        middleRange.dateTime.notCurrentMonthSeconds = this.dateFormatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
            {seconds: true}
        );
        middleRange.dateTime.notCurrentMonthMilliseconds = this.dateFormatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
            {milliseconds: true}
        );

        middleRange.dateTime.startsNotCurrentYear = this.dateFormatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 1, hour: 11, minute: 28 })
        );
        middleRange.dateTime.startsNotCurrentYearSeconds = this.dateFormatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 1, hour: 11, minute: 28 }),
            {seconds: true}
        );
        middleRange.dateTime.startsNotCurrentYearMilliseconds = this.dateFormatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 1, hour: 11, minute: 28 }),
            {milliseconds: true}
        );

        middleRange.dateTime.endsNotCurrentYear = this.dateFormatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 1, day: 1 }).plus({ years: 1 }).set({ hour: 11, minute: 28 })
        );
        middleRange.dateTime.endsNotCurrentYearSeconds = this.dateFormatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 1, day: 1 }).plus({ years: 1 }).set({ hour: 11, minute: 28 }),
            {seconds: true}
        );
        middleRange.dateTime.endsNotCurrentYearMilliseconds = this.dateFormatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 1, day: 1 }).plus({ years: 1 }).set({ hour: 11, minute: 28 }),
            {milliseconds: true}
        );
    }

    private populateRangeLong(locale: string) {
        this.dateFormatter.setLocale(locale);

        const longRange = this[locale].range.long;
        const now = this.dateAdapter.today();

        longRange.date.currentMonth = this.dateFormatter.rangeLongDate(now.set({ day: 1 }), now.set({ day: 10 }));
        longRange.date.notCurrentYear = this.dateFormatter.rangeLongDate(
            now.set({ month: 1, day: 1 }),
            now.set({ month: 2, day: 10 })
        );
        longRange.date.startsNotCurrentYear = this.dateFormatter.rangeLongDate(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }),
            now.set({ month: 2, day: 10 })
        );
        longRange.date.endsNotCurrentYear = this.dateFormatter.rangeLongDate(
            now.set({ month: 1, day: 1 }),
            now.set({ month: 2, day: 10 }).plus({ years: 1 })
        );
        longRange.dateTime.sameDateCurrentYear = this.dateFormatter.rangeLongDateTime(
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 11, minute: 28 })
        );
        longRange.dateTime.sameDateCurrentYearSeconds = this.dateFormatter.rangeLongDateTime(
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 11, minute: 28 }),
            {seconds: true}
        );
        longRange.dateTime.sameDateCurrentYearMilliseconds = this.dateFormatter.rangeLongDateTime(
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 11, minute: 28 }),
            {milliseconds: true}
        );

        longRange.dateTime.sameDateNotCurrentYear = this.dateFormatter.rangeLongDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 })
        );
        longRange.dateTime.sameDateNotCurrentYearSeconds = this.dateFormatter.rangeLongDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }),
            {seconds: true}
        );
        longRange.dateTime.sameDateNotCurrentYearMilliseconds = this.dateFormatter.rangeLongDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }),
            {milliseconds: true}
        );

        longRange.dateTime.notCurrentMonth = this.dateFormatter.rangeLongDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 })
        );
        longRange.dateTime.notCurrentMonthSeconds = this.dateFormatter.rangeLongDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
            {seconds: true}
        );
        longRange.dateTime.notCurrentMonthMilliseconds = this.dateFormatter.rangeLongDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
            {milliseconds: true}
        );

        longRange.dateTime.startsNotCurrentYear = this.dateFormatter.rangeLongDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 })
        );
        longRange.dateTime.startsNotCurrentYearSeconds = this.dateFormatter.rangeLongDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
            {seconds: true}
        );
        longRange.dateTime.startsNotCurrentYearMilliseconds = this.dateFormatter.rangeLongDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
            {milliseconds: true}
        );

        longRange.dateTime.endsNotCurrentYear = this.dateFormatter.rangeLongDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1 }).minus({ years: 1 }).set({ hour: 11, minute: 28 })
        );
        longRange.dateTime.endsNotCurrentYearSeconds = this.dateFormatter.rangeLongDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }),
            {seconds: true}
        );
        longRange.dateTime.endsNotCurrentYearMilliseconds = this.dateFormatter.rangeLongDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }),
            {milliseconds: true}
        );
    }

    private populateRelativeShort(locale: string) {
        this.dateFormatter.setLocale(locale);

        const relativeShort = this[locale].relative.short;
        const now = this.dateAdapter.today();

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

        const relativeLong = this[locale].relative.long;
        const now = this.dateAdapter.today();

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

    private populateAbsoluteShort(locale: string) {
        this.dateFormatter.setLocale(locale);

        const absoluteShort = this[locale].absolute.short;
        const now = this.dateAdapter.today();

        absoluteShort.date.currentYear = this.dateFormatter.absoluteShortDate(now);
        absoluteShort.date.notCurrentYear = this.dateFormatter.absoluteShortDate(now.minus({ years: 1 }));

        absoluteShort.dateTime.currentYear = this.dateFormatter.absoluteShortDateTime(now);
        absoluteShort.dateTime.currentYearSeconds = this.dateFormatter.absoluteShortDateTime(now, {seconds: true});
        absoluteShort.dateTime.currentYearMilliseconds = this.dateFormatter.absoluteShortDateTime(now, {milliseconds: true});

        absoluteShort.dateTime.notCurrentYear = this.dateFormatter.absoluteShortDateTime(now.minus({ years: 1 }));
        absoluteShort.dateTime.notCurrentYearSeconds = this.dateFormatter.absoluteShortDateTime(now.minus({ years: 1 }), {seconds: true});
        absoluteShort.dateTime.notCurrentYearMilliseconds = this.dateFormatter.absoluteShortDateTime(
            now.minus({ years: 1 }), {milliseconds: true}
        );
    }

    private populateAbsoluteLong(locale: string) {
        this.dateFormatter.setLocale(locale);

        const absoluteLong = this[locale].absolute.long;
        const now = this.dateAdapter.today();

        absoluteLong.date.currentYear = this.dateFormatter.absoluteLongDate(now);
        absoluteLong.date.notCurrentYear = this.dateFormatter.absoluteLongDate(now.minus({ years: 1 }));

        absoluteLong.dateTime.currentYear = this.dateFormatter.absoluteLongDateTime(now);
        absoluteLong.dateTime.currentYearSeconds = this.dateFormatter.absoluteLongDateTime(now, {seconds: true});
        absoluteLong.dateTime.currentYearMilliseconds = this.dateFormatter.absoluteLongDateTime(now, {milliseconds: true});

        absoluteLong.dateTime.notCurrentYear = this.dateFormatter.absoluteLongDateTime(now.minus({ years: 1 }));
        absoluteLong.dateTime.notCurrentYearSeconds = this.dateFormatter.absoluteLongDateTime(now.minus({ years: 1 }), {seconds: true});
        absoluteLong.dateTime.notCurrentYearMilliseconds = this.dateFormatter.absoluteLongDateTime(
            now.minus({ years: 1 }), {milliseconds: true}
        );
    }
}

@NgModule({
    declarations: [DemoComponent],
    imports: [BrowserModule],
    bootstrap: [DemoComponent],
    providers: []
})
export class DemoModule {}
