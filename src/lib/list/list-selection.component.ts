import {
    AfterContentInit,
    Attribute,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component, ContentChildren,
    ElementRef, EventEmitter, forwardRef, Inject, Input,
    OnDestroy, OnInit, Optional, Output, QueryList, ViewChild,
    ViewEncapsulation
} from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { FocusKeyManager, IFocusableOption } from '@ptsecurity/cdk/a11y';
import { SelectionModel } from '@ptsecurity/cdk/collections';
import { END, ENTER, HOME, SPACE } from '@ptsecurity/cdk/keycodes';

import {
    CanDisable, mixinDisabled, HasTabIndex, mixinTabIndex, McLine, McLineSetter, toBoolean
} from '@ptsecurity/mosaic/core';
import { Subscription } from 'rxjs/Subscription';


export class McListOptionBase {}

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
        '(click)': '_handleClick()',
    },
    templateUrl: 'list-option.html',
    encapsulation: ViewEncapsulation.None,
    preserveWhitespaces: false,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McListOption extends McListOptionBase
    implements AfterContentInit, OnDestroy, OnInit, IFocusableOption {

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
        return this.listSelection.selectedOptions.isSelected(this);
    }

    set selected(value: boolean) {
        const isSelected = toBoolean(value);

        if (isSelected !== this._selected) {
            this._setSelected(isSelected);
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
    ) {
        super();
    }

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
    }

    getLabel() {
        return this._text ? this._text.nativeElement.textContent : '';
    }

    _handleClick() {
        if (!this.disabled) {
            this.toggle();

            // Emit a change event if the selected state of the option changed through user interaction.
            this.listSelection._emitChangeEvent(this);
        }
    }

    _handleFocus() {
        if (this.disabled) { return; }

        this._hasFocus = true;
        this.listSelection._setFocusedOption(this);
    }

    _handleBlur() {
        this._hasFocus = false;
        this.listSelection._onTouched();
    }

    // Retrieves the DOM element of the component host.
    _getHostElement(): HTMLElement {
        return this._element.nativeElement;
    }

    // Sets the selected state of the option.
    _setSelected(selected: boolean) {
        if (this._selected === selected) { return; }

        this._selected = selected;

        if (selected) {
            this.listSelection.selectedOptions.select(this);
        } else {
            this.listSelection.selectedOptions.deselect(this);
        }

        this._changeDetector.markForCheck();
    }
}


export class McListSelectionBase {}

export const _McListSelectionMixinBase = mixinTabIndex(mixinDisabled(McListSelectionBase));

@Component({
    exportAs: 'mcListSelection',
    selector: 'mc-list-selection',
    template: '<ng-content></ng-content>',
    styleUrls: ['list.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['disabled', 'tabIndex'],
    host: {
        class: 'mc-list-selection',
        '[tabIndex]': 'tabIndex',
        '(focus)': 'focus()',
        '(blur)': '_onTouched()',
        '(keydown)': '_keydown($event)'
    },
    providers: [MC_SELECTION_LIST_VALUE_ACCESSOR],
    preserveWhitespaces: false
})
export class McListSelection extends _McListSelectionMixinBase implements
    IFocusableOption, CanDisable, HasTabIndex, AfterContentInit, ControlValueAccessor {

    _keyManager: FocusKeyManager<McListOption>;

    // The option components contained within this selection-list.
    @ContentChildren(McListOption) options: QueryList<McListOption>;

    @Input() horizontal: boolean = false;
    @Input() multiple: boolean = false;

    // Emits a change event whenever the selected state of an option changes.
    @Output() readonly selectionChange: EventEmitter<McListSelectionChange> =
        new EventEmitter<McListSelectionChange>();

    selectedOptions: SelectionModel<McListOption>;

    // Used for storing the values that were assigned before the options were initialized.
    private _tempValues: string[] | null;

    private _modelChanges = Subscription.EMPTY;

    constructor(private _element: ElementRef, @Attribute('tabindex') tabIndex: string) {
        super();

        this.tabIndex = parseInt(tabIndex) || 0;
    }

    ngAfterContentInit(): void {
        this.horizontal = toBoolean(this.horizontal);
        this.multiple = toBoolean(this.multiple);

        this._keyManager = new FocusKeyManager<McListOption>(this.options)
            .withWrap()
            .withTypeAhead()
            .withHorizontalOrientation(this.horizontal ? 'ltr' : null)
            .withVerticalOrientation(!this.horizontal);

        if (this._tempValues) {
            this._setOptionsFromValues(this._tempValues);
            this._tempValues = null;
        }

        this.selectedOptions = new SelectionModel<McListOption>(this.multiple);

        // Sync external changes to the model back to the options.
        this._modelChanges = this.selectedOptions.onChange!.subscribe((event) => {
            event.added.forEach((item) => { item.selected = true; });
            event.removed.forEach((item) => { item.selected = false; });
        });
    }

    ngOnDestroy() {
        this._modelChanges.unsubscribe();
    }

    // Focus the selection-list.
    focus() {
        this._element.nativeElement.focus();
    }

    // Selects all of the options.
    selectAll() {
        this.options.forEach((option) => option._setSelected(true));
        this._reportValueChange();
    }

    // Deselects all of the options.
    deselectAll() {
        this.options.forEach((option) => option._setSelected(false));
        this._reportValueChange();
    }

    // View to model callback that should be called if the list or its options lost focus.
    _onTouched: () => void = () => {};

    // Sets the focused option of the selection-list.
    _setFocusedOption(option: McListOption) {
        this._keyManager.updateActiveItemIndex(this._getOptionIndex(option));
    }

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

    _keydown(event: KeyboardEvent) {
        switch (event.keyCode) {
            case SPACE:
            case ENTER:
                this._toggleSelectOnFocusedOption();
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
            default:
                this._keyManager.onKeydown(event);
        }
    }

    // Reports a value change to the ControlValueAccessor
    _reportValueChange() {
        if (this.options) {
            this._onChange(this._getSelectedOptionValues());
        }
    }

    // Emits a change event if the selected state of an option changed.
    _emitChangeEvent(option: McListOption) {
        this.selectionChange.emit(new McListSelectionChange(this, option));
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

    // Returns the option with the specified value.
    private _getOptionByValue(value: string): McListOption | undefined {
        return this.options.find((option) => option.value === value);
    }

    // Sets the selected options based on the specified values.
    private _setOptionsFromValues(values: string[]) {
        this.options.forEach((option) => option._setSelected(false));

        values
            .map((value) => this._getOptionByValue(value))
            .filter(Boolean)
            .forEach((option) => option!._setSelected(true));
    }

    private _getSelectedOptionValues(): string[] {
        return this.options.filter((option) => option.selected).map((option) => option.value);
    }

    // Toggles the selected state of the currently focused option.
    private _toggleSelectOnFocusedOption(): void {
        const focusedIndex = this._keyManager.activeItemIndex;

        if (focusedIndex != null && this._isValidIndex(focusedIndex)) {
            const focusedOption: McListOption = this.options.toArray()[focusedIndex];

            if (focusedOption) {
                focusedOption.toggle();

                // Emit a change event because the focused option changed its state through user interaction.
                this._emitChangeEvent(focusedOption);
            }
        }
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
