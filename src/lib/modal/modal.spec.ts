import { Component, DebugElement, ElementRef, EventEmitter, Input, NgModule } from '@angular/core';
import { async, ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { OverlayContainer } from '@ptsecurity/cdk/overlay';
import { McMeasureScrollbarService } from '@ptsecurity/mosaic/core';

import { CssUnitPipe } from './css-unit.pipe';
import { McModalControlService } from './modal-control.service';
import { McModalRef } from './modal-ref.class';
import { McModalModule } from './modal.module';
import { McModalService } from './modal.service';


// tslint:disable:no-magic-numbers
// tslint:disable:max-line-length
// tslint:disable:no-console
// tslint:disable:no-unnecessary-class
describe('McModal', () => {
    let modalService: McModalService;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [ ModalTestModule ],
            providers: [ McMeasureScrollbarService ]
        });

        TestBed.compileComponents();
    }));

    beforeEach(inject([ McModalService, OverlayContainer ],
        (ms: McModalService, oc: OverlayContainer) => {
        modalService = ms;
        overlayContainer = oc;
        overlayContainerElement = oc.getContainerElement();
    }));

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
    });
});


// -------------------------------------------
// | Testing Components
// -------------------------------------------

@Component({
    template: `<div [style.width]="100 | toCssUnit" [style.height]="'100px' | toCssUnit" [style.top]="100 | toCssUnit:'pt'"></div>`
})
class TestCssUnitPipeComponent { }


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
    ModalByServiceComponent
];

@NgModule({
    imports: [ McModalModule ],
    exports: TEST_DIRECTIVES,
    declarations: TEST_DIRECTIVES,
    entryComponents: [
        ModalByServiceComponent
    ]
})
class ModalTestModule { }
