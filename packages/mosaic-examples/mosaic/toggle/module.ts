import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { McToggleModule } from '@ptsecurity/mosaic/toggle';

import { ToggleOverviewExample } from './toggle-overview/toggle-overview-example';


const EXAMPLES = [
    ToggleOverviewExample
];

@NgModule({
    imports: [
        BrowserAnimationsModule,
        FormsModule,
        McToggleModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class ToggleExamplesModule {}
