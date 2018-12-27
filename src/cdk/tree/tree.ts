import {
    AfterContentChecked,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    Directive,
    ElementRef,
    Input,
    IterableChangeRecord,
    IterableDiffer,
    IterableDiffers,
    OnDestroy,
    OnInit,
    QueryList,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation,
    TrackByFunction, Inject, forwardRef
} from '@angular/core';

import { IFocusableOption } from '@ptsecurity/cdk/a11y';
import { ICollectionViewer, DataSource } from '@ptsecurity/cdk/collections';

import { BehaviorSubject, Observable, of as observableOf, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ITreeControl } from './control/tree-control';
import { CdkTreeNodeDef, CdkTreeNodeOutletContext } from './node';
import { CdkTreeNodeOutlet } from './outlet';
import {
    getTreeControlFunctionsMissingError,
    getTreeControlMissingError,
    getTreeMissingMatchingNodeDefError,
    getTreeMultipleDefaultNodeDefsError,
    getTreeNoValidDataSourceError
} from './tree-errors';


/**
 * Tree node for CdkTree. It contains the data in the tree node.
 */
@Directive({
    selector: 'cdk-tree-node',
    exportAs: 'cdkTreeNode',
    host: {
        '[attr.aria-expanded]': 'isExpanded',
        '[attr.aria-level]': 'role === "treeitem" ? level : null',
        '[attr.role]': 'role',
        class: 'cdk-tree-node'
    }
})
export class CdkTreeNode<T> implements IFocusableOption, OnDestroy {
    /**
     * The most recently created `CdkTreeNode`. We save it in static variable so we can retrieve it
     * in `CdkTree` and set the data to it.
     */
    static mostRecentTreeNode: CdkTreeNode<any> | null = null;

    /**
     * The role of the node should be 'group' if it's an internal node,
     * and 'treeitem' if it's a leaf node.
     */
    @Input() role: 'treeitem' | 'group' = 'treeitem';

    /** Subject that emits when the component has been destroyed. */
    protected _destroyed = new Subject<void>();

    protected _data: T;

    /** The tree node's data. */
    get data(): T {
        return this._data;
    }

    set data(value: T) {
        this._data = value;
        this._setRoleFromData();
    }

    get isExpanded(): boolean {
        return this._tree.treeControl.isExpanded(this._data);
    }

    get level(): number {
        return this._tree.treeControl.getLevel ? this._tree.treeControl.getLevel(this._data) : 0;
    }

    constructor(
        protected _elementRef: ElementRef,
        @Inject(forwardRef(() => CdkTree))
        protected _tree: CdkTree<T>
    ) {
        CdkTreeNode.mostRecentTreeNode = this as CdkTreeNode<T>;
    }

    ngOnDestroy() {
        this._destroyed.next();
        this._destroyed.complete();
    }

    /** Focuses the dropdown item. Implements for IFocusableOption. */
    focus(): void {
        this._elementRef.nativeElement.focus();
    }

    private _setRoleFromData(): void {
        if (this._tree.treeControl.isExpandable) {
            this.role = this._tree.treeControl.isExpandable(this._data) ? 'group' : 'treeitem';
        } else {
            if (!this._tree.treeControl.getChildren) {
                throw getTreeControlFunctionsMissingError();
            }

            this._tree.treeControl.getChildren(this._data).pipe(takeUntil(this._destroyed))
                .subscribe((children) => {
                    this.role = children && children.length ? 'group' : 'treeitem';
                });
        }
    }
}


/**
 * CDK tree component that connects with a data source to retrieve data of type `T` and renders
 * dataNodes with hierarchy. Updates the dataNodes when new data is provided by the data source.
 */
