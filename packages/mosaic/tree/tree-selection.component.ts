/* tslint:disable:no-empty */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import {
    AfterContentInit,
    Attribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input,
    IterableDiffer,
    IterableDiffers,
    Output,
    QueryList,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { NodeDef, ViewData } from '@angular/core/esm2015/src/view';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FocusKeyManager } from '@ptsecurity/cdk/a11y';
import {
    END,
    ENTER,
    hasModifierKey,
    HOME,
    LEFT_ARROW,
    PAGE_DOWN,
    PAGE_UP,
    RIGHT_ARROW,
    SPACE
} from '@ptsecurity/cdk/keycodes';
import { CdkTree, CdkTreeNodeOutlet, FlatTreeControl } from '@ptsecurity/cdk/tree';
import { CanDisable, getMcSelectNonArrayValueError, HasTabIndex } from '@ptsecurity/mosaic/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MC_TREE_OPTION_PARENT_COMPONENT, McTreeOption, MultipleMode } from './tree-option.component';


export const MC_SELECTION_TREE_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => McTreeSelection),
    multi: true
};

export class McTreeNavigationChange {
    constructor(
        public source: McTreeSelection,
        public option: McTreeOption
    ) {}
}

export class McTreeSelectionChange {
    constructor(public source: McTreeSelection, public option: McTreeOption) {}
}

// tslint:disable-next-line:naming-convention
interface SelectionModelOption {
    id: number | string;
    value: string;
}


