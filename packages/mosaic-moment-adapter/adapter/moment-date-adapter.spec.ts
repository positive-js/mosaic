// tslint:disable:no-magic-numbers
// tslint:disable:mocha-no-side-effect-code
import { LOCALE_ID } from '@angular/core';
import { async, inject, TestBed } from '@angular/core/testing';
import {
    DateAdapter,
    MC_DATE_LOCALE
} from '@ptsecurity/cdk/datetime';
import * as moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { Moment } from 'moment';

import { MC_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateModule } from './index';
import { MomentDateAdapter } from './moment-date-adapter';


// tslint:disable:one-variable-per-declaration
const JAN = 0, FEB = 1, MAR = 2, DEC = 11;

describe('MomentDateAdapter', () => {
    let adapter: MomentDateAdapter;
    let assertValidDate: (d: moment.Moment | null, valid: boolean) => void;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [MomentDateModule]
        }).compileComponents();
    }));

    beforeEach(inject([DateAdapter], (dateAdapter: MomentDateAdapter) => {
        moment.locale('en');
        adapter = dateAdapter;
        adapter.setLocale('en');

        assertValidDate = (d: moment.Moment | null, valid: boolean) => {
            expect(adapter.isDateInstance(d)).not.toBeNull(`Expected ${d} to be a date instance`);
            expect(adapter.isValid(d!)).toBe(valid,
                `Expected ${d} to be ${valid ? 'valid' : 'invalid'},` +
                ` but was ${valid ? 'invalid' : 'valid'}`);
        };
    }));

    it('should get year', () => {
        expect(adapter.getYear(moment([2017,  JAN,  1]))).toBe(2017);
    });

    it('should get month', () => {
        expect(adapter.getMonth(moment([2017,  JAN,  1]))).toBe(0);
    });

    it('should get date', () => {
        expect(adapter.getDate(moment([2017,  JAN,  1]))).toBe(1);
    });

    it('should get day of week', () => {
        expect(adapter.getDayOfWeek(moment([2017,  JAN,  1]))).toBe(0);
    });

    it('should get same day of week in a locale with a different first day of the week', () => {
        adapter.setLocale('fr');
        expect(adapter.getDayOfWeek(moment([2017,  JAN,  1]))).toBe(0);
    });

    it('should get long month names', () => {
        expect(adapter.getMonthNames('long')).toEqual([
            'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
            'October', 'November', 'December'
        ]);
    });

    it('should get short month names ru', () => {
        adapter.setLocale('ru');

        expect(adapter.getMonthNames('short')).toEqual([
            'янв', 'фев', 'март', 'апр', 'май', 'июнь', 'июль', 'авг', 'сен', 'окт', 'ноя', 'дек'
        ]);
    });

    it('should get long month names en', () => {
        adapter.setLocale('en');

        expect(adapter.getMonthNames('short')).toEqual([
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ]);
    });

    it('should get date names', () => {
        expect(adapter.getDateNames()).toEqual([
            '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17',
            '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'
        ]);
    });

    it('should get date names in a different locale', () => {
        adapter.setLocale('ar-AE');

        expect(adapter.getDateNames()).toEqual([
            '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '١٠', '١١', '١٢', '١٣', '١٤', '١٥', '١٦',
            '١٧', '١٨', '١٩', '٢٠', '٢١', '٢٢', '٢٣', '٢٤', '٢٥', '٢٦', '٢٧', '٢٨', '٢٩', '٣٠', '٣١'
        ]);
    });

    it('should get date names in a different locale', () => {
        adapter.setLocale('ru');

        expect(adapter.getDateNames()).toEqual([
            '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17',
            '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'
        ]);
    });

    it('should get long day of week names for ru', () => {
        adapter.setLocale('ru');

        expect(adapter.getDayOfWeekNames('long')).toEqual([
            'Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'
        ]);
    });

    it('should get long day of week names for en', () => {
        adapter.setLocale('en');

        expect(adapter.getDayOfWeekNames('long')).toEqual([
            'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
        ]);
    });

    it('should get short day of week names', () => {
        expect(adapter.getDayOfWeekNames('short')).toEqual([
            'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
        ]);
    });

    it('should get day of week names in a different locale', () => {
        adapter.setLocale('ja-JP');

        expect(adapter.getDayOfWeekNames('long')).toEqual([
            '日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'
        ]);
    });

    it('should get day of week names in a different locale', () => {
        adapter.setLocale('ru');

        expect(adapter.getDayOfWeekNames('long')).toEqual([
            'Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'
        ]);
    });

    it('should get year name', () => {
        expect(adapter.getYearName(moment([2017,  JAN,  1]))).toBe('2017');
    });

    it('should get year name in a different locale', () => {
        adapter.setLocale('ar-AE');

        expect(adapter.getYearName(moment([2017,  JAN,  1]))).toBe('٢٠١٧');
    });

    it('should get first day of week in a different locale', () => {
        adapter.setLocale('fr');

        expect(adapter.getFirstDayOfWeek()).toBe(1);
    });

    it('should get first day of week for ru', () => {
        adapter.setLocale('ru');

        expect(adapter.getFirstDayOfWeek()).toBe(1);
    });

    it('should create Moment date', () => {
        expect(adapter.createDate(2017, JAN, 1).format())
            .toEqual(moment([2017,  JAN,  1]).format());
    });

    it('should not create Moment date with month over/under-flow', () => {
        expect(() => adapter.createDate(2017, DEC + 1, 1)).toThrow();
        expect(() => adapter.createDate(2017, JAN - 1, 1)).toThrow();
    });

    it('should not create Moment date with date over/under-flow', () => {
        expect(() => adapter.createDate(2017, JAN, 32)).toThrow();
        expect(() => adapter.createDate(2017, JAN, 0)).toThrow();
    });

    it('should create Moment date with low year number', () => {
        expect(adapter.createDate(-1, JAN, 1).year()).toBe(-1);
        expect(adapter.createDate(0, JAN, 1).year()).toBe(0);
        expect(adapter.createDate(50, JAN, 1).year()).toBe(50);
        expect(adapter.createDate(99, JAN, 1).year()).toBe(99);
        expect(adapter.createDate(100, JAN, 1).year()).toBe(100);
    });

    it('should not create Moment date in utc format', () => {
        expect(adapter.createDate(2017, JAN, 5).isUTC()).toEqual(false);
    });

    it('should get today\'s date', () => {
        expect(adapter.sameDate(adapter.today(), moment()))
            .toBe(true, 'should be equal to today\'s date');
    });

    it('should parse string according to given format', () => {
        expect(adapter.parse('1/2/2017', 'MM/DD/YYYY')!.format())
            .toEqual(moment([2017,  JAN,  2]).format());
        expect(adapter.parse('1/2/2017', 'DD/MM/YYYY')!.format())
            .toEqual(moment([2017,  FEB,  1]).format());
    });

    it('should parse number', () => {
        const timestamp = new Date().getTime();
        expect(adapter.parse(timestamp, 'MM/DD/YYYY')!.format()).toEqual(moment(timestamp).format());
    });

    it('should parse invalid value as invalid', () => {
        const d = adapter.parse('hello', 'MM/DD/YYYY');
        expect(d).not.toBeNull();
        expect(adapter.isDateInstance(d))
            .toBe(true, 'Expected string to have been fed through Date.parse');
        expect(adapter.isValid(d as moment.Moment))
            .toBe(false, 'Expected to parse as "invalid date" object');
    });

    it('should format date according to given format', () => {
        expect(adapter.format(moment([2017,  JAN,  2]), 'MM/DD/YYYY')).toEqual('01/02/2017');
        expect(adapter.format(moment([2017,  JAN,  2]), 'DD/MM/YYYY')).toEqual('02/01/2017');
    });

    it('should throw when attempting to format invalid date', () => {
        expect(() => adapter.format(moment(NaN), 'MM/DD/YYYY'))
            .toThrowError(/MomentDateAdapter: Cannot format invalid date\./);
    });

    it('should add years', () => {
        expect(adapter.addCalendarYears(moment([2017, JAN, 1]), 1).format())
            .toEqual(moment([2018, JAN, 1]).format());
        expect(adapter.addCalendarYears(moment([2017, JAN, 1]), -1).format())
            .toEqual(moment([2016, JAN, 1]).format());
    });

    it('should respect leap years when adding years', () => {
        expect(adapter.addCalendarYears(moment([2016, FEB, 29]), 1).format())
            .toEqual(moment([2017, FEB, 28]).format());
        expect(adapter.addCalendarYears(moment([2016, FEB, 29]), -1).format())
            .toEqual(moment([2015, FEB, 28]).format());
    });

    it('should add months', () => {
        expect(adapter.addCalendarMonths(moment([2017, JAN, 1]), 1).format())
            .toEqual(moment([2017, FEB, 1]).format());
        expect(adapter.addCalendarMonths(moment([2017, JAN, 1]), -1).format())
            .toEqual(moment([2016, DEC, 1]).format());
    });

    it('should respect month length differences when adding months', () => {
        expect(adapter.addCalendarMonths(moment([2017, JAN, 31]), 1).format())
            .toEqual(moment([2017, FEB, 28]).format());
        expect(adapter.addCalendarMonths(moment([2017, MAR, 31]), -1).format())
            .toEqual(moment([2017, FEB, 28]).format());
    });

    it('should add days', () => {
        expect(adapter.addCalendarDays(moment([2017, JAN, 1]), 1).format())
            .toEqual(moment([2017, JAN, 2]).format());
        expect(adapter.addCalendarDays(moment([2017, JAN, 1]), -1).format())
            .toEqual(moment([2016, DEC, 31]).format());
    });

    it('should clone', () => {
        const date = moment([2017, JAN, 1]);
        expect(adapter.clone(date).format()).toEqual(date.format());
        expect(adapter.clone(date)).not.toBe(date);
    });

    it('should compare dates', () => {
        expect(adapter.compareDate(moment([2017, JAN, 1]), moment([2017, JAN, 2]))).toBeLessThan(0);
        expect(adapter.compareDate(moment([2017, JAN, 1]), moment([2017, FEB, 1]))).toBeLessThan(0);
        expect(adapter.compareDate(moment([2017, JAN, 1]), moment([2018, JAN, 1]))).toBeLessThan(0);
        expect(adapter.compareDate(moment([2017, JAN, 1]), moment([2017, JAN, 1]))).toBe(0);
        expect(adapter.compareDate(moment([2018, JAN, 1]), moment([2017, JAN, 1]))).toBeGreaterThan(0);
        expect(adapter.compareDate(moment([2017, FEB, 1]), moment([2017, JAN, 1]))).toBeGreaterThan(0);
        expect(adapter.compareDate(moment([2017, JAN, 2]), moment([2017, JAN, 1]))).toBeGreaterThan(0);
    });

    it('should clamp date at lower bound', () => {
        expect(adapter.clampDate(
            moment([2017, JAN, 1]), moment([2018, JAN, 1]), moment([2019, JAN, 1])))
            .toEqual(moment([2018, JAN, 1]));
    });

    it('should clamp date at upper bound', () => {
        expect(adapter.clampDate(
            moment([2020, JAN, 1]), moment([2018, JAN, 1]), moment([2019, JAN, 1])))
            .toEqual(moment([2019, JAN, 1]));
    });

    it('should clamp date already within bounds', () => {
        expect(adapter.clampDate(
            moment([2018, FEB, 1]), moment([2018, JAN, 1]), moment([2019, JAN, 1])))
            .toEqual(moment([2018, FEB, 1]));
    });

    it('should count today as a valid date instance', () => {
        const d = moment();
        expect(adapter.isValid(d)).toBe(true);
        expect(adapter.isDateInstance(d)).toBe(true);
    });

    it('should count an invalid date as an invalid date instance', () => {
        const d = moment(NaN);
        expect(adapter.isValid(d)).toBe(false);
        expect(adapter.isDateInstance(d)).toBe(true);
    });

    it('should count a string as not a date instance', () => {
        const d = '1/1/2019';
        expect(adapter.isDateInstance(d)).toBe(false);
    });

    it('should create valid dates from valid ISO strings', () => {
        assertValidDate(adapter.deserialize('1985-04-12T23:20:50.52Z'), true);
        assertValidDate(adapter.deserialize('1996-12-19T16:39:57-08:00'), true);
        assertValidDate(adapter.deserialize('1937-01-01T12:00:27.87+00:20'), true);
        assertValidDate(adapter.deserialize('1990-13-31T23:59:00Z'), false);
        assertValidDate(adapter.deserialize('1/1/2017'), false);
        expect(adapter.deserialize('')).toBeNull();
        expect(adapter.deserialize(null)).toBeNull();
        assertValidDate(adapter.deserialize(new Date()), true);
        assertValidDate(adapter.deserialize(new Date(NaN)), false);
        assertValidDate(adapter.deserialize(moment()), true);
        assertValidDate(adapter.deserialize(moment.invalid()), false);
    });

    it('should clone the date when deserializing a Moment date', () => {
        const date = moment([2017, JAN, 1]);
        expect(adapter.deserialize(date)!.format()).toEqual(date.format());
        expect(adapter.deserialize(date)).not.toBe(date);
    });

    it('should deserialize dates with the correct locale', () => {
        adapter.setLocale('ja');
        expect(adapter.deserialize('1985-04-12T23:20:50.52Z')!.locale()).toBe('ja');
        expect(adapter.deserialize(new Date())!.locale()).toBe('ja');
        expect(adapter.deserialize(moment())!.locale()).toBe('ja');
    });

    it('should create an invalid date', () => {
        assertValidDate(adapter.invalid(), false);
    });

    it('setLocale should not modify global moment locale', () => {
        expect(moment.locale()).toBe('en');
        adapter.setLocale('ja-JP');
        expect(moment.locale()).toBe('en');
    });

    it('returned Moments should have correct locale', () => {
        adapter.setLocale('ja-JP');
        expect(adapter.createDate(2017, JAN, 1).locale()).toBe('ja');
        expect(adapter.today().locale()).toBe('ja');
        expect(adapter.clone(moment()).locale()).toBe('ja');
        expect(adapter.parse('1/1/2017', 'MM/DD/YYYY')!.locale()).toBe('ja');
        expect(adapter.addCalendarDays(moment(), 1).locale()).toBe('ja');
        expect(adapter.addCalendarMonths(moment(), 1).locale()).toBe('ja');
        expect(adapter.addCalendarYears(moment(), 1).locale()).toBe('ja');
    });

    describe('with date format guessing', () => {
        it('should parse ISO', () => {
            adapter.setLocale('ru');
            const utcDate = new Date(2019, 5, 3, 14, 50,  30);
            utcDate.setMinutes(utcDate.getMinutes() - utcDate.getTimezoneOffset());
            expect(adapter.parse('2019-06-03T14:50:30.000Z', '', true)!.toDate())
                .toEqual(utcDate);
        });

        it('should parse dashed date', () => {
            adapter.setLocale('ru');
            // finishing year
            expect(adapter.parse('03-06-2019', '', true)!.toDate())
                .toEqual(new Date(2019, 5, 3));
            expect(adapter.parse('03-06-19', '', true)!.toDate())
                .toEqual(new Date(2019, 5, 3));
            // leading year
            expect(adapter.parse('2019-06-03', '', true)!.toDate())
                .toEqual(new Date(2019, 5, 3));

            adapter.setLocale('en');
            // finishing year
            expect(adapter.parse('03-06-2019', '', true)!.toDate())
                .toEqual(new Date(2019, 5, 3));
            // short year
            expect(adapter.parse('03-06-19', '', true)!.toDate())
                .toEqual(new Date(2019, 5, 3));

            // leading year
            expect(adapter.parse('2019-06-03', '', true)!.toDate())
                .toEqual(new Date(2019, 5, 3));

        });

        it('should parse slashed date', () => {
            adapter.setLocale('ru');
            expect(adapter.parse('03/06/2019', '', true)!.toDate())
                .toEqual(new Date(2019, 5, 3));
            // short year
            expect(adapter.parse('03/06/19', '', true)!.toDate())
                .toEqual(new Date(2019, 5, 3));

            adapter.setLocale('en');
            // US by default
            expect(adapter.parse('03/06/2019', '', true)!.toDate())
                .toEqual(new Date(2019, 2, 6));

            // short year
            expect(adapter.parse('03/06/19', '', true)!.toDate())
                .toEqual(new Date(2019, 2, 6));

            // month order guessing
            expect(adapter.parse('23/06/2019', '', true)!.toDate())
                .toEqual(new Date(2019, 5, 23));
        });

        it('should parse doted date', () => {
            adapter.setLocale('ru');
            expect(adapter.parse('03.06.2019', '', true)!.toDate())
                .toEqual(new Date(2019, 5, 3));
            expect(adapter.parse('03.06.19', '', true)!.toDate())
                .toEqual(new Date(2019, 5, 3));

            adapter.setLocale('en');
            expect(adapter.parse('03.06.2019', '', true)!.toDate())
                .toEqual(new Date(2019, 5, 3));
            expect(adapter.parse('03.06.19', '', true)!.toDate())
                .toEqual(new Date(2019, 5, 3));
        });

        it('should parse long formatted date', () => {
            adapter.setLocale('ru');
            expect(adapter.parse('3 июня 2019', '', true)!.toDate())
                .toEqual(new Date(2019, 5, 3));

            expect(adapter.parse('6 фев 2019', '', true)!.toDate())
                .toEqual(new Date(2019, 1, 6));

            adapter.setLocale('en');
            expect(adapter.parse('June 3rd 2019', '', true)!.toDate())
                .toEqual(new Date(2019, 5, 3));

            expect(adapter.parse('Feb 6th 2019', '', true)!.toDate())
                .toEqual(new Date(2019, 1, 6));

            expect(adapter.parse('3 June 2019', '', true)!.toDate())
                .toEqual(new Date(2019, 5, 3));

            expect(adapter.parse('6 Feb 2019', '', true)!.toDate())
                .toEqual(new Date(2019, 1, 6));
        });

        it('should parse unix timestamp', () => {
            adapter.setLocale('ru');
            const utcDate = new Date(2019, 5, 3, 14, 50,  30);
            utcDate.setMinutes(utcDate.getMinutes() - utcDate.getTimezoneOffset());
            expect(adapter.parse('1559573430', '', true)!.toDate())
                .toEqual(utcDate);
        });
    });
});

