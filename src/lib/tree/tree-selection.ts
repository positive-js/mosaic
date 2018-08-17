import {
    AfterContentInit,
    Attribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, ContentChildren, EventEmitter, forwardRef, Input, IterableDiffer,
    IterableDiffers, Output, QueryList,
    ViewChild,
    ViewEncapsulation,
    Directive, ElementRef, Inject
} from '@angular/core';
import { NodeDef, ViewData } from '@angular/core/src/view';

import { SelectionModel } from '@ptsecurity/cdk/collections';
import { CdkTreeNode, CdkTree, CdkTreeNodeOutlet } from '@ptsecurity/cdk/tree';

import { CanDisable, HasTabIndex, mixinDisabled, mixinTabIndex, toBoolean } from '@ptsecurity/mosaic/core';

import { FocusKeyManager } from '@ptsecurity/cdk/a11y';

import { END, ENTER, HOME, LEFT_ARROW, PAGE_DOWN, PAGE_UP, RIGHT_ARROW, SPACE } from '@ptsecurity/cdk/keycodes';


/**
 * Wrapper for the CdkTree node with Material design styles.
 */
@Directive({
    exportAs: 'mcTreeNodeOption',
    selector: 'mc-tree-node-option',
    host: {
        tabindex: '-1',
        '[class.mc-selected]': 'selected',
        '[class.mc-focused]': '_hasFocus',
        '[attr.aria-expanded]': 'isExpanded',
        '[attr.aria-level]': 'role === "treeitem" ? level : null',
        class: 'mc-tree-node',

        '(focus)': '_handleFocus()',
        '(blur)': '_handleBlur()',

        '(click)': '_handleClick()'
    },
    providers: [
        { provide: CdkTreeNode, useExisting: McTreeNodeOption }
    ]
})
export class McTreeNodeOption<T> extends CdkTreeNode<T> implements CanDisable {
    @Input() role: 'treeitem' | 'group' = 'treeitem';

    @Input()
    get disabled() {
        return this._disabled;
    }

    set disabled(value: any) {
        const newValue = toBoolean(value);

        if (newValue !== this._disabled) {
            this._disabled = newValue;
        }
    }

    @Input()
    get selected(): boolean {
        return this.treeSelection.selectedOptions && this.treeSelection.selectedOptions.isSelected(this) || false;
    }

    set selected(value: boolean) {
        const isSelected = toBoolean(value);

        if (isSelected !== this._selected) {
            this.setSelected(isSelected);

            // this.treeSelection._reportValueChange();
        }
    }

    private _hasFocus: boolean = false;

    private _disabled: boolean = false;
    private _selected: boolean = false;

    constructor(
        protected _elementRef: ElementRef,
        @Inject(forwardRef(() => McTreeSelection))
        protected treeSelection: McTreeSelection<T>
    ) {
        super(_elementRef, treeSelection);
    }

    focus(): void {
        this._elementRef.nativeElement.focus();

        this.treeSelection.setFocusedOption(this);
    }

    toggle(): void {
        this.selected = !this.selected;
    }

    setSelected(selected: boolean) {
        if (this._selected === selected || !this.treeSelection.selectedOptions) { return; }

        this._selected = selected;

        if (selected) {
            this.treeSelection.selectedOptions.select(this);
        } else {
            this.treeSelection.selectedOptions.deselect(this);
        }

        // this._changeDetector.markForCheck();
    }

    _getHeight(): number {
        return this._elementRef.nativeElement.getClientRects()[0].height;
    }

    _handleFocus(): void {
        if (this.disabled || this._hasFocus) { return; }

        this._hasFocus = true;
    }

    _handleBlur(): void {
        this._hasFocus = false;
    }

    _handleClick(): void {
        if (this.disabled) { return; }

        this.treeSelection.setFocusedOption(this);
    }
}

export const _McTreeSelectionBase = mixinTabIndex(mixinDisabled(CdkTree));

