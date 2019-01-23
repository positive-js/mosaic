import { McDateFormats } from '@ptsecurity/cdk/datetime';


export const MC_MOSAIC_DATE_FORMATS: McDateFormats = {
    parse: {
        dateInput: 'l'
    },
    display: {
        dateInput: 'l',
        monthYearLabel: 'MMM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM YYYY'
    }
};
