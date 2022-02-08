/* tslint:disable:no-magic-numbers */
import { Component } from '@angular/core';
import { DateAdapter, MC_DATE_LOCALE } from '@ptsecurity/cdk/datetime';
import { LuxonDateAdapter } from '@ptsecurity/mosaic-luxon-adapter/adapter';
import { DateFormatter } from '@ptsecurity/mosaic/core';
import { DateTime } from 'luxon';


/**
 * @title Basic progress absolute-date-formatter
 */
@Component({
    selector: 'absolute-date-formatter-example',
    templateUrl: 'absolute-date-formatter-example.html',
    styleUrls: ['absolute-date-formatter-example.css'],
    providers: [
        { provide: MC_DATE_LOCALE, useValue: 'ru' },
        { provide: DateAdapter, useClass: LuxonDateAdapter, deps: [MC_DATE_LOCALE] }
    ]
})
export class AbsoluteDateFormatterExample {
    formats = {
        ru: {
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
            }
        },
        en: {
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
            }
        }
    };

    constructor(private adapter: DateAdapter<DateTime>, private dateFormatter: DateFormatter<DateTime>) {
        this.populateAbsoluteLong('ru');
        this.populateAbsoluteLong('en');

        this.populateAbsoluteShort('ru');
        this.populateAbsoluteShort('en');
    }

    private populateAbsoluteShort(locale: string) {
        this.dateFormatter.setLocale(locale);
        this.adapter.setLocale(locale);

        const now = this.adapter.today();

        const absoluteShort = this.formats[locale].absolute.short;

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
        this.adapter.setLocale(locale);

        const now = this.adapter.today();

        const absoluteLong = this.formats[locale].absolute.long;

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
