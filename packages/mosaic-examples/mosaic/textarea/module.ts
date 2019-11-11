import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McTextareaModule } from '@ptsecurity/mosaic/textarea';

import { TextAreaOverviewExample } from './text-area-overview/text-area-overview-example';


const EXAMPLES = [
    TextAreaOverviewExample
];

@NgModule({
    imports: [
        FormsModule,
        McTextareaModule,
        McFormFieldModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class TextAreaExamplesModule {
}
