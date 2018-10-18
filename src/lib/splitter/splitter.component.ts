import {
    ChangeDetectionStrategy,
    Component,
    Directive,
    ElementRef,
    Input,
    NgZone, OnDestroy,
    OnInit,
    Renderer2,
    ViewEncapsulation
} from '@angular/core';

import { coerceBooleanProperty, coerceCssPixelValue, coerceNumberProperty } from '@ptsecurity/cdk/coercion';


interface IArea {
    area: McSplitterAreaDirective;
    index: number;
    order: number;
    initialSize: number;
}

interface IPoint {
    x: number;
    y: number;
}


const enum AttributeProperty {
    Disabled = 'disabled'
}

const enum Cursor {
    Default = 'default',
    ResizeColumn = 'col-resize',
    ResizeRow = 'row-resize'
}

const enum StyleProperty {
    Cursor = 'cursor',
    Flex = 'flex',
    FlexBasis = 'flex-basis',
    FlexDirection = 'flex-direction',
    Height = 'height',
    MaxWidth = 'max-width',
    MinHeight = 'min-height',
    MinWidth = 'minWidth',
    OffsetHeight = 'offsetHeight',
    OffsetWidth = 'offsetWidth',
    Order = 'order',
    Width = 'width'
}

const enum State {
    Disabled = 'disabled',
    Horizontal = 'horizontal',
    Vertical = 'vertical'
}

export const enum Direction {
    Horizontal = 'horizontal',
    Vertical = 'vertical'
}

