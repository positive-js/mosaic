/* tslint:disable:naming-convention */
import { Inject, Injectable, InjectionToken, Optional, Pipe, PipeTransform } from '@angular/core';


export const MC_LOCALE_ID = new InjectionToken<string>('McLocaleId');

export const DEFAULT_MC_LOCALE_ID = 'ru';


function isEmpty(value: any): boolean {
    return value == null || value === '' || value !== value;
}

function strToNumber(value: number | string): number {
    if (typeof value === 'string' && !isNaN(Number(value) - parseFloat(value))) {
        return Number(value);
    }

    if (typeof value !== 'number') {
        throw new Error(`${value} is not a number`);
    }

    return value;
}

export const NUMBER_FORMAT_REGEXP = /^(\d+)?\.((\d+)(-(\d+))?)?$/;

const minIntGroupPosition = 1;
const minFractionGroupPosition = 3;
const maxFractionGroupPosition = 5;

interface NumberFormatOptions {
    useGrouping: boolean;

    minimumIntegerDigits: number;
    minimumFractionDigits: number;
    maximumFractionDigits: number;
    minimumSignificantDigits: number;
    maximumSignificantDigits: number;

    localeMatcher?: string;
    style?: string;

    currency?: string;
    currencyDisplay?: string;
}

class ParsedDigitsInfo {
    minimumIntegerDigits: number;
    minimumFractionDigits: number;
    maximumFractionDigits: number;
}

function parseDigitsInfo(digitsInfo: string): ParsedDigitsInfo {
    const parts = digitsInfo.match(NUMBER_FORMAT_REGEXP);

    if (parts === null) {
        throw new Error(`${digitsInfo} is not a valid digit info`);
    }

    const minIntPart = parts[minIntGroupPosition];
    const minFractionPart = parts[minFractionGroupPosition];
    const maxFractionPart = parts[maxFractionGroupPosition];

    const result = new ParsedDigitsInfo();

    if (minIntPart != null) {
        result.minimumIntegerDigits = parseInt(minIntPart);
    }

    if (minFractionPart != null) {
        result.minimumFractionDigits = parseInt(minFractionPart);
    }

    if (maxFractionPart != null) {
        result.maximumFractionDigits = parseInt(maxFractionPart);
    } else if (minFractionPart != null && result.minimumFractionDigits > result.maximumFractionDigits) {
        result.maximumFractionDigits = result.minimumFractionDigits;
    }

    return result;
}


@Injectable({ providedIn: 'root' })
@Pipe({name: 'mcNumber'})
export class McDecimalPipe implements PipeTransform {
    constructor(@Optional() @Inject(MC_LOCALE_ID) private _locale: string) {}

    /**
     * @param value The number to be formatted.
     * @param digitsInfo Decimal representation options, specified by a string
     * in the following format:<br>
     * <code>{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}</code>.
     *   - `minIntegerDigits`: The minimum number of integer digits before the decimal point.
     * Default is `1`.
     *   - `minFractionDigits`: The minimum number of digits after the decimal point.
     * Default is `0`.
     *   - `maxFractionDigits`: The maximum number of digits after the decimal point.
     * Default is `3`.
     * @param locale A locale code for the locale format rules to use.
     * When not supplied, uses the value of `MC_LOCALE_ID`, which is `ru` by default.
     */
    transform(value: any, digitsInfo?: string, locale?: string, tableGrouping: boolean = true): string | null {
        if (isEmpty(value)) { return null; }

        const currentLocale = locale || this._locale || DEFAULT_MC_LOCALE_ID;

        let parsedDigitsInfo;

        if (digitsInfo) {
            parsedDigitsInfo = parseDigitsInfo(digitsInfo);
        }

        const useGrouping = tableGrouping ? true : value.toString().length > 4;
        const options: NumberFormatOptions = {
            useGrouping,
            minimumIntegerDigits: 1,
            minimumFractionDigits: 0,
            maximumFractionDigits: 3,
            ...parsedDigitsInfo
        };

        try {
            const num = strToNumber(value);

            return Intl.NumberFormat.call(this, currentLocale, options).format(num);
        } catch (error) {
            throw Error(`InvalidPipeArgument: McDecimalPipe for pipe '${JSON.stringify(error.message)}'`);
        }
    }
}
