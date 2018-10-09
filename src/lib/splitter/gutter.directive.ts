import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

import { Direction } from './splitter.constants';


@Directive({
    selector: 'mc-gutter',
    host: {
        '[class.mc-splitter-gutter]': 'true'
    }
})
export class McGutterDirective {
    private _direction: Direction = Direction.Vertical;

    @Input()
    set direction(direction: Direction) {
        this._direction = direction;
    }

    get direction(): Direction {
        return this._direction;
    }

    @Input()
    set size(size: number) {
        this.renderer.setStyle(
            this.elementRef.nativeElement,
            this.isVertical() ? 'width' : 'height',
            `${size}px`
        );
    }

    @Input()
    set order(order: number) {
        this.renderer.addClass(this.elementRef.nativeElement, `flex-order-${order}`);
    }

    constructor(private renderer: Renderer2,
                private elementRef: ElementRef) {
    }

    private isVertical(): boolean {
        return this._direction === Direction.Vertical;
    }
}
