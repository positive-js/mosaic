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

import {
    CanDisable, CanDisableCtor,
    HasTabIndex,
    HasTabIndexCtor,
    mixinDisabled,
    mixinTabIndex,
    toBoolean
} from '@ptsecurity/mosaic/core';

import { FocusKeyManager } from '@ptsecurity/cdk/a11y';

import { END, ENTER, HOME, LEFT_ARROW, PAGE_DOWN, PAGE_UP, RIGHT_ARROW, SPACE } from '@ptsecurity/cdk/keycodes';


/**
 * Wrapper for the CdkTree node with Material design styles.
 */
@Directive({
    exportAs: 'mcTreeOption',
    selector: 'mc-tree-option',
    host: {
        tabindex: '-1',
        class: 'mc-tree-node',
        '[class.mc-selected]': 'selected',
        '[class.mc-focused]': 'hasFocus',

        '(focus)': 'handleFocus()',
        '(blur)': 'handleBlur()',

        '(click)': 'handleClick()'
    },
    providers: [
        { provide: CdkTreeNode, useExisting: McTreeOption }
    ]
})
export class McTreeOption<T> extends CdkTreeNode<T> implements CanDisable {
    hasFocus: boolean = false;

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

    private _disabled: boolean = false;

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

    private _selected: boolean = false;

    constructor(
        protected elementRef: ElementRef,
        @Inject(forwardRef(() => McTreeSelection)) protected treeSelection: McTreeSelection<T>
    ) {
        super(elementRef, treeSelection);
    }

