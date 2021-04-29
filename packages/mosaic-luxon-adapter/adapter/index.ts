import { NgModule } from '@angular/core';
import { DateAdapter, MC_DATE_FORMATS, MC_DATE_LOCALE } from '@ptsecurity/cdk/datetime';

import { MC_LUXON_DATE_ADAPTER_OPTIONS, LuxonDateAdapter } from './date-adapter';
import { MC_LUXON_DATE_FORMATS } from './date-formats';


export * from './date-adapter';
export * from './date-formats';

@NgModule({
    providers: [{
        provide: DateAdapter,
        useClass: LuxonDateAdapter,
        deps: [MC_DATE_LOCALE, MC_LUXON_DATE_ADAPTER_OPTIONS]
    }]
})
export class LuxonDateModule {}

@NgModule({
    imports: [LuxonDateModule],
    providers: [{
        provide: MC_DATE_FORMATS, useValue: MC_LUXON_DATE_FORMATS
    }]
})
export class McLuxonDateModule {}
