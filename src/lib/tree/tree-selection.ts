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
import { FocusKeyManager } from '@ptsecurity/cdk/a11y';
import { SelectionModel } from '@ptsecurity/cdk/collections';
import { END, ENTER, HOME, LEFT_ARROW, PAGE_DOWN, PAGE_UP, RIGHT_ARROW, SPACE } from '@ptsecurity/cdk/keycodes';
import { CdkTreeNode, CdkTree, CdkTreeNodeOutlet } from '@ptsecurity/cdk/tree';
import {
    CanDisable,
    CanDisableCtor,
    HasTabIndex,
    HasTabIndexCtor,
    mixinDisabled,
    mixinTabIndex,
    toBoolean
} from '@ptsecurity/mosaic/core';


export class McTreeOptionChange {
    constructor(public source: McTreeOption, public isUserInput = false) {}
}

let uniqueIdCounter: number = 0;

@Directive({
    selector: 'mc-tree-option',
    exportAs: 'mcTreeOption',
    host: {
        tabindex: '-1',
        class: 'mc-tree-option',
        '[class.mc-selected]': 'selected',
        '[class.mc-focused]': 'hasFocus',
        // todo унифицировать!
        '[class.mc-active]': 'active',

        '(focus)': 'handleFocus()',
        '(blur)': 'handleBlur()',

        '(click)': 'handleClick()'
    },
    providers: [
        { provide: CdkTreeNode, useExisting: McTreeOption }
    ]
})
export class McTreeOption extends CdkTreeNode<McTreeOption> implements CanDisable {
    hasFocus: boolean = false;

    // tslint:disable-next-line:no-output-on-prefix
    @Output() readonly onSelectionChange = new EventEmitter<McTreeOptionChange>();

    @Input() value: any;

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
        return this.treeSelection.selectionModel && this.treeSelection.selectionModel.isSelected(this) || false;
    }

    set selected(value: boolean) {
        const isSelected = toBoolean(value);

        if (isSelected !== this._selected) {
            this.setSelected(isSelected);

            // this.treeSelection._reportValueChange();
        }
    }

    private _selected: boolean = false;

    /**
     * Whether or not the option is currently active and ready to be selected.
     * An active option displays styles as if it is focused, but the
     * focus is actually retained somewhere else. This comes in handy
     * for components like autocomplete where focus must remain on the input.
     */
    get active(): boolean {
        return this._active;
    }

    private _active = false;

    get id(): string {
        return this._id;
    }

    private _id = `mc-option-${uniqueIdCounter++}`;

    get multiple(): boolean {
        return this.treeSelection.multiple;
    }

    constructor(
        protected elementRef: ElementRef,
        protected changeDetectorRef: ChangeDetectorRef,
        @Inject(forwardRef(() => McTreeSelection)) protected treeSelection: McTreeSelection
    ) {
        // todo any
        super(elementRef, treeSelection as any);
    }

    focus(): void {
        this.elementRef.nativeElement.focus();

        this.treeSelection.setFocusedOption(this);
    }

    toggle(): void {
        this.selected = !this.selected;
    }

    setSelected(selected: boolean) {
        if (this._selected === selected || !this.treeSelection.selectionModel) { return; }

        this._selected = selected;

        if (selected) {
            this.treeSelection.selectionModel.select(this);
        } else {
            this.treeSelection.selectionModel.deselect(this);
        }

        // this._changeDetector.markForCheck();
    }

    /**
     * This method sets display styles on the option to make it appear
     * active. This is used by the ActiveDescendantKeyManager so key
     * events will display the proper options as active on arrow key events.
     */
    setActiveStyles(): void {
        if (!this._active) {
            this._active = true;
            this.changeDetectorRef.markForCheck();
        }
    }

    /**
     * This method removes display styles on the option that made it appear
     * active. This is used by the ActiveDescendantKeyManager so key
     * events will display the proper options as active on arrow key events.
     */
    setInactiveStyles(): void {
        if (this._active) {
            this._active = false;
            this.changeDetectorRef.markForCheck();
        }
    }

    getHeight(): number {
        const clientRects = this.elementRef.nativeElement.getClientRects();
        if (clientRects.length) {
            return clientRects[0].height;
        }

        return 0;
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

    /**
     * The displayed value of the option. It is necessary to show the selected option in the
     * select's trigger.
     */
    get viewValue(): string {
        // TODO(kara): Add input property alternative for node envs.
        return (this.getHostElement().textContent || '').trim();
    }

    select(): void {
        if (!this._selected) {
            this._selected = true;

            this.changeDetectorRef.markForCheck();
        }
    }

    deselect(): void {
        if (this._selected) {
            this._selected = false;

            this.changeDetectorRef.markForCheck();
        }
    }

    selectViaInteraction(): void {
        if (!this.disabled) {
            this._selected = this.multiple ? !this._selected : true;

            this.changeDetectorRef.markForCheck();
            this.emitSelectionChangeEvent(true);
        }
    }

    /** Emits the selection change event. */
    emitSelectionChangeEvent(isUserInput = false): void {
        this.onSelectionChange.emit(new McTreeOptionChange(this, isUserInput));
    }

    getHostElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }
}

