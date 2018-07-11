const SECONDS_PER_MINUTE: number = 59;
const MINUTES_PER_HOUR: number = 59;
const HOURS_PER_DAY: number = 23;

export enum TimeParts {
    hours,
    minutes,
    seconds
}

export enum TimeFormats {
    HHmmss = 'HH:mm:ss',
    HHmm = 'HH:mm'
}

export const DEFAULT_TIME_FORMAT: TimeFormats = TimeFormats.HHmm;


/**
 * @description Create Date object from separate parts of time
 */
function getDateFromTimeDigits(hours: number, minutes: number, seconds: number = 0): Date | undefined {
    return getDateFromTimeString(`${hours}:${minutes}:${seconds}`);
}

const hoursMinutesSecondsRegExp = new RegExp(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]|[0-9]):([0-5][0-9]|[0-9])?$/);
const hoursAndMinutesRegExp = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]|[0-9])?$/;
const hoursOnlyRegExp = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):?$/;

function getParsedTimeParts(timeString: string): {
    hoursOnly: any;
    hoursAndMinutes: any;
    hoursAndMinutesAndSeconds: any;
} {
    const hoursAndMinutesAndSeconds = timeString.match(hoursMinutesSecondsRegExp);
    const hoursAndMinutes = timeString.match(hoursAndMinutesRegExp);
    const hoursOnly = timeString.match(hoursOnlyRegExp);

    return {
        hoursOnly,
        hoursAndMinutes,
        hoursAndMinutesAndSeconds
    };
}

function getDateFromTimeString(timeString: string | undefined): Date | undefined {
    // TODO Use moment-js
    if (timeString === undefined) { return; }

    const {
        hoursOnly,
        hoursAndMinutes,
        hoursAndMinutesAndSeconds
    } = getParsedTimeParts(timeString);

    if (timeString.trim().length === 0 ||
        hoursOnly === null && hoursAndMinutes === null && hoursAndMinutesAndSeconds === null) {
        return;
    }

    // tslint:disable no-magic-numbers
    let hours: number = 0;
    let minutes: number = 0;
    let seconds: number = 0;

    if (hoursOnly) {
        hours = Number(hoursOnly[1]);
    } else if (hoursAndMinutes) {
        hours = Number(hoursAndMinutes[1]);
        minutes = Number(hoursAndMinutes[2]);
    } else if (hoursAndMinutesAndSeconds) {
        hours = Number(hoursAndMinutesAndSeconds[1]);
        minutes = Number(hoursAndMinutesAndSeconds[2]);
        seconds = Number(hoursAndMinutesAndSeconds[3]);
    }
    // const timestamp: number = Date.parse(fullDateString);
    const resultDate: Date = new Date(1970, 0, 1, hours, minutes, seconds);
    // tslint:enable no-magic-numbers

    return isNaN(resultDate.getTime()) ? undefined : resultDate;
}

/**
 * @description Create time string for displaying inside input element of UI
 */
function getTimeStringFromDate(tempVal: Date,
                               timeFormat: TimeFormats = DEFAULT_TIME_FORMAT): string {
    const hours: string = _getNumberWithLeadingZero(tempVal.getHours());
    const minutes: string = _getNumberWithLeadingZero(tempVal.getMinutes());
    const seconds: string = _getNumberWithLeadingZero(tempVal.getSeconds());

    const formattedTimeGenerators = {
        [TimeFormats.HHmm]: () => `${hours}:${minutes}`,
        [TimeFormats.HHmmss]: () => `${hours}:${minutes}:${seconds}`
    };

    return formattedTimeGenerators[timeFormat]();
}

/**
 * @description Increment part of time
 */
function incrementTime(dateVal: Date,
                       whatToIncrement: TimeParts = TimeParts.seconds): Date {
    let { hours, minutes, seconds } = _getTimeDigitsFromDate(dateVal);

    switch (whatToIncrement) {
        case TimeParts.hours:
            hours++;
            break;
        case TimeParts.minutes:
            minutes++;
            break;
        case TimeParts.seconds:
            seconds++;
            break;
        default:
    }

    if (seconds > SECONDS_PER_MINUTE) { seconds = 0; }

    if (minutes > MINUTES_PER_HOUR) { minutes = 0; }

    if (hours > HOURS_PER_DAY) { hours = 0; }

    return <Date> getDateFromTimeDigits(hours, minutes, seconds);
}

