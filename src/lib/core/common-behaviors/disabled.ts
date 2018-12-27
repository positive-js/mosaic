import { coerceBooleanProperty } from '@ptsecurity/cdk/coercion';

import { Constructor } from './constructor';


export interface CanDisable {
    disabled: boolean;
}

/** @docs-private */
export type CanDisableCtor = Constructor<CanDisable>;

// Mixin to augment a directive with a `disabled` property.
export function mixinDisabled<T extends Constructor<{}>>(base: T): CanDisableCtor & T {
    return class extends base {
        private _disabled: boolean = false;

        get disabled() {
            return this._disabled;
        }

        set disabled(value: any) {
            this._disabled = coerceBooleanProperty(value);
        }

        constructor(...args: any[]) {
            // tslint:disable-next-line
            super(...args);
        }
    };
}
