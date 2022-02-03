// tslint:disable:no-magic-numbers
// tslint:disable:mocha-no-side-effect-code
// tslint:disable:no-import-side-effect
import '@angular/common/locales/global/ar-AE';
import '@angular/common/locales/global/fr';
import '@angular/common/locales/global/ja';
import '@angular/common/locales/global/ru';
import { LOCALE_ID } from '@angular/core';
import { inject, TestBed, waitForAsync } from '@angular/core/testing';
import { DateAdapter, MC_DATE_LOCALE } from '@ptsecurity/cdk/datetime';
import { DateTime } from 'luxon';

import { LuxonDateAdapter, MC_LUXON_DATE_ADAPTER_OPTIONS } from './date-adapter';
import { LuxonDateModule } from './index';


describe('LuxonDateAdapter', () => {
    let adapter: DateAdapter<DateTime>;
    let assertValidDate: (d: DateTime | null, valid: boolean) => void;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({ imports: [LuxonDateModule] }).compileComponents();
    }));

    beforeEach(inject([DateAdapter], (dateAdapter: LuxonDateAdapter) => {
        adapter = dateAdapter;
        adapter.setLocale('en');

        assertValidDate = (d: DateTime | null, valid: boolean) => {
            expect(adapter.isDateInstance(d))
                .not.toBeNull(`Expected ${d} to be a date instance`);

            const state = valid ? 'valid' : 'invalid';

            expect(adapter.isValid(d!))
                .toBe(valid, `Expected ${d} to be ${state}, but was ${state}`);
        };
    }));

    it('should get year', () => {
        expect(adapter.getYear(DateTime.local(2017,  1,  1)))
            .toBe(2017);
    });

    it('should get month', () => {
        expect(adapter.getMonth(DateTime.local(2017,  1,  1)))
            .toBe(0);
    });

    it('should get date', () => {
        expect(adapter.getDate(DateTime.local(2017,  1,  1)))
            .toBe(1);
    });

    it('should get day of week', () => {
        expect(adapter.getDayOfWeek(DateTime.local(2017,  1,  1)))
            .toBe(0);
    });

    it('should get same day of week in a locale with a different first day of the week', () => {
        adapter.setLocale('fr');
        expect(adapter.getDayOfWeek(DateTime.local(2017,  1,  1)))
            .toBe(0);
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

        expect(adapter.getMonthNames('short'))
            .toEqual(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
    });

    it('should get date names', () => {
        expect(adapter.getDateNames()).toEqual([
            '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17',
            '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'
        ]);
    });

    // TODO: Failing – CircleCI
    xit('should get date names in a different locale', () => {
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

        expect(adapter.getDayOfWeekNames('long'))
            .toEqual(['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']);
    });

    it('should get day of week names for en', () => {
        adapter.setLocale('en');

        expect(adapter.getDayOfWeekNames('long'))
            .toEqual(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);

        expect(adapter.getDayOfWeekNames('short'))
            .toEqual(['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']);

        expect(adapter.getDayOfWeekNames('narrow'))
            .toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
    });

    it('should get day of week names in a different locale', () => {
        adapter.setLocale('ja-JP');

        expect(adapter.getDayOfWeekNames('long'))
            .toEqual(['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日']);
    });

    it('should get day of week names in a different locale', () => {
        adapter.setLocale('ru');

        expect(adapter.getDayOfWeekNames('long'))
            .toEqual(['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']);

        expect(adapter.getDayOfWeekNames('short'))
            .toEqual(['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']);

        expect(adapter.getDayOfWeekNames('narrow'))
            .toEqual(['В', 'П', 'В', 'С', 'Ч', 'П', 'С']);
    });

    it('should get year name', () => {
        expect(adapter.getYearName(adapter.createDate(2017)))
            .toBe('2017');
    });

    // TODO: Failing – CircleCI
    xit('should get year name in a different locale', () => {
        adapter.setLocale('ar-AE');

        expect(adapter.getYearName(adapter.createDate(2017)))
            .toBe('٢٠١٧');
    });

    it('should get first day of week in a different locale', () => {
        adapter.setLocale('fr');

        expect(adapter.getFirstDayOfWeek())
            .toBe(1);
    });

    it('should get first day of week for ru', () => {
        adapter.setLocale('ru');

        expect(adapter.getFirstDayOfWeek())
            .toBe(1);
    });

    it('should create DateTime date', () => {
        expect(adapter.createDate(2017).toString())
            .toEqual(DateTime.local(2017, 1, 1).toString());
    });

    it('should not create DateTime date with month over/under-flow', () => {
        expect(() => adapter.createDate(2017, 12 + 1)).toThrow();
        expect(() => adapter.createDate(2017, -1)).toThrow();
    });

    it('should not create DateTime date with date over/under-flow', () => {
        expect(() => adapter.createDate(2017, 1, 0)).toThrow();
    });

    it('should create invalid DateTime date with date over/under-flow', () => {
        expect(adapter.isValid(adapter.createDate(2017, 1, 30))).toBe(false);
        expect(adapter.isValid(adapter.createDate(2017, 8, 31))).toBe(false);
    });

    it('should create DateTime date with low year number', () => {
        expect(adapter.createDate(-1).year).toBe(-1);
        expect(adapter.createDate(0).year).toBe(0);
        expect(adapter.createDate(50).year).toBe(50);
        expect(adapter.createDate(99).year).toBe(99);
        expect(adapter.createDate(100).year).toBe(100);
    });

    it('should not create DateTime date in utc format', () => {
        expect(adapter.createDate(2017).zone.universal)
            .toBe(false);
    });

    it('should get today\'s date', () => {
        expect(adapter.sameDate(adapter.today(), DateTime.now()))
            .toBe(true, 'should be equal to today\'s date');
    });

    it('should parse string according to given format', () => {
        expect(adapter.parse('1/2/2017', 'L/d/yyyy')!.toString())
            .toEqual(adapter.createDate(2017,  0,  2).toString());

        expect(adapter.parse('1/2/2017', 'd/L/yyyy')!.toString())
            .toEqual(adapter.createDate(2017,  1,  1).toString());
    });

    it('should parse number', () => {
        const timestamp = new Date().getTime();

        expect(adapter.parse(timestamp, '')!.toString())
            .toEqual(DateTime.fromMillis(timestamp).toString());
    });

    it('should parse invalid value as invalid', () => {
        const d = adapter.parse('hello', 'L/d/yyyy');

        expect(d).not.toBeNull();
        expect(adapter.isDateInstance(d))
            .toBe(true, 'Expected string to have been fed through Date.parse');
        expect(adapter.isValid(d as DateTime))
            .toBe(false, 'Expected to parse as "invalid date" object');
    });

    it('should format date according to given format', () => {
        expect(adapter.format(DateTime.local(2017,  1,  2), 'LL/dd/yyyy'))
            .toEqual('01/02/2017');
        expect(adapter.format(DateTime.local(2017,  1,  2), 'dd/LL/yyyy'))
            .toEqual('02/01/2017');
    });

    it('should throw when attempting to format invalid date', () => {
        expect(() => adapter.format(DateTime.local(2001, 0, 0), 'L/d/yyyy'))
            .toThrowError('DateTime: Cannot format invalid date.');
    });

    it('should add years', () => {
        expect(adapter.addCalendarYears(DateTime.local(2017, 1, 1), 1).toString())
            .toEqual(DateTime.local(2018, 1, 1).toString());
        expect(adapter.addCalendarYears(DateTime.local(2017, 1, 1), -1).toString())
            .toEqual(DateTime.local(2016, 1, 1).toString());
    });

    it('should respect leap years when adding years', () => {
        expect(adapter.addCalendarYears(DateTime.local(2016, 2, 29), 1).toString())
            .toEqual(DateTime.local(2017, 2, 28).toString());
        expect(adapter.addCalendarYears(DateTime.local(2016, 2, 29), -1).toString())
            .toEqual(DateTime.local(2015, 2, 28).toString());
    });

    it('should add months', () => {
        expect(adapter.addCalendarMonths(DateTime.local(2017, 1, 1), 1).toString())
            .toEqual(DateTime.local(2017, 2, 1).toString());
        expect(adapter.addCalendarMonths(DateTime.local(2017, 1, 1), -1).toString())
            .toEqual(DateTime.local(2016, 12, 1).toString());
    });

    it('should respect month length differences when adding months', () => {
        expect(adapter.addCalendarMonths(DateTime.local(2017, 1, 31), 1).toString())
            .toEqual(DateTime.local(2017, 2, 28).toString());
        expect(adapter.addCalendarMonths(DateTime.local(2017, 3, 31), -1).toString())
            .toEqual(DateTime.local(2017, 2, 28).toString());
    });

    it('should add days', () => {
        expect(adapter.addCalendarDays(DateTime.local(2017, 1, 1), 1).toString())
            .toEqual(DateTime.local(2017, 1, 2).toString());
        expect(adapter.addCalendarDays(DateTime.local(2017, 1, 1), -1).toString())
            .toEqual(DateTime.local(2016, 12, 31).toString());
    });

    it('should clone', () => {
        const date = DateTime.local(2017, 1, 1);

        expect(adapter.clone(date).toString()).toEqual(date.toString());
        expect(adapter.clone(date)).not.toBe(date);
    });

    it('should compare dates', () => {
        expect(adapter.compareDate(adapter.createDate(2017), adapter.createDate(2017, 1, 2))).toBeLessThan(0);
        expect(adapter.compareDate(adapter.createDate(2017), adapter.createDate(2017, 2, 1))).toBeLessThan(0);
        expect(adapter.compareDate(adapter.createDate(2017), adapter.createDate(2018))).toBeLessThan(0);
        expect(adapter.compareDate(adapter.createDate(2017), adapter.createDate(2017))).toBe(0);
        expect(adapter.compareDate(adapter.createDate(2018), adapter.createDate(2017))).toBeGreaterThan(0);
        expect(adapter.compareDate(adapter.createDate(2017, 2, 1), adapter.createDate(2017))).toBeGreaterThan(0);
        expect(adapter.compareDate(adapter.createDate(2017, 1, 2), adapter.createDate(2017))).toBeGreaterThan(0);
    });

    it('should clamp date at lower bound', () => {
        expect(adapter.clampDate(
            adapter.createDate(2017),
            adapter.createDate(2018),
            adapter.createDate(2019))
        ).toEqual(adapter.createDate(2018));
    });

    it('should clamp date at upper bound', () => {
        expect(adapter.clampDate(
            adapter.createDate(2020),
            adapter.createDate(2018),
            adapter.createDate(2019))
        ).toEqual(adapter.createDate(2019));
    });

    it('should clamp date already within bounds', () => {
        expect(adapter.clampDate(
            adapter.createDate(2018, 2, 1),
            adapter.createDate(2018),
            adapter.createDate(2019))
        ).toEqual(adapter.createDate(2018, 2, 1));
    });

    it('should count today as a valid date instance', () => {
        const d = adapter.today();

        expect(adapter.isValid(d))
            .toBe(true);
        expect(adapter.isDateInstance(d))
            .toBe(true);
    });

    it('should count an invalid date as an invalid date instance', () => {
        const d = DateTime.fromFormat('', '');

        expect(adapter.isValid(d))
            .toBe(false);
        expect(adapter.isDateInstance(d))
            .toBe(true);
    });

    it('should count a string as not a date instance', () => {
        const d = '1/1/2019';

        expect(adapter.isDateInstance(d))
            .toBe(false);
    });

    it('should create valid dates from valid ISO strings', () => {
        expect(adapter.deserialize('')).toBeNull();
        expect(adapter.deserialize(null)).toBeNull();

        assertValidDate(adapter.deserialize('1985-04-12T23:20:50.52Z'), true);
        assertValidDate(adapter.deserialize('1996-12-19T16:39:57-08:00'), true);
        assertValidDate(adapter.deserialize('1937-01-01T12:00:27.87+00:20'), true);
        assertValidDate(adapter.deserialize('1990-13-31T23:59:00Z'), false);
        assertValidDate(adapter.deserialize('1/1/2017'), false);

        assertValidDate(adapter.deserialize(new Date()), true);
        assertValidDate(adapter.deserialize(new Date(NaN)), false);

        assertValidDate(adapter.deserialize(DateTime.now()), true);
        assertValidDate(adapter.deserialize(adapter.invalid()), false);
    });

    it('should clone the date when deserializing a DateTime date', () => {
        const date = adapter.createDate(2017);

        expect(adapter.deserialize(date)?.toString())
            .toEqual(date.toString());
        expect(adapter.deserialize(date))
            .not.toBe(date);
    });

    it('should deserialize dates with the correct locale', () => {
        adapter.setLocale('ja');

        expect(adapter.deserialize('1985-04-12T23:20:50.52Z')!.locale)
            .toBe('ja');
        expect(adapter.deserialize(new Date())?.locale)
            .toBe('ja');
        expect(adapter.deserialize(adapter.today())?.locale)
            .toBe('ja');
    });

    it('should create an invalid date', () => {
        assertValidDate(adapter.invalid(), false);
    });

    it('setLocale should not modify global DateTime locale', () => {
        expect(DateTime.now().locale)
            .not.toBe('ja-JP');

        adapter.setLocale('ja-JP');

        expect(DateTime.now().locale)
            .not.toBe('ja-JP');
    });

    it('returned DateTime should have correct locale', () => {
        adapter.setLocale('ja-JP');

        expect(adapter.createDate(2017).locale)
            .toBe('ja-JP');
        expect(adapter.today().locale)
            .toBe('ja-JP');
        expect(adapter.clone(adapter.today()).locale)
            .toBe('ja-JP');
        expect(adapter.parse('1/1/2017', 'L/d/yyyy')?.locale)
            .toBe('ja-JP');
        expect(adapter.addCalendarDays(adapter.today(), 1).locale)
            .toBe('ja-JP');
        expect(adapter.addCalendarMonths(adapter.today(), 1).locale)
            .toBe('ja-JP');
        expect(adapter.addCalendarYears(adapter.today(), 1).locale)
            .toBe('ja-JP');
    });
});

