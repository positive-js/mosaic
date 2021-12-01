import { NgModule, Component, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastService, ToastModule } from '@ptsecurity/mosaic/toast';

import { McButtonModule } from '../../mosaic/button';


@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ToastDemoComponent {
    constructor(
        private toast: ToastService
    ) {
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
            position: 'top-right',
            duration: 30000
        })
    ],
    bootstrap: [ToastDemoComponent]
})
export class DemoModule {}
