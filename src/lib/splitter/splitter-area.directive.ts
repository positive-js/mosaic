import { Directive, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';

import { McSplitterComponent } from './splitter.component';
import { Direction, SizeProperty } from './splitter.constants';


const SPLITTER_AREA_FLEX_STYLE = 'mc-splitter-area-flex';


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

    disableFlex(): void {
        const flexClasses: string[] = [
            'flex',
            'flex-0',
            'flex-10',
            'flex-15',
            'flex-20',
            'flex-25',
            'flex-30',
            'flex-33',
            'flex-35',
            'flex-40',
            'flex-45',
            'flex-50',
            'flex-55',
            'flex-60',
            'flex-65',
            'flex-66',
            'flex-70',
            'flex-75',
            'flex-80',
            'flex-85',
            'flex-90',
            'flex-95',
            'flex-100'
        ];

        for (const flexClass of flexClasses) {
            this.renderer.removeClass(this.elementRef.nativeElement, flexClass);
        }

        this.renderer.removeClass(this.elementRef.nativeElement, SPLITTER_AREA_FLEX_STYLE);
    }

    ngOnInit(): void {
        this.splitter.addArea(this);
        this.renderer.addClass(this.elementRef.nativeElement, SPLITTER_AREA_FLEX_STYLE);
    }

    ngOnDestroy(): void {
        this.splitter.removeArea(this);
    }

    setOrder(order: number): void {
        this.renderer.addClass(this.elementRef.nativeElement, `flex-order-${order}`);
    }

    setSize(size: number): void {
        const sz = Number(size);
        this.renderer.setStyle(this.elementRef.nativeElement, this.getSizeProperty(), `${sz}px`);
    }

    getSize(): number {
        return this.elementRef.nativeElement[this.getOffsetSizeProperty()];
    }

    private getOffsetSizeProperty(): SizeProperty {
        return this.splitter.direction === Direction.Vertical
            ? SizeProperty.OffsetHeight
            : SizeProperty.OffsetWidth;
    }

    private getSizeProperty(): SizeProperty {
        return this.splitter.direction === Direction.Vertical
            ? SizeProperty.Height
            : SizeProperty.Width;
    }


}
