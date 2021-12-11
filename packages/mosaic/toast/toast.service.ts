import { GlobalPositionStrategy, Overlay } from '@angular/cdk/overlay';
import { OverlayRef } from '@angular/cdk/overlay/overlay-ref';
import { PortalInjector, ComponentPortal, DomPortalOutlet } from '@angular/cdk/portal';
import { Injectable, Injector, Inject, ComponentFactoryResolver, ApplicationRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { SomeRef } from './some.ref';
import { ToastContainerComponent } from './toast-container.component';
import { ToastComponent } from './toast.component';
import { ToastRef } from './toast.ref';
import { ToastData, TOAST_CONFIG_TOKEN, IToastConfig, ToastPosition } from './toast.type';


const INDENT_SIZE = 20;

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    toasts: BehaviorSubject<ToastData[]> = new BehaviorSubject<ToastData[]>([]);
    portalHost: DomPortalOutlet;
    index = 0;
    protected instance: ToastContainerComponent;
    private lastToast?: ToastRef | undefined;
    private overlayRef?: OverlayRef;
    private portal: ComponentPortal<ToastContainerComponent>;

    constructor(
        protected overlay: Overlay,
        protected parentInjector: Injector,
        protected appRef: ApplicationRef,
        protected resolver: ComponentFactoryResolver,
        @Inject(TOAST_CONFIG_TOKEN) private toastConfig: IToastConfig
    ) {
    }

    show(data: ToastData) {
        this.overlayRef = this.createOverlay();
        this.portal = this.portal || new ComponentPortal(ToastContainerComponent, null, this.parentInjector);

        if (!this.overlayRef.hasAttached()) {
            this.instance = this.overlayRef.attach(this.portal).instance;
            this.addToast(data);
        } else {
            this.addToast(data);
        }

        this.toasts.next([...this.toasts.value, data]);
    }

    addToast(data: ToastData) {
        const toast = this.resolver.resolveComponentFactory(ToastComponent);
        const someRef = new SomeRef(this.instance.container);
        const toastData = {
            ...data,
            id: this.index
        };

        const toastInjector = this.getInjector(toastData, someRef, this.parentInjector);
        const toastViewRef = toast.create(toastInjector);

        this.instance.container.insert(toastViewRef.hostView, this.index);
        this.index++;
    }

    createOverlay() {
        if (this.overlayRef) { return this.overlayRef; }

        const position = this.toastConfig.position;
        const positionStrategy = this.getPositionStrategy(position);
        this.overlayRef = this.overlay.create({ positionStrategy });

        return this.overlayRef;
    }

    getPositionStrategy(position?: ToastPosition): GlobalPositionStrategy {
        switch (position) {
            case ToastPosition.CENTER:
                return this.getCenter();
            case ToastPosition.BOTTOM_CENTER:
                return this.getBottomCenter();
            case ToastPosition.BOTTOM_LEFT:
                return this.getTopCenter();
            case ToastPosition.BOTTOM_RIGHT:
                return this.getTopCenter();
            case ToastPosition.TOP_CENTER:
                return this.getTopCenter();
            case ToastPosition.TOP_LEFT:
                return this.getTopLeft();
            case ToastPosition.TOP_RIGHT:
                return this.getTopRight();
            default:
                return this.getTopCenter();
        }
    }

    getTopCenter(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition()
            .top(this.getTopPosition())
            .centerHorizontally();
    }

    getTopLeft(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition()
        .top(this.getTopPosition())
        .left(`${INDENT_SIZE}px`);
    }

    getTopRight(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition()
        .top(this.getTopPosition())
        .right(`${INDENT_SIZE}px`);
    }

    getBottomCenter(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition()
            .bottom(this.getBottomPosition())
            .centerHorizontally();
    }

    getBottomLeft(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition()
            .bottom(this.getBottomPosition())
            .left(`${INDENT_SIZE}px`);
    }

    getBottomRight(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition()
            .bottom(this.getBottomPosition())
            .right(`${INDENT_SIZE}px`);
    }

    getCenter(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition()
            .centerVertically()
            .centerHorizontally();
    }

    getTopPosition(): string {
        if (this.lastToast) {
            const lastToastIsVisible = this.lastToast && this.lastToast.isVisible();
            const position = lastToastIsVisible
                ? this.lastToast.getPosition().bottom
                : INDENT_SIZE;

            return `${position}px`;
        }

        return `${INDENT_SIZE}px`;
    }

    getBottomPosition(): string {
        if (this.lastToast) {
            const lastToastIsVisible = this.lastToast && this.lastToast.isVisible();
            const position = lastToastIsVisible
                ? window.innerHeight - this.lastToast.getPosition().top
                : window.innerHeight - INDENT_SIZE;

            return `${position}px`;
        }

        return `${INDENT_SIZE}px`;
    }

    getGlobalOverlayPosition(): GlobalPositionStrategy {
        return this.overlay.position().global();
    }

    getInjector(data: ToastData, toastRef: SomeRef, parentInjector: Injector): PortalInjector {
        const tokens = new WeakMap();

        tokens.set(ToastData, data);
        tokens.set(SomeRef, toastRef);

        return new PortalInjector(parentInjector, tokens);
    }
}
