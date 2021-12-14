import { GlobalPositionStrategy, Overlay } from '@angular/cdk/overlay';
import { OverlayRef } from '@angular/cdk/overlay/overlay-ref';
import { ComponentPortal, DomPortalOutlet } from '@angular/cdk/portal';
import { Injectable, Injector, Inject, ComponentFactoryResolver, ApplicationRef, ComponentRef, ViewContainerRef } from '@angular/core';

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

    protected instance: ViewContainerRef;
    protected overlayRef?: OverlayRef;
    protected portal: ComponentPortal<ToastContainerComponent>;

    constructor(
        protected overlay: Overlay,
        protected injector: Injector,
        protected appRef: ApplicationRef,
        protected resolver: ComponentFactoryResolver,
        @Inject(TOAST_CONFIG_TOKEN) private toastConfig: IToastConfig
    ) {
    }

    show(data: ToastData): void {
        this.overlayRef = this.createOverlay();
        this.portal = this.portal || new ComponentPortal(ToastContainerComponent, null, this.injector);

        if (!this.overlayRef.hasAttached()) {
            this.instance = this.overlayRef.attach(this.portal).instance.container;
            setTimeout(() => this.addToast(data), 0);
        } else {
            this.addToast(data);
        }
    }

    addToast(data: ToastData): void {
        const toast = this.resolver.resolveComponentFactory(ToastComponent);
        const containerRef = new ContainerRef(this.instance, this);
        const toastInjector = this.getInjector(data, containerRef, this.injector);
        const componentRef = this.instance.createComponent(toast, 0, toastInjector);
        const currentComponent = componentRef.instance;
        currentComponent.index = ++this.index;
        this.componentsRef = [...this.componentsRef, componentRef];
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
