import { McDateFormats } from '@ptsecurity/cdk/datetime';


export const MC_MOMENT_DATE_FORMATS: McDateFormats = {
    parse: {
        dateInput: 'L'
    },
    display: {
        dateInput: 'L',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY'
    }
};
