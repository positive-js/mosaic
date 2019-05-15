import { FocusOrigin } from '../focus-monitor/focus-monitor';

import { ListKeyManager, ListKeyManagerOption } from './list-key-manager';


/**
 * This is the interface for focusable items (used by the FocusKeyManager).
 * Each item must know how to focus itself, whether or not it is currently disabled
 * and be able to supply it's label.
 */
export interface IFocusableOption extends ListKeyManagerOption {
    // Focuses the `FocusableOption`. */
    focus(origin?: FocusOrigin): void;
}

export class FocusKeyManager<T> extends ListKeyManager<IFocusableOption & T> {
    private _origin: FocusOrigin = 'program';

    /**
     * Sets the focus origin that will be passed in to the items for any subsequent `focus` calls.
     * @param origin Focus origin to be used when focusing items.
     */
    setFocusOrigin(origin: FocusOrigin): this {
        this._origin = origin;

        return this;
    }

    /**
     * Sets the active item or index to the item that is specified and focuses it.
     * @param item Item to be set as active.
     */
    setActiveItem(item: number | T): void;

    setActiveItem(item: any): void {
        super.setActiveItem(item);

        if (this.activeItem) {
            this.activeItem.focus(this._origin);
        }
    }
}
