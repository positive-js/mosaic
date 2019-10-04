import { coerceBooleanProperty } from '@angular/cdk/coercion';

import { Constructor } from './constructor';


export interface ICanDisable {
    disabled: boolean;
}

/** @docs-private */
export type CanDisableCtor = Constructor<ICanDisable>;

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
            // tslint:disable-next-line
            super(...args);
        }
    };
}
