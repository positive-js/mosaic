import { OverlayContainer } from '@angular/cdk/overlay';
import { NgModule } from '@angular/core';
import { ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { McButtonModule } from '@ptsecurity/mosaic/button';

import { ToastComponent } from './toast.component';
import { ToastModule } from './toast.module';
import { ToastService } from './toast.service';


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
        let fixture: ComponentFixture<ToastComponent>;

        beforeEach(() => {
            fixture = TestBed.createComponent();
        });
    });
});

@NgModule({
    imports: [ ToastModule, McButtonModule ]
})
class ToastTestModule { }
