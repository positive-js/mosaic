import { Directive, Input } from '@angular/core';

import { CdkTree, CdkTreeNode } from './tree';


/**
 * Node toggle to expand/collapse the node.
 */
@Directive({
    selector: '[cdkTreeNodeToggle]',
    host: {
        '(click)': 'toggle($event)'
    }
})
export class CdkTreeNodeToggle<T> {
    @Input('cdkTreeNodeToggleRecursive')
    get recursive(): boolean { return this._recursive; }

    set recursive(value: boolean) { this._recursive = value; }

    /* tslint:disable-next-line:naming-convention */
    protected _recursive = false;

    constructor(protected tree: CdkTree<T>, protected treeNode: CdkTreeNode<T>) {}

    toggle(event: Event): void {
        this.recursive
            ? this.tree.treeControl.toggleDescendants(this.treeNode.data)
            : this.tree.treeControl.toggle(this.treeNode.data);

        event.stopPropagation();
    }
}
