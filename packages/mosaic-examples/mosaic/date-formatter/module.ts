import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McLuxonDateModule } from '@ptsecurity/mosaic-luxon-adapter/adapter';
import { McFormattersModule } from '@ptsecurity/mosaic/core';

import { AbsoluteDateFormatterExample } from './absolute-date-formatter/absolute-date-formatter-example';
import { RangeDateFormatterExample } from './range-date-formatter/range-date-formatter-example';
import { RelativeDateFormatterExample } from './relative-date-formatter/relative-date-formatter-example';


const EXAMPLES = [
    AbsoluteDateFormatterExample,
    RelativeDateFormatterExample,
    RangeDateFormatterExample
];

@NgModule({
    imports: [
        CommonModule,
        McLuxonDateModule,
        McFormattersModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class DateFormatterExamplesModule {}
