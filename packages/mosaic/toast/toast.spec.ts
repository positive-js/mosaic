import { OverlayContainer } from '@angular/cdk/overlay';
import { TestBed, inject } from '@angular/core/testing';

import { McToastModule } from './toast.module';
import { McToastService } from './toast.service';


describe('ToastService', () => {
    let toastService: McToastService;
    let overlayContainer: OverlayContainer;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [McToastModule],
            providers: [McToastService]
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

    describe('should bring no break change', () => {
        it('should create one sticky toast', () => {
            toastService.show({ style: 'success', title: 'Success', content: 'Message Content' }, true, 0);
            expect(toastService.toasts.length).toBe(1);
        });

        it('should create one sticky warning toast', () => {
            toastService.show({ style: 'warning', title: 'Warning', content: 'Message Content' }, true, 0);
            expect(toastService.toasts[0].instance.data.style).toBe('warning');
        });
    });

});
