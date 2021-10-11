import { BaseTreeControl } from './base-tree-control';


export function defaultCompareValues(firstValue, secondValue): boolean {
    return firstValue === secondValue;
}

export function defaultCompareViewValues(firstViewValue, secondViewValue): boolean {
    return RegExp(secondViewValue, 'gi').test(firstViewValue);
}

/** Flat tree control. Able to expand/collapse a subtree recursively for flattened tree. */
export class FlatTreeControl<T> extends BaseTreeControl<T> {
    /** Construct with flat tree data node functions getLevel, isExpandable, getValue and getViewValue. */
    constructor(
        public getLevel: (dataNode: T) => number,
        public isExpandable: (dataNode: T) => boolean,
        /** getValue will be used to determine if the tree contains value or not. Used in method hasValue */
        public getValue: (dataNode) => any,
        /** getViewValue will be used for filter nodes. Returned value will be first argument in filterNodesFunction */
        public getViewValue: (dataNode) => string,
        /** compareValues will be used to comparing values. */
        public compareValues: (firstValue, secondValue) => boolean = defaultCompareValues,
        /** compareValues will be used to comparing values. */
        public compareViewValues: (firstViewValue, secondViewValue) => boolean = defaultCompareViewValues
    ) {
        super();
    }

    /**
     * Gets a list of the data node's subtree of descendent data nodes.
     *
     * To make this working, the `dataNodes` of the TreeControl must be flattened tree nodes
     * with correct levels.
     */
    getDescendants(dataNode: T): T[] {
        const startIndex = this.dataNodes.indexOf(dataNode);
        const results: T[] = [];

        // Goes through flattened tree nodes in the `dataNodes` array, and get all descendants.
        // The level of descendants of a tree node must be greater than the level of the given
        // tree node.
        // If we reach a node whose level is equal to the level of the tree node, we hit a sibling.
        // If we reach a node whose level is greater than the level of the tree node, we hit a
        // sibling of an ancestor.
        for (let i = startIndex + 1;
             i < this.dataNodes.length && this.getLevel(dataNode) < this.getLevel(this.dataNodes[i]);
             i++
        ) {
            results.push(this.dataNodes[i]);
        }

        return results;
    }

    /**
     * Expands all data nodes in the tree.
     *
     * To make this working, the `dataNodes` variable of the TreeControl must be set to all flattened
     * data nodes of the tree.
     */
    expandAll(): void {
        this.expansionModel.select(...this.dataNodes);
    }

    getParents(node: any, result: T[]): T[] {
        if (node.parent) {
            result.unshift(node.parent);

            return this.getParents(node.parent, result);
        } else {
            return result;
        }
    }

    hasValue(value: string): T | undefined {
        return this.dataNodes.find((node: any) => this.compareValues(this.getValue(node), value));
    }

    filterNodes(value: string): void {
        this.filterModel.clear();

        const filteredNodes = this.dataNodes.filter(
            (node: any) => this.compareViewValues(this.getViewValue(node), value)
        );

        const filteredNodesWithTheirParents = new Set();
        filteredNodes.forEach((filteredNode) => {
            this.getParents(filteredNode, []).forEach((node) => filteredNodesWithTheirParents.add(node));

            filteredNodesWithTheirParents.add(filteredNode);
        });

        this.filterModel.select(...Array.from(filteredNodesWithTheirParents) as []);

        this.filterValue.next(value);
    }
}
