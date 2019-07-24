import { SelectionModel } from '@angular/cdk/collections';
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
    ElementRef,
    Self,
    Optional
} from '@angular/core';
import { NodeDef, ViewData } from '@angular/core/esm2015/src/view';
import { ControlValueAccessor, NgControl } from '@angular/forms';
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
import { takeUntil } from 'rxjs/operators';

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
    implements ControlValueAccessor, AfterContentInit, CanDisable, HasTabIndex {

    @ViewChild(CdkTreeNodeOutlet, { static: true }) nodeOutlet: CdkTreeNodeOutlet;

    @ContentChildren(McTreeOption) options: QueryList<McTreeOption>;

    keyManager: FocusKeyManager<McTreeOption>;

    selectionModel: SelectionModel<any>;

    tabIndex: number;
    multiple: boolean;
    autoSelect: boolean;
    noUnselectLastSelected: boolean;

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
        @Self() @Optional() public ngControl: NgControl,
        @Attribute('tabindex') tabIndex: string,
        @Attribute('multiple') multiple: string,
        @Attribute('auto-select') autoSelect: string,
        @Attribute('no-unselect') noUnselect: string
    ) {
        super(differs, changeDetectorRef);

        if (this.ngControl) {
            // Note: we provide the value accessor through here, instead of
            // the `providers` to avoid running into a circular import.
            this.ngControl.valueAccessor = this;
        }

        this.tabIndex = parseInt(tabIndex) || 0;

        this.multiple = multiple === null ? false : toBoolean(multiple);
        this.autoSelect = autoSelect === null ? true : toBoolean(autoSelect);
        this.noUnselectLastSelected = noUnselect === null ? true : toBoolean(noUnselect);

        this.selectionModel = new SelectionModel<any>(this.multiple);
    }

    ngAfterContentInit(): void {
        this.keyManager = new FocusKeyManager<McTreeOption>(this.options)
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
            .subscribe((changeEvent) => {
                this.onChange(changeEvent.source.selected);

                this.options.notifyOnChanges();
            });

        this.options.changes
            .pipe(takeUntil(this.destroy))
            .subscribe((options) => {
                options.forEach((option) => {
                    option.deselect();

                    this.selectionModel.selected.forEach((selectedOption) => {
                        if (option.value === selectedOption) { option.select(); }
                    });
                });
            });
    }

    ngOnDestroy() {
        this.destroy.next();
        this.destroy.complete();
    }

    onKeyDown(event: KeyboardEvent) {
        // tslint:disable-next-line: deprecation
        const keyCode = event.keyCode;

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

    setSelectedOption(option: McTreeOption, $event?: KeyboardEvent) {
        const withShift = $event ? hasModifierKey($event, 'shiftKey') : false;
        const withCtrl = $event ? hasModifierKey($event, 'ctrlKey') : false;

        if (this.multiple) {
            if (!this.canDeselectLast(option)) { return; }

            option.toggle();
            this.emitChangeEvent(option);
        } else if (withShift) {
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
            this.emitChangeEvent(option);
        } else if (withCtrl) {
            if (!this.canDeselectLast(option)) { return; }

            option.toggle();
            this.emitChangeEvent(option);
        } else {
            if (this.autoSelect) {
                this.options.forEach((item) => item.setSelected(false));
                option.setSelected(true);

                this.emitChangeEvent(option);
            }
        }
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

        viewContainer._embeddedViews.forEach((view: ViewData) => {
            const viewDef = view.def;

            viewDef.nodes.forEach((node: NodeDef) => {
                if (viewDef.nodeMatchedQueries === node.matchedQueryIds) {
                    const nodeData: any = view.nodes[node.nodeIndex];

                    arrayOfInstances.push(nodeData.instance as never);

                    setTimeout(() => nodeData.instance.changeDetectorRef.detectChanges());
                }
            });
        });

        if (this.options) {
            this.options.reset(arrayOfInstances);
            this.options.notifyOnChanges();
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

    emitNavigationEvent(option: McTreeOption): void {
        this.navigationChange.emit(new McTreeNavigationChange(this, option));
    }

    emitChangeEvent(option: McTreeOption): void {
        this.selectionChange.emit(new McTreeNavigationChange(this, option));
    }

    writeValue(value: any): void {
        if (this.options) {
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

    setDisabledState(isDisabled: boolean): void {
        this._disabled = isDisabled;
        this.changeDetectorRef.markForCheck();
        // this.stateChanges.next();
    }

    private getCorrespondOption(value: any): McTreeOption | undefined {
        return this.options.find((option: McTreeOption) => {
            try {
                // Treat null as a special reset value.
                return option.value != null && option.value === value;
            } catch (error) {
                console.warn(error);

                return false;
            }
        });
    }

    private setOptionsFromValues(values: any[]): void {
        this.selectionModel.clear();

        values.forEach((value) => {
            const correspondingOption = this.getCorrespondOption(value);

            this.selectionModel.select(value);

            if (correspondingOption) { correspondingOption.selected = true; }
        });

        this.options.notifyOnChanges();
    }

    private canDeselectLast(option: McTreeOption): boolean {
        return !(this.noUnselectLastSelected && this.selectionModel.selected.length === 1 && option.selected);
    }
}

