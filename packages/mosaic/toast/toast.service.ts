import { GlobalPositionStrategy, Overlay } from '@angular/cdk/overlay';
import { OverlayRef } from '@angular/cdk/overlay/overlay-ref';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable, Injector, Inject, ComponentRef, Optional, TemplateRef, EmbeddedViewRef } from '@angular/core';

import { McToastContainerComponent } from './toast-container.component';
import { McToastComponent } from './toast.component';
import { McToastData, MC_TOAST_CONFIG, McToastConfig, ToastPosition } from './toast.type';


export const defaultToastConfig: McToastConfig = {
    position: ToastPosition.TOP_CENTER,
    duration: 3000,
    onTop: true
};


const INDENT_SIZE = 20;

let templateId = 0;

@Injectable({ providedIn: 'root' })
export class ToastService<T extends McToastComponent = McToastComponent> {
    get toasts(): ComponentRef<T>[] {
        return Object.values(this.toastsDict)
            .filter((item) => !item.hostView.destroyed);
    }

    get templates(): EmbeddedViewRef<T>[] {
        return Object.values(this.templatesDict);
    }

    private containerInstance: McToastContainerComponent;
    private overlayRef: OverlayRef;
    private portal: ComponentPortal<McToastContainerComponent>;

    private toastsDict: { [id: number]: ComponentRef<T> } = {};
    private templatesDict: { [id: number]: EmbeddedViewRef<T> } = {};

    constructor(
        private overlay: Overlay,
        private injector: Injector,
        @Optional() @Inject(MC_TOAST_CONFIG) private toastConfig: McToastConfig,
        @Optional() private toastFactory: McToastComponent
    ) {
        this.toastConfig = toastConfig || defaultToastConfig;
    }

    show(
        data: McToastData,
        onTop: boolean = this.toastConfig.onTop,
        duration: number = this.toastConfig.duration
    ): { ref: ComponentRef<T>; id: number} {
        this.prepareContainer();

        const componentRef = this.containerInstance.createToast<T>(data, this.toastFactory || McToastComponent, onTop);

        this.toastsDict[componentRef.instance.id] = componentRef;

        this.addRemoveTimer(componentRef.instance.id, duration);

        return { ref: componentRef, id: componentRef.instance.id };
    }

    showTemplate(
        data: McToastData,
        template: TemplateRef<any>,
        onTop: boolean = this.toastConfig.onTop,
        duration: number = this.toastConfig.duration
    ): { ref: EmbeddedViewRef<T>; id: number } {

        this.prepareContainer();

        const viewRef = this.containerInstance.createTemplate<T>(data, template, onTop);

        this.templatesDict[templateId] = viewRef;

        this.addRemoveTimer(templateId, duration, true);

        templateId++;

        return { ref: viewRef, id: templateId };
    }

    hide(id: number) {
        const componentRef = this.toastsDict[id];

        if (!componentRef) { return; }

        this.containerInstance.remove(componentRef.hostView);

        delete this.toastsDict[id];
    }

    hideTemplate(id: number) {
        const viewRef = this.templatesDict[id];

        if (!viewRef) { return; }

        this.containerInstance.remove(viewRef);

        delete this.templatesDict[id];
    }

    private addRemoveTimer(id: number, duration: number, template: boolean = false) {
        setTimeout(() => template ? this.hideTemplate(id) : this.hide(id), duration);
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
