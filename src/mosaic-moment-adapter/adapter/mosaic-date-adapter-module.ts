import { NgModule } from '@angular/core';
import { MC_DATE_FORMATS, DateAdapter } from '@ptsecurity/cdk/datetime';
import { PlatformModule } from '@ptsecurity/cdk/platform';

import { MosaicDateAdapter } from './mosaic-date-adapter';
import { MC_MOSAIC_DATE_FORMATS } from './mosaic-date-formats';
import {
    DEFAULT_MC_DATE_FORMATTER_CONFIGS_SET,
    MC_DATE_FORMATTER_CONFIGS_SET
} from './mosaic-date-formatter-configs';


@NgModule({
    imports: [PlatformModule],
    providers: [
        {provide: DateAdapter, useClass: MosaicDateAdapter},
        {provide: MC_DATE_FORMATTER_CONFIGS_SET, useValue: DEFAULT_MC_DATE_FORMATTER_CONFIGS_SET},
        {provide: MC_DATE_FORMATS, useValue: MC_MOSAIC_DATE_FORMATS}
    ]
})
export class MosaicDateModule {}
