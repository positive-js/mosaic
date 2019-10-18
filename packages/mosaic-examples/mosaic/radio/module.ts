import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McRadioModule } from '@ptsecurity/mosaic/radio';

import { RadioOverviewExample } from './radio-overview/radio-overview-example';


const EXAMPLES = [
    RadioOverviewExample
];

@NgModule({
    imports: [
        CommonModule,
        McRadioModule,
        FormsModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class RadioExamplesModule {
}
