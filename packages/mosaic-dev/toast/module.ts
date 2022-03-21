/* tslint:disable:no-console */
import { NgModule, Component, ViewEncapsulation, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ThemePalette } from '@ptsecurity/mosaic/core';
import {
    McToastStyle,
    MC_TOAST_CONFIG,
    McToastData,
    McToastModule,
    McToastService,
    McToastPosition,
    McToastComponent
} from '@ptsecurity/mosaic/toast';

import { McButtonModule } from '../../mosaic/button';


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
        readonly service: McToastService
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
        private toastService: McToastService,
        private newToastService: McToastService<MyToastComponent>
    ) {}

    showStickyToast(style: McToastStyle) {
        this.toastService.show({ style, title: 'Success', content: 'Message Content' }, false, 0, true);
    }

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
        McToastModule
    ],
    bootstrap: [ToastDemoComponent],
    providers: [
        McToastService,
        {
            provide: MC_TOAST_CONFIG,
            useValue: {
                position: McToastPosition.TOP_RIGHT,
                duration: 3000,
                onTop: true
            }
        }
        // {
        //     provide: McToastComponent,
        //     useFactory: () => MyToastComponent
        // }
    ]
})
export class DemoModule {}
