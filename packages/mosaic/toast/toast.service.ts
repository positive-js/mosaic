import { GlobalPositionStrategy, Overlay } from '@angular/cdk/overlay';
import { OverlayRef } from '@angular/cdk/overlay/overlay-ref';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable, Injector, Inject, ComponentRef, Optional } from '@angular/core';

import { McToastContainerComponent } from './toast-container.component';
import { McToastComponent } from './toast.component';
import { ToastData, MC_TOAST_CONFIG, ToastConfig, ToastPosition } from './toast.type';


export const defaultToastConfig: ToastConfig = {
    position: ToastPosition.TOP_CENTER,
    duration: 300000,
    newOnTop: true
};


const INDENT_SIZE = 20;

@Injectable({ providedIn: 'root' })
export class ToastService<T extends McToastComponent = McToastComponent> {
    get toasts(): ComponentRef<T>[] {
        return Object.values(this.toastsDict)
            .filter((item) => !item.hostView.destroyed);
    }

    private containerInstance: McToastContainerComponent;
    private overlayRef: OverlayRef;
    private portal: ComponentPortal<McToastContainerComponent>;

    private toastsDict: { [id: number]: ComponentRef<T> } = {};

    constructor(
        private overlay: Overlay,
        private injector: Injector,
        @Optional() @Inject(MC_TOAST_CONFIG) private toastConfig: ToastConfig,
        @Optional() private toastFactory: McToastComponent
    ) {
        this.toastConfig = toastConfig || defaultToastConfig;
    }

    show(data: ToastData): ComponentRef<T> {
        this.prepareContainer();

        return this.addToast(data);
    }

    hide(id: number) {
        const componentRef = this.toastsDict[id];

        if (!componentRef) { return; }

        this.containerInstance.deleteToast(componentRef.hostView);

        componentRef.destroy();

        delete this.toastsDict[id];
    }

    private addRemoveTimer(id: number, duration: number) {
        setTimeout(() => this.hide(id), duration);
    }

    private addToast(data: ToastData): ComponentRef<T> {
        const componentRef = this.containerInstance.createToast<T>(data, this.toastFactory || McToastComponent);

        this.toastsDict[componentRef.instance.id] = componentRef;

        this.addRemoveTimer(componentRef.instance.id, this.toastConfig.duration);

        return componentRef;
    }

    private prepareContainer() {
        this.overlayRef = this.createOverlay();

        this.portal = this.portal || new ComponentPortal(McToastContainerComponent, null, this.injector);

        if (!this.overlayRef.hasAttached()) {
            this.containerInstance = this.overlayRef.attach(this.portal).instance;
        }
    }

    private createOverlay(): OverlayRef {
        if (this.overlayRef) { return this.overlayRef; }

        const positionStrategy = this.getPositionStrategy(this.toastConfig.position);

        return this.overlay.create({ positionStrategy });
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
