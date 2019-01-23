import { NgModule } from '@angular/core';
import { MC_DATE_FORMATS, DateAdapter } from '@ptsecurity/cdk/datetime';
import { PlatformModule } from '@ptsecurity/cdk/platform';

import { MosaicDateAdapter } from './mosaic-date-adapter';
import { MC_MOSAIC_DATE_FORMATS } from './mosaic-date-formats';


@NgModule({
    imports: [PlatformModule],
    providers: [
        {provide: DateAdapter, useClass: MosaicDateAdapter}
    ]
})
export class MosaicDateModule {}


@NgModule({
    imports: [MosaicDateModule],
    providers: [{provide: MC_DATE_FORMATS, useValue: MC_MOSAIC_DATE_FORMATS}]
})
export class McMosaicDateModule {}
