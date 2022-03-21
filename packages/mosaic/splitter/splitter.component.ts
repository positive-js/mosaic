import { coerceBooleanProperty, coerceCssPixelValue, coerceNumberProperty } from '@angular/cdk/coercion';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Directive,
    ElementRef,
    EventEmitter,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    Renderer2,
    ViewChild,
    ViewChildren,
    ViewEncapsulation
} from '@angular/core';


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

const enum StyleProperty {
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
    Width = 'width',
    Top = 'top',
    Left = 'left',
    Cursor = 'cursor'
}

export enum Direction {
    Horizontal = 'horizontal',
    Vertical = 'vertical'
}

@Directive({
    selector: 'mc-gutter',
    host: {
        class: 'mc-gutter',
        '[class.mc-gutter_vertical]': 'isVertical',
        '[class.mc-gutter_dragged]': 'dragged',
        '(mousedown)': 'dragged = true'
    }
})
export class McGutterDirective implements OnInit {

    @Input()
    get direction(): Direction {
        return this._direction;
    }

    set direction(direction: Direction) {
        this._direction = direction;
    }

    private _direction: Direction = Direction.Vertical;


    @Input()
    get order(): number {
        return this._order;
    }

    set order(order: number) {
        this._order = coerceNumberProperty(order);
    }

    private _order: number = 0;


    @Input()
    get size(): number {
        return this._size;
    }

    set size(size: number) {
        this._size = coerceNumberProperty(size);
    }

    private _size: number = 6;

    get isVertical(): boolean {
        return this._direction === Direction.Vertical;
    }

    dragged: boolean = false;

    constructor(
        private elementRef: ElementRef,
        private renderer: Renderer2
    ) {}

    ngOnInit(): void {
        this.setStyle(StyleProperty.FlexBasis, coerceCssPixelValue(this.size));
        this.setStyle(this.isVertical ? StyleProperty.Height : StyleProperty.Width, coerceCssPixelValue(this.size));
        this.setStyle(StyleProperty.Order, this.order);

        if (!this.isVertical) {
            this.setStyle(StyleProperty.Height, '100%');
        }

        // fix IE issue with gutter icon. flex-direction is requied for flex alignment options
        this.setStyle(StyleProperty.FlexDirection, this.isVertical ? 'row' : 'column');
    }

    getPosition(): IPoint {
        return {
            x: this.elementRef.nativeElement.offsetLeft,
            y: this.elementRef.nativeElement.offsetTop
        };
    }

    private setStyle(property: StyleProperty, value: string | number): void {
        this.renderer.setStyle(this.elementRef.nativeElement, property, value);
    }
}

@Directive({
    selector: 'mc-gutter-ghost',
    host: {
        class: 'mc-gutter-ghost',
        '[class.mc-gutter-ghost_vertical]': 'isVertical',
        '[class.mc-gutter-ghost_visible]': 'visible'
    }
})
export class McGutterGhostDirective {
    @Input() visible: boolean;

    @Input()
    get x(): number {
        return this._x;
    }

    set x(x: number) {
        this._x = x;
        this.setStyle(StyleProperty.Left, coerceCssPixelValue(x));
    }

    private _x: number = 0;

    @Input()
    get y(): number {
        return this._y;
    }

    set y(y: number) {
        this._y = y;
        this.setStyle(StyleProperty.Top, coerceCssPixelValue(y));
    }

    private _y: number = 0;


    @Input()
    get direction(): Direction {
        return this._direction;
    }

    set direction(direction: Direction) {
        this._direction = direction;
        this.updateDimensions();
    }

    private _direction: Direction = Direction.Vertical;

    @Input()
    get size(): number {
        return this._size;
    }

    set size(size: number) {
        this._size = coerceNumberProperty(size);
        this.updateDimensions();
    }

    private _size: number = 6;

    get isVertical(): boolean {
        return this.direction === Direction.Vertical;
    }

    constructor(
        private elementRef: ElementRef,
        private renderer: Renderer2
    ) {}

    private updateDimensions(): void {
        this.setStyle(this.isVertical ? StyleProperty.Width : StyleProperty.Height, '100%');
        this.setStyle(this.isVertical ? StyleProperty.Height : StyleProperty.Width, coerceCssPixelValue(this.size));
    }

    private setStyle(property: StyleProperty, value: string | number): void {
        this.renderer.setStyle(this.elementRef.nativeElement, property, value);
    }
}


