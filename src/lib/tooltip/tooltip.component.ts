import {
    AnimationEvent
} from '@angular/animations';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ComponentFactory,
    ComponentFactoryResolver,
    Directive,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    OnDestroy,
    OnInit,
    Optional,
    Output,
    Renderer2,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { coerceBooleanProperty } from '@ptsecurity/cdk/coercion';
import {
    CdkConnectedOverlay,
    CdkOverlayOrigin,
    ConnectedOverlayPositionChange,
    ConnectionPositionPair
} from '@ptsecurity/cdk/overlay';
import {
    fadeAnimation,
    DEFAULT_4_POSITIONS,
    POSITION_MAP
} from '@ptsecurity/mosaic/core';


@Component({
    selector           : 'mc-tooltip',
    animations         : [ fadeAnimation ],
    templateUrl        : './tooltip.component.html',
    preserveWhitespaces: false,
    styleUrls          : ['./tooltip.css'],
    encapsulation: ViewEncapsulation.None
})
export class McToolTipComponent {
    _hasBackdrop = false;
    _prefix = 'mc-tooltip-placement';
    _positions: ConnectionPositionPair[] = [ ...DEFAULT_4_POSITIONS ];
    _classMap = {};
    _placement = 'top';
    _trigger = 'hover';
    overlayOrigin: CdkOverlayOrigin;
    isTitleString: boolean;
    visibleSource = new BehaviorSubject<boolean>(false);
    $visible: Observable<boolean> = this.visibleSource.asObservable();
    _title: string | TemplateRef<void>;

    @ViewChild('overlay') overlay: CdkConnectedOverlay;
    @Output() mcVisibleChange: EventEmitter<boolean> = new EventEmitter();

    @Input() mcMouseEnterDelay = 400;
    @Input() mcMouseLeaveDelay = 100;

    @Input()
    set mcTitle(value: string | TemplateRef<void>) {
        this.isTitleString = !(value instanceof TemplateRef);
        this._title = value;
    }

    get mcTitle(): string | TemplateRef<void> {
        return this._title;
    }

    @Input()
    set mcVisible(value: boolean) {
        const visible = coerceBooleanProperty(value);

        if (this.visibleSource.value !== visible) {
            this.visibleSource.next(visible);
            this.mcVisibleChange.emit(visible);
        }
    }

    get mcVisible(): boolean {
        return this.visibleSource.value;
    }

    @Input()
    set mcTrigger(value: string) {
        this._trigger = value;
        this._hasBackdrop = this._trigger === 'click';
    }

    get mcTrigger(): string {
        return this._trigger;
    }

    @Input()
    set mcPlacement(value: string) {
        if (value !== this._placement) {
            this._placement = value;
            this._positions.unshift(POSITION_MAP[ this.mcPlacement ] as ConnectionPositionPair);
        }
    }

    get mcPlacement(): string {
        return this._placement;
    }

    constructor(public cdr: ChangeDetectorRef) {
    }

    updatePosition(): void {
        if (this.overlay && this.overlay.overlayRef) {
            this.overlay.overlayRef.updatePosition();
        }
    }

    onPositionChange($event: ConnectedOverlayPositionChange): void {
        Object.keys(POSITION_MAP).some((key) => {
            if (JSON.stringify($event.connectionPair) === JSON.stringify(POSITION_MAP[ key ])) {
                this.mcPlacement = key;

                return true;
            }

            return false;
        });
        this.setClassMap();

        this.cdr.detectChanges();
    }

    show(): void {
        if (!this.isContentEmpty()) {
            this.mcVisible = true;
        }
    }

    hide(): void {
        this.mcVisible = false;
    }

    _afterVisibilityAnimation(e: AnimationEvent): void {
        if (e.toState === 'false' && !this.mcVisible) {
            this.mcVisibleChange.emit(false);
        }
        if (e.toState === 'true' && this.mcVisible) {
            this.mcVisibleChange.emit(true);
        }
    }

    setClassMap(): void {
        this._classMap = {
            [ `${this._prefix}-${this._placement}` ]: true
        };
    }

    setOverlayOrigin(origin: CdkOverlayOrigin): void {
        this.overlayOrigin = origin;
    }

    isContentEmpty(): boolean {
        return this.isTitleString ? (this.mcTitle === '' || !this.mcTitle) : false;
    }
}


@Directive({
    selector: '[mc-tooltip]'
})
export class McTooltipDirective implements AfterViewInit, OnInit, OnDestroy {

    isTooltipOpen: boolean = false;
    isDynamicTooltip = false;
    delayTimer;
    _title: string | TemplateRef<void>;
    _content: string | TemplateRef<void>;
    // _overlayClassName: string;
    // _overlayStyle: { [ key: string ]: string };
    _mouseEnterDelay: number;
    _mouseLeaveDelay: number;
    _visible: boolean;
    _trigger: string;
    _placement: string;
    factory: ComponentFactory<McToolTipComponent> = this.resolver.resolveComponentFactory(McToolTipComponent);

    @Output() mcVisibleChange = new EventEmitter<boolean>();

    private $unsubscribe = new Subject<void>();

