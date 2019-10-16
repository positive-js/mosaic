import { Constructor } from './constructor';
import { CanDisable } from './disabled';


// tslint:disable-next-line:naming-convention
export interface HasTabIndex {
    tabIndex: number;
}

export type HasTabIndexCtor = Constructor<HasTabIndex>;

// Mixin to augment a directive with a `tabIndex` property.
export function mixinTabIndex<T extends Constructor<CanDisable>>(base: T, defaultTabIndex = 0): HasTabIndexCtor & T {
    return class extends base {
        get tabIndex(): number {
            return this.disabled ? -1 : this._tabIndex;
        }

        set tabIndex(value: number) {
            this._tabIndex = value != null ? value : defaultTabIndex;
        }

        private _tabIndex: number = defaultTabIndex;

        constructor(...args: any[]) {
            super(...args);
        }
    };
}
