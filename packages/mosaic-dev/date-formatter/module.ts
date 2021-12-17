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
                    notCurrentYear: '',
                    milliseconds: ''
                }
            },
            short: {
                date: {
                    currentYear: '',
                    notCurrentYear: ''
                },
                dateTime: {
                    currentYear: '',
                    notCurrentYear: '',
                    milliseconds: ''
                }
            }
        },
        relative: {
            long: {
                minutesAgo: '',
                today: '',
                yesterday: '',
                beforeYesterdayCurrentYear: '',
                beforeYesterdayNotCurrentYear: ''
            },
            short: {
                minutesAgo: '',
                today: '',
                yesterday: '',
                beforeYesterdayCurrentYear: '',
                beforeYesterdayNotCurrentYear: ''
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
                    endsNotCurrentYear: '',
                    sameDateCurrentYear: '',
                    sameDateNotCurrentYear: '',
                    notCurrentMonth: ''
                }
            },
            middle: {
                dateTime: {
                    currentYear: '',
                    sameDateCurrentYear: '',
                    sameDateNotCurrentYear: '',
                    notCurrentMonth: '',
                    startsNotCurrentYear: '',
                    endsNotCurrentYear: ''
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
                    sameDateNotCurrentYear: '',
                    notCurrentMonth: '',
                    startsNotCurrentYear: '',
                    endsNotCurrentYear: ''
                }
            }
        }
    };

    en = {
        absolute: {
            long: {
                date: {
                    currentYear: '',
                    notCurrentYear: ''
                },
                dateTime: {
                    currentYear: '',
                    notCurrentYear: '',
                    milliseconds: ''
                }
            },
            short: {
                date: {
                    currentYear: '',
                    notCurrentYear: ''
                },
                dateTime: {
                    currentYear: '',
                    notCurrentYear: '',
                    milliseconds: ''
                }
            }
        },
        relative: {
            long: {
                minutesAgo: '',
                today: '',
                yesterday: '',
                beforeYesterdayCurrentYear: '',
                beforeYesterdayNotCurrentYear: ''
            },
            short: {
                minutesAgo: '',
                today: '',
                yesterday: '',
                beforeYesterdayCurrentYear: '',
                beforeYesterdayNotCurrentYear: ''
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
                    endsNotCurrentYear: '',
                    sameDateCurrentYear: '',
                    sameDateNotCurrentYear: '',
                    notCurrentMonth: ''
                }
            },
            middle: {
                dateTime: {
                    currentYear: '',
                    sameDateCurrentYear: '',
                    sameDateNotCurrentYear: '',
                    notCurrentMonth: '',
                    startsNotCurrentYear: '',
                    endsNotCurrentYear: ''
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
                    sameDateNotCurrentYear: '',
                    notCurrentMonth: '',
                    startsNotCurrentYear: '',
                    endsNotCurrentYear: ''
                }
            }
        }
    };

    constructor(
        private dateFormatter: DateFormatter<DateTime>,
        private dateAdapter: DateAdapter<DateTime>
    ) {
        this.populateAbsoluteLong('ru');
        this.populateAbsoluteLong('en');

        this.populateAbsoluteShort('ru');
        this.populateAbsoluteShort('en');

        this.populateRelativeLong('ru');
        this.populateRelativeLong('en');

        this.populateRelativeShort('ru');
        this.populateRelativeShort('en');

        this.populateRangeLong('ru');
        this.populateRangeLong('en');

        this.populateRangeMiddle('ru');
        this.populateRangeMiddle('en');

        this.populateRangeShort('ru');
        this.populateRangeShort('en');
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
        shortRange.dateTime.sameDateNotCurrentYear = this.dateFormatter.rangeShortDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 })
        );
        shortRange.dateTime.notCurrentMonth = this.dateFormatter.rangeShortDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 })
        );
        shortRange.dateTime.startsNotCurrentYear = this.dateFormatter.rangeShortDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 })
        );
        shortRange.dateTime.endsNotCurrentYear = this.dateFormatter.rangeShortDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ day: 1, month: 2 }).plus({ years: 1 }).set({ hour: 11, minute: 28 })
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
        middleRange.dateTime.sameDateCurrentYear = this.dateFormatter.rangeMiddleDateTime(
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 10, minute: 28 })
        );
        middleRange.dateTime.sameDateNotCurrentYear = this.dateFormatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 })
        );
        middleRange.dateTime.notCurrentMonth = this.dateFormatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 })
        );
        middleRange.dateTime.startsNotCurrentYear = this.dateFormatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 1, hour: 11, minute: 28 })
        );
        middleRange.dateTime.endsNotCurrentYear = this.dateFormatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 1, day: 1 }).plus({ years: 1 }).set({ hour: 11, minute: 28 })
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
        longRange.dateTime.sameDateNotCurrentYear = this.dateFormatter.rangeLongDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 })
        );
        longRange.dateTime.notCurrentMonth = this.dateFormatter.rangeLongDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 })
        );
        longRange.dateTime.startsNotCurrentYear = this.dateFormatter.rangeLongDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 })
        );
        longRange.dateTime.endsNotCurrentYear = this.dateFormatter.rangeLongDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1 }).minus({ years: 1 }).set({ hour: 11, minute: 28 })
        );
    }

    private populateRelativeShort(locale: string) {
        this.dateFormatter.setLocale(locale);

        const relativeShort = this[locale].relative.short;
        const now = this.dateAdapter.today();

        relativeShort.minutesAgo = this.dateFormatter.relativeShortDate(now.minus({ minute: 1 }));
        relativeShort.today = this.dateFormatter.relativeShortDate(now.minus({ hours: 1 }));
        relativeShort.yesterday = this.dateFormatter.relativeShortDate(now.minus({ days: 1 }));
        relativeShort.beforeYesterdayCurrentYear = this.dateFormatter.relativeShortDate(now.minus({ days: 2 }));
        relativeShort.beforeYesterdayNotCurrentYear = this.dateFormatter.relativeShortDate(
            now.minus({ years: 1, days: 2 })
        );
    }

    private populateRelativeLong(locale: string) {
        this.dateFormatter.setLocale(locale);

        const relativeLong = this[locale].relative.long;
        const now = this.dateAdapter.today();

        relativeLong.minutesAgo = this.dateFormatter.relativeLongDate(now.minus({ minute: 1 }));
        relativeLong.today = this.dateFormatter.relativeLongDate(now.minus({ hours: 1 }));
        relativeLong.yesterday = this.dateFormatter.relativeLongDate(now.minus({ days: 1 }));
        relativeLong.beforeYesterdayCurrentYear = this.dateFormatter.relativeLongDate(now.minus({ days: 2 }));
        relativeLong.beforeYesterdayNotCurrentYear = this.dateFormatter.relativeLongDate(
            now.minus({ years: 1, days: 2 })
        );
    }

    private populateAbsoluteShort(locale: string) {
        this.dateFormatter.setLocale(locale);

        const absoluteShort = this[locale].absolute.short;
        const now = this.dateAdapter.today();

        absoluteShort.date.currentYear = this.dateFormatter.absoluteShortDate(now);
        absoluteShort.date.notCurrentYear = this.dateFormatter.absoluteShortDate(now.minus({ years: 1 }));
        absoluteShort.dateTime.currentYear = this.dateFormatter.absoluteShortDateTime(now);
        absoluteShort.dateTime.notCurrentYear = this.dateFormatter.absoluteShortDateTime(now.minus({ years: 1 }));
        absoluteShort.dateTime.milliseconds = this.dateFormatter.absoluteShortDateTime(now, { milliseconds: true });
    }

    private populateAbsoluteLong(locale: string) {
        this.dateFormatter.setLocale(locale);

        const absoluteLong = this[locale].absolute.long;
        const now = this.dateAdapter.today();

        absoluteLong.date.currentYear = this.dateFormatter.absoluteLongDate(now);
        absoluteLong.date.notCurrentYear = this.dateFormatter.absoluteLongDate(now.minus({ years: 1 }));
        absoluteLong.dateTime.currentYear = this.dateFormatter.absoluteLongDateTime(now);
        absoluteLong.dateTime.notCurrentYear = this.dateFormatter.absoluteLongDateTime(now.minus({ years: 1 }));
        absoluteLong.dateTime.milliseconds = this.dateFormatter.absoluteLongDateTime(now, { milliseconds: true });
    }
}

@NgModule({
    declarations: [DemoComponent],
    imports: [BrowserModule],
    bootstrap: [DemoComponent],
    providers: []
})
export class DemoModule {}
