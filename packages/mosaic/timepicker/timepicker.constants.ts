// tslint:disable:naming-convention
export enum TimeParts {
    hours,
    minutes,
    seconds,
    milliseconds
}

export enum TimeFormats {
    HHmmss = 'HH:mm:ss',
    HHmm = 'HH:mm',
    HHmmssSSS = 'HH:mm:ss.SSS'
}

export const TIMEFORMAT_PLACEHOLDERS: { [timeFormat: string]: string } = {
    [TimeFormats.HHmmss]: '  :  :  ',
    [TimeFormats.HHmm]: '  :  ',
    [TimeFormats.HHmmssSSS]: '  :  :  .   '
};

export const DEFAULT_TIME_FORMAT: TimeFormats = TimeFormats.HHmm;

export const HOURS_MINUTES_SECONDS_MILLISECONDS_REGEXP = /^([0-1][0-9]|2[0-3]):?([0-5][0-9]):?([0-5][0-9])\.?([0-9]{3})?$/;
export const HOURS_MINUTES_SECONDS_REGEXP = /^([0-1][0-9]|2[0-3]):?([0-5][0-9]):?([0-5][0-9])?$/;
export const HOURS_MINUTES_REGEXP = /^([0-1][0-9]|2[0-3]):?([0-5][0-9])?$/;
export const HOURS_ONLY_REGEXP = /^([0-1][0-9]|2[0-3]):?$/;
export const AM_PM_FORMAT_REGEXP = /^([0-1]?[0-9]):([0-5]?[0-9]) ([ap][m]?$)/i;

export const MILLISECONDS_PER_SECONDS: number = 999;
export const SECONDS_PER_MINUTE: number = 59;
export const MINUTES_PER_HOUR: number = 59;
export const HOURS_PER_DAY: number = 23;
