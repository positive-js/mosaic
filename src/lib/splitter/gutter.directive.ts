import { Directive, ElementRef, Input, Renderer2 } from "@angular/core";

import { Cursor, Direction, State } from "./splitter.constants";


@Directive({
    selector: 'mc-gutter',
    host: {
        '[class.mc-splitter-gutter]': 'true'
    }
})
export class McGutterDirective {
    private _direction: Direction = Direction.Vertical;
    private _disabled: boolean = false;

    @Input()
    set direction(direction: Direction) {
        this._direction = direction;
        this.refresh();
    }

    get direction(): Direction {
        return this._direction;
    }

    @Input()
    set disabled(disabled: boolean) {
        this._disabled = disabled;
        this.refresh();
    }

    get disabled(): boolean {
        return this._disabled;
    }

    @Input()
    set size(size: number) {
        this.renderer.setStyle(
            this.elementRef.nativeElement,
            this.isVertical() ? 'height' : 'width',
            `${size}px`
        );

        this.refresh();
    }

    @Input()
    set order(order: number) {
        this.renderer.addClass(this.elementRef.nativeElement, `flex-order-${order}`);
    }

    constructor(private renderer: Renderer2,
                private elementRef: ElementRef) {
    }

    private isVertical(): boolean {
        return this.direction === Direction.Vertical;
    }

    private getState(): State {
        return this.disabled
            ? State.Disabled
            : this.direction === Direction.Vertical
                ? State.Vertical
                : State.Horizontal;
    }

    private getCursor(state: State): string {
        switch (state) {
            case State.Disabled:
                return Cursor.Default;
            case State.Vertical:
                return  Cursor.ResizeRow;
            case State.Horizontal:
                return Cursor.ResizeColumn;
            default:
                throw Error(`Unknown gutter state: ${state}`);
        }
    }

    private refresh(): void {
        this.renderer.setStyle(this.elementRef.nativeElement, 'cursor', this.getCursor(this.getState()));
    }
}
