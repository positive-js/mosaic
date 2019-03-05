import { QueryList } from '@angular/core';

import { Subject, Subscription } from 'rxjs';
import { debounceTime, filter, map, tap } from 'rxjs/operators';

import {
    UP_ARROW,
    DOWN_ARROW,
    LEFT_ARROW,
    RIGHT_ARROW,
    TAB,
    A,
    Z,
    ZERO,
    NINE
} from '@ptsecurity/cdk/keycodes';


// This interface is for items that can be passed to a ListKeyManager.
export interface ListKeyManagerOption {
    // Whether the option is disabled.
    disabled?: boolean;

    // Gets the label for this option.
    getLabel?(): string;
}

/* tslint:disable:member-ordering */
/**
 * This class manages keyboard events for selectable lists. If you pass it a query list
 * of items, it will set the active item correctly when arrow events occur.
 */
export class ListKeyManager<T extends ListKeyManagerOption> {
    /**
     * Stream that emits any time the TAB key is pressed, so components can react
     * when focus is shifted off of the list.
     */
    tabOut: Subject<void> = new Subject<void>();

    /** Stream that emits whenever the active item of the list manager changes. */
    change = new Subject<number>();

    previousActiveItemIndex = -1;
    private _activeItemIndex = -1;
    private _activeItem: T;
    private _wrap: boolean = false;
    private _letterKeyStream = new Subject<string>();
    private _typeaheadSubscription = Subscription.EMPTY;
    private _vertical = true;
    private _horizontal: 'ltr' | 'rtl' | null;

    private _scrollSize: number = 0;
    /**
     * Predicate function that can be used to check whether an item should be skipped
     * by the key manager. By default, disabled items are skipped.
     */
    private _skipPredicateFn = (item: T) => item.disabled;

    // Buffer for the letters that the user has pressed when the typeahead option is turned on.
    private _pressedLetters: string[] = [];

    constructor(private _items: QueryList<T>) {
        if (_items instanceof QueryList) {

            _items.changes.subscribe((newItems: QueryList<T>) => {

                if (this._activeItem) {
                    const itemArray = newItems.toArray();
                    const newIndex = itemArray.indexOf(this._activeItem);

                    if (newIndex > -1 && newIndex !== this._activeItemIndex) {
                        this._activeItemIndex = newIndex;
                    }
                }
            });
        }
    }

    withScrollSize(scrollSize: number): this {
        this._scrollSize = scrollSize;

        return this;
    }

    /**
     * Turns on wrapping mode, which ensures that the active item will wrap to
     * the other end of list when there are no more items in the given direction.
     */

    withWrap(): this {
        this._wrap = true;

        return this;
    }

    /**
     * Configures whether the key manager should be able to move the selection vertically.
     * @param enabled Whether vertical selection should be enabled.
     */
    withVerticalOrientation(enabled: boolean = true): this {
        this._vertical = enabled;

        return this;
    }

    /**
     * Configures the key manager to move the selection horizontally.
     * Passing in `null` will disable horizontal movement.
     * @param direction Direction in which the selection can be moved.
     */
    withHorizontalOrientation(direction: 'ltr' | 'rtl' | null): this {
        this._horizontal = direction;

        return this;
    }

    /**
     * Turns on typeahead mode which allows users to set the active item by typing.
     * @param debounceInterval Time to wait after the last keystroke before setting the active item.
     */
    withTypeAhead(debounceInterval: number = 200): this {
        if (this._items.length && this._items.some((item) => typeof item.getLabel !== 'function')) {
            throw Error('ListKeyManager items in typeahead mode must implement the `getLabel` method.');
        }

        this._typeaheadSubscription.unsubscribe();

        // Debounce the presses of non-navigational keys, collect the ones that correspond to letters and convert those
        // letters back into a string. Afterwards find the first item that starts with that string and select it.
        this._typeaheadSubscription = this._letterKeyStream.pipe(
            tap((keyCode) => this._pressedLetters.push(keyCode)),
            debounceTime(debounceInterval),
            filter(() => this._pressedLetters.length > 0),
            map(() => this._pressedLetters.join(''))
        ).subscribe((inputString) => {
            const items = this._items.toArray();

            // Start at 1 because we want to start searching at the item immediately
            // following the current active item.
            for (let i = 1; i < items.length + 1; i++) {
                const index = (this._activeItemIndex + i) % items.length;
                const item = items[index];

                if (!item.disabled && item.getLabel!().toUpperCase().trim().indexOf(inputString) === 0) {
                    this.setActiveItem(index);
                    break;
                }
            }

            this._pressedLetters = [];
        });

        return this;
    }

    /**
     * Sets the active item to the item at the index specified.
     * @param index The index of the item to be set as active or item The item to be set as active.
     */
    setActiveItem(index: number | T): void;

    /**
     * Sets the active item to the item at the index specified.
     * @param item The index of the item to be set as active.
     */
    setActiveItem(item: any): void {
        this.previousActiveItemIndex = this._activeItemIndex;

        this.updateActiveItem(item);

        if (this._activeItemIndex !== this.previousActiveItemIndex) {
            this.change.next(this._activeItemIndex);
        }
    }

