// tslint:disable:no-console
// tslint:disable:no-magic-numbers
// tslint:disable:deprecation
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DateAdapter, MC_DATE_LOCALE } from '@ptsecurity/cdk/datetime';
import { LuxonDateAdapter, McLuxonDateModule } from '@ptsecurity/mosaic-luxon-adapter/adapter';
import { DateTime } from 'luxon';


@Component({
    selector: 'app',
    templateUrl: 'template.html',
    styleUrls: ['../main.scss', 'styles.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [
        { provide: MC_DATE_LOCALE, useValue: 'ru' },
        { provide: DateAdapter, useClass: LuxonDateAdapter, deps: [MC_DATE_LOCALE] }
    ]
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
                secondsAgo: '',
                minutesAgo: '',
                today: '',
                yesterday: '',
                beforeYesterdayCurrentYear: '',
                beforeYesterdayNotCurrentYear: ''
            },
            short: {
                secondsAgo: '',
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
                secondsAgo: '',
                minutesAgo: '',
                today: '',
                yesterday: '',
                beforeYesterdayCurrentYear: '',
                beforeYesterdayNotCurrentYear: ''
            },
            short: {
                secondsAgo: '',
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

    constructor(private dateAdapter: DateAdapter<DateTime>) {
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
        this.dateAdapter.setLocale(locale);

        const shortRange = this[locale].range.short;
        const now = this.dateAdapter.today();

        shortRange.date.currentMonth = this.dateAdapter.rangeShortDate(now.set({ day: 1 }), now.set({ day: 10 }));
        shortRange.date.notCurrentYear = this.dateAdapter.rangeShortDate(
            now.set({ day: 1, month: 1 }),
            now.set({ day: 10, month: 2 })
        );
        shortRange.date.startsNotCurrentYear = this.dateAdapter.rangeShortDate(
            now.set({ day: 1, month: 1 }).minus({ years: 1 }),
            now.set({ day: 10, month: 2 })
        );
        shortRange.date.endsNotCurrentYear = this.dateAdapter.rangeShortDate(
            now.set({ day: 1, month: 1 }),
            now.set({ day: 10, month: 2 }).plus({ years: 1 })
        );
        shortRange.dateTime.sameDateCurrentYear = this.dateAdapter.rangeShortDateTime(
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 11, minute: 28 })
        );
        shortRange.dateTime.sameDateNotCurrentYear = this.dateAdapter.rangeShortDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 })
        );
        shortRange.dateTime.notCurrentMonth = this.dateAdapter.rangeShortDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 })
        );
        shortRange.dateTime.startsNotCurrentYear = this.dateAdapter.rangeShortDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 })
        );
        shortRange.dateTime.endsNotCurrentYear = this.dateAdapter.rangeShortDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ day: 1, month: 2 }).plus({ years: 1 }).set({ hour: 11, minute: 28 })
        );
    }

    private populateRangeMiddle(locale: string) {
        this.dateAdapter.setLocale(locale);

        const middleRange = this[locale].range.middle;
        const now = this.dateAdapter.today();

        middleRange.dateTime.currentYear = this.dateAdapter.rangeMiddleDateTime(
            now.set({ day: 1 }),
            now.set({ day: 10 })
        );
        middleRange.dateTime.sameDateCurrentYear = this.dateAdapter.rangeMiddleDateTime(
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 10, minute: 28 })
        );
        middleRange.dateTime.sameDateNotCurrentYear = this.dateAdapter.rangeMiddleDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 })
        );
        middleRange.dateTime.notCurrentMonth = this.dateAdapter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 })
        );
        middleRange.dateTime.startsNotCurrentYear = this.dateAdapter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 1, hour: 11, minute: 28 })
        );
        middleRange.dateTime.endsNotCurrentYear = this.dateAdapter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 1, day: 1 }).plus({ years: 1 }).set({ hour: 11, minute: 28 })
        );
    }

    private populateRangeLong(locale: string) {
        this.dateAdapter.setLocale(locale);

        const longRange = this[locale].range.long;
        const now = this.dateAdapter.today();

        longRange.date.currentMonth = this.dateAdapter.rangeLongDate(now.set({ day: 1 }), now.set({ day: 10 }));
        longRange.date.notCurrentYear = this.dateAdapter.rangeLongDate(
            now.set({ month: 1, day: 1 }),
            now.set({ month: 2, day: 10 })
        );
        longRange.date.startsNotCurrentYear = this.dateAdapter.rangeLongDate(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }),
            now.set({ month: 2, day: 10 })
        );
        longRange.date.endsNotCurrentYear = this.dateAdapter.rangeLongDate(
            now.set({ month: 1, day: 1 }),
            now.set({ month: 2, day: 10 }).plus({ years: 1 })
        );
        longRange.dateTime.sameDateCurrentYear = this.dateAdapter.rangeLongDateTime(
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 11, minute: 28 })
        );
        longRange.dateTime.sameDateNotCurrentYear = this.dateAdapter.rangeLongDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 })
        );
        longRange.dateTime.notCurrentMonth = this.dateAdapter.rangeLongDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 })
        );
        longRange.dateTime.startsNotCurrentYear = this.dateAdapter.rangeLongDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 })
        );
        longRange.dateTime.endsNotCurrentYear = this.dateAdapter.rangeLongDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1 }).minus({ years: 1 }).set({ hour: 11, minute: 28 })
        );
    }

    private populateRelativeShort(locale: string) {
        this.dateAdapter.setLocale(locale);

        const relativeShort = this[locale].relative.short;
        const now = this.dateAdapter.today();

        relativeShort.secondsAgo = this.dateAdapter.relativeShortDate(now.minus({ seconds: 1 }));
        relativeShort.minutesAgo = this.dateAdapter.relativeShortDate(now.minus({ minute: 1 }));
        relativeShort.today = this.dateAdapter.relativeShortDate(now.minus({ hours: 1 }));
        relativeShort.yesterday = this.dateAdapter.relativeShortDate(now.minus({ days: 1 }));
        relativeShort.beforeYesterdayCurrentYear = this.dateAdapter.relativeShortDate(now.minus({ days: 2 }));
        relativeShort.beforeYesterdayNotCurrentYear = this.dateAdapter.relativeShortDate(
            now.minus({ years: 1, days: 2 })
        );
    }

    private populateRelativeLong(locale: string) {
        this.dateAdapter.setLocale(locale);

        const relativeLong = this[locale].relative.long;
        const now = this.dateAdapter.today();

        relativeLong.secondsAgo = this.dateAdapter.relativeLongDate(now.minus({ seconds: 1 }));
        relativeLong.minutesAgo = this.dateAdapter.relativeLongDate(now.minus({ minute: 1 }));
        relativeLong.today = this.dateAdapter.relativeLongDate(now.minus({ hours: 1 }));
        relativeLong.yesterday = this.dateAdapter.relativeLongDate(now.minus({ days: 1 }));
        relativeLong.beforeYesterdayCurrentYear = this.dateAdapter.relativeLongDate(now.minus({ days: 2 }));
        relativeLong.beforeYesterdayNotCurrentYear = this.dateAdapter.relativeLongDate(
            now.minus({ years: 1, days: 2 })
        );
    }

    private populateAbsoluteShort(locale: string) {
        this.dateAdapter.setLocale(locale);

        const absoluteShort = this[locale].absolute.short;
        const now = this.dateAdapter.today();

        absoluteShort.date.currentYear = this.dateAdapter.absoluteShortDate(now);
        absoluteShort.date.notCurrentYear = this.dateAdapter.absoluteShortDate(now.minus({ years: 1 }));
        absoluteShort.dateTime.currentYear = this.dateAdapter.absoluteShortDateTime(now);
        absoluteShort.dateTime.notCurrentYear = this.dateAdapter.absoluteShortDateTime(now.minus({ years: 1 }));
        absoluteShort.dateTime.milliseconds = this.dateAdapter.absoluteShortDateTime(now, { milliseconds: true });
    }

    private populateAbsoluteLong(locale: string) {
        this.dateAdapter.setLocale(locale);

        const absoluteLong = this[locale].absolute.long;
        const now = this.dateAdapter.today();

        absoluteLong.date.currentYear = this.dateAdapter.absoluteLongDate(now);
        absoluteLong.date.notCurrentYear = this.dateAdapter.absoluteLongDate(now.minus({ years: 1 }));
        absoluteLong.dateTime.currentYear = this.dateAdapter.absoluteLongDateTime(now);
        absoluteLong.dateTime.notCurrentYear = this.dateAdapter.absoluteLongDateTime(now.minus({ years: 1 }));
        absoluteLong.dateTime.milliseconds = this.dateAdapter.absoluteLongDateTime(now, { milliseconds: true });
    }
}

@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserModule,
        McLuxonDateModule
    ],
    bootstrap: [DemoComponent],
    providers: []
})
export class DemoModule {}
