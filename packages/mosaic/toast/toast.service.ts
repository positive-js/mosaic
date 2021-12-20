import { GlobalPositionStrategy, Overlay } from '@angular/cdk/overlay';
import { OverlayRef } from '@angular/cdk/overlay/overlay-ref';
import { ComponentPortal, DomPortalOutlet } from '@angular/cdk/portal';
import { Injectable, Injector, Inject, ComponentFactoryResolver, ComponentRef } from '@angular/core';

import { ContainerRef } from './container.ref';
import { ToastContainerComponent } from './toast-container.component';
import { ToastComponent } from './toast.component';
import { ToastData, TOAST_CONFIG_TOKEN, IToastConfig, ToastPosition } from './toast.type';


const INDENT_SIZE = 20;

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    portalHost: DomPortalOutlet;
    index: number = 0;
    componentsRef: ComponentRef<ToastComponent>[] = [];

    protected instance: ToastContainerComponent;
    protected overlayRef?: OverlayRef;
    protected portal: ComponentPortal<ToastContainerComponent>;

    constructor(
        protected overlay: Overlay,
        protected injector: Injector,
        protected resolver: ComponentFactoryResolver,
        @Inject(TOAST_CONFIG_TOKEN) private toastConfig: IToastConfig
    ) {
    }

    show(data: ToastData): ComponentRef<ToastComponent> {
        this.overlayRef = this.createOverlay();
        this.portal = this.portal || new ComponentPortal(ToastContainerComponent, null, this.injector);
        let toastRef;

        if (!this.overlayRef.hasAttached()) {
            this.instance = this.overlayRef.attach(this.portal).instance;
        }

        setTimeout(() => toastRef = this.addToast(data), 0);

        return toastRef;
    }

    addToast(data: ToastData): ComponentRef<ToastComponent> {
        const toast = this.resolver.resolveComponentFactory(ToastComponent);
        const containerRef = new ContainerRef(this.instance.container, this);
        const toastInjector = this.getInjector(data, containerRef, this.injector);
        const componentRef = this.instance.container.createComponent(toast, 0, toastInjector);
        const currentComponent = componentRef.instance;
        currentComponent.index = ++this.index;
        this.componentsRef = [...this.componentsRef, componentRef];

        return componentRef;
    }

    createOverlay(): OverlayRef {
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
            .top(`${INDENT_SIZE}px`)
            .centerHorizontally();
    }

    getTopLeft(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition()
        .top(`${INDENT_SIZE}px`)
        .left(`${INDENT_SIZE}px`);
    }

    getTopRight(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition()
        .top(`${INDENT_SIZE}px`)
        .right(`${INDENT_SIZE}px`);
    }

    getBottomCenter(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition()
            .bottom(`${INDENT_SIZE}px`)
            .centerHorizontally();
    }

    getBottomLeft(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition()
            .bottom(`${INDENT_SIZE}px`)
            .left(`${INDENT_SIZE}px`);
    }

    getBottomRight(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition()
            .bottom(`${INDENT_SIZE}px`)
            .right(`${INDENT_SIZE}px`);
    }

    getCenter(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition()
            .centerVertically()
            .centerHorizontally();
    }

    getGlobalOverlayPosition(): GlobalPositionStrategy {
        return this.overlay.position().global();
    }

    getInjector(data: ToastData, toastRef: ContainerRef, parentInjector: Injector): Injector {
        return Injector.create({
           providers: [
               { provide: ToastData, useValue: data },
               { provide: ContainerRef, useValue: toastRef }
           ],
           parent: parentInjector
       });
    }
}