@Component({
    selector: 'mc-splitter',
    preserveWhitespaces: false,
    styleUrls: ['splitter.css'],
    templateUrl: './splitter.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McSplitterComponent implements OnInit {
    readonly areas: IArea[] = [];

    private _direction: Direction;
    private _disabled: boolean = false;
    private _gutterSize: number = 6;

    private isDragging: boolean = false;

    private readonly areaPositionDivider: number = 2;
    private readonly listeners: (() => void)[] = [];

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
    set gutterSize(gutterSize: number) {
        const size = coerceNumberProperty(gutterSize);
        this._gutterSize = size > 0 ? size : this.gutterSize;
    }

    get gutterSize(): number {
        return this._gutterSize;
    }

    constructor(private elementRef: ElementRef,
                private ngZone: NgZone,
                private renderer: Renderer2) {}

    addArea(area: McSplitterAreaDirective): void {
        const index: number = this.areas.length;
        const order: number = index * this.areaPositionDivider;
        const size: number = area.getSize();

        area.setOrder(order);

        this.areas.push({
            area,
            index,
            order,
            initialSize: size
        });
    }

    ngOnInit(): void {
        if (!this.direction) {
            this.direction = Direction.Horizontal;
        }

        this.setStyle(StyleProperty.FlexDirection, this.isVertical() ? 'column' : 'row');
    }

    onMouseDown(event: MouseEvent, leftAreaIndex: number, rightAreaIndex: number) {
        if (this.disabled) {
            return;
        }

        const leftArea = this.areas[leftAreaIndex];
        const rightArea = this.areas[rightAreaIndex];

        const startPoint: IPoint = {
            x: event.screenX,
            y: event.screenY
        };

        leftArea.initialSize = leftArea.area.getSize();
        rightArea.initialSize = rightArea.area.getSize();

        this.areas.forEach((item) => {
            const size = item.area.getSize();
            item.area.disableFlex();
            item.area.setSize(size);
        });

        this.ngZone.runOutsideAngular(() => {
            this.listeners.push(
                this.renderer.listen(
                    'document',
                    'mouseup',
                    () => this.onMouseUp()
                )
            );
        });

        this.ngZone.runOutsideAngular(() => {
            this.listeners.push(
                this.renderer.listen(
                    'document',
                    'mousemove',
                    (e: MouseEvent) => this.onMouseMove(e, startPoint, leftArea, rightArea)
                )
            );
        });

        this.isDragging = true;
    }

    removeArea(area: McSplitterAreaDirective): void {
        let indexToRemove: number = -1;

        this.areas.some((item, index) => {
            if (item.area === area) {
                indexToRemove = index;

                return true;
            }

            return false;
        });

        if (indexToRemove === -1) {
            return;
        }

        this.areas.splice(indexToRemove, 1);
    }

    private isVertical(): boolean {
        return this.direction === Direction.Vertical;
    }

    private onMouseMove(event: MouseEvent, startPoint: IPoint, leftArea: IArea, rightArea: IArea) {
        if (!this.isDragging || this.disabled) {
            return;
        }

        const endPoint: IPoint = {
            x: event.screenX,
            y: event.screenY
        };

        const offset = this.isVertical()
            ? startPoint.y - endPoint.y
            : startPoint.x - endPoint.x;

        const newLeftAreaSize = leftArea.initialSize - offset;
        const newRightAreaSize = rightArea.initialSize + offset;

        const minLeftAreaSize = leftArea.area.getMinSize();
        const minRightAreaSize = rightArea.area.getMinSize();

        if (newLeftAreaSize <= minLeftAreaSize || newRightAreaSize <= minRightAreaSize) {
            const rightAreaOffset = leftArea.initialSize - minLeftAreaSize;

            leftArea.area.setSize(minLeftAreaSize);
            rightArea.area.setSize(rightArea.initialSize + rightAreaOffset);
        } else if (newLeftAreaSize <= 0) {
            leftArea.area.setSize(0);
            rightArea.area.setSize(rightArea.initialSize + leftArea.initialSize);
        } else if (newRightAreaSize <= 0) {
            leftArea.area.setSize(rightArea.initialSize + leftArea.initialSize);
            rightArea.area.setSize(0);
        } else {
            leftArea.area.setSize(newLeftAreaSize);
            rightArea.area.setSize(newRightAreaSize);
        }
    }

    private onMouseUp() {
        while (this.listeners.length > 0) {
            const unsubscribe = this.listeners.pop();

            if (unsubscribe) {
                unsubscribe();
            }
        }

        this.isDragging = false;
    }

    private setStyle(property: StyleProperty, value: string | number) {
        this.renderer.setStyle(this.elementRef.nativeElement, property, value);
    }
}

@Directive({
    selector: 'mc-gutter'
})
export class McGutterDirective implements OnInit {
    private _direction: Direction = Direction.Vertical;
    private _disabled: boolean = false;
    private _order: number = 0;
    private _size: number = 6;

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
    set order(order: number) {
        this._order = coerceNumberProperty(order);
    }

    get order(): number {
        return this._order;
    }

    @Input()
    set size(size: number) {
        this._size = coerceNumberProperty(size);
    }

    get size(): number {
        return this._size;
    }

    constructor(private renderer: Renderer2,
                private elementRef: ElementRef) {
    }

    ngOnInit(): void {
        this.setStyle(StyleProperty.Cursor, this.getCursor(this.getState()));
        this.setStyle(StyleProperty.FlexBasis, coerceCssPixelValue(this.size));
        this.setStyle(this.isVertical() ? StyleProperty.Height : StyleProperty.Width, coerceCssPixelValue(this.size));
        this.setStyle(StyleProperty.Order, this.order);

        if (!this.isVertical()) {
            this.setStyle(StyleProperty.Height, '100%');
        }

        if (this.disabled) {
            this.setAttr(AttributeProperty.Disabled, 'true');
        }
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

    private setStyle(property: StyleProperty, value: string | number) {
        this.renderer.setStyle(this.elementRef.nativeElement, property, value);
    }

    private setAttr(attribute: AttributeProperty, value: string) {
        this.renderer.setAttribute(this.elementRef.nativeElement, attribute, value);
    }
}

@Directive({
    selector: 'mc-splitter-area'
})
export class McSplitterAreaDirective implements OnInit, OnDestroy {
    constructor(private elementRef: ElementRef,
                private renderer: Renderer2,
                private splitter: McSplitterComponent) {}

    disableFlex(): void {
        this.renderer.removeStyle(this.elementRef.nativeElement, 'flex');
    }

    ngOnInit(): void {
        this.splitter.addArea(this);

        this.removeStyle(StyleProperty.MaxWidth);
        this.setStyle(StyleProperty.Flex, '1');

        if (this.splitter.direction === Direction.Vertical) {
            this.setStyle(StyleProperty.Width, '100%');
            this.removeStyle(StyleProperty.Height);
        } else {
            this.setStyle(StyleProperty.Height, '100%');
            this.removeStyle(StyleProperty.Width);
        }
    }

    ngOnDestroy(): void {
        this.splitter.removeArea(this);
    }

    setOrder(order: number): void {
        this.setStyle(StyleProperty.Order, order);
    }

    setSize(size: number): void {
        const sz = coerceNumberProperty(size);
        this.setStyle(this.getSizeProperty(), coerceCssPixelValue(sz));
    }

    getSize(): number {
        return this.elementRef.nativeElement[this.getOffsetSizeProperty()];
    }

    getMinSize(): number {
        const styles = getComputedStyle(this.elementRef.nativeElement);

        return parseFloat(styles[this.getMinSizeProperty()]);
    }

    private isVertical(): boolean {
        return this.splitter.direction === Direction.Vertical;
    }

    private getMinSizeProperty(): StyleProperty {
        return this.isVertical()
            ? StyleProperty.MinHeight
            : StyleProperty.MinWidth;
    }

    private getOffsetSizeProperty(): StyleProperty {
        return this.isVertical()
            ? StyleProperty.OffsetHeight
            : StyleProperty.OffsetWidth;
    }

    private getSizeProperty(): StyleProperty {
        return this.isVertical()
            ? StyleProperty.Height
            : StyleProperty.Width;
    }

    private setStyle(style: StyleProperty, value: string | number) {
        this.renderer.setStyle(this.elementRef.nativeElement, style, value);
    }

    private removeStyle(style: StyleProperty) {
        this.renderer.removeStyle(this.elementRef.nativeElement, style);
    }
}
