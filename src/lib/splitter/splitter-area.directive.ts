import { Directive, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';

import { McSplitterComponent } from './splitter.component';
import { Direction, SizeProperty } from './splitter.constants';


@Directive({
    selector: 'mc-splitter-area',
    host: {
        '[class.mc-splitter-area]': 'true'
    }
})
export class McSplitterAreaDirective implements OnInit, OnDestroy {
    constructor(private elementRef: ElementRef,
                private renderer: Renderer2,
                private splitter: McSplitterComponent) {}

    ngOnInit(): void {
        this.splitter.addArea(this);
    }

    ngOnDestroy(): void {
        this.splitter.removeArea(this);
    }

    getOffsetSizeProperty(direction: Direction): SizeProperty {
        return direction === Direction.Vertical
            ? SizeProperty.OffsetHeight
            : SizeProperty.OffsetWidth;
    }

    getSizeProperty(direction: Direction): SizeProperty {
        return direction === Direction.Vertical
            ? SizeProperty.Height
            : SizeProperty.Width;
    }

    setOrder(order: number) {
        this.renderer.addClass(this.elementRef.nativeElement, `flex-order-${order}`);
    }

    setSize(size: number, direction: Direction) {
        const sz = Number(size);
        this.renderer.setStyle(this.elementRef.nativeElement, this.getSizeProperty(direction), `${sz}px`);
    }

    getSize(direction: Direction): number {
        return this.elementRef.nativeElement[this.getOffsetSizeProperty(direction)];
    }
}
