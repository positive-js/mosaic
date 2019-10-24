/* tslint:disable:no-empty */
import { SelectionModel } from '@angular/cdk/collections';
import {
    AfterContentInit,
    Attribute,
    ChangeDetectionStrategy,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input,
    Output,
    QueryList,
    ViewEncapsulation,
    ChangeDetectorRef,
    Inject,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FocusKeyManager, FocusMonitor, IFocusableOption } from '@ptsecurity/cdk/a11y';
import {
    DOWN_ARROW,
    END,
    ENTER,
    hasModifierKey,
    HOME,
    PAGE_DOWN,
    PAGE_UP,
    SPACE,
    TAB,
    UP_ARROW
} from '@ptsecurity/cdk/keycodes';
import {
    McLine,
    CanDisable,
    mixinDisabled,
    toBoolean,
    CanDisableCtor,
    HasTabIndexCtor,
    mixinTabIndex,
    HasTabIndex
} from '@ptsecurity/mosaic/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


/**
 * Component for list-options of selection-list. Each list-option can automatically
 * generate a checkbox and can put current item into the selectionModel of selection-list
 * if the current item is selected.
 */
@Component({
    exportAs: 'mcListOption',
    selector: 'mc-list-option',
    host: {
        tabindex: '-1',

        class: 'mc-list-option',
        '[class.mc-selected]': 'selected',
        '[class.mc-focused]': 'hasFocus',
        '(focus)': 'handleFocus()',
        '(blur)': 'handleBlur()',
        '(click)': 'handleClick($event)'
    },
    templateUrl: 'list-option.html',
    encapsulation: ViewEncapsulation.None,
    preserveWhitespaces: false,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McListOption implements OnDestroy, OnInit, IFocusableOption {
    hasFocus: boolean = false;

    @ContentChildren(McLine) lines: QueryList<McLine>;

    @ViewChild('text', {static: false}) text: ElementRef;

    // Whether the label should appear before or after the checkbox. Defaults to 'after'
    @Input() checkboxPosition: 'before' | 'after' = 'after';

    @Input() value: any;

    @Input()
    get disabled() {
        return this._disabled || (this.listSelection && this.listSelection.disabled);
    }

    set disabled(value: any) {
        const newValue = toBoolean(value);

        if (newValue !== this._disabled) {
            this._disabled = newValue;
            this._changeDetector.markForCheck();
        }
    }

    private _disabled = false;

    @Input()
    get selected(): boolean {
        return this.listSelection.selectionModel && this.listSelection.selectionModel.isSelected(this) || false;
    }

    set selected(value: boolean) {
        const isSelected = toBoolean(value);

        if (isSelected !== this._selected) {
            this.setSelected(isSelected);

            this.listSelection.reportValueChange();
        }
    }

    private _selected = false;

    constructor(
        private elementRef: ElementRef<HTMLElement>,
        private focusMonitor: FocusMonitor,
        private _changeDetector: ChangeDetectorRef,
        @Inject(forwardRef(() => McListSelection)) public listSelection: McListSelection
    ) {}

    ngOnInit() {
        this.focusMonitor.monitor(this.elementRef.nativeElement, false);

        if (this._selected) {
            // List options that are selected at initialization can't be reported properly to the form
            // control. This is because it takes some time until the selection-list knows about all
            // available options. Also it can happen that the ControlValueAccessor has an initial value
            // that should be used instead. Deferring the value change report to the next tick ensures
            // that the form control value is not being overwritten.
            const wasSelected = this._selected;

            Promise.resolve().then(() => {
                if (this._selected || wasSelected) {
                    this.selected = true;
                    this._changeDetector.markForCheck();
                }
            });
        }
    }

    ngOnDestroy(): void {
        if (this.selected) {
            // We have to delay this until the next tick in order
            // to avoid changed after checked errors.
            Promise.resolve().then(() => this.selected = false);
        }

        this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
        this.listSelection.removeOptionFromList(this);
    }

    toggle(): void {
        this.selected = !this.selected;
    }

    focus(): void {
        this.elementRef.nativeElement.focus();
    }

    getLabel() {
        return this.text ? this.text.nativeElement.textContent : '';
    }

    setSelected(selected: boolean) {
        if (this._selected === selected || !this.listSelection.selectionModel) { return; }

        this._selected = selected;

        if (selected) {
            this.listSelection.selectionModel.select(this);
        } else {
            this.listSelection.selectionModel.deselect(this);
        }

        this._changeDetector.markForCheck();
    }

    getHeight(): number {
        return this.elementRef.nativeElement.getClientRects()[0].height;
    }

    handleClick($event) {
        if (this.disabled) { return; }

        this.listSelection.setFocusedOption(this, $event);
    }

    handleFocus() {
        if (this.disabled || this.hasFocus) { return; }

        this.hasFocus = true;
    }

    handleBlur() {
        this.hasFocus = false;

        this.listSelection.onTouched();
    }

    getHostElement(): HTMLElement {
        return this.elementRef.nativeElement;
    }
}


export const MC_SELECTION_LIST_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => McListSelection),
    multi: true
};

