import { DateAdapterConfig } from '@ptsecurity/cdk/datetime';


export const ruRU: DateAdapterConfig = {
    variables: {
        SECONDS: 'ss',
        MILLISECONDS: ',SSS',
        MINUTES: 'mm',
        TIME: 'HH:mm',

        DAY: 'd',
        MONTH: 'MMM',
        YEAR: 'yyyy',

        DATE: 'd\u00A0MMMM',
        SHORT_DATE: 'd\u00A0MMM',

        DASH: '\u2013',
        LONG_DASH: '\u202F\u2014\u2009',

        NBSP: '\u00A0'
    },

    monthNames: {
        long: [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь',
            'Октябрь', 'Ноябрь', 'Декабрь'
        ],
        short: {
            standalone: ['янв', 'фев', 'март', 'апр', 'май', 'июнь', 'июль', 'авг', 'сен', 'окт', 'ноя', 'дек'],
            formatted: ['янв', 'фев', 'мар', 'апр', 'мая', 'июня', 'июля', 'авг', 'сен', 'окт', 'ноя', 'дек']
        },
        narrow: ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д']
    },

    dayOfWeekNames: {
        long: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
        short: ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'],
        narrow: ['П', 'В', 'С', 'Ч', 'П', 'С', 'В']
    },

    firstDayOfWeek: 0
};
