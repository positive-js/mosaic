import { OverlayContainer } from '@angular/cdk/overlay';
import { TestBed, inject } from '@angular/core/testing';

import { McToastModule } from './toast.module';
import { McToastService } from './toast.service';


describe('ToastService', () => {
    let toastService: McToastService;
    let overlayContainer: OverlayContainer;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [McToastModule]
        })
        .compileComponents();
    });

    beforeEach(inject(
        [McToastService, OverlayContainer],
        (ts: McToastService, oc: OverlayContainer) => {
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
