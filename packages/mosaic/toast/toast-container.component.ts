import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ComponentRef,
    EmbeddedViewRef,
    Injector,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation,
    ViewRef
} from '@angular/core';

import { McToastData } from './toast.type';


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
        private changeDetectorRef: ChangeDetectorRef
    ) {}

    createToast<C>(data: McToastData, componentType, onTop: boolean): ComponentRef<C> {
        const injector = this.getInjector(data);
        const index = onTop ? 0 : undefined;

        this.changeDetectorRef.markForCheck();

        return this.viewContainer.createComponent(componentType, { injector, index });
    }

    createTemplate<C>(data: McToastData, template: TemplateRef<any>, onTop: boolean): EmbeddedViewRef<C> {
        const index = onTop ? 0 : undefined;

        return this.viewContainer.createEmbeddedView(template, { $implicit: data }, index);
    }

    remove(viewRef: ViewRef) {
        const index = this.viewContainer.indexOf(viewRef);

        if (index < 0) { return; }

        this.viewContainer.remove(index);
    }

    getInjector(data: McToastData): Injector {
        return Injector.create({
            providers: [{ provide: McToastData, useValue: data }],
            parent: this.injector
        });
    }
}
