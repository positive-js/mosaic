import { Directionality } from '@angular/cdk/bidi';
import {
    ConnectedOverlayPositionChange,
    ConnectionPositionPair,
    Overlay,
    OverlayRef,
    ScrollDispatcher
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
    Directive,
    ElementRef,
    EventEmitter,
    NgZone,
    TemplateRef, Type,
    ViewContainerRef
} from '@angular/core';
import { ESCAPE } from '@ptsecurity/cdk/keycodes';
import { DEFAULT_4_POSITIONS, POSITION_MAP } from '@ptsecurity/mosaic/core';
import { Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';


const VIEWPORT_MARGIN: number = 8;

@Directive()
// tslint:disable-next-line:naming-convention
export abstract class McBaseTooltipTrigger<T> {
    isOpen: boolean = false;

    abstract visibleChange: EventEmitter<boolean>;

    abstract enterDelay: number = 0;
    abstract leaveDelay: number = 0;

    abstract disabled: boolean;
    abstract trigger: string;
    abstract placement: string;
    abstract customClass: string;
    abstract visible: boolean;
    abstract title: string | TemplateRef<any>;

    protected overlayRef: OverlayRef | null;
    protected portal: ComponentPortal<T>;
    protected availablePositions: { [key: string]: ConnectionPositionPair };
    protected instance: any | null;

    protected listeners = new Map<string, EventListenerOrEventListenerObject>();
    protected readonly destroyed = new Subject<void>();

    protected constructor(
        protected overlay: Overlay,
        protected elementRef: ElementRef,
        protected ngZone: NgZone,
        protected scrollDispatcher: ScrollDispatcher,
        protected hostView: ViewContainerRef,
        protected scrollStrategy,
        protected direction: Directionality
    ) {
        this.availablePositions = POSITION_MAP;
    }

    abstract updatePosition(): void;

    abstract handlePositioningUpdate(): void;

    abstract onPositionChange($event: ConnectedOverlayPositionChange): void;

    abstract getOverlayHandleComponentType(): Type<T>;

    ngOnInit(): void {
        this.initListeners();
    }

    ngOnDestroy(): void {
        if (this.overlayRef) {
            this.overlayRef.dispose();
        }

        this.listeners.forEach(this.removeEventListener);

        this.listeners.clear();

        this.destroyed.next();
        this.destroyed.complete();
    }

    handleKeydown(event: KeyboardEvent) {
        if (this.isOpen && event.keyCode === ESCAPE) { // tslint:disable-line
            this.hide();
        }
    }

    handleTouchend() {
        this.hide();
    }

    show(delay: number = this.enterDelay): void {
        if (this.disabled) { return; }

        if (!this.instance) {
            this.overlayRef = this.createOverlay();
            this.detach();

            this.portal = this.portal || new ComponentPortal(this.getOverlayHandleComponentType(), this.hostView);

            this.instance = this.overlayRef.attach(this.portal).instance;

            this.instance.afterHidden()
                .pipe(takeUntil(this.destroyed))
                .subscribe(() => this.detach());

            this.instance.updateClassMap(this.placement, this.customClass);

            this.instance.title = this.title;

            this.instance.visibleChange
                .pipe(takeUntil(this.destroyed), distinctUntilChanged())
                .subscribe((data) => {
                    this.visible = data;
                    this.visibleChange.emit(data);
                    this.isOpen = data;
                });
        }

        this.updatePosition();
        this.instance.show(delay);
    }

    hide(delay: number = this.leaveDelay): void {
        if (this.instance) {
            this.instance.hide(delay);
        }
    }

    detach() {
        if (this.overlayRef && this.overlayRef.hasAttached()) {
            this.overlayRef.detach();
        }

        this.instance = null;
    }

    /** Create the overlay config and position strategy */
    createOverlay(): OverlayRef {
        if (this.overlayRef) { return this.overlayRef; }

        // Create connected position strategy that listens for scroll events to reposition.
        const strategy = this.overlay.position()
            .flexibleConnectedTo(this.elementRef)
            .withTransformOriginOn('.mc-tooltip')
            .withFlexibleDimensions(false)
            .withViewportMargin(VIEWPORT_MARGIN)
            .withPositions([...DEFAULT_4_POSITIONS])
            .withScrollableContainers(this.scrollDispatcher.getAncestorScrollContainers(this.elementRef));

        strategy.positionChanges
            .pipe(takeUntil(this.destroyed))
            .subscribe((change) => {
                if (this.instance) {
                    this.onPositionChange(change);

                    if (change.scrollableViewProperties.isOverlayClipped && this.instance.isVisible()) {
                        // After position changes occur and the overlay is clipped by
                        // a parent scrollable then close the tooltip.
                        this.ngZone.run(() => this.hide());
                    }
                }
            });

        this.overlayRef = this.overlay.create({
            direction: this.direction,
            positionStrategy: strategy,
            panelClass: 'mc-tooltip-panel',
            scrollStrategy: this.scrollStrategy()
        });

        this.updatePosition();

        this.overlayRef.outsidePointerEvents()
            .pipe(takeUntil(this.destroyed))
            .subscribe(() => this.instance!.handleBodyInteraction());

        this.overlayRef.detachments()
            .pipe(takeUntil(this.destroyed))
            .subscribe(() => this.detach());

        return this.overlayRef;
    }

    updateClassMap() {
        if (!this.instance) { return; }

        this.instance.updateClassMap(this.placement, this.customClass);
    }

    private initListeners() {
        this.clearListeners();

        if (this.trigger.includes('hover')) {
            this.listeners
                .set('mouseenter', () => this.show())
                .set('mouseleave', () => this.hide())
                .forEach(this.addEventListener);
        }

        if (this.trigger.includes('focus')) {
            this.listeners
                .set('focus', () => this.show())
                .set('blur', () => this.hide())
                .forEach(this.addEventListener);
        }
    }

    private clearListeners() {
        this.listeners.forEach(this.removeEventListener);

        this.listeners.clear();
    }

    private addEventListener = (listener: EventListener | EventListenerObject, event: string) => {
        this.elementRef.nativeElement.addEventListener(event, listener);
    }

    private removeEventListener = (listener: EventListener | EventListenerObject, event: string) => {
        this.elementRef.nativeElement.addEventListener(event, listener);
    }
}
