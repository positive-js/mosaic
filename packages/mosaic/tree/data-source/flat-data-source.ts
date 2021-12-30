import { CollectionViewer, DataSource, SelectionChange } from '@angular/cdk/collections';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { FlatTreeControl } from '../control/flat-tree-control';
import { TreeControl } from '../control/tree-control';


/**
 * Tree flattener to convert a normal type of node to node with children & level information.
 * Transform nested nodes of type `T` to flattened nodes of type `F`.
 *
 * For example, the input data of type `T` is nested, and contains its children data:
 *   SomeNode: {
 *     key: 'Fruits',
 *     children: [
 *       NodeOne: {
 *         key: 'Apple',
 *       },
 *       NodeTwo: {
 *        key: 'Pear',
 *      }
 *    ]
 *  }
 *  After flattener flatten the tree, the structure will become
 *  SomeNode: {
 *    key: 'Fruits',
 *    expandable: true,
 *    level: 1
 *  },
 *  NodeOne: {
 *    key: 'Apple',
 *    expandable: false,
 *    level: 2
 *  },
 *  NodeTwo: {
 *   key: 'Pear',
 *   expandable: false,
 *   level: 2
 * }
 * and the output flattened type is `F` with additional information.
 */
export class McTreeFlattener<T, F> {
    constructor(
        public transformFunction: (node: T, level: number, parent: F | null) => F,
        public getLevel: (node: F) => number,
        public isExpandable: (node: F) => boolean,
        public getChildren: (node: T) => Observable<T[]> | T[] | undefined | null
    ) {}

    flattenNode(node: T, level: number, resultNodes: F[], parent: F | null): F[] {
        const flatNode = this.transformFunction(node, level, parent);
        resultNodes.push(flatNode);

        if (this.isExpandable(flatNode)) {
            const childrenNodes = this.getChildren(node);

            if (childrenNodes) {
                if (Array.isArray(childrenNodes)) {
                    this.flattenChildren(childrenNodes, level, resultNodes, flatNode);
                } else {
                    childrenNodes
                        .pipe(take(1))
                        .subscribe((children) => {
                            this.flattenChildren(children, level, resultNodes, flatNode);
                        });
                }
            }
        }

        return resultNodes;
    }

    flattenChildren(children: T[], level: number, resultNodes: F[], parent: F | null): void {
        children.forEach((child) => {
            this.flattenNode(child, level + 1, resultNodes, parent);
        });
    }

    /**
     * Flatten a list of node type T to flattened version of node F.
     * Please note that type T may be nested, and the length of `structuredData` may be different
     * from that of returned list `F[]`.
     */
    flattenNodes(structuredData: T[]): F[] {
        const resultNodes: F[] = [];
        structuredData.forEach((node) => this.flattenNode(node, 0, resultNodes, null));

        return resultNodes;
    }

    /**
     * Expand flattened node with current expansion status.
     * The returned list may have different length.
     */
    expandFlattenedNodes(nodes: F[], treeControl: TreeControl<F>): F[] {
        const results: F[] = [];
        const currentExpand: boolean[] = [];
        currentExpand[0] = true;

        nodes.forEach((node) => {
            let expand = true;
            for (let i = 0; i <= this.getLevel(node); i++) {
                expand = expand && currentExpand[i];
            }

            if (expand) { results.push(node); }

            if (this.isExpandable(node)) {
                currentExpand[this.getLevel(node) + 1] = treeControl.isExpanded(node);
            }
        });

        return results;
    }
}

enum McTreeDataSourceChangeTypes {
    Expansion = 'expansion',
    Filter = 'filter'
}

/**
 * Data source for flat tree.
 * The data source need to handle expansion/collapsion of the tree node and change the data feed
 * to `McTree`.
 * The nested tree nodes of type `T` are flattened through `MсTreeFlattener`, and converted
 * to type `F` for `McTree` to consume.
 */
export class McTreeFlatDataSource<T, F> extends DataSource<F> {
    flattenedData = new BehaviorSubject<F[]>([]);

    expandedData = new BehaviorSubject<F[]>([]);

    filteredData = new BehaviorSubject<F[]>([]);

    get data() {
        return this._data.value;
    }

    set data(value: T[]) {
        this._data.next(value);

        this.flattenedData.next(this.treeFlattener.flattenNodes(this.data));
        this.treeControl.dataNodes = this.flattenedData.value;
    }

    private _data: BehaviorSubject<T[]>;

    constructor(
        private treeControl: FlatTreeControl<F>,
        private treeFlattener: McTreeFlattener<T, F>,
        initialData: T[] = []
    ) {
        super();

        this._data = new BehaviorSubject<T[]>(initialData);
    }

    connect(collectionViewer: CollectionViewer): Observable<F[]> {
        return merge(
            collectionViewer.viewChange,
            this.treeControl.expansionModel.changed
                .pipe(map((value) => ({ type: McTreeDataSourceChangeTypes.Expansion, value }))),
            this.treeControl.filterValue
                .pipe(map((value) => ({ type: McTreeDataSourceChangeTypes.Filter, value }))),
            this.flattenedData
        )
        .pipe(map((changeObj: any): any => {
            if (changeObj.type === McTreeDataSourceChangeTypes.Filter) {
                if (changeObj.value && changeObj.value.length > 0) {
                    return this.filterHandler();
                } else {
                    return this.expansionHandler(changeObj.value);
                }
            }

            return this.expansionHandler(changeObj.value);
        }));
    }

    filterHandler(): F[] {
        this.filteredData.next(this.treeControl.filterModel.selected);

        return this.filteredData.value;
    }

    expansionHandler(_change: SelectionChange<F>): F[] {
        const expandedNodes = this.treeFlattener.expandFlattenedNodes(this.flattenedData.value, this.treeControl);
        this.expandedData.next(expandedNodes);

        return this.expandedData.value;
    }

    disconnect() {
        // no op
    }
}

