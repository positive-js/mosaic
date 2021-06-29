import { NgModule } from '@angular/core';
import { McButtonToggleModule } from '@ptsecurity/mosaic/button-toggle';
import { McIconModule } from '@ptsecurity/mosaic/icon';

import {
    ButtonToggleMultipleOverviewExample
} from './button-toggle-multiple-overview/button-toggle-multiple-overview-example';
import { ButtonToggleOverviewExample } from './button-toggle-overview/button-toggle-overview-example';


export {
    ButtonToggleOverviewExample,
    ButtonToggleMultipleOverviewExample
};

const EXAMPLES = [
    ButtonToggleOverviewExample,
    ButtonToggleMultipleOverviewExample
];

@NgModule({
    imports: [
        McButtonToggleModule,
        McIconModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class ButtonToggleExamplesModule {}
