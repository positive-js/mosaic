import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, EventEmitter, NgModule } from '@angular/core';
import { ComponentFixture, fakeAsync, inject, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { ENTER } from '@ptsecurity/cdk/keycodes';
import { McButtonModule } from '@ptsecurity/mosaic/button';
import { ThemePalette } from '@ptsecurity/mosaic/core';

import { McModalControlService } from './modal-control.service';
import { McModalRef } from './modal-ref.class';
import { McModalModule } from './modal.module';
import { McModalService } from './modal.service';


// tslint:disable:no-magic-numbers
// tslint:disable:max-line-length
// tslint:disable:no-console
// tslint:disable:no-empty
// tslint:disable:no-unnecessary-class
describe('McModal', () => {
    let modalService: McModalService;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [ ModalTestModule ]
        });

        TestBed.compileComponents();
    }));

    beforeEach(inject(
        [McModalService, OverlayContainer],
        (ms: McModalService, oc: OverlayContainer) => {
                modalService = ms;
                overlayContainer = oc;
                overlayContainerElement = oc.getContainerElement();
        }
    ));

    afterEach(() => {
        overlayContainer.ngOnDestroy();
    });

    describe('created by service', () => {
        let fixture: ComponentFixture<ModalByServiceComponent>;

        beforeEach(() => {
            fixture = TestBed.createComponent(ModalByServiceComponent);
        });

        afterEach(fakeAsync(() => { // wait all openModals tobe closed to clean up the ModalManager as it is globally static
            modalService.closeAll();
            fixture.detectChanges();
            tick(1000);
        }));

        it('should trigger both afterOpen/mcAfterOpen and have the correct openModals length', fakeAsync(() => {
            const spy = jasmine.createSpy('afterOpen spy');
            const mcAfterOpen = new EventEmitter<void>();
            const modalRef = modalService.create({ mcAfterOpen });

            modalRef.afterOpen.subscribe(spy);
            mcAfterOpen.subscribe(spy);

            fixture.detectChanges();
            expect(spy).not.toHaveBeenCalled();

            tick(600);
            expect(spy).toHaveBeenCalledTimes(2);
            expect(modalService.openModals.indexOf(modalRef)).toBeGreaterThan(-1);
            expect(modalService.openModals.length).toBe(1);
        }));

        it('should fire onClick events', fakeAsync(() => {
            const spy = jasmine.createSpy('mcFooter onClick spy');
            const onClickEmitter = new EventEmitter<void>();

            onClickEmitter.subscribe(spy);

            modalService.create({
                mcContent: TestModalContentComponent,
                mcFooter: [
                    {
                        label: 'Test label',
                        type: 'primary',
                        onClick: () => {
                            onClickEmitter.emit();
                        }
                    }
                ]
            });

            fixture.detectChanges();
            tick(600);
            expect(spy).not.toHaveBeenCalled();

            const button = overlayContainerElement.querySelector('button.mc-primary') as HTMLButtonElement;

            button.click();

            fixture.detectChanges();
            expect(spy).toHaveBeenCalled();
        }));

        it('should trigger both afterClose/mcAfterClose and have the correct openModals length', fakeAsync(() => {
            const spy = jasmine.createSpy('afterClose spy');
            const mcAfterClose = new EventEmitter<void>();
            const modalRef = modalService.create({ mcAfterClose });

            modalRef.afterClose.subscribe(spy);
            mcAfterClose.subscribe(spy);

            fixture.detectChanges();
            tick(600);
            modalRef.close();
            fixture.detectChanges();
            expect(spy).not.toHaveBeenCalled();

            tick(600);
            expect(spy).toHaveBeenCalledTimes(2);
            expect(modalService.openModals.indexOf(modalRef)).toBe(-1);
            expect(modalService.openModals.length).toBe(0);
        }));

        it('should return/receive with/without result data', fakeAsync(() => {
            const spy = jasmine.createSpy('afterClose without result spy');
            const modalRef = modalService.success();

            modalRef.afterClose.subscribe(spy);
            fixture.detectChanges();
            tick(600);
            modalRef.destroy();
            expect(spy).not.toHaveBeenCalled();
            tick(600);
            expect(spy).toHaveBeenCalledWith(undefined);
        }));

        it('should return/receive with result data', fakeAsync(() => {
            const result = { data: 'Fake Error' };
            const spy = jasmine.createSpy('afterClose with result spy');
            const modalRef = modalService.delete();

            fixture.detectChanges();
            tick(600);
            modalRef.destroy(result);
            modalRef.afterClose.subscribe(spy);
            expect(spy).not.toHaveBeenCalled();
            tick(600);
            expect(spy).toHaveBeenCalledWith(result);
        }));

        it('should close all opened modals (include non-service modals)', fakeAsync(() => {
            const spy = jasmine.createSpy('afterAllClose spy');
            const modalMethods = [ 'create', 'delete', 'success' ];
            const uniqueId = (name: string) => `__${name}_ID_SUFFIX__`;
            const queryOverlayElement = (name: string) => overlayContainerElement.querySelector(`.${uniqueId(name)}`) as HTMLElement;

            modalService.afterAllClose.subscribe(spy);

            fixture.componentInstance.nonServiceModalVisible = true; // Show non-service modal
            modalMethods.forEach((method) => modalService[method]({ mcWrapClassName: uniqueId(method) })); // Service modals

            fixture.detectChanges();
            tick(600);
            // Cover non-service modal for later checking
            (modalMethods.concat('NON_SERVICE')).forEach((method) => {
                expect(queryOverlayElement(method).style.display).not.toBe('none');
            });
            expect(modalService.openModals.length).toBe(4);

            modalService.closeAll();
            fixture.detectChanges();
            expect(spy).not.toHaveBeenCalled();
            tick(600);
            expect(spy).toHaveBeenCalled();
            expect(modalService.openModals.length).toBe(0);
        }));

        it('should modal not be registered twice', fakeAsync(() => {
            const modalRef = modalService.create();

            fixture.detectChanges();
            (modalService as any).modalControl.registerModal(modalRef);
            tick(600);
            expect(modalService.openModals.length).toBe(1);
        }));

        it('should trigger nzOnOk/nzOnCancel', () => {
            const spyOk = jasmine.createSpy('ok spy');
            const spyCancel = jasmine.createSpy('cancel spy');
            const modalRef: McModalRef = modalService.create({
                mcOnOk: spyOk,
                mcOnCancel: spyCancel
            });

            fixture.detectChanges();

            modalRef.triggerOk();
            expect(spyOk).toHaveBeenCalled();

            modalRef.triggerCancel();
            expect(spyCancel).toHaveBeenCalled();
        });

        it('should process loading flag', fakeAsync(() => {
            const isLoading = true;
            const modalRef = modalService.create({
                mcFooter: [
                    {
                        label: 'button 1',
                        type: 'primary',
                        loading: () => isLoading
                    }
                ]
            });

            fixture.detectChanges();
            tick(600);

            expect(modalRef.getElement().querySelectorAll('.mc-progress').length).toBe(1);
        }));

        it('should process show flag', fakeAsync(() => {
            const isShown = false;
            const modalRef = modalService.create({
                mcFooter: [
                    {
                        label: 'button 1',
                        type: ThemePalette.Primary,
                        show: () => isShown
                    }
                ]
            });

            fixture.detectChanges();
            tick(600);

            expect(modalRef.getElement().querySelectorAll('.mc-primary').length).toBe(0);
        }));

        it('should process disable flag', fakeAsync(() => {
            const isDisabled = true;
            const modalRef = modalService.create({
                mcFooter: [
                    {
                        label: 'button 1',
                        type: ThemePalette.Primary,
                        disabled: () => isDisabled
                    }
                ]
            });

            fixture.detectChanges();
            tick(600);

            expect(modalRef.getElement().querySelectorAll('[disabled]').length).toBe(1);
        }));

        it('should called function on hotkey ctrl+enter. mcFooter is array ', fakeAsync(() => {
            const spyOk = jasmine.createSpy('ok spy');
            const modalRef = modalService.create({
                mcContent: TestModalContentComponent,
                mcFooter: [
                    {
                        label: 'Test label',
                        type: 'primary',
                        mcModalMainAction: true,
                        onClick: spyOk
                    }
                ]
            });
            fixture.detectChanges();
            tick(600);

            const event = document.createEvent('KeyboardEvent') as any;
            event.initKeyboardEvent('keydown', true, true, window, 0, 0, 0, '', false);

            Object.defineProperties(event, {
                keyCode: { get: () => ENTER },
                ctrlKey: { get: () => true }
            });

            modalRef.getElement().dispatchEvent(event);

            fixture.detectChanges();
            tick(600);
            expect(spyOk).toHaveBeenCalled();
        }));

        it('should called function on hotkey ctrl+enter. modal type is confirm ', () => {
            const spyOk = jasmine.createSpy('ok spy');
            const modalRef = modalService.success({
                mcContent   : 'Сохранить сделанные изменения?',
                mcOkText    : 'Сохранить',
                mcCancelText: 'Отмена',
                mcOnOk      : spyOk
            });
            fixture.detectChanges();

            const event = document.createEvent('KeyboardEvent') as any;
            event.initKeyboardEvent('keydown', true, true, window, 0, 0, 0, '', false);

            Object.defineProperties(event, {
                keyCode: { get: () => ENTER },
                ctrlKey: { get: () => true }
            });

            modalRef.getElement().dispatchEvent(event);

            fixture.detectChanges();
            expect(spyOk).toHaveBeenCalled();
        });

        it('should show the footer, when mcFooter is specified', fakeAsync(() => {
            const modalRef = modalService.create({
                mcFooter: [
                    {
                        label: 'button 1',
                        type: 'primary'
                    }
                ]
            });

            fixture.detectChanges();
            tick(600);

            expect(modalRef.getElement().querySelectorAll('.mc-modal-footer').length).toBe(1);
        }));

        it('should show the footer, when mcOkText is specified', fakeAsync(() => {
            const modalRef = modalService.create({
                mcOkText: 'OK'
            });

            fixture.detectChanges();
            tick(600);

            expect(modalRef.getElement().querySelectorAll('.mc-modal-footer').length).toBe(1);
        }));

        it('should show the footer, when mcCancelText is specified', fakeAsync(() => {
            const modalRef = modalService.create({
                mcCancelText: 'OK'
            });

            fixture.detectChanges();
            tick(600);

            expect(modalRef.getElement().querySelectorAll('.mc-modal-footer').length).toBe(1);
        }));

        it('should not show the footer, when mcOkText, mcOkCancel and mcFooter are not specified', fakeAsync(() => {
            const modalRef = modalService.create();

            fixture.detectChanges();
            tick(600);

            expect(modalRef.getElement().querySelectorAll('.mc-modal-footer').length).toBe(0);
        }));

    });
});


// -------------------------------------------
// | Testing Components
// -------------------------------------------

@Component({
    template: `Modal Content`
})
class TestModalContentComponent { }

@Component({
    selector: 'mc-modal-by-service',
    template: `
        <mc-modal [(mcVisible)]="nonServiceModalVisible" mcWrapClassName="__NON_SERVICE_ID_SUFFIX__"></mc-modal>
    `,
    // Testing for service with parent service
    providers: [ McModalControlService ]
})
class ModalByServiceComponent {
    nonServiceModalVisible = false;

    // @ts-ignore
    constructor(modalControlService: McModalControlService) {}
}


const TEST_DIRECTIVES = [
    ModalByServiceComponent,
    TestModalContentComponent
];

@NgModule({
    imports: [ McModalModule, McButtonModule ],
    exports: TEST_DIRECTIVES,
    declarations: TEST_DIRECTIVES,
    entryComponents: [
        ModalByServiceComponent,
        TestModalContentComponent
    ]
})
class ModalTestModule { }
