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

import { Subscription } from 'rxjs';

import { FocusKeyManager, IFocusableOption } from '@ptsecurity/cdk/a11y';
import { SelectionModel } from '@ptsecurity/cdk/collections';
import { END, ENTER, HOME, PAGE_DOWN, PAGE_UP, SPACE } from '@ptsecurity/cdk/keycodes';

import {
    McLine,
    McLineSetter,
    CanDisable,
    mixinDisabled,
    toBoolean, CanDisableCtor
} from '@ptsecurity/mosaic/core';


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
        '[class.mc-focused]': '_hasFocus',
        '(focus)': '_handleFocus()',
        '(blur)': '_handleBlur()',
        '(click)': '_handleClick()'
    },
    templateUrl: 'list-option.html',
    encapsulation: ViewEncapsulation.None,
    preserveWhitespaces: false,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McListOption implements AfterContentInit, OnDestroy, OnInit, IFocusableOption {
    _hasFocus: boolean = false;

    @ContentChildren(McLine) _lines: QueryList<McLine>;

    @ViewChild('text') _text: ElementRef;

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

    @Input()
    get selected(): boolean {
        return this.listSelection.selectedOptions && this.listSelection.selectedOptions.isSelected(this) || false;
    }

    set selected(value: boolean) {
        const isSelected = toBoolean(value);

        if (isSelected !== this._selected) {
            this.setSelected(isSelected);

            this.listSelection._reportValueChange();
        }
    }

    private _lineSetter: McLineSetter;
    private _selected = false;
    private _disabled = false;

    constructor(
        private _element: ElementRef,
        private _changeDetector: ChangeDetectorRef,
        @Inject(forwardRef(() => McListSelection))
        public listSelection: McListSelection
    ) {}

    ngOnInit() {
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

    ngAfterContentInit() {
        this._lineSetter = new McLineSetter(this._lines, this._element);
    }

    ngOnDestroy(): void {
        if (this.selected) {
            // We have to delay this until the next tick in order
            // to avoid changed after checked errors.
            Promise.resolve().then(() => this.selected = false);
        }

        this.listSelection._removeOptionFromList(this);
    }

    toggle(): void {
        this.selected = !this.selected;
    }

    focus(): void {
        this._element.nativeElement.focus();

        this.listSelection.setFocusedOption(this);
    }

    getLabel() {
        return this._text ? this._text.nativeElement.textContent : '';
    }

    setSelected(selected: boolean) {
        if (this._selected === selected || !this.listSelection.selectedOptions) { return; }

        this._selected = selected;

        if (selected) {
            this.listSelection.selectedOptions.select(this);
        } else {
            this.listSelection.selectedOptions.deselect(this);
        }

        this._changeDetector.markForCheck();
    }

    _getHeight(): number {
        return this._element.nativeElement.getClientRects()[0].height;
    }

    _handleClick() {
        if (this.disabled) { return; }

        this.listSelection.setFocusedOption(this);
    }

    _handleFocus() {
        if (this.disabled || this._hasFocus) { return; }

        this._hasFocus = true;
    }

    _handleBlur() {
        this._hasFocus = false;

        this.listSelection._onTouched();
    }

    _getHostElement(): HTMLElement {
        return this._element.nativeElement;
    }
}


export const MC_SELECTION_LIST_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => McListSelection),
    multi: true
};

// Change event that is being fired whenever the selected state of an option changes. */
export class McListSelectionChange {
    constructor(
        // Reference to the selection list that emitted the event.
        public source: McListSelection,
        // Reference to the option that has been changed.
        public option: McListOption
    ) {}
}


export class McListSelectionBase {}

export const _McListSelectionMixinBase: CanDisableCtor & typeof McListSelectionBase
    = mixinDisabled(McListSelectionBase);

