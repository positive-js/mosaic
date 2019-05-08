import {
    AfterContentInit,
    Attribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    EventEmitter,
    Input,
    IterableDiffer,
    IterableDiffers,
    Output,
    QueryList,
    ViewChild,
    ViewEncapsulation,
    ElementRef
} from '@angular/core';
import { NodeDef, ViewData } from '@angular/core/src/view';
import { ActiveDescendantKeyManager } from '@ptsecurity/cdk/a11y';
import { SelectionModel } from '@ptsecurity/cdk/collections';
import { END, ENTER, HOME, LEFT_ARROW, PAGE_DOWN, PAGE_UP, RIGHT_ARROW, SPACE } from '@ptsecurity/cdk/keycodes';
import { CdkTree, CdkTreeNodeOutlet } from '@ptsecurity/cdk/tree';
import {
    CanDisable,
    CanDisableCtor,
    HasTabIndex,
    HasTabIndexCtor,
    mixinDisabled,
    mixinTabIndex,
    toBoolean
} from '@ptsecurity/mosaic/core';
import { Subject } from 'rxjs';

import { MC_TREE_OPTION_PARENT_COMPONENT, McTreeOption } from './tree-option';


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

/* tslint:disable-next-line:naming-convention */
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
    providers: [
        { provide: MC_TREE_OPTION_PARENT_COMPONENT, useExisting: McTreeSelection },
        { provide: CdkTree, useExisting: McTreeSelection }
    ]
})
export class McTreeSelection extends McTreeSelectionBaseMixin<McTreeOption>
    implements AfterContentInit, CanDisable, HasTabIndex {

    @ViewChild(CdkTreeNodeOutlet) nodeOutlet: CdkTreeNodeOutlet;

    @ContentChildren(McTreeOption) options: QueryList<McTreeOption>;

    keyManager: ActiveDescendantKeyManager<McTreeOption>;

    selectionModel: SelectionModel<McTreeOption>;

    tabIndex: number;
    multiple: boolean;
    autoSelect: boolean;
    noUnselect: boolean;

    // todo temporary solution
    withShift: boolean;
    withCtrl: boolean;


    @Output() readonly navigationChange = new EventEmitter<McTreeNavigationChange>();

    @Output() readonly selectionChange = new EventEmitter<McTreeSelectionChange>();

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

    private _disabled: boolean = false;

    private readonly destroy = new Subject<void>();

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

        this.multiple = multiple === null ? false : toBoolean(multiple);
        this.autoSelect = autoSelect === null ? true : toBoolean(autoSelect);
        this.noUnselect = noUnselect === null ? true : toBoolean(noUnselect);

        this.selectionModel = new SelectionModel<McTreeOption>(this.multiple);
    }

    ngAfterContentInit(): void {
        this.keyManager = new ActiveDescendantKeyManager<McTreeOption>(this.options)
            .withVerticalOrientation(true)
            .withHorizontalOrientation(null);
    }

    ngOnDestroy() {
        this.destroy.next();

        this.destroy.complete();
    }

    onKeyDown(event: KeyboardEvent) {
        // tslint:disable-next-line: deprecation
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
        this.keyManager.setActiveItem(option);

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