@Component({
    selector: 'mc-tree-selection',
    exportAs: 'mcTreeSelection',
    template: '<ng-container cdkTreeNodeOutlet></ng-container>',
    host: {
        class: 'mc-tree-selection',

        '[tabindex]': 'tabIndex',

        '(keydown)': 'onKeyDown($event)',
        '(window:resize)': 'updateScrollSize()'
    },
    styleUrls: ['./tree.css'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        MC_SELECTION_TREE_VALUE_ACCESSOR,
        { provide: MC_TREE_OPTION_PARENT_COMPONENT, useExisting: McTreeSelection },
        { provide: CdkTree, useExisting: McTreeSelection }
    ]
})
export class McTreeSelection extends CdkTree<McTreeOption>
    implements ControlValueAccessor, AfterContentInit, CanDisable, HasTabIndex {

    @ViewChild(CdkTreeNodeOutlet, { static: true }) nodeOutlet: CdkTreeNodeOutlet;

    @ContentChildren(McTreeOption) renderedOptions: QueryList<McTreeOption>;

    keyManager: FocusKeyManager<McTreeOption>;

    selectionModel: SelectionModel<SelectionModelOption>;

    @Input() treeControl: FlatTreeControl<McTreeOption>;

    @Output() readonly navigationChange = new EventEmitter<McTreeNavigationChange>();

    @Output() readonly selectionChange = new EventEmitter<McTreeSelectionChange>();

    @Input('multiple')
    multipleMode?: MultipleMode;

    get multiple(): boolean {
        return !!this.multipleMode;
    }

    set multiple(value: boolean) {
        this.multipleMode = coerceBooleanProperty(value) ? this.multipleMode || MultipleMode.CHECKBOX : undefined;
    }

    @Input()
    get autoSelect(): boolean {
        return this._autoSelect;
    }

    set autoSelect(value: boolean) {
        this._autoSelect = coerceBooleanProperty(value);
    }

    private _autoSelect: boolean = true;

    @Input()
    get noUnselectLast(): boolean {
        return this._noUnselectLast;
    }

    set noUnselectLast(value: boolean) {
        this._noUnselectLast = coerceBooleanProperty(value);
    }

    private _noUnselectLast: boolean = true;

    @Input()
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(rawValue: boolean) {
        const value = coerceBooleanProperty(rawValue);

        if (this._disabled !== value) {
            this._disabled = value;

            this.markOptionsForCheck();
        }
    }

    private _disabled: boolean = false;

    get tabIndex(): number {
        return this.disabled ? -1 : this._tabIndex;
    }

    set tabIndex(value: number) {
        this._tabIndex = value != null ? value : 0;
    }

    private _tabIndex: number;

    private readonly destroy = new Subject<void>();

    constructor(
        private elementRef: ElementRef,
        differs: IterableDiffers,
        changeDetectorRef: ChangeDetectorRef,
        @Attribute('tabindex') tabIndex: string,
        @Attribute('multiple') private multipleAttr: string
    ) {
        super(differs, changeDetectorRef);

        this.tabIndex = parseInt(tabIndex) || 0;
    }

    ngOnInit() {
        super.ngOnInit();

        if (this.multipleAttr !== null) {
            this.multiple = true;
        }

        if (this.multiple) {
            this.autoSelect = false;
            this.noUnselectLast = false;
        }

        this.selectionModel = new SelectionModel<SelectionModelOption>(this.multiple);
    }

    ngAfterContentInit(): void {
        this.keyManager = new FocusKeyManager<McTreeOption>(this.renderedOptions)
            .withVerticalOrientation(true)
            .withHorizontalOrientation(null);

        this.keyManager.change
            .pipe(takeUntil(this.destroy))
            .subscribe(() => {
                if (this.keyManager.activeItem) {
                    this.emitNavigationEvent(this.keyManager.activeItem);
                }
            });

        this.selectionModel.changed
            .pipe(takeUntil(this.destroy))
            .subscribe(() => {
                this.onChange(this.getSelectedValues());

                this.renderedOptions.notifyOnChanges();
            });

        this.renderedOptions.changes
            .pipe(takeUntil(this.destroy))
            .subscribe((options) => {
                // todo need to do optimisation
                options.forEach((option) => {
                    option.deselect();

                    this.getSelectedValues().forEach((selectedValue) => {
                        if (option.value === selectedValue) {
                            option.select();
                        }
                    });
                });
            });
    }

    ngOnDestroy(): void {
        this.destroy.next();
        this.destroy.complete();
    }

    onKeyDown(event: KeyboardEvent): void {
        // tslint:disable-next-line: deprecation
        const keyCode = event.keyCode;

        switch (keyCode) {
            case LEFT_ARROW:
                if (this.keyManager.activeItem) {
                    this.treeControl.collapse(this.keyManager.activeItem.data);
                }

                event.preventDefault();

                return;
            case RIGHT_ARROW:
                if (this.keyManager.activeItem) {
                    this.treeControl.expand(this.keyManager.activeItem.data);
                }

                event.preventDefault();

                return;
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

        if (this.autoSelect && this.keyManager.activeItem) {
            this.setSelectedOption(this.keyManager.activeItem);
        }
    }

    updateScrollSize(): void {
        if (!this.renderedOptions.first) { return; }

        this.keyManager.withScrollSize(Math.floor(this.getHeight() / this.renderedOptions.first.getHeight()));
    }

    setSelectedOption(option: McTreeOption, $event?: KeyboardEvent): void {
        const withShift = $event ? hasModifierKey($event, 'shiftKey') : false;
        const withCtrl = $event ? hasModifierKey($event, 'ctrlKey') : false;

        if (this.multiple) {
            if (withShift) {
                const previousIndex = this.keyManager.previousActiveItemIndex;
                const activeIndex = this.keyManager.activeItemIndex;

                if (previousIndex < activeIndex) {
                    this.renderedOptions.forEach((item, index) => {
                        if (index >= previousIndex && index <= activeIndex) { item.setSelected(true); }
                    });
                } else {
                    this.renderedOptions.forEach((item, index) => {
                        if (index >= activeIndex && index <= previousIndex) { item.setSelected(true); }
                    });
                }
            } else if (withCtrl) {
                if (!this.canDeselectLast(option)) { return; }

                this.selectionModel.toggle(option.data);
            } else {
                switch (this.multipleMode) {
                    default:
                    case MultipleMode.CHECKBOX:
                        this.selectionModel.toggle(option.data);
                        break;
                    case MultipleMode.KEYBOARD:
                        this.selectionModel.clear();
                        this.selectionModel.toggle(option.data);
                }
            }
        } else {
            if (!this.canDeselectLast(option)) { return; }

            if (this.autoSelect) {
                this.selectionModel.deselect(...this.selectionModel.selected);
                this.selectionModel.select(option.data);
            }
        }

        this.emitChangeEvent(option);
    }

    setFocusedOption(option: McTreeOption): void {
        this.keyManager.setActiveItem(option);
    }

    toggleFocusedOption(): void {
        const focusedOption = this.keyManager.activeItem;

        if (focusedOption) {
            this.setSelectedOption(focusedOption);
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
        const changeDetectorRefs: any[] = [];

        viewContainer._embeddedViews.forEach((view: ViewData) => {
            const viewDef = view.def;

            viewDef.nodes.forEach((node: NodeDef) => {
                if (viewDef.nodeMatchedQueries === node.matchedQueryIds) {
                    const nodeData: any = view.nodes[node.nodeIndex];

                    arrayOfInstances.push(nodeData.instance as never);
                    changeDetectorRefs.push(nodeData.instance.changeDetectorRef);
                }
            });
        });

        setTimeout(() => {
            changeDetectorRefs.forEach((changeDetectorRef) => {
                if (!changeDetectorRef.destroyed) {
                    changeDetectorRef.detectChanges();
                }
            });
        });

        if (this.renderedOptions) {
            this.renderedOptions.reset(arrayOfInstances);
            this.renderedOptions.notifyOnChanges();
        }

        this.updateScrollSize();

        this.nodeOutlet.changeDetectorRef.detectChanges();
    }

    getHeight(): number {
        const clientRects = this.elementRef.nativeElement.getClientRects();

        if (clientRects.length) {
            return clientRects[0].height;
        }

        return 0;
    }

    getItemHeight(): number {
        return this.renderedOptions.first ? this.renderedOptions.first.getHeight() : 0;
    }

    emitNavigationEvent(option: McTreeOption): void {
        this.navigationChange.emit(new McTreeNavigationChange(this, option));
    }

    emitChangeEvent(option: McTreeOption): void {
        this.selectionChange.emit(new McTreeNavigationChange(this, option));
    }

    writeValue(value: any): void {
        if (this.multiple && value && !Array.isArray(value)) {
            throw getMcSelectNonArrayValueError();
        }

        if (this.renderedOptions) {
            this.setOptionsFromValues(this.multiple ? value : [value]);
        }
    }

    /** `View -> model callback called when value changes` */
    onChange: (value: any) => void = () => {};

    registerOnChange(fn: (value: any) => void): void {
        this.onChange = fn;
    }

    /** `View -> model callback called when select has been touched` */
    onTouched = () => {};

    registerOnTouched(fn: () => {}): void {
        this.onTouched = fn;
    }

    /**
     * Sets the disabled state of the control. Implemented as a part of ControlValueAccessor.
     */
    setDisabledState(isDisabled: boolean): void {
        this._disabled = isDisabled;
        this.changeDetectorRef.markForCheck();
    }

    setOptionsFromValues(values: any[]): void {
        this.selectionModel.clear();

        const valuesToSelect = values.reduce((result, value) => {
            return this.treeControl.hasValue(value) ? [...result, this.treeControl.hasValue(value)] : [...result];
        }, []);

        this.selectionModel.select(...valuesToSelect);
    }

    getSelectedValues(): any[] {
        return this.selectionModel.selected.map((selected) => this.treeControl.getValue(selected));
    }

    private markOptionsForCheck() {
        if (this.renderedOptions) {
            this.renderedOptions.forEach((option) => option.markForCheck());
        }
    }

    private canDeselectLast(option: McTreeOption): boolean {
        return !(this.noUnselectLast && this.selectionModel.selected.length === 1 && option.selected);
    }
}