/**
 * @description Decrement part of time
 */
function decrementTime(dateVal: Date,
                       whatToDecrement: TimeParts = TimeParts.seconds): Date {
    let { hours, minutes, seconds } = _getTimeDigitsFromDate(dateVal);

    switch (whatToDecrement) {
        case TimeParts.hours:
            hours--;
            break;
        case TimeParts.minutes:
            minutes--;
            break;
        case TimeParts.seconds:
            seconds--;
            break;
        default:
    }

    if (seconds < 0) { seconds = SECONDS_PER_MINUTE; }

    if (minutes < 0) { minutes = MINUTES_PER_HOUR; }

    if (hours < 0) { hours = HOURS_PER_DAY; }

    return <Date> getDateFromTimeDigits(hours, minutes, seconds);
}

function isTimeLowerThenMin(timeToCompare: Date, minTime: string): boolean {
    const minTimeForCompare: Date | undefined = getDateFromTimeString(minTime);
    const timeDelta: number = timeToCompare.getTime() - (<Date> minTimeForCompare).getTime();

    return timeDelta < 0;
}

function isTimeGreaterThenMax(compareWithTime: Date, maxTime: string): boolean {
    const maxTimeForCompare: Date | undefined = getDateFromTimeString(maxTime);
    const timeDelta: number = compareWithTime.getTime() - (<Date> maxTimeForCompare).getTime();

    return timeDelta >= 0;
}

/**
 * @description Fetch time digits from Date
 */
function _getTimeDigitsFromDate(dateVal: Date): { hours: number; minutes: number; seconds: number } {
    return {
        hours: dateVal.getHours(),
        minutes: dateVal.getMinutes(),
        seconds: dateVal.getSeconds()
    };
}

/**
 * @description Get params for arrow-keys (up/down) time valie edit.
 * @param cursorPosition Current cursor position in timeString
 * @param timeString Time string to parse
 */
function getTimeEditState(cursorPosition: number, timeString: string): {
    modifiedTimePart: TimeParts;
    cursorStartPosition: number;
    cursorEndPosition: number;
} {
    let modifiedTimePart: TimeParts;
    let cursorStartPosition: number;
    let cursorEndPosition: number;
    const hoursIndex = 0;
    const minutesIndex = timeString.indexOf(':', hoursIndex + 1);
    const secondsIndex = minutesIndex !== -1 ? timeString.indexOf(':', minutesIndex + 1) : -1;

    if (secondsIndex !== -1 && cursorPosition > secondsIndex) {
        modifiedTimePart = TimeParts.seconds;
        cursorStartPosition = secondsIndex + 1;
        cursorEndPosition = timeString.length;
    } else if (minutesIndex !== -1 && cursorPosition > minutesIndex) {
        modifiedTimePart = TimeParts.minutes;
        cursorStartPosition = minutesIndex + 1;
        cursorEndPosition = secondsIndex > -1 ? secondsIndex : timeString.length;
    } else {
        modifiedTimePart = TimeParts.hours;
        cursorStartPosition = hoursIndex;
        cursorEndPosition = minutesIndex !== -1 ? minutesIndex : timeString.length;
    }

    return {
        modifiedTimePart,
        cursorStartPosition,
        cursorEndPosition
    };
}

function _getNumberWithLeadingZero(digit: number): string {
    const MAX_DIGIT_WITH_LEADING_ZERO: number = 9;

    return digit > MAX_DIGIT_WITH_LEADING_ZERO ? `${digit}` : `0${digit}`;
}

function getCursorPositionOfPrevTimePartStart(cursorPos: number, timeString: string): number {
    return cursorPos === 0 ? timeString.length : cursorPos - 1;
}

function getCursorPositionOfNextTimePartStart(cursorPos: number,
                                              timeString: string,
                                              timeDevider: string = ':'): number {
    const nextDividerPos: number = timeString.indexOf(timeDevider, cursorPos);

    return nextDividerPos !== undefined ? nextDividerPos + 1 : 0;
}

export {
    incrementTime,
    decrementTime,
    isTimeLowerThenMin,
    isTimeGreaterThenMax,
    getTimeStringFromDate,
    getDateFromTimeDigits,
    getDateFromTimeString,
    getTimeEditState,
    getCursorPositionOfNextTimePartStart,
    getCursorPositionOfPrevTimePartStart,
    getParsedTimeParts
};
