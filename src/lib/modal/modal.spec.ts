import { Component, ElementRef, EventEmitter, Input } from '@angular/core';
import { async, fakeAsync, flush, inject, tick, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@ptsecurity/cdk/overlay';
import { CssUnitPipe } from '@ptsecurity/mosaic/core/pipes/css-unit.pipe';

import { McButton, McButtonModule } from '../button';
import { McMeasureScrollbarService } from '../core/services/measure-scrollbar.service';

import { McModalControlService } from './modal-control.service';
import { McModalRef } from './modal-ref.class';
import { MODAL_ANIMATE_DURATION, McModalComponent } from './modal.component';
import { McModalModule } from './modal.module';
import { McModalService } from './modal.service';


// tslint:disable-next-line
const WAIT_ANIMATE_TIME = MODAL_ANIMATE_DURATION + 50;

// tslint:disable:no-magic-numbers
// tslint:disable:max-line-length
// tslint:disable:no-console

describe('modal testing (legacy)', () => {
    let instance;
    let fixture: ComponentFixture<{}>;

    describe('demo-async', () => {
        let modalElement: HTMLElement;
        let buttonShow: HTMLButtonElement;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                imports: [McButtonModule, McModalModule],
                declarations: [McDemoModalAsyncComponent, TestVaryServiceCustomComponent],
                providers: [McMeasureScrollbarService]
            }).compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(McDemoModalAsyncComponent);
            instance = fixture.debugElement.componentInstance;
            modalElement = fixture.debugElement.query(By.directive(McModalComponent)).nativeElement;
            buttonShow = fixture.debugElement.query(By.directive(McButton)).nativeElement;
        });

        it('should show and hide after 3000ms with loading', fakeAsync(() => {
            buttonShow.click();
            fixture.detectChanges();
            flush();
            expectModalHidden(modalElement, false);

            const buttonOk = getButtonOk(modalElement);
            buttonOk.click(); // Click Ok button
            fixture.detectChanges();
            flush();
            fixture.detectChanges(); // In order to trigger ModalInstance's UI updating after finished hiding
            expectModalHidden(modalElement, true);
        }));
    }); // /async

});


// -------------------------------------------
// | Testing Components
// -------------------------------------------

@Component({
    selector: 'mc-demo-modal-async',
    template: `
        <button mc-button color="primary" (click)="showModal()">
            <span>show modal</span>
        </button>
        <mc-modal [(mcVisible)]="isVisible" mcTitle="title" (mcOnCancel)="handleCancel()" (mcOnOk)="handleOk()"
                  [mcOkLoading]="isOkLoading">
            <p>content</p>
        </mc-modal>
    `,
    styles: []
})
class McDemoModalAsyncComponent {
    isVisible = false;
    isOkLoading = false;

    showModal(): void {
        this.isVisible = true;
    }

    handleOk(): void {
        this.isOkLoading = true;
        window.setTimeout(() => {
            this.isVisible = false;
            this.isOkLoading = false;
        }, 3000);
    }

    handleCancel(): void {
        this.isVisible = false;
    }
}

@Component({
    selector: 'mc-demo-modal-confirm-promise',
    template: `
        <button mc-button mcType="info" (click)="showConfirm()">Confirm</button>
    `,
    styles: []
})
class McDemoModalConfirmPromiseComponent {
    confirmModal: McModalRef; // For testing by now

    constructor(private modal: McModalService) {
    }

    showConfirm(): void {
        this.confirmModal = this.modal.confirm({
            mcTitle: 'Do you Want to delete these items?',
            mcContent: 'When clicked the OK button, this dialog will be closed after 1 second',
            // tslint:disable-next-line
            mcOnOk: () => new Promise((resolve, reject) => {
                // tslint:disable-next-line
                setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
            }).catch(() => console.log('Oops errors!'))
        });
    }
}

@Component({
    template: ``
})
class TestBasicServiceComponent {
    basicModal: McModalRef;

    constructor(private modalService: McModalService) {
        this.modalService.create(); // [Testing Required] Only for coverage temporarily

        // Testing for creating modal immediately
        this.basicModal = this.modalService.create({
            mcGetContainer: () => document.body,
            mcZIndex: 1888,
            mcWidth: 250,
            mcWrapClassName: 'test-wrap-class-name',
            mcClassName: 'test-class-name',
            mcStyle: {left: '10px', top: '20pt', border: '2px solid red'},
            mcTitle: '<b>TEST BOLD TITLE</b>',
            mcContent: '<p>test html content</p>',
            mcClosable: false,
            mcMask: false,
            mcMaskClosable: false,
            mcMaskStyle: {opacity: 0.4},
            mcBodyStyle: {background: 'gray'},
            // mcFooter: '<div>custom html footer: <i>OK</i></div>',
            mcOkText: 'custom ok',
            mcOkType: 'success',
            mcOkLoading: false,
            mcOnOk: () => {
                console.log('click ok');

                return false;
            },
            mcCancelText: 'custom cancel',
            mcCancelLoading: true,
            mcOnCancel: () => console.log('click cancel')
        });
    }
}

