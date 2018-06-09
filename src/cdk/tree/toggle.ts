import {
    Directive,
    Input
} from '@angular/core';
// import { toBoolean } from '@ptsecurity/mosaic/core';

import { CdkTree, CdkTreeNode } from './tree';


/**
 * Node toggle to expand/collapse the node.
 */
@Directive({
    selector: '[cdkTreeNodeToggle]',
    host: {
        '(click)': '_toggle($event)'
    }
})
export class CdkTreeNodeToggle<T> {
    /** Whether expand/collapse the node recursively. */
    @Input('cdkTreeNodeToggleRecursive')
    get recursive(): boolean {
        return this._recursive;
    }

    set recursive(value: boolean) {
        this._recursive = value;
    }

    // set recursive(value: boolean) { this._recursive = toBoolean(value); }
    protected _recursive = false;

    constructor(protected _tree: CdkTree<T>, protected _treeNode: CdkTreeNode<T>) {}

    _toggle(event: Event): void {
        this.recursive
            ? this._tree.treeControl.toggleDescendants(this._treeNode.data)
            : this._tree.treeControl.toggle(this._treeNode.data);

        event.stopPropagation();
    }
}
