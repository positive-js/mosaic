import { OverlayContainer } from '@angular/cdk/overlay';
import { NgModule } from '@angular/core';
import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';

import { ToastModule } from './toast.module';
import { ToastService } from './toast.service';
import { ToastPosition } from './toast.type';


const TICK_TIME = 1000;

describe('ToastService', () => {
    let toastService: ToastService;
    let overlayContainer: OverlayContainer;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ToastTestModule]
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
        it('should create one success toast', fakeAsync(() => {
            const toastRef = toastService.show({ severity: 'success', title: 'Success', content: 'Message Content' });
            tick(TICK_TIME);

            expect(toastService.componentsRef.indexOf(toastRef)).toBeGreaterThan(-1);
            expect(toastService.componentsRef.length).toBe(1);
        }));
    });
});

@NgModule({
    imports: [
        ToastModule.forRoot({
            position: ToastPosition.TOP_CENTER,
            duration: 5000,
            onTop: true
        })
    ]
})
class ToastTestModule { }
