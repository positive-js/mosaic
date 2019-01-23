import { NgModule } from '@angular/core';
import { MC_DATE_FORMATS, DateAdapter } from '@ptsecurity/cdk/datetime';
import { PlatformModule } from '@ptsecurity/cdk/platform';

import { NativeDateAdapter } from './native-date-adapter';
import { MC_NATIVE_DATE_FORMATS } from './native-date-formats';


@NgModule({
    imports: [PlatformModule],
    providers: [
        {provide: DateAdapter, useClass: NativeDateAdapter}
    ]
})
export class NativeDateModule {}


@NgModule({
    imports: [NativeDateModule],
    providers: [{provide: MC_DATE_FORMATS, useValue: MC_NATIVE_DATE_FORMATS}]
})
export class McNativeDateModule {}
