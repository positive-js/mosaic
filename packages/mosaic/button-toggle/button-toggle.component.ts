import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { SelectionModel } from '@angular/cdk/collections';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    Directive,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    QueryList,
    ViewEncapsulation,
    ViewChild
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { McButton } from '@ptsecurity/mosaic/button';


/** Acceptable types for a button toggle. */
export type ToggleType = 'checkbox' | 'radio';

/**
 * Provider Expression that allows mc-button-toggle-group to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)].
 * @docs-private
 */
export const MC_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => McButtonToggleGroup),
    multi: true
};

/** Change event object emitted by MсButtonToggle. */
export class McButtonToggleChange {
    constructor(
        /** The MсButtonToggle that emits the event. */
        public source: McButtonToggle,
        /** The value assigned to the MсButtonToggle. */
        public value: any
    ) {}
}

/** Exclusive selection button toggle group that behaves like a radio-button group. */
@Directive({
    selector: 'mc-button-toggle-group',
    providers: [MC_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR],
    host: {
        role: 'group',
        class: 'mc-button-toggle-group',
        '[class.mc-button-toggle_vertical]': 'vertical'
    },
    exportAs: 'mcButtonToggleGroup'
})
export class McButtonToggleGroup implements ControlValueAccessor, OnInit, AfterContentInit {

    /** Whether the toggle group is vertical. */
    @Input()
    get vertical(): boolean {
        return this._vertical;
    }

    set vertical(value: boolean) {
        this._vertical = coerceBooleanProperty(value);
    }

    /** Value of the toggle group. */
    @Input()
    get value(): any {
        const selected = this.selectionModel ? this.selectionModel.selected : [];

        if (this.multiple) {
            return selected.map((toggle) => toggle.value);
        }

        return selected[0] ? selected[0].value : undefined;
    }

    set value(newValue: any) {
        this.setSelectionByValue(newValue);
        this.valueChange.emit(this.value);
    }

    /** Selected button toggles in the group. */
    get selected(): any {
        const selected = this.selectionModel.selected;

        return this.multiple ? selected : (selected[0] || null);
    }

    /** Whether multiple button toggles can be selected. */
    @Input()
    get multiple(): boolean {
        return this._multiple;
    }

    set multiple(value: boolean) {
        this._multiple = coerceBooleanProperty(value);
    }

    /** Child button toggle buttons. */
    @ContentChildren(forwardRef(() => McButtonToggle)) buttonToggles: QueryList<McButtonToggle>;

    /** Whether multiple button toggle group is disabled. */
    @Input()
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value);

        if (!this.buttonToggles) { return; }

        this.buttonToggles.forEach((toggle) => toggle.markForCheck());
    }

    /**
     * Event that emits whenever the value of the group changes.
     * Used to facilitate two-way data binding.
     * @docs-private
     */
    @Output() readonly valueChange = new EventEmitter<any>();

    /** Event emitted when the group's value changes. */
    @Output() readonly change: EventEmitter<McButtonToggleChange> = new EventEmitter<McButtonToggleChange>();
    private _vertical = false;
    private _multiple = false;
    private _disabled = false;
    private selectionModel: SelectionModel<McButtonToggle>;

    /**
     * Reference to the raw value that the consumer tried to assign. The real
     * value will exclude any values from this one that don't correspond to a
     * toggle. Useful for the cases where the value is assigned before the toggles
     * have been initialized or at the same that they're being swapped out.
     */
    private rawValue: any;

    constructor(private _changeDetector: ChangeDetectorRef) {}

    /**
     * The method to be called in order to update ngModel.
     * Now `ngModel` binding is not supported in multiple selection mode.
     */
    // tslint:disable-next-line:no-empty
    controlValueAccessorChangeFn: (value: any) => void = () => {};

    /** onTouch function registered via registerOnTouch (ControlValueAccessor). */
    // tslint:disable-next-line:no-empty
    onTouched: () => any = () => {};

    ngOnInit() {
        this.selectionModel = new SelectionModel<McButtonToggle>(this.multiple, undefined, false);
    }

    ngAfterContentInit() {
        this.selectionModel.select(...this.buttonToggles.filter((toggle) => toggle.checked));
        this.disabled = this._disabled;
    }

    /**
     * Sets the model value. Implemented as part of ControlValueAccessor.
     * @param value Value to be set to the model.
     */
    writeValue(value: any) {
        this.value = value;
        this._changeDetector.markForCheck();
    }

    // Implemented as part of ControlValueAccessor.
    registerOnChange(fn: (value: any) => void) {
        this.controlValueAccessorChangeFn = fn;
    }

    // Implemented as part of ControlValueAccessor.
    registerOnTouched(fn: any) {
        this.onTouched = fn;
    }

    // Implemented as part of ControlValueAccessor.
    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    /** Dispatch change event with current selection and group value. */
    emitChangeEvent(): void {
        const selected = this.selected;
        const source = Array.isArray(selected) ? selected[selected.length - 1] : selected;
        const event = new McButtonToggleChange(source, this.value);
        this.controlValueAccessorChangeFn(event.value);
        this.change.emit(event);
    }

    /**
     * Syncs a button toggle's selected state with the model value.
     * @param toggle Toggle to be synced.
     * @param select Whether the toggle should be selected.
     * @param isUserInput Whether the change was a result of a user interaction.
     */
    syncButtonToggle(toggle: McButtonToggle, select: boolean, isUserInput = false) {
        // Deselect the currently-selected toggle, if we're in single-selection
        // mode and the button being toggled isn't selected at the moment.
        if (!this.multiple && this.selected && !toggle.checked) {
            (this.selected as McButtonToggle).checked = false;
        }

        if (select) {
            this.selectionModel.select(toggle);
        } else {
            this.selectionModel.deselect(toggle);
        }

        // Only emit the change event for user input.
        if (isUserInput) {
            this.emitChangeEvent();
        }

        // Note: we emit this one no matter whether it was a user interaction, because
        // it is used by Angular to sync up the two-way data binding.
        this.valueChange.emit(this.value);
    }

    /** Checks whether a button toggle is selected. */
    isSelected(toggle: McButtonToggle) {
        return this.selectionModel.isSelected(toggle);
    }

    /** Determines whether a button toggle should be checked on init. */
    isPrechecked(toggle: McButtonToggle) {
        if (this.rawValue === undefined) {
            return false;
        }

        if (this.multiple && Array.isArray(this.rawValue)) {
            return this.rawValue.some((value) => toggle.value != null && value === toggle.value);
        }

        return toggle.value === this.rawValue;
    }

    /** Updates the selection state of the toggles in the group based on a value. */
    private setSelectionByValue(value: any | any[]) {
        this.rawValue = value;

        if (!this.buttonToggles) {
            return;
        }

        if (this.multiple && value) {
            if (!Array.isArray(value)) {
                throw Error('Value must be an array in multiple-selection mode.');
            }

            this.clearSelection();
            value.forEach((currentValue: any) => this.selectValue(currentValue));
        } else {
            this.clearSelection();
            this.selectValue(value);
        }
    }

    /** Clears the selected toggles. */
    private clearSelection() {
        this.selectionModel.clear();
        this.buttonToggles.forEach((toggle) => toggle.checked = false);
    }

    /** Selects a value if there's a toggle that corresponds to it. */
    private selectValue(value: any) {
        const correspondingOption = this.buttonToggles.find((toggle) => {
            return toggle.value != null && toggle.value === value;
        });

        if (correspondingOption) {
            correspondingOption.checked = true;
            this.selectionModel.select(correspondingOption);
        }
    }
}