describe('LuxonDateAdapter with MC_DATE_LOCALE override', () => {
    let adapter: LuxonDateAdapter;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [LuxonDateModule],
            providers: [{ provide: MC_DATE_LOCALE, useValue: 'ja-JP' }]
        }).compileComponents();
    }));

    beforeEach(inject([DateAdapter], (d: LuxonDateAdapter) => {
        adapter = d;
    }));

    it('should take the default locale id from the MC_DATE_LOCALE injection token', () => {
        expect(adapter.format(adapter.createDate(2017,  0,  2), 'DD')).toEqual('2017年1月2日');
    });
});

describe('LuxonDateAdapter with LOCALE_ID override', () => {
    let adapter: LuxonDateAdapter;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [LuxonDateModule],
            providers: [{ provide: LOCALE_ID, useValue: 'fr' }]
        }).compileComponents();
    }));

    beforeEach(inject([DateAdapter], (d: LuxonDateAdapter) => {
        adapter = d;
    }));

    it('should cascade locale id from the LOCALE_ID injection token to MC_DATE_LOCALE', () => {
        expect(adapter.format(adapter.createDate(2017,  0,  2), 'DD'))
            .toEqual('2 janv. 2017');
    });
});

describe('LuxonDateAdapter with MC_MOMENT_DATE_ADAPTER_OPTIONS override', () => {
    let adapter: LuxonDateAdapter;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [LuxonDateModule],
            providers: [{
                provide: MC_LUXON_DATE_ADAPTER_OPTIONS,
                useValue: { useUtc: true }
            }]
        }).compileComponents();
    }));

    beforeEach(inject([DateAdapter], (d: LuxonDateAdapter) => {
        adapter = d;
    }));

    describe('use UTC', () => {
        it('should create date in UTC', () => {
            expect(adapter.createDate(2017).zone.universal)
                .toBe(true);
        });

        it('should create today in UTC', () => {
            expect(adapter.today().zone.universal)
                .toBe(true);
        });

        it('should parse dates to UTC', () => {
            expect(adapter.parse('1/2/2017', 'L/d/yyyy')!.zone.universal)
                .toBe(true);
        });

        it('should return UTC date when deserializing', () => {
            expect(adapter.deserialize('1985-04-12T23:20:50.52Z')!.zone.universal)
                .toBe(true);
        });
    });
});
