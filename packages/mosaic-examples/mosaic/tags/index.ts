import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { McAutocompleteModule } from '@ptsecurity/mosaic/autocomplete';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McTagsModule } from '@ptsecurity/mosaic/tags';

import { TagsAutocompleteExample } from './tags-autocomplete/tags-autocomplete-example';
import { TagsInputExample } from './tags-input/tags-input-example';
import { TagsListExample } from './tags-list/tags-list-example';
import { TagsOverviewExample } from './tags-overview/tags-overview-example';


export {
    TagsOverviewExample,
    TagsInputExample,
    TagsListExample,
    TagsAutocompleteExample
};

const EXAMPLES = [
    TagsOverviewExample,
    TagsInputExample,
    TagsListExample,
    TagsAutocompleteExample
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        McFormFieldModule,
        ReactiveFormsModule,

        McAutocompleteModule,
        McTagsModule,
        McIconModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class TagsExamplesModule {}
