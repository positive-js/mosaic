import { IFormatterConfig } from '../mosaic-date-formatter-configs';


export const ruRU: IFormatterConfig = {
    variables: {
        SECONDS: 's',
        MINUTES: 'm',
        TIME: 'HH:mm',

        DAY: 'D',
        MONTH: 'MMM',
        YEAR: 'YYYY',

        DATE: 'D\u00A0MMMM',
        SHORT_DATE: 'D\u00A0MMM',

        DASH: '\u2013',
        LONG_DASH: '\u202F\u2014\u2009',

        NBSP: '\u00A0'
    },

    monthNames: {
        long: [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь',
            'Октябрь', 'Ноябрь', 'Декабрь'
        ],
        short: ['янв', 'фев', 'март', 'апр', 'май', 'июнь', 'июль', 'авг', 'сен', 'окт', 'ноя', 'дек'],
        narrow: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д']
    },

    dayOfWeekNames: {
        long: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
        short: ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'],
        narrow: ['В', 'П', 'В', 'С', 'Ч', 'П', 'С']
    },

    relativeTemplates: {
        short: {
            SECONDS_AGO: '{SECONDS_PASSED}{NBSP}с назад',
            MINUTES_AGO: '{MINUTES_PASSED}{NBSP}мин назад',
            TODAY: '{TIME}',
            YESTERDAY: 'Вчера, {TIME}',
            BEFORE_YESTERDAY: '{CURRENT_YEAR, select, yes{{SHORT_DATE}, {TIME}} other{{SHORT_DATE}, {YEAR}}}'
        },
        long: {
            // tslint:disable-next-line:max-line-length
            SECONDS_AGO: '{SECONDS_PASSED, plural, =1{#{NBSP}секунду} =2{#{NBSP}секунды} other{#{NBSP}секунд}} назад',
            MINUTES_AGO: '{MINUTES_PASSED, plural, =1{#{NBSP}минуту} =2{#{NBSP}минуты} other{#{NBSP}минут}} назад',
            TODAY: '{TIME}',
            YESTERDAY: 'Вчера, {TIME}',
            BEFORE_YESTERDAY: '{CURRENT_YEAR, select, yes{{DATE}, {TIME}} other{{DATE}, {YEAR}}}'
        }
    },
    absoluteTemplates: {
        short: {
            DATE: '{CURRENT_YEAR, select, yes{{SHORT_DATE}} other{{SHORT_DATE} {YEAR}}}',
            DATETIME: '{CURRENT_YEAR, select, yes{{SHORT_DATE}, {TIME}} other{{SHORT_DATE} {YEAR}, {TIME}}}'
        },
        long: {
            DATE: '{CURRENT_YEAR, select, yes{{DATE}} other{{DATE} {YEAR}}}',
            DATETIME: '{CURRENT_YEAR, select, yes{{DATE}, {TIME}} other{{DATE} {YEAR}, {TIME}}}'
        }
    },
    rangeTemplates: {
        short: {
            START_DATE: `{
                            SAME_MONTH,
                            select,
                                yes{{DAY}}
                                other{{
                                    CURRENT_YEAR,
                                    select,
                                        yes{{SHORT_DATE}}
                                        other{{SHORT_DATE} {YEAR}}
                                }}
                        }`,
            END_DATE: '{CURRENT_YEAR, select, yes{{SHORT_DATE}} other{{SHORT_DATE} {YEAR}}}',
            DATE: `{
                            SAME_MONTH,
                            select,
                                yes{{START_DATE}{DASH}{END_DATE}}
                                other{{START_DATE}{LONG_DASH}{END_DATE}}
                        }`,

            START_DATETIME: `{
                            SAME_DAY,
                            select,
                                yes{{TIME}}
                                other{{
                                    CURRENT_YEAR,
                                    select,
                                        yes{{SHORT_DATE}, {TIME}}
                                        other{{SHORT_DATE} {YEAR}, {TIME}}
                                }}
                        }`,
            END_DATETIME: `{
                            SAME_DAY,
                            select,
                                yes{{
                                    CURRENT_YEAR,
                                    select,
                                        yes{{TIME}, {SHORT_DATE}}
                                        other{{TIME}, {SHORT_DATE} {YEAR}}
                                }}
                                other{{
                                    CURRENT_YEAR,
                                    select,
                                        yes{{SHORT_DATE}, {TIME}}
                                        other{{SHORT_DATE} {YEAR}, {TIME}}
                                }}
                        }`,
            DATETIME: `{
                            SAME_DAY,
                            select,
                                yes{{START_DATETIME}{DASH}{END_DATETIME}}
                                other{{START_DATETIME}{LONG_DASH}{END_DATETIME}}
                        }`
        },
        middle: {
            START_DATE: `{
                            SAME_MONTH,
                            select,
                                yes{{DAY}}
                                other{{
                                    CURRENT_YEAR,
                                    select,
                                        yes{{DATE}}
                                        other{{DATE} {YEAR}}
                                }}
                        }`,
            END_DATE: '{CURRENT_YEAR, select, yes{{DATE}} other{{DATE} {YEAR}}}',
            DATE: `{
                            SAME_MONTH,
                            select,
                                yes{{START_DATE}{DASH}{END_DATE}}
                                other{{START_DATE}{LONG_DASH}{END_DATE}}
                        }`,

            START_DATETIME: `{
                            SAME_DAY,
                            select,
                                yes{{TIME}}
                                other{{
                                    CURRENT_YEAR,
                                    select,
                                        yes{{DATE}, {TIME}}
                                        other{{DATE} {YEAR}, {TIME}}
                                }}
                        }`,
            END_DATETIME: `{
                            SAME_DAY,
                            select,
                                yes{{
                                    CURRENT_YEAR,
                                    select,
                                        yes{{TIME}, {DATE}}
                                        other{{TIME}, {DATE} {YEAR}}
                                }}
                                other{{
                                    CURRENT_YEAR,
                                    select,
                                        yes{{DATE}, {TIME}}
                                        other{{DATE} {YEAR}, {TIME}}
                                }}
                        }`,
            DATETIME: `{
                            SAME_DAY,
                            select,
                                yes{{START_DATETIME}{DASH}{END_DATETIME}}
                                other{{START_DATETIME}{LONG_DASH}{END_DATETIME}}
                        }`
        },
        long: {
            START_DATE: `{
                            SAME_MONTH,
                            select,
                                yes{{DAY}}
                                other{{
                                    CURRENT_YEAR,
                                    select,
                                        yes{{DATE}}
                                        other{{DATE} {YEAR}}
                                }}
                        }`,
            END_DATE: '{CURRENT_YEAR, select, yes{{DATE}} other{{DATE} {YEAR}}}',
            DATE: `{
                            SAME_MONTH,
                            select,
                                yes{{START_DATE}{DASH}{END_DATE}}
                                other{{START_DATE}{LONG_DASH}{END_DATE}}
                        }`,

            START_DATETIME: `{
                            SAME_DAY,
                            select,
                                yes{{
                                    CURRENT_YEAR,
                                    select,
                                        yes{{DATE}, с{NBSP}{TIME}}
                                        other{{DATE} {YEAR}, с{NBSP}{TIME}}
                                }}
                                other{{
                                    CURRENT_YEAR,
                                    select,
                                        yes{{DATE}, {TIME}}
                                        other{{DATE} {YEAR}, {TIME}}
                                }}
                        }`,
            END_DATETIME: `{
                            SAME_DAY,
                            select,
                                yes{по{NBSP}{TIME}}
                                other{{
                                    CURRENT_YEAR,
                                    select,
                                        yes{{DATE}, {TIME}}
                                        other{{DATE} {YEAR}, {TIME}}
                                }}
                        }`,
            DATETIME: `{
                            SAME_DAY,
                            select,
                                yes{{START_DATETIME} {END_DATETIME}}
                                other{С{NBSP}{START_DATETIME} по{NBSP}{END_DATETIME}}
                        }`
        }
    }
};
