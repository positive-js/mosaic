import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { CdkTreeModule } from '@ptsecurity/cdk/tree';

import { McTreeNodeDef } from './node';
import { McTreeNodePadding } from './padding';
import { McTreeSelection, McTreeNodeOption } from './tree-selection';


const MC_TREE_DIRECTIVES = [
    McTreeNodeDef,
    McTreeNodePadding,
    McTreeSelection,
    McTreeNodeOption
];

@NgModule({
    imports: [CommonModule, CdkTreeModule],
    exports: MC_TREE_DIRECTIVES,
    declarations: MC_TREE_DIRECTIVES
})
export class McTreeModule {}
