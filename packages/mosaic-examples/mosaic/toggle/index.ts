import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McToggleModule } from '@ptsecurity/mosaic/toggle';

import { ToggleOverviewExample } from './toggle-overview/toggle-overview-example';


export {
    ToggleOverviewExample
};

const EXAMPLES = [
    ToggleOverviewExample
];

@NgModule({
    imports: [
        FormsModule,
        McToggleModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class ToggleExamplesModule {}
