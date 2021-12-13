import { OverlayRef } from '@angular/cdk/overlay';


export class ToastRef {
    constructor(private readonly overlay: OverlayRef) { }

    close(): void {
        // this.overlay.dispose();
    }

    isVisible(): HTMLElement {
        return this.overlay && this.overlay.overlayElement;
    }

    getPosition(): DOMRect {
        return this.overlay.overlayElement.getBoundingClientRect();
    }
}
