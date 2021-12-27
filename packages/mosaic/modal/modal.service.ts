import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, Injectable } from '@angular/core';
import { ESCAPE } from '@ptsecurity/cdk/keycodes';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { McModalControlService } from './modal-control.service';
import { McModalRef } from './modal-ref.class';
import { McModalComponent } from './modal.component';
import { ConfirmType, IModalOptions, IModalOptionsForService } from './modal.type';


// A builder used for managing service creating modals
export class ModalBuilderForService {
    // Modal ComponentRef, "null" means it has been destroyed
    private modalRef: ComponentRef<McModalComponent> | null;
    private overlayRef: OverlayRef;

    constructor(private overlay: Overlay, options: IModalOptionsForService = {}) {
        this.createModal();

        if (!('mcGetContainer' in options)) {
            options.mcGetContainer = undefined;
        }

        this.changeProps(options);
        this.modalRef!.instance.open();
        this.modalRef!.instance.mcAfterClose.subscribe(() => this.destroyModal());

        this.overlayRef.keydownEvents()
            // @ts-ignore
            .pipe(filter((event: KeyboardEvent) => {
                // tslint:disable-next-line:deprecation replacement .key isn't supported in Edge
                return event.keyCode === ESCAPE && options.mcCloseByESC;
            }))
            .subscribe(() => this.modalRef!.instance.close());
    }

    getInstance(): McModalComponent | null {
        return this.modalRef && this.modalRef.instance;
    }

    destroyModal(): void {
        if (this.modalRef) {
            this.overlayRef.dispose();
            this.modalRef = null;
        }
    }

    private changeProps(options: IModalOptions): void {
        if (this.modalRef) {
            // here not limit user's inputs at runtime
            Object.assign(this.modalRef.instance, options);
        }
    }

    // Create component to ApplicationRef
    private createModal(): void {
        this.overlayRef = this.overlay.create();
        this.modalRef = this.overlayRef.attach(new ComponentPortal(McModalComponent));
    }
}

@Injectable()
export class McModalService {
    // Track of the current close modals (we assume invisible is close this time)
    get openModals(): McModalRef[] {
        return this.modalControl.openModals;
    }

    get afterAllClose(): Observable<void> {
        return this.modalControl.afterAllClose.asObservable();
    }

    constructor(
        private overlay: Overlay,
        private modalControl: McModalControlService
    ) {}

    // Closes all of the currently-open dialogs
    closeAll(): void {
        this.modalControl.closeAll();
    }

    create<T>(options: IModalOptionsForService<T> = {}): McModalRef<T> {

        if (typeof options.mcOnCancel !== 'function') {
            // Leave a empty function to close this modal by default
            // tslint:disable-next-line
            options.mcOnCancel = () => {};
        }

        if (!('mcCloseByESC' in options)) {
            options.mcCloseByESC = true;
        }
        // Remove the Cancel button if the user not specify a Cancel button
        if (!('mcCancelText' in options)) {
            options.mcCancelText = undefined;
        }
        // Remove the Ok button if the user not specify a Ok button
        if (!('mcOkText' in options)) {
            options.mcOkText = undefined;
        }
        // Remove the footer if the user not specify a footer
        if (!('mcFooter' in options)) {
            options.mcFooter = undefined;
        }

        return new ModalBuilderForService(this.overlay, options).getInstance()!;
    }

    confirm<T>(options: IModalOptionsForService<T> = {}, confirmType: ConfirmType = 'confirm'): McModalRef<T> {
        if ('mcFooter' in options) {
            console.warn(`The Confirm-Modal doesn't support "mcFooter", this property will be ignored.`);
        }

        // NOTE: only support function currently by calling confirm()
        if (typeof options.mcOnOk !== 'function') {
            // Leave a empty function to close this modal by default
            // tslint:disable-next-line
            options.mcOnOk = () => {};
        }

        options.mcModalType = 'confirm';
        options.mcClassName = `mc-confirm mc-confirm-${confirmType} ${options.mcClassName || ''}`;

        return this.create(options);
    }

    open<T>(options: IModalOptionsForService<T> = {}): McModalRef<T> {

        options.mcModalType = 'custom';

        return this.create(options);
    }

    success<T>(options: IModalOptionsForService<T> = {}): McModalRef<T> {
        return this.simpleConfirm(options, 'success');
    }

    // tslint:disable-next-line: no-reserved-keywords
    delete<T>(options: IModalOptionsForService<T> = {}): McModalRef<T> {
        return this.simpleConfirm(options, 'warn');
    }

    private simpleConfirm<T>(options: IModalOptionsForService<T> = {}, confirmType: ConfirmType): McModalRef<T> {
        return this.confirm(options, confirmType);
    }
}
