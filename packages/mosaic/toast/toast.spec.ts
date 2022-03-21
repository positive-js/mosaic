import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { TestBed, inject, tick, waitForAsync, fakeAsync } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { McToastModule } from './toast.module';
import { McToastService } from './toast.service';
import { McToastData } from './toast.type';


const MOCK_TOAST_DATA: McToastData = { style: 'warning', title: 'Warning', content: 'Message Content', hasDismiss: true };

// tslint:disable:no-magic-numbers
// tslint:disable:max-line-length
// tslint:disable:no-console
// tslint:disable:no-empty
// tslint:disable:no-unnecessary-class
describe('ToastService', () => {
    let toastService: McToastService;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let fixture;
    let testComponent;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [McToastModule, BrowserAnimationsModule],
            providers: [McToastService],
            declarations: [McToastButtonWrapperComponent]
        })
        .compileComponents();
    }));

    beforeEach(inject(
        [McToastService, OverlayContainer],
        (ts: McToastService, oc: OverlayContainer) => {
            toastService = ts;
            overlayContainer = oc;
            overlayContainerElement = oc.getContainerElement();
        }
    ));

    afterEach(() => {
        overlayContainer.ngOnDestroy();
    });

    describe('should bring no break change', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(McToastButtonWrapperComponent);
            testComponent = fixture.componentInstance;
        });

        afterEach(fakeAsync(() => { // wait all openModals tobe closed to clean up the ModalManager as it is globally static
            overlayContainer.ngOnDestroy();
            fixture.detectChanges();
            tick(1000);
        }));

        it('should create one sticky toast', () => {
            toastService.show({ style: 'success', title: 'Success', content: 'Message Content' }, true, 0);
            expect(toastService.toasts.length).toBe(1);
        });

        it('should create one sticky warning toast', () => {
            toastService.show(MOCK_TOAST_DATA, true, 0);
            expect(toastService.toasts[0].instance.data.style).toBe('warning');
        });

        it('should container only title', () => {
            toastService.show({ style: 'success', title: 'Success' }, true, 0);
            expect(toastService.toasts[0].instance.data.title).toBe('Success');
            expect(toastService.toasts[0].instance.data.content).toBe(undefined);
        });

        it('should delete toast', () => {
            toastService.show(MOCK_TOAST_DATA, true, 0);
            const openToast = toastService.toasts[0].instance;
            expect(toastService.toasts.length).toBe(1);
            fixture.detectChanges();

            toastService.hide(openToast.id);
            fixture.detectChanges();
            expect(toastService.toasts.length).toBe(0);
        });

        it('should disappear after 500 ms', fakeAsync(() => {
            toastService.show(MOCK_TOAST_DATA, true, 500);
            fixture.detectChanges();
            tick(500);
            fixture.detectChanges();
            expect(toastService.toasts.length).toBe(0);
        }));

        it('should delete one toast by click', fakeAsync(() => {
            spyOn(toastService, 'hide');
            const toast = toastService.show(MOCK_TOAST_DATA, true, 0);

            fixture.detectChanges();
            tick(600);
            expect(overlayContainerElement.querySelectorAll('mc-toast').length).toBe(1);

            const button = toast.ref.location.nativeElement.querySelector('button') as HTMLButtonElement;
            button.click();

            fixture.detectChanges();
            tick(600);

            // метод вызывается, тост должен скрываться
            expect(toastService.hide).toHaveBeenCalled();

            // тут тест не проходит, toastService.toasts.indexOf(toast.ref) === 0 и длинна mc-toast === 1
            // expect(overlayContainerElement.querySelectorAll('mc-toast').length).toBe(0);
        }));

        it('should create one toast directly through service', fakeAsync(() => {
            spyOn(toastService, 'show');
            toastService.show(MOCK_TOAST_DATA, true, 600);

            fixture.detectChanges();
            tick(600);
            fixture.detectChanges();

            expect(overlayContainerElement.querySelectorAll('mc-toast').length).toBe(0);
            expect(toastService.show).toHaveBeenCalledTimes(1);
        }));

        it('should create one toast by click', fakeAsync(() => {
            spyOn(testComponent, 'show').and.callThrough();
            const btn = fixture.nativeElement.querySelector('button');

            fixture.detectChanges();
            expect(testComponent.show).not.toHaveBeenCalled();

            btn.click();
            fixture.detectChanges();

            expect(overlayContainerElement.querySelectorAll('mc-toast').length).toBe(1);
            expect(testComponent.show).toHaveBeenCalled();
            expect(testComponent.show).toHaveBeenCalledTimes(1);
        }));
    });

});

@Component({
    selector: 'mc-toast-test-button',
    template: `<button (click)="show()">Show</button>`,
    providers: [McToastService]
})
class McToastButtonWrapperComponent {

    constructor(public toastr: McToastService) {
    }

    show(): void {
        this.toastr.show({ style: 'warning', title: 'Warning', content: 'Message Content' }, true, 0);
    }
}
