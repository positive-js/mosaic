import { ElementRef } from '@angular/core';

import { Constructor } from './constructor';


// tslint:disable-next-line:naming-convention
export interface CanColor {
    color: ThemePalette;
}

/** @docs-private */
export type CanColorCtor = Constructor<CanColor>;

// tslint:disable-next-line:naming-convention
export interface HasElementRef {
    _elementRef: ElementRef;
}

export enum ThemePalette {
    Primary = 'primary',
    Second = 'second',
    Error = 'error',
    Default = 'second',
    Empty = ''
}

/** Mixin to augment a directive with a `color` property. */
export function mixinColor<T extends Constructor<HasElementRef>>(
    base: T,
    defaultColor: ThemePalette = ThemePalette.Default
): CanColorCtor & T {
    return class extends base {

        get color(): ThemePalette {
            return this._color;
        }

        set color(value: ThemePalette) {
            const colorPalette = value || defaultColor;

            if (colorPalette !== this._color) {
                if (this._color) {
                    this._elementRef.nativeElement.classList.remove(`mc-${this._color}`);
                }

                if (colorPalette) {
                    this._elementRef.nativeElement.classList.add(`mc-${colorPalette}`);
                }

                this._color = colorPalette;
            }
        }

        private _color: ThemePalette;

        constructor(...args: any[]) {
            super(...args);

            this.color = defaultColor;
        }
    };
}

