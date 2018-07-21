import { Injectable, Optional, SkipSelf} from '@angular/core';
import { Subject, Subscription } from 'rxjs';

import { McModalRef } from './modal-abstr-ref.class';


interface IRegisteredMeta {
    modalRef: McModalRef;
    afterOpenSubscription: Subscription;
    afterCloseSubscription: Subscription;
}

@Injectable()
export class McModalControlService {

    // Track singleton afterAllClose through over the injection tree
    get afterAllClose(): Subject<void> {
        return this.parentService ? this.parentService.afterAllClose : this.rootAfterAllClose;
    }

    // Track singleton openModals array through over the injection tree
    get openModals(): McModalRef[] {
        return this.parentService ? this.parentService.openModals : this.rootOpenModals;
    }

    // @ts-ignore
    private rootOpenModals: McModalRef[] = this.parentService ? null : [];
    // @ts-ignore
    private rootAfterAllClose: Subject<void> = this.parentService ? null : new Subject<void>();

    // @ts-ignore
    private rootRegisteredMetaMap: Map<McModalRef, IRegisteredMeta> = this.parentService ? null : new Map();

    private get registeredMetaMap(): Map<McModalRef, IRegisteredMeta> { // Registered modal for later usage
        return this.parentService ? this.parentService.registeredMetaMap : this.rootRegisteredMetaMap;
    }

    constructor(
        @Optional() @SkipSelf() private parentService: McModalControlService) {
    }

    // Register a modal to listen its open/close
    registerModal(modalRef: McModalRef): void {
        if (!this.hasRegistered(modalRef)) {
            const afterOpenSubscription = modalRef.afterOpen.subscribe(() => this.openModals.push(modalRef));
            const afterCloseSubscription = modalRef.afterClose.subscribe(() => this.removeOpenModal(modalRef));

            this.registeredMetaMap.set(modalRef, { modalRef, afterOpenSubscription, afterCloseSubscription });
        }
    }

    // TODO: allow deregister modals
    // deregisterModal(modalRef: McModalRef): void {}
    hasRegistered(modalRef: McModalRef): boolean {
        return this.registeredMetaMap.has(modalRef);
    }

    // Close all registered opened modals
    closeAll(): void {
        let i = this.openModals.length;

        while (i--) {
            this.openModals[ i ].close();
        }
    }

    private removeOpenModal(modalRef: McModalRef): void {
        const index = this.openModals.indexOf(modalRef);

        if (index > -1) {
            this.openModals.splice(index, 1);

            if (!this.openModals.length) {
                this.afterAllClose.next();
            }
        }
    }
}
