import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

import { Cursor, Direction, State } from './splitter.constants';


@Directive({
    selector: 'mc-gutter',
    host: {
        '[class.mc-splitter-gutter]': 'true'
    }
})
export class McGutterDirective {
    private _direction: Direction = Direction.Vertical;
    private _disabled: boolean = false;
    private _withAnimation: boolean = false;

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
        /*
         * disable gutter if:
         * <... disabled>
         * <... disabled='true'>
         *
         * enable gutter if:
         * <... >
         * <... disabled='false'>
         *
         * any other value keep gutter enabled
         */
        this._disabled = `${disabled}` === 'true' || `${disabled}` === '';
        this.refresh();
    }

    get disabled(): boolean {
        return this._disabled;
    }

    @Input()
    set horizontalImage(image: string) {
        this._horizontalImage = image;
    }

    get horizontalImage(): string {
        return this._horizontalImage;
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
    set verticalImage(image: string) {
        this._verticalImage = image;
    }

    get verticalImage(): string {
        return this._verticalImage;
    }

    @Input()
    set withAnimation(withAnimation: boolean) {
        this._withAnimation = withAnimation;

        if (this.withAnimation) {
            this.renderer.setStyle(this.elementRef.nativeElement, 'transition', 'flex-basis 0.3s');
        } else {
            this.renderer.removeStyle(this.elementRef.nativeElement, 'transition');
        }
    }

    get withAnimation(): boolean {
        return this._withAnimation;
    }

    constructor(private renderer: Renderer2,
                private elementRef: ElementRef) {
    }

    private isVertical(): boolean {
        return this.direction === Direction.Vertical;
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
                throw Error(`Unknown gutter state for cursor: ${state}`);
        }
    }

    private getState(): State {
        return this.disabled
            ? State.Disabled
            : this.direction === Direction.Vertical
                ? State.Vertical
                : State.Horizontal;
    }

    private refresh(): void {
        this.renderer.setStyle(this.elementRef.nativeElement, 'cursor', this.getCursor(this.getState()));
    }
}
