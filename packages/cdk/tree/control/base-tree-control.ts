import { SelectionModel } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';

import { TreeControl } from './tree-control';


/** Base tree control. It has basic toggle/expand/collapse operations on a single data node. */
/* tslint:disable-next-line:naming-convention */
export abstract class BaseTreeControl<T> implements TreeControl<T> {

    dataNodes: T[];

    /** A selection model with multi-selection to track expansion status. */
    expansionModel: SelectionModel<T> = new SelectionModel<T>(true);

    filterModel: SelectionModel<T> = new SelectionModel<T>(true);

    filterValue = new BehaviorSubject<string>('');

    /** Get depth of a given data node, return the level number. This is for flat tree node. */
    getLevel: (dataNode: T) => number;

    /**
     * Whether the data node is expandable. Returns true if expandable.
     * This is for flat tree node.
     */
    isExpandable: (dataNode: T) => boolean;

    /** Gets a stream that emits whenever the given data node's children change. */
    getChildren: (dataNode: T) => Observable<T[]>;

    /** Gets a list of descendent data nodes of a subtree rooted at given data node recursively. */
    abstract getDescendants(dataNode: T): T[];

    /** Expands all data nodes in the tree. */
    abstract expandAll(): void;

    /** Toggles one single data node's expanded/collapsed state. */
    toggle(dataNode: T): void {
        if (this.filterValue.value) { return; }

        this.expansionModel.toggle(dataNode);
    }

    /** Expands one single data node. */
    expand(dataNode: T): void {
        this.expansionModel.select(dataNode);
    }

    /** Collapses one single data node. */
    collapse(dataNode: T): void {
        this.expansionModel.deselect(dataNode);
    }

    /** Whether a given data node is expanded or not. Returns true if the data node is expanded. */
    isExpanded(dataNode: T): boolean {
        return this.expansionModel.isSelected(dataNode);
    }

    /** Toggles a subtree rooted at `node` recursively. */
    toggleDescendants(dataNode: T): void {
        this.expansionModel.isSelected(dataNode)
            ? this.collapseDescendants(dataNode)
            : this.expandDescendants(dataNode);
    }

    /** Collapse all dataNodes in the tree. */
    collapseAll(): void {
        this.expansionModel.clear();
    }

    /** Expands a subtree rooted at given data node recursively. */
    expandDescendants(dataNode: T): void {
        const toBeProcessed = [dataNode];
        toBeProcessed.push(...this.getDescendants(dataNode));
        this.expansionModel.select(...toBeProcessed);
    }

    /** Collapses a subtree rooted at given data node recursively. */
    collapseDescendants(dataNode: T): void {
        const toBeProcessed = [dataNode];
        toBeProcessed.push(...this.getDescendants(dataNode));
        this.expansionModel.deselect(...toBeProcessed);
    }
}
