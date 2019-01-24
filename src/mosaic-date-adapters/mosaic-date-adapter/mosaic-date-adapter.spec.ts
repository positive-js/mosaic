// tslint:disable:no-magic-numbers
import { LOCALE_ID } from '@angular/core';
import { async, inject, TestBed } from '@angular/core/testing';
import { DateAdapter, MC_DATE_LOCALE } from '@ptsecurity/cdk/datetime';
import { Platform } from '@ptsecurity/cdk/platform';

import { MosaicDateAdapter } from './mosaic-date-adapter';
import { McMosaicDateModule } from './mosaic-date-adapter-module';


describe('MosaicDateAdapter', () => {
    let adapter: MosaicDateAdapter;
    let assertValidDate: (d: Date | null, valid: boolean) => void;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [McMosaicDateModule]
        }).compileComponents();
    }));

    beforeEach(inject([DateAdapter, Platform],
        (dateAdapter: MosaicDateAdapter) => {
            adapter = dateAdapter;

            assertValidDate = (d: Date | null, valid: boolean) => {
                expect(adapter.isDateInstance(d)).not.toBeNull(`Expected ${d} to be a date instance`);
                expect(adapter.isValid(d!)).toBe(valid,
                    `Expected ${d} to be ${valid ? 'valid' : 'invalid'},` +
                    ` but was ${valid ? 'invalid' : 'valid'}`);
            };
        }));

    it('should get year', () => {
        expect(adapter.getYear(new Date(2019, 0, 1))).toBe(2019);
    });

    it('should get month', () => {
        expect(adapter.getMonth(new Date(2019, 0, 1))).toBe(0);
    });

    it('should get date', () => {
        expect(adapter.getDate(new Date(2019, 0, 1))).toBe(1);
    });

    it('should get day of week', () => {
        expect(adapter.getDayOfWeek(new Date(2019, 0, 1))).toBe(2);
    });

    it('should get long month names ru-RU', () => {
        adapter.setLocale('ru-RU');

        expect(adapter.getMonthNames('long')).toEqual([
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь',
            'Октябрь', 'Ноябрь', 'Декабрь'
        ]);
    });

    it('should get long month names en-US', () => {
        adapter.setLocale('en-US');

        expect(adapter.getMonthNames('long')).toEqual([
            'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
            'October', 'November', 'December'
        ]);
    });

    it('should get long month names ru-RU', () => {
        adapter.setLocale('ru-RU');

        expect(adapter.getMonthNames('short')).toEqual([
            'янв', 'фев', 'март', 'апр', 'май', 'июнь', 'июль', 'авг', 'сен', 'окт', 'ноя', 'дек'
        ]);
    });

    it('should get long month names en-US', () => {
        adapter.setLocale('en-US');

        expect(adapter.getMonthNames('short')).toEqual([
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ]);
    });

    it('should get narrow month names ru-RU', () => {
        adapter.setLocale('ru-RU');

        expect(adapter.getMonthNames('narrow')).toEqual([
            'Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'
        ]);
    });

    it('should get narrow month names en-US', () => {
        adapter.setLocale('en-US');

        expect(adapter.getMonthNames('narrow')).toEqual([
            'J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'
        ]);
    });

    it('should get month names in a different locale', () => {
        adapter.setLocale('ru-RU');

        expect(adapter.getMonthNames('long')).toEqual([
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль',
            'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ]);
    });

    it('should get date names', () => {
        expect(adapter.getDateNames()).toEqual([
            '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17',
            '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'
        ]);
    });

    it('should get date names in a different locale', () => {
        adapter.setLocale('ru-RU');

        expect(adapter.getDateNames()).toEqual([
            '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17',
            '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'
        ]);
    });

    it('should get long day of week names for ru-RU', () => {
        adapter.setLocale('ru-RU');

        expect(adapter.getDayOfWeekNames('long')).toEqual([
            'Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'
        ]);
    });

    it('should get long day of week names for en-US', () => {
        adapter.setLocale('en-US');

        expect(adapter.getDayOfWeekNames('long')).toEqual([
            'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
        ]);
    });

    it('should get short day of week names', () => {
        expect(adapter.getDayOfWeekNames('short')).toEqual([
            'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
        ]);
    });

    it('should get narrow day of week names', () => {
        expect(adapter.getDayOfWeekNames('narrow')).toEqual([
            'S', 'M', 'T', 'W', 'T', 'F', 'S'
        ]);
    });

    it('should get day of week names in a different locale', () => {
        adapter.setLocale('ru-RU');

        expect(adapter.getDayOfWeekNames('long')).toEqual([
            'Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'
        ]);
    });

    it('should get year name', () => {
        expect(adapter.getYearName(new Date(2019, 0, 1))).toBe('2019');
    });

    it('should get year name in a different locale', () => {
        adapter.setLocale('ru-RU');
        expect(adapter.getYearName(new Date(2019, 0, 1))).toBe('2019');
    });

    it('should get first day of week for en-US', () => {
        adapter.setLocale('en-US');
        expect(adapter.getFirstDayOfWeek()).toBe(0);
    });

    it('should get first day of week for ru-RU', () => {
        adapter.setLocale('ru-RU');
        expect(adapter.getFirstDayOfWeek()).toBe(1);
    });

    it('should create Date', () => {
        expect(adapter.createDate(2019, 0, 1)).toEqual(new Date(2019, 0, 1));
    });

    it('should not create Date with month over/under-flow', () => {
        expect(() => adapter.createDate(2019, 11 + 1, 1)).toThrow();
        expect(() => adapter.createDate(2019, 0 - 1, 1)).toThrow();
    });

    it('should not create Date with date over/under-flow', () => {
        expect(() => adapter.createDate(2019, 0, 32)).toThrow();
        expect(() => adapter.createDate(2019, 0, 0)).toThrow();
    });

    it('should create Date with low year number', () => {
        expect(adapter.createDate(-1, 0, 1).getFullYear()).toBe(-1);
        expect(adapter.createDate(0, 0, 1).getFullYear()).toBe(0);
        expect(adapter.createDate(50, 0, 1).getFullYear()).toBe(50);
        expect(adapter.createDate(99, 0, 1).getFullYear()).toBe(99);
        expect(adapter.createDate(100, 0, 1).getFullYear()).toBe(100);
    });

    it('should get today\'s date', () => {
        expect(adapter.sameDate(adapter.today(), new Date()))
            .toBe(true, 'should be equal to today\'s date');
    });

    it('should parse string', () => {
        expect(adapter.parse('1/1/2019', 'l')).toEqual(new Date(2019, 0, 1));
    });

    it('should parse number', () => {
        const timestamp = new Date().getTime();
        expect(adapter.parse(timestamp, 'l')).toEqual(new Date(timestamp));
    });

    it('should parse Date', () => {
        const date = new Date(2019, 0, 1);
        expect(adapter.parse(date, 'l')).toEqual(date);
        expect(adapter.parse(date, 'l')).not.toBe(date);
    });

    it('should parse invalid value as invalid', () => {
        const d = adapter.parse('hello', 'l');
        expect(d).not.toBeNull();
        expect(adapter.isDateInstance(d))
            .toBe(true, 'Expected string to have been fed through Date.parse');
        expect(adapter.isValid(d as Date))
            .toBe(false, 'Expected to parse as \'invalid date\' object');
    });

    it('should format with custom format', () => {
        expect(adapter.format(new Date(2019, 0, 2), 'MM-YYYY-DD')).toEqual('01-2019-02');
    });

    it('should throw when attempting to format invalid date', () => {
        expect(() => adapter.format(new Date(NaN), ''))
            .toThrowError(/MosaicDateAdapter: Cannot format invalid date\./);
    });

    it('should add years', () => {
        expect(adapter.addCalendarYears(new Date(2019, 0, 1), 1)).toEqual(new Date(2020, 0, 1));
        expect(adapter.addCalendarYears(new Date(2019, 0, 1), -1)).toEqual(new Date(2018, 0, 1));
    });

    it('should respect leap years when adding years', () => {
        expect(adapter.addCalendarYears(new Date(2016, 1, 29), 1)).toEqual(new Date(2017, 1, 28));
        expect(adapter.addCalendarYears(new Date(2016, 1, 29), -1)).toEqual(new Date(2015, 1, 28));
    });

    it('should add months', () => {
        expect(adapter.addCalendarMonths(new Date(2019, 0, 1), 1)).toEqual(new Date(2019, 1, 1));
        expect(adapter.addCalendarMonths(new Date(2019, 0, 1), -1)).toEqual(new Date(2018, 11, 1));
    });

    it('should respect month length differences when adding months', () => {
        expect(adapter.addCalendarMonths(new Date(2019, 0, 31), 1)).toEqual(new Date(2019, 1, 28));
        expect(adapter.addCalendarMonths(new Date(2019, 2, 31), -1)).toEqual(new Date(2019, 1, 28));
    });

    it('should add days', () => {
        expect(adapter.addCalendarDays(new Date(2019, 0, 1), 1)).toEqual(new Date(2019, 0, 2));
        expect(adapter.addCalendarDays(new Date(2019, 0, 1), -1)).toEqual(new Date(2018, 11, 31));
    });

    it('should clone', () => {
        const date = new Date(2019, 0, 1);
        expect(adapter.clone(date)).toEqual(date);
        expect(adapter.clone(date)).not.toBe(date);
    });

    it('should preserve time when cloning', () => {
        const date = new Date(2019, 0, 1, 4, 5, 6);
        expect(adapter.clone(date)).toEqual(date);
        expect(adapter.clone(date)).not.toBe(date);
    });

    it('should compare dates', () => {
        expect(adapter.compareDate(new Date(2018, 0, 1), new Date(2018, 0, 2))).toBeLessThan(0);
        expect(adapter.compareDate(new Date(2018, 0, 1), new Date(2018, 1, 1))).toBeLessThan(0);
        expect(adapter.compareDate(new Date(2018, 0, 1), new Date(2019, 0, 1))).toBeLessThan(0);
        expect(adapter.compareDate(new Date(2018, 0, 1), new Date(2018, 0, 1))).toBe(0);
        expect(adapter.compareDate(new Date(2019, 0, 1), new Date(2018, 0, 1))).toBeGreaterThan(0);
        expect(adapter.compareDate(new Date(2018, 1, 1), new Date(2018, 0, 1))).toBeGreaterThan(0);
        expect(adapter.compareDate(new Date(2018, 0, 2), new Date(2018, 0, 1))).toBeGreaterThan(0);
    });

    it('should clamp date at lower bound', () => {
        expect(adapter.clampDate(
            new Date(2019, 0, 1), new Date(2018, 0, 1), new Date(2018, 0, 1)))
            .toEqual(new Date(2018, 0, 1));
    });

    it('should clamp date at upper bound', () => {
        expect(adapter.clampDate(
            new Date(2020, 0, 1), new Date(2018, 0, 1), new Date(2019, 0, 1)))
            .toEqual(new Date(2019, 0, 1));
    });

    it('should clamp date already within bounds', () => {
        expect(adapter.clampDate(
            new Date(2018, 1, 1), new Date(2018, 0, 1), new Date(2019, 0, 1)))
            .toEqual(new Date(2018, 1, 1));
    });

    it('should use UTC for formatting by default', () => {
        expect(adapter.format(new Date(1800, 7, 14), 'DD.MM.YYYY')).toBe('14.08.1800');
    });

    it('should count today as a valid date instance', () => {
        const d = new Date();
        expect(adapter.isValid(d)).toBe(true);
        expect(adapter.isDateInstance(d)).toBe(true);
    });

    it('should count an invalid date as an invalid date instance', () => {
        const d = new Date(NaN);
        expect(adapter.isValid(d)).toBe(false);
        expect(adapter.isDateInstance(d)).toBe(true);
    });

    it('should count a string as not a date instance', () => {
        const d = '1/1/2019';
        expect(adapter.isDateInstance(d)).toBe(false);
    });

    it('should create dates from valid ISO strings', () => {
        assertValidDate(adapter.deserialize('1985-04-12T23:20:50.52Z'), true);
        assertValidDate(adapter.deserialize('1996-12-19T16:39:57-08:00'), true);
        assertValidDate(adapter.deserialize('1937-01-01T12:00:27.87+00:20'), true);
        assertValidDate(adapter.deserialize('2019-01-01'), true);
        assertValidDate(adapter.deserialize('2019-01-01T00:00:00'), true);
        assertValidDate(adapter.deserialize('1990-13-31T23:59:00Z'), false);
        assertValidDate(adapter.deserialize('1/1/2019'), false);
        assertValidDate(adapter.deserialize('2019-01-01T'), false);
        expect(adapter.deserialize('')).toBeNull();
        expect(adapter.deserialize(null)).toBeNull();
        assertValidDate(adapter.deserialize(new Date()), true);
        assertValidDate(adapter.deserialize(new Date(NaN)), false);
    });

    it('should create an invalid date', () => {
        assertValidDate(adapter.invalid(), false);
    });

    it('should not throw when attempting to format a date with a year less than 1', () => {
        expect(() => adapter.format(new Date(-1, 1, 1), '')).not.toThrow();
    });

    it('should not throw when attempting to format a date with a year greater than 9999', () => {
        expect(() => adapter.format(new Date(10000, 1, 1), '')).not.toThrow();
    });
});


