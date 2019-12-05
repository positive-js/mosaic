import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { McAutocompleteModule } from '@ptsecurity/mosaic/autocomplete';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McTagsModule } from '@ptsecurity/mosaic/tags';

import { TagsAutocompleteExample } from './tags-autocomplete/tags-autocomplete-example';
import { TagsInputExample } from './tags-input/tags-input-example';
import { TagsListExample } from './tags-list/tags-list-example';
import { TagsOverviewExample } from './tags-overview/tags-overview-example';


const EXAMPLES = [
    TagsOverviewExample,
    TagsInputExample,
    TagsListExample,
    TagsAutocompleteExample
];

@NgModule({
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
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
