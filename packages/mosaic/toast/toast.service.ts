import { GlobalPositionStrategy, Overlay } from '@angular/cdk/overlay';
import { PortalInjector, ComponentPortal } from '@angular/cdk/portal';
import { Injectable, Injector, Inject } from '@angular/core';

import { ToastComponent } from './toast.component';
import { ToastRef } from './toast.ref';
import { ToastData, TOAST_CONFIG_TOKEN, IToastConfig, ToastPosition } from './toast.type';


const INDENT_SIZE = 20;

@Injectable({
    providedIn: 'root'
})
export class ToastService {

    private lastToast: ToastRef | undefined;

    constructor(
        private overlay: Overlay,
        private parentInjector: Injector,
        @Inject(TOAST_CONFIG_TOKEN) private toastConfig: IToastConfig
    ) {
    }

    show(data: ToastData): ToastRef {
        const position = this.toastConfig.position;
        const positionStrategy = this.getPositionStrategy(position);
        const overlayRef = this.overlay.create({ positionStrategy });

        const toastRef = new ToastRef(overlayRef);
        this.lastToast = toastRef;

        const injector = this.getInjector(data, toastRef, this.parentInjector);
        const toastPortal = new ComponentPortal(ToastComponent, null, injector);

        overlayRef.attach(toastPortal);

        return toastRef;
    }

    // top-center
    getPositionStrategy(position: ToastPosition | undefined): GlobalPositionStrategy {
        if (!position) {
            return this.getTopCenter();
        }

        switch (position) {
            case 'center':
                return this.getCenter();
            case 'bottom-center':
                return this.getBottomCenter();
            case 'bottom-left':
                return this.getTopCenter();
            case 'bottom-right':
                return this.getTopCenter();
            case 'top-center':
                return this.getTopCenter();
            case 'top-left':
                return this.getTopLeft();
            case 'top-right':
                return this.getTopRight();
            default:
                return this.getTopCenter();
        }
    }

    getTopCenter(): GlobalPositionStrategy {
        return this.overlay.position()
            .global()
            .top(this.getTopPosition())
            .centerHorizontally();
    }

    getTopLeft(): GlobalPositionStrategy {
        return this.overlay.position()
        .global()
        .top(this.getTopPosition())
        .left(`${INDENT_SIZE}px`);
    }

    getTopRight(): GlobalPositionStrategy {
        return this.overlay.position()
        .global()
        .top(this.getTopPosition())
        .right(`${INDENT_SIZE}px`);
    }

    // bottom-center
    getBottomCenter(): GlobalPositionStrategy {
        return this.overlay.position()
            .global()
            .bottom(this.getBottomPosition())
            .centerHorizontally();
    }

    getBottomLeft(): GlobalPositionStrategy {
        return this.overlay.position()
            .global()
            .bottom(this.getBottomPosition())
            .left(`${INDENT_SIZE}px`);
    }

    getBottomRight(): GlobalPositionStrategy {
        return this.overlay.position()
            .global()
            .bottom(this.getBottomPosition())
            .right(`${INDENT_SIZE}px`);
    }

    getCenter(): GlobalPositionStrategy {
        return this.overlay.position()
            .global()
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

    getInjector(data: ToastData, toastRef: ToastRef, parentInjector: Injector): PortalInjector {
        const tokens = new WeakMap();

        tokens.set(ToastData, data);
        tokens.set(ToastRef, toastRef);

        return new PortalInjector(parentInjector, tokens);
    }
}
