import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McPseudoCheckboxModule } from '@ptsecurity/mosaic/core';

import { McTreeNodeActionComponent } from './action';
import { McTreeNodeDef } from './node';
import { McTreeNodeOutlet } from './outlet';
import { McTreeNodePadding } from './padding.directive';
import { McTreeNodeToggleDirective, McTreeNodeToggleComponent } from './toggle';
import { McTree } from './tree';
import { McTreeNode } from './tree-base';
import { McTreeOption } from './tree-option.component';
import { McTreeSelection } from './tree-selection.component';


const MC_TREE_DIRECTIVES = [
    McTreeNodeOutlet,
    McTreeNodeDef,
    McTreeNode,
    McTreeNodePadding,
    McTree,
    McTreeSelection,
    McTreeOption,
    McTreeNodePadding,
    McTreeNodeActionComponent,
    McTreeNodeToggleComponent,
    McTreeNodeToggleDirective
];

@NgModule({
    imports: [CommonModule, McPseudoCheckboxModule],
    exports: MC_TREE_DIRECTIVES,
    declarations: MC_TREE_DIRECTIVES
})
export class McTreeModule {}
