import { Component, NgModule } from '@angular/core';
import { async, inject, TestBed } from '@angular/core/testing';
import { Platform } from '@ptsecurity/cdk/platform';
import { ComponentPortal, PortalModule } from '@ptsecurity/cdk/portal';
import { ViewportRuler } from '@ptsecurity/cdk/scrolling';

import { Overlay, OverlayContainer, OverlayModule, OverlayRef, OverlayConfig } from '../index';


describe('BlockScrollStrategy', () => {
    let platform: Platform;
    let viewport: ViewportRuler;
    let overlayRef: OverlayRef;
    let componentPortal: ComponentPortal<FocacciaMsg>;
    let forceScrollElement: HTMLElement;

    beforeEach(async(() => {
        // Ensure a clean state for every test.
        document.documentElement.classList.remove('cdk-global-scrollblock');

        TestBed.configureTestingModule({
            imports: [OverlayModule, PortalModule, OverlayTestModule]
        }).compileComponents();
    }));

    beforeEach(inject([Overlay, ViewportRuler, Platform],
        (overlay: Overlay, viewportRuler: ViewportRuler, _platform: Platform) => {
            let overlayConfig = new OverlayConfig({ scrollStrategy: overlay.scrollStrategies.block() }); //tslint:disable-line

            overlayRef = overlay.create(overlayConfig);
            componentPortal = new ComponentPortal(FocacciaMsg);

            viewport = viewportRuler;
            forceScrollElement = document.createElement('div');
            document.body.appendChild(forceScrollElement);
            forceScrollElement.style.width = '100px';
            forceScrollElement.style.height = '3000px';
            forceScrollElement.style.background = 'rebeccapurple';
            platform = _platform;
        }));

    afterEach(inject([OverlayContainer], (container: OverlayContainer) => {
        overlayRef.dispose();
        document.body.removeChild(forceScrollElement);
        window.scroll(0, 0);
        container.getContainerElement().parentNode!.removeChild(container.getContainerElement()); // tslint:disable-line
    }));

    it('should toggle scroll blocking along the y axis', skipIOS(() => {
        window.scroll(0, 100); // tslint:disable-line
        expect(viewport.getViewportScrollPosition().top)
            .toBe(100, 'Expected viewport to be scrollable initially.'); // tslint:disable-line

        window.scroll(0, 300); // tslint:disable-line
        expect(viewport.getViewportScrollPosition().top)
            .toBe(300, 'Expected user to be able to scroll after disabling.'); // tslint:disable-line
    }));


    it('should toggle scroll blocking along the x axis', skipIOS(() => {
        forceScrollElement.style.height = '100px';
        forceScrollElement.style.width = '3000px';

        window.scroll(100, 0); // tslint:disable-line
        expect(viewport.getViewportScrollPosition().left)
            .toBe(100, 'Expected viewport to be scrollable initially.'); // tslint:disable-line

        overlayRef.attach(componentPortal);
        expect(document.documentElement.style.left)
            .toBe('-100px', 'Expected <html> element to be offset by the previous scroll amount.');

        overlayRef.detach();
        expect(viewport.getViewportScrollPosition().left)
            .toBe(100, 'Expected old scroll position to have bee restored after disabling.'); // tslint:disable-line

        window.scroll(300, 0); // tslint:disable-line
        expect(viewport.getViewportScrollPosition().left)
            .toBe(300, 'Expected user to be able to scroll after disabling.'); // tslint:disable-line
    }));


    it('should toggle the `cdk-global-scrollblock` class', skipIOS(() => {
        expect(document.documentElement.classList).not.toContain('cdk-global-scrollblock');

        overlayRef.attach(componentPortal);
        expect(document.documentElement.classList).toContain('cdk-global-scrollblock');

        overlayRef.detach();
        expect(document.documentElement.classList).not.toContain('cdk-global-scrollblock');
    }));

    it('should restore any previously-set inline styles', skipIOS(() => {
        const root = document.documentElement;

        root.style.top = '13px';
        root.style.left = '37px';

        overlayRef.attach(componentPortal);

        expect(root.style.top).not.toBe('13px');
        expect(root.style.left).not.toBe('37px');

        overlayRef.detach();

        expect(root.style.top).toBe('13px');
        expect(root.style.left).toBe('37px');
    }));

    it(`should't do anything if the page isn't scrollable`, skipIOS(() => {
        forceScrollElement.style.display = 'none';
        overlayRef.attach(componentPortal);
        expect(document.documentElement.classList).not.toContain('cdk-global-scrollblock');
    }));


    it('should keep the content width', () => {
        forceScrollElement.style.width = '100px';

        const previousContentWidth = document.documentElement.getBoundingClientRect().width;

        overlayRef.attach(componentPortal);

        expect(document.documentElement.getBoundingClientRect().width).toBe(previousContentWidth);
    });

    it('should not clobber user-defined scroll-behavior', skipIOS(() => {
        const root = document.documentElement;
        const body = document.body;

        root.style['scrollBehavior'] = body.style['scrollBehavior'] = 'smooth'; // tslint:disable-line

        // Get the value via the style declaration in order to
        // handle browsers that don't support the property yet.
        const initialRootValue = root.style['scrollBehavior']; // tslint:disable-line
        const initialBodyValue = root.style['scrollBehavior']; // tslint:disable-line

        overlayRef.attach(componentPortal);
        overlayRef.detach();

        expect(root.style['scrollBehavior']).toBe(initialRootValue); // tslint:disable-line
        expect(body.style['scrollBehavior']).toBe(initialBodyValue); // tslint:disable-line

        // Avoid bleeding styles into other tests.
        root.style['scrollBehavior'] = body.style['scrollBehavior'] = ''; // tslint:disable-line
    }));

    /**
     * Skips the specified test, if it is being executed on iOS. This is necessary, because
     * programmatic scrolling inside the Karma iframe doesn't work on iOS, which renders these
     * tests unusable. For example, something as basic as the following won't work:
     * ```
     * window.scroll(0, 100);
     * expect(viewport.getViewportScrollPosition().top).toBe(100);
     * ```
     * @param spec Test to be executed or skipped.
     */
    function skipIOS(spec: Function) { // tslint:disable-line
        return () => {
            if (!platform.IOS) {
                spec();
            }
        };
    }

});


/** Simple component that we can attach to the overlay. */
@Component({ template: '<p>Focaccia</p>' })
class FocacciaMsg {
}


/** Test module to hold the component. */
@NgModule({
    imports: [OverlayModule, PortalModule],
    declarations: [FocacciaMsg],
    entryComponents: [FocacciaMsg]
})
class OverlayTestModule {
}
