import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { TypographyOverviewExample } from './typography-overview/typography-overview-example';


const EXAMPLES = [
    TypographyOverviewExample
];

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class TypographyExamplesModule {}
