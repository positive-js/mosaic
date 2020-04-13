/* tslint:disable:no-empty */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
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
    ViewChild,
    NgZone,
    Optional
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FocusKeyManager, IFocusableOption } from '@ptsecurity/cdk/a11y';
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
    HasTabIndex,
    MultipleMode,
    McOptgroup
} from '@ptsecurity/mosaic/core';
import { merge, Observable, Subject, Subscription } from 'rxjs';
import { startWith, take, takeUntil } from 'rxjs/operators';


// tslint:disable-next-line:naming-convention
export interface McOptionEvent {
    option: McListOption;
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
        class: 'mc-list-option mc-no-select',
        '[class.mc-selected]': 'selected',
        '[class.mc-focused]': 'hasFocus',
        '[class.mc-disabled]': 'disabled',

        '[attr.tabindex]': 'tabIndex',
        '[attr.disabled]': 'disabled || null',

        '(focus)': 'focus()',
        '(blur)': 'blur()',
        '(click)': 'handleClick($event)'
    },
    templateUrl: 'list-option.html',
    encapsulation: ViewEncapsulation.None,
    preserveWhitespaces: false,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McListOption implements OnDestroy, OnInit, IFocusableOption {
    hasFocus: boolean = false;

    readonly onFocus = new Subject<McOptionEvent>();

    readonly onBlur = new Subject<McOptionEvent>();

    @ContentChildren(McLine) lines: QueryList<McLine>;

    @ViewChild('text', { static: false }) text: ElementRef;

    // Whether the label should appear before or after the checkbox. Defaults to 'after'
    @Input() checkboxPosition: 'before' | 'after';

    @Input() value: any;

    @Input()
    get disabled() {
        const listSelectionDisabled = this.listSelection && this.listSelection.disabled;
        const groupDisabled = this.group && this.group.disabled;

        return listSelectionDisabled || groupDisabled || this._disabled;
    }

    set disabled(value: any) {
        const newValue = toBoolean(value);

        if (newValue !== this._disabled) {
            this._disabled = newValue;
            this.changeDetector.markForCheck();
        }
    }

    private _disabled = false;

    @Input()
    get showCheckbox() {
        return this._showCheckbox !== undefined ? this._showCheckbox : this.listSelection.showCheckbox;
    }

    set showCheckbox(value: any) {
        this._showCheckbox = coerceBooleanProperty(value);
    }

    private _showCheckbox: boolean;

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

    get tabIndex(): any {
        return this.disabled ? null : -1;
    }

    constructor(
        private elementRef: ElementRef<HTMLElement>,
        private changeDetector: ChangeDetectorRef,
        private ngZone: NgZone,
        @Inject(forwardRef(() => McListSelection)) public listSelection: McListSelection,
        @Optional() readonly group: McOptgroup
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
                    this.changeDetector.markForCheck();
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

        this.listSelection.removeOptionFromList(this);
    }

    toggle(): void {
        this.selected = !this.selected;
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

        this.changeDetector.markForCheck();
    }

    getHeight(): number {
        return this.elementRef.nativeElement.getClientRects()[0].height;
    }

    handleClick($event) {
        if (this.disabled) { return; }

        this.listSelection.setSelectedOptionsByClick(
            this, hasModifierKey($event, 'shiftKey'), hasModifierKey($event, 'ctrlKey')
        );
    }

    focus() {
        if (!this.hasFocus) {
            this.elementRef.nativeElement.focus();

            this.onFocus.next({ option: this });

            Promise.resolve().then(() => {
                this.hasFocus = true;

                this.changeDetector.markForCheck();
            });
        }
    }

    blur(): void {
        // When animations are enabled, Angular may end up removing the option from the DOM a little
        // earlier than usual, causing it to be blurred and throwing off the logic in the list
        // that moves focus not the next item. To work around the issue, we defer marking the option
        // as not focused until the next time the zone stabilizes.
        this.ngZone.onStable
            .asObservable()
            .pipe(take(1))
            .subscribe(() => {
                this.ngZone.run(() => {
                    this.hasFocus = false;

                    this.onBlur.next({ option: this });
                });
            });
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


export class McListSelectionBase {
    constructor(public elementRef: ElementRef) {}
}

// tslint:disable-next-line:naming-convention
export const McListSelectionMixinBase: CanDisableCtor & HasTabIndexCtor & typeof McListSelectionBase
    = mixinTabIndex(mixinDisabled(McListSelectionBase), 0);

@Component({
    exportAs: 'mcListSelection',
    selector: 'mc-list-selection',
    template: '<ng-content></ng-content>',
    styleUrls: ['./list.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['disabled'],
    host: {
        class: 'mc-list-selection',

        '[attr.tabindex]': 'tabIndex',
        '[attr.disabled]': 'disabled || null',

        '(focus)': 'focus()',
        '(blur)': 'blur()',
        '(keydown)': 'onKeyDown($event)',
        '(window:resize)': 'updateScrollSize()'
    },
    providers: [MC_SELECTION_LIST_VALUE_ACCESSOR],
    preserveWhitespaces: false
})
export class McListSelection extends McListSelectionMixinBase implements CanDisable, HasTabIndex, AfterContentInit,
    ControlValueAccessor {

    keyManager: FocusKeyManager<McListOption>;

    @ContentChildren(McListOption, { descendants: true }) options: QueryList<McListOption>;

    autoSelect: boolean;
    noUnselect: boolean;

    multipleMode: MultipleMode | null;

    get multiple(): boolean {
        return !!this.multipleMode;
    }

    @Input() horizontal: boolean = false;

    @Input()
    get tabIndex(): any {
        return this.disabled ? -1 : this._tabIndex;
    }

    set tabIndex(value: any) {
        this.userTabIndex = value;
        this._tabIndex = value;
    }

    private _tabIndex = 0;

    userTabIndex: number | null = null;

    get showCheckbox(): boolean {
        return this.multipleMode === MultipleMode.CHECKBOX;
    }

    // Emits a change event whenever the selected state of an option changes.
    @Output() readonly selectionChange: EventEmitter<McListSelectionChange> = new EventEmitter<McListSelectionChange>();

    selectionModel: SelectionModel<McListOption>;

    get optionFocusChanges(): Observable<McOptionEvent> {
        return merge(...this.options.map((option) => option.onFocus));
    }

    get optionBlurChanges(): Observable<McOptionEvent> {
        return merge(...this.options.map((option) => option.onBlur));
    }

    // Used for storing the values that were assigned before the options were initialized.
    private tempValues: string[] | null;

    /** Emits whenever the component is destroyed. */
    private readonly destroyed = new Subject<void>();

    private optionFocusSubscription: Subscription | null;

    private optionBlurSubscription: Subscription | null;

    constructor(
        elementRef: ElementRef,
        private changeDetectorRef: ChangeDetectorRef,
        @Attribute('auto-select') autoSelect: string,
        @Attribute('no-unselect') noUnselect: string,
        @Attribute('multiple') multiple: MultipleMode
    ) {
        super(elementRef);

        this.autoSelect = autoSelect === null ? true : toBoolean(autoSelect);
        this.noUnselect = noUnselect === null ? true : toBoolean(noUnselect);

        if (multiple === MultipleMode.CHECKBOX || multiple === MultipleMode.KEYBOARD) {
            this.multipleMode = multiple;
        } else if (multiple !== null) {
            this.multipleMode = MultipleMode.CHECKBOX;
        }

        if (this.multipleMode === MultipleMode.CHECKBOX) {
            this.autoSelect = false;
            this.noUnselect = false;
        }

        this.selectionModel = new SelectionModel<McListOption>(this.multiple);
    }

    ngAfterContentInit(): void {
        this.horizontal = toBoolean(this.horizontal);

        this.keyManager = new FocusKeyManager<McListOption>(this.options)
            .withTypeAhead()
            .withVerticalOrientation(!this.horizontal)
            .withHorizontalOrientation(this.horizontal ? 'ltr' : null);

        this.keyManager.tabOut
            .pipe(takeUntil(this.destroyed))
            .subscribe(() => {
                this._tabIndex = -1;

                setTimeout(() => {
                    this._tabIndex = this.userTabIndex || 0;
                    this.changeDetectorRef.markForCheck();
                });
            });

        if (this.tempValues) {
            this.setOptionsFromValues(this.tempValues);
            this.tempValues = null;
        }

        this.selectionModel.changed
            .pipe(takeUntil(this.destroyed))
            .subscribe((event) => {
                for (const item of event.added) { item.selected = true; }

                for (const item of event.removed) { item.selected = false; }
            });

        this.options.changes
            .pipe(startWith(null), takeUntil(this.destroyed))
            .subscribe(() => {
                this.resetOptions();

                // Check to see if we need to update our tab index
                this.updateTabIndex();
            });

        this.updateScrollSize();
    }

    ngOnDestroy() {
        this.destroyed.next();

        this.destroyed.complete();
    }

    focus(): void {
        if (this.options.length === 0) { return; }

        this.keyManager.setFirstItemActive();
    }

    blur() {
        if (!this.hasFocusedOption()) {
            this.keyManager.setActiveItem(-1);
        }

        this.onTouched();
        this.changeDetectorRef.markForCheck();
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

    setSelectedOptionsByClick(option: McListOption, shiftKey: boolean, ctrlKey: boolean): void {
        if (shiftKey && this.multiple) {
            this.setSelectedOptions(option);
        } else if (ctrlKey) {
            if (!this.canDeselectLast(option)) { return; }

            this.selectionModel.toggle(option);
        } else {
            if (this.autoSelect) {
                this.options.forEach((item) => item.setSelected(false));
                option.setSelected(true);
            }
        }

        this.emitChangeEvent(option);
        this.reportValueChange();
    }

    setSelectedOptionsByKey(option: McListOption, shiftKey: boolean, ctrlKey: boolean): void {
        if (shiftKey && this.multiple) {
            this.setSelectedOptions(option);
        } else if (ctrlKey) {
            if (!this.canDeselectLast(option)) { return; }
        } else {
            if (this.autoSelect) {
                this.options.forEach((item) => item.setSelected(false));
                option.setSelected(true);
            }
        }

        this.emitChangeEvent(option);
        this.reportValueChange();
    }

    setSelectedOptions(option: McListOption): void {
        const selectedOptionState = option.selected;

        let fromIndex = this.keyManager.previousActiveItemIndex;
        let toIndex = this.keyManager.previousActiveItemIndex = this.keyManager.activeItemIndex;

        if (toIndex === fromIndex) { return; }

        if (fromIndex > toIndex) {
            [fromIndex, toIndex] = [toIndex, fromIndex];
        }

        this.options
            .toArray()
            .slice(fromIndex, toIndex + 1)
            .filter((item) => !item.disabled)
            .forEach((renderedOption) => {
                const isLastRenderedOption = renderedOption === this.keyManager.activeItem;

                if (isLastRenderedOption && renderedOption.selected && this.noUnselect) { return; }

                renderedOption.setSelected(!selectedOptionState);
            });
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
        return this.elementRef.nativeElement.getClientRects()[0].height;
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

        this.setSelectedOptionsByKey(
            this.keyManager.activeItem as McListOption,
            hasModifierKey(event, 'shiftKey'),
            hasModifierKey(event, 'ctrlKey')
        );
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

    protected updateTabIndex(): void {
        this._tabIndex = this.userTabIndex || (this.options.length === 0 ? -1 : 0);
    }

    private resetOptions() {
        this.dropSubscriptions();
        this.listenToOptionsFocus();
    }

    private dropSubscriptions() {
        if (this.optionFocusSubscription) {
            this.optionFocusSubscription.unsubscribe();
            this.optionFocusSubscription = null;
        }

        if (this.optionBlurSubscription) {
            this.optionBlurSubscription.unsubscribe();
            this.optionBlurSubscription = null;
        }
    }

    private listenToOptionsFocus(): void {
        this.optionFocusSubscription = this.optionFocusChanges
            .subscribe((event) => {
                const index: number = this.options.toArray().indexOf(event.option);

                if (this.isValidIndex(index)) {
                    this.keyManager.updateActiveItem(index);
                }
            });

        this.optionBlurSubscription = this.optionBlurChanges
            .subscribe(() => this.blur());
    }

    /** Checks whether any of the options is focused. */
    private hasFocusedOption() {
        return this.options.some((option) => option.hasFocus);
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
