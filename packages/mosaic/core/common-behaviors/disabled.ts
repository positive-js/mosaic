import { coerceBooleanProperty } from '@angular/cdk/coercion';

import { AbstractConstructor, Constructor } from './constructor';


// tslint:disable-next-line naming-convention
export interface CanDisable {
    disabled: boolean;
}

/** @docs-private */
export type CanDisableCtor = Constructor<CanDisable> & AbstractConstructor<CanDisable>;

/** Mixin to augment a directive with a `disabled` property. */
export function mixinDisabled<T extends AbstractConstructor<{}>>(base: T): CanDisableCtor & T;
export function mixinDisabled<T extends Constructor<{}>>(base: T): CanDisableCtor & T {
    return class extends base {
        get disabled() {
            return this._disabled;
        }

        set disabled(value: any) {
            this._disabled = coerceBooleanProperty(value);
        }

        private _disabled: boolean = false;

        constructor(...args: any[]) {
            super(...args);
        }
    };
}
