import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    Inject,
    Injector,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation,
    ViewRef
} from '@angular/core';

import { ToastConfig, MC_TOAST_CONFIG, ToastData } from './toast.type';


@Component({
    selector: 'mc-toast-container',
    template: '<ng-container #container></ng-container>',
    host: {
        class: 'mc-toast-container'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class McToastContainerComponent {
    @ViewChild('container', { static: true, read: ViewContainerRef }) viewContainer: ViewContainerRef;

    constructor(
        private injector: Injector,
        @Inject(MC_TOAST_CONFIG) private toastConfig: ToastConfig,
        private changeDetectorRef: ChangeDetectorRef
    ) {}

    createToast<C>(data: ToastData, componentType): ComponentRef<C> {
        const injector = this.getInjector(data);
        const index = this.toastConfig.newOnTop ? 0 : undefined;

        this.changeDetectorRef.markForCheck();

        return this.viewContainer.createComponent(componentType, { injector, index });
    }

    deleteToast(viewRef: ViewRef) {
        const index = this.viewContainer.indexOf(viewRef);

        if (index < 0) { return; }

        this.viewContainer.remove(index);
    }

    getInjector(data: ToastData): Injector {
        return Injector.create({
            providers: [{ provide: ToastData, useValue: data }],
            parent: this.injector
        });
    }
}
