import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    ViewEncapsulation,
    Input,
    QueryList,
    ContentChildren,
    forwardRef,
    Output,
    EventEmitter,
    AfterContentInit,
    ChangeDetectorRef,
    Inject
} from '@angular/core';

import { mixinDisabled, toBoolean } from '@ptsecurity/mosaic/core';

// Note: Do we need it in tabs ???
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Subscription } from 'rxjs';

import { FocusKeyManager, IFocusableOption } from '@ptsecurity/cdk/a11y';
import { SelectionModel } from '@ptsecurity/cdk/collections';
import { END, ENTER, HOME, PAGE_DOWN, PAGE_UP, SPACE } from '@ptsecurity/cdk/keycodes';


@Component({
    selector: 'mc-tab',
    host: {
        tabindex: '-1',
        class: 'mc-tab',
        '[class.mc-selected]': 'selected',
        '[class.mc-focused]': '_hasFocus',
        '(focus)': '_handleFocus()',
        '(blur)': '_handleBlur()',
        '(click)': '_handleClick()'
    },
    templateUrl: './tab.component.html',
    encapsulation: ViewEncapsulation.None,
    preserveWhitespaces: false,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McTab implements IFocusableOption {

    @Input()
    get disabled() {
        return this._disabled;
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
        return this.tabsGroup.selectedOptions && this.tabsGroup.selectedOptions.isSelected(this) || false;
    }
    set selected(value: boolean) {
        const isSelected = toBoolean(value);

        if (isSelected !== this._selected) {
            this.setSelected(isSelected);

            this.tabsGroup._reportValueChange();
        }
    }

    @Input() value: any;

    _hasFocus: boolean = false;
    private _selected: boolean = false;
    private _disabled: boolean = false;

    constructor(private _element: ElementRef,
                private _changeDetector: ChangeDetectorRef,
                @Inject(forwardRef(() => McTabs))
        public tabsGroup: McTabs
    ) { }

    // TODO: add this method to interface
    getLabel() {
        return this._element.nativeElement.textContent;
    }

    toggle(): void {
        this.selected = !this.selected;
    }

    focus(): void {
        this._element.nativeElement.focus();

        this.tabsGroup.setFocusedOption(this);
    }

    setSelected(selected: boolean) {
        if (this._selected === selected || !this.tabsGroup.selectedOptions) { return; }

        this._selected = selected;

        if (selected) {
            this.tabsGroup.selectedOptions.select(this);
        } else {
            this.tabsGroup.selectedOptions.deselect(this);
        }

        this._changeDetector.markForCheck();
    }

    _handleClick() {
        if (this.disabled) { return; }

        this.tabsGroup.setFocusedOption(this);
        this.tabsGroup.setSelectedOption(this);
    }

    _handleFocus() {
        if (this.disabled || this._hasFocus) { return; }

        this._hasFocus = true;
    }

    _handleBlur() {
        this._hasFocus = false;

        this.tabsGroup._onTouched();
    }
}

export const MC_SELECTION_TABS_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => McTabs),
    multi: true
};

// Change event that is being fired whenever the selected state of an option changes.
export class McTabsSelectionChange {
    constructor(
        // Reference to the component that emitted the event.
        public source: McTabs,
        // Reference to the option that has been changed.
        public option: McTab
    ) { }
}


export class McTabsBase { }

export const _McTabsMixinBase = mixinDisabled(McTabsBase);

@Component({
    selector: `mc-tabs-group`,
    templateUrl: './tabs.component.html',
    styleUrls: ['./tabs.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['disabled', 'tabIndex'],
    host: {
        class: 'mc-tabs',
        '(blur)': '_onTouched()',
        '(keydown)': '_onKeyDown($event)'
    }
})
export class McTabs extends _McTabsMixinBase implements AfterContentInit, ControlValueAccessor {
    _keyManager: FocusKeyManager<McTab>;

    // The option components contained within this selection-list.
    @ContentChildren(McTab) options: QueryList<McTab>;

    // Emits a change event whenever the selected state of an option changes.
    @Output() readonly selectionChange: EventEmitter<McTabsSelectionChange> = new EventEmitter<McTabsSelectionChange>();

    selectedOptions: SelectionModel<McTab>;

    private _modelChanges = Subscription.EMPTY;

    constructor(
        private _elementRef: ElementRef
    ) {
        super();

        this.selectedOptions = new SelectionModel<McTab>();
    }

    focus() {
        this._elementRef.nativeElement.focus();
    }

    _onKeyDown(event: KeyboardEvent) {
        const keyCode = event.keyCode;

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
                this._keyManager.setPreviousItemActive();
                event.preventDefault();

                break;
            case PAGE_DOWN:
                this._keyManager.setNextItemActive();
                event.preventDefault();

                break;
            default:
                this._keyManager.onKeydown(event);
        }
    }

    // Toggles the selected state of the currently focused option.
    toggleFocusedOption(): void {
        const focusedIndex = this._keyManager.activeItemIndex;

        if (this._isValidIndex(focusedIndex)) {
            const focusedOption: McTab = this.options.toArray()[focusedIndex];

            if (focusedOption && !focusedOption.selected) {
                this.setSelectedOption(focusedOption);
            }
        }
    }

    ngAfterContentInit(): void {
        this._keyManager = new FocusKeyManager<McTab>(this.options)
            .withTypeAhead()
            .withHorizontalOrientation('ltr');
    }

    setFocusedOption(option: McTab): void {
        this._keyManager.updateActiveItem(option);
    }

    setSelectedOption(option: McTab) {
        this.options.forEach((item) => item.setSelected(false));
        option.setSelected(true);

        this._emitChangeEvent(option);
        this._reportValueChange();
    }

    getSelectedOptionValues(): string[] {
        return this.options.filter((option) => option.selected).map((option) => option.value);
    }

    // Emits a change event if the selected state of an option changed.
    _emitChangeEvent(option: McTab) {
        this.selectionChange.emit(new McTabsSelectionChange(this, option));
    }

    // Reports a value change to the ControlValueAccessor
    _reportValueChange() {
        if (this.options) {
            this._onChange(this.getSelectedOptionValues());
        }
    }

    // Implemented as part of ControlValueAccessor.
    writeValue(values: string[]): void {
        this._setOptionsFromValues(values || []);
    }

    // Implemented as part of ControlValueAccessor.
    registerOnChange(fn: (value: any) => void): void {
        this._onChange = fn;
    }

    // Implemented as part of ControlValueAccessor.
    registerOnTouched(fn: () => void): void {
        this._onTouched = fn;
    }

    // View to model callback that should be called if the list or its options lost focus.
    _onTouched: () => void = () => {};

    // View to model callback that should be called whenever the selected options change.
    _onChange: (value: any) => void = (_: any) => {};

    /**
     * Utility to ensure all indexes are valid.
     * @param index The index to be checked.
     * @returns True if the index is valid for our list of options.
     */
    private _isValidIndex(index: number): boolean {
        return index >= 0 && index < this.options.length;
    }

    // Returns the option with the specified value.
    private _getOptionByValue(value: string): McTab | undefined {
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
}
