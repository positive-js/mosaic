import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, Inject, NgModule, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, inject, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ESCAPE } from '@ptsecurity/cdk/keycodes';
import { dispatchKeyboardEvent } from '@ptsecurity/cdk/testing';

import { MC_SIDEPANEL_DATA, McSidepanelModule, McSidepanelPosition, McSidepanelRef, McSidepanelService } from './index';


// tslint:disable:no-magic-numbers
describe('McSidepanelService', () => {
    let sidepanelService: McSidepanelService;
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    let rootComponentFixture: ComponentFixture<RootComponent>;

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [McSidepanelModule, SidepanelTestModule]
        });

        TestBed.compileComponents();
    }));

    beforeEach(inject(
        [McSidepanelService, OverlayContainer],
        (ss: McSidepanelService, oc: OverlayContainer) => {
                sidepanelService = ss;
                overlayContainer = oc;
                overlayContainerElement = oc.getContainerElement();
            }
    ));

    afterEach(() => {
        overlayContainer.ngOnDestroy();
    });

    beforeEach(() => {
        rootComponentFixture = TestBed.createComponent(RootComponent);

        rootComponentFixture.detectChanges();
    });

    it('should open a sidepanel with a component', () => {
        const sidepanelRef = sidepanelService.open(SimpleSidepanelExample);

        expect(overlayContainerElement.textContent).toContain('Simple Sidepanel');
        expect(sidepanelRef.instance instanceof SimpleSidepanelExample).toBe(true);
    });

    it('should open a sidepanel with a template', () => {
        const templateRefFixture = TestBed.createComponent(ComponentWithTemplateForSidepanel);
        templateRefFixture.componentInstance.localValue = 'Hello';

        const data = { value: 'World!' };

        const sidepanelRef = sidepanelService.open(templateRefFixture.componentInstance.templateRef, { data });

        expect(overlayContainerElement.textContent).toContain('Hello World!');
        expect(templateRefFixture.componentInstance.sidepanelRef).toBe(sidepanelRef);
    });

    it('should emit when sidepanel opening animation is complete', fakeAsync(() => {
        const sidepanelRef = sidepanelService.open(SimpleSidepanelExample);
        const afterOpenedCallback = jasmine.createSpy('afterOpened spy');

        sidepanelRef.afterOpened().subscribe(afterOpenedCallback);

        rootComponentFixture.detectChanges();

        expect(afterOpenedCallback).not.toHaveBeenCalled();

        flush();

        expect(afterOpenedCallback).toHaveBeenCalled();
    }));

    it('should close a sidepanel and return result', fakeAsync(() => {
        const sidepanelRef = sidepanelService.open(SimpleSidepanelExample);
        const afterCloseCallback = jasmine.createSpy('afterClosed spy');

        sidepanelRef.afterClosed().subscribe(afterCloseCallback);
        sidepanelRef.close('Result');

        rootComponentFixture.detectChanges();

        flush();

        expect(afterCloseCallback).toHaveBeenCalledWith('Result');
        expect(overlayContainerElement.querySelector('mc-sidepanel-container')).toBeNull();
    }));

    it('should have role dialog', () => {
        sidepanelService.open(SimpleSidepanelExample);

        const sidepanelContainerElement = overlayContainerElement.querySelector('mc-sidepanel-container')!;

        expect(sidepanelContainerElement.getAttribute('role')).toBe('dialog');
    });

    it('should close a sidepanel via the escape key', fakeAsync(() => {
        sidepanelService.open(SimpleSidepanelExample);

        dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
        rootComponentFixture.detectChanges();

        flush();

        expect(overlayContainerElement.querySelector('mc-sidepanel-container')).toBeNull();
    }));

    it('should close a sidepanel via the backdrop click', fakeAsync(() => {
        sidepanelService.open(SimpleSidepanelExample);

        rootComponentFixture.detectChanges();

        const backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;

        backdrop.click();
        flush();

        expect(overlayContainerElement.querySelector('mc-sidepanel-container')).toBeNull();
    }));

    it('should close all opened sidepanels', fakeAsync(() => {
        sidepanelService.open(SimpleSidepanelExample);
        sidepanelService.open(SimpleSidepanelExample);
        sidepanelService.open(SimpleSidepanelExample);

        expect(overlayContainerElement.querySelectorAll('mc-sidepanel-container').length).toBe(3);

        sidepanelService.closeAll();
        rootComponentFixture.detectChanges();
        flush();

        expect(overlayContainerElement.querySelectorAll('mc-sidepanel-container').length).toBe(0);
    }));

    it('should set the proper animation states', () => {
        const sidepanelRef = sidepanelService.open(SimpleSidepanelExample);

        expect(sidepanelRef.containerInstance.animationState).toBe('visible');

        sidepanelRef.close();

        expect(sidepanelRef.containerInstance.animationState).toBe('hidden');
    });

    it('should assign a unique id to each sidepanel', () => {
        const one = sidepanelService.open(SimpleSidepanelExample);
        const two = sidepanelService.open(SimpleSidepanelExample);

        expect(one.id).toBeDefined();
        expect(two.id).toBeDefined();

        expect(one.id).not.toBe(two.id);
    });

    it('should be able to find a sidepanel by id', () => {
        const sidepanelRef = sidepanelService.open(SimpleSidepanelExample, { id: 'example' });

        expect(sidepanelService.getSidepanelById('example')).toBe(sidepanelRef);
    });

    it('should throw when trying to open a sidepanel with the same id as another', () => {
        sidepanelService.open(SimpleSidepanelExample, { id: 'example' });
        expect(() => sidepanelService.open(SimpleSidepanelExample, { id: 'example' })).toThrowError();
    });

    it('should set default config options', () => {
        const sidepanelRef = sidepanelService.open(SimpleSidepanelExample);

        rootComponentFixture.detectChanges();

        expect(sidepanelRef.config.position).toBe(McSidepanelPosition.Right);
        expect(sidepanelRef.config.hasBackdrop).toBe(true);
        expect(sidepanelRef.config.disableClose).toBe(false);
        expect(sidepanelRef.config.requiredBackdrop).toBe(false);
    });

    it('should be able to pass in data', () => {
        const config = { data: { value: 'test' } };

        const sidepanelRef = sidepanelService.open(SimpleSidepanelExample, config);

        expect(sidepanelRef.instance.data.value).toBe(config.data.value);
    });

    it('should allow for the id to be overwritten', () => {
        const sidepanelRef = sidepanelService.open(SimpleSidepanelExample, { id: 'example' });

        expect(sidepanelRef.id).toBe('example');
    });

    it('should be able to prevent closing via the escape key', fakeAsync(() => {
        sidepanelService.open(SimpleSidepanelExample, { disableClose: true });

        rootComponentFixture.detectChanges();
        dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
        rootComponentFixture.detectChanges();
        flush();

        expect(overlayContainerElement.querySelector('mc-sidepanel-container')).not.toBeNull();
    }));

    it('should be able to prevent closing via backdrop click', fakeAsync(() => {
        sidepanelService.open(SimpleSidepanelExample, { disableClose: true });

        const backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;

        backdrop.click();
        flush();

        expect(overlayContainerElement.querySelector('mc-sidepanel-container')).not.toBeNull();
    }));

    it('should have a backdrop by default', () => {
        sidepanelService.open(SimpleSidepanelExample);

        expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).not.toBeNull();
    });

    it('should not have a backdrop with hasBackdrop false', () => {
        sidepanelService.open(SimpleSidepanelExample, { hasBackdrop: false });

        expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeNull();
    });

    it('should have only one dark backdrop with multiple sidepanels by default', () => {
        sidepanelService.open(SimpleSidepanelExample);
        sidepanelService.open(SimpleSidepanelExample);
        sidepanelService.open(SimpleSidepanelExample);

        expect(overlayContainerElement.querySelectorAll('.cdk-overlay-dark-backdrop').length).toBe(1);
        expect(overlayContainerElement.querySelectorAll('.cdk-overlay-transparent-backdrop').length).toBe(2);
    });

    it('should be able to add more than one dark backdrop with multiple sidepanels', () => {
        sidepanelService.open(SimpleSidepanelExample);
        sidepanelService.open(SimpleSidepanelExample, { requiredBackdrop: true });
        sidepanelService.open(SimpleSidepanelExample);

        expect(overlayContainerElement.querySelectorAll('.cdk-overlay-dark-backdrop').length).toBe(2);
        expect(overlayContainerElement.querySelectorAll('.cdk-overlay-transparent-backdrop').length).toBe(1);
    });

    it('should be able to set custom overlay class', () => {
        sidepanelService.open(SimpleSidepanelExample, { overlayPanelClass: 'custom-overlay' });

        expect(overlayContainerElement.querySelector('.custom-overlay')).not.toBeNull();
    });

    it('should add indent when open more than one sidepanel with same position', () => {
        sidepanelService.open(SimpleSidepanelExample);

        expect(overlayContainerElement.querySelectorAll('.mc-sidepanel-indent').length).toBe(0);

        sidepanelService.open(SimpleSidepanelExample);

        expect(overlayContainerElement.querySelectorAll('.mc-sidepanel-indent').length).toBe(1);
    });

    it('should not add indent when open more than one sidepanel with different position', () => {
        sidepanelService.open(SimpleSidepanelExample);

        expect(overlayContainerElement.querySelectorAll('.mc-sidepanel-indent').length).toBe(0);

        sidepanelService.open(SimpleSidepanelExample, { position: McSidepanelPosition.Left });

        expect(overlayContainerElement.querySelectorAll('.mc-sidepanel-indent').length).toBe(0);
    });
});


