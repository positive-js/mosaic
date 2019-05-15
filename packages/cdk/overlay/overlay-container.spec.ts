import { Component, NgModule, ViewChild, ViewContainerRef } from '@angular/core';
import { async, inject, TestBed } from '@angular/core/testing';
import { PortalModule, CdkPortal } from '@ptsecurity/cdk/portal';

import { Overlay, OverlayContainer, OverlayModule } from './index';


describe('OverlayContainer', () => {
    let overlay: Overlay;
    let overlayContainer: OverlayContainer;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [OverlayTestModule]
        }).compileComponents();
    }));

    beforeEach(inject([Overlay, OverlayContainer], (o: Overlay, oc: OverlayContainer) => {
        overlay = o;
        overlayContainer = oc;
    }));

    afterEach(() => {
        overlayContainer.ngOnDestroy();
    });

    it('should remove the overlay container element from the DOM on destruction', () => {
        const fixture = TestBed.createComponent(TestComponentWithTemplatePortals);

        const overlayRef = overlay.create();
        overlayRef.attach(fixture.componentInstance.templatePortal);
        fixture.detectChanges();

        expect(document.querySelector('.cdk-overlay-container'))
            .not.toBeNull('Expected the overlay container to be in the DOM after opening an overlay');

        // Manually call `ngOnDestroy` because there is no way to force Angular to destroy an
        // injectable in a unit test.
        overlayContainer.ngOnDestroy();

        expect(document.querySelector('.cdk-overlay-container'))
            .toBeNull('Expected the overlay container *not* to be in the DOM after destruction');
    });

    it('should add and remove css classes from the container element', () => {
        overlayContainer.getContainerElement().classList.add('commander-shepard');

        const containerElement = document.querySelector('.cdk-overlay-container')!; // tslint:disable-line
        expect(containerElement.classList.contains('commander-shepard'))
            .toBe(true, 'Expected the overlay container to have class "commander-shepard"');

        overlayContainer.getContainerElement().classList.remove('commander-shepard');

        expect(containerElement.classList.contains('commander-shepard'))
            .toBe(false, 'Expected the overlay container not to have class "commander-shepard"');
    });
});

/** Test-bed component that contains a TempatePortal and an ElementRef. */
@Component({
    template: `
        <ng-template cdk-portal>Cake</ng-template>`,
    providers: [Overlay]
})
class TestComponentWithTemplatePortals {
    @ViewChild(CdkPortal) templatePortal: CdkPortal;

    constructor(public viewContainerRef: ViewContainerRef) {
    }
}

@NgModule({
    imports: [OverlayModule, PortalModule],
    declarations: [TestComponentWithTemplatePortals]
})
class OverlayTestModule {
}
