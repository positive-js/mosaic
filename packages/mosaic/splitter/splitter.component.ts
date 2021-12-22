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
    Width = 'width'
}

export enum Direction {
    Horizontal = 'horizontal',
    Vertical = 'vertical'
}

@Directive({
    selector: 'mc-gutter',
    host: {
        class: 'mc-gutter',
        '[class.mc-gutter_vertical]': 'isVertical()',
        '[class.mc-gutter_dragged]': 'dragged',
        '(mousedown)': 'dragged = true'
    }
})
export class McGutterDirective implements OnInit {
    get direction(): Direction {
        return this._direction;
    }

    @Input()
    set direction(direction: Direction) {
        this._direction = direction;
    }

    private _direction: Direction = Direction.Vertical;

    get order(): number {
        return this._order;
    }

    @Input()
    set order(order: number) {
        this._order = coerceNumberProperty(order);
    }

    private _order: number = 0;

    get size(): number {
        return this._size;
    }

    @Input()
    set size(size: number) {
        this._size = coerceNumberProperty(size);
    }

    private _size: number = 6;

    dragged: boolean = false;

    constructor(
        private elementRef: ElementRef,
        private renderer: Renderer2
    ) {}

    ngOnInit(): void {
        this.setStyle(StyleProperty.FlexBasis, coerceCssPixelValue(this.size));
        this.setStyle(this.isVertical() ? StyleProperty.Height : StyleProperty.Width, coerceCssPixelValue(this.size));
        this.setStyle(StyleProperty.Order, this.order);

        if (!this.isVertical()) {
            this.setStyle(StyleProperty.Height, '100%');
        }

        // fix IE issue with gutter icon. flex-direction is requied for flex alignment options
        this.setStyle(StyleProperty.FlexDirection, this.isVertical() ? 'row' : 'column');
    }

    isVertical(): boolean {
        return this.direction === Direction.Vertical;
    }

    private setStyle(property: StyleProperty, value: string | number) {
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
    readonly areas: IArea[] = [];

    @ViewChildren(McGutterDirective) gutters: QueryList<McGutterDirective>;

    private isDragging: boolean = false;

    private readonly areaPositionDivider: number = 2;
    private readonly listeners: (() => void)[] = [];

    get hideGutters(): boolean {
        return this._hideGutters;
    }

    @Input()
    set hideGutters(value: boolean) {
        this._hideGutters = coerceBooleanProperty(value);
    }

    private _hideGutters: boolean = false;

    get direction(): Direction {
        return this._direction;
    }

    @Input()
    set direction(direction: Direction) {
        this._direction = direction;
    }

    private _direction: Direction;

    get disabled(): boolean {
        return this._disabled;
    }

    @Input()
    set disabled(disabled: boolean) {
        this._disabled = coerceBooleanProperty(disabled);
    }

    private _disabled: boolean = false;

    get gutterSize(): number {
        return this._gutterSize;
    }

    @Input()
    set gutterSize(gutterSize: number) {
        const size = coerceNumberProperty(gutterSize);
        this._gutterSize = size > 0 ? size : this.gutterSize;
    }

    @Output() gutterPositionChange: EventEmitter<void> = new EventEmitter<void>();

    private _gutterSize: number = 6;

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

    private onMouseMove(event: MouseEvent, startPoint: IPoint, leftArea: IArea, rightArea: IArea) {
        if (!this.isDragging || this.disabled) { return; }

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

    private onMouseUp() {
        while (this.listeners.length > 0) {
            const unsubscribe = this.listeners.pop();

            if (unsubscribe) {
                unsubscribe();
            }
        }

        this.isDragging = false;

        this.updateGutter();

        this.gutterPositionChange.emit();
    }

    private setStyle(property: StyleProperty, value: string | number) {
        this.renderer.setStyle(this.elementRef.nativeElement, property, value);
    }
}

@Directive({
    selector: '[mc-splitter-area]',
    host: {
        class: 'mc-splitter-area'
    }
})
export class McSplitterAreaDirective implements OnInit, OnDestroy {
    @Output() sizeChange: EventEmitter<number> = new EventEmitter<number>();

    constructor(
        private elementRef: ElementRef,
        private renderer: Renderer2,
        private splitter: McSplitterComponent
    ) {}

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

        this.splitter.gutterPositionChange.subscribe(() => this.emitSizeChange() );
    }

    ngOnDestroy(): void {
        this.splitter.removeArea(this);
    }

    setOrder(order: number): void {
        this.setStyle(StyleProperty.Order, order);
    }

    setSize(size: number): void {
        if (size) {
            const sz = coerceNumberProperty(size);
            this.setStyle(this.getSizeProperty(), coerceCssPixelValue(sz));
        }
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

    private emitSizeChange(): void {
        this.sizeChange.emit(this.getSize());
    }
}
