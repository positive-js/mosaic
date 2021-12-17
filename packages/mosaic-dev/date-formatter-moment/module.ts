// tslint:disable:no-console
// tslint:disable:no-magic-numbers
// tslint:disable:deprecation
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DateAdapter, MC_DATE_LOCALE } from '@ptsecurity/cdk/datetime';
import { McMomentDateModule, MomentDateAdapter } from '@ptsecurity/mosaic-moment-adapter/adapter';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
// tslint:disable-next-line:ordered-imports
import * as _moment from 'moment';
// @ts-ignore
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';


const moment = _rollupMoment || _moment;

@Component({
    selector: 'app',
    templateUrl: 'template.html',
    styleUrls: ['../main.scss', 'styles.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [
        { provide: MC_DATE_LOCALE, useValue: 'ru' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MC_DATE_LOCALE] }
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

    constructor(private dateAdapter: DateAdapter<Moment>) {
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

        shortRange.date.currentMonth = this.dateAdapter.rangeShortDate(moment().date(1), moment().date(10));
        shortRange.date.notCurrentYear = this.dateAdapter.rangeShortDate(
            moment().date(1).month(1),
            moment().date(10).month(2)
        );
        shortRange.date.startsNotCurrentYear = this.dateAdapter.rangeShortDate(
            moment().date(1).month(1).subtract(1, 'years'),
            moment().date(10).month(2)
        );
        shortRange.date.endsNotCurrentYear = this.dateAdapter.rangeShortDate(
            moment().date(1).month(1),
            moment().date(10).month(2).add(1, 'years')
        );
        shortRange.dateTime.sameDateCurrentYear = this.dateAdapter.rangeShortDateTime(
            moment().date(10).hour(10).minutes(14),
            moment().date(10).hour(11).minutes(28)
        );
        shortRange.dateTime.sameDateNotCurrentYear = this.dateAdapter.rangeShortDateTime(
            moment().date(11).month(1).subtract(1, 'years').hour(10).minutes(14),
            moment().date(11).month(1).subtract(1, 'years').hour(11).minutes(28)
        );
        shortRange.dateTime.notCurrentMonth = this.dateAdapter.rangeShortDateTime(
            moment().date(1).month(1).hour(10).minutes(14),
            moment().date(1).month(2).hour(11).minutes(28)
        );
        shortRange.dateTime.startsNotCurrentYear = this.dateAdapter.rangeShortDateTime(
            moment().date(1).month(1).subtract(1, 'years').hour(10).minutes(14),
            moment().date(1).month(2).hour(11).minutes(28)
        );
        shortRange.dateTime.endsNotCurrentYear = this.dateAdapter.rangeShortDateTime(
            moment().date(1).month(1).hour(10).minutes(14),
            moment().date(1).month(2).add(1, 'years').hour(11).minutes(28)
        );
    }

    private populateRangeMiddle(locale: string) {
        this.dateAdapter.setLocale(locale);

        const middleRange = this[locale].range.middle;

        middleRange.dateTime.currentYear = this.dateAdapter.rangeMiddleDateTime(moment().date(1), moment().date(10));
        middleRange.dateTime.sameDateCurrentYear = this.dateAdapter.rangeMiddleDateTime(
            moment().date(10).hour(10).minutes(14),
            moment().date(10).hour(10).minutes(28)
        );
        middleRange.dateTime.sameDateNotCurrentYear = this.dateAdapter.rangeMiddleDateTime(
            moment().date(11).month(1).subtract(1, 'years').hour(10).minutes(14),
            moment().date(11).month(1).subtract(1, 'years').hour(11).minutes(28)
        );
        middleRange.dateTime.notCurrentMonth = this.dateAdapter.rangeMiddleDateTime(
            moment().date(1).month(1).hour(10).minutes(14),
            moment().date(1).month(2).hour(11).minutes(28)
        );
        middleRange.dateTime.startsNotCurrentYear = this.dateAdapter.rangeMiddleDateTime(
            moment().date(1).month(1).subtract(1, 'years').hour(10).minutes(14),
            moment().date(1).month(1).hour(11).minutes(28)
        );
        middleRange.dateTime.endsNotCurrentYear = this.dateAdapter.rangeMiddleDateTime(
            moment().date(1).month(1).hour(10).minutes(14),
            moment().date(1).month(1).add(1, 'years').hour(11).minutes(28)
        );
    }

    private populateRangeLong(locale: string) {
        this.dateAdapter.setLocale(locale);

        const longRange = this[locale].range.long;

        longRange.date.currentMonth = this.dateAdapter.rangeLongDate(moment().date(1), moment().date(10));
        longRange.date.notCurrentYear = this.dateAdapter.rangeLongDate(
            moment().date(1).month(1),
            moment().date(10).month(2)
        );
        longRange.date.startsNotCurrentYear = this.dateAdapter.rangeLongDate(
            moment().date(1).month(1).subtract(1, 'years'),
            moment().date(10).month(2)
        );
        longRange.date.endsNotCurrentYear = this.dateAdapter.rangeLongDate(
            moment().date(1).month(1),
            moment().date(10).month(2).add(1, 'years')
        );
        longRange.dateTime.sameDateCurrentYear = this.dateAdapter.rangeLongDateTime(
            moment().date(10).hour(10).minutes(14),
            moment().date(10).hour(11).minutes(28)
        );
        longRange.dateTime.sameDateNotCurrentYear = this.dateAdapter.rangeLongDateTime(
            moment().date(11).month(1).subtract(1, 'years').hour(10).minutes(14),
            moment().date(11).month(1).subtract(1, 'years').hour(11).minutes(28)
        );
        longRange.dateTime.notCurrentMonth = this.dateAdapter.rangeLongDateTime(
            moment().date(1).month(1).hour(10).minutes(14),
            moment().date(1).month(2).hour(11).minutes(28)
        );
        longRange.dateTime.startsNotCurrentYear = this.dateAdapter.rangeLongDateTime(
            moment().date(1).month(1).subtract(1, 'years').hour(10).minutes(14),
            moment().date(1).month(2).hour(11).minutes(28)
        );
        longRange.dateTime.endsNotCurrentYear = this.dateAdapter.rangeLongDateTime(
            moment().date(1).month(1).hour(10).minutes(14),
            moment().date(1).month(2).add(1, 'years').hour(11).minutes(28)
        );
    }

    private populateRelativeShort(locale: string) {
        this.dateAdapter.setLocale(locale);

        const relativeShort = this[locale].relative.short;

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

        const relativeLong = this[locale].relative.long;

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

    private populateAbsoluteShort(locale: string) {
        this.dateAdapter.setLocale(locale);

        const absoluteShort = this[locale].absolute.short;

        absoluteShort.date.currentYear = this.dateAdapter.absoluteShortDate(moment());
        absoluteShort.date.notCurrentYear = this.dateAdapter.absoluteShortDate(moment().subtract(1, 'years'));
        absoluteShort.dateTime.currentYear = this.dateAdapter.absoluteShortDateTime(moment());
        absoluteShort.dateTime.notCurrentYear = this.dateAdapter.absoluteShortDateTime(
            moment().subtract(1, 'years')
        );
        absoluteShort.dateTime.milliseconds = this.dateAdapter.absoluteShortDateTime(moment(), { milliseconds: true });
    }

    private populateAbsoluteLong(locale: string) {
        this.dateAdapter.setLocale(locale);

        const absoluteLong = this[locale].absolute.long;

        absoluteLong.date.currentYear = this.dateAdapter.absoluteLongDate(moment());
        absoluteLong.date.notCurrentYear = this.dateAdapter.absoluteLongDate(moment().subtract(1, 'years'));
        absoluteLong.dateTime.currentYear = this.dateAdapter.absoluteLongDateTime(moment());
        absoluteLong.dateTime.notCurrentYear = this.dateAdapter.absoluteLongDateTime(
            moment().subtract(1, 'years')
        );
        absoluteLong.dateTime.milliseconds = this.dateAdapter.absoluteLongDateTime(moment(), { milliseconds: true });
    }
}

@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserModule,
        McMomentDateModule
    ],
    bootstrap: [DemoComponent],
    providers: []
})
export class DemoModule {}
