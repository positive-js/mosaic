import { GlobalPositionStrategy, Overlay } from '@angular/cdk/overlay';
import { OverlayRef } from '@angular/cdk/overlay/overlay-ref';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable, Injector, Inject, ComponentRef } from '@angular/core';

import { ToastContainerComponent } from './toast-container.component';
import { ToastComponent } from './toast.component';
import { ToastData, TOAST_CONFIG_TOKEN, IToastConfig, ToastPosition } from './toast.type';


const INDENT_SIZE = 20;

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    index: number = 0;
    componentsRef: ComponentRef<ToastComponent>[] = [];

    protected containerInstance: ToastContainerComponent;
    protected overlayRef: OverlayRef;
    protected portal: ComponentPortal<ToastContainerComponent>;

    private toasts: { [id: number]: ComponentRef<ToastComponent> } = {};

    constructor(
        protected overlay: Overlay,
        protected injector: Injector,
        @Inject(TOAST_CONFIG_TOKEN) private toastConfig: IToastConfig
    ) {}

    show(data: ToastData): ComponentRef<ToastComponent> {
        this.overlayRef = this.createOverlay();
        this.portal = this.portal || new ComponentPortal(ToastContainerComponent, null, this.injector);

        if (!this.overlayRef.hasAttached()) {
            this.containerInstance = this.overlayRef.attach(this.portal).instance;
        }

        return this.addToast(data);
    }

    hide(id: number) {
        this.containerInstance.deleteToast(this.toasts[id].hostView);
    }

    private addToast(data: ToastData): ComponentRef<ToastComponent> {
        const componentRef = this.containerInstance.createToast(data);

        this.toasts[componentRef.instance.id] = componentRef;

        return componentRef;
    }

    private createOverlay(): OverlayRef {
        if (this.overlayRef) { return this.overlayRef; }

        const position = this.toastConfig.position;
        const positionStrategy = this.getPositionStrategy(position);
        this.overlayRef = this.overlay.create({ positionStrategy });

        return this.overlayRef;
    }

    private getPositionStrategy(position?: ToastPosition): GlobalPositionStrategy {
        switch (position) {
            case ToastPosition.CENTER:
                return this.getCenter();
            case ToastPosition.BOTTOM_CENTER:
                return this.getBottomCenter();
            case ToastPosition.BOTTOM_LEFT:
                return this.getBottomLeft();
            case ToastPosition.BOTTOM_RIGHT:
                return this.getBottomRight();
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

    private getTopCenter(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition()
            .top(`${INDENT_SIZE}px`)
            .centerHorizontally();
    }

    private getTopLeft(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition()
            .top(`${INDENT_SIZE}px`)
            .left(`${INDENT_SIZE}px`);
    }

    private getTopRight(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition()
            .top(`${INDENT_SIZE}px`)
            .right(`${INDENT_SIZE}px`);
    }

    private getBottomCenter(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition()
            .bottom(`${INDENT_SIZE}px`)
            .centerHorizontally();
    }

    private getBottomLeft(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition()
            .bottom(`${INDENT_SIZE}px`)
            .left(`${INDENT_SIZE}px`);
    }

    private getBottomRight(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition()
            .bottom(`${INDENT_SIZE}px`)
            .right(`${INDENT_SIZE}px`);
    }

    private getCenter(): GlobalPositionStrategy {
        return this.getGlobalOverlayPosition()
            .centerVertically()
            .centerHorizontally();
    }

    private getGlobalOverlayPosition(): GlobalPositionStrategy {
        return this.overlay.position().global();
    }
}