/** Single button inside of a toggle group. */
@Component({
    selector: 'mc-button-toggle',
    exportAs: 'mcButtonToggle',
    template: `
        <button
            mc-button
            type="button"
            [class.mc-active]="checked"
            [disabled]="disabled"
            [tabIndex]="tabIndex"
            (click)="onToggleClick()">
            <ng-content></ng-content>
        </button>
    `,
    styleUrls: ['button-toggle.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'mc-button-toggle',
        '[class.mc-button-toggle-standalone]': '!buttonToggleGroup'
    }
})
export class McButtonToggle implements OnInit, OnDestroy {

    /** Whether the button is checked. */
    @Input()
    get checked(): boolean {
        return this.buttonToggleGroup ? this.buttonToggleGroup.isSelected(this) : this._checked;
    }

    set checked(value: boolean) {
        const newValue = coerceBooleanProperty(value);

        if (newValue !== this._checked) {
            this._checked = newValue;

            if (this.buttonToggleGroup) {
                this.buttonToggleGroup.syncButtonToggle(this, this._checked);
            }

            this.changeDetectorRef.markForCheck();
        }
    }

    // tslint:disable-next-line:no-reserved-keywords
    type: ToggleType;

    @ViewChild(McButton, { static: false }) mcButton: McButton;

    /** McButtonToggleGroup reads this to assign its own value. */
    @Input() value: any;

    /** Tabindex for the toggle. */
    @Input() tabIndex: number | null;

    @Input()
    get disabled(): boolean {
        return this._disabled || (this.buttonToggleGroup && this.buttonToggleGroup.disabled);
    }

    set disabled(value: boolean) {
        this._disabled = coerceBooleanProperty(value);
    }

    /** Event emitted when the group value changes. */
    @Output() readonly change: EventEmitter<McButtonToggleChange> = new EventEmitter<McButtonToggleChange>();

    private isSingleSelector = false;
    private _checked = false;
    private _disabled: boolean = false;

    constructor(
        @Optional() public buttonToggleGroup: McButtonToggleGroup,
        private changeDetectorRef: ChangeDetectorRef,
        private focusMonitor: FocusMonitor,
        private element: ElementRef
    ) {}

    ngOnInit() {
        this.isSingleSelector = this.buttonToggleGroup && !this.buttonToggleGroup.multiple;
        this.type = this.isSingleSelector ? 'radio' : 'checkbox';

        if (this.buttonToggleGroup && this.buttonToggleGroup.isPrechecked(this)) {
            this.checked = true;
        }

        this.focusMonitor.monitor(this.element.nativeElement, true);
    }

    ngOnDestroy() {
        const group = this.buttonToggleGroup;

        this.focusMonitor.stopMonitoring(this.element.nativeElement);

        // Remove the toggle from the selection once it's destroyed. Needs to happen
        // on the next tick in order to avoid "changed after checked" errors.
        if (group && group.isSelected(this)) {
            Promise.resolve().then(() => group.syncButtonToggle(this, false));
        }
    }

    /** Checks the button toggle due to an interaction with the underlying native button. */
    onToggleClick() {
        if (this.disabled) { return; }

        const newChecked = this.isSingleSelector ? true : !this._checked;

        if (newChecked !== this._checked) {
            this._checked = newChecked;
            if (this.buttonToggleGroup) {
                this.buttonToggleGroup.syncButtonToggle(this, this._checked, true);
                this.buttonToggleGroup.onTouched();
            }
        }
        // Emit a change event when it's the single selector
        this.change.emit(new McButtonToggleChange(this, this.value));
    }

    /**
     * Marks the button toggle as needing checking for change detection.
     * This method is exposed because the parent button toggle group will directly
     * update bound properties of the radio button.
     */
    markForCheck() {
        // When the group value changes, the button will not be notified.
        // Use `markForCheck` to explicit update button toggle's status.
        this.changeDetectorRef.markForCheck();
    }
}
