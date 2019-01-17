import { Directive, Input } from '@angular/core';

import { CdkTree, CdkTreeNode } from './tree';


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

    private _recursive = false;

    constructor(protected tree: CdkTree<T>, protected treeNode: CdkTreeNode<T>) {}

    toggle(event: Event): void {
        this.recursive
            ? this.tree.treeControl.toggleDescendants(this.treeNode.data)
            : this.tree.treeControl.toggle(this.treeNode.data);

        event.stopPropagation();
    }
}
