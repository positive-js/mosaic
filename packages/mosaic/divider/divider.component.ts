import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';


@Component({
    selector: 'mc-divider',
    host: {
        class: 'mc-divider',
        '[class.mc-divider_vertical]': 'vertical',
        '[class.mc-divider_horizontal]': '!vertical',
        '[class.mc-divider_inset]': 'inset'
    },
    template: '',
    styleUrls: ['divider.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McDivider {
    // Whether the divider is vertically aligned.
    @Input()
    get vertical(): boolean {
        return this._vertical;
    }

    set vertical(value: boolean) {
        this._vertical = coerceBooleanProperty(value);
    }

    private _vertical: boolean = false;

    // Whether the divider is an inset divider.
    @Input()
    get inset(): boolean {
        return this._inset;
    }

    set inset(value: boolean) {
        this._inset = coerceBooleanProperty(value);
    }

    private _inset: boolean = false;
}