    @Input('mc-tooltip')
    set mcTitle(title: string | TemplateRef<void>) {
        this._title = title;
        this.updateCompValue('mcTitle', title);
    }

    get mcTitle(): string | TemplateRef<void> {
        return this._title;
    }

    @Input('mcTitle')
    set setTitle(title: string | TemplateRef<void>) {
        this.mcTitle = title;
    }

    @Input()
    set mcContent(value: string | TemplateRef<void>) {
        this._content = value;
        this.updateCompValue('mcContent', value);
    }

    get mcContent(): string | TemplateRef<void> {
        return this._content;
    }

    @Input()
    set mcMouseEnterDelay(value: number) {
        this._mouseEnterDelay = value;
        this.updateCompValue('mcMouseEnterDelay', value);
    }

    get mcMouseEnterDelay(): number {
        return this._mouseEnterDelay;
    }

    @Input()
    set mcMouseLeaveDelay(value: number) {
        this._mouseLeaveDelay = value;
        this.updateCompValue('mcMouseLeaveDelay', value);
    }

    get mcMouseLeaveDelay(): number {
        return this._mouseEnterDelay;
    }

    @Input()
    set mcVisible(value: boolean) {
        this._visible = value;
        this.updateCompValue('mcVisible', value);
    }

    get mcVisible(): boolean {
        return this._visible;
    }

    @Input()
    set mcTrigger(value: string) {
        this._trigger = value;
        this.updateCompValue('mcTrigger', value);
    }

    get mcTrigger(): string {
        return this._trigger;
    }

    @Input()
    set mcPlacement(value: string) {
        this._placement = value;
        this.updateCompValue('mcPlacement', value);
    }

    get mcPlacement(): string {
        return this._placement;
    }

    @HostBinding('class.mc-tooltip-open')
    get isOpen(): boolean {
        return this.isTooltipOpen;
    }

    constructor(
        public elementRef: ElementRef,
        public hostView: ViewContainerRef,
        public resolver: ComponentFactoryResolver,
        public renderer: Renderer2,
        @Optional() public tooltip: McToolTipComponent) {}

    // tslint:disable-next-line:no-any
    updateCompValue(key: string, value: any): void {
        if (this.isDynamicTooltip && value) {
            this.tooltip[ key ] = value;
        }
    }

    ngOnInit(): void {
        if (!this.tooltip) {
            this.tooltip = this.hostView.createComponent(this.factory).instance;
            this.isDynamicTooltip = true;
            const properties = [
                'mcTitle',
                'mcContent',
                'mcMouseEnterDelay',
                'mcMouseLeaveDelay',
                'mcVisible',
                'mcTrigger',
                'mcPlacement' ];
            properties.forEach((property) => this.updateCompValue(property, this[ property ]));
            this.tooltip.mcVisibleChange.pipe(takeUntil(this.$unsubscribe), distinctUntilChanged())
                .subscribe((data) => {
                    this._visible = data;
                    this.mcVisibleChange.emit(data);
            });
        }
        this.tooltip.setOverlayOrigin(this);
    }

    ngAfterViewInit(): void {
        if (this.tooltip.mcTrigger === 'hover') {
            let overlayElement;
            this.renderer.listen(
                this.elementRef.nativeElement,
                'mouseenter',
                () => this.delayEnterLeave(true, true, this.tooltip.mcMouseEnterDelay)
            );
            this.renderer.listen(
                this.elementRef.nativeElement,
                'mouseleave',
                () => {
                    this.delayEnterLeave(true, false, this.tooltip.mcMouseLeaveDelay);
                    if (this.tooltip.overlay.overlayRef && !overlayElement) {
                        overlayElement = this.tooltip.overlay.overlayRef.overlayElement;
                        this.renderer.listen(
                            overlayElement,
                            'mouseenter',
                            () => this.delayEnterLeave(false, true)
                        );
                        this.renderer.listen(
                            overlayElement,
                            'mouseleave',
                            () => this.delayEnterLeave(false, false)
                        );
                }
            });
        } else if (this.tooltip.mcTrigger === 'focus') {
            this.renderer.listen(this.elementRef.nativeElement, 'focus', () => this.show());
            this.renderer.listen(this.elementRef.nativeElement, 'blur', () => this.hide());
        } else if (this.tooltip.mcTrigger === 'click') {
            this.renderer.listen(this.elementRef.nativeElement, 'click', (e) => {
                e.preventDefault();
                this.show();
            });
        }
    }

    ngOnDestroy(): void {
        this.$unsubscribe.next();
        this.$unsubscribe.complete();
    }

    private show(): void {
        this.tooltip.show();
        this.isTooltipOpen = true;
    }

    private hide(): void {
        this.tooltip.hide();
        this.isTooltipOpen = false;
    }

    private delayEnterLeave(isOrigin: boolean, isEnter: boolean, delay: number = -1): void {
        if (this.delayTimer) { // Clear timer during the delay time
            window.clearTimeout(this.delayTimer);
            this.delayTimer = null;
        } else if (delay > 0) {
            this.delayTimer = window.setTimeout(() => {
                this.delayTimer = null;
                isEnter ? this.show() : this.hide();
            }, delay);
        } else {
            isEnter && isOrigin ? this.show() : this.hide();
        }
    }
}
