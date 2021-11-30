import { GlobalPositionStrategy, Overlay } from '@angular/cdk/overlay';
import { PortalInjector, ComponentPortal } from '@angular/cdk/portal';
import { Injectable, Inject, Injector } from '@angular/core';

import { ToastComponent } from './toast.component';
import { ToastRef } from './toast.ref';
import { TOAST_CONFIG_TOKEN, ToastData, ToastConfig } from './toast.type';


@Injectable({
    providedIn: 'root'
})
export class ToastService {

    private lastToast: ToastRef | undefined;

    constructor(
        private overlay: Overlay,
        private parentInjector: Injector,
        @Inject(TOAST_CONFIG_TOKEN) private toastConfig: ToastConfig
    ) {
    }

    show(data: ToastData): ToastRef {
        const positionStrategy = this.getPositionStrategy();
        const overlayRef = this.overlay.create({ positionStrategy });

        const toastRef = new ToastRef(overlayRef);
        this.lastToast = toastRef;

        const injector = this.getInjector(data, toastRef, this.parentInjector);
        const toastPortal = new ComponentPortal(ToastComponent, null, injector);

        overlayRef.attach(toastPortal);

        return toastRef;
    }

    // top-center
    getPositionStrategy(): GlobalPositionStrategy {
        return this.overlay.position()
            .global()
            .top(this.getPosition())
            .centerHorizontally();
    }

    // bottom-center
    getBottomCenter(): GlobalPositionStrategy {
        return this.overlay.position()
            .global()
            .bottom(this.getPosition())
            .centerHorizontally();
    }

    getCenter(): GlobalPositionStrategy {
        return this.overlay.position()
            .global()
            .centerVertically()
            .centerHorizontally();
    }

    getPosition(): string {
        if (this.lastToast) {
            const lastToastIsVisible = this.lastToast && this.lastToast.isVisible();
            const position = lastToastIsVisible
                ? this.lastToast.getPosition().bottom
                : this.toastConfig.position.top;

            return `${position}px`;
        }

        return `${this.toastConfig.position.top}px`;
    }

    getInjector(data: ToastData, toastRef: ToastRef, parentInjector: Injector): PortalInjector {
        const tokens = new WeakMap();

        tokens.set(ToastData, data);
        tokens.set(ToastRef, toastRef);

        return new PortalInjector(parentInjector, tokens);
    }
}
