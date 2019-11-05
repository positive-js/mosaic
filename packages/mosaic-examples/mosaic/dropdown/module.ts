import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { McCheckboxModule } from '@ptsecurity/mosaic/checkbox';
import { McDropdownModule } from '@ptsecurity/mosaic/dropdown';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McLinkModule } from '@ptsecurity/mosaic/link';

import { DropdownNestedExample } from './dropdown-nested/dropdown-nested-example';
import { DropdownOverviewExample } from './dropdown-overview/dropdown-overview-example';


const EXAMPLES = [
    DropdownNestedExample,
    DropdownOverviewExample
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        McButtonModule,
        McCheckboxModule,
        McDropdownModule,
        McIconModule,
        McLinkModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class DropdownExamplesModule {
}