export class McTreeNavigationChange {
    constructor(
        public source: McTreeSelection<any>,
        public option: McTreeNodeOption<any>
    ) {}
}

export class McTreeSelectionChange {
    constructor(
        public source: McTreeSelection<any>,
        public option: McTreeNodeOption<any>
    ) {}
}

@Component({
    exportAs: 'mcTreeSelection',
    selector: 'mc-tree-selection',
    template: `<ng-container cdkTreeNodeOutlet></ng-container>`,
    host: {
        '[tabIndex]': 'tabIndex',
        class: 'mc-tree-selection',
        role: 'tree-selection',
        '(keydown)': '_onKeyDown($event)',
        '(window:resize)': 'updateScrollSize()'
    },
    styleUrls: ['./tree.css'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: CdkTree, useExisting: McTreeSelection }]
})
export class McTreeSelection<T> extends _McTreeSelectionBase<T>
    implements AfterContentInit, CanDisable, HasTabIndex {
    // Outlets within the tree's template where the dataNodes will be inserted.
    @ViewChild(CdkTreeNodeOutlet) _nodeOutlet: CdkTreeNodeOutlet;

    @ContentChildren(forwardRef(() => McTreeNodeOption)) options: QueryList<McTreeNodeOption<T>>;

    _keyManager: FocusKeyManager<McTreeNodeOption<T>>;

    selectedOptions: SelectionModel<McTreeNodeOption<T>>;

    _disabled: boolean = false;
    tabIndex: number;
    multiple: boolean;
    autoSelect: boolean;
    noUnselect: boolean;

    // todo temporary solution
    withShift: boolean;
    withCtrl: boolean;

    @Input()
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(rawValue: boolean) {
        const value = toBoolean(rawValue);

        if (this._disabled !== value) {
            this._disabled = value;

            if (this._disabled) {
                console.log('need disable all options');
            } else {
                console.log('need enable all options');
            }
        }
    }

    @Output() readonly navigationChange = new EventEmitter<McTreeNavigationChange>();

    @Output() readonly selectionChange = new EventEmitter<McTreeSelectionChange>();

    constructor(
        private _elementRef: ElementRef,
        _differs: IterableDiffers,
        _changeDetectorRef: ChangeDetectorRef,
        @Attribute('tabindex') tabIndex: string,
        @Attribute('multiple') multiple: string,
        @Attribute('auto-select') autoSelect: string,
        @Attribute('no-unselect') noUnselect: string
    ) {
        super(_differs, _changeDetectorRef);

        this.tabIndex = parseInt(tabIndex) || 0;

        this.multiple = multiple === null ? true : toBoolean(multiple);
        this.autoSelect = autoSelect === null ? true : toBoolean(autoSelect);
        this.noUnselect = noUnselect === null ? true : toBoolean(noUnselect);

        this.selectedOptions = new SelectionModel<McTreeNodeOption<T>>(this.multiple);
    }

    _onKeyDown(event: KeyboardEvent) {
        const keyCode = event.keyCode;
        this.withShift = event.shiftKey;
        this.withCtrl = event.ctrlKey;

        switch (keyCode) {
            case LEFT_ARROW:
                if (this._keyManager.activeItem) {
                    this.treeControl.collapse(this._keyManager.activeItem.data);
                }

                event.preventDefault();

                break;
            case RIGHT_ARROW:
                if (this._keyManager.activeItem) {
                    this.treeControl.expand(this._keyManager.activeItem.data);
                }

                event.preventDefault();

                break;
            case SPACE:
            case ENTER:
                this.toggleFocusedOption();
                event.preventDefault();

                break;
            case HOME:
                this._keyManager.setFirstItemActive();
                event.preventDefault();

                break;
            case END:
                this._keyManager.setLastItemActive();
                event.preventDefault();

                break;
            case PAGE_UP:
                this._keyManager.setPreviousPageItemActive();
                event.preventDefault();

                break;
            case PAGE_DOWN:
                this._keyManager.setNextPageItemActive();
                event.preventDefault();

                break;
            default:
                this._keyManager.onKeydown(event);
        }
    }

    ngAfterContentInit(): void {
        this._keyManager = new FocusKeyManager<McTreeNodeOption<T>>(this.options)
            .withTypeAhead()
            .withVerticalOrientation(true)
            .withHorizontalOrientation(null);
    }

    updateScrollSize(): void {
        if (!this.options.first) { return; }

        this._keyManager.withScrollSize(Math.floor(this._getHeight() / this.options.first._getHeight()));
    }

    setFocusedOption(option: McTreeNodeOption<T>): void {
        this._keyManager.updateActiveItem(option);

        if (this.withShift && this.multiple) {
            const previousIndex = this._keyManager.previousActiveItemIndex;
            const activeIndex = this._keyManager.activeItemIndex;

            if (previousIndex < activeIndex) {
                this.options.forEach((item, index) => {
                    if (index >= previousIndex && index <= activeIndex) { item.setSelected(true); }
                });
            } else {
                this.options.forEach((item, index) => {
                    if (index >= activeIndex && index <= previousIndex) { item.setSelected(true); }
                });
            }

            this.withShift = false;
        } else if (this.withCtrl) {
            this.withCtrl = false;

            if (!this._canDeselectLast(option)) { return; }

            option.toggle();
        } else {
            if (this.autoSelect) {
                this.options.forEach((item) => item.setSelected(false));
                option.setSelected(true);
            }
        }

        this._emitNavigationEvent(option);
    }

    // Toggles the selected state of the currently focused option.
    toggleFocusedOption(): void {
        const focusedIndex = this._keyManager.activeItemIndex;

        if (focusedIndex != null && this._isValidIndex(focusedIndex)) {
            const focusedOption: McTreeNodeOption<T> = this.options.toArray()[focusedIndex];

            if (focusedOption && this._canDeselectLast(focusedOption)) {
                focusedOption.toggle();

                // Emit a change event because the focused option changed its state through user interaction.
                this._emitChangeEvent(focusedOption);
            }
        }
    }

    renderNodeChanges(
        data: T[],
        dataDiffer: IterableDiffer<T> = this._dataDiffer,
        viewContainer: any = this._nodeOutlet.viewContainer,
        parentData?: T
    ) {
        super.renderNodeChanges(data, dataDiffer, viewContainer, parentData);

        const arrayOfInstances = [];

        viewContainer._embeddedViews.forEach((view: ViewData) => {
            const viewDef = view.def;

            viewDef.nodes.forEach((node: NodeDef) => {
                if (viewDef.nodeMatchedQueries === node.matchedQueryIds) {
                    const nodeData: any = view.nodes[node.nodeIndex];

                    arrayOfInstances.push(nodeData.instance as never);
                }
            });
        });

        if (this.options) {
            this.options.reset(arrayOfInstances);
            this.options.notifyOnChanges();
        }

        this.updateScrollSize();
    }

    _getHeight(): number {
        return this._elementRef.nativeElement.getClientRects()[0].height;
    }

    _emitNavigationEvent(option: McTreeNodeOption<T>): void {
        this.navigationChange.emit(new McTreeNavigationChange(this, option));
    }

    _emitChangeEvent(option: McTreeNodeOption<T>): void {
        this.selectionChange.emit(new McTreeNavigationChange(this, option));
    }

    /**
     * Utility to ensure all indexes are valid.
     * @param index The index to be checked.
     * @returns True if the index is valid for our list of options.
     */
    private _isValidIndex(index: number): boolean {
        return index >= 0 && index < this.options.length;
    }

    private _canDeselectLast(option: McTreeNodeOption<T>): boolean {
        return !(this.noUnselect && this.selectedOptions.selected.length === 1 && option.selected);
    }
}

