import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { McPseudoCheckboxModule } from '@ptsecurity/mosaic/core';

import { McTreeNodeDef } from './node';
import { McTreeNodeOutlet } from './outlet';
import { McTreeNodePadding } from './padding.directive';
import { McTreeNodeToggleDirective, McTreeNodeToggleComponent } from './toggle';
import { McTree } from './tree';
import { McTreeOption } from './tree-option.component';
import { McTreeSelection } from './tree-selection.component';


const MC_TREE_DIRECTIVES = [
    McTreeNodeOutlet,
    McTreeNodeDef,
    McTreeNodePadding,
    McTree,
    McTreeSelection,
    McTreeOption,
    McTreeNodePadding,
    McTreeNodeToggleComponent,
    McTreeNodeToggleDirective
];

@NgModule({
    imports: [CommonModule, McPseudoCheckboxModule],
    exports: MC_TREE_DIRECTIVES,
    declarations: MC_TREE_DIRECTIVES
})
export class McTreeModule {}
