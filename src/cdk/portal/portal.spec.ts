import { CommonModule } from '@angular/common';
import {
    NgModule,
    Component,
    ViewChild,
    ViewChildren,
    QueryList,
    ViewContainerRef,
    ComponentFactoryResolver,
    Optional,
    Injector,
    ApplicationRef,
    TemplateRef,
    ComponentRef
} from '@angular/core';
import { inject, ComponentFixture, TestBed } from '@angular/core/testing';

import { DomPortalOutlet } from './dom-portal-outlet';
import { Portal, ComponentPortal, TemplatePortal } from './portal';
import { CdkPortal, CdkPortalOutlet, PortalModule } from './portal-directives';


describe('Portals', () => {

    beforeEach(() => {
        TestBed
            .configureTestingModule({ imports: [PortalModule, PortalTestModule] })
            .compileComponents();
    });

    describe('CdkPortalOutlet', () => {
        let fixture: ComponentFixture<PortalTestApp>;

        beforeEach(() => {
            fixture = TestBed.createComponent(PortalTestApp);
        });

        it('should load a component into the portal', () => {
            // Set the selectedHost to be a ComponentPortal.
            const testAppComponent = fixture.componentInstance;
            const componentPortal = new ComponentPortal(PizzaMsg);
            const hostContainer = fixture.nativeElement.querySelector('.portal-container');

            testAppComponent.selectedPortal = componentPortal;
            fixture.detectChanges();

            // Expect that the content of the attached portal is present.
            expect(hostContainer.textContent).toContain('Pizza');
            expect(testAppComponent.portalOutlet.portal).toBe(componentPortal);
            expect(testAppComponent.portalOutlet.attachedRef instanceof ComponentRef).toBe(true);
            expect(testAppComponent.attachedSpy)
                .toHaveBeenCalledWith(testAppComponent.portalOutlet.attachedRef);
        });

        it('should load a template into the portal', () => {
            const testAppComponent = fixture.componentInstance;
            const hostContainer = fixture.nativeElement.querySelector('.portal-container');
            const templatePortal = new TemplatePortal(testAppComponent.templateRef, null!); // tslint:disable-line

            testAppComponent.selectedPortal = templatePortal;
            fixture.detectChanges();

            // Expect that the content of the attached portal is present and no context is projected
            expect(hostContainer.textContent).toContain('Banana');
            expect(testAppComponent.portalOutlet.portal).toBe(templatePortal);

            // We can't test whether it's an instance of an `EmbeddedViewRef` so
            // we verify that it's defined and that it's not a ComponentRef.
            expect(testAppComponent.portalOutlet.attachedRef instanceof ComponentRef).toBe(false);
            expect(testAppComponent.portalOutlet.attachedRef).toBeTruthy();
            expect(testAppComponent.attachedSpy)
                .toHaveBeenCalledWith(testAppComponent.portalOutlet.attachedRef);
        });

        it('should project template context bindings in the portal', () => {
            let testAppComponent = fixture.componentInstance; // tslint:disable-line
            let hostContainer = fixture.nativeElement.querySelector('.portal-container'); // tslint:disable-line

            // TemplatePortal without context:
            let templatePortal = new TemplatePortal(testAppComponent.templateRef, null!); // tslint:disable-line
            testAppComponent.selectedPortal = templatePortal;
            fixture.detectChanges();
            // Expect that the content of the attached portal is present and NO context is projected
            expect(hostContainer.textContent).toContain('Banana - !');

            // using TemplatePortal.attach method to set context
            testAppComponent.selectedPortal = undefined;
            fixture.detectChanges();
            templatePortal.attach(testAppComponent.portalOutlet, { $implicit: { status: 'rotten' } });
            fixture.detectChanges();
            // Expect that the content of the attached portal is present and context given via the
            // attach method is projected
            expect(hostContainer.textContent).toContain('Banana - rotten!');

            // using TemplatePortal constructor to set the context
            templatePortal =
                new TemplatePortal(testAppComponent.templateRef, null!, { $implicit: { status: 'fresh' } }); // tslint:disable-line
            testAppComponent.selectedPortal = templatePortal;
            fixture.detectChanges();
            // Expect that the content of the attached portal is present and context given via the
            // constructor is projected
            expect(hostContainer.textContent).toContain('Banana - fresh!');

            // using TemplatePortal constructor to set the context but also calling attach method with
            // context, the latter should take precedence:
            testAppComponent.selectedPortal = undefined;
            fixture.detectChanges();
            templatePortal.attach(testAppComponent.portalOutlet, { $implicit: { status: 'rotten' } });
            fixture.detectChanges();
            // Expect that the content of the attached portal is present and and context given via the
            // attach method is projected and get precedence over constructor context
            expect(hostContainer.textContent).toContain('Banana - rotten!');
        });

        it('should dispose the host when destroyed', () => {
            // Set the selectedHost to be a ComponentPortal.
            const testAppComponent = fixture.componentInstance;
            testAppComponent.selectedPortal = new ComponentPortal(PizzaMsg);

            fixture.detectChanges();
            expect(testAppComponent.selectedPortal.isAttached).toBe(true);

            fixture.destroy();
            expect(testAppComponent.selectedPortal.isAttached).toBe(false);
        });

        it('should load a component into the portal with a given injector', () => {
            // Create a custom injector for the component.
            const chocolateInjector = new ChocolateInjector(fixture.componentInstance.injector);

            // Set the selectedHost to be a ComponentPortal.
            const testAppComponent = fixture.componentInstance;
            testAppComponent.selectedPortal = new ComponentPortal(PizzaMsg, undefined, chocolateInjector);
            fixture.detectChanges();

            // Expect that the content of the attached portal is present.
            const hostContainer = fixture.nativeElement.querySelector('.portal-container');
            expect(hostContainer.textContent).toContain('Pizza');
            expect(hostContainer.textContent).toContain('Chocolate');
        });

        it('should load a <ng-template> portal', () => {
            const testAppComponent = fixture.componentInstance;

            // Detect changes initially so that the component's ViewChildren are resolved.
            fixture.detectChanges();

            // Set the selectedHost to be a TemplatePortal.
            testAppComponent.selectedPortal = testAppComponent.cakePortal;
            fixture.detectChanges();

            // Expect that the content of the attached portal is present.
            const hostContainer = fixture.nativeElement.querySelector('.portal-container');
            expect(hostContainer.textContent).toContain('Cake');
        });

        it('should load a <ng-template> portal with the `*` sugar', () => {
            const testAppComponent = fixture.componentInstance;

            // Detect changes initially so that the component's ViewChildren are resolved.
            fixture.detectChanges();

            // Set the selectedHost to be a TemplatePortal (with the `*` syntax).
            testAppComponent.selectedPortal = testAppComponent.piePortal;
            fixture.detectChanges();

            // Expect that the content of the attached portal is present.
            const hostContainer = fixture.nativeElement.querySelector('.portal-container');
            expect(hostContainer.textContent).toContain('Pie');
        });

        it('should load a <ng-template> portal with a binding', () => {
            const testAppComponent = fixture.componentInstance;

            // Detect changes initially so that the component's ViewChildren are resolved.
            fixture.detectChanges();

            // Set the selectedHost to be a TemplatePortal.
            testAppComponent.selectedPortal = testAppComponent.portalWithBinding;
            fixture.detectChanges();

            // Expect that the content of the attached portal is present.
            const hostContainer = fixture.nativeElement.querySelector('.portal-container');
            expect(hostContainer.textContent).toContain('Banana');

            // When updating the binding value.
            testAppComponent.fruit = 'Mango';
            fixture.detectChanges();

            // Expect the new value to be reflected in the rendered output.
            expect(hostContainer.textContent).toContain('Mango');
        });

        it('should load a <ng-template> portal with an inner template', () => {
            const testAppComponent = fixture.componentInstance;

            // Detect changes initially so that the component's ViewChildren are resolved.
            fixture.detectChanges();

            // Set the selectedHost to be a TemplatePortal.
            testAppComponent.selectedPortal = testAppComponent.portalWithTemplate;
            fixture.detectChanges();

            // Expect that the content of the attached portal is present.
            const hostContainer = fixture.nativeElement.querySelector('.portal-container');
            expect(hostContainer.textContent).toContain('Pineapple');

            // When updating the binding value.
            testAppComponent.fruits = ['Mangosteen'];
            fixture.detectChanges();

            // Expect the new value to be reflected in the rendered output.
            expect(hostContainer.textContent).toContain('Mangosteen');
        });

        it('should change the attached portal', () => {
            const testAppComponent = fixture.componentInstance;

            // Detect changes initially so that the component's ViewChildren are resolved.
            fixture.detectChanges();

            // Set the selectedHost to be a ComponentPortal.
            testAppComponent.selectedPortal = testAppComponent.piePortal;
            fixture.detectChanges();

            // Expect that the content of the attached portal is present.
            const hostContainer = fixture.nativeElement.querySelector('.portal-container');
            expect(hostContainer.textContent).toContain('Pie');

            testAppComponent.selectedPortal = new ComponentPortal(PizzaMsg);
            fixture.detectChanges();

            expect(hostContainer.textContent).toContain('Pizza');
        });

        it('should detach the portal when it is set to null', () => {
            const testAppComponent = fixture.componentInstance;
            testAppComponent.selectedPortal = new ComponentPortal(PizzaMsg);

            fixture.detectChanges();
            expect(testAppComponent.portalOutlet.hasAttached()).toBe(true);
            expect(testAppComponent.portalOutlet.portal).toBe(testAppComponent.selectedPortal);

            testAppComponent.selectedPortal = null!; // tslint:disable-line
            fixture.detectChanges();

            expect(testAppComponent.portalOutlet.hasAttached()).toBe(false);
            expect(testAppComponent.portalOutlet.portal).toBeNull();
        });

        it('should set the `portal` when attaching a component portal programmatically', () => {
            const testAppComponent = fixture.componentInstance;
            const portal = new ComponentPortal(PizzaMsg);

            testAppComponent.portalOutlet.attachComponentPortal(portal);

            expect(testAppComponent.portalOutlet.portal).toBe(portal);
        });

        it('should set the `portal` when attaching a template portal programmatically', () => {
            const testAppComponent = fixture.componentInstance;
            fixture.detectChanges();

            testAppComponent.portalOutlet.attachTemplatePortal(testAppComponent.cakePortal);

            expect(testAppComponent.portalOutlet.portal).toBe(testAppComponent.cakePortal);
        });

        it('should clear the portal reference on destroy', () => {
            const testAppComponent = fixture.componentInstance;

            testAppComponent.selectedPortal = new ComponentPortal(PizzaMsg);
            fixture.detectChanges();

            expect(testAppComponent.portalOutlet.portal).toBeTruthy();

            fixture.destroy();

            expect(testAppComponent.portalOutlet.portal).toBeNull();
        });

        it('should not clear programmatically-attached portals on init', () => {
            fixture.destroy();

            const unboundFixture = TestBed.createComponent(UnboundPortalTestApp);

            // Note: calling `detectChanges` here will cause a false positive.
            // What we're testing is attaching before the first CD cycle.
            unboundFixture.componentInstance.portalOutlet.attach(new ComponentPortal(PizzaMsg));
            unboundFixture.detectChanges();

            expect(unboundFixture.nativeElement.querySelector('.portal-container').textContent)
                .toContain('Pizza');
        });

        it('should be considered attached when attaching using `attach`', () => {
            expect(fixture.componentInstance.portalOutlet.hasAttached()).toBe(false);
            fixture.componentInstance.portalOutlet.attach(new ComponentPortal(PizzaMsg));
            expect(fixture.componentInstance.portalOutlet.hasAttached()).toBe(true);
        });

        it('should be considered attached when attaching using `attachComponentPortal`', () => {
            expect(fixture.componentInstance.portalOutlet.hasAttached()).toBe(false);
            fixture.componentInstance.portalOutlet.attachComponentPortal(new ComponentPortal(PizzaMsg));
            expect(fixture.componentInstance.portalOutlet.hasAttached()).toBe(true);
        });

        it('should be considered attached when attaching using `attachTemplatePortal`', () => {
            const instance = fixture.componentInstance;
            expect(instance.portalOutlet.hasAttached()).toBe(false);
            instance.portalOutlet.attachTemplatePortal(new TemplatePortal(instance.templateRef, null!)); // tslint:disable-line
            expect(instance.portalOutlet.hasAttached()).toBe(true);
        });

    });

    describe('DomPortalOutlet', () => {
        let componentFactoryResolver: ComponentFactoryResolver;
        let someViewContainerRef: ViewContainerRef;
        let someInjector: Injector;
        let someFixture: ComponentFixture<any>;
        let someDomElement: HTMLElement;
        let host: DomPortalOutlet;
        let injector: Injector;
        let appRef: ApplicationRef;

        let deps = [ComponentFactoryResolver, Injector, ApplicationRef]; // tslint:disable-line
        beforeEach(inject(deps, (dcl: ComponentFactoryResolver, i: Injector, ar: ApplicationRef) => {
            componentFactoryResolver = dcl;
            injector = i;
            appRef = ar;
        }));

        beforeEach(() => {
            someDomElement = document.createElement('div');
            host = new DomPortalOutlet(someDomElement, componentFactoryResolver, appRef, injector);

            someFixture = TestBed.createComponent(ArbitraryViewContainerRefComponent);
            someViewContainerRef = someFixture.componentInstance.viewContainerRef;
            someInjector = someFixture.componentInstance.injector;
        });

        it('should attach and detach a component portal', () => {
            const portal = new ComponentPortal(PizzaMsg, someViewContainerRef);

            const componentInstance: PizzaMsg = portal.attach(host).instance;

            expect(componentInstance instanceof PizzaMsg).toBe(true);
            expect(someDomElement.textContent).toContain('Pizza');

            host.detach();

            expect(someDomElement.innerHTML).toBe('');
        });

        it('should attach and detach a component portal with a given injector', () => {
            const fixture = TestBed.createComponent(ArbitraryViewContainerRefComponent);
            someViewContainerRef = fixture.componentInstance.viewContainerRef;
            someInjector = fixture.componentInstance.injector;

            const chocolateInjector = new ChocolateInjector(someInjector);
            const portal = new ComponentPortal(PizzaMsg, someViewContainerRef, chocolateInjector);

            const componentInstance: PizzaMsg = portal.attach(host).instance;
            fixture.detectChanges();

            expect(componentInstance instanceof PizzaMsg).toBe(true);
            expect(someDomElement.textContent).toContain('Pizza');
            expect(someDomElement.textContent).toContain('Chocolate');

            host.detach();

            expect(someDomElement.innerHTML).toBe('');
        });

        it('should attach and detach a template portal', () => {
            const fixture = TestBed.createComponent(PortalTestApp);
            fixture.detectChanges();

            fixture.componentInstance.cakePortal.attach(host);

            expect(someDomElement.textContent).toContain('Cake');
        });

        it('should render a template portal with an inner template', () => {
            const fixture = TestBed.createComponent(PortalTestApp);
            fixture.detectChanges();

            fixture.componentInstance.portalWithTemplate.attach(host);

            expect(someDomElement.textContent).toContain('Durian');
        });

        it('should attach and detach a template portal with a binding', () => {
            const fixture = TestBed.createComponent(PortalTestApp);

            const testAppComponent = fixture.componentInstance;

            // Detect changes initially so that the component's ViewChildren are resolved.
            fixture.detectChanges();

            // Attach the TemplatePortal.
            testAppComponent.portalWithBinding.attach(host, { $implicit: { status: 'fresh' } });
            fixture.detectChanges();

            // Now that the portal is attached, change detection has to happen again in order
            // for the bindings to update.
            fixture.detectChanges();

            // Expect that the content of the attached portal is present.
            expect(someDomElement.textContent).toContain('Banana - fresh');

            // When updating the binding value.
            testAppComponent.fruit = 'Mango';
            fixture.detectChanges();

            // Expect the new value to be reflected in the rendered output.
            expect(someDomElement.textContent).toContain('Mango');

            host.detach();
            expect(someDomElement.innerHTML).toBe('');
        });

        it('should change the attached portal', () => {
            const fixture = TestBed.createComponent(ArbitraryViewContainerRefComponent);
            someViewContainerRef = fixture.componentInstance.viewContainerRef;

            const appFixture = TestBed.createComponent(PortalTestApp);
            appFixture.detectChanges();

            appFixture.componentInstance.piePortal.attach(host);

            expect(someDomElement.textContent).toContain('Pie');

            host.detach();
            host.attach(new ComponentPortal(PizzaMsg, someViewContainerRef));

            expect(someDomElement.textContent).toContain('Pizza');
        });

        it('should attach and detach a component portal without a ViewContainerRef', () => {
            const portal = new ComponentPortal(PizzaMsg);

            const componentInstance: PizzaMsg = portal.attach(host).instance;

            expect(componentInstance instanceof PizzaMsg)
                .toBe(true, 'Expected a PizzaMsg component to be created');
            expect(someDomElement.textContent)
                .toContain('Pizza', 'Expected the static string "Pizza" in the DomPortalOutlet.');

            componentInstance.snack = new Chocolate();
            someFixture.detectChanges();
            expect(someDomElement.textContent)
                .toContain('Chocolate', 'Expected the bound string "Chocolate" in the DomPortalOutlet');

            host.detach();

            expect(someDomElement.innerHTML)
                .toBe('', 'Expected the DomPortalOutlet to be empty after detach');
        });

        it('should call the dispose function even if the host has no attached content', () => {
            const spy = jasmine.createSpy('host dispose spy');

            expect(host.hasAttached()).toBe(false, 'Expected host not to have attached content.');

            host.setDisposeFn(spy);
            host.dispose();

            expect(spy).toHaveBeenCalled();
        });

        it('should use the `ComponentFactoryResolver` from the portal, if available', () => {
            const spy = jasmine.createSpy('resolveComponentFactorySpy');
            const portal = new ComponentPortal(PizzaMsg, undefined, undefined, {
                resolveComponentFactory: (...args: any[]) => {
                    spy();

                    return componentFactoryResolver.resolveComponentFactory
                        .apply(componentFactoryResolver, args);
                }
            });

            host.attachComponentPortal(portal);
            expect(spy).toHaveBeenCalled();
        });
    });
});


