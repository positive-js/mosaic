/* tslint:disable:no-console */
import { ChangeDetectionStrategy, Component, TemplateRef, ViewEncapsulation } from '@angular/core';
import { ThemePalette } from '@ptsecurity/mosaic/core';
import { McToastData, McToastStyle, McToastService, McToastComponent } from '@ptsecurity/mosaic/toast';


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
/**
 * @title Basic Toast
 */
@Component({
    selector: 'toast-overview-example',
    templateUrl: 'toast-overview-example.html',
    styleUrls: ['toast-overview-example.css']
})
export class ToastOverviewExample {
    themePalette = ThemePalette;

    constructor(
        private toastService: McToastService,
        private newToastService: McToastService<MyToastComponent>
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
