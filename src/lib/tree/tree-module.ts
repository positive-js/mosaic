import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { CdkTreeModule, CdkTreeNodeToggle } from '@ptsecurity/cdk/tree';
// import { MatCommonModule } from '@ptsecurity/mosaic/core';
import { CdkTreeNodeOutlet } from '@ptsecurity/cdk/tree/outlet';

import { McTreeNodeDef } from './node';
import { McTreeNodeOption } from './node-option';
import { McTreeNodePadding } from './padding';
import { McTreeSelection } from './tree';


const MC_TREE_DIRECTIVES = [
    McTreeNodeDef,
    McTreeNodePadding,
    McTreeSelection,
    McTreeNodeOption,
    CdkTreeNodeOutlet,
    CdkTreeNodeToggle
];

@NgModule({
    // imports: [CdkTreeModule, CommonModule, MatCommonModule],
    imports: [CommonModule],
    exports: MC_TREE_DIRECTIVES,
    declarations: MC_TREE_DIRECTIVES
})
export class McTreeModule {}
