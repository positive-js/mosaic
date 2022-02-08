import { NgModule, Component, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ThemePalette } from '@ptsecurity/mosaic/core';
import { McToastType, ToastModule, ToastPosition, ToastService } from '@ptsecurity/mosaic/toast';

import { McButtonModule } from '../../mosaic/button';


@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ToastDemoComponent {
    themePalette = ThemePalette;

    constructor(
        private toast: ToastService
    ) {}

    showToast(severity: McToastType) {
        this.toast.show({ severity, title: 'Success', content: 'Message Content' });
    }
}

@NgModule({
    declarations: [ToastDemoComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        McButtonModule,
        ToastModule.forRoot({
            position: ToastPosition.TOP_CENTER,
            duration: 5000,
            newOnTop: false
        })
    ],
    bootstrap: [ToastDemoComponent]
})
export class DemoModule {}
