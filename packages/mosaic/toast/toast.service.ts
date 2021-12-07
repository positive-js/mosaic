import { GlobalPositionStrategy, Overlay } from '@angular/cdk/overlay';
import { OverlayRef } from '@angular/cdk/overlay/overlay-ref';
import { PortalInjector, ComponentPortal, DomPortalOutlet } from '@angular/cdk/portal';
import { DOCUMENT } from '@angular/common';
import { Injectable, Injector, Inject, ApplicationRef, ComponentFactoryResolver } from '@angular/core';

import { ToastComponent } from './toast.component';
import { ToastRef } from './toast.ref';
import { ToastData, TOAST_CONFIG_TOKEN, IToastConfig, ToastPosition } from './toast.type';


const INDENT_SIZE = 20;

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    portalHost: DomPortalOutlet;
    protected instance: any | null;
    private lastToast?: ToastRef | undefined;
    private overlayRef?: OverlayRef;
    private portal: ComponentPortal<ToastComponent>;

    constructor(
        protected overlay: Overlay,
        protected parentInjector: Injector,
        protected appRef: ApplicationRef,
        protected componentFactoryResolver: ComponentFactoryResolver,
        @Inject(DOCUMENT) private document: any,
        @Inject(TOAST_CONFIG_TOKEN) private toastConfig: IToastConfig
    ) {
    }

    show(data: ToastData): any {
        this.overlayRef = this.createOverlay();

        const toastRef = new ToastRef(this.overlayRef);
        const injector = this.getInjector(data, toastRef, this.parentInjector);

        const pane = this.getPaneElement(this.toastConfig.position);

        this.portalHost = new DomPortalOutlet(
            pane,
            this.componentFactoryResolver,
            this.appRef,
            injector
        );

        this.portal = this.portal || new ComponentPortal(ToastComponent, null, injector);
        // this.portalHost.attachComponentPortal(this.portal);

        this.overlayRef.attach(this.portal);

        return toastRef;
    }

    getPaneElement(position: any) {
        const pane = this.document.createElement('div');
        pane.classList.add(position);
        pane.classList.add('toast-container');
        pane.id = 'toast-container';

        return pane;
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

    getInjector(data: ToastData, toastRef: ToastRef, parentInjector: Injector): PortalInjector {
        const tokens = new WeakMap();

        tokens.set(ToastData, data);
        tokens.set(ToastRef, toastRef);

        return new PortalInjector(parentInjector, tokens);
    }
}
