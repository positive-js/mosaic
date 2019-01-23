import { enUS } from './configs/en-US';
import { ruRU } from './configs/ru-RU';


export interface IFormatterConfig {
    variables: IFormatterVariables;

    relativeTemplates: {
        short: IFormatterRelativeTemplate;
        long: IFormatterRelativeTemplate;
    };
    absoluteTemplates: {
        short: IFormatterAbsoluteTemplate;
        long: IFormatterAbsoluteTemplate;
    };
    rangeTemplates: {
        short: IFormatterRangeTemplate;
        middle: IFormatterRangeTemplate;
        long: IFormatterRangeTemplate;
    };
}

export interface IFormatterVariables {
    [name: string]: string;
}

export interface IFormatterRangeTemplate {
    variables?: IFormatterVariables;
    START_DATE: string;
    END_DATE: string;
    DATE: string;
    START_DATETIME: string;
    END_DATETIME: string;
    DATETIME: string;
}

export interface IFormatterAbsoluteTemplate {
    variables?: IFormatterVariables;
    DATE: string;
    DATETIME: string;
}

export interface IFormatterRelativeTemplate {
    variables?: IFormatterVariables;
    SECONDS_AGO: string;
    MINUTES_AGO: string;
    TODAY: string;
    YESTERDAY: string;
    BEFORE_YESTERDAY: string;
}

export class FormatterConfigs {
    'en-US' = enUS;
    'ru-RU' = ruRU;
}
