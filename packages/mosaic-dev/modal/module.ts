import { Component, Input, NgModule, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { McButton, McButtonModule } from '@ptsecurity/mosaic/button';
import { ThemePalette } from '@ptsecurity/mosaic/core';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import { McModalModule, McModalRef, McModalService, ModalSize } from '@ptsecurity/mosaic/modal';


// tslint:disable:no-console
// tslint:disable:no-magic-numbers
// tslint:disable:no-unnecessary-class
@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ModalDemoComponent {
    themePalette = ThemePalette;

    @ViewChild('confirmButton') confirmButton: McButton;
    @ViewChild('deleteButton') deleteButton: McButton;

    isVisible = false;
    tplModal: McModalRef;
    htmlModalVisible = false;

    isLoading = false;

    constructor(private modalService: McModalService) {}

    showConfirm() {
        const modalRef = this.modalService.success({
            mcSize: ModalSize.Small,
            mcMaskClosable: true,
            mcContent: 'Сохранить сделанные изменения в запросе "Все активы с виндой"?',
            mcOkText: 'Сохранить',
            mcCancelText: 'Отмена',
            mcOnOk: () => console.log('OK')
        });

        modalRef.afterClose.subscribe(() => this.confirmButton.focusViaKeyboard());
    }

    showDeleteConfirm() {
        const modalRef = this.modalService.delete({
            mcSize: ModalSize.Small,
            mcMaskClosable: true,
            mcContent: 'The selected action "Send to Arbor" is used in a rule' +
                ' or an alert. It will be <b>deleted</b> there too. </br></br>' +
                'Delete the selected action anyway?',
            mcOkText: 'Delete',
            mcCancelText: 'Cancel',
            mcWidth: '480px',
            mcOnOk: () => console.log('Delete'),
            mcOnCancel: () => console.log('Cancel')
        });

        modalRef.afterClose.subscribe(() => this.deleteButton.focusViaKeyboard());
        this.showConfirm();
    }

    createTplModal(tplTitle: TemplateRef<{}>, tplContent: TemplateRef<{}>, tplFooter: TemplateRef<{}>) {
        this.tplModal = this.modalService.create({
            mcTitle: tplTitle,
            mcContent: tplContent,
            mcFooter: tplFooter,
            mcClosable: true,
            mcOnOk: () => console.log('Click ok')
        });
    }

    createModalComponent() {
        this.modalService.open({
            mcComponent: McModalFullCustomComponent
        });
    }

    createLongModal() {
        this.modalService.create({
            mcTitle     : 'Modal Title',
            mcContent   : McModalLongCustomComponent,
            mcOkText    : 'Yes',
            mcCancelText: 'No',
            mcSize: ModalSize.Small
        });
    }

    createComponentModal() {
        let isLoading = false;
        const isShown = false;

        const modal = this.modalService.create({
            mcTitle: 'Modal Title',
            mcContent: McModalCustomComponent,
            mcComponentParams: {
                title: 'title in component',
                subtitle: 'component sub title，will be changed after 2 sec'
            },
            mcFooter: [{
                label: 'button 1',
                type: 'primary',
                mcModalMainAction: true,
                loading: () => isLoading,
                onClick: (componentInstance: any) => {
                    componentInstance.title = 'title in inner component is changed';
                }
            }, {
                label: 'button 2',
                type: 'primary',
                autoFocus: true,
                show: () => isShown,
                onClick: (componentInstance: any) => {
                    componentInstance.title = 'title in inner component is changed';
                }
            }]
        });

        modal.afterOpen.subscribe(() => {
            console.log('[afterOpen] emitted!');

            isLoading = true;
            setTimeout(() => isLoading = false, 3000);
            //
            // let isDisabled = true;
            // setTimeout(() => isDisabled = false, 2000);

            // isShown = true;
            // setTimeout(() => isShown = false, 4000);
        });

        // Return a result when closed
        modal.afterClose.subscribe((result) => console.log('[afterClose] The result is:', result));

        // delay until modal instance created
        setTimeout(
            () => {
                const instance = modal.getContentComponent();
                instance.subtitle = 'sub title is changed';
                modal.markForCheck();
            },
            2000
        );
    }

    openAndCloseAll() {
        let pos = 0;

        [ 'create', 'delete', 'success' ].forEach((method) => this.modalService[method]({
            mcOkText    : 'Confirm',
            mcCancelText: 'Cancel',
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
        <button mc-button [color]="themePalette.Primary" (click)="destroyModal()">destroy modal in the component</button>
      </p>
    </div>
  `
})
export class McModalCustomComponent {
    themePalette = ThemePalette;

    @Input() title: string;
    @Input() subtitle: string;

    constructor(private modal: McModalRef) { }

    destroyModal() {
        this.modal.destroy({ data: 'this the result data' });
    }
}

@Component({
    selector: 'mc-modal-full-custom-component',
    template: `
        <mc-modal-title>
            Modal Title
        </mc-modal-title>

        <mc-modal-body>
            <h2>{{ title }}</h2>
            <h4>{{ subtitle }}</h4>
            <p>
                <span>Get Modal instance in component</span>
                <button mc-button [color]="themePalette.Primary" (click)="destroyModal()">destroy modal in the component</button>
            </p>
        </mc-modal-body>

        <div mc-modal-footer>
            <button mc-button [color]="themePalette.Primary" >Save</button>
            <button mc-button autofocus>Close</button>
        </div>
  `
})
export class McModalFullCustomComponent {
    themePalette = ThemePalette;

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
        McModalLongCustomComponent,
        McModalFullCustomComponent
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
