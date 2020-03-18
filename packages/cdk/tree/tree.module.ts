import { FocusMonitor } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CdkNestedTreeNode } from './nested-node';
import { CdkTreeNodeDef } from './node';
import { CdkTreeNodeOutlet } from './outlet';
import { CdkTreeNodePadding } from './padding';
import { CdkTreeNodeToggle } from './toggle';
import { CdkTree, CdkTreeNode } from './tree';


const EXPORTED_DECLARATIONS = [
    CdkNestedTreeNode,
    CdkTreeNodeDef,
    CdkTreeNodePadding,
    CdkTreeNodeToggle,
    CdkTree,
    CdkTreeNode,
    CdkTreeNodeOutlet
];

@NgModule({
    imports: [CommonModule],
    exports: EXPORTED_DECLARATIONS,
    declarations: EXPORTED_DECLARATIONS,
    providers: [FocusMonitor]
})
export class CdkTreeModule {}
