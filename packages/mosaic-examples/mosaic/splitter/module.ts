import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McSplitterModule } from '@ptsecurity/mosaic/splitter';

import { SplitterFixedExample } from './splitter-fixed/splitter-fixed-example';
import { SplitterNestedExample } from './splitter-nested/splitter-nested-example';
import { SplitterOverviewExample } from './splitter-overview/splitter-overview-example';
import { SplitterVerticalExample } from './splitter-vertical/splitter-vertical-example';


const EXAMPLES = [
    SplitterOverviewExample,
    SplitterFixedExample,
    SplitterVerticalExample,
    SplitterNestedExample
];

@NgModule({
    imports: [
        FormsModule,
        McSplitterModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class SplitterExamplesModule {}