@Component({
    template: ``
})
class TestVaryServiceComponent {
    constructor(private modalService: McModalService) {
    }

    createWithVary(): McModalRef<TestVaryServiceCustomComponent> {

        return this.modalService.create({
            mcContent: TestVaryServiceCustomComponent,
            mcComponentParams: {title: 'internal title', subtitle: 'subtitle'},
            mcFooter: [
                {
                    label: 'change title from outside',
                    onClick: (componentInstance: any) => {
                        componentInstance.title = 'internal title changed';

                        return Promise.resolve();
                    }
                },
                {
                    label: 'show loading',
                    onClick: () => Promise.reject(null)
                }
            ]
        });
    }
}

@Component({
    template: `
        <h2>{{ title }}</h2><h4>{{ subtitle }}</h4>
        <button (click)="destroyModal()">destroy</button>
    `
})
export class TestVaryServiceCustomComponent {
    @Input() title: string;
    @Input() subtitle: string;

    constructor(private modal: McModalRef, public elementRef: ElementRef) {
    }

    destroyModal(): void {
        this.modal.destroy();
    }
}

@Component({
    template: ``
})
export class TestConfirmModalComponent {
    constructor(public modalService: McModalService) {
    }

    createConfirm(): McModalRef {
        this.modalService.confirm(); // [Testing Required] Only for coverage temporarily
        this.modalService.confirm({mcWidth: 100}); // [Testing Required] Only for coverage temporarily

        // Boundary detection for options: mcFooter, mcOnOk
        return this.modalService.confirm({
            mcFooter: 'should warning',
            mcOkText: 'close'
        });
    }

    createOtherModals(): string[] {
        // tslint:disable-next-line
        return ['info', 'success', 'error', 'warning'].map((type) => {
            const modalId = generateUniqueId();
            this.modalService[type]({mcClassName: modalId});
            this.modalService[type]();  // [Testing Required] Only for coverage temporarily

            return modalId;
        });
    }
}

@Component({
    template: `
        <div [style.width]="100 | toCssUnit" [style.height]="'100px' | toCssUnit"
             [style.top]="100 | toCssUnit:'pt'"></div>`
})
class TestCssUnitPipeComponent {
}

@Component({
    selector: 'mc-modal-by-service',
    template: `
        <mc-modal [(mcVisible)]="nonServiceModalVisible" mcWrapClassName="__NON_SERVICE_ID_SUFFIX__"></mc-modal>
    `,
    providers: [McModalControlService] // Testing for service with parent service
})
export class ModalByServiceComponent {
    nonServiceModalVisible = false;

    // @ts-ignore
    // tslint:disable-next-line
    constructor(modalControlService: McModalControlService) {}
}

// -------------------------------------------
// | Local tool functions
// -------------------------------------------

function expectModalHidden(modalElement: HTMLElement, hidden: boolean): void {
    const display = (modalElement.querySelector('.mc-modal-wrap') as HTMLElement).style.display;

    if (hidden) {
        expect(display).toBe('none');
    } else {
        expect(display).not.toBe('none');
    }
    // @ts-ignore
    expect(modalElement.querySelector('.mc-modal-mask').classList.contains('mc-modal-mask-hidden')).toBe(hidden);
}

function expectModalDestroyed(classId: string, destroyed: boolean): void {
    const element = document.querySelector(`.${classId}`);

    if (destroyed) {
        expect(element).toBeFalsy();
    } else {
        expect(element).not.toBeFalsy();
    }
}

let counter = 0;

function generateUniqueId(): string {
    return `testing-uniqueid-${counter++}`;
}

function getButtonOk(modalElement: HTMLElement): HTMLButtonElement {
    return isConfirmModal(modalElement) ? modalElement.querySelector('.mc-confirm-btns button:last-child') as HTMLButtonElement : modalElement.querySelector('.mc-modal-footer button:last-child') as HTMLButtonElement;
}

function getButtonCancel(modalElement: HTMLElement): HTMLButtonElement {
    return isConfirmModal(modalElement) ? modalElement.querySelector('.mc-confirm-btns button:first-child') as HTMLButtonElement : modalElement.querySelector('.mc-modal-footer button:first-child') as HTMLButtonElement;
}

function getButtonClose(modalElement: HTMLElement): HTMLButtonElement { // For normal modal only
    return modalElement.querySelector('.mc-modal-close') as HTMLButtonElement;
}

function isConfirmModal(modalElement: HTMLElement): boolean {
    return !!modalElement.querySelector('.mc-confirm');
}

function isButtonLoading(buttonElement: HTMLButtonElement): boolean {
    return !!buttonElement.querySelector('i.anticon-loading');
}
