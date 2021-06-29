import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McCheckboxModule } from '@ptsecurity/mosaic/checkbox';
import { McRadioModule } from '@ptsecurity/mosaic/radio';

import { RadioOverviewExample } from './radio-overview/radio-overview-example';


export {
    RadioOverviewExample
};

const EXAMPLES = [
    RadioOverviewExample
];

@NgModule({
    imports: [
        CommonModule,
        McCheckboxModule,
        McRadioModule,
        FormsModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class RadioExamplesModule {
}
