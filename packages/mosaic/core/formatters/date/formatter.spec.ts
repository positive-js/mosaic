// tslint:disable:no-magic-numbers
// tslint:disable:max-func-body-length
// tslint:disable:mocha-no-side-effect-code
/* tslint:disable:match-default-export-name */
import { LOCALE_ID } from '@angular/core';
import { inject, TestBed, waitForAsync } from '@angular/core/testing';
import { DateAdapter, MC_DATE_LOCALE } from '@ptsecurity/cdk/datetime';
import { LuxonDateAdapter, LuxonDateModule } from '@ptsecurity/mosaic-luxon-adapter/adapter';
import { DateFormatter, McFormattersModule } from '@ptsecurity/mosaic/core';
import { DateTime, DateTimeUnit } from 'luxon';


describe('Date formatter', () => {
    let adapter: LuxonDateAdapter;
    let formatter: DateFormatter<DateTime>;
    let currentDate: DateTime;

    const mockAdapterAndFormatterForRelativeTests = () => {
        // @ts-ignore
        adapter.today = (): DateTime => currentDate;

        // @ts-ignore
        formatter.hasSame = (startDate: DateTime, endDate: DateTime, unit: DateTimeUnit): string => {
            return adapter.hasSame(startDate, currentDate, unit) ? 'yes' : 'no';
        };
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [LuxonDateModule, McFormattersModule],
            providers: [
                { provide: DateAdapter, useClass: LuxonDateAdapter },
                { provide: LOCALE_ID, useValue: 'ru' },
                { provide: DateFormatter, deps: [DateAdapter, MC_DATE_LOCALE] }
            ]
        }).compileComponents();
    }));

    beforeEach(inject([DateAdapter, DateFormatter], (d: LuxonDateAdapter, f: DateFormatter<DateTime>) => {
        adapter = d;
        formatter = f;


        currentDate = adapter.createDateTime(adapter.today().year, 5, 15, 0, 0, 0, 0);
    }));

    const YEAR = 'yyyy';
    const MONTH = 'MMMM';
    const SHORT_MONTH = 'MMM';
    const DAY = 'd';
    const TIME = 'HH:mm';
    const SECONDS = 'ss';

    const DASH = '\u2013';
    const NBSP = '\u00A0';

    // todo tests repeated twice for ru and then for en
    describe('ru (default)', () => {
        beforeEach(() => {
            formatter.setLocale('ru');
        });

        const MILLISECONDS = ',SSS';

        const LONG_DASH = '\u202F\u2014\u2009';

        const FROM = 'С';
        const UNTIL = 'По';

        const DAY_MONTH = `${DAY}${NBSP}${MONTH}`;
        const DAY_SHORT_MONTH = `${DAY}${NBSP}${SHORT_MONTH}`;

        describe('relative formats', () => {
            describe('Relative short (relativeShortDate method)', () => {
                it('before yesterday (other year)', () => {
                    const date = adapter.createDate(2015).minus({ days: 3 });
                    expect(formatter.relativeShortDate(date))
                        .toBe(adapter.format(date, `${DAY}${NBSP}${SHORT_MONTH} ${YEAR}`));
                });

                it('before yesterday, more than 2 days ago', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    let date = currentDate.minus({ days: 3 });

                    expect(formatter.relativeShortDate(date))
                        .toBe(adapter.format(date, `${DAY}${NBSP}${SHORT_MONTH}, ${TIME}`));

                    date = currentDate.minus({ days: 5 });

                    expect(formatter.relativeShortDate(date))
                        .toBe(adapter.format(date, `${DAY}${NBSP}${SHORT_MONTH}, ${TIME}`));
                });

                it('yesterday', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    const date = currentDate.minus({ days: 1 });

                    expect(formatter.relativeShortDate(date))
                        .toBe(`Вчера, ${date.toFormat(TIME)}`);
                });

                it('today', () => {
                    const date = adapter.today();

                    expect(formatter.relativeShortDate(date))
                        .toBe(`Сегодня, ${date.toFormat(TIME)}`);
                });

                it('tomorrow', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    const date = currentDate.plus({ days: 1 });

                    expect(formatter.relativeShortDate(date))
                        .toBe(`Завтра, ${date.toFormat(TIME)}`);
                });

                it('after tomorrow (current year)', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    let date = currentDate.plus({ days: 3 });

                    expect(formatter.relativeShortDate(date))
                        .toBe(adapter.format(date, `${DAY}${NBSP}${SHORT_MONTH}, ${TIME}`));

                    date = currentDate.plus({ days: 5 });

                    expect(formatter.relativeShortDate(date))
                        .toBe(adapter.format(date, `${DAY}${NBSP}${SHORT_MONTH}, ${TIME}`));
                });

                it('after tomorrow (other year)', () => {
                    const date = currentDate.plus({ years: 1 });
                    expect(formatter.relativeShortDate(date))
                        .toBe(adapter.format(date, `${DAY}${NBSP}${SHORT_MONTH} ${YEAR}`));
                });

                it('with milliseconds', () => {
                    const date = adapter.today();

                    expect(formatter.relativeShortDateTime(date, { milliseconds: true }))
                        .toBe(date.toFormat(`Сегодня, ${TIME}:${SECONDS}${MILLISECONDS}`));
                });

                it('with seconds', () => {
                    const date = adapter.today();

                    expect(formatter.relativeShortDateTime(date, { seconds: true }))
                        .toBe(adapter.format(date, `Сегодня, ${TIME}:${SECONDS}`));
                });
            });

            describe('Relative long (relativeLongDate method)', () => {
                it('before yesterday (other year)', () => {
                    const date = currentDate.minus({ years: 1 });
                    expect(formatter.relativeLongDate(date))
                        .toBe(adapter.format(date, `${DAY_MONTH} ${YEAR}`));
                });

                it('before yesterday, more than 2 days ago', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    let date = currentDate.minus({ days: 3 });

                    expect(formatter.relativeLongDate(date))
                        .toBe(adapter.format(date, `${DAY_MONTH}, ${TIME}`));

                    date = currentDate.minus({ days: 5 });

                    expect(formatter.relativeLongDate(date))
                        .toBe(adapter.format(date, `${DAY_MONTH}, ${TIME}`));
                });

                it('yesterday', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    const date = currentDate.minus({ days: 1 });

                    expect(formatter.relativeLongDate(date))
                        .toBe(`Вчера, ${date.toFormat(TIME)}`);
                });

                it('today', () => {
                    const date = adapter.today();

                    expect(formatter.relativeLongDate(date))
                        .toBe(`Сегодня, ${date.toFormat(TIME)}`);
                });

                it('tomorrow', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    const date = currentDate.plus({ days: 1 });

                    expect(formatter.relativeLongDate(date))
                        .toBe(`Завтра, ${date.toFormat(TIME)}`);
                });

                it('after tomorrow (current year)', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    let date = currentDate.plus({ days: 3 });

                    expect(formatter.relativeLongDate(date))
                        .toBe(adapter.format(date, `${DAY_MONTH}, ${TIME}`));

                    date = currentDate.plus({ days: 5 });

                    expect(formatter.relativeLongDate(date))
                        .toBe(adapter.format(date, `${DAY_MONTH}, ${TIME}`));
                });

                it('after tomorrow (other year)', () => {
                    const date = currentDate.plus({ years: 1 });
                    expect(formatter.relativeLongDate(date))
                        .toBe(adapter.format(date, `${DAY_MONTH} ${YEAR}`));
                });

                it('with milliseconds', () => {
                    const date = adapter.today();

                    expect(formatter.relativeShortDateTime(date, { milliseconds: true }))
                        .toBe(date.toFormat(`Сегодня, ${TIME}:${SECONDS}${MILLISECONDS}`));
                });

                it('with seconds', () => {
                    const date = adapter.today();

                    expect(formatter.relativeShortDateTime(date, { seconds: true }))
                        .toBe(adapter.format(date, `Сегодня, ${TIME}:${SECONDS}`));
                });
            });
        });

        describe('absolute formats', () => {
            describe('Absolute short (absoluteShortDate/Time method)', () => {
                it('absoluteShortDate', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteShortDate(date))
                        .toBe(adapter.format(date, DAY_SHORT_MONTH));
                });

                it('absoluteShortDate (other year)', () => {
                    const date = adapter.createDate(2015);

                    expect(formatter.absoluteShortDate(date))
                        .toBe(adapter.format(date, `${DAY_SHORT_MONTH} ${YEAR}`));
                });

                it('absoluteShortDateTime', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteShortDateTime(date))
                        .toBe(adapter.format(date, `${DAY_SHORT_MONTH}, ${TIME}`));
                });

                it('absoluteShortDateTime (other year)', () => {
                    const date = adapter.createDate(2015);

                    expect(formatter.absoluteShortDateTime(date))
                        .toBe(adapter.format(date, `${DAY_SHORT_MONTH} ${YEAR}, ${TIME}`));
                });

                it('absoluteShortDateTime with milliseconds', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteShortDateTime(date, { milliseconds: true }))
                        .toBe(adapter.format(date, `${DAY_SHORT_MONTH}, ${TIME}:${SECONDS}${MILLISECONDS}`));
                });

                it('absoluteShortDateTime with seconds', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteShortDateTime(date, { seconds: true }))
                        .toBe(adapter.format(date, `${DAY_SHORT_MONTH}, ${TIME}:${SECONDS}`));
                });
            });

            describe('Absolute long (absoluteLongDate/Time method)', () => {
                it('absoluteLongDate', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteLongDate(date))
                        .toBe(date.toFormat(`${DAY_MONTH}`));
                });

                it('absoluteLongDate (other year)', () => {
                    const date = adapter.createDate(2015);

                    expect(formatter.absoluteLongDate(date))
                        .toBe(date.toFormat(`${DAY_MONTH} ${YEAR}`));
                });

                it('absoluteLongDateTime', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteLongDateTime(date))
                        .toBe(date.toFormat(`${DAY_MONTH}, ${TIME}`));
                });

                it('absoluteLongDateTime (other year)', () => {
                    const date = adapter.createDate(2015);

                    expect(formatter.absoluteLongDateTime(date))
                        .toBe(date.toFormat(`${DAY_MONTH} ${YEAR}, ${TIME}`));
                });

                it('absoluteLongDateTime with milliseconds', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteLongDateTime(date, { milliseconds: true }))
                        .toBe(date.toFormat(`${DAY_MONTH}, ${TIME}:${SECONDS}${MILLISECONDS}`));
                });

                it('absoluteLongDateTime with seconds', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteLongDateTime(date, { seconds: true }))
                        .toBe(adapter.format(date, `${DAY_MONTH}, ${TIME}:${SECONDS}`));
                });
            });
        });

        describe('range formats', () => {
            let startDateFormat: any;
            let endDateFormat: any;

            describe('closed range', () => {
                describe('Range short (rangeShortDate method)', () => {
                    beforeEach(() => {
                        startDateFormat = DAY_SHORT_MONTH;
                        endDateFormat = startDateFormat;
                    });

                    it('rangeShortDate', () => {
                        const startDate = adapter.today().set({ day: 1 });
                        const endDate = startDate.plus({ days: 10 });

                        const startString = adapter.format(startDate, `${DAY}`);
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeShortDate(startDate, endDate))
                            .toBe(`${startString}${DASH}${endString}`);
                    });

                    it('rangeShortDate (other month)', () => {
                        const startDate = adapter.today().set({ month: 1 });
                        const endDate = startDate.plus({ months: 1 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeShortDate(startDate, endDate))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });

                    it('rangeShortDate (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = adapter.today();

                        const startString = adapter.format(startDate, `${startDateFormat} ${YEAR}`);
                        const endString = adapter.format(endDate, `${endDateFormat} ${YEAR}`);

                        expect(formatter.rangeShortDate(startDate, endDate))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });

                    it('rangeShortDate (endDate is other year)', () => {
                        const startDate = adapter.today();
                        const endDate = startDate.plus({ years: 1 });

                        const startString = adapter.format(startDate, `${startDateFormat} ${YEAR}`);
                        const endString = adapter.format(endDate, `${endDateFormat} ${YEAR}`);

                        expect(formatter.rangeShortDate(startDate, endDate))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });
                });

                describe('Range short (rangeShortDateTime method)', () => {
                    beforeEach(() => {
                        startDateFormat = `${DAY_SHORT_MONTH}, ${TIME}`;
                        endDateFormat = startDateFormat;
                    });

                    it('rangeShortDateTime', () => {
                        const startDate = adapter.today().set({ day: 1 });
                        const endDate = startDate.plus({ days: 10 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeShortDateTime(startDate, endDate))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });

                    it('rangeShortDateTime (same day)', () => {
                        const startDate = adapter.today();
                        const endDate = startDate.plus({ minutes: 1 });

                        const startString = adapter.format(startDate, `${TIME}`);
                        const endString = adapter.format(endDate, `${TIME}, ${DAY_SHORT_MONTH}`);

                        expect(formatter.rangeShortDateTime(startDate, endDate))
                            .toBe(`${startString}${DASH}${endString}`);
                    });

                    it('rangeShortDateTime (same day, other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = startDate.plus({ minutes: 1 });

                        const startString = adapter.format(startDate, `${TIME}`);
                        const endString = adapter.format(endDate, `${TIME}, ${DAY_SHORT_MONTH} ${YEAR}`);

                        expect(formatter.rangeShortDateTime(startDate, endDate))
                            .toBe(`${startString}${DASH}${endString}`);
                    });

                    it('rangeShortDateTime (other month)', () => {
                        const startDate = adapter.today().set({ month: 1 });
                        const endDate = startDate.plus({ months: 1 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeShortDateTime(startDate, endDate))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });

                    it('rangeShortDateTime (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = adapter.today();

                        const startString = adapter.format(startDate, `${DAY_SHORT_MONTH} ${YEAR}, ${TIME}`);
                        const endString = adapter.format(endDate, `${DAY_SHORT_MONTH} ${YEAR}, ${TIME}`);

                        expect(formatter.rangeShortDateTime(startDate, endDate))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });

                    it('rangeShortDateTime (endDate is other year)', () => {
                        const startDate = adapter.today();
                        const endDate = startDate.plus({ years: 1 });

                        const startString = adapter.format(startDate, `${DAY_SHORT_MONTH} ${YEAR}, ${TIME}`);
                        const endString = adapter.format(endDate, `${DAY_SHORT_MONTH} ${YEAR}, ${TIME}`);

                        expect(formatter.rangeShortDateTime(startDate, endDate))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });

                    it('rangeShortDateTime (with seconds)', () => {
                        const startDate = adapter.today().set({ day: 1 });
                        const endDate = startDate.plus({ days: 10 });

                        const startString = adapter.format(startDate, `${DAY_SHORT_MONTH}, ${TIME}:${SECONDS}`);
                        const endString = adapter.format(endDate, `${DAY_SHORT_MONTH}, ${TIME}:${SECONDS}`);

                        expect(formatter.rangeShortDateTime(startDate, endDate, {seconds: true}))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });

                    it('rangeShortDateTime (with milliseconds)', () => {
                        const startDate = adapter.today().set({ day: 1 });
                        const endDate = startDate.plus({ days: 10 });

                        const startString = adapter.format(startDate, `${DAY_SHORT_MONTH}, ${TIME}:${SECONDS}${MILLISECONDS}`);
                        const endString = adapter.format(endDate, `${DAY_SHORT_MONTH}, ${TIME}:${SECONDS}${MILLISECONDS}`);

                        expect(formatter.rangeShortDateTime(startDate, endDate, {milliseconds: true}))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });
                });

                describe('Range long (rangeLongDate method)', () => {
                    beforeEach(() => {
                        startDateFormat = `${DAY_MONTH}`;
                        endDateFormat = startDateFormat;
                    });

                    it('rangeLongDate', () => {
                        const startDate = adapter.today().set({ day: 1 });
                        const endDate = startDate.plus({ days: 10 });

                        const startString = adapter.format(startDate, `${DAY}`);
                        const endString = adapter.format(endDate, `${endDateFormat}`);

                        expect(formatter.rangeLongDate(startDate, endDate))
                            .toBe(`${startString}${DASH}${endString}`);
                    });

                    it('rangeLongDate (other month)', () => {
                        const startDate = adapter.today().set({ month: 1 });
                        const endDate = startDate.plus({ months: 1 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, `${endDateFormat}`);

                        expect(formatter.rangeLongDate(startDate, endDate))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });

                    it('rangeLongDate (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = adapter.today();

                        const startString = adapter.format(startDate, `${startDateFormat} ${YEAR}`);
                        const endString = adapter.format(endDate, `${endDateFormat} ${YEAR}`);

                        expect(formatter.rangeLongDate(startDate, endDate))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });

                    it('rangeLongDate (endDate is other year)', () => {
                        const startDate = adapter.createDate(2015);
                        const endDate = startDate.plus({ years: 1 });

                        const startString = adapter.format(startDate, `${startDateFormat} ${YEAR}`);
                        const endString = adapter.format(endDate, `${endDateFormat} ${YEAR}`);

                        expect(formatter.rangeLongDate(startDate, endDate))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });
                });

                describe('Range long (rangeLongDateTime method)', () => {
                    beforeEach(() => {
                        startDateFormat = `${DAY_MONTH}, ${TIME}`;
                        endDateFormat = startDateFormat;
                    });

                    it('rangeLongDateTime', () => {
                        const startDate = adapter.today().set({ day: 1 });
                        const endDate = startDate.plus({ days: 10 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeLongDateTime(startDate, endDate))
                            .toBe(`${FROM}${NBSP}${startString} ${UNTIL.toLocaleLowerCase()}${NBSP}${endString}`);
                    });

                    it('rangeLongDateTime (same day)', () => {
                        const startDate = adapter.today();
                        const endDate = startDate.plus({ minutes: 1 });

                        const startString = adapter.format(
                            startDate, `${DAY_MONTH}, ${FROM.toLocaleLowerCase()}${NBSP}${TIME}`
                        );
                        const endString = adapter.format(endDate, `${UNTIL.toLocaleLowerCase()}${NBSP}${TIME}`);

                        expect(formatter.rangeLongDateTime(startDate, endDate))
                            .toBe(`${startString} ${endString}`);
                    });

                    it('rangeLongDateTime (same day, other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = startDate.plus({ minutes: 1 });

                        const startString = adapter.format(
                            startDate, `${DAY_MONTH} ${YEAR}, ${FROM.toLocaleLowerCase()}${NBSP}${TIME}`
                        );
                        const endString = adapter.format(endDate, `${UNTIL.toLocaleLowerCase()}${NBSP}${TIME}`);

                        expect(formatter.rangeLongDateTime(startDate, endDate))
                            .toBe(`${startString} ${endString}`);
                    });

                    it('rangeLongDateTime (other month)', () => {
                        const startDate = adapter.today().set({ month: 1 });
                        const endDate = startDate.plus({ months: 1 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeLongDateTime(startDate, endDate))
                            .toBe(`${FROM}${NBSP}${startString} ${UNTIL.toLocaleLowerCase()}${NBSP}${endString}`);
                    });

                    it('rangeLongDateTime (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = adapter.today();

                        const startString = adapter.format(startDate, `${DAY_MONTH} ${YEAR}, ${TIME}`);
                        const endString = adapter.format(endDate, `${DAY_MONTH} ${YEAR}, ${TIME}`);

                        expect(formatter.rangeLongDateTime(startDate, endDate))
                            .toBe(`${FROM}${NBSP}${startString} ${UNTIL.toLocaleLowerCase()}${NBSP}${endString}`);
                    });

                    it('rangeLongDateTime (endDate is other year)', () => {
                        const startDate = adapter.createDate(2015);
                        const endDate = startDate.plus({ years: 1 });

                        const startString = adapter.format(startDate, `${DAY_MONTH} ${YEAR}, ${TIME}`);
                        const endString = adapter.format(endDate, `${DAY_MONTH} ${YEAR}, ${TIME}`);

                        expect(formatter.rangeLongDateTime(startDate, endDate))
                            .toBe(`${FROM}${NBSP}${startString} ${UNTIL.toLocaleLowerCase()}${NBSP}${endString}`);
                    });
                });

                describe('Range middle (rangeMiddleDateTime method)', () => {
                    beforeEach(() => {
                        startDateFormat = `${DAY_MONTH}, ${TIME}`;
                        endDateFormat = startDateFormat;
                    });

                    it('rangeMiddleDateTime', () => {
                        const startDate = adapter.today().set({ day: 1 });
                        const endDate = startDate.plus({ days: 10 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeMiddleDateTime(startDate, endDate))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });

                    it('rangeMiddleDateTime (same day)', () => {
                        const startDate = adapter.today();
                        const endDate = startDate.plus({ minutes: 1 });

                        const startString = adapter.format(startDate, `${TIME}`);
                        const endString = adapter.format(endDate, `${TIME}, ${DAY_MONTH}`);

                        expect(formatter.rangeMiddleDateTime(startDate, endDate))
                            .toBe(`${startString}${DASH}${endString}`);
                    });

                    it('rangeMiddleDateTime (same day, other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = startDate.plus({ minutes: 1 });

                        const startString = adapter.format(startDate, `${TIME}`);
                        const endString = adapter.format(endDate, `${TIME}, ${DAY_MONTH} ${YEAR}`);

                        expect(formatter.rangeMiddleDateTime(startDate, endDate))
                            .toBe(`${startString}${DASH}${endString}`);
                    });

                    it('rangeMiddleDateTime (other month)', () => {
                        const startDate = adapter.today().set({ month: 1 });
                        const endDate = startDate.plus({ months: 1 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeMiddleDateTime(startDate, endDate))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });

                    it('rangeMiddleDateTime (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = adapter.today();

                        const startString = adapter.format(startDate, `${DAY_MONTH} ${YEAR}, ${TIME}`);
                        const endString = adapter.format(endDate, `${DAY_MONTH} ${YEAR}, ${TIME}`);

                        expect(formatter.rangeMiddleDateTime(startDate, endDate))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });

                    it('rangeMiddleDateTime (endDate is other year)', () => {
                        const startDate = adapter.createDate(2015);
                        const endDate = startDate.plus({ years: 1 });

                        const startString = adapter.format(startDate, `${DAY_MONTH} ${YEAR}, ${TIME}`);
                        const endString = adapter.format(endDate, `${DAY_MONTH} ${YEAR}, ${TIME}`);

                        expect(formatter.rangeMiddleDateTime(startDate, endDate))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });
                });
            });

            describe('opened range', () => {
                describe('Range short (rangeShortDate method)', () => {
                    beforeEach(() => {
                        startDateFormat = DAY_SHORT_MONTH;
                        endDateFormat = DAY_SHORT_MONTH;
                    });

                    it('throw Error', () => {
                        const wrapper = () => formatter.rangeShortDate(null);
                        expect(wrapper).toThrowError('Invalid date');
                    });

                    it('rangeShortDate (only startDate)', () => {
                        const startDate = adapter.today();
                        const startString = adapter.format(startDate, startDateFormat);

                        expect(formatter.rangeShortDate(startDate))
                            .toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeShortDate (only endDate)', () => {
                        const endDate = adapter.today();
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeShortDate(null, endDate))
                            .toBe(`${UNTIL}${NBSP}${endString}`);
                    });

                    it('rangeShortDate (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const startString = adapter.format(startDate, `${startDateFormat} ${YEAR}`);

                        expect(formatter.rangeShortDate(startDate))
                            .toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeShortDate (endDate is other year)', () => {
                        const endDate = adapter.today().plus({ years: 1 });
                        const endString = adapter.format(endDate, `${endDateFormat} ${YEAR}`);

                        expect(formatter.rangeShortDate(null, endDate))
                            .toBe(`${UNTIL}${NBSP}${endString}`);
                    });
                });

                describe('Range short (rangeShortDateTime method)', () => {
                    beforeEach(() => {
                        startDateFormat = `${DAY_SHORT_MONTH}, ${TIME}`;
                        endDateFormat = `${DAY_SHORT_MONTH}, ${TIME}`;
                    });

                    it('throw Error', () => {
                        const wrapper = () => formatter.rangeShortDateTime(null);
                        expect(wrapper).toThrowError('Invalid date');
                    });

                    it('rangeShortDateTime (only startDate)', () => {
                        const startDate = adapter.today();
                        const startString = adapter.format(startDate, startDateFormat);

                        expect(formatter.rangeShortDateTime(startDate))
                            .toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeShortDateTime (only endDate)', () => {
                        const endDate = adapter.today();
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeShortDateTime(null, endDate))
                            .toBe(`${UNTIL}${NBSP}${endString}`);
                    });

                    it('rangeShortDateTime (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const startString = adapter.format(startDate, `${DAY_SHORT_MONTH} ${YEAR}, ${TIME}`);

                        expect(formatter.rangeShortDateTime(startDate))
                            .toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeShortDateTime (endDate is other year)', () => {
                        const endDate = adapter.today().plus({ years: 1 });
                        const endString = adapter.format(endDate, `${DAY_SHORT_MONTH} ${YEAR}, ${TIME}`);

                        expect(formatter.rangeShortDateTime(null, endDate))
                            .toBe(`${UNTIL}${NBSP}${endString}`);
                    });

                    it('rangeShortDateTime (with seconds)', () => {

                        const startDate = adapter.today();
                        const startString = adapter.format(startDate, `${startDateFormat}:${SECONDS}`);

                        expect(formatter.rangeShortDateTime(startDate, null, {seconds: true}))
                            .toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeShortDateTime (with milliseconds)', () => {

                        const startDate = adapter.today();
                        const startString = adapter.format(startDate, `${startDateFormat}:${SECONDS}${MILLISECONDS}`);

                        expect(formatter.rangeShortDateTime(startDate, null, {milliseconds: true}))
                            .toBe(`${FROM}${NBSP}${startString}`);
                    });
                });

                describe('Range long (rangeLongDate method)', () => {
                    beforeEach(() => {
                        startDateFormat = `${DAY_MONTH}`;
                        endDateFormat = `${DAY_MONTH}`;
                    });

                    it('throw Error', () => {
                        const wrapper = () => formatter.rangeLongDate(null);
                        expect(wrapper).toThrowError('Invalid date');
                    });

                    it('rangeLongDate (only startDate)', () => {
                        const startDate = adapter.today();
                        const startString = adapter.format(startDate, startDateFormat);

                        expect(formatter.rangeLongDate(startDate))
                            .toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeLongDate (only endDate)', () => {
                        const endDate = adapter.today();
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeLongDate(null, endDate))
                            .toBe(`${UNTIL}${NBSP}${endString}`);
                    });

                    it('rangeLongDate (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const startString = adapter.format(startDate, `${startDateFormat} ${YEAR}`);

                        expect(formatter.rangeLongDate(startDate))
                            .toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeLongDate (endDate is other year)', () => {
                        const endDate = adapter.today().plus({ years: 1 });
                        const endString = adapter.format(endDate, `${endDateFormat} ${YEAR}`);

                        expect(formatter.rangeLongDate(null, endDate))
                            .toBe(`${UNTIL}${NBSP}${endString}`);
                    });
                });

                describe('Range long (rangeLongDateTime method)', () => {
                    beforeEach(() => {
                        startDateFormat = `${DAY_MONTH}, ${TIME}`;
                        endDateFormat = `${DAY_MONTH}, ${TIME}`;
                    });

                    it('throw Error', () => {
                        const wrapper = () => formatter.rangeLongDateTime(null);
                        expect(wrapper).toThrowError('Invalid date');
                    });

                    it('rangeLongDateTime (only startDate)', () => {
                        const startDate = adapter.today();
                        const startString = adapter.format(startDate, startDateFormat);

                        expect(formatter.rangeLongDateTime(startDate))
                            .toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeLongDateTime (only endDate)', () => {
                        const endDate = adapter.today();
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeLongDateTime(null, endDate))
                            .toBe(`${UNTIL}${NBSP}${endString}`);
                    });

                    it('rangeLongDateTime (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const startString = adapter.format(startDate, `${DAY_MONTH} ${YEAR}, ${TIME}`);

                        expect(formatter.rangeLongDateTime(startDate))
                            .toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeLongDateTime (endDate is other year)', () => {
                        const endDate = adapter.today().plus({ years: 1 });
                        const endString = adapter.format(endDate, `${DAY_MONTH} ${YEAR}, ${TIME}`);

                        expect(formatter.rangeLongDateTime(null, endDate))
                            .toBe(`${UNTIL}${NBSP}${endString}`);
                    });
                });
            });
        });
    });

    describe('en', () => {
        beforeEach(() => {
            formatter.setLocale('en');
        });

        const MILLISECONDS = '.SSS';

        const LONG_DASH = '\u202F\u2013\u2009';

        const FROM = 'From';
        const UNTIL = 'Until';

        const DAY_MONTH = `${MONTH}${NBSP}${DAY}`;
        const DAY_SHORT_MONTH = `${SHORT_MONTH}${NBSP}${DAY}`;

        describe('relative formats', () => {
            describe('Relative short (relativeShortDate method)', () => {
                it('before yesterday (other year)', () => {
                    const date = adapter.createDate(2015).minus({ days: 3 });
                    expect(formatter.relativeShortDate(date))
                        .toBe(adapter.format(date, `${SHORT_MONTH}${NBSP}${DAY}, ${YEAR}`));
                });

                it('before yesterday, more than 2 days ago', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    let date = currentDate.minus({ days: 3 });

                    expect(formatter.relativeShortDate(date))
                        .toBe(adapter.format(date, `${SHORT_MONTH}${NBSP}${DAY}, ${TIME}`));

                    date = currentDate.minus({ days: 5 });

                    expect(formatter.relativeShortDate(date))
                        .toBe(adapter.format(date, `${SHORT_MONTH}${NBSP}${DAY}, ${TIME}`));
                });

                it('yesterday', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    const date = currentDate
                        .minus({ days: 1 });

                    expect(formatter.relativeShortDate(date))
                        .toBe(`Yesterday, ${date.toFormat(TIME)}`);
                });

                it('today', () => {
                    const date = adapter.today();

                    expect(formatter.relativeShortDate(date))
                        .toBe(`Today, ${date.toFormat(TIME)}`);
                });

                it('tomorrow', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    const date = currentDate.plus({ days: 1 });

                    expect(formatter.relativeShortDate(date))
                        .toBe(`Tomorrow, ${date.toFormat(TIME)}`);
                });

                it('after tomorrow (current year)', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    let date = currentDate.plus({ days: 3 });

                    expect(formatter.relativeShortDate(date))
                        .toBe(adapter.format(date, `${SHORT_MONTH}${NBSP}${DAY}, ${TIME}`));

                    date = currentDate.plus({ days: 5 });

                    expect(formatter.relativeShortDate(date))
                        .toBe(adapter.format(date, `${SHORT_MONTH}${NBSP}${DAY}, ${TIME}`));
                });

                it('after tomorrow (other year)', () => {
                    const date = adapter.createDate(2015).plus({ days: 3 });
                    expect(formatter.relativeShortDate(date))
                        .toBe(adapter.format(date, `${SHORT_MONTH}${NBSP}${DAY}, ${YEAR}`));
                });

                it('with milliseconds', () => {
                    const date = adapter.today();

                    expect(formatter.relativeShortDateTime(date, { milliseconds: true }))
                        .toBe(`Today, ${date.toFormat(`${TIME}:${SECONDS}${MILLISECONDS}`)}`);
                });

                it('with seconds', () => {
                    const date = adapter.today();

                    expect(formatter.relativeShortDateTime(date, { seconds: true }))
                        .toBe(`Today, ${date.toFormat(`${TIME}:${SECONDS}`)}`);
                });
            });

            describe('Relative long (relativeLongDate method)', () => {
                it('before yesterday (other year)', () => {
                    const date = adapter.createDate(2015).minus({ days: 3 });
                    expect(formatter.relativeLongDate(date))
                        .toBe(adapter.format(date, `${DAY_MONTH}, ${YEAR}`));
                });

                it('before yesterday, more than 2 days ago', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    let date = currentDate.minus({ days: 3 });

                    expect(formatter.relativeLongDate(date))
                        .toBe(adapter.format(date, `${DAY_MONTH}, ${TIME}`));

                    date = currentDate.minus({ days: 5 });

                    expect(formatter.relativeLongDate(date))
                        .toBe(adapter.format(date, `${DAY_MONTH}, ${TIME}`));
                });

                it('yesterday', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    const date = currentDate.minus({ days: 1 });

                    expect(formatter.relativeLongDate(date))
                        .toBe(`Yesterday, ${date.toFormat(TIME)}`);
                });

                it('today', () => {
                    const date = adapter.today();

                    expect(formatter.relativeLongDate(date))
                        .toBe(`Today, ${date.toFormat(TIME)}`);
                });

                it('tomorrow', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    const date = currentDate.plus({ days: 1 });

                    expect(formatter.relativeLongDate(date))
                        .toBe(`Tomorrow, ${date.toFormat(TIME)}`);
                });

                it('after tomorrow (current year)', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    let date = currentDate.plus({ days: 3 });

                    expect(formatter.relativeLongDate(date))
                        .toBe(adapter.format(date, `${DAY_MONTH}, ${TIME}`));

                    date = currentDate.plus({ days: 5 });

                    expect(formatter.relativeLongDate(date))
                        .toBe(adapter.format(date, `${DAY_MONTH}, ${TIME}`));
                });

                it('after tomorrow (other year)', () => {
                    const date = adapter.createDate(2015).plus({ days: 3 });
                    expect(formatter.relativeLongDate(date))
                        .toBe(adapter.format(date, `${DAY_MONTH}, ${YEAR}`));
                });

                it('with milliseconds', () => {
                    const date = adapter.today();

                    expect(formatter.relativeLongDateTime(date, { milliseconds: true }))
                        .toBe(`Today, ${date.toFormat(`${TIME}:${SECONDS}${MILLISECONDS}`)}`);
                });

                it('with seconds', () => {
                    const date = adapter.today();

                    expect(formatter.relativeLongDateTime(date, { seconds: true }))
                        .toBe(`Today, ${date.toFormat(`${TIME}:${SECONDS}`)}`);
                });
            });
        });

        describe('absolute formats', () => {
            describe('Absolute short (absoluteShortDate/Time method)', () => {
                it('absoluteShortDate', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteShortDate(date))
                        .toBe(adapter.format(date, DAY_SHORT_MONTH));
                });

                it('absoluteShortDate (other year)', () => {
                    const date = adapter.createDate(2015);

                    expect(formatter.absoluteShortDate(date))
                        .toBe(adapter.format(date, `${DAY_SHORT_MONTH}, ${YEAR}`));
                });

                it('absoluteShortDateTime', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteShortDateTime(date))
                        .toBe(adapter.format(date, `${DAY_SHORT_MONTH}, ${TIME}`));
                });

                it('absoluteShortDateTime (other year)', () => {
                    const date = adapter.createDate(2015);

                    expect(formatter.absoluteShortDateTime(date))
                        .toBe(adapter.format(date, `${DAY_SHORT_MONTH}, ${YEAR}, ${TIME}`));
                });

                it('absoluteShortDateTime with milliseconds', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteShortDateTime(date, { milliseconds: true }))
                        .toBe(adapter.format(date, `${DAY_SHORT_MONTH}, ${TIME}:${SECONDS}${MILLISECONDS}`));
                });

                it('absoluteShortDateTime with seconds', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteShortDateTime(date, { seconds: true }))
                        .toBe(adapter.format(date, `${DAY_SHORT_MONTH}, ${TIME}:${SECONDS}`));
                });
            });

            describe('Absolute long (absoluteLongDate/Time method)', () => {
                it('absoluteLongDate', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteLongDate(date))
                        .toBe(date.toFormat(`${DAY_MONTH}`));
                });

                it('absoluteLongDate (other year)', () => {
                    const date = adapter.createDate(2015);

                    expect(formatter.absoluteLongDate(date))
                        .toBe(date.toFormat(`${DAY_MONTH}, ${YEAR}`));
                });

                it('absoluteLongDateTime', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteLongDateTime(date))
                        .toBe(date.toFormat(`${DAY_MONTH}, ${TIME}`));
                });

                it('absoluteLongDateTime (other year)', () => {
                    const date = adapter.createDate(2015);

                    expect(formatter.absoluteLongDateTime(date))
                        .toBe(date.toFormat(`${DAY_MONTH}, ${YEAR}, ${TIME}`));
                });

                it('absoluteLongDateTime with milliseconds', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteLongDateTime(date, { milliseconds: true }))
                        .toBe(date.toFormat(`${DAY_MONTH}, ${TIME}:${SECONDS}${MILLISECONDS}`));
                });

                it('absoluteLongDateTime with seconds', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteLongDateTime(date, { seconds: true }))
                        .toBe(adapter.format(date, `${DAY_MONTH}, ${TIME}:${SECONDS}`));
                });
            });
        });

        describe('range formats', () => {
            let startDateFormat: any;
            let endDateFormat: any;

            describe('closed range', () => {
                describe('Range short (rangeShortDate method)', () => {
                    beforeEach(() => {
                        endDateFormat = DAY_SHORT_MONTH;
                        startDateFormat = endDateFormat;
                    });

                    it('rangeShortDate', () => {
                        const startDate = adapter.today().set({ day: 1 });
                        const endDate = startDate.plus({ days: 10 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, `${DAY}`);

                        expect(formatter.rangeShortDate(startDate, endDate))
                            .toBe(`${startString}${DASH}${endString}`);
                    });

                    it('rangeShortDate (other month)', () => {
                        const startDate = adapter.today().set({ month: 1 });
                        const endDate = startDate.plus({ months: 1 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeShortDate(startDate, endDate))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });

                    it('rangeShortDate (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = adapter.today();

                        const startString = adapter.format(startDate, `${startDateFormat}, ${YEAR}`);
                        const endString = adapter.format(endDate, `${endDateFormat}, ${YEAR}`);

                        expect(formatter.rangeShortDate(startDate, endDate))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });

                    it('rangeShortDate (endDate is other year)', () => {
                        const startDate = adapter.today();
                        const endDate = startDate.plus({ years: 1 });

                        const startString = adapter.format(startDate, `${startDateFormat}, ${YEAR}`);
                        const endString = adapter.format(endDate, `${endDateFormat}, ${YEAR}`);

                        expect(formatter.rangeShortDate(startDate, endDate))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });
                });

                describe('Range short (rangeShortDateTime method)', () => {
                    beforeEach(() => {
                        startDateFormat = `${DAY_SHORT_MONTH}, ${TIME}`;
                        endDateFormat = startDateFormat;
                    });

                    it('rangeShortDateTime', () => {
                        const startDate = adapter.today().set({ day: 1 });
                        const endDate = startDate.plus({ days: 10 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeShortDateTime(startDate, endDate))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });

                    it('rangeShortDateTime (same day)', () => {
                        const startDate = adapter.today();
                        const endDate = startDate.plus({ minutes: 1 });

                        const startString = adapter.format(startDate, `${TIME}`);
                        const endString = adapter.format(endDate, `${TIME}, ${DAY_SHORT_MONTH}`);

                        expect(formatter.rangeShortDateTime(startDate, endDate))
                            .toBe(`${startString}${DASH}${endString}`);
                    });

                    it('rangeShortDateTime (same day, other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = startDate.plus({ minutes: 1 });

                        const startString = adapter.format(startDate, `${TIME}`);
                        const endString = adapter.format(endDate, `${TIME}, ${DAY_SHORT_MONTH}, ${YEAR}`);

                        expect(formatter.rangeShortDateTime(startDate, endDate))
                            .toBe(`${startString}${DASH}${endString}`);
                    });

                    it('rangeShortDateTime (other month)', () => {
                        const startDate = adapter.today().set({ month: 1 });
                        const endDate = startDate.plus({ months: 1 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeShortDateTime(startDate, endDate))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });

                    it('rangeShortDateTime (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = adapter.today();

                        const startString = adapter.format(startDate, `${DAY_SHORT_MONTH}, ${YEAR}, ${TIME}`);
                        const endString = adapter.format(endDate, `${DAY_SHORT_MONTH}, ${YEAR}, ${TIME}`);

                        expect(formatter.rangeShortDateTime(startDate, endDate))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });

                    it('rangeShortDateTime (endDate is other year)', () => {
                        const startDate = adapter.today();
                        const endDate = startDate.plus({ years: 1 });

                        const startString = adapter.format(startDate, `${DAY_SHORT_MONTH}, ${YEAR}, ${TIME}`);
                        const endString = adapter.format(endDate, `${DAY_SHORT_MONTH}, ${YEAR}, ${TIME}`);

                        expect(formatter.rangeShortDateTime(startDate, endDate))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });

                    it('rangeShortDateTime (with seconds)', () => {
                        const startDate = adapter.today().set({ day: 1 });
                        const endDate = startDate.plus({ days: 10 });

                        const startString = adapter.format(startDate, `${DAY_SHORT_MONTH}, ${TIME}:${SECONDS}`);
                        const endString = adapter.format(endDate, `${DAY_SHORT_MONTH}, ${TIME}:${SECONDS}`);

                        expect(formatter.rangeShortDateTime(startDate, endDate, {seconds: true}))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });

                    it('rangeShortDateTime (with milliseconds)', () => {
                        const startDate = adapter.today().set({ day: 1 });
                        const endDate = startDate.plus({ days: 10 });

                        const startString = adapter.format(startDate, `${DAY_SHORT_MONTH}, ${TIME}:${SECONDS}${MILLISECONDS}`);
                        const endString = adapter.format(endDate, `${DAY_SHORT_MONTH}, ${TIME}:${SECONDS}${MILLISECONDS}`);

                        expect(formatter.rangeShortDateTime(startDate, endDate, {milliseconds: true}))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });
                });

                describe('Range long (rangeLongDate method)', () => {
                    beforeEach(() => {
                        startDateFormat = DAY_MONTH;
                        endDateFormat = startDateFormat;
                    });

                    it('rangeLongDate', () => {
                        const startDate = adapter.today().set({ day: 1 });
                        const endDate = startDate.plus({ days: 10 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, DAY);

                        expect(formatter.rangeLongDate(startDate, endDate))
                            .toBe(`${startString}${DASH}${endString}`);
                    });

                    it('rangeLongDate (other month)', () => {
                        const startDate = adapter.today().set({ month: 1 });
                        const endDate = startDate.plus({ months: 1 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, `${endDateFormat}`);

                        expect(formatter.rangeLongDate(startDate, endDate))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });

                    it('rangeLongDate (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = adapter.today();

                        const startString = adapter.format(startDate, `${startDateFormat}, ${YEAR}`);
                        const endString = adapter.format(endDate, `${endDateFormat}, ${YEAR}`);

                        expect(formatter.rangeLongDate(startDate, endDate))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });

                    it('rangeLongDate (endDate is other year)', () => {
                        const startDate = adapter.createDate(2015);
                        const endDate = startDate.plus({ years: 1 });

                        const startString = adapter.format(startDate, `${startDateFormat}, ${YEAR}`);
                        const endString = adapter.format(endDate, `${endDateFormat}, ${YEAR}`);

                        expect(formatter.rangeLongDate(startDate, endDate))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });
                });

                describe('Range long (rangeLongDateTime method)', () => {
                    beforeEach(() => {
                        startDateFormat = `${DAY_MONTH}, ${TIME}`;
                        endDateFormat = startDateFormat;
                    });

                    it('rangeLongDateTime', () => {
                        const startDate = adapter.today().set({ day: 1 });
                        const endDate = startDate.plus({ days: 10 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeLongDateTime(startDate, endDate))
                            .toBe(`${FROM} ${startString} to${NBSP}${endString}`);
                    });

                    it('rangeLongDateTime (same day)', () => {
                        const startDate = adapter.today();
                        const endDate = startDate.plus({ minutes: 1 });

                        const startString = adapter.format(startDate, `${DAY_MONTH}, 'from'${NBSP}${TIME}`);
                        const endString = adapter.format(endDate, `'to'${NBSP}${TIME}`);

                        expect(formatter.rangeLongDateTime(startDate, endDate))
                            .toBe(`${startString} ${endString}`);
                    });

                    it('rangeLongDateTime (same day, other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = startDate.plus({ minutes: 1 });

                        const startString = adapter.format(startDate, `${DAY_MONTH}, ${YEAR}, 'from'${NBSP}${TIME}`);
                        const endString = adapter.format(endDate, `'to'${NBSP}${TIME}`);

                        expect(formatter.rangeLongDateTime(startDate, endDate))
                            .toBe(`${startString} ${endString}`);
                    });

                    it('rangeLongDateTime (other month)', () => {
                        const startDate = adapter.today().set({ month: 1 });
                        const endDate = startDate.plus({ months: 1 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeLongDateTime(startDate, endDate))
                            .toBe(`${FROM} ${startString} to${NBSP}${endString}`);
                    });

                    it('rangeLongDateTime (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = adapter.today();

                        const startString = adapter.format(startDate, `${DAY_MONTH}, ${YEAR}, ${TIME}`);
                        const endString = adapter.format(endDate, `${DAY_MONTH}, ${YEAR}, ${TIME}`);

                        expect(formatter.rangeLongDateTime(startDate, endDate))
                            .toBe(`${FROM} ${startString} to${NBSP}${endString}`);
                    });

                    it('rangeLongDateTime (endDate is other year)', () => {
                        const startDate = adapter.createDate(2015);
                        const endDate = startDate.plus({ years: 1 });

                        const startString = adapter.format(startDate, `${DAY_MONTH}, ${YEAR}, ${TIME}`);
                        const endString = adapter.format(endDate, `${DAY_MONTH}, ${YEAR}, ${TIME}`);

                        expect(formatter.rangeLongDateTime(startDate, endDate))
                            .toBe(`${FROM} ${startString} to${NBSP}${endString}`);
                    });
                });

                describe('Range middle (rangeMiddleDateTime method)', () => {
                    beforeEach(() => {
                        startDateFormat = `${DAY_MONTH}, ${TIME}`;
                        endDateFormat = startDateFormat;
                    });

                    it('rangeMiddleDateTime', () => {
                        const startDate = adapter.today().set({ day: 1 });
                        const endDate = startDate.plus({ days: 10 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeMiddleDateTime(startDate, endDate))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });

                    it('rangeMiddleDateTime (same day)', () => {
                        const startDate = adapter.today();
                        const endDate = startDate.plus({ minutes: 1 });

                        const startString = adapter.format(startDate, `${TIME}`);
                        const endString = adapter.format(endDate, `${TIME}, ${DAY_MONTH}`);

                        expect(formatter.rangeMiddleDateTime(startDate, endDate))
                            .toBe(`${startString}${DASH}${endString}`);
                    });

                    it('rangeMiddleDateTime (same day, other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = startDate.plus({ minutes: 1 });

                        const startString = adapter.format(startDate, `${TIME}`);
                        const endString = adapter.format(endDate, `${TIME}, ${DAY_MONTH}, ${YEAR}`);

                        expect(formatter.rangeMiddleDateTime(startDate, endDate))
                            .toBe(`${startString}${DASH}${endString}`);
                    });

                    it('rangeMiddleDateTime (other month)', () => {
                        const startDate = adapter.today().set({ month: 1 });
                        const endDate = startDate.plus({ months: 1 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeMiddleDateTime(startDate, endDate))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });

                    it('rangeMiddleDateTime (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = adapter.today();

                        const startString = adapter.format(startDate, `${DAY_MONTH}, ${YEAR}, ${TIME}`);
                        const endString = adapter.format(endDate, `${DAY_MONTH}, ${YEAR}, ${TIME}`);

                        expect(formatter.rangeMiddleDateTime(startDate, endDate))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });

                    it('rangeMiddleDateTime (endDate is other year)', () => {
                        const startDate = adapter.createDate(2015);
                        const endDate = startDate.plus({ years: 1 });

                        const startString = adapter.format(startDate, `${DAY_MONTH}, ${YEAR}, ${TIME}`);
                        const endString = adapter.format(endDate, `${DAY_MONTH}, ${YEAR}, ${TIME}`);

                        expect(formatter.rangeMiddleDateTime(startDate, endDate))
                            .toBe(`${startString}${LONG_DASH}${endString}`);
                    });
                });
            });

            describe('opened range', () => {
                describe('Range short (rangeShortDate method)', () => {
                    beforeEach(() => {
                        startDateFormat = DAY_SHORT_MONTH;
                        endDateFormat = DAY_SHORT_MONTH;
                    });

                    it('throw Error', () => {
                        const wrapper = () => formatter.rangeShortDate(null);
                        expect(wrapper).toThrowError('Invalid date');
                    });

                    it('rangeShortDate (only startDate)', () => {
                        const startDate = adapter.today();
                        const startString = adapter.format(startDate, startDateFormat);

                        expect(formatter.rangeShortDate(startDate))
                            .toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeShortDate (only endDate)', () => {
                        const endDate = adapter.today();
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeShortDate(null, endDate))
                            .toBe(`${UNTIL}${NBSP}${endString}`);
                    });

                    it('rangeShortDate (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const startString = adapter.format(startDate, `${startDateFormat} ${YEAR}`);

                        expect(formatter.rangeShortDate(startDate))
                            .toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeShortDate (endDate is other year)', () => {
                        const endDate = adapter.today().plus({ years: 1 });
                        const endString = adapter.format(endDate, `${endDateFormat} ${YEAR}`);

                        expect(formatter.rangeShortDate(null, endDate))
                            .toBe(`${UNTIL}${NBSP}${endString}`);
                    });
                });

                describe('Range short (rangeShortDateTime method)', () => {
                    beforeEach(() => {
                        startDateFormat = `${DAY_SHORT_MONTH}, ${TIME}`;
                        endDateFormat = `${DAY_SHORT_MONTH}, ${TIME}`;
                    });

                    it('throw Error', () => {
                        const wrapper = () => formatter.rangeShortDateTime(null);
                        expect(wrapper).toThrowError('Invalid date');
                    });

                    it('rangeShortDateTime (only startDate)', () => {
                        const startDate = adapter.today();
                        const startString = adapter.format(startDate, startDateFormat);

                        expect(formatter.rangeShortDateTime(startDate))
                            .toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeShortDateTime (only endDate)', () => {
                        const endDate = adapter.today();
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeShortDateTime(null, endDate))
                            .toBe(`${UNTIL}${NBSP}${endString}`);
                    });

                    it('rangeShortDateTime (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const startString = adapter.format(startDate, `${DAY_SHORT_MONTH} ${YEAR}, ${TIME}`);

                        expect(formatter.rangeShortDateTime(startDate))
                            .toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeShortDateTime (endDate is other year)', () => {
                        const endDate = adapter.today().plus({ years: 1 });
                        const endString = adapter.format(endDate, `${DAY_SHORT_MONTH} ${YEAR}, ${TIME}`);

                        expect(formatter.rangeShortDateTime(null, endDate))
                            .toBe(`${UNTIL}${NBSP}${endString}`);
                    });

                    it('rangeShortDateTime (with seconds)', () => {

                        const startDate = adapter.today();
                        const startString = adapter.format(startDate, `${startDateFormat}:${SECONDS}`);

                        expect(formatter.rangeShortDateTime(startDate, null, {seconds: true}))
                            .toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeShortDateTime (with milliseconds)', () => {

                        const startDate = adapter.today();
                        const startString = adapter.format(startDate, `${startDateFormat}:${SECONDS}${MILLISECONDS}`);

                        expect(formatter.rangeShortDateTime(startDate, null, {milliseconds: true}))
                            .toBe(`${FROM}${NBSP}${startString}`);
                    });
                });

                describe('Range long (rangeLongDate method)', () => {
                    beforeEach(() => {
                        startDateFormat = `${DAY_MONTH}`;
                        endDateFormat = `${DAY_MONTH}`;
                    });

                    it('throw Error', () => {
                        const wrapper = () => formatter.rangeLongDate(null);
                        expect(wrapper).toThrowError('Invalid date');
                    });

                    it('rangeLongDate (only startDate)', () => {
                        const startDate = adapter.today();
                        const startString = adapter.format(startDate, startDateFormat);

                        expect(formatter.rangeLongDate(startDate))
                            .toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeLongDate (only endDate)', () => {
                        const endDate = adapter.today();
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeLongDate(null, endDate))
                            .toBe(`${UNTIL}${NBSP}${endString}`);
                    });

                    it('rangeLongDate (startDate is other year)', () => {
                        const startDate = adapter.today()
                            .minus({ years: 1 });
                        const startString = adapter.format(startDate, `${startDateFormat} ${YEAR}`);

                        expect(formatter.rangeLongDate(startDate))
                            .toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeLongDate (endDate is other year)', () => {
                        const endDate = adapter.today().plus({ years: 1 });
                        const endString = adapter.format(endDate, `${endDateFormat} ${YEAR}`);

                        expect(formatter.rangeLongDate(null, endDate))
                            .toBe(`${UNTIL}${NBSP}${endString}`);
                    });
                });

                describe('Range long (rangeLongDateTime method)', () => {
                    beforeEach(() => {
                        startDateFormat = `${DAY_MONTH}, ${TIME}`;
                        endDateFormat = `${DAY_MONTH}, ${TIME}`;
                    });

                    it('throw Error', () => {
                        const wrapper = () => formatter.rangeLongDateTime(null);
                        expect(wrapper).toThrowError('Invalid date');
                    });

                    it('rangeLongDateTime (only startDate)', () => {
                        const startDate = adapter.today();
                        const startString = adapter.format(startDate, startDateFormat);

                        expect(formatter.rangeLongDateTime(startDate))
                            .toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeLongDateTime (only endDate)', () => {
                        const endDate = adapter.today();
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeLongDateTime(null, endDate))
                            .toBe(`${UNTIL}${NBSP}${endString}`);
                    });

                    it('rangeLongDateTime (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const startString = adapter.format(startDate, `${DAY_MONTH} ${YEAR}, ${TIME}`);

                        expect(formatter.rangeLongDateTime(startDate))
                            .toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeLongDateTime (endDate is other year)', () => {
                        const endDate = adapter.today().plus({ years: 1 });
                        const endString = adapter.format(endDate, `${DAY_MONTH} ${YEAR}, ${TIME}`);

                        expect(formatter.rangeLongDateTime(null, endDate))
                            .toBe(`${UNTIL}${NBSP}${endString}`);
                    });
                });
            });
        });
    });
});
