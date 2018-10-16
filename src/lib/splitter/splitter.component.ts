import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Input,
    NgZone,
    OnInit,
    Renderer2,
    ViewEncapsulation
} from '@angular/core';

import { coerceBooleanProperty } from '@ptsecurity/cdk/coercion';

import { McSplitterAreaDirective } from './splitter-area.directive';

import { Direction } from './splitter.constants';


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
