import { IFormatterConfig } from './IFormatterConfig';


export const enUS: IFormatterConfig = {
    variables: {
        SECONDS: 's',
        MINUTES: 'm',
        TIME: 'HH:mm',

        DAY: 'D',
        MONTH: 'MMM',
        YEAR: 'YYYY',

        DATE: 'MMMM\u00A0D',
        SHORT_DATE: 'MMM\u00A0D',

        DASH: '\u2013',
        LONG_DASH: '\u202F\u2013\u2009',

        NBSP: '\u00A0'
    },

    monthNames: {
        long: [
            'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
            'October', 'November', 'December'
        ],
        short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
    },

    dayOfWeekNames: {
        long: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    },

    relativeTemplates: {
        short: {
            SECONDS_AGO: '{SECONDS_PASSED}{NBSP}s ago',
            MINUTES_AGO: '{MINUTES_PASSED}{NBSP}min ago',
            TODAY: '{TIME}',
            YESTERDAY: 'Yesterday, {TIME}',
            BEFORE_YESTERDAY: '{CURRENT_YEAR, select, yes{{SHORT_DATE}, {TIME}} other{{SHORT_DATE}, {YEAR}}}'
        },
        long: {
            SECONDS_AGO: '{SECONDS_PASSED, plural, =1{#{NBSP}second} other{#{NBSP}seconds}} ago',
            MINUTES_AGO: '{MINUTES_PASSED, plural, =1{#{NBSP}minute} other{#{NBSP}minutes}} ago',
            TODAY: '{TIME}',
            YESTERDAY: 'Yesterday, {TIME}',
            BEFORE_YESTERDAY: '{CURRENT_YEAR, select, yes{{DATE}, {TIME}} other{{DATE}, {YEAR}}}'
        }
    },
    absoluteTemplates: {
        short: {
            DATE: '{CURRENT_YEAR, select, yes{{SHORT_DATE}} other{{SHORT_DATE}, {YEAR}}}',
            DATETIME: '{CURRENT_YEAR, select, yes{{SHORT_DATE}, {TIME}} other{{SHORT_DATE}, {YEAR}, {TIME}}}'
        },
        long: {
            DATE: '{CURRENT_YEAR, select, yes{{DATE}} other{{DATE}, {YEAR}}}',
            DATETIME: '{CURRENT_YEAR, select, yes{{DATE}, {TIME}} other{{DATE}, {YEAR}, {TIME}}}'
        }
    },
    rangeTemplates: {
        short: {
            START_DATE: '{CURRENT_YEAR, select, yes{{SHORT_DATE}} other{{SHORT_DATE}, {YEAR}}}',
            END_DATE: `{
                            SAME_MONTH,
                            select,
                                yes{{DAY}}
                                other{{
                                    CURRENT_YEAR,
                                    select,
                                        yes{{SHORT_DATE}}
                                        other{{SHORT_DATE}, {YEAR}}
                                }}
                        }`,
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
                                        other{{SHORT_DATE}, {YEAR}, {TIME}}
                                }}
                        }`,
            END_DATETIME: `{
                            SAME_DAY,
                            select,
                                yes{{
                                    CURRENT_YEAR,
                                    select,
                                        yes{{TIME}, {SHORT_DATE}}
                                        other{{TIME}, {SHORT_DATE}, {YEAR}}
                                }}
                                other{{
                                    CURRENT_YEAR,
                                    select,
                                        yes{{SHORT_DATE}, {TIME}}
                                        other{{SHORT_DATE}, {YEAR}, {TIME}}
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
                                        other{{DATE}, {YEAR}}
                                }}
                        }`,
            END_DATE: '{CURRENT_YEAR, select, yes{{DATE}} other{{DATE}, {YEAR}}}',
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
                                        other{{DATE}, {YEAR}, {TIME}}
                                }}
                        }`,
            END_DATETIME: `{
                            SAME_DAY,
                            select,
                                yes{{
                                    CURRENT_YEAR,
                                    select,
                                        yes{{TIME}, {DATE}}
                                        other{{TIME}, {DATE}, {YEAR}}
                                }}
                                other{{
                                    CURRENT_YEAR,
                                    select,
                                        yes{{DATE}, {TIME}}
                                        other{{DATE}, {YEAR}, {TIME}}
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
            START_DATE: '{CURRENT_YEAR, select, yes{{DATE}} other{{DATE}, {YEAR}}}',
            END_DATE: `{
                            SAME_MONTH,
                            select,
                                yes{{DAY}}
                                other{{
                                    CURRENT_YEAR,
                                    select,
                                        yes{{DATE}}
                                        other{{DATE}, {YEAR}}
                                }}
                        }`,
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
                                        yes{{DATE}, from{NBSP}{TIME}}
                                        other{{DATE}, {YEAR}, from{NBSP}{TIME}}
                                }}
                                other{{
                                    CURRENT_YEAR,
                                    select,
                                        yes{{DATE}, {TIME}}
                                        other{{DATE}, {YEAR}, {TIME}}
                                }}
                        }`,
            END_DATETIME: `{
                            SAME_DAY,
                            select,
                                yes{to{NBSP}{TIME}}
                                other{{
                                    CURRENT_YEAR,
                                    select,
                                        yes{{DATE}, {TIME}}
                                        other{{DATE}, {YEAR}, {TIME}}
                                }}
                        }`,
            DATETIME: `{
                            SAME_DAY,
                            select,
                                yes{{START_DATETIME} {END_DATETIME}}
                                other{From {START_DATETIME} to{NBSP}{END_DATETIME}}
                        }`
        }
    }
};
