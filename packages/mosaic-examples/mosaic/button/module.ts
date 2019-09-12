import { NgModule } from '@angular/core';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McIconModule } from '@ptsecurity/mosaic/icon';

import { ButtonOverviewExample } from './button-overview/button-overview-example';


const EXAMPLES = [
    ButtonOverviewExample
];

@NgModule({
    imports: [
        McButtonModule,
        McIconModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class ButtonExamplesModule {
}