describe('MosaicDateAdapter with MC_DATE_LOCALE override', () => {
    let adapter: MosaicDateAdapter;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [McMosaicDateModule],
            providers: [{ provide: MC_DATE_LOCALE, useValue: 'en-US' }]
        }).compileComponents();
    }));

    beforeEach(inject([DateAdapter], (d: MosaicDateAdapter) => {
        adapter = d;
    }));

    it('should take the default locale id from the MC_DATE_LOCALE injection token', () => {
        expect(adapter.getDayOfWeekNames('long')).toEqual(
            ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
    });

});

describe('MosaicDateAdapter with not exists MC_DATE_LOCALE override', () => {
    let adapter: MosaicDateAdapter;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [McMosaicDateModule]
        }).compileComponents();
    }));

    beforeEach(inject([DateAdapter], (d: MosaicDateAdapter) => {
        adapter = d;
    }));

    it('should throw an error', () => {
        adapter.setLocale('dk-DN');
        expect(() => adapter.getDayOfWeekNames('long')).toThrow();
    });
});

describe('MosaicDateAdapter with LOCALE_ID override', () => {
    let adapter: MosaicDateAdapter;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [McMosaicDateModule],
            providers: [{ provide: LOCALE_ID, useValue: 'ru-RU' }]
        }).compileComponents();
    }));

    beforeEach(inject([DateAdapter], (d: MosaicDateAdapter) => {
        adapter = d;
    }));

    it('should cascade locale id from the LOCALE_ID injection token to MC_DATE_LOCALE', () => {
        expect(adapter.getDayOfWeekNames('long')).toEqual([
            'Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']);
    });
});