describe('MomentDateAdapter with MC_DATE_LOCALE override', () => {
    let adapter: MomentDateAdapter;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [ MomentDateModule ],
            providers: [{ provide: MC_DATE_LOCALE, useValue: 'ja-JP' }]
        }).compileComponents();
    }));

    beforeEach(inject([DateAdapter], (d: MomentDateAdapter) => {
        adapter = d;
    }));

    it('should take the default locale id from the MC_DATE_LOCALE injection token', () => {
        expect(adapter.format(moment([2017,  JAN,  2]), 'll')).toEqual('2017年1月2日');
    });
});

describe('MomentDateAdapter with LOCALE_ID override', () => {
    let adapter: MomentDateAdapter;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [MomentDateModule],
            providers: [{ provide: LOCALE_ID, useValue: 'fr' }]
        }).compileComponents();
    }));

    beforeEach(inject([DateAdapter], (d: MomentDateAdapter) => {
        adapter = d;
    }));

    it('should cascade locale id from the LOCALE_ID injection token to MC_DATE_LOCALE', () => {
        expect(adapter.format(moment([2017,  JAN,  2]), 'll')).toEqual('2 janv. 2017');
    });
});

describe('MomentDateAdapter with MC_MOMENT_DATE_ADAPTER_OPTIONS override', () => {
    let adapter: MomentDateAdapter;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [MomentDateModule],
            providers: [{
                provide: MC_MOMENT_DATE_ADAPTER_OPTIONS,
                useValue: {useUtc: true}
            }]
        }).compileComponents();
    }));

    beforeEach(inject([DateAdapter], (d: MomentDateAdapter) => {
        adapter = d;
    }));

    describe('use UTC', () => {
        it('should create Moment date in UTC', () => {
            expect(adapter.createDate(2017, JAN, 5).isUTC()).toBe(true);
        });

        it('should create today in UTC', () => {
            expect(adapter.today().isUTC()).toBe(true);
        });

        it('should parse dates to UTC', () => {
            expect(adapter.parse('1/2/2017', 'MM/DD/YYYY')!.isUTC()).toBe(true);
        });

        it('should return UTC date when deserializing', () => {
            expect(adapter.deserialize('1985-04-12T23:20:50.52Z')!.isUTC()).toBe(true);
        });
    });

});