@Component({
    selector: 'mc-splitter',
    exportAs: 'mcSplitter',
    host: {
        class: 'mc-splitter'
    },
    preserveWhitespaces: false,
    styleUrls: ['splitter.scss'],
    templateUrl: './splitter.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McSplitterComponent implements OnInit {
    @Output() gutterPositionChange: EventEmitter<void> = new EventEmitter<void>();

    readonly areas: IArea[] = [];

    @ViewChildren(McGutterDirective) gutters: QueryList<McGutterDirective>;
    @ViewChild(McGutterGhostDirective) ghost: McGutterGhostDirective;

    get isDragging(): boolean {
        return this._isDragging;
    }
    private _isDragging: boolean = false;

    private readonly areaPositionDivider: number = 2;
    private readonly listeners: (() => void)[] = [];


    @Input()
    get hideGutters(): boolean {
        return this._hideGutters;
    }

    set hideGutters(value: boolean) {
        this._hideGutters = coerceBooleanProperty(value);
    }

    private _hideGutters: boolean = false;


    @Input()
    get direction(): Direction {
        return this._direction;
    }

    set direction(direction: Direction) {
        this._direction = direction;
    }

    private _direction: Direction;

    @Input()
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(disabled: boolean) {
        this._disabled = coerceBooleanProperty(disabled);
    }

    private _disabled: boolean = false;


    @Input()
    get useGhost(): boolean {
        return this._useGhost;
    }

    set useGhost(useGhost: boolean) {
        this._useGhost = coerceBooleanProperty(useGhost);
    }

    private _useGhost: boolean = false;


    @Input()
    get gutterSize(): number {
        return this._gutterSize;
    }

    set gutterSize(gutterSize: number) {
        const size = coerceNumberProperty(gutterSize);
        this._gutterSize = size > 0 ? size : this.gutterSize;
    }

    private _gutterSize: number = 6;

    get resizing(): boolean {
        return this._resizing;
    }

    private _resizing: boolean = false;

    constructor(
        public elementRef: ElementRef,
        public changeDetectorRef: ChangeDetectorRef,
        private ngZone: NgZone,
        private renderer: Renderer2
    ) {}

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
        if (this.disabled) { return; }

        event.preventDefault();

        const startPoint: IPoint = {
            x: event.screenX,
            y: event.screenY
        };

        const leftArea = this.areas[leftAreaIndex];
        const rightArea = this.areas[rightAreaIndex];

        leftArea.initialSize = leftArea.area.getSize();
        rightArea.initialSize = rightArea.area.getSize();

        let currentGutter: McGutterDirective | undefined;

        if (this.useGhost) {
            // tslint:disable-next-line:no-magic-numbers
            const gutterOrder = leftAreaIndex * 2 + 1;
            currentGutter = this.gutters.find((gutter: McGutterDirective) => gutter.order === gutterOrder);

            if (currentGutter) {
                const gutterPosition = currentGutter.getPosition();

                this.ghost.direction = currentGutter.direction;
                this.ghost.size = currentGutter.size;
                this.ghost.x = gutterPosition.x;
                this.ghost.y = gutterPosition.y;

                this.ghost.visible = true;
                this.setStyle(StyleProperty.Cursor, currentGutter.direction === Direction.Vertical ? 'row-resize' : 'col-resize');
            }
        } else {
            this.areas.forEach((item) => {
                const size = item.area.getSize();

                item.area.disableFlex();
                item.area.setSize(size);
            });
        }


        this.listeners.push(
            this.renderer.listen(
                'document',
                'mouseup',
                () => this.onMouseUp(leftArea, rightArea, currentGutter)
            )
        );

        this.ngZone.runOutsideAngular(() => {
            this.listeners.push(
                this.renderer.listen(
                    'document',
                    'mousemove',
                    (e: MouseEvent) => this.onMouseMove(e, startPoint, leftArea, rightArea, currentGutter)
                )
            );
        });

        this._isDragging = true;
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

        if (indexToRemove === -1) { return; }

        this.areas.splice(indexToRemove, 1);
    }

    isVertical(): boolean {
        return this.direction === Direction.Vertical;
    }

    private updateGutter(): void {
        this.gutters.forEach((gutter) => {
            if (gutter.dragged) {
                gutter.dragged = false;

                this.changeDetectorRef.detectChanges();
            }
        });
    }

    private onMouseMove(
        event: MouseEvent,
        startPoint: IPoint,
        leftArea: IArea,
        rightArea: IArea,
        currentGutter: McGutterDirective | undefined
    ) {
        if (!this.isDragging || this.disabled) { return; }

        const endPoint: IPoint = {
            x: event.screenX,
            y: event.screenY
        };

        const offset = this.isVertical()
            ? startPoint.y - endPoint.y
            : startPoint.x - endPoint.x;

        if (this.useGhost && currentGutter) {
            const gutterPosition = currentGutter.getPosition();
            const leftPos = leftArea.area.getPosition();
            const rightPos = rightArea.area.getPosition();
            const rightMin = rightArea.area.getMinSize() || 0;
            const leftMin = leftArea.area.getMinSize() || 0;

            const key = this.isVertical() ? 'y' : 'x';

            const minPos = leftPos[key] - leftMin;
            const maxPos = rightPos[key] + (rightArea.area.getSize() || 0) - rightMin - currentGutter.size;
            const newPos = gutterPosition[key] - offset;

            this.ghost[key] = newPos < minPos ? minPos : Math.min(newPos, maxPos);
        } else {
           this.resizeAreas(leftArea, rightArea, offset);
        }
    }

    private resizeAreas(leftArea: IArea, rightArea: IArea, sizeOffset: number): void {
        const newLeftAreaSize = leftArea.initialSize - sizeOffset;
        const newRightAreaSize = rightArea.initialSize + sizeOffset;

        const minLeftAreaSize = leftArea.area.getMinSize();
        const minRightAreaSize = rightArea.area.getMinSize();

        if (newLeftAreaSize < minLeftAreaSize || newRightAreaSize < minRightAreaSize) {
            return;
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

    private onMouseUp(
        leftArea: IArea,
        rightArea: IArea,
        currentGutter: McGutterDirective | undefined
    ) {
        while (this.listeners.length > 0) {
            const unsubscribe = this.listeners.pop();

            if (unsubscribe) {
                unsubscribe();
            }
        }

        if (this.useGhost && currentGutter) {
            const gutterPosition = currentGutter.getPosition();
            const offset = this.ghost.direction === Direction.Vertical ?
                gutterPosition.y - this.ghost.y :
                gutterPosition.x - this.ghost.x;
            this.resizeAreas(leftArea, rightArea, offset);
            this.ghost.visible = false;
            this.setStyle(StyleProperty.Cursor, 'unset');
        }
        this._isDragging = false;

        this.updateGutter();

        this.gutterPositionChange.emit();

        this.changeDetectorRef.markForCheck();
    }

    private setStyle(property: StyleProperty, value: string | number) {
        this.renderer.setStyle(this.elementRef.nativeElement, property, value);
    }
}

@Directive({
    selector: '[mc-splitter-area]',
    host: {
        class: 'mc-splitter-area',
        '[class.mc-splitter-area_resizing]': 'isResizing()'
    }
})
export class McSplitterAreaDirective implements OnInit, OnDestroy {
    @Output() sizeChange: EventEmitter<number> = new EventEmitter<number>();

    constructor(
        private elementRef: ElementRef,
        private renderer: Renderer2,
        private splitter: McSplitterComponent
    ) {}

    isResizing(): boolean {
        return this.splitter.isDragging;
    }

    disableFlex(): void {
        this.renderer.removeStyle(this.elementRef.nativeElement, 'flex');
    }

    ngOnInit(): void {
        this.splitter.addArea(this);

        this.removeStyle(StyleProperty.MaxWidth);

        if (this.splitter.direction === Direction.Vertical) {
            this.setStyle(StyleProperty.Width, '100%');
            this.removeStyle(StyleProperty.Height);
        } else {
            this.setStyle(StyleProperty.Height, '100%');
            this.removeStyle(StyleProperty.Width);
        }

        this.splitter.gutterPositionChange
            .subscribe(this.emitSizeChange);
    }

    ngOnDestroy(): void {
        this.splitter.removeArea(this);
    }

    setOrder(order: number): void {
        this.setStyle(StyleProperty.Order, order);
    }

    setSize(size: number): void {
        if (isNaN(size)) { return; }

        this.setStyle(this.getSizeProperty(), coerceCssPixelValue(coerceNumberProperty(size)));
    }

    getSize(): number {
        return this.elementRef.nativeElement[this.getOffsetSizeProperty()];
    }

    getPosition(): IPoint {
        return {
            x: this.elementRef.nativeElement.offsetLeft,
            y: this.elementRef.nativeElement.offsetTop
        };
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

    private emitSizeChange = () => {
        this.sizeChange.emit(this.getSize());
    }
}