export class McListSelectionChange {
    constructor(public source: McListSelection, public option: McListOption) {}
}


export class McListSelectionBase {}

// tslint:disable-next-line:naming-convention
export const McListSelectionMixinBase: CanDisableCtor & HasTabIndexCtor & typeof McListSelectionBase
    = mixinTabIndex(mixinDisabled(McListSelectionBase));

@Component({
    exportAs: 'mcListSelection',
    selector: 'mc-list-selection',
    template: '<ng-content></ng-content>',
    styleUrls: ['./list.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['disabled'],
    host: {
        class: 'mc-list-selection',
        '[tabIndex]': 'tabIndex',
        '(focus)': 'focus()',
        '(blur)': 'onTouched()',
        '(keydown)': 'onKeyDown($event)',
        '(window:resize)': 'updateScrollSize()'
    },
    providers: [MC_SELECTION_LIST_VALUE_ACCESSOR],
    preserveWhitespaces: false
})
export class McListSelection extends McListSelectionMixinBase implements
    IFocusableOption, CanDisable, HasTabIndex, AfterContentInit, ControlValueAccessor, HasTabIndex {

    keyManager: FocusKeyManager<McListOption>;

    // The option components contained within this selection-list.
    @ContentChildren(McListOption) options: QueryList<McListOption>;

    autoSelect: boolean;
    noUnselect: boolean;
    multiple: boolean;

    @Input() horizontal: boolean = false;

    // Emits a change event whenever the selected state of an option changes.
    @Output() readonly selectionChange: EventEmitter<McListSelectionChange> = new EventEmitter<McListSelectionChange>();

    selectionModel: SelectionModel<McListOption>;

    // Used for storing the values that were assigned before the options were initialized.
    private tempValues: string[] | null;

    /** Emits whenever the component is destroyed. */
    private readonly destroy = new Subject<void>();

    constructor(
        private element: ElementRef,
        @Attribute('tabindex') tabIndex: string,
        @Attribute('auto-select') autoSelect: string,
        @Attribute('no-unselect') noUnselect: string,
        @Attribute('multiple') multiple: string
    ) {
        super();

        this.autoSelect = autoSelect === null ? true : toBoolean(autoSelect);
        this.multiple = multiple === null ? true : toBoolean(multiple);
        this.noUnselect = noUnselect === null ? true : toBoolean(noUnselect);

        this.tabIndex = parseInt(tabIndex) || 0;

        this.selectionModel = new SelectionModel<McListOption>(this.multiple);
    }

    ngAfterContentInit(): void {
        this.horizontal = toBoolean(this.horizontal);

        this.keyManager = new FocusKeyManager<McListOption>(this.options)
            .withTypeAhead()
            .withVerticalOrientation(!this.horizontal)
            .withHorizontalOrientation(this.horizontal ? 'ltr' : null);

        if (this.tempValues) {
            this.setOptionsFromValues(this.tempValues);
            this.tempValues = null;
        }

        this.selectionModel.changed
            .pipe(takeUntil(this.destroy))
            .subscribe((event) => {
                for (const item of event.added) { item.selected = true; }

                for (const item of event.removed) { item.selected = false; }
            });

        this.updateScrollSize();
    }

    ngOnDestroy() {
        this.destroy.next();

        this.destroy.complete();
    }

    focus() {
        this.element.nativeElement.focus();
    }

    selectAll() {
        this.options.forEach((option) => option.setSelected(true));

        this.reportValueChange();
    }

    deselectAll() {
        this.options.forEach((option) => option.setSelected(false));

        this.reportValueChange();
    }

    updateScrollSize(): void {
        if (this.horizontal || !this.options.first) { return; }

        this.keyManager.withScrollSize(Math.floor(this.getHeight() / this.options.first.getHeight()));
    }

    // Sets the focused option of the selection-list.
    setFocusedOption(option: McListOption, $event?: KeyboardEvent): void {
        this.keyManager.setActiveItem(option);

        const withShift = $event ? hasModifierKey($event, 'shiftKey') : false;
        const withCtrl = $event ? hasModifierKey($event, 'ctrlKey') : false;

        if (withShift && this.multiple) {
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
        } else if (withCtrl) {

            if (!this.canDeselectLast(option)) { return; }

            option.toggle();
        } else {
            if (this.autoSelect) {
                this.options.forEach((item) => item.setSelected(false));
                option.setSelected(true);
            }
        }

        this.emitChangeEvent(option);
        this.reportValueChange();
    }

    // Implemented as part of ControlValueAccessor.
    writeValue(values: string[]): void {
        if (this.options) {
            this.setOptionsFromValues(values || []);
        } else {
            this.tempValues = values;
        }
    }

    // Implemented as part of ControlValueAccessor.
    registerOnChange(fn: (value: any) => void): void {
        this.onChange = fn;
    }

    // Implemented as part of ControlValueAccessor.
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    // Implemented as a part of ControlValueAccessor.
    setDisabledState(isDisabled: boolean): void {
        if (this.options) {
            this.options.forEach((option) => option.disabled = isDisabled);
        }
    }

    getSelectedOptionValues(): string[] {
        return this.options.filter((option) => option.selected).map((option) => option.value);
    }

    // Toggles the selected state of the currently focused option.
    toggleFocusedOption(): void {
        const focusedIndex = this.keyManager.activeItemIndex;

        if (focusedIndex != null && this.isValidIndex(focusedIndex)) {
            const focusedOption: McListOption = this.options.toArray()[focusedIndex];

            if (focusedOption && this.canDeselectLast(focusedOption)) {
                focusedOption.toggle();

                // Emit a change event because the focused option changed its state through user interaction.
                this.emitChangeEvent(focusedOption);
            }
        }
    }

    canDeselectLast(listOption: McListOption): boolean {
        return !(this.noUnselect && this.selectionModel.selected.length === 1 && listOption.selected);
    }

    getHeight(): number {
        return this.element.nativeElement.getClientRects()[0].height;
    }

    // View to model callback that should be called if the list or its options lost focus.
    // tslint:disable-next-line:no-empty
    onTouched: () => void = () => {};

    // Removes an option from the selection list and updates the active item.
    removeOptionFromList(option: McListOption) {
        if (option.hasFocus) {
            const optionIndex = this.getOptionIndex(option);

            // Check whether the option is the last item
            if (optionIndex > 0) {
                this.keyManager.setPreviousItemActive();
            } else if (optionIndex === 0 && this.options.length > 1) {
                this.keyManager.setNextItemActive();
            }
        }
    }

    onKeyDown(event: KeyboardEvent) {
        // tslint:disable-next-line: deprecation
        const keyCode = event.keyCode;

        switch (keyCode) {
            case SPACE:
            case ENTER:
                this.toggleFocusedOption();

                break;

            case TAB:
                this.keyManager.tabOut.next();

                return;

            case DOWN_ARROW:
                this.keyManager.setNextItemActive();

                break;
            case UP_ARROW:
                this.keyManager.setPreviousItemActive();

                break;
            case HOME:
                this.keyManager.setFirstItemActive();

                break;
            case END:
                this.keyManager.setLastItemActive();

                break;
            case PAGE_UP:
                this.keyManager.setPreviousPageItemActive();

                break;
            case PAGE_DOWN:
                this.keyManager.setNextPageItemActive();

                break;
            default:
                return;
        }

        event.preventDefault();

        this.setFocusedOption(this.keyManager.activeItem as McListOption, event);
    }

    // Reports a value change to the ControlValueAccessor
    reportValueChange() {
        if (this.options) {
            this.onChange(this.getSelectedOptionValues());
        }
    }

    // Emits a change event if the selected state of an option changed.
    emitChangeEvent(option: McListOption) {
        this.selectionChange.emit(new McListSelectionChange(this, option));
    }

    // Returns the option with the specified value.
    private getOptionByValue(value: string): McListOption | undefined {
        return this.options.find((option) => option.value === value);
    }

    // Sets the selected options based on the specified values.
    private setOptionsFromValues(values: string[]) {
        this.options.forEach((option) => option.setSelected(false));

        values
            .map((value) => this.getOptionByValue(value))
            .filter(Boolean)
            .forEach((option) => option!.setSelected(true));
    }

    /**
     * Utility to ensure all indexes are valid.
     * @param index The index to be checked.
     * @returns True if the index is valid for our list of options.
     */
    private isValidIndex(index: number): boolean {
        return index >= 0 && index < this.options.length;
    }

    // Returns the index of the specified list option.
    private getOptionIndex(option: McListOption): number {
        return this.options.toArray().indexOf(option);
    }

    // View to model callback that should be called whenever the selected options change.
    private onChange: (value: any) => void = (_: any) => {};
}
