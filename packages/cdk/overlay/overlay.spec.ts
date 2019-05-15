import {
    Component,
    NgModule,
    ViewChild,
    ViewContainerRef,
    ErrorHandler,
    Injectable,
    EventEmitter
} from '@angular/core';
import { async, fakeAsync, tick, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { Direction, Directionality } from '@ptsecurity/cdk/bidi';
import {
    ComponentPortal,
    PortalModule,
    TemplatePortal,
    CdkPortal
} from '@ptsecurity/cdk/portal';

import {
    Overlay,
    OverlayContainer,
    OverlayModule,
    OverlayRef,
    OverlayConfig,
    IPositionStrategy,
    IScrollStrategy
} from './index';


describe('Overlay', () => {
    let overlay: Overlay;
    let componentPortal: ComponentPortal<PizzaMsg>;
    let templatePortal: TemplatePortal;
    let overlayContainerElement: HTMLElement;
    let overlayContainer: OverlayContainer;
    let viewContainerFixture: ComponentFixture<TestComponentWithTemplatePortals>;
    let dir: Direction;

    beforeEach(async(() => {
        dir = 'ltr';
        TestBed.configureTestingModule({
            imports: [OverlayModule, PortalModule, OverlayTestModule],
            providers: [{
                provide: Directionality,
                useFactory: () => {
                    const fakeDirectionality = {};
                    Object.defineProperty(fakeDirectionality, 'value', { get: () => dir });

                    return fakeDirectionality;
                }
            }]
        }).compileComponents();
    }));

    beforeEach(inject([Overlay, OverlayContainer], (o: Overlay, oc: OverlayContainer) => {
        overlay = o;
        overlayContainer = oc;
        overlayContainerElement = oc.getContainerElement();

        let fixture = TestBed.createComponent(TestComponentWithTemplatePortals); // tslint:disable-line
        fixture.detectChanges();
        templatePortal = fixture.componentInstance.templatePortal;
        componentPortal = new ComponentPortal(PizzaMsg, fixture.componentInstance.viewContainerRef);
        viewContainerFixture = fixture;
    }));

    afterEach(() => {
        overlayContainer.ngOnDestroy();
    });

    it('should load a component into an overlay', () => {
        const overlayRef = overlay.create();
        overlayRef.attach(componentPortal);

        expect(overlayContainerElement.textContent).toContain('Pizza');

        overlayRef.dispose();
        expect(overlayContainerElement.childNodes.length).toBe(0);
        expect(overlayContainerElement.textContent).toBe('');
    });

    it('should load a template portal into an overlay', () => {
        const overlayRef = overlay.create();
        overlayRef.attach(templatePortal);

        expect(overlayContainerElement.textContent).toContain('Cake');

        overlayRef.dispose();
        expect(overlayContainerElement.childNodes.length).toBe(0);
        expect(overlayContainerElement.textContent).toBe('');
    });

    it('should disable pointer events of the pane element if detached', () => {
        const overlayRef = overlay.create();
        const paneElement = overlayRef.overlayElement;

        overlayRef.attach(componentPortal);
        viewContainerFixture.detectChanges();

        expect(paneElement.childNodes.length).not.toBe(0);
        expect(paneElement.style.pointerEvents)
            .toBe('auto', 'Expected the overlay pane to enable pointerEvents when attached.');

        overlayRef.detach();

        expect(paneElement.childNodes.length).toBe(0);
        expect(paneElement.style.pointerEvents)
            .toBe('none', 'Expected the overlay pane to disable pointerEvents when detached.');
    });

    it('should open multiple overlays', () => {
        const pizzaOverlayRef = overlay.create();
        pizzaOverlayRef.attach(componentPortal);

        const cakeOverlayRef = overlay.create();
        cakeOverlayRef.attach(templatePortal);

        expect(overlayContainerElement.childNodes.length).toBe(2); // tslint:disable-line
        expect(overlayContainerElement.textContent).toContain('Pizza');
        expect(overlayContainerElement.textContent).toContain('Cake');

        pizzaOverlayRef.dispose();
        expect(overlayContainerElement.childNodes.length).toBe(1);
        expect(overlayContainerElement.textContent).toContain('Cake');

        cakeOverlayRef.dispose();
        expect(overlayContainerElement.childNodes.length).toBe(0);
        expect(overlayContainerElement.textContent).toBe('');
    });

    it('should ensure that the most-recently-attached overlay is on top', (() => {
        let pizzaOverlayRef = overlay.create();
        const cakeOverlayRef = overlay.create();

        pizzaOverlayRef.attach(componentPortal);
        cakeOverlayRef.attach(templatePortal);

        expect(pizzaOverlayRef.hostElement.nextSibling)
            .toBeTruthy('Expected pizza to be on the bottom.');
        expect(cakeOverlayRef.hostElement.nextSibling)
            .toBeFalsy('Expected cake to be on top.');

        pizzaOverlayRef.dispose();
        cakeOverlayRef.detach();

        pizzaOverlayRef = overlay.create();
        pizzaOverlayRef.attach(componentPortal);
        cakeOverlayRef.attach(templatePortal);

        expect(pizzaOverlayRef.hostElement.nextSibling)
            .toBeTruthy('Expected pizza to still be on the bottom.');
        expect(cakeOverlayRef.hostElement.nextSibling)
            .toBeFalsy('Expected cake to still be on top.');
    }));

    it('should take the default direction from the global Directionality', () => {
        dir = 'rtl';
        const overlayRef = overlay.create();

        overlayRef.attach(componentPortal);
        expect(overlayRef.hostElement.getAttribute('dir')).toBe('rtl');
    });

    it('should set the direction', () => {
        const config = new OverlayConfig({ direction: 'rtl' });
        const overlayRef = overlay.create(config);

        overlayRef.attach(componentPortal);

        expect(overlayRef.hostElement.getAttribute('dir')).toEqual('rtl');
    });

    it('should emit when an overlay is attached', () => {
        const overlayRef = overlay.create();
        const spy = jasmine.createSpy('attachments spy');

        overlayRef.attachments().subscribe(spy);
        overlayRef.attach(componentPortal);

        expect(spy).toHaveBeenCalled();
    });

    it('should emit the attachment event after everything is added to the DOM', () => {
        const config = new OverlayConfig({ hasBackdrop: true });
        const overlayRef = overlay.create(config);

        overlayRef.attachments().subscribe(() => {
            expect(overlayContainerElement.querySelector('pizza'))
                .toBeTruthy('Expected the overlay to have been attached.');

            expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop'))
                .toBeTruthy('Expected the backdrop to have been attached.');
        });

        overlayRef.attach(componentPortal);
    });

    it('should emit when an overlay is detached', () => {
        const overlayRef = overlay.create();
        const spy = jasmine.createSpy('detachments spy');

        overlayRef.detachments().subscribe(spy);
        overlayRef.attach(componentPortal);
        overlayRef.detach();

        expect(spy).toHaveBeenCalled();
    });

    it('should not emit to the detach stream if the overlay has not been attached', () => {
        const overlayRef = overlay.create();
        const spy = jasmine.createSpy('detachments spy');

        overlayRef.detachments().subscribe(spy);
        overlayRef.detach();

        expect(spy).not.toHaveBeenCalled();
    });

    it('should not emit to the detach stream on dispose if the overlay was not attached', () => {
        const overlayRef = overlay.create();
        const spy = jasmine.createSpy('detachments spy');

        overlayRef.detachments().subscribe(spy);
        overlayRef.dispose();

        expect(spy).not.toHaveBeenCalled();
    });

    it('should emit the detachment event after the overlay is removed from the DOM', () => {
        const overlayRef = overlay.create();

        overlayRef.detachments().subscribe(() => {
            expect(overlayContainerElement.querySelector('pizza'))
                .toBeFalsy('Expected the overlay to have been detached.');
        });

        overlayRef.attach(componentPortal);
        overlayRef.detach();
    });

    it('should emit and complete the observables when an overlay is disposed', () => {
        const overlayRef = overlay.create();
        const disposeSpy = jasmine.createSpy('dispose spy');
        const attachCompleteSpy = jasmine.createSpy('attachCompleteSpy spy');
        const detachCompleteSpy = jasmine.createSpy('detachCompleteSpy spy');

        overlayRef.attachments().subscribe(undefined, undefined, attachCompleteSpy);
        overlayRef.detachments().subscribe(disposeSpy, undefined, detachCompleteSpy);

        overlayRef.attach(componentPortal);
        overlayRef.dispose();

        expect(disposeSpy).toHaveBeenCalled();
        expect(attachCompleteSpy).toHaveBeenCalled();
        expect(detachCompleteSpy).toHaveBeenCalled();
    });

    it('should complete the attachment observable before the detachment one', () => {
        const overlayRef = overlay.create();
        const callbackOrder: string[] = [];

        overlayRef.attachments().subscribe(undefined, undefined, () => callbackOrder.push('attach'));
        overlayRef.detachments().subscribe(undefined, undefined, () => callbackOrder.push('detach'));

        overlayRef.attach(componentPortal);
        overlayRef.dispose();

        expect(callbackOrder).toEqual(['attach', 'detach']);
    });

    it('should default to the ltr direction', () => {
        const overlayRef = overlay.create();
        expect(overlayRef.getConfig().direction).toBe('ltr');
    });

    it('should skip undefined values when applying the defaults', () => {
        const overlayRef = overlay.create({ direction: undefined });
        expect(overlayRef.getConfig().direction).toBe('ltr');
    });

    it('should clear out all DOM element references on dispose', fakeAsync(() => {
        const overlayRef = overlay.create({ hasBackdrop: true });
        overlayRef.attach(componentPortal);

        expect(overlayRef.hostElement).toBeTruthy('Expected overlay host to be defined.');
        expect(overlayRef.overlayElement).toBeTruthy('Expected overlay element to be defined.');
        expect(overlayRef.backdropElement).toBeTruthy('Expected backdrop element to be defined.');

        overlayRef.dispose();
        tick(500); // tslint:disable-line

        expect(overlayRef.hostElement).toBeFalsy('Expected overlay host not to be referenced.');
        expect(overlayRef.overlayElement).toBeFalsy('Expected overlay element not to be referenced.');
        expect(overlayRef.backdropElement).toBeFalsy('Expected backdrop element not to be referenced.');
    }));

    it('should be able to use the `Overlay` provider during app initialization', () => {
        /** Dummy provider that depends on `Overlay`. */
        @Injectable()
        class CustomErrorHandler extends ErrorHandler {
            constructor(private _overlay: Overlay) {
                super();
            }

            handleError(error: any) {
                const overlayRef = this._overlay.create({ hasBackdrop: !!error });
                overlayRef.dispose();
            }
        }

        overlayContainer.ngOnDestroy();

        TestBed
            .resetTestingModule()
            .configureTestingModule({
                imports: [OverlayModule],
                providers: [
                    CustomErrorHandler,
                    { provide: ErrorHandler, useExisting: CustomErrorHandler }
                ]
            });

        expect(() => TestBed.compileComponents()).not.toThrow();
    });

    // it('should keep the direction in sync with the passed in Directionality', () => {
    //     const customDirectionality = { value: 'rtl', change: new EventEmitter() };
    //     const overlayRef = overlay.create({ direction: customDirectionality as Directionality });
    //
    //     expect(overlayRef.getDirection()).toBe('rtl');
    //     customDirectionality.value = 'ltr';
    //     expect(overlayRef.getDirection()).toBe('ltr');
    // });

    describe('positioning', () => {
        let config: OverlayConfig;

        beforeEach(() => {
            config = new OverlayConfig();
        });

        it('should apply the positioning strategy', fakeAsync(() => {
            config.positionStrategy = new FakePositionStrategy();

            overlay.create(config).attach(componentPortal);
            viewContainerFixture.detectChanges();
            tick();

            expect(overlayContainerElement.querySelectorAll('.fake-positioned').length).toBe(1);
        }));

        it('should not apply the position if it detaches before the zone stabilizes', fakeAsync(() => {
            config.positionStrategy = new FakePositionStrategy();

            const overlayRef = overlay.create(config);

            spyOn(config.positionStrategy, 'apply');

            overlayRef.attach(componentPortal);
            overlayRef.detach();
            viewContainerFixture.detectChanges();
            tick();

            // tslint:disable-next-line
            expect(config.positionStrategy.apply).not.toHaveBeenCalled();
        }));

    });

    describe('size', () => {
        let config: OverlayConfig;

        beforeEach(() => {
            config = new OverlayConfig();
        });

        it('should apply the width set in the config', () => {
            config.width = 500; // tslint:disable-line

            const overlayRef = overlay.create(config);

            overlayRef.attach(componentPortal);
            expect(overlayRef.overlayElement.style.width).toEqual('500px');
        });

        it('should support using other units if a string width is provided', () => {
            config.width = '200%';

            const overlayRef = overlay.create(config);

            overlayRef.attach(componentPortal);
            expect(overlayRef.overlayElement.style.width).toEqual('200%');
        });

        it('should apply the height set in the config', () => {
            config.height = 500; // tslint:disable-line

            const overlayRef = overlay.create(config);

            overlayRef.attach(componentPortal);
            expect(overlayRef.overlayElement.style.height).toEqual('500px');
        });

        it('should support using other units if a string height is provided', () => {
            config.height = '100vh';

            const overlayRef = overlay.create(config);

            overlayRef.attach(componentPortal);
            expect(overlayRef.overlayElement.style.height).toEqual('100vh');
        });

        it('should apply the min width set in the config', () => {
            config.minWidth = 200; // tslint:disable-line

            const overlayRef = overlay.create(config);

            overlayRef.attach(componentPortal);
            expect(overlayRef.overlayElement.style.minWidth).toEqual('200px');
        });


        it('should apply the min height set in the config', () => {
            config.minHeight = 500; // tslint:disable-line

            const overlayRef = overlay.create(config);

            overlayRef.attach(componentPortal);
            expect(overlayRef.overlayElement.style.minHeight).toEqual('500px');
        });

        it('should apply the max width set in the config', () => {
            config.maxWidth = 200; // tslint:disable-line

            const overlayRef = overlay.create(config);

            overlayRef.attach(componentPortal);
            expect(overlayRef.overlayElement.style.maxWidth).toEqual('200px');
        });


        it('should apply the max height set in the config', () => {
            config.maxHeight = 500; // tslint:disable-line

            const overlayRef = overlay.create(config);

            overlayRef.attach(componentPortal);
            expect(overlayRef.overlayElement.style.maxHeight).toEqual('500px');
        });

        it('should support zero widths and heights', () => {
            config.width = 0;
            config.height = 0;

            const overlayRef = overlay.create(config);

            overlayRef.attach(componentPortal);
            expect(overlayRef.overlayElement.style.width).toEqual('0px');
            expect(overlayRef.overlayElement.style.height).toEqual('0px');
        });
    });

    describe('backdrop', () => {
        let config: OverlayConfig;

        beforeEach(() => {
            config = new OverlayConfig();
            config.hasBackdrop = true;
        });

        it('should create and destroy an overlay backdrop', () => {
            const overlayRef = overlay.create(config);
            overlayRef.attach(componentPortal);

            viewContainerFixture.detectChanges();
            const backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
            expect(backdrop).toBeTruthy();
            expect(backdrop.classList).not.toContain('cdk-overlay-backdrop-showing');

            const backdropClickHandler = jasmine.createSpy('backdropClickHander');
            overlayRef.backdropClick().subscribe(backdropClickHandler);

            backdrop.click();
            expect(backdropClickHandler).toHaveBeenCalledWith(jasmine.any(MouseEvent));
        });

        it('should complete the backdrop click stream once the overlay is destroyed', () => {
            const overlayRef = overlay.create(config);

            overlayRef.attach(componentPortal);
            viewContainerFixture.detectChanges();

            const completeHandler = jasmine.createSpy('backdrop complete handler');

            overlayRef.backdropClick().subscribe(undefined, undefined, completeHandler);
            overlayRef.dispose();

            expect(completeHandler).toHaveBeenCalled();
        });

        it('should apply the default overlay backdrop class', () => {
            const overlayRef = overlay.create(config);
            overlayRef.attach(componentPortal);
            viewContainerFixture.detectChanges();

            const backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
            expect(backdrop.classList).toContain('cdk-overlay-dark-backdrop');
        });

        it('should apply a custom class to the backdrop', () => {
            config.backdropClass = 'cdk-overlay-transparent-backdrop';

            const overlayRef = overlay.create(config);
            overlayRef.attach(componentPortal);
            viewContainerFixture.detectChanges();

            const backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
            expect(backdrop.classList).toContain('cdk-overlay-transparent-backdrop');
        });

        it('should apply multiple custom classes to the overlay', () => {
            config.backdropClass = ['custom-class-1', 'custom-class-2'];

            const overlayRef = overlay.create(config);
            overlayRef.attach(componentPortal);
            viewContainerFixture.detectChanges();

            const backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
            expect(backdrop.classList).toContain('custom-class-1');
            expect(backdrop.classList).toContain('custom-class-2');
        });

        it('should disable the pointer events of a backdrop that is being removed', () => {
            const overlayRef = overlay.create(config);
            overlayRef.attach(componentPortal);

            viewContainerFixture.detectChanges();
            const backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;

            expect(backdrop.style.pointerEvents).toBeFalsy();

            overlayRef.detach();

            expect(backdrop.style.pointerEvents).toBe('none');
        });

        it('should insert the backdrop before the overlay host in the DOM order', () => {
            const overlayRef = overlay.create(config);

            overlayRef.attach(componentPortal);
            viewContainerFixture.detectChanges();

            const backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop');
            const host = overlayContainerElement.querySelector('.cdk-overlay-pane')!.parentElement!; // tslint:disable-line
            const children = Array.prototype.slice.call(overlayContainerElement.children);

            expect(children.indexOf(backdrop)).toBeGreaterThan(-1);
            expect(children.indexOf(host)).toBeGreaterThan(-1);
            expect(children.indexOf(backdrop))
                .toBeLessThan(children.indexOf(host), 'Expected backdrop to be before the host in the DOM');
        });

    });

    describe('panelClass', () => {
        it('should apply a custom overlay pane class', () => {
            const config = new OverlayConfig({ panelClass: 'custom-panel-class' });

            overlay.create(config).attach(componentPortal);
            viewContainerFixture.detectChanges();

            const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
            expect(pane.classList).toContain('custom-panel-class');
        });

        it('should be able to apply multiple classes', () => {
            const config = new OverlayConfig({ panelClass: ['custom-class-one', 'custom-class-two'] });

            overlay.create(config).attach(componentPortal);
            viewContainerFixture.detectChanges();

            const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

            expect(pane.classList).toContain('custom-class-one');
            expect(pane.classList).toContain('custom-class-two');
        });
    });

    describe('scroll strategy', () => {
        let fakeScrollStrategy: FakeScrollStrategy;
        let config: OverlayConfig;
        let overlayRef: OverlayRef;

        beforeEach(() => {
            fakeScrollStrategy = new FakeScrollStrategy();
            config = new OverlayConfig({ scrollStrategy: fakeScrollStrategy });
            overlayRef = overlay.create(config);
        });

        it('should attach the overlay ref to the scroll strategy', () => {
            expect(fakeScrollStrategy.overlayRef).toBe(overlayRef,
                'Expected scroll strategy to have been attached to the current overlay ref.');
        });

        it('should enable the scroll strategy when the overlay is attached', () => {
            overlayRef.attach(componentPortal);
            expect(fakeScrollStrategy.isEnabled).toBe(true, 'Expected scroll strategy to be enabled.');
        });

        it('should disable the scroll strategy once the overlay is detached', () => {
            overlayRef.attach(componentPortal);
            expect(fakeScrollStrategy.isEnabled).toBe(true, 'Expected scroll strategy to be enabled.');

            overlayRef.detach();
            expect(fakeScrollStrategy.isEnabled).toBe(false, 'Expected scroll strategy to be disabled.');
        });

        it('should disable the scroll strategy when the overlay is destroyed', () => {
            overlayRef.dispose();
            expect(fakeScrollStrategy.isEnabled).toBe(false, 'Expected scroll strategy to be disabled.');
        });
    });
});

/** Simple component for testing ComponentPortal. */
@Component({
    selector: 'pizza',
    template: '<p>Pizza</p>'
})
class PizzaMsg {
}


/** Test-bed component that contains a TempatePortal and an ElementRef. */
@Component({
    template: `
        <ng-template cdk-portal>Cake</ng-template>`
})
class TestComponentWithTemplatePortals {
    @ViewChild(CdkPortal) templatePortal: CdkPortal;

    constructor(public viewContainerRef: ViewContainerRef) {
    }
}

// Create a real (non-test) NgModule as a workaround for
// https://github.com/angular/angular/issues/10760
const TEST_COMPONENTS = [PizzaMsg, TestComponentWithTemplatePortals];

@NgModule({
    imports: [OverlayModule, PortalModule],
    exports: TEST_COMPONENTS,
    declarations: TEST_COMPONENTS,
    entryComponents: TEST_COMPONENTS
})
class OverlayTestModule {
}

class FakePositionStrategy implements IPositionStrategy {
    element: HTMLElement;

    apply(): void {
        this.element.classList.add('fake-positioned');
    }

    attach(overlayRef: OverlayRef) {
        this.element = overlayRef.overlayElement;
    }

    dispose() {
    } // tslint:disable-line
}


class FakeScrollStrategy implements IScrollStrategy {
    isEnabled = false;
    overlayRef: OverlayRef;

    attach(overlayRef: OverlayRef) {
        this.overlayRef = overlayRef;
    }

    enable() {
        this.isEnabled = true;
    }

    disable() {
        this.isEnabled = false;
    }
}
