import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CdkTreeModule } from '@ptsecurity/cdk/tree';
import { McPseudoCheckboxModule } from '@ptsecurity/mosaic/core';

import { McTreeNodeDef } from './node.directive';
import { McTreeNodePadding } from './padding.directive';
import { McTreeNodeToggleDirective, McTreeNodeToggleComponent } from './toggle';
import { McTreeOption } from './tree-option.component';
import { McTreeSelection } from './tree-selection.component';


const MC_TREE_DIRECTIVES = [
    McTreeSelection,
    McTreeOption,
    McTreeNodeDef,
    McTreeNodePadding,
    McTreeNodeToggleComponent,
    McTreeNodeToggleDirective
];

@NgModule({
    imports: [CommonModule, CdkTreeModule, McPseudoCheckboxModule],
    exports: MC_TREE_DIRECTIVES,
    declarations: MC_TREE_DIRECTIVES
})
export class McTreeModule {}
