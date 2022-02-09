import { NgModule, Component, ViewEncapsulation, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ThemePalette } from '@ptsecurity/mosaic/core';
import {
    McToastType,
    MC_TOAST_CONFIG,
    ToastData,
    ToastModule,
    ToastService,
    ToastPosition
} from '@ptsecurity/mosaic/toast';

import { McButtonModule } from '../../mosaic/button';
import { McToastComponent } from '../../mosaic/toast/toast.component';


@Component({
    selector: 'mc-new-toast',
    template: '<div>some new toast</div>',
    host: {
        class: 'mc-new-toast'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class McNewToastComponent extends McToastComponent {
    constructor(
        readonly data: ToastData,
        readonly service: ToastService
    ) {
        super(data, service);
        console.log('constructor: ');
    }
}


@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ToastDemoComponent {
    themePalette = ThemePalette;

    constructor(
        private toast: ToastService,
        private newToast: ToastService<McNewToastComponent>
    ) {}

    showToast(severity: McToastType, template?: TemplateRef<any>) {
        this.toast.show({ severity, title: 'Success', content: 'Message Content', template });
    }

    showNewToast(severity: McToastType) {
        this.newToast.show({ severity, title: 'Success', content: 'Message Content' });
    }
}

@NgModule({
    declarations: [
        ToastDemoComponent,
        McNewToastComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        McButtonModule,
        ToastModule
    ],
    bootstrap: [ToastDemoComponent],
    providers: [
        {
            provide: MC_TOAST_CONFIG,
            useValue: {
                position: ToastPosition.TOP_CENTER,
                duration: 300000,
                newOnTop: true
            }
        },
        // {
        //     provide: McToastComponent,
        //     useFactory: () => McNewToastComponent
        // }
    ]
})
export class DemoModule {}