@Component({
    exportAs: 'mcListSelection',
    selector: 'mc-list-selection',
    template: '<ng-content></ng-content>',
    styleUrls: ['./list.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['disabled', 'tabIndex'],
    host: {
        class: 'mc-list-selection',
        '[tabIndex]': 'tabIndex',
        '(focus)': 'focus()',
        '(blur)': '_onTouched()',
        '(keydown)': '_onKeyDown($event)',
        '(window:resize)': 'updateScrollSize()'
    },
    providers: [MC_SELECTION_LIST_VALUE_ACCESSOR],
    preserveWhitespaces: false
})
export class McListSelection extends _McListSelectionMixinBase implements
    IFocusableOption, CanDisable, AfterContentInit, ControlValueAccessor {

    _keyManager: FocusKeyManager<McListOption>;

    // The option components contained within this selection-list.
    @ContentChildren(McListOption) options: QueryList<McListOption>;

    tabIndex: number;

    autoSelect: boolean;
    noUnselect: boolean;
    multiple: boolean;

    // todo temporary solution
    withShift: boolean;
    withCtrl: boolean;

    @Input() horizontal: boolean = false;

    // Emits a change event whenever the selected state of an option changes.
    @Output() readonly selectionChange: EventEmitter<McListSelectionChange> = new EventEmitter<McListSelectionChange>();

    selectedOptions: SelectionModel<McListOption>;

    // Used for storing the values that were assigned before the options were initialized.
    private _tempValues: string[] | null;

    private _modelChanges = Subscription.EMPTY;

    constructor(
        private _element: ElementRef,
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

        this.selectedOptions = new SelectionModel<McListOption>(this.multiple);
    }

    ngAfterContentInit(): void {
        this.horizontal = toBoolean(this.horizontal);

        this._keyManager = new FocusKeyManager<McListOption>(this.options)
            .withTypeAhead()
            .withVerticalOrientation(!this.horizontal)
            .withHorizontalOrientation(this.horizontal ? 'ltr' : null);

        if (this._tempValues) {
            this._setOptionsFromValues(this._tempValues);
            this._tempValues = null;
        }

        // Sync external changes to the model back to the options.
        this._modelChanges = this.selectedOptions.onChange!.subscribe((event) => {
            for (const item of event.added) {
                item.selected = true;
            }

            for (const item of event.removed) {
                item.selected = false;
            }
        });

        this.updateScrollSize();
    }

    ngOnDestroy() {
        this._modelChanges.unsubscribe();
    }

    focus() {
        this._element.nativeElement.focus();
    }

    selectAll() {
        this.options.forEach((option) => option.setSelected(true));

        this._reportValueChange();
    }

    deselectAll() {
        this.options.forEach((option) => option.setSelected(false));

        this._reportValueChange();
    }

    updateScrollSize(): void {
        if (this.horizontal || !this.options.first) { return; }

        this._keyManager.withScrollSize(Math.floor(this._getHeight() / this.options.first._getHeight()));
    }

    // Sets the focused option of the selection-list.
    setFocusedOption(option: McListOption): void {
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

        this._emitChangeEvent(option);
        this._reportValueChange();
    }

    // Implemented as part of ControlValueAccessor.
    writeValue(values: string[]): void {
        if (this.options) {
            this._setOptionsFromValues(values || []);
        } else {
            this._tempValues = values;
        }
    }

    // Implemented as part of ControlValueAccessor.
    registerOnChange(fn: (value: any) => void): void {
        this._onChange = fn;
    }

    // Implemented as part of ControlValueAccessor.
    registerOnTouched(fn: () => void): void {
        this._onTouched = fn;
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
        const focusedIndex = this._keyManager.activeItemIndex;

        if (focusedIndex != null && this._isValidIndex(focusedIndex)) {
            const focusedOption: McListOption = this.options.toArray()[focusedIndex];

            if (focusedOption && this._canDeselectLast(focusedOption)) {
                focusedOption.toggle();

                // Emit a change event because the focused option changed its state through user interaction.
                this._emitChangeEvent(focusedOption);
            }
        }
    }

    _canDeselectLast(listOption: McListOption): boolean {
        return !(this.noUnselect && this.selectedOptions.selected.length === 1 && listOption.selected);
    }

    _getHeight(): number {
        return this._element.nativeElement.getClientRects()[0].height;
    }

    // View to model callback that should be called if the list or its options lost focus.
    _onTouched: () => void = () => {};

    // Removes an option from the selection list and updates the active item.
    _removeOptionFromList(option: McListOption) {
        if (option._hasFocus) {
            const optionIndex = this._getOptionIndex(option);

            // Check whether the option is the last item
            if (optionIndex > 0) {
                this._keyManager.setPreviousItemActive();
            } else if (optionIndex === 0 && this.options.length > 1) {
                this._keyManager.setNextItemActive();
            }
        }
    }

    _onKeyDown(event: KeyboardEvent) {
        const keyCode = event.keyCode;
        this.withShift = event.shiftKey;
        this.withCtrl = event.ctrlKey;

        switch (keyCode) {
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
                if (!this.horizontal) { this._keyManager.setPreviousPageItemActive(); }

                event.preventDefault();

                break;
            case PAGE_DOWN:
                if (!this.horizontal) { this._keyManager.setNextPageItemActive(); }

                event.preventDefault();

                break;
            default:
                this._keyManager.onKeydown(event);
        }
    }

    // Reports a value change to the ControlValueAccessor
    _reportValueChange() {
        if (this.options) {
            this._onChange(this.getSelectedOptionValues());
        }
    }

    // Emits a change event if the selected state of an option changed.
    _emitChangeEvent(option: McListOption) {
        this.selectionChange.emit(new McListSelectionChange(this, option));
    }

    // Returns the option with the specified value.
    private _getOptionByValue(value: string): McListOption | undefined {
        return this.options.find((option) => option.value === value);
    }

    // Sets the selected options based on the specified values.
    private _setOptionsFromValues(values: string[]) {
        this.options.forEach((option) => option.setSelected(false));

        values
            .map((value) => this._getOptionByValue(value))
            .filter(Boolean)
            .forEach((option) => option!.setSelected(true));
    }

    /**
     * Utility to ensure all indexes are valid.
     * @param index The index to be checked.
     * @returns True if the index is valid for our list of options.
     */
    private _isValidIndex(index: number): boolean {
        return index >= 0 && index < this.options.length;
    }

    // Returns the index of the specified list option.
    private _getOptionIndex(option: McListOption): number {
        return this.options.toArray().indexOf(option);
    }

    // View to model callback that should be called whenever the selected options change.
    private _onChange: (value: any) => void = (_: any) => {};
}
