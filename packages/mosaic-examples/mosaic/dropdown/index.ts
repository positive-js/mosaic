import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McCheckboxModule } from '@ptsecurity/mosaic/checkbox';
import { McDropdownModule } from '@ptsecurity/mosaic/dropdown';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McInputModule } from '@ptsecurity/mosaic/input';
import { McLinkModule } from '@ptsecurity/mosaic/link';

import { DropdownNavigationWrapExample } from './dropdown-navigation-wrap/dropdown-navigation-wrap-example';
import { DropdownNestedExample } from './dropdown-nested/dropdown-nested-example';
import { DropdownOverviewExample } from './dropdown-overview/dropdown-overview-example';


export {
    DropdownNestedExample,
    DropdownOverviewExample,
    DropdownNavigationWrapExample
};

const EXAMPLES = [
    DropdownNestedExample,
    DropdownOverviewExample,
    DropdownNavigationWrapExample
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        McButtonModule,
        McCheckboxModule,
        McDropdownModule,
        McIconModule,
        McLinkModule,
        McFormFieldModule,
        McInputModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class DropdownExamplesModule {}