class Chocolate {
    toString() {
        return 'Chocolate';
    }
}

class ChocolateInjector {
    constructor(public parentInjector: Injector) {
    }

    get(token: any) { // tslint:disable-line
        return token === Chocolate ? new Chocolate() : this.parentInjector.get<any>(token); // tslint:disable-line
    }
}

/** Simple component for testing ComponentPortal. */
@Component({
    selector: 'pizza-msg',
    template: '<p>Pizza</p><p>{{snack}}</p>'
})
class PizzaMsg {
    constructor(@Optional() public snack: Chocolate) {
    }
}

/** Simple component to grab an arbitrary ViewContainerRef */
@Component({
    selector: 'some-placeholder',
    template: '<p>Hello</p>'
})
class ArbitraryViewContainerRefComponent {
    constructor(public viewContainerRef: ViewContainerRef, public injector: Injector) {
    }
}


/** Test-bed component that contains a portal outlet and a couple of template portals. */
@Component({
    selector: 'portal-test',
    template: `
        <div class="portal-container">
            <ng-template [cdkPortalOutlet]="selectedPortal" (attached)="attachedSpy($event)"></ng-template>
        </div>

        <ng-template cdk-portal>Cake</ng-template>

        <div *cdk-portal>Pie</div>
        <ng-template cdk-portal let-data> {{fruit}} - {{ data?.status }} </ng-template>

        <ng-template cdk-portal>
            <ul>
                <li *ngFor="let fruitName of fruits"> {{fruitName}} </li>
            </ul>
        </ng-template>

        <ng-template #templateRef let-data> {{fruit}} - {{ data?.status }}!</ng-template>
    `
})
class PortalTestApp {
    @ViewChildren(CdkPortal) portals: QueryList<CdkPortal>;
    @ViewChild(CdkPortalOutlet) portalOutlet: CdkPortalOutlet;
    @ViewChild('templateRef', { read: TemplateRef }) templateRef: TemplateRef<any>;

