import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
    NgModule,
    Component,
    ViewEncapsulation,
    ComponentFactoryResolver,
    ViewChild,
    ComponentRef,
    ViewContainerRef,
    Injector,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastModule, ToastPosition, ToastData, ToastService, ToastContainerComponent } from '@ptsecurity/mosaic/toast';

import { McButtonModule } from '../../mosaic/button';
import { ToastComponent } from '../../mosaic/toast/toast.component';


@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ToastDemoComponent {
    @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;

    index = 0;
    componentRef: ComponentRef<any>;
    components: ComponentRef<any>[] = [];
    instance;
    overlayRef;

    private portal: ComponentPortal<ToastContainerComponent>;

    constructor(
        private toast: ToastService,
        private resolver: ComponentFactoryResolver,
        private injector: Injector,
        private overlay: Overlay
    ) {
    }

    createHost() {
        if (!this.overlayRef) {
            this.overlayRef = this.overlay.create();
        }
        this.portal = this.portal || new ComponentPortal(ToastContainerComponent, null, this.injector);
        this.instance = this.overlayRef.attach(this.portal).instance;
    }

    addToast(data: ToastData) {
        this.createHost();

        const toast = this.resolver.resolveComponentFactory(ToastComponent);
        const injector = this.getInjector(data, this.injector);
        this.componentRef = this.instance.createComponent(toast, this.index, injector);
        this.components.push(this.componentRef);
        this.index++;
    }

    getInjector(data: ToastData, parentInjector: Injector): Injector {
        return Injector.create({
            providers: [{provide: ToastData, useValue: data}],
            parent: parentInjector
        });
    }

    openSuccessPortal() {
        this.toast.show({ severity: 'success', title: 'Success', content: 'Message Content' });
    }

    showSuccessAlert() {
        this.toast.show({ severity: 'success', title: 'Success', content: 'Message Content' });
        // this.addToast({ severity: 'success', title: 'Success', content: 'Message Content' });
    }

    showInfoAlert() {
        this.toast.show({ severity: 'info', title: 'Info', content: 'Message Content' });
        // this.addToast({ severity: 'info', title: 'Info', content: 'Message Content' });
    }

    showWarnAlert() {
        this.toast.show({ severity: 'warning', title: 'Warn', content: 'Message Content' });
        // this.addToast({ severity: 'warning', title: 'Warn', content: 'Message Content' });
    }

    showErrorAlert() {
        this.toast.show({ severity: 'error', title: 'Error', content: 'Message Content' });
        // this.addToast({ severity: 'error', title: 'Error', content: 'Message Content' });
    }
}

@NgModule({
    declarations: [ToastDemoComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        McButtonModule,
        ToastModule.forRoot({
            position: ToastPosition.TOP_RIGHT,
            duration: 30000
        })
    ],
    bootstrap: [ToastDemoComponent]
})
export class DemoModule {
}
