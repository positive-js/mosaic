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

import { coerceBooleanProperty } from '@ptsecurity/cdk/coercion';


export interface IArea {
    area: McSplitterAreaDirective;
    index: number;
    order: number;
    initialSize: number;
}

export interface IPoint {
    x: number;
    y: number;
}

export const enum Cursor {
    ResizeColumn = 'col-resize',
    ResizeRow = 'row-resize',
    Default = 'default'
}

export const enum Direction {
    Horizontal = 'horizontal',
    Vertical = 'vertical'
}

export const enum SizeProperty {
    OffsetWidth = 'offsetWidth',
    OffsetHeight = 'offsetHeight',
    Width = 'width',
    Height = 'height'
}

export const enum State {
    Horizontal = 'horizontal',
    Vertical = 'vertical',
    Disabled = 'disabled'
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

        const mainLayoutDirection = this.direction === Direction.Vertical
            ? 'layout-column'
            : 'layout-row';

        const crossLayoutDirection = this.direction === Direction.Vertical
            ? 'layout-row'
            : 'layout-column';

        this.renderer.removeClass(this.elementRef.nativeElement, crossLayoutDirection);
        this.renderer.addClass(this.elementRef.nativeElement, mainLayoutDirection);
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
        const size = Number(gutterSize);
        this.gutterSize = (!isNaN(size) && size > 0) ? size : this.gutterSize;
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

    onMouseMove(event: MouseEvent, startPoint: IPoint, leftArea: IArea, rightArea: IArea) {
        if (!this.isDragging) {
            return;
        }

        const endPoint: IPoint = {
            x: event.screenX,
            y: event.screenY
        };

        const offset = this.direction === Direction.Vertical
            ? startPoint.y - endPoint.y
            : startPoint.x - endPoint.x;

        if (this.disabled) {
            return;
        }

        const prevLeftAreaSize = leftArea.area.getSize();
        const prevRightAreaSize = rightArea.area.getSize();

        leftArea.area.setSize(leftArea.initialSize - offset);
        rightArea.area.setSize(rightArea.initialSize + offset);

        // to prevent other area size change if the first is fixed with min-width or min-height
        if (leftArea.area.getSize() === prevLeftAreaSize) {
            rightArea.area.setSize(prevRightAreaSize);
        } else if (rightArea.area.getSize() === prevRightAreaSize) {
            leftArea.area.setSize(prevLeftAreaSize);
        }
    }

    onMouseUp() {
        while (this.listeners.length > 0) {
            const unsubscribe = this.listeners.pop();

            if (unsubscribe) {
                unsubscribe();
            }
        }

        if (!this.isDragging) {
            return;
        }

        this.isDragging = false;
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

@Directive({
    selector: 'mc-splitter-area',
    host: {
        '[class.mc-splitter-area]': 'true'
    }
})
export class McSplitterAreaDirective implements OnInit, OnDestroy {
    private flexClass: string = 'flex';

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

        this.renderer.removeClass(this.elementRef.nativeElement, this.flexClass);
    }

    ngOnInit(): void {
        this.splitter.addArea(this);
        this.renderer.addClass(this.elementRef.nativeElement, this.flexClass);
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
