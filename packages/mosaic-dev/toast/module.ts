import { NgModule, Component, ViewEncapsulation, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ThemePalette } from '@ptsecurity/mosaic/core';
import {
    McToastStyle,
    MC_TOAST_CONFIG,
    McToastData,
    ToastModule,
    ToastService,
    ToastPosition
} from '@ptsecurity/mosaic/toast';

import { McButtonModule } from '../../mosaic/button';
import { McToastComponent } from '../../mosaic/toast/toast.component';


@Component({
    selector: 'mc-new-toast',
    template: '<div>MyToastComponent</div>',
    host: {
        class: 'my-toast'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class MyToastComponent extends McToastComponent {
    constructor(
        readonly data: McToastData,
        readonly service: ToastService
    ) {
        super(data, service);

        console.log('MyToastComponent: ');
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
        private toastService: ToastService,
        private newToastService: ToastService<MyToastComponent>
    ) {}

    showToast(style: McToastStyle) {
        this.toastService.show({ style, title: 'Success', content: 'Message Content' });
    }

    showToastTitleTemplate(style: McToastStyle, template: TemplateRef<any>) {
        this.toastService.show({ style, title: template, content: 'Message Content' });
    }

    showToastContentTemplate(style: McToastStyle, template: TemplateRef<any>) {
        this.toastService.show({ style, title: 'Success', content: template });
    }

    showNewToast(style: McToastStyle) {
        this.newToastService.show({ style, title: 'Success', content: 'Message Content' });
    }

    showTemplate(style: McToastStyle, template: TemplateRef<any>) {
        this.toastService.showTemplate({ style, title: 'Success', content: 'Message Content' }, template);
    }
}

@NgModule({
    declarations: [
        ToastDemoComponent,
        MyToastComponent
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
                duration: 3000,
                onTop: true
            }
        },
        // {
        //     provide: McToastComponent,
        //     useFactory: () => MyToastComponent
        // }
    ]
})
export class DemoModule {}