export class McTreeNavigationChange {
    constructor(
        public source: McTreeSelection,
        public option: McTreeOption
    ) {}
}

export class McTreeSelectionChange {
    constructor(public source: McTreeSelection, public option: McTreeOption) {}
}

class McTreeSelectionBase<T> extends CdkTree<T> {
    constructor(differs: IterableDiffers, changeDetectorRef: ChangeDetectorRef) {
        super(differs, changeDetectorRef);
    }
}

const McTreeSelectionBaseMixin: HasTabIndexCtor & CanDisableCtor &
    typeof McTreeSelectionBase = mixinTabIndex(mixinDisabled(McTreeSelectionBase));


@Component({
    selector: 'mc-tree-selection',
    exportAs: 'mcTreeSelection',
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
export class McTreeSelection extends McTreeSelectionBaseMixin<McTreeOption>
    implements AfterContentInit, CanDisable, HasTabIndex {

    @ViewChild(CdkTreeNodeOutlet) nodeOutlet: CdkTreeNodeOutlet;

    @ContentChildren(McTreeOption) options: QueryList<McTreeOption>;

    keyManager: FocusKeyManager<McTreeOption>;

    selectionModel: SelectionModel<McTreeOption>;

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

    @Output() readonly selectionChange = new EventEmitter<McTreeSelectionChange>();

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

        this.selectionModel = new SelectionModel<McTreeOption>(this.multiple);
    }

    ngAfterContentInit(): void {
        this.keyManager = new FocusKeyManager<McTreeOption>(this.options)
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

    setFocusedOption(option: McTreeOption) {
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
            const focusedOption: McTreeOption = this.options.toArray()[focusedIndex];

            if (focusedOption && this.canDeselectLast(focusedOption)) {
                focusedOption.toggle();

                // Emit a change event because the focused option changed its state through user interaction.
                this.emitChangeEvent(focusedOption);
            }
        }
    }

    renderNodeChanges(
        data: McTreeOption[],
        dataDiffer: IterableDiffer<McTreeOption> = this.dataDiffer,
        viewContainer: any = this.nodeOutlet.viewContainer,
        parentData?: McTreeOption
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
        const clientRects = this.elementRef.nativeElement.getClientRects();
        if (clientRects.length) {
            return clientRects[0].height;
        }

        return 0;
    }

    emitNavigationEvent(option: McTreeOption): void {
        this.navigationChange.emit(new McTreeNavigationChange(this, option));
    }

    emitChangeEvent(option: McTreeOption): void {
        this.selectionChange.emit(new McTreeNavigationChange(this, option));
    }

    private isValidIndex(index: number): boolean {
        return index >= 0 && index < this.options.length;
    }

    private canDeselectLast(option: McTreeOption): boolean {
        return !(this.noUnselect && this.selectionModel.selected.length === 1 && option.selected);
    }
}

