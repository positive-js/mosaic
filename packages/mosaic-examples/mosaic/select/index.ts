import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McSelectModule } from '@ptsecurity/mosaic/select';

import { SelectGroupsExample } from './select-groups/select-groups-example';
import { SelectMultipleOverviewExample } from './select-multiple-overview/select-multiple-overview-example';
import { SelectOverviewExample } from './select-overview/select-overview-example';
import { SelectSearchOverviewExample } from './select-search-overview/select-search-overview-example';
import { SelectVirtualScrollExample } from './select-virtual-scroll/select-virtual-scroll-example';


export {
    SelectOverviewExample,
    SelectMultipleOverviewExample,
    SelectSearchOverviewExample,
    SelectGroupsExample,
    SelectVirtualScrollExample
};

const EXAMPLES = [
    SelectOverviewExample,
    SelectMultipleOverviewExample,
    SelectSearchOverviewExample,
    SelectGroupsExample,
    SelectVirtualScrollExample
];

@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        McFormFieldModule,
        McSelectModule,
        McInputModule,
        McIconModule,
        ScrollingModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class SelectExamplesModule {}
