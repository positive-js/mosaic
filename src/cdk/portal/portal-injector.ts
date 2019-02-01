import { Injector } from '@angular/core';


/**
 * Custom injector to be used when providing custom
 * injection tokens to components inside a portal.
 * @docs-private
 */
export class PortalInjector implements Injector {
    constructor(
        private _parentInjector: Injector,
        private _customTokens: WeakMap<any, any>) {
    }

    get(token: any, notFoundValue?: any): any { // tslint:disable-line
        const value = this._customTokens.get(token);

        if (value !== undefined) {
            return value;
        }

        return this._parentInjector.get<any>(token, notFoundValue);
    }
}
