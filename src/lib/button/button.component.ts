import {
    ChangeDetectionStrategy,
    Component, Directive, ElementRef, OnDestroy, ViewEncapsulation
} from '@angular/core';

import { mixinColor, mixinDisabled } from '../core/common-behaviors/index';
import { ThemePalette, CanColor, CanDisable } from '../core/common-behaviors/index';

class CSSClass {
    prefix: string;
    _name: string;
    _modificator: string = '';

    constructor(prefix: string, name: string) {
        this.prefix = prefix;
        this._name = name;
    }

    set modificator(name: string) {
        this._modificator = name;
    }

    get modificator(): string {
        return this._modificator;
    }

    set name(name: string) {
        this._name = name;
    }

    get name(): string {
        return this._name;
    }
}

@Directive({
    selector: 'button[mc-button], a[mc-button]',
    host: { class: 'mc-button' }
})
export class McButtonStyler {}

/** @docs-private */
export class McButtonBase {
    CSSClass: CSSClass = new CSSClass('mc', 'button');

    constructor(public _elementRef: ElementRef) {}
}

export const _McButtonMixinBase = mixinColor(mixinDisabled(McButtonBase));

@Component({
    selector: 'button[mc-button]',
    templateUrl: './button.component.html',
    styleUrls: ['./button.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['disabled', 'color'],
    host: {
        '[disabled]': 'disabled || null',
    }
})
export class McButton extends _McButtonMixinBase implements CanDisable, CanColor {
    constructor(elementRef: ElementRef) {
        super(elementRef);
    }

    focus(): void {
        this._getHostElement().focus();
    }

    _getHostElement() {
        return this._elementRef.nativeElement;
    }
}
