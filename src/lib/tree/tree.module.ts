import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { CdkTreeModule } from '@ptsecurity/cdk/tree';
import { McPseudoCheckboxModule } from '@ptsecurity/mosaic/core';

import { McTreeNodeDef } from './node';
import { McTreeNodePadding } from './padding';
import { McTreeNodeToggle } from './toggle';
import { McTreeSelection, McTreeOption } from './tree-selection';


const MC_TREE_DIRECTIVES = [
    McTreeSelection,
    McTreeOption,
    McTreeNodeDef,
    McTreeNodePadding,
    McTreeNodeToggle
];

@NgModule({
    imports: [CommonModule, CdkTreeModule, McPseudoCheckboxModule],
    exports: MC_TREE_DIRECTIVES,
    declarations: MC_TREE_DIRECTIVES
})
export class McTreeModule {}
