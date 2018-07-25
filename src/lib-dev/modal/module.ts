import {Component, Input, NgModule, TemplateRef, ViewEncapsulation} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { McButtonModule } from '../../lib/button/';
import { McIconModule } from '../../lib/icon';
import { McModalModule, McModalRef, McModalService } from '../../lib/modal';


@Component({
    selector: 'app',
    template: require('./template.html'),
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ModalDemoComponent {
    isVisible = false;
    tplModal: McModalRef;

    constructor(private modalService: McModalService) {
    }

    showConfirm(): void {
        this.modalService.confirm({
            mcTitle  : 'Do you Want to delete these items?',
            mcOkText: 'okey',
            mcCancelText: 'nooo!',
            mcContent: '<b>Some descriptions</b>',
            mcOnOk   : () => console.log('OK')
        });
    }

    showDeleteConfirm(): void {
        this.modalService.confirm({
            mcTitle     : 'Are you sure delete this task?',
//            mcContent   : '<b style="color: red;">Some descriptions</b>',
            mcContent   : 'Some descriptions',
            mcOkText    : 'Yes',
            mcOkType    : 'danger',
            mcOnOk      : () => console.log('OK'),
            mcCancelText: 'No',
            mcOnCancel  : () => console.log('Cancel')
        });
    }

    createTplModal(tplTitle: TemplateRef<{}>, tplContent: TemplateRef<{}>, tplFooter: TemplateRef<{}>): void {
        this.tplModal = this.modalService.create({
            mcTitle: tplTitle,
            mcContent: tplContent,
            mcFooter: tplFooter,
            mcMaskClosable: false,
            mcClosable: true,
            mcOnOk: () => console.log('Click ok')
        });
    }

    createComponentModal(): void {
        const modal = this.modalService.create({
            mcTitle: 'Modal Title',
            mcContent: McModalCustomComponent,
            mcComponentParams: {
                title: 'title in component',
                subtitle: 'component sub title，will be changed after 2 sec'
            },
            mcFooter: [{
                label: 'change component tilte from outside',
                onClick: (componentInstance: any) => {
                    componentInstance.title = 'title in inner component is changed';
                }
            }]
        });

        modal.afterOpen.subscribe(() => console.log('[afterOpen] emitted!'));

        // Return a result when closed
        modal.afterClose.subscribe((result) => console.log('[afterClose] The result is:', result));

        // delay until modal instance created
        window.setTimeout(() => {
            const instance = modal.getContentComponent();
            instance.subtitle = 'sub title is changed';
        }, 2000);
    }

    destroyTplModal(): void {
        this.tplModal.destroy();
    }

    showModal(): void {
        this.isVisible = true;
    }

    handleOk(): void {
        console.log('Button ok clicked!');
        this.isVisible = false;
    }

    handleCancel(): void {
        console.log('Button cancel clicked!');
        this.isVisible = false;
    }
}


@Component({
    selector: 'mc-modal-custom-component',
    template: `
    <div>
      <h2>{{ title }}</h2>
      <h4>{{ subtitle }}</h4>
      <p>
        <span>Get Modal instance in component</span>
        <button mc-button color="primary" (click)="destroyModal()">destroy modal in the component</button>
      </p>
    </div>
  `
})
export class McModalCustomComponent {
    @Input() title: string;
    @Input() subtitle: string;

    constructor(private modal: McModalRef) { }

    destroyModal(): void {
        this.modal.destroy({ data: 'this the result data' });
    }
}

@NgModule({
    declarations: [
        ModalDemoComponent,
        McModalCustomComponent
    ],
    entryComponents: [
        McModalCustomComponent
    ],
    imports: [
        BrowserModule,
        McButtonModule,
        McIconModule,
        McModalModule
    ],
    bootstrap: [
        ModalDemoComponent
    ]
})
export class DemoModule {}

platformBrowserDynamic()
    .bootstrapModule(DemoModule)
    .catch((error) => console.error(error));

