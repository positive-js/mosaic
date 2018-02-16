import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { A11yModule } from '../../cdk/a11y';
import { PlatformModule } from '../../cdk/platform';

import { McLineModule } from '../core';

import { McListSelection } from './list-selection.component';
import { McList, McListItem, McListSubheaderCssStyler} from './list.component';


@NgModule({
    imports: [
        CommonModule,
        PlatformModule,
        A11yModule,
        McLineModule
    ],
    exports: [
        McList,
        McListSelection,
        McListItem,
        McListSubheaderCssStyler
    ],
    declarations: [
        McList,
        McListSelection,
        McListItem,
        McListSubheaderCssStyler
    ]
})
export class McListModule {}