describe('MomentDateAdapter formatter', () => {
    let adapter: MomentDateAdapter;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [MomentDateModule],
            providers: [{ provide: LOCALE_ID, useValue: 'ru' }]
        }).compileComponents();
    }));

    beforeEach(inject([DateAdapter], (d: MomentDateAdapter) => {
        adapter = d;
    }));

    describe('ru (default)', () => {
        beforeEach(() => {
            adapter.setLocale('ru');
        });

        const YEAR = 'YYYY';
        const MONTH = 'MMMM';
        const SHORT_MONTH = 'MMM';
        const DAY = 'D';
        const TIME = 'HH:mm';

        const DASH = '\u2013';
        const LONG_DASH = '\u202F\u2014\u2009';

        const NBSP = '\u00A0';
        const DAY_MONTH = `${DAY}${NBSP}${MONTH}`;
        const DAY_SHORT_MONTH = `${DAY}${NBSP}${SHORT_MONTH}`;

        describe('relative formats', () => {
            describe('Relative short (relativeShortDate method)', () => {
                it('secondsAgo', () => {
                    const date = moment().subtract(1.7, 'seconds');
                    expect(adapter.relativeShortDate(date)).toBe(`1${NBSP}с назад`);
                });

                it('minutesAgo', () => {
                    const date = moment().subtract(1.5, 'minutes');
                    expect(adapter.relativeShortDate(date)).toBe(`1${NBSP}мин назад`);
                });

                it('today', () => {
                    const date = moment().subtract(1, 'hours');
                    expect(adapter.relativeShortDate(date)).toBe(date.format(TIME));
                });

                it('yesterday, more than 24 hours ago', () => {
                    const date = moment().subtract(25, 'hours');
                    expect(adapter.relativeShortDate(date)).toBe(`Вчера, ${date.format(TIME)}`);
                });

                it('yesterday, less than 24 hours ago', () => {
                    const date = moment().subtract(23, 'hours')
                        .subtract(59, 'minutes')
                        .subtract(59, 'seconds');
                    expect(adapter.relativeShortDate(date)).toBe(`Вчера, ${date.format(TIME)}`);
                });

                it('before yesterday, more than 48 hours ago', () => {
                    const date = moment().subtract(49, 'hours');
                    expect(adapter.relativeShortDate(date)).toBe(
                        date.format(`${DAY}${NBSP}${SHORT_MONTH}, ${TIME}`)
                    );
                });

                it('before yesterday, less than 48 hours ago', () => {
                    const date = moment().subtract(47, 'hours')
                        .subtract(59, 'minutes')
                        .subtract(59, 'seconds');
                    expect(adapter.relativeShortDate(date)).toBe(
                        date.format(`${DAY}${NBSP}${SHORT_MONTH}, ${TIME}`)
                    );
                });

                it('before yesterday (other year)', () => {
                    const date = moment().year(2015).subtract(49, 'hours');
                    expect(adapter.relativeShortDate(date)).toBe(
                        date.format(`${DAY}${NBSP}${SHORT_MONTH}, ${YEAR}`)
                    );
                });
            });

            describe('Relative long (relativeLongDate method)', () => {
                it('secondsAgo', () => {
                    const date = moment().subtract(1, 'seconds');
                    expect(adapter.relativeLongDate(date)).toBe(`1${NBSP}секунду назад`);
                });

                it('minutesAgo', () => {
                    const date = moment().subtract(1, 'minutes');
                    expect(adapter.relativeLongDate(date)).toBe(`1${NBSP}минуту назад`);
                });

                it('today', () => {
                    const date = moment().subtract(1, 'hours');
                    expect(adapter.relativeLongDate(date)).toBe(date.format(TIME));
                });

                it('yesterday, more than 24 hours ago', () => {
                    const date = moment().subtract(25, 'hours');
                    expect(adapter.relativeLongDate(date)).toBe(`Вчера, ${date.format(TIME)}`);
                });

                it('yesterday, less than 24 hours ago', () => {
                    const date = moment().subtract(23, 'hours')
                        .subtract(59, 'minutes')
                        .subtract(59, 'seconds');
                    expect(adapter.relativeLongDate(date)).toBe(`Вчера, ${date.format(TIME)}`);
                });

                it('before yesterday, more than 48 hours ago', () => {
                    const date = moment().subtract(49, 'hours');
                    expect(adapter.relativeLongDate(date)).toBe(date.format(`${DAY_MONTH}, ${TIME}`));
                });

                it('before yesterday, less than 48 hours ago', () => {
                    const date = moment().subtract(47, 'hours')
                        .subtract(59, 'minutes')
                        .subtract(59, 'seconds');
                    expect(adapter.relativeLongDate(date)).toBe(date.format(`${DAY_MONTH}, ${TIME}`));
                });

                it('before yesterday (other year)', () => {
                    const date = moment().year(2015).subtract(49, 'hours');
                    expect(adapter.relativeLongDate(date)).toBe(date.format(`${DAY_MONTH}, ${YEAR}`));
                });
            });
        });

        describe('absolute formats', () => {
            describe('Absolute short (absoluteShortDate/Time method)', () => {
                it('absoluteShortDate', () => {
                    const date = moment();
                    expect(adapter.absoluteShortDate(date)).toBe(
                        date.format(DAY_SHORT_MONTH)
                    );
                });

                it('absoluteShortDate (other year)', () => {
                    const date = moment().year(2015);
                    expect(adapter.absoluteShortDate(date)).toBe(
                        date.format(`${DAY_SHORT_MONTH} ${YEAR}`)
                    );
                });

                it('absoluteShortDateTime', () => {
                    const date = moment();
                    expect(adapter.absoluteShortDateTime(date)).toBe(
                        date.format(`${DAY_SHORT_MONTH}, ${TIME}`)
                    );
                });

                it('absoluteShortDateTime (other year)', () => {
                    const date = moment().year(2015);
                    expect(adapter.absoluteShortDateTime(date)).toBe(
                        date.format(`${DAY_SHORT_MONTH} ${YEAR}, ${TIME}`)
                    );
                });
            });

            describe('Absolute long (absoluteLongDate/Time method)', () => {
                it('absoluteLongDate', () => {
                    const date = moment();
                    expect(adapter.absoluteLongDate(date)).toBe(date.format(`${DAY_MONTH}`));
                });

                it('absoluteLongDate (other year)', () => {
                    const date = moment().year(2015);
                    expect(adapter.absoluteLongDate(date)).toBe(date.format(`${DAY_MONTH} ${YEAR}`));
                });

                it('absoluteLongDateTime', () => {
                    const date = moment();
                    expect(adapter.absoluteLongDateTime(date)).toBe(date.format(`${DAY_MONTH}, ${TIME}`));
                });

                it('absoluteLongDateTime (other year)', () => {
                    const date = moment().year(2015);
                    expect(adapter.absoluteLongDateTime(date)).toBe(
                        date.format(`${DAY_MONTH} ${YEAR}, ${TIME}`)
                    );
                });
            });
        });

        describe('range formats', () => {
            let startDateFormat: any;
            let endDateFormat: any;

            describe('Range short (rangeShortDate method)', () => {
                beforeEach(() => {
                    startDateFormat = DAY_SHORT_MONTH;
                    endDateFormat = startDateFormat;
                });

                it('rangeShortDate', () => {
                    const startDate = moment().dayOfYear(1);
                    const endDate = moment(startDate).add(10, 'days');

                    const startString: string = startDate.format(`${DAY}`);
                    const endString: string = endDate.format(endDateFormat);

                    expect(adapter.rangeShortDate(startDate, endDate)).toBe(
                        `${startString}${DASH}${endString}`
                    );
                });

                it('rangeShortDate (other month)', () => {
                    const startDate = moment().month(1);
                    const endDate = moment(startDate).add(1, 'months');

                    const startString: string = startDate.format(startDateFormat);
                    const endString: string = endDate.format(endDateFormat);

                    expect(adapter.rangeShortDate(startDate, endDate)).toBe(
                        `${startString}${LONG_DASH}${endString}`
                    );
                });

                it('rangeShortDate (startDate is other year)', () => {
                    const startDate = moment().subtract(1, 'years');
                    const endDate = moment();

                    const startString: string = startDate.format(`${startDateFormat} ${YEAR}`);
                    const endString: string = endDate.format(endDateFormat);

                    expect(adapter.rangeShortDate(startDate, endDate)).toBe(
                        `${startString}${LONG_DASH}${endString}`
                    );
                });

                it('rangeShortDate (endDate is other year)', () => {
                    const startDate = moment();
                    const endDate = moment(startDate).add(1, 'years');

                    const startString: string = startDate.format(startDateFormat);
                    const endString: string = endDate.format(`${endDateFormat} ${YEAR}`);

                    expect(adapter.rangeShortDate(startDate, endDate)).toBe(
                        `${startString}${LONG_DASH}${endString}`
                    );
                });
            });

            describe('Range short (rangeShortDateTime method)', () => {
                beforeEach(() => {
                    startDateFormat = `${DAY_SHORT_MONTH}, ${TIME}`;
                    endDateFormat = startDateFormat;
                });

                it('rangeShortDateTime', () => {
                    const startDate = moment().dayOfYear(1);
                    const endDate = moment(startDate).add(10, 'days');

                    const startString: string = startDate.format(startDateFormat);
                    const endString: string = endDate.format(endDateFormat);

                    expect(adapter.rangeShortDateTime(startDate, endDate)).toBe(
                        `${startString}${LONG_DASH}${endString}`
                    );
                });

                it('rangeShortDateTime (same day)', () => {
                    const startDate = moment().dayOfYear(1);
                    const endDate = moment(startDate).add(10, 'minutes');

                    const startString = startDate.format(`${TIME}`);
                    const endString = endDate.format(`${TIME}, ${DAY_SHORT_MONTH}`);

                    expect(adapter.rangeShortDateTime(startDate, endDate)).toBe(
                        `${startString}${DASH}${endString}`
                    );
                });

                it('rangeShortDateTime (same day, other year)', () => {
                    const startDate = moment().subtract(1, 'years');
                    const endDate = moment(startDate).add(10, 'minutes');

                    const startString = startDate.format(`${TIME}`);
                    const endString = endDate.format(`${TIME}, ${DAY_SHORT_MONTH} ${YEAR}`);

                    expect(adapter.rangeShortDateTime(startDate, endDate)).toBe(
                        `${startString}${DASH}${endString}`
                    );
                });

                it('rangeShortDateTime (other month)', () => {
                    const startDate = moment().month(1);
                    const endDate = moment(startDate).add(1, 'months');

                    const startString: string = startDate.format(startDateFormat);
                    const endString: string = endDate.format(endDateFormat);

                    expect(adapter.rangeShortDateTime(startDate, endDate)).toBe(
                        `${startString}${LONG_DASH}${endString}`
                    );
                });

                it('rangeShortDateTime (startDate is other year)', () => {
                    const startDate = moment().subtract(1, 'years');
                    const endDate = moment();

                    const startString: string = startDate.format(`${DAY_SHORT_MONTH} ${YEAR}, ${TIME}`);
                    const endString: string = endDate.format(endDateFormat);

                    expect(adapter.rangeShortDateTime(startDate, endDate)).toBe(
                        `${startString}${LONG_DASH}${endString}`
                    );
                });

                it('rangeShortDateTime (endDate is other year)', () => {
                    const startDate = moment();
                    const endDate = moment(startDate).add(1, 'years');

                    const startString: string = startDate.format(startDateFormat);
                    const endString: string = endDate.format(`${DAY_SHORT_MONTH} ${YEAR}, ${TIME}`);

                    expect(adapter.rangeShortDateTime(startDate, endDate)).toBe(
                        `${startString}${LONG_DASH}${endString}`
                    );
                });
            });

            describe('Range long (rangeLongDate method)', () => {
                beforeEach(() => {
                    startDateFormat = `${DAY_MONTH}`;
                    endDateFormat = startDateFormat;
                });

                it('rangeLongDate', () => {
                    const startDate: Moment = moment().dayOfYear(1);
                    const endDate: Moment = moment(startDate).add(10, 'days');

                    const startString: string = startDate.format(`${DAY}`);
                    const endString: string = endDate.format(`${endDateFormat}`);

                    expect(adapter.rangeLongDate(startDate, endDate)).toBe(
                        `${startString}${DASH}${endString}`
                    );
                });

                it('rangeLongDate (other month)', () => {
                    const startDate: Moment = moment().month(1);
                    const endDate: Moment = moment(startDate).add(1, 'months');

                    const startString: string = startDate.format(startDateFormat);
                    const endString: string = endDate.format(`${endDateFormat}`);

                    expect(adapter.rangeLongDate(startDate, endDate)).toBe(
                        `${startString}${LONG_DASH}${endString}`
                    );
                });

                it('rangeLongDate (startDate is other year)', () => {
                    const startDate: Moment = moment().subtract(1, 'years');
                    const endDate: Moment = moment();

                    const startString: string = startDate.format(`${startDateFormat} ${YEAR}`);
                    const endString: string = endDate.format(`${endDateFormat}`);

                    expect(adapter.rangeLongDate(startDate, endDate)).toBe(
                        `${startString}${LONG_DASH}${endString}`
                    );
                });

                it('rangeLongDate (endDate is other year)', () => {
                    const startDate: Moment = moment().dayOfYear(1);
                    const endDate: Moment = moment(startDate).add(1, 'years');

                    const startString: string = startDate.format(`${startDateFormat}`);
                    const endString: string = endDate.format(`${endDateFormat} ${YEAR}`);

                    expect(adapter.rangeLongDate(startDate, endDate)).toBe(
                        `${startString}${LONG_DASH}${endString}`
                    );
                });
            });

            describe('Range long (rangeLongDateTime method)', () => {
                beforeEach(() => {
                    startDateFormat = `${DAY_MONTH}, ${TIME}`;
                    endDateFormat = startDateFormat;
                });

                it('rangeLongDateTime', () => {
                    const startDate: Moment = moment().dayOfYear(1);
                    const endDate: Moment = moment(startDate).add(10, 'days');

                    const startString: string = startDate.format(startDateFormat);
                    const endString: string = endDate.format(endDateFormat);

                    expect(adapter.rangeLongDateTime(startDate, endDate)).toBe(
                        `С${NBSP}${startString} по${NBSP}${endString}`
                    );
                });

                it('rangeLongDateTime (same day)', () => {
                    const startDate: Moment = moment().dayOfYear(1);
                    const endDate: Moment = moment(startDate).add(10, 'minutes');

                    const startString: string = startDate.format(`${DAY_MONTH}, с${NBSP}${TIME}`);
                    const endString: string = endDate.format(`по${NBSP}${TIME}`);

                    expect(adapter.rangeLongDateTime(startDate, endDate)).toBe(
                        `${startString} ${endString}`
                    );
                });

                it('rangeLongDateTime (same day, other year)', () => {
                    const startDate: Moment = moment().subtract(1, 'years');
                    const endDate: Moment = moment(startDate).add(10, 'minutes');

                    const startString: string = startDate.format(`${DAY_MONTH} ${YEAR}, с${NBSP}${TIME}`);
                    const endString: string = endDate.format(`по${NBSP}${TIME}`);

                    expect(adapter.rangeLongDateTime(startDate, endDate)).toBe(
                        `${startString} ${endString}`
                    );
                });

                it('rangeLongDateTime (other month)', () => {
                    const startDate: Moment = moment().month(1);
                    const endDate: Moment = moment(startDate).add(1, 'months');

                    const startString: string = startDate.format(startDateFormat);
                    const endString: string = endDate.format(endDateFormat);

                    expect(adapter.rangeLongDateTime(startDate, endDate)).toBe(
                        `С${NBSP}${startString} по${NBSP}${endString}`
                    );
                });

                it('rangeLongDateTime (startDate is other year)', () => {
                    const startDate: Moment = moment().subtract(1, 'years');
                    const endDate: Moment = moment();

                    const startString: string = startDate.format(`${DAY_MONTH} ${YEAR}, ${TIME}`);
                    const endString: string = endDate.format(endDateFormat);

                    expect(adapter.rangeLongDateTime(startDate, endDate)).toBe(
                        `С${NBSP}${startString} по${NBSP}${endString}`
                    );
                });

                it('rangeLongDateTime (endDate is other year)', () => {
                    const startDate: Moment = moment().dayOfYear(1);
                    const endDate: Moment = moment(startDate).add(1, 'years');

                    const startString: string = startDate.format(startDateFormat);
                    const endString: string = endDate.format(`${DAY_MONTH} ${YEAR}, ${TIME}`);

                    expect(adapter.rangeLongDateTime(startDate, endDate)).toBe(
                        `С${NBSP}${startString} по${NBSP}${endString}`
                    );
                });
            });

            describe('Range middle (rangeMiddleDateTime method)', () => {
                beforeEach(() => {
                    startDateFormat = `${DAY_MONTH}, ${TIME}`;
                    endDateFormat = startDateFormat;
                });

                it('rangeMiddleDateTime', () => {
                    const startDate: Moment = moment().dayOfYear(1);
                    const endDate: Moment = moment(startDate).add(10, 'days');

                    const startString: string = startDate.format(startDateFormat);
                    const endString: string = endDate.format(endDateFormat);

                    expect(adapter.rangeMiddleDateTime(startDate, endDate)).toBe(
                        `${startString}${LONG_DASH}${endString}`
                    );
                });

                it('rangeMiddleDateTime (same day)', () => {
                    const startDate: Moment = moment().dayOfYear(1);
                    const endDate: Moment = moment(startDate).add(10, 'minutes');

                    const startString: string = startDate.format(`${TIME}`);
                    const endString: string = endDate.format(`${TIME}, ${DAY_MONTH}`);

                    expect(adapter.rangeMiddleDateTime(startDate, endDate)).toBe(
                        `${startString}${DASH}${endString}`
                    );
                });

                it('rangeMiddleDateTime (same day, other year)', () => {
                    const startDate: Moment = moment().subtract(1, 'years');
                    const endDate: Moment = moment(startDate).add(10, 'minutes');

                    const startString: string = startDate.format(`${TIME}`);
                    const endString: string = endDate.format(`${TIME}, ${DAY_MONTH} ${YEAR}`);

                    expect(adapter.rangeMiddleDateTime(startDate, endDate)).toBe(
                        `${startString}${DASH}${endString}`
                    );
                });

                it('rangeMiddleDateTime (other month)', () => {
                    const startDate: Moment = moment().month(1);
                    const endDate: Moment = moment(startDate).add(1, 'months');

                    const startString: string = startDate.format(startDateFormat);
                    const endString: string = endDate.format(endDateFormat);

                    expect(adapter.rangeMiddleDateTime(startDate, endDate)).toBe(
                        `${startString}${LONG_DASH}${endString}`
                    );
                });

                it('rangeMiddleDateTime (startDate is other year)', () => {
                    const startDate: Moment = moment().subtract(1, 'years');
                    const endDate: Moment = moment();

                    const startString: string = startDate.format(`${DAY_MONTH} ${YEAR}, ${TIME}`);
                    const endString: string = endDate.format(endDateFormat);

                    expect(adapter.rangeMiddleDateTime(startDate, endDate)).toBe(
                        `${startString}${LONG_DASH}${endString}`
                    );
                });

                it('rangeMiddleDateTime (endDate is other year)', () => {
                    const startDate: Moment = moment().dayOfYear(1);
                    const endDate: Moment = moment(startDate).add(1, 'years');

                    const startString: string = startDate.format(startDateFormat);
                    const endString: string = endDate.format(`${DAY_MONTH} ${YEAR}, ${TIME}`);

                    expect(adapter.rangeMiddleDateTime(startDate, endDate)).toBe(
                        `${startString}${LONG_DASH}${endString}`
                    );
                });
            });
        });
    });

    describe('en', () => {
        beforeEach(() => {
            adapter.setLocale('en');
        });

        const YEAR = 'YYYY';
        const MONTH = 'MMMM';
        const SHORT_MONTH = 'MMM';
        const DAY = 'D';
        const TIME = 'HH:mm';

        const DASH = '\u2013';
        const LONG_DASH = '\u202F\u2013\u2009';

        const NBSP = '\u00A0';
        const DAY_MONTH = `${MONTH}${NBSP}${DAY}`;
        const DAY_SHORT_MONTH = `${SHORT_MONTH}${NBSP}${DAY}`;

        describe('relative formats', () => {
            describe('Relative short (relativeShortDate method)', () => {
                it('secondsAgo', () => {
                    const date = moment().subtract(1, 'seconds');
                    expect(adapter.relativeShortDate(date)).toBe(`1${NBSP}s ago`);
                });

                it('minutesAgo', () => {
                    const date = moment().subtract(1, 'minutes');
                    expect(adapter.relativeShortDate(date)).toBe(`1${NBSP}min ago`);
                });

                it('today', () => {
                    const date = moment().subtract(1, 'hours');
                    expect(adapter.relativeShortDate(date)).toBe(date.format(TIME));
                });

                it('yesterday, more than 24 hours ago', () => {
                    const date = moment().subtract(25, 'hours');
                    expect(adapter.relativeShortDate(date)).toBe(`Yesterday, ${date.format(TIME)}`);
                });

                it('yesterday, less than 24 hours ago', () => {
                    const date = moment().subtract(23, 'hours')
                        .subtract(59, 'minutes')
                        .subtract(59, 'seconds');
                    expect(adapter.relativeShortDate(date)).toBe(`Yesterday, ${date.format(TIME)}`);
                });

                it('before yesterday, more than 48 hours ago', () => {
                    const date = moment().subtract(49, 'hours');
                    expect(adapter.relativeShortDate(date)).toBe(
                        date.format(`${SHORT_MONTH}${NBSP}${DAY}, ${TIME}`)
                    );
                });

                it('before yesterday, less than 48 hours ago', () => {
                    const date = moment().subtract(47, 'hours')
                        .subtract(59, 'minutes')
                        .subtract(59, 'seconds');
                    expect(adapter.relativeShortDate(date)).toBe(
                        date.format(`${SHORT_MONTH}${NBSP}${DAY}, ${TIME}`)
                    );
                });

                it('before yesterday (other year)', () => {
                    const date = moment().year(2015).subtract(49, 'hours');
                    expect(adapter.relativeShortDate(date)).toBe(
                        date.format(`${SHORT_MONTH}${NBSP}${DAY}, ${YEAR}`)
                    );
                });
            });

            describe('Relative long (relativeLongDate method)', () => {
                it('secondsAgo', () => {
                    const date = moment().subtract(1, 'seconds');
                    expect(adapter.relativeLongDate(date)).toBe(`1${NBSP}second ago`);
                });

                it('minutesAgo', () => {
                    const date = moment().subtract(1, 'minutes');
                    expect(adapter.relativeLongDate(date)).toBe(`1${NBSP}minute ago`);
                });

                it('today', () => {
                    const date = moment().subtract(1, 'hours');
                    expect(adapter.relativeLongDate(date)).toBe(date.format(TIME));
                });

                it('yesterday, more than 24 hours ago', () => {
                    const date = moment().subtract(25, 'hours');
                    expect(adapter.relativeLongDate(date)).toBe(`Yesterday, ${date.format(TIME)}`);
                });

                it('yesterday, less than 24 hours ago', () => {
                    const date = moment().subtract(23, 'hours')
                        .subtract(59, 'minutes')
                        .subtract(59, 'seconds');

                    expect(adapter.relativeLongDate(date)).toBe(`Yesterday, ${date.format(TIME)}`);
                });

                it('before yesterday, more than 48 hours ago', () => {
                    const date = moment().subtract(49, 'hours')
                        .subtract(59, 'minutes')
                        .subtract(59, 'seconds');
                    expect(adapter.relativeLongDate(date)).toBe(date.format(`${DAY_MONTH}, ${TIME}`));
                });

                it('before yesterday, less than 48 hours ago', () => {
                    const date = moment().subtract(47, 'hours')
                        .subtract(59, 'minutes')
                        .subtract(59, 'seconds');
                    expect(adapter.relativeLongDate(date)).toBe(date.format(`${DAY_MONTH}, ${TIME}`));
                });

                it('before yesterday (other year)', () => {
                    const date = moment().year(2015).subtract(49, 'hours')
                        .subtract(59, 'minutes')
                        .subtract(59, 'seconds');
                    expect(adapter.relativeLongDate(date)).toBe(date.format(`${DAY_MONTH}, ${YEAR}`));
                });
            });
        });

        describe('absolute formats', () => {
            describe('Absolute short (absoluteShortDate/Time method)', () => {
                it('absoluteShortDate', () => {
                    const date = moment();
                    expect(adapter.absoluteShortDate(date)).toBe(
                        date.format(DAY_SHORT_MONTH)
                    );
                });

                it('absoluteShortDate (other year)', () => {
                    const date = moment().year(2015);
                    expect(adapter.absoluteShortDate(date)).toBe(
                        date.format(`${DAY_SHORT_MONTH}, ${YEAR}`)
                    );
                });

                it('absoluteShortDateTime', () => {
                    const date = moment();
                    expect(adapter.absoluteShortDateTime(date)).toBe(
                        date.format(`${DAY_SHORT_MONTH}, ${TIME}`)
                    );
                });

                it('absoluteShortDateTime (other year)', () => {
                    const date = moment().year(2015);
                    expect(adapter.absoluteShortDateTime(date)).toBe(
                        date.format(`${DAY_SHORT_MONTH}, ${YEAR}, ${TIME}`)
                    );
                });
            });

            describe('Absolute long (absoluteLongDate/Time method)', () => {
                it('absoluteLongDate', () => {
                    const date = moment();
                    expect(adapter.absoluteLongDate(date)).toBe(date.format(`${DAY_MONTH}`));
                });

                it('absoluteLongDate (other year)', () => {
                    const date = moment().year(2015);
                    expect(adapter.absoluteLongDate(date)).toBe(date.format(`${DAY_MONTH}, ${YEAR}`));
                });

                it('absoluteLongDateTime', () => {
                    const date = moment();
                    expect(adapter.absoluteLongDateTime(date)).toBe(date.format(`${DAY_MONTH}, ${TIME}`));
                });

                it('absoluteLongDateTime (other year)', () => {
                    const date = moment().year(2015);
                    expect(adapter.absoluteLongDateTime(date)).toBe(
                        date.format(`${DAY_MONTH}, ${YEAR}, ${TIME}`)
                    );
                });
            });
        });

        describe('range formats', () => {
            let startDateFormat: any;
            let endDateFormat: any;

            describe('Range short (rangeShortDate method)', () => {
                beforeEach(() => {
                    endDateFormat = DAY_SHORT_MONTH;
                    startDateFormat = endDateFormat;
                });

                it('rangeShortDate', () => {
                    const startDate: Moment = moment().dayOfYear(1);
                    const endDate: Moment = moment(startDate).add(10, 'days');

                    const startString: string = startDate.format(startDateFormat);
                    const endString: string = endDate.format(`${DAY}`);

                    expect(adapter.rangeShortDate(startDate, endDate)).toBe(
                        `${startString}${DASH}${endString}`
                    );
                });

                it('rangeShortDate (other month)', () => {
                    const startDate: Moment = moment().month(1);
                    const endDate: Moment = moment(startDate).add(1, 'months');

                    const startString: string = startDate.format(startDateFormat);
                    const endString: string = endDate.format(endDateFormat);

                    expect(adapter.rangeShortDate(startDate, endDate)).toBe(
                        `${startString}${LONG_DASH}${endString}`
                    );
                });

                it('rangeShortDate (startDate is other year)', () => {
                    const startDate: Moment = moment().subtract(1, 'years');
                    const endDate: Moment = moment();

                    const startString: string = startDate.format(`${startDateFormat}, ${YEAR}`);
                    const endString: string = endDate.format(endDateFormat);

                    expect(adapter.rangeShortDate(startDate, endDate)).toBe(
                        `${startString}${LONG_DASH}${endString}`
                    );
                });

                it('rangeShortDate (endDate is other year)', () => {
                    const startDate: Moment = moment();
                    const endDate: Moment = moment(startDate).add(1, 'years');

                    const startString: string = startDate.format(startDateFormat);
                    const endString: string = endDate.format(`${endDateFormat}, ${YEAR}`);

                    expect(adapter.rangeShortDate(startDate, endDate)).toBe(
                        `${startString}${LONG_DASH}${endString}`
                    );
                });
            });

            describe('Range short (rangeShortDateTime method)', () => {
                beforeEach(() => {
                    startDateFormat = `${DAY_SHORT_MONTH}, ${TIME}`;
                    endDateFormat = startDateFormat;
                });

                it('rangeShortDateTime', () => {
                    const startDate: Moment = moment().dayOfYear(1);
                    const endDate: Moment = moment(startDate).add(10, 'days');

                    const startString: string = startDate.format(startDateFormat);
                    const endString: string = endDate.format(endDateFormat);

                    expect(adapter.rangeShortDateTime(startDate, endDate)).toBe(
                        `${startString}${LONG_DASH}${endString}`
                    );
                });

                it('rangeShortDateTime (same day)', () => {
                    const startDate: Moment = moment().dayOfYear(1);
                    const endDate: Moment = moment(startDate).add(10, 'minutes');

                    const startString = startDate.format(`${TIME}`);
                    const endString = endDate.format(`${TIME}, ${DAY_SHORT_MONTH}`);

                    expect(adapter.rangeShortDateTime(startDate, endDate)).toBe(
                        `${startString}${DASH}${endString}`
                    );
                });

                it('rangeShortDateTime (same day, other year)', () => {
                    const startDate: Moment = moment().subtract(1, 'years');
                    const endDate: Moment = moment(startDate).add(10, 'minutes');

                    const startString: string = startDate.format(`${TIME}`);
                    const endString: string = endDate.format(`${TIME}, ${DAY_SHORT_MONTH}, ${YEAR}`);

                    expect(adapter.rangeShortDateTime(startDate, endDate)).toBe(
                        `${startString}${DASH}${endString}`
                    );
                });

                it('rangeShortDateTime (other month)', () => {
                    const startDate: Moment = moment().month(1);
                    const endDate: Moment = moment(startDate).add(1, 'months');

                    const startString: string = startDate.format(startDateFormat);
                    const endString: string = endDate.format(endDateFormat);

                    expect(adapter.rangeShortDateTime(startDate, endDate)).toBe(
                        `${startString}${LONG_DASH}${endString}`
                    );
                });

                it('rangeShortDateTime (startDate is other year)', () => {
                    const startDate: Moment = moment().subtract(1, 'years');
                    const endDate: Moment = moment();

                    const startString: string = startDate.format(`${DAY_SHORT_MONTH}, ${YEAR}, ${TIME}`);
                    const endString: string = endDate.format(endDateFormat);

                    expect(adapter.rangeShortDateTime(startDate, endDate)).toBe(
                        `${startString}${LONG_DASH}${endString}`
                    );
                });

                it('rangeShortDateTime (endDate is other year)', () => {
                    const startDate: Moment = moment();
                    const endDate: Moment = moment(startDate).add(1, 'years');

                    const startString: string = startDate.format(startDateFormat);
                    const endString: string = endDate.format(`${DAY_SHORT_MONTH}, ${YEAR}, ${TIME}`);

                    expect(adapter.rangeShortDateTime(startDate, endDate)).toBe(
                        `${startString}${LONG_DASH}${endString}`
                    );
                });
            });

            describe('Range long (rangeLongDate method)', () => {
                beforeEach(() => {
                    startDateFormat = DAY_MONTH;
                    endDateFormat = startDateFormat;
                });

                it('rangeLongDate', () => {
                    const startDate: Moment = moment().dayOfYear(1);
                    const endDate: Moment = moment(startDate).add(10, 'days');

                    const startString: string = startDate.format(startDateFormat);
                    const endString: string = endDate.format(DAY);

                    expect(adapter.rangeLongDate(startDate, endDate)).toBe(
                        `${startString}${DASH}${endString}`
                    );
                });

                it('rangeLongDate (other month)', () => {
                    const startDate: Moment = moment().month(1);
                    const endDate: Moment = moment(startDate).add(1, 'months');

                    const startString: string = startDate.format(startDateFormat);
                    const endString: string = endDate.format(`${endDateFormat}`);

                    expect(adapter.rangeLongDate(startDate, endDate)).toBe(
                        `${startString}${LONG_DASH}${endString}`
                    );
                });

                it('rangeLongDate (startDate is other year)', () => {
                    const startDate: Moment = moment().subtract(1, 'years');
                    const endDate: Moment = moment();

                    const startString: string = startDate.format(`${startDateFormat}, ${YEAR}`);
                    const endString: string = endDate.format(`${endDateFormat}`);

                    expect(adapter.rangeLongDate(startDate, endDate)).toBe(
                        `${startString}${LONG_DASH}${endString}`
                    );
                });

                it('rangeLongDate (endDate is other year)', () => {
                    const startDate: Moment = moment().dayOfYear(1);
                    const endDate: Moment = moment(startDate).add(1, 'years');

                    const startString: string = startDate.format(`${startDateFormat}`);
                    const endString: string = endDate.format(`${endDateFormat}, ${YEAR}`);

                    expect(adapter.rangeLongDate(startDate, endDate)).toBe(
                        `${startString}${LONG_DASH}${endString}`
                    );
                });
            });

            describe('Range long (rangeLongDateTime method)', () => {
                beforeEach(() => {
                    startDateFormat = `${DAY_MONTH}, ${TIME}`;
                    endDateFormat = startDateFormat;
                });

                it('rangeLongDateTime', () => {
                    const startDate: Moment = moment().dayOfYear(1);
                    const endDate: Moment = moment(startDate).add(10, 'days');

                    const startString: string = startDate.format(startDateFormat);
                    const endString: string = endDate.format(endDateFormat);

                    expect(adapter.rangeLongDateTime(startDate, endDate)).toBe(
                        `From ${startString} to${NBSP}${endString}`
                    );
                });

                it('rangeLongDateTime (same day)', () => {
                    const startDate: Moment = moment().dayOfYear(1);
                    const endDate: Moment = moment(startDate).add(10, 'minutes');

                    const startString: string = startDate.format(`${DAY_MONTH}, [from]${NBSP}${TIME}`);
                    const endString: string = endDate.format(`to${NBSP}${TIME}`);

                    expect(adapter.rangeLongDateTime(startDate, endDate)).toBe(
                        `${startString} ${endString}`
                    );
                });

                it('rangeLongDateTime (same day, other year)', () => {
                    const startDate: Moment = moment().subtract(1, 'years');
                    const endDate: Moment = moment(startDate).add(10, 'minutes');

                    const startString: string = startDate.format(`${DAY_MONTH}, ${YEAR}, [from]${NBSP}${TIME}`);
                    const endString: string = endDate.format(`to${NBSP}${TIME}`);

                    expect(adapter.rangeLongDateTime(startDate, endDate)).toBe(
                        `${startString} ${endString}`
                    );
                });

                it('rangeLongDateTime (other month)', () => {
                    const startDate: Moment = moment().month(1);
                    const endDate: Moment = moment(startDate).add(1, 'months');

                    const startString: string = startDate.format(startDateFormat);
                    const endString: string = endDate.format(endDateFormat);

                    expect(adapter.rangeLongDateTime(startDate, endDate)).toBe(
                        `From ${startString} to${NBSP}${endString}`
                    );
                });

                it('rangeLongDateTime (startDate is other year)', () => {
                    const startDate: Moment = moment().subtract(1, 'years');
                    const endDate: Moment = moment();

                    const startString: string = startDate.format(`${DAY_MONTH}, ${YEAR}, ${TIME}`);
                    const endString: string = endDate.format(endDateFormat);

                    expect(adapter.rangeLongDateTime(startDate, endDate)).toBe(
                        `From ${startString} to${NBSP}${endString}`
                    );
                });

                it('rangeLongDateTime (endDate is other year)', () => {
                    const startDate: Moment = moment().dayOfYear(1);
                    const endDate: Moment = moment(startDate).add(1, 'years');

                    const startString: string = startDate.format(startDateFormat);
                    const endString: string = endDate.format(`${DAY_MONTH}, ${YEAR}, ${TIME}`);

                    expect(adapter.rangeLongDateTime(startDate, endDate)).toBe(
                        `From ${startString} to${NBSP}${endString}`
                    );
                });
            });

            describe('Range middle (rangeMiddleDateTime method)', () => {
                beforeEach(() => {
                    startDateFormat = `${DAY_MONTH}, ${TIME}`;
                    endDateFormat = startDateFormat;
                });

                it('rangeMiddleDateTime', () => {
                    const startDate: Moment = moment().dayOfYear(1);
                    const endDate: Moment = moment(startDate).add(10, 'days');

                    const startString: string = startDate.format(startDateFormat);
                    const endString: string = endDate.format(endDateFormat);

                    expect(adapter.rangeMiddleDateTime(startDate, endDate)).toBe(
                        `${startString}${LONG_DASH}${endString}`
                    );
                });

                it('rangeMiddleDateTime (same day)', () => {
                    const startDate: Moment = moment().dayOfYear(1);
                    const endDate: Moment = moment(startDate).add(10, 'minutes');

                    const startString: string = startDate.format(`${TIME}`);
                    const endString: string = endDate.format(`${TIME}, ${DAY_MONTH}`);

                    expect(adapter.rangeMiddleDateTime(startDate, endDate)).toBe(
                        `${startString}${DASH}${endString}`
                    );
                });

                it('rangeMiddleDateTime (same day, other year)', () => {
                    const startDate: Moment = moment().subtract(1, 'years');
                    const endDate: Moment = moment(startDate).add(10, 'minutes');

                    const startString: string = startDate.format(`${TIME}`);
                    const endString: string = endDate.format(`${TIME}, ${DAY_MONTH}, ${YEAR}`);

                    expect(adapter.rangeMiddleDateTime(startDate, endDate)).toBe(
                        `${startString}${DASH}${endString}`
                    );
                });

                it('rangeMiddleDateTime (other month)', () => {
                    const startDate: Moment = moment().month(1);
                    const endDate: Moment = moment(startDate).add(1, 'months');

                    const startString: string = startDate.format(startDateFormat);
                    const endString: string = endDate.format(endDateFormat);

                    expect(adapter.rangeMiddleDateTime(startDate, endDate)).toBe(
                        `${startString}${LONG_DASH}${endString}`
                    );
                });

                it('rangeMiddleDateTime (startDate is other year)', () => {
                    const startDate = moment().subtract(1, 'years');
                    const endDate = moment();

                    const startString = startDate.format(`${DAY_MONTH}, ${YEAR}, ${TIME}`);
                    const endString = endDate.format(endDateFormat);

                    expect(adapter.rangeMiddleDateTime(startDate, endDate)).toBe(
                        `${startString}${LONG_DASH}${endString}`
                    );
                });

                it('rangeMiddleDateTime (endDate is other year)', () => {
                    const startDate = moment().dayOfYear(1);
                    const endDate = moment(startDate).add(1, 'years');

                    const startString = startDate.format(startDateFormat);
                    const endString = endDate.format(`${DAY_MONTH}, ${YEAR}, ${TIME}`);

                    expect(adapter.rangeMiddleDateTime(startDate, endDate)).toBe(
                        `${startString}${LONG_DASH}${endString}`
                    );
                });
            });
        });
    });
});
