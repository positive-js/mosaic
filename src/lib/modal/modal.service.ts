import { ComponentRef, Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { ESCAPE } from '@ptsecurity/cdk/keycodes';
import { Overlay, OverlayRef } from '@ptsecurity/cdk/overlay';
import { ComponentPortal } from '@ptsecurity/cdk/portal';

import { McModalControlService } from './modal-control.service';
import { McModalRef } from './modal-ref.class';
import { McModalComponent } from './modal.component';
import { ConfirmType, IModalOptions, IModalOptionsForService } from './modal.type';


// A builder used for managing service creating modals
export class ModalBuilderForService {

    // Modal ComponentRef, "null" means it has been destroyed
    private modalRef: ComponentRef<McModalComponent>;
    private overlayRef: OverlayRef;

    constructor(private overlay: Overlay, options: IModalOptionsForService = {}) {
        this.createModal();

        if (!('mcGetContainer' in options)) {
            options.mcGetContainer = null;
        }

        this.changeProps(options);
        this.modalRef.instance.open();
        this.modalRef.instance.mcAfterClose.subscribe(() => this.destroyModal());

        this.overlayRef.keydownEvents()
            // @ts-ignore
            .pipe(filter((event: KeyboardEvent) => {
                return event.keyCode === ESCAPE && options.mcCloseByESC;
            }))
            .subscribe(() => this.destroyModal());
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
        private modalControl: McModalControlService) {
    }

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


        if (!('mcWidth' in options)) {
            // tslint:disable-next-line
            options.mcWidth = 480;
        }

        return new ModalBuilderForService(this.overlay, options).getInstance();
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
        options.mcMaskClosable = false;

        return this.create(options);
    }

    success<T>(options: IModalOptionsForService<T> = {}): McModalRef<T> {
        return this.simpleConfirm(options, 'success');
    }

    delete<T>(options: IModalOptionsForService<T> = {}): McModalRef<T> {
        return this.simpleConfirm(options, 'warn');
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
