import { coerceNumberProperty } from '@angular/cdk/coercion';

import { AbstractConstructor, Constructor } from './constructor';
import { CanDisable } from './disabled';


// tslint:disable-next-line:naming-convention
export interface HasTabIndex {
    tabIndex: number;
}

export type HasTabIndexCtor = Constructor<HasTabIndex> & AbstractConstructor<HasTabIndex>;

/** Mixin to augment a directive with a `tabIndex` property. */
export function mixinTabIndex<T extends AbstractConstructor<CanDisable>>(base: T, defaultTabIndex?: number): HasTabIndexCtor & T;

export function mixinTabIndex<T extends Constructor<CanDisable>>(base: T, defaultTabIndex = 0): HasTabIndexCtor & T {
    return class extends base implements HasTabIndex {
        defaultTabIndex = defaultTabIndex;

        get tabIndex(): number {
            return this.disabled ? -1 : this._tabIndex;
        }

        set tabIndex(value: number) {
            // If the specified tabIndex value is null or undefined, fall back to the default value.
            this._tabIndex = value != null ? coerceNumberProperty(value) : this.defaultTabIndex;
        }

        private _tabIndex: number = defaultTabIndex;

        constructor(...args: any[]) {
            super(...args);
        }
    };
}