@Component({
    template: '<div>Simple Sidepanel</div>'
})
class SimpleSidepanelExample {
    constructor(public sidepanelRef: McSidepanelRef<SimpleSidepanelExample>,
                @Inject(MC_SIDEPANEL_DATA) public data: any) {
    }
}

@Component({
    template: `<ng-template let-data let-sidepanelRef="sidepanelRef">
        {{localValue}} {{data?.value}}{{setSidepanelRef(sidepanelRef)}}</ng-template>`
})
class ComponentWithTemplateForSidepanel {
    localValue: string;
    sidepanelRef: McSidepanelRef;

    @ViewChild(TemplateRef, {static: true}) templateRef: TemplateRef<any>;

    setSidepanelRef(sidepanelRef: McSidepanelRef): string {
        this.sidepanelRef = sidepanelRef;

        return '';
    }
}

@Component({
    selector: 'root-component',
    template: `<div></div>`
})
class RootComponent {}

// Create a real (non-test) NgModule as a workaround for
// https://github.com/angular/angular/issues/10760
const TEST_COMPONENTS = [
    SimpleSidepanelExample,
    ComponentWithTemplateForSidepanel,
    RootComponent
];

@NgModule({
    imports: [
        McSidepanelModule,
        NoopAnimationsModule
    ],
    exports: TEST_COMPONENTS,
    declarations: TEST_COMPONENTS,
    entryComponents: [
        SimpleSidepanelExample,
        ComponentWithTemplateForSidepanel,
        RootComponent
    ]
})
class SidepanelTestModule {
}
