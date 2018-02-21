import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { A11yModule } from '@ptsecurity/cdk/a11y';
import { PlatformModule } from '@ptsecurity/cdk/platform';

import { McLineModule } from '../core';
import { McPseudoCheckboxModule } from '../core/selection';

import { McListSelection, McListOption } from './list-selection.component';
import { McList, McListItem, McListSubheaderCssStyler} from './list.component';


@NgModule({
    imports: [
        CommonModule,
        PlatformModule,
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
