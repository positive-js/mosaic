import { Subject } from 'rxjs';


/**
 * Class to be used to power selecting one or more options from a list.
 */
export class SelectionModel<T> {

    /** Event emitted when the value has changed. */
    changed: Subject<SelectionChange<T>> = new Subject();

    /**
     * Event emitted when the value has changed.
     * @deprecated Use `changed` instead.
     * @breaking-change 8.0.0 To be changed to `changed`
     */
    onChange: Subject<SelectionChange<T>> = this.changed;
    /** Currently-selected values. */
    selection = new Set<T>();

    /** Keeps track of the deselected options that haven't been emitted by the change event. */
    private deselectedToEmit: T[] = [];

    /** Keeps track of the selected options that haven't been emitted by the change event. */
    private selectedToEmit: T[] = [];

    get selected(): T[] {
        if (!this._selected) {
            this._selected = Array.from(this.selection.values());
        }

        return this._selected;
    }

    private _selected: T[] | null;

    constructor(
        private _multiple = false,
        initiallySelectedValues?: T[],
        private _emitChanges: boolean = true
    ) {
        if (initiallySelectedValues && initiallySelectedValues.length) {
            if (_multiple) {
                initiallySelectedValues.forEach((value) => this.markSelected(value));
            } else {
                this.markSelected(initiallySelectedValues[0]);
            }

            // Clear the array in order to avoid firing the change event for preselected values.
            this.selectedToEmit.length = 0;
        }
    }

    /**
     * Selects a value or an array of values.
     */
    select(...values: T[]): void {
        this.verifyValueAssignment(values);

        values.forEach((value) => this.markSelected(value));

        this.emitChangeEvent();
    }

    /**
     * Deselects a value or an array of values.
     */
    deselect(...values: T[]): void {
        this.verifyValueAssignment(values);

        values.forEach((value) => this.unmarkSelected(value));

        this.emitChangeEvent();
    }

    /**
     * Toggles a value between selected and deselected.
     */
    toggle(value: T): void {
        if (this.isSelected(value)) {
            this.deselect(value);
        } else {
            this.select(value);
        }
    }

    /**
     * Clears all of the selected values.
     */
    clear(): void {
        this.unmarkAll();
        this.emitChangeEvent();
    }

    /**
     * Determines whether a value is selected.
     */
    isSelected(value: T): boolean {
        return this.selection.has(value);
    }

    /**
     * Determines whether the model does not have a value.
     */
    isEmpty(): boolean {
        return this.selection.size === 0;
    }

    /**
     * Determines whether the model has a value.
     */
    hasValue(): boolean {
        return !this.isEmpty();
    }

    /**
     * Sorts the selected values based on a predicate function.
     */
    sort(predicate?: (a: T, b: T) => number): void {
        if (this._multiple && this.selected) {
            this._selected!.sort(predicate);
        }
    }

    /**
     * Gets whether multiple values can be selected.
     */
    isMultipleSelection() {
        return this._multiple;
    }

    /** Emits a change event and clears the records of selected and deselected values. */
    private emitChangeEvent() {
        // Clear the selected values so they can be re-cached.
        this._selected = null;

        if (this.selectedToEmit.length || this.deselectedToEmit.length) {
            this.changed.next({
                source: this,
                added: this.selectedToEmit,
                removed: this.deselectedToEmit
            });

            this.deselectedToEmit = [];
            this.selectedToEmit = [];
        }
    }

    /** Selects a value. */
    private markSelected(value: T) {
        if (!this.isSelected(value)) {
            if (!this._multiple) {
                this.unmarkAll();
            }

            this.selection.add(value);

            if (this._emitChanges) {
                this.selectedToEmit.push(value);
            }
        }
    }

    /** Deselects a value. */
    private unmarkSelected(value: T) {
        if (this.isSelected(value)) {
            this.selection.delete(value);

            if (this._emitChanges) {
                this.deselectedToEmit.push(value);
            }
        }
    }

    /** Clears out the selected values. */
    private unmarkAll() {
        if (!this.isEmpty()) {
            this.selection.forEach((value) => this.unmarkSelected(value));
        }
    }

    /**
     * Verifies the value assignment and throws an error if the specified value array is
     * including multiple values while the selection model is not supporting multiple values.
     */
    private verifyValueAssignment(values: T[]) {
        if (values.length > 1 && !this._multiple) {
            throw getMultipleValuesInSingleSelectionError();
        }
    }
}

/**
 * Event emitted when the value of a MatSelectionModel has changed.
 * @docs-private
 */
export interface SelectionChange<T> {
    /** Model that dispatched the event. */
    source: SelectionModel<T>;
    /** Options that were added to the model. */
    added: T[];
    /** Options that were removed from the model. */
    removed: T[];
}

/**
 * Returns an error that reports that multiple values are passed into a selection model
 * with a single value.
 * @docs-private
 */
export function getMultipleValuesInSingleSelectionError() {
    return Error('Cannot pass multiple values into SelectionModel with single-value mode.');
}