    /**
     * Sets the active item depending on the key event passed in.
     * @param event Keyboard event to be used for determining which element should be active.
     */
    onKeydown(event: KeyboardEvent): void {
        const keyCode = event.keyCode;

        switch (keyCode) {
            case TAB:
                this.tabOut.next();

                return;

            case DOWN_ARROW:
                if (this._vertical) {
                    this.setNextItemActive();
                    break;
                } else {
                    return;
                }

            case UP_ARROW:
                if (this._vertical) {
                    this.setPreviousItemActive();
                    break;
                } else {
                    return;
                }

            case RIGHT_ARROW:
                if (this._horizontal === 'ltr') {
                    this.setNextItemActive();
                    break;
                } else if (this._horizontal === 'rtl') {
                    this.setPreviousItemActive();
                    break;
                } else {
                    return;
                }

            case LEFT_ARROW:
                if (this._horizontal === 'ltr') {
                    this.setPreviousItemActive();
                    break;
                } else if (this._horizontal === 'rtl') {
                    this.setNextItemActive();
                    break;
                } else {
                    return;
                }

            default:
                // Attempt to use the `event.key` which also maps it to the user's keyboard language,
                // otherwise fall back to resolving alphanumeric characters via the keyCode.
                if (event.key && event.key.length === 1) {
                    this._letterKeyStream.next(event.key.toLocaleUpperCase());
                } else if ((keyCode >= A && keyCode <= Z) || (keyCode >= ZERO && keyCode <= NINE)) {
                    this._letterKeyStream.next(String.fromCharCode(keyCode));
                }

                // Note that we return here, in order to avoid preventing
                // the default action of non-navigational keys.
                return;
        }

        this._pressedLetters = [];
        event.preventDefault();
    }

    // Index of the currently active item.
    get activeItemIndex(): number {
        return this._activeItemIndex;
    }

    // The active item.
    get activeItem(): T | null {
        return this._activeItem;
    }

    // Sets the active item to the first enabled item in the list.
    setFirstItemActive(): void {
        this._setActiveItemByIndex(0, 1);
    }

    // Sets the active item to the last enabled item in the list.
    setLastItemActive(): void {
        this._setActiveItemByIndex(this._items.length - 1, -1);
    }

    // Sets the active item to the next enabled item in the list.
    setNextItemActive(): void {
        this._activeItemIndex < 0 ? this.setFirstItemActive() : this._setActiveItemByDelta(1);
    }

    // Sets the active item to a previous enabled item in the list.
    setPreviousItemActive(): void {
        this._activeItemIndex < 0 && this._wrap ? this.setLastItemActive()
            : this._setActiveItemByDelta(-1);
    }

    setNextPageItemActive(delta: number = this._scrollSize): void {
        const nextItemIndex = this._activeItemIndex + delta;

        if (nextItemIndex >= this._items.length) {
            this.setLastItemActive();
        } else {
            this._setActiveItemByDelta(delta);
        }
    }

    setPreviousPageItemActive(delta: number = this._scrollSize): void {
        const nextItemIndex = this._activeItemIndex - delta;

        if (nextItemIndex <= 0) {
            this.setFirstItemActive();
        } else {
            this._setActiveItemByDelta(-delta);
        }
    }

    /**
     * Allows setting the active without any other effects.
     * @param index Index of the item to be set as active.
     */
    updateActiveItem(index: number): void;

    /**
     * Allows setting the active item without any other effects.
     * @param item Item to be set as active or index Index of the item to be set as active..
     */
    updateActiveItem(item: number | T): void;

    updateActiveItem(item: any): void {
        const itemArray = this._items.toArray();
        const index = typeof item === 'number' ? item : itemArray.indexOf(item);

        this._activeItemIndex = index;
        this._activeItem = itemArray[index];
    }

    /**
     * This method sets the active item, given a list of items and the delta between the
     * currently active item and the new active item. It will calculate differently
     * depending on whether wrap mode is turned on.
     */
    private _setActiveItemByDelta(delta: number): void {
        this._wrap ? this._setActiveInWrapMode(delta) : this._setActiveInDefaultMode(delta);
    }

    /**
     * Sets the active item properly given "wrap" mode. In other words, it will continue to move
     * down the list until it finds an item that is not disabled, and it will wrap if it
     * encounters either end of the list.
     */
    private _setActiveInWrapMode(delta: number): void {
        const items = this._getItemsArray();

        for (let i = 1; i <= items.length; i++) {
            const index = (this._activeItemIndex + (delta * i) + items.length) % items.length;
            const item = items[index];

            if (!this._skipPredicateFn(item)) {
                this.setActiveItem(index);

                return;
            }
        }
    }

    /**
     * Sets the active item properly given the default mode. In other words, it will
     * continue to move down the list until it finds an item that is not disabled. If
     * it encounters either end of the list, it will stop and not wrap.
     */
    private _setActiveInDefaultMode(delta: number): void {
        this._setActiveItemByIndex(this._activeItemIndex + delta, delta);
    }

    /**
     * Sets the active item to the first enabled item starting at the index specified. If the
     * item is disabled, it will move in the fallbackDelta direction until it either
     * finds an enabled item or encounters the end of the list.
     */
    private _setActiveItemByIndex(index: number, fallbackDelta: number): void {
        const items = this._getItemsArray();

        if (!items[index]) { return; }

        while (this._skipPredicateFn(items[index])) {
            index += fallbackDelta;

            if (!items[index]) { return; }
        }

        this.setActiveItem(index);
    }

    /** Returns the items as an array. */
    private _getItemsArray(): T[] {
        return this._items instanceof QueryList ? this._items.toArray() : this._items;
    }
}

/* tslint:enable:member-ordering */
