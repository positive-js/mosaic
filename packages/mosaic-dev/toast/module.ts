import { NgModule, Component, ViewEncapsulation, TemplateRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ThemePalette } from '@ptsecurity/mosaic/core';
import {
    defaultToastConfig,
    McToastType,
    TOAST_CONFIG_TOKEN,
    ToastModule,
    ToastService
} from '@ptsecurity/mosaic/toast';

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

    showToast(severity: McToastType, template?: TemplateRef<any>) {
        this.toast.show({ severity, title: 'Success', content: 'Message Content', template });
    }
}

@NgModule({
    declarations: [ToastDemoComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        McButtonModule,
        ToastModule
    ],
    bootstrap: [ToastDemoComponent],
    providers: [{
        provide: TOAST_CONFIG_TOKEN,
        useValue: defaultToastConfig
    }]
})
export class DemoModule {}
