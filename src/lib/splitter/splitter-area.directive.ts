import {
    Directive,
    ElementRef,
    OnInit,
    OnDestroy,
    Renderer2
} from '@angular/core';

import { McSplitterComponent } from './splitter.component';


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

    setOrder(order: number) {
        // this.renderer.setStyle(this.elementRef.nativeElement, 'order', order)
        this.renderer.addClass(this.elementRef.nativeElement, `flex-offset-${order}`);
    }
}
