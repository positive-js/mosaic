/* tslint:disable:no-magic-numbers */
import { Component } from '@angular/core';
import { DateAdapter, MC_DATE_LOCALE } from '@ptsecurity/cdk/datetime';
import { LuxonDateAdapter } from '@ptsecurity/mosaic-luxon-adapter/adapter';
import { DateFormatter } from '@ptsecurity/mosaic/core';
import { DateTime } from 'luxon';


/**
 * @title Basic progress range-date-formatter
 */
@Component({
    selector: 'range-date-formatter-example',
    templateUrl: 'range-date-formatter-example.html',
    styleUrls: ['range-date-formatter-example.css'],
    providers: [
        { provide: MC_DATE_LOCALE, useValue: 'ru' },
        { provide: DateAdapter, useClass: LuxonDateAdapter, deps: [MC_DATE_LOCALE] }
    ]
})
export class RangeDateFormatterExample {
    formats = {
        ru: {
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
        },
        en: {
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
        }
    };

    constructor(private adapter: DateAdapter<DateTime>, private dateFormatter: DateFormatter<DateTime>) {
        this.populateRangeLong('ru');
        this.populateRangeLong('en');

        this.populateRangeMiddle('ru');
        this.populateRangeMiddle('en');

        this.populateRangeShort('ru');
        this.populateRangeShort('en');
    }

    private populateRangeShort(locale: string) {
        this.dateFormatter.setLocale(locale);
        this.adapter.setLocale(locale);

        const shortRange = this.formats[locale].range.short;
        const now = this.adapter.today();

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
        this.adapter.setLocale(locale);

        const middleRange = this.formats[locale].range.middle;
        const now = this.adapter.today();

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
        this.adapter.setLocale(locale);

        const longRange = this.formats[locale].range.long;
        const now = this.adapter.today();

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
}
