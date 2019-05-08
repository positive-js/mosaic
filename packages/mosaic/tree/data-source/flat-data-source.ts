import { ICollectionViewer, DataSource } from '@ptsecurity/cdk/collections';
import { FlatTreeControl, ITreeControl } from '@ptsecurity/cdk/tree';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';


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
        public transformFunction: (node: T, level: number) => F,
        public getLevel: (node: F) => number,
        public isExpandable: (node: F) => boolean,
        public getChildren: (node: T) => Observable<T[]>
    ) {}

    flattenNode(node: T, level: number, resultNodes: F[], parentMap: boolean[]): F[] {
        const flatNode = this.transformFunction(node, level);
        resultNodes.push(flatNode);

        if (this.isExpandable(flatNode)) {
            this.getChildren(node)
                .pipe(take(1))
                .subscribe((children) => {
                    children.forEach((child, index) => {
                        const childParentMap: boolean[] = parentMap.slice();
                        childParentMap.push(index !== children.length - 1);

                        this.flattenNode(child, level + 1, resultNodes, childParentMap);
                    });
                });
        }

        return resultNodes;
    }

    /**
     * Flatten a list of node type T to flattened version of node F.
     * Please note that type T may be nested, and the length of `structuredData` may be different
     * from that of returned list `F[]`.
     */
    flattenNodes(structuredData: T[]): F[] {
        const resultNodes: F[] = [];
        structuredData.forEach((node) => this.flattenNode(node, 0, resultNodes, []));

        return resultNodes;
    }

    /**
     * Expand flattened node with current expansion status.
     * The returned list may have different length.
     */
    expandFlattenedNodes(nodes: F[], treeControl: ITreeControl<F>): F[] {
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

    connect(collectionViewer: ICollectionViewer): Observable<F[]> {
        const changes = [
            collectionViewer.viewChange,
            this.treeControl.expansionModel.changed,
            this.flattenedData
        ];

        return merge(...changes)
            .pipe(map(() => {
                this.expandedData.next(
                    this.treeFlattener.expandFlattenedNodes(this.flattenedData.value, this.treeControl)
                );

                return this.expandedData.value;
            }));
    }

    disconnect() {
        // no op
    }
}

