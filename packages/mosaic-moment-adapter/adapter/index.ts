import { NgModule } from '@angular/core';
import { DateAdapter, MC_DATE_FORMATS, MC_DATE_LOCALE } from '@ptsecurity/cdk/datetime';

import { MC_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from './moment-date-adapter';
import { MC_MOMENT_DATE_FORMATS } from './moment-date-formats';


export * from './moment-date-adapter';
export * from './moment-date-formats';

@NgModule({
    providers: [
        {
            provide: DateAdapter,
            useClass: MomentDateAdapter,
            deps: [ MC_DATE_LOCALE, MC_MOMENT_DATE_ADAPTER_OPTIONS ]
        }
    ]
})
export class MomentDateModule {}

@NgModule({
    imports: [MomentDateModule],
    providers: [{
        provide: MC_DATE_FORMATS, useValue: MC_MOMENT_DATE_FORMATS
    }]
})
export class McMomentDateModule {}