@Component({
    selector: 'cdk-tree',
    exportAs: 'cdkTree',
    template: `<ng-container cdkTreeNodeOutlet></ng-container>`,
    host: {
        class: 'cdk-tree',
        role: 'tree'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CdkTree<T> implements AfterContentChecked, ICollectionViewer, OnDestroy, OnInit {

    /** The tree controller */
    @Input() treeControl: ITreeControl<T>;

    /**
     * Tracking function that will be used to check the differences in data changes. Used similarly
     * to `ngFor` `trackBy` function. Optimize node operations by identifying a node based on its data
     * relative to the function to know if a node should be added/removed/moved.
     * Accepts a function that takes two parameters, `index` and `item`.
     */
    @Input() trackBy: TrackByFunction<T>;

    // Outlets within the tree's template where the dataNodes will be inserted.
    @ViewChild(CdkTreeNodeOutlet) _nodeOutlet: CdkTreeNodeOutlet;

    /** The tree node template for the tree */
    @ContentChildren(CdkTreeNodeDef) _nodeDefs: QueryList<CdkTreeNodeDef<T>>;

    // TODO(tinayuangao): Setup a listener for scrolling, emit the calculated view to viewChange.
    //     Remove the MAX_VALUE in viewChange
    /**
     * Stream containing the latest information on what rows are being displayed on screen.
     * Can be used by the data source to as a heuristic of what data should be provided.
     */
    viewChange =
        new BehaviorSubject<{ start: number, end: number }>({ start: 0, end: Number.MAX_VALUE });

    /** Differ used to find the changes in the data provided by the data source. */
    protected _dataDiffer: IterableDiffer<T>;

    /** Subject that emits when the component has been destroyed. */
    private _onDestroy = new Subject<void>();


    /** Stores the node definition that does not have a when predicate. */
    private _defaultNodeDef: CdkTreeNodeDef<T> | null;

    /** Data subscription */
    private _dataSubscription: Subscription | null;

    /** Level of nodes */
    private _levels: Map<T, number> = new Map<T, number>();

    /**
     * Provides a stream containing the latest data array to render. Influenced by the tree's
     * stream of view window (what dataNodes are currently on screen).
     * Data source can be an observable of data array, or a dara array to render.
     */
    @Input()
    get dataSource(): DataSource<T> | Observable<T[]> | T[] {
        return this._dataSource;
    }

    set dataSource(dataSource: DataSource<T> | Observable<T[]> | T[]) {
        if (this._dataSource !== dataSource) {
            this._switchDataSource(dataSource);
        }
    }

    private _dataSource: DataSource<T> | Observable<T[]> | T[];

    constructor(
        private _differs: IterableDiffers,
        private _changeDetectorRef: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this._dataDiffer = this._differs.find([]).create(this.trackBy);

        if (!this.treeControl) {
            throw getTreeControlMissingError();
        }
    }

    ngOnDestroy() {
        this._nodeOutlet.viewContainer.clear();

        this._onDestroy.next();
        this._onDestroy.complete();

        if (this._dataSource && typeof (this._dataSource as DataSource<T>).disconnect === 'function') {
            (this.dataSource as DataSource<T>).disconnect(this);
        }

        if (this._dataSubscription) {
            this._dataSubscription.unsubscribe();
            this._dataSubscription = null;
        }
    }

    ngAfterContentChecked() {
        const defaultNodeDefs = this._nodeDefs.filter((def) => !def.when);
        if (defaultNodeDefs.length > 1) {
            throw getTreeMultipleDefaultNodeDefsError();
        }
        this._defaultNodeDef = defaultNodeDefs[0];

        if (this.dataSource && this._nodeDefs && !this._dataSubscription) {
            this._observeRenderChanges();
        }
    }

    /** Check for changes made in the data and render each change (node added/removed/moved). */
    renderNodeChanges(
        data: T[],
        dataDiffer: IterableDiffer<T> = this._dataDiffer,
        viewContainer: ViewContainerRef = this._nodeOutlet.viewContainer,
        parentData?: T
    ) {
        const changes = dataDiffer.diff(data);

        if (!changes) { return; }

        changes.forEachOperation((item: IterableChangeRecord<T>,
                                  adjustedPreviousIndex: number | null,
                                  currentIndex: number | null) => {
            if (item.previousIndex == null) {
                this.insertNode(data[currentIndex!], currentIndex!, viewContainer, parentData);
            } else if (currentIndex == null) {
                viewContainer.remove(adjustedPreviousIndex!);
                this._levels.delete(item.item);
            } else {
                const view = viewContainer.get(adjustedPreviousIndex!);
                viewContainer.move(view!, currentIndex);
            }
        });

        this._changeDetectorRef.detectChanges();
    }

    /**
     * Finds the matching node definition that should be used for this node data. If there is only
     * one node definition, it is returned. Otherwise, find the node definition that has a when
     * predicate that returns true with the data. If none return true, return the default node
     * definition.
     */
    _getNodeDef(data: T, i: number): CdkTreeNodeDef<T> {
        if (this._nodeDefs.length === 1) { return this._nodeDefs.first; }

        const nodeDef =
            this._nodeDefs.find((def) => def.when && def.when(i, data)) || this._defaultNodeDef;

        if (!nodeDef) { throw getTreeMissingMatchingNodeDefError(); }

        return nodeDef;
    }

    /**
     * Create the embedded view for the data node template and place it in the correct index location
     * within the data node view container.
     */
    insertNode(nodeData: T, index: number, viewContainer?: ViewContainerRef, parentData?: T) {
        const node = this._getNodeDef(nodeData, index);

        // Node context that will be provided to created embedded view
        const context = new CdkTreeNodeOutletContext<T>(nodeData);

        // If the tree is flat tree, then use the `getLevel` function in flat tree control
        // Otherwise, use the level of parent node.
        if (this.treeControl.getLevel) {
            context.level = this.treeControl.getLevel(nodeData);
        } else if (typeof parentData !== 'undefined' && this._levels.has(parentData)) {
            context.level = this._levels.get(parentData)! + 1;
        } else {
            context.level = 0;
        }

        this._levels.set(nodeData, context.level);

        // Use default tree nodeOutlet, or nested node's nodeOutlet
        const container = viewContainer ? viewContainer : this._nodeOutlet.viewContainer;
        container.createEmbeddedView(node.template, context, index);

        // Set the data to just created `CdkTreeNode`.
        // The `CdkTreeNode` created from `createEmbeddedView` will be saved in static variable
        //     `mostRecentTreeNode`. We get it from static variable and pass the node data to it.
        if (CdkTreeNode.mostRecentTreeNode) {
            CdkTreeNode.mostRecentTreeNode.data = nodeData;
        }
    }

    /** Set up a subscription for the data provided by the data source. */
    private _observeRenderChanges() {
        let dataStream: Observable<T[]> | undefined;

        // Cannot use `instanceof DataSource` since the data source could be a literal with
        // `connect` function and may not extends DataSource.
        if (typeof (this._dataSource as DataSource<T>).connect === 'function') {
            dataStream = (this._dataSource as DataSource<T>).connect(this);
        } else if (this._dataSource instanceof Observable) {
            dataStream = this._dataSource;
        } else if (Array.isArray(this._dataSource)) {
            dataStream = observableOf(this._dataSource);
        }

        if (dataStream) {
            this._dataSubscription = dataStream
                .pipe(takeUntil(this._onDestroy))
                .subscribe((data) => this.renderNodeChanges(data));
        } else {
            throw getTreeNoValidDataSourceError();
        }
    }

    /**
     * Switch to the provided data source by resetting the data and unsubscribing from the current
     * render change subscription if one exists. If the data source is null, interpret this by
     * clearing the node outlet. Otherwise start listening for new data.
     */
    private _switchDataSource(dataSource: DataSource<T> | Observable<T[]> | T[]) {
        if (this._dataSource && typeof (this._dataSource as DataSource<T>).disconnect === 'function') {
            (this.dataSource as DataSource<T>).disconnect(this);
        }

        if (this._dataSubscription) {
            this._dataSubscription.unsubscribe();
            this._dataSubscription = null;
        }

        // Remove the all dataNodes if there is now no data source
        if (!dataSource) { this._nodeOutlet.viewContainer.clear(); }

        this._dataSource = dataSource;

        if (this._nodeDefs) { this._observeRenderChanges(); }
    }
}
