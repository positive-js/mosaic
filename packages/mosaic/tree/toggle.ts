import { Component, Directive, Input, ViewEncapsulation } from '@angular/core';
import { BaseTreeControl, CdkTree, CdkTreeNode, CdkTreeNodeToggle } from '@ptsecurity/cdk/tree';


@Component({
    selector: 'mc-tree-node-toggle',
    template: `
        <i class="mc mc-icon mc-angle-down-S_16"></i>
    `,
    host: {
        class: 'mc-tree-node-toggle',
        '(click)': 'toggle($event)',
        '[class.mc-disabled]': 'disabled',
        '[class.mc-opened]': 'iconState'
    },
    encapsulation: ViewEncapsulation.None,
    providers: [{ provide: CdkTreeNodeToggle, useExisting: McTreeNodeToggleComponent }]
})
export class McTreeNodeToggleComponent<T> extends CdkTreeNodeToggle<T> {
    disabled: boolean = false;

    @Input() node: T;

    get iconState(): any {
        return this.disabled || this.tree.treeControl.isExpanded(this.node);
    }

    constructor(protected tree: CdkTree<T>, protected treeNode: CdkTreeNode<T>) {
        super(tree, treeNode);

        // todo может пересмотреть, как то не очень
        (this.tree.treeControl as BaseTreeControl<T>).filterValue
            .subscribe((value: string) => { this.disabled = value.length > 0; });
    }
}

@Directive({
    selector: '[mcTreeNodeToggle]',
    host: {
        '(click)': 'toggle($event)',
        '[class.mc-disabled]': 'disabled'
    },
    providers: [{ provide: CdkTreeNodeToggle, useExisting: McTreeNodeToggleDirective }]
})
export class McTreeNodeToggleDirective<T> extends CdkTreeNodeToggle<T> {
    disabled: boolean = false;

    constructor(protected tree: CdkTree<T>, protected treeNode: CdkTreeNode<T>) {
        super(tree, treeNode);

        // todo может пересмотреть, как то не очень
        (this.tree.treeControl as BaseTreeControl<T>).filterValue
            .subscribe((value: string) => { this.disabled = value.length > 0; });
    }
}