    selectedPortal: Portal<any> | undefined;
    fruit: string = 'Banana';
    fruits = ['Apple', 'Pineapple', 'Durian'];
    attachedSpy = jasmine.createSpy('attached spy');

    constructor(public injector: Injector) {
    }

    get cakePortal() {
        return this.portals.first;
    }

    get piePortal() {
        return this.portals.toArray()[1];
    }

    get portalWithBinding() {
        return this.portals.toArray()[2]; // tslint:disable-line
    }

    get portalWithTemplate() {
        return this.portals.toArray()[3]; // tslint:disable-line
    }

}

/** Test-bed component that contains a portal outlet and a couple of template portals. */
@Component({
    template: `
        <div class="portal-container">
            <ng-template cdkPortalOutlet></ng-template>
        </div>
    `
})
class UnboundPortalTestApp {
    @ViewChild(CdkPortalOutlet) portalOutlet: CdkPortalOutlet;
}

// Create a real (non-test) NgModule as a workaround for
// https://github.com/angular/angular/issues/10760
const TEST_COMPONENTS = [
    PortalTestApp,
    UnboundPortalTestApp,
    ArbitraryViewContainerRefComponent,
    PizzaMsg
];

@NgModule({
    imports: [CommonModule, PortalModule],
    exports: TEST_COMPONENTS,
    declarations: TEST_COMPONENTS,
    entryComponents: TEST_COMPONENTS
})
class PortalTestModule {
}
