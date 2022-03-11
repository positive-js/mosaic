import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';

import { InputNumberOverviewExample } from './input-number-overview/input-number-overview-example';
import { InputOverviewExample } from './input-overview/input-overview-example';
import { InputPasswordOverviewExample } from './input-password-overview/input-password-overview-example';


export {
    InputOverviewExample,
    InputNumberOverviewExample,
    InputPasswordOverviewExample
};

const EXAMPLES = [
    InputOverviewExample,
    InputNumberOverviewExample,
    InputPasswordOverviewExample
];

@NgModule({
    imports: [
        FormsModule,
        McFormFieldModule,
        McIconModule,
        McInputModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class InputExamplesModule {}
