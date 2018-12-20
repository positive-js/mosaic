import { ElementRef } from '@angular/core';

import { Constructor } from './constructor';


export interface CanColor<C = ThemePalette> {
    color: C;
}

/** @docs-private */
export type CanColorCtor<C = ThemePalette> = Constructor<CanColor<C>>;

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
export function mixinColor<T extends Constructor<HasElementRef>, C extends string = ThemePalette>(
    base: T,
    defaultColor: C = <C> (<any> ThemePalette.Default)
): CanColorCtor<C> & T {
    return class extends base {

        private _color: C;

        get color(): C {
            return this._color;
        }

        set color(value: C) {
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

        constructor(...args: any[]) {
            super(...args);

            this.color = defaultColor;
        }
    };
}

