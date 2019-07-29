import { Directive } from '@angular/core';
import { BaseTreeControl, CdkTree, CdkTreeNode, CdkTreeNodeToggle } from '@ptsecurity/cdk/tree';


@Directive({
    selector: '[mcTreeNodeToggle]',
    host: {
        '(click)': 'toggle($event)',
        '[class.mc-disabled]': 'disabled'
    },
    providers: [{ provide: CdkTreeNodeToggle, useExisting: McTreeNodeToggle }]
})
export class McTreeNodeToggle<T> extends CdkTreeNodeToggle<T> {
    disabled: boolean = false;

    constructor(protected tree: CdkTree<T>, protected treeNode: CdkTreeNode<T>) {
        super(tree, treeNode);

        // todo может пересмотреть, как то не очень
        (this.tree.treeControl as BaseTreeControl<T>).filterValue
            .subscribe((value: string) => { this.disabled = value.length > 0; });
    }
}
