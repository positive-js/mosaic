import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

import { toBoolean } from '../core';


@Component({
    selector: 'mc-divider',
    host: {
        class: 'mc-divider',
        role: 'separator',
        '[attr.aria-orientation]': 'vertical ? "vertical" : "horizontal"',
        '[class.mc-divider-vertical]': 'vertical',
        '[class.mc-divider-inset]': 'inset'
    },
    template: '',
    styleUrls: ['divider.css'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    preserveWhitespaces: false
})
export class MatDivider {
    // Whether the divider is vertically aligned.
    @Input()
    get vertical(): boolean {
        return this._vertical;
    }

    set vertical(value: boolean) {
        this._vertical = toBoolean(value);
    }

    private _vertical: boolean = false;

    // Whether the divider is an inset divider.
    @Input()
    get inset(): boolean {
        return this._inset;
    }

    set inset(value: boolean) {
        this._inset = toBoolean(value);
    }

    private _inset: boolean = false;
}
