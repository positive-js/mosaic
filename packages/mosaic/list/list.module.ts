import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { A11yModule } from '@ptsecurity/cdk/a11y';
import { McLineModule, McPseudoCheckboxModule } from '@ptsecurity/mosaic/core';

import { McListSelection, McListOption } from './list-selection.component';
import { McList, McListItem, McListSubheaderCssStyler } from './list.component';


@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        McPseudoCheckboxModule,
        McLineModule
    ],
    exports: [
        McList,
        McListSelection,
        McListItem,
        McListOption,
        McListSubheaderCssStyler
    ],
    declarations: [
        McList,
        McListSelection,
        McListItem,
        McListOption,
        McListSubheaderCssStyler
    ]
})
export class McListModule {}
