import { ComponentRef, Injectable } from '@angular/core';
import { Overlay, OverlayRef } from '@ptsecurity/cdk/overlay';
import { ComponentPortal } from '@ptsecurity/cdk/portal';
import { McModalRef } from '@ptsecurity/mosaic/modal/modal-abstr-ref.class';
import { McModalControlService } from '@ptsecurity/mosaic/modal/modal-control.service';
import { Observable } from 'rxjs';

import { McModalComponent } from './modal.component';
import { ConfirmType, IModalOptions, IModalOptionsForService } from './modal.types';


export class ModalBuilderForService {

    private modalRef: ComponentRef<McModalComponent>;
    private overlayRef: OverlayRef;

    constructor(private overlay: Overlay, options: IModalOptionsForService = {}) {
        this.createModal();

        // As we use CDK to create modal in service by force, there is no need to use mcGetContainer
        if (!('mcGetContainer' in options)) {
            // Override mcGetContainer's default value to prevent creating another overlay
            // @ts-ignore
            options.mcGetContainer = null;
        }

        this.changeProps(options);
        this.modalRef.instance.open();
        // [NOTE] By default, close equals destroy when using as Service
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
            // DANGER: here not limit user's inputs at runtime
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
        private modalControl: McModalControlService) {
    }

    // Closes all of the currently-open dialogs
    closeAll(): void {
        this.modalControl.closeAll();
    }

    create<T>(options: IModalOptionsForService<T> = {}): McModalRef<T> {
        if (typeof options.mcOnCancel !== 'function') {
            // Leave a empty function to close this modal by default
            /* tslint:disable:no-empty */
            options.mcOnCancel = () => {};
        }

        // NOTE: use McModalComponent as the McModalRef by now,
        // we may need archive the real McModalRef object in the future
        return new ModalBuilderForService(this.overlay, options).getInstance();
    }

    confirm<T>(options: IModalOptionsForService<T> = {}, confirmType: ConfirmType = 'confirm'): McModalRef<T> {
        if ('mcFooter' in options) {
            console.warn(`The Confirm-Modal doesn't support "mcFooter", this property will be ignored.`);
        }
        /* tslint:disable:no-magic-numbers */
        if (!('mcWidth' in options)) {
            options.mcWidth = 416;
        }
        if (typeof options.mcOnOk !== 'function') { // NOTE: only support function currently by calling confirm()
            /* tslint:disable:no-empty */
            options.mcOnOk = () => {}; // Leave a empty function to close this modal by default
        }

        options.mcModalType = 'confirm';
        options.mcClassName = `ant-confirm ant-confirm-${confirmType} ${options.mcClassName || ''}`;
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

        // Remove the Cancel button if the user not specify a Cancel button
        if (!('mcCancelText' in options)) {
            // @ts-ignore
            options.mcCancelText = null;
        }

        return this.confirm(options, confirmType);
    }
}
