import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

import { coerceBooleanProperty } from '@ptsecurity/cdk/coercion';

import { Direction, SizeProperty } from './splitter.constants';


const enum Cursor {
    ResizeColumn = 'col-resize',
    ResizeRow = 'row-resize',
    Default = 'default'
}

const enum State {
    Horizontal = 'horizontal',
    Vertical = 'vertical',
    Disabled = 'disabled'
}

@Directive({
    selector: 'mc-gutter',
    host: {
        '[class.mc-splitter-gutter]': 'true'
    }
})
export class McGutterDirective implements OnInit {
    private _direction: Direction = Direction.Vertical;
    private _disabled: boolean = false;
    private _withAnimation: boolean = false;

    @Input()
    set direction(direction: Direction) {
        this._direction = direction;
    }

    get direction(): Direction {
        return this._direction;
    }

    @Input()
    set disabled(disabled: boolean) {
        this._disabled = coerceBooleanProperty(disabled);
    }

    get disabled(): boolean {
        return this._disabled;
    }

    @Input()
    set size(size: number) {
        this.renderer.setStyle(
            this.elementRef.nativeElement,
            this.isVertical() ? SizeProperty.Height : SizeProperty.Width,
            `${size}px`
        );
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

    ngOnInit(): void {
        this.renderer.setStyle(this.elementRef.nativeElement, 'cursor', this.getCursor(this.getState()));
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
}
