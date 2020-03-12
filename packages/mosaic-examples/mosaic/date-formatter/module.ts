import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McMomentDateModule } from '@ptsecurity/mosaic-moment-adapter';

import { AbsoluteDateFormatterExample } from './absolute-date-formatter/absolute-date-formatter-example';
import { RangeDateFormatterExample } from './range-date-formatter/range-date-formatter-example';
import { RelativeDateFormatterExample } from './relative-date-formatter/relative-date-formatter-example';


const EXAMPLES = [
    AbsoluteDateFormatterExample,
    RelativeDateFormatterExample,
    RangeDateFormatterExample
];

@NgModule({
    imports: [CommonModule, McMomentDateModule],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class DateFormatterExamplesModule {}
