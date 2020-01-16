import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { McAutocompleteModule } from '@ptsecurity/mosaic/autocomplete';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';

import { AutocompleteOverviewExample } from './autocomplete-overview/autocomplete-overview-example';


const EXAMPLES = [
    AutocompleteOverviewExample
];

@NgModule({
    imports: [
        BrowserAnimationsModule,
        FormsModule,
        McAutocompleteModule,

        McInputModule,
        McButtonModule,
        McFormFieldModule,
        McIconModule,
        ReactiveFormsModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class AutocompleteExamplesModule {}
