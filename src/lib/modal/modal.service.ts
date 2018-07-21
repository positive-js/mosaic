import { ComponentRef, Injectable } from '@angular/core';
import { Overlay, OverlayRef } from '@ptsecurity/cdk/overlay';
import { ComponentPortal } from '@ptsecurity/cdk/portal';
import { Observable } from 'rxjs';

import { McModalControlService } from './modal-control.service';
import { McModalRef } from './modal-ref.class';
import { McModalComponent } from './modal.component';
import { ConfirmType, IModalOptions, IModalOptionsForService } from './modal.type';


// A builder used for managing service creating modals
export class ModalBuilderForService {
    private modalRef: ComponentRef<McModalComponent>; // Modal ComponentRef, "null" means it has been destroyed
    private overlayRef: OverlayRef;

    constructor(private overlay: Overlay, options: IModalOptionsForService = {}) {
        this.createModal();

        if (!('mcGetContainer' in options)) {
            options.mcGetContainer = null;
        }

        this.changeProps(options);
        this.modalRef.instance.open();
        this.modalRef.instance.mcAfterClose.subscribe(() => this.destroyModal());
    }

    getInstance(): McModalComponent {
        return this.modalRef && this.modalRef.instance;
    }

    destroyModal(): void {
        if (this.modalRef) {
            this.overlayRef.dispose();
            // @ts-ignore
            this.modalRef = null;
        }
    }

    private changeProps(options: IModalOptions): void {
        if (this.modalRef) {
            Object.assign(this.modalRef.instance, options); // DANGER: here not limit user's inputs at runtime
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
        private modalControl: McModalControlService) {
    }

    // Closes all of the currently-open dialogs
    closeAll(): void {
        this.modalControl.closeAll();
    }

    create<T>(options: IModalOptionsForService<T> = {}): McModalRef<T> {
        if (typeof options.mcOnCancel !== 'function') {
            // tslint:disable-next-line
            options.mcOnCancel = () => {
            }; // Leave a empty function to close this modal by default
        }

        return new ModalBuilderForService(this.overlay, options).getInstance();
    }

    confirm<T>(options: IModalOptionsForService<T> = {}, confirmType: ConfirmType = 'confirm'): McModalRef<T> {
        if ('mcFooter' in options) {
            console.warn(`The Confirm-Modal doesn't support "mcFooter", this property will be ignored.`);
        }
        if (!('mcWidth' in options)) {
            // tslint:disable-next-line
            options.mcWidth = 416;
        }
        if (typeof options.mcOnOk !== 'function') { // NOTE: only support function currently by calling confirm()
            // tslint:disable-next-line
            options.mcOnOk = () => {
            }; // Leave a empty function to close this modal by default
        }

        options.mcModalType = 'confirm';
        options.mcClassName = `mc-confirm mc-confirm-${confirmType} ${options.mcClassName || ''}`;
        options.mcMaskClosable = false;

        return this.create(options);
    }

    info<T>(options: IModalOptionsForService<T> = {}): McModalRef<T> {
        return this.simpleConfirm(options, 'info');
    }

    success<T>(options: IModalOptionsForService<T> = {}): McModalRef<T> {
        return this.simpleConfirm(options, 'success');
    }

    error<T>(options: IModalOptionsForService<T> = {}): McModalRef<T> {
        return this.simpleConfirm(options, 'error');
    }

    warning<T>(options: IModalOptionsForService<T> = {}): McModalRef<T> {
        return this.simpleConfirm(options, 'warning');
    }

    private simpleConfirm<T>(options: IModalOptionsForService<T> = {}, confirmType: ConfirmType): McModalRef<T> {
        if (!('mcIconType' in options)) {
            options.mcIconType = {
                info: 'info-circle',
                success: 'check-circle',
                error: 'cross-circle',
                warning: 'exclamation-circle'
            }[confirmType];
        }
        if (!('mcCancelText' in options)) { // Remove the Cancel button if the user not specify a Cancel button
            // @ts-ignore
            options.mcCancelText = null;
        }

        return this.confirm(options, confirmType);
    }
}
