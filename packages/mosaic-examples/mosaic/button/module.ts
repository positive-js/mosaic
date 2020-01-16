import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McCheckboxModule } from '@ptsecurity/mosaic/checkbox';
import { McIconModule } from '@ptsecurity/mosaic/icon';

import { ButtonColorsExample } from './button-colors/button-colors-example';
import { ButtonIconExample } from './button-icon/button-icon-example';
import { ButtonOverviewExample } from './button-overview/button-overview-example';
import { ButtonProgressExample } from './button-progress/button-progress-example';


const EXAMPLES = [
    ButtonIconExample,
    ButtonColorsExample,
    ButtonOverviewExample,
    ButtonProgressExample
];

@NgModule({
    imports: [
        FormsModule,
        McButtonModule,
        McCheckboxModule,
        McIconModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class ButtonExamplesModule {
}
