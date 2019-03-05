import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CdkTreeModule } from '@ptsecurity/cdk/tree';
import { McPseudoCheckboxModule } from '@ptsecurity/mosaic/core';

import { McTreeNodeDef } from './node';
import { McTreeNodePadding } from './padding';
import { McTreeNodeToggle } from './toggle';
import { McTreeOption } from './tree-option';
import { McTreeSelection } from './tree-selection';


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
