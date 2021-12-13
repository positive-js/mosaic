import { NgModule, Component, ViewEncapsulation, ViewChild, ComponentRef, ViewContainerRef, Injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastModule, ToastPosition, ToastData, ToastService } from '@ptsecurity/mosaic/toast';

import { McButtonModule } from '../../mosaic/button';


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

    constructor(
        private toast: ToastService
    ) {
    }

    getInjector(data: ToastData, parentInjector: Injector): Injector {
        return Injector.create({
            providers: [{provide: ToastData, useValue: data}],
            parent: parentInjector
        });
    }

    showSuccessAlert() {
        this.toast.show({ severity: 'success', title: 'Success', content: 'Message Content' });
    }

    showInfoAlert() {
        this.toast.show({ severity: 'info', title: 'Info', content: 'Message Content' });
    }

    showWarnAlert() {
        this.toast.show({ severity: 'warning', title: 'Warn', content: 'Message Content' });
    }

    showErrorAlert() {
        this.toast.show({ severity: 'error', title: 'Error', content: 'Message Content' });
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
            duration: 5000
        })
    ],
    bootstrap: [ToastDemoComponent]
})
export class DemoModule {
}
