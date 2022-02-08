import { GlobalPositionStrategy, Overlay } from '@angular/cdk/overlay';
import { OverlayRef } from '@angular/cdk/overlay/overlay-ref';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable, Injector, Inject, ComponentRef } from '@angular/core';

import { McToastContainerComponent } from './toast-container.component';
import { McToastComponent } from './toast.component';
import { ToastData, TOAST_CONFIG_TOKEN, IToastConfig, ToastPosition } from './toast.type';


const INDENT_SIZE = 20;

@Injectable({
    providedIn: 'root'
})
export class ToastService<T extends McToastComponent = McToastComponent> {
    get toasts(): ComponentRef<T>[] {
        return Object.values(this.toastsDict)
            .filter((item) => !item.hostView.destroyed);
    }

    protected containerInstance: McToastContainerComponent;
    protected overlayRef: OverlayRef;
    protected portal: ComponentPortal<McToastContainerComponent>;

    private toastsDict: { [id: number]: ComponentRef<T> } = {};

    constructor(
        protected overlay: Overlay,
        protected injector: Injector,
        @Inject(TOAST_CONFIG_TOKEN) private toastConfig: IToastConfig
    ) {}

    show(data: ToastData): ComponentRef<T> {
        this.prepareContainer();

        return this.addToast(data);
    }

    hide(id: number) {
        this.containerInstance.deleteToast(this.toastsDict[id].hostView);

        this.toastsDict[id].destroy();
    }

    private addRemoveTimer(id: number, duration: number) {
        setTimeout(() => this.hide(id), duration);
    }

    private addToast(data: ToastData): ComponentRef<T> {
        const componentRef = this.containerInstance.createToast<T>(data);

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
