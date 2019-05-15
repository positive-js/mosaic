import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { BaseTreeControl } from './base-tree-control';


/** Nested tree control. Able to expand/collapse a subtree recursively for NestedNode type. */
export class NestedTreeControl<T> extends BaseTreeControl<T> {

    /** Construct with nested tree function getChildren. */
    constructor(public getChildren: (dataNode: T) => Observable<T[]>) {
        super();
    }

    /**
     * Expands all dataNodes in the tree.
     *
     * To make this working, the `dataNodes` variable of the ITreeControl must be set to all root level
     * data nodes of the tree.
     */
    expandAll(): void {
        this.expansionModel.clear();
        const allNodes = this.dataNodes.reduce((accumulator: T[], dataNode) =>
            [...accumulator, ...this.getDescendants(dataNode), dataNode], []);
        this.expansionModel.select(...allNodes);
    }

    /** Gets a list of descendant dataNodes of a subtree rooted at given data node recursively. */
    getDescendants(dataNode: T): T[] {
        const descendants = [];
        this._getDescendants(descendants, dataNode);

        return descendants.splice(1);
    }

    /** A helper function to get descendants recursively. */
    // todo нужно придумать другое название и понять в чем отличие между getDescendants и _getDescendants
    /* tslint:disable-next-line:naming-convention */
    private _getDescendants(descendants: T[], dataNode: T): void {
        descendants.push(dataNode);

        this.getChildren(dataNode)
            .pipe(take(1))
            .subscribe((children) => {
                if (children && children.length > 0) {
                    children.forEach((child: T) => this._getDescendants(descendants, child));
                }
            });
    }
}
