import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { McAutocompleteModule } from '@ptsecurity/mosaic/autocomplete';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';

import { AutocompleteOverviewExample } from './autocomplete-overview/autocomplete-overview-example';


export {
    AutocompleteOverviewExample
};

const EXAMPLES = [
    AutocompleteOverviewExample
];

@NgModule({
    imports: [
        CommonModule,
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
