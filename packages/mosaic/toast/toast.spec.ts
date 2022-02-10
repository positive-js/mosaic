import { OverlayContainer } from '@angular/cdk/overlay';
import { TestBed, inject } from '@angular/core/testing';

import { ToastModule } from './toast.module';
import { ToastService } from './toast.service';


describe('ToastService', () => {
    let toastService: ToastService;
    let overlayContainer: OverlayContainer;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ToastModule]
        })
        .compileComponents();
    });

    beforeEach(inject(
        [ToastService, OverlayContainer],
        (ts: ToastService, oc: OverlayContainer) => {
            toastService = ts;
            overlayContainer = oc;
        }
    ));

    afterEach(() => {
        overlayContainer.ngOnDestroy();
    });

    describe('created by service', () => {
        it('should create one success toast', () => {
            const { id } = toastService.show({ style: 'success', title: 'Success', content: 'Message Content' });

            expect(toastService.toasts.length).toBe(1);

            toastService.hide(id);

            expect(toastService.toasts.length).toBe(0);
        });
    });
});