    focus(): void {
        this.elementRef.nativeElement.focus();

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

    getHeight(): number {
        return this.elementRef.nativeElement.getClientRects()[0].height;
    }

    handleFocus(): void {
        if (this.disabled || this.hasFocus) { return; }

        this.hasFocus = true;
    }

    handleBlur(): void {
        this.hasFocus = false;
    }

    handleClick(): void {
        if (this.disabled) { return; }

        this.treeSelection.setFocusedOption(this);
    }
}

export class McTreeNavigationChange {
    constructor(
        public source: McTreeSelection<any>,
        public option: McTreeOption<any>
    ) {}
}

export class McTreeSelectionChange<T> {
    constructor(public source: McTreeSelection<T>, public option: McTreeOption<any>) {}
}

class McTreeSelectionBase<T> extends CdkTree<T> {
    constructor(differs: IterableDiffers, changeDetectorRef: ChangeDetectorRef) {
        super(differs, changeDetectorRef);
    }
}

export const McTreeSelectionBaseMixin: HasTabIndexCtor & CanDisableCtor &
    typeof McTreeSelectionBase = mixinTabIndex(mixinDisabled(McTreeSelectionBase));


@Component({
    exportAs: 'mcTreeSelection',
    selector: 'mc-tree-selection',
    template: `<ng-container cdkTreeNodeOutlet></ng-container>`,
    host: {
        class: 'mc-tree-selection',

        '[attr.tabindex]': 'tabIndex',

        '(keydown)': 'onKeyDown($event)',
        '(window:resize)': 'updateScrollSize()'
    },
    styleUrls: ['./tree.css'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: CdkTree, useExisting: McTreeSelection }]
})
export class McTreeSelection<T> extends McTreeSelectionBaseMixin<T>
    implements AfterContentInit, CanDisable, HasTabIndex {
    // Outlets within the tree's template where the dataNodes will be inserted.
    @ViewChild(CdkTreeNodeOutlet) nodeOutlet: CdkTreeNodeOutlet;

    @ContentChildren(McTreeOption) options: QueryList<McTreeOption<T>>;

    keyManager: FocusKeyManager<McTreeOption<T>>;

    selectedOptions: SelectionModel<McTreeOption<T>>;

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
                /* tslint:disable-next-line:no-console */
                console.log('need disable all options');
            } else {
                /* tslint:disable-next-line:no-console */
                console.log('need enable all options');
            }
        }
    }

    @Output() readonly navigationChange = new EventEmitter<McTreeNavigationChange>();

    @Output() readonly selectionChange = new EventEmitter<McTreeSelectionChange<T>>();

    private _disabled: boolean = false;

    constructor(
        private elementRef: ElementRef,
        differs: IterableDiffers,
        changeDetectorRef: ChangeDetectorRef,
        @Attribute('tabindex') tabIndex: string,
        @Attribute('multiple') multiple: string,
        @Attribute('auto-select') autoSelect: string,
        @Attribute('no-unselect') noUnselect: string
    ) {
        super(differs, changeDetectorRef);

        this.tabIndex = parseInt(tabIndex) || 0;

        this.multiple = multiple === null ? true : toBoolean(multiple);
        this.autoSelect = autoSelect === null ? true : toBoolean(autoSelect);
        this.noUnselect = noUnselect === null ? true : toBoolean(noUnselect);

        this.selectedOptions = new SelectionModel<McTreeOption<T>>(this.multiple);
    }

    ngAfterContentInit(): void {
        this.keyManager = new FocusKeyManager<McTreeOption<T>>(this.options)
            .withTypeAhead()
            .withVerticalOrientation(true)
            .withHorizontalOrientation(null);
    }

    onKeyDown(event: KeyboardEvent) {
        const keyCode = event.keyCode;
        this.withShift = event.shiftKey;
        this.withCtrl = event.ctrlKey;

        switch (keyCode) {
            case LEFT_ARROW:
                if (this.keyManager.activeItem) {
                    this.treeControl.collapse(this.keyManager.activeItem.data);
                }

                event.preventDefault();

                break;
            case RIGHT_ARROW:
                if (this.keyManager.activeItem) {
                    this.treeControl.expand(this.keyManager.activeItem.data);
                }

                event.preventDefault();

                break;
            case SPACE:
            case ENTER:
                this.toggleFocusedOption();
                event.preventDefault();

                break;
            case HOME:
                this.keyManager.setFirstItemActive();
                event.preventDefault();

                break;
            case END:
                this.keyManager.setLastItemActive();
                event.preventDefault();

                break;
            case PAGE_UP:
                this.keyManager.setPreviousPageItemActive();
                event.preventDefault();

                break;
            case PAGE_DOWN:
                this.keyManager.setNextPageItemActive();
                event.preventDefault();

                break;
            default:
                this.keyManager.onKeydown(event);
        }
    }

    updateScrollSize(): void {
        if (!this.options.first) { return; }

        this.keyManager.withScrollSize(Math.floor(this.getHeight() / this.options.first.getHeight()));
    }

    setFocusedOption(option: McTreeOption<T>): void {
        this.keyManager.updateActiveItem(option);

        if (this.withShift && this.multiple) {
            const previousIndex = this.keyManager.previousActiveItemIndex;
            const activeIndex = this.keyManager.activeItemIndex;

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

            if (!this.canDeselectLast(option)) { return; }

            option.toggle();
        } else {
            if (this.autoSelect) {
                this.options.forEach((item) => item.setSelected(false));
                option.setSelected(true);
            }
        }

        this.emitNavigationEvent(option);
    }

    toggleFocusedOption(): void {
        const focusedIndex = this.keyManager.activeItemIndex;

        if (focusedIndex != null && this.isValidIndex(focusedIndex)) {
            const focusedOption: McTreeOption<T> = this.options.toArray()[focusedIndex];

            if (focusedOption && this.canDeselectLast(focusedOption)) {
                focusedOption.toggle();

                // Emit a change event because the focused option changed its state through user interaction.
                this.emitChangeEvent(focusedOption);
            }
        }
    }

    renderNodeChanges(
        data: T[],
        dataDiffer: IterableDiffer<T> = this.dataDiffer,
        viewContainer: any = this.nodeOutlet.viewContainer,
        parentData?: T
    ): void {
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

    getHeight(): number {
        return this.elementRef.nativeElement.getClientRects()[0].height;
    }

    emitNavigationEvent(option: McTreeOption<T>): void {
        this.navigationChange.emit(new McTreeNavigationChange(this, option));
    }

    emitChangeEvent(option: McTreeOption<T>): void {
        this.selectionChange.emit(new McTreeNavigationChange(this, option));
    }

    private isValidIndex(index: number): boolean {
        return index >= 0 && index < this.options.length;
    }

    private canDeselectLast(option: McTreeOption<T>): boolean {
        return !(this.noUnselect && this.selectedOptions.selected.length === 1 && option.selected);
    }
}

