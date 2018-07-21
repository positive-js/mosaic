import { Component, Input, NgModule, TemplateRef, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { McButtonModule } from '../../lib/button/';
import { McIconModule } from '../../lib/icon';
import { McModalModule, McModalRef, McModalService } from '../../lib/modal';


// tslint:disable:no-console
// tslint:disable:no-magic-numbers
// tslint:disable:no-unnecessary-class
@Component({
    selector: 'app',
    template: require('./template.html'),
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ModalDemoComponent {
    isVisible = false;
    tplModal: McModalRef;
    htmlModalVisible = false;

    constructor(private modalService: McModalService) {}

    showConfirm() {
        this.modalService.success({
            mcContent   : 'Сохранить сделанные изменения в запросе "Все активы с виндой"?',
            mcOkText    : 'Сохранить',
            mcCancelText: 'Отмена',
            mcOnOk      : () => console.log('OK')
        });
    }

    showDeleteConfirm() {
        this.modalService.delete({
            mcContent   : 'The selected action "Send to Arbor" is used in a rule' +
                ' or an alert. It will be <b>deleted</b> there too. </br></br>' +
                'Delete the selected action anyway?',
            mcOkType    : 'warn',
            mcOkText    : 'Yes',
            mcCancelText: 'No',
            mcWidth     : '480px',
            mcOnOk      : () => console.log('OK'),
            mcOnCancel  : () => console.log('Cancel')
        });
    }

    createTplModal(tplTitle: TemplateRef<{}>, tplContent: TemplateRef<{}>, tplFooter: TemplateRef<{}>) {
        this.tplModal = this.modalService.create({
            mcTitle       : tplTitle,
            mcContent     : tplContent,
            mcFooter      : tplFooter,
            mcMaskClosable: false,
            mcClosable    : true,
            mcOnOk        : () => console.log('Click ok')
        });
    }

    createLongModal() {

        const modal = this.modalService.create({
            mcTitle     : 'Modal Title',
            mcContent   : McModalLongCustomComponent,
            mcOkText    : 'Yes',
            mcCancelText: 'No'
        });
    }

    createComponentModal() {
        const modal = this.modalService.create({
            mcTitle: 'Modal Title',
            mcContent: McModalCustomComponent,
            mcComponentParams: {
                title: 'title in component',
                subtitle: 'component sub title，will be changed after 2 sec'
            },
            mcFooter: [{
                label: 'change component tilte from outside',
                type: 'primary',
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

    openAndCloseAll() {
        let pos = 0;

        [ 'create', 'delete', 'success' ].forEach((method) => this.modalService[method]({
            mcOkText    : 'Yes',
            mcMask: false,
            mcContent: `Test content: <b>${method}</b>`,
            mcStyle: { position: 'absolute', top: `${pos * 70}px`, left: `${(pos++) * 300}px` }
        }));

        this.htmlModalVisible = true;

        this.modalService.afterAllClose.subscribe(() => console.log('afterAllClose emitted!'));

        window.setTimeout(() => this.modalService.closeAll(), 5000);
    }

    destroyTplModal() {
        this.tplModal.destroy();
    }

    showModal() {
        this.isVisible = true;
    }

    handleOk() {
        console.log('Button ok clicked!');
        this.isVisible = false;
    }

    handleCancel() {
        console.log('Button cancel clicked!');
        this.isVisible = false;
    }
}


@Component({
    selector: 'mc-modal-custom-long-component',
    template: `
    <ng-container *ngFor="let item of longText">
        <p>{{ item }}</p>
    </ng-container>
  `
})
export class McModalLongCustomComponent {

    longText: any = [];

    constructor() {
        for (let i = 0; i < 50; i++) {
            this.longText.push(`text lint - ${i}`);
        }
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

    destroyModal() {
        this.modal.destroy({ data: 'this the result data' });
    }
}

@NgModule({
    declarations: [
        ModalDemoComponent,
        McModalCustomComponent,
        McModalLongCustomComponent
    ],
    entryComponents: [
        McModalCustomComponent,
        McModalLongCustomComponent
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

