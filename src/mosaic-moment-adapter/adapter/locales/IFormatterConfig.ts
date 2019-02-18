import {
    IFormatterAbsoluteTemplate,
    IFormatterRangeTemplate,
    IFormatterRelativeTemplate
} from '@ptsecurity/cdk/datetime';


export interface IFormatterConfig {
    variables: { [name: string]: string };

    monthNames: {
        long: string[];
        short: string[];
        narrow: string[];
    };

    dayOfWeekNames: {
        long: string[];
        short: string[];
        narrow: string[];
    };

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
