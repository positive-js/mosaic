import { Observable } from 'rxjs';

import { McModalComponent } from './modal.component';


export abstract class McModalRef<T = any, R = any> {
    abstract afterOpen: Observable<void>;
    abstract afterClose: Observable<R>;

    abstract open(): void;

    abstract close(result?: R): void;

    abstract destroy(result?: R): void;

    /**
     * Trigger the mcOnOk/mcOnCancel by manual
     */
    abstract triggerOk(): void;

    abstract triggerCancel(): void;

    // /**
    //  * Return the ComponentRef of mcContent when specify mcContent as a Component
    //  * Note: this method may return undefined if the Component has not ready yet. (it only available after Modal's ngOnInit)
    //  */
    // abstract getContentComponentRef(): ComponentRef<{}>;
    /**
     * Return the component instance of mcContent when specify mcContent as a Component
     * Note: this method may return undefined if the Component has not ready yet. (it only available after Modal's ngOnInit)
     */
    abstract getContentComponent(): T;

    /**
     * Get the dom element of this Modal
     */
    abstract getElement(): HTMLElement;

    /**
     * Get the instance of the Modal itself
     */
    abstract getInstance(): McModalComponent;
}
