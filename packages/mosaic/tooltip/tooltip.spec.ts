import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { fakeAsync, inject, tick, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { dispatchMouseEvent } from '@ptsecurity/cdk/testing';

import { McTooltipTrigger } from './tooltip.component';
import { McToolTipModule } from './tooltip.module';


describe('McTooltip', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let fixture;
    let component;
    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports     : [ McToolTipModule, NoopAnimationsModule ],
            declarations: [ McTooltipTestWrapperComponent, McTooltipTestNewComponent, McTooltipDisabledComponent ]
        });
        TestBed.compileComponents();
    }));
    beforeEach(inject([ OverlayContainer ], (oc: OverlayContainer) => {
        overlayContainer = oc;
        overlayContainerElement = oc.getContainerElement();
    }));
    afterEach(() => {
        overlayContainer.ngOnDestroy();
    });
    describe('should bring no break change', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(McTooltipTestWrapperComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });
        it('should show/hide most simple tooltip with moving through all around', fakeAsync(() => {
            const featureKey = 'MOST-SIMPLE';
            const triggerElement = component.mostSimpleTrigger.nativeElement;
            const tooltipDirective = (component.mostSimpleDirective);
            expect(overlayContainerElement.textContent).not.toContain(featureKey);
            // Move inside to trigger tooltip shown up
            dispatchMouseEvent(triggerElement, 'mouseenter');
            fixture.detectChanges();
            tick(410); // tslint:disable-line
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(featureKey);
            // NOTE: the overlayElement is only available after tooltip shown up
            const overlayElement = (component.mostSimpleDirective).overlayRef.overlayElement;
            tooltipDirective.updatePosition(); // This line is temporarily for coverage
            // Move out from the trigger element, then move into the tooltip element
            dispatchMouseEvent(triggerElement, 'mouseleave');
            fixture.detectChanges();
            dispatchMouseEvent(overlayElement, 'mouseenter');
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(featureKey);
            // Move out from the tooltip element to hide it
            dispatchMouseEvent(overlayElement, 'mouseleave');
            tick(100); // tslint:disable-line
            fixture.detectChanges();
            tick(); // wait for next tick to hide
            expect(overlayContainerElement.textContent).not.toContain(featureKey);
        }));
        it('should show/hide normal tooltip', fakeAsync(() => {
            const featureKey = 'NORMAL';
            const triggerElement = component.normalTrigger.nativeElement;
            expect(overlayContainerElement.textContent).not.toContain(featureKey);
            fixture.detectChanges();
            // Move inside to trigger tooltip shown up
            dispatchMouseEvent(triggerElement, 'mouseenter');
            fixture.detectChanges();
            tick(410); // tslint:disable-line
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(featureKey);
            // Move out from the trigger element to hide it
            dispatchMouseEvent(triggerElement, 'mouseleave');
            tick(100); // tslint:disable-line
            fixture.detectChanges();
            tick(); // wait for next tick to hide
            expect(overlayContainerElement.textContent).not.toContain(featureKey);
        }));
        it('should show/hide tooltip by focus', fakeAsync(() => {
            const featureKey = 'FOCUS';
            const triggerElement = component.focusTrigger.nativeElement;
            dispatchMouseEvent(triggerElement, 'focus');
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(featureKey);
            dispatchMouseEvent(triggerElement, 'blur');
            tick(100); // tslint:disable-line
            fixture.detectChanges();
            tick(); // wait for next tick to hide
            expect(overlayContainerElement.textContent).not.toContain(featureKey);
        }));
        it('should mcTitle support string', fakeAsync(() => {
            const featureKey = 'NORMAL';
            const triggerElement = component.normalTrigger.nativeElement;
            const tooltipDirective = (component.normalDirective);
            expect(overlayContainerElement.textContent).not.toContain(featureKey);
            // Move inside to trigger tooltip shown up
            dispatchMouseEvent(triggerElement, 'mouseenter');
            fixture.detectChanges();
            tick(410); // tslint:disable-line
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(featureKey);
            // NOTE: the overlayElement is only available after tooltip shown up
            const overlayElement = (component.normalDirective).overlayRef.overlayElement;
            tooltipDirective.updatePosition(); // This line is temporarily for coverage
            // Move out from the trigger element, then move into the tooltip element
            dispatchMouseEvent(triggerElement, 'mouseleave');
            fixture.detectChanges();
            dispatchMouseEvent(overlayElement, 'mouseenter');
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(featureKey);
            // Move out from the tooltip element to hide it
            dispatchMouseEvent(overlayElement, 'mouseleave');
            tick(100); // tslint:disable-line
            fixture.detectChanges();
            tick(); // wait for next tick to hide
            expect(overlayContainerElement.textContent).not.toContain(featureKey);
        }));
    });
    xdescribe('should support directive usage', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(McTooltipTestNewComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });
    });
    describe('should support mcTooltipDisabled attribute', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(McTooltipDisabledComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });
        it('should not show tooltip', fakeAsync(() => {
            const featureKey = 'DISABLED';
            const tooltipDirective = (component.disabledDirective);
            expect(overlayContainerElement.textContent).not.toContain(featureKey);
            tooltipDirective.show();
            fixture.detectChanges();
            tick(410); // tslint:disable-line
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).not.toContain(featureKey);
            tooltipDirective.disabled = false;
            tooltipDirective.show();
            fixture.detectChanges();
            tick(410); // tslint:disable-line
            fixture.detectChanges();
            tick(410); // tslint:disable-line
            tick();
            fixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(featureKey);

        }));
    });
});
@Component({
    selector: 'mc-tooltip-test-new',
    template: `
    <a #titleString
       mcTooltip="title-string"
       mcTrigger="hover"
       mcPlacement="top">Show</a>
    <a #titleTemplate mcTooltip="template">Show</a>
    <ng-template #template>
      title-template
    </ng-template>
  `
})
class McTooltipTestNewComponent {
    @ViewChild('titleString', {static: false}) titleString: ElementRef;
    @ViewChild('titleString', { read: McTooltipTrigger, static: false}) titleStringMcTooltipDirective: McTooltipTrigger;
    @ViewChild('titleTemplate', {static: false}) titleTemplate: ElementRef;
    @ViewChild('titleTemplate', { read: McTooltipTrigger, static: false}) titleTemplateMcTooltipDirective: McTooltipTrigger;
}
@Component({
    selector: 'mc-tooltip-test-wrapper',
    template: `
        <a #mostSimpleTrigger mcTooltip="MOST-SIMPLE">Show</a>

        <span #normalTrigger
              mcTooltip="NORMAL"
              mcTrigger="hover"
              mcPlacement="right">
        Show
    </span>

        <span #focusTrigger mcTooltip="FOCUS" mcTrigger="focus">Show</span>
        <span #visibleTrigger  mcTooltip="VISIBLE" visible="visible">Show</span>
    `
})
class McTooltipTestWrapperComponent {
    @ViewChild('normalTrigger', {static: false}) normalTrigger: ElementRef;
    @ViewChild('normalTrigger', { read: McTooltipTrigger, static: false }) normalDirective: McTooltipTrigger;
    @ViewChild('focusTrigger', {static: false}) focusTrigger: ElementRef;
    visible: boolean;
    @ViewChild('visibleTrigger', {static: false}) visibleTrigger: ElementRef;
    @ViewChild('mostSimpleTrigger', {static: false}) mostSimpleTrigger: ElementRef;
    @ViewChild('mostSimpleTrigger', { read: McTooltipTrigger, static: false }) mostSimpleDirective: McTooltipTrigger;
}

@Component({
    selector: 'mc-tooltip-disabled-wrapper',
    template: `<span #disabledAttribute
                     mcTooltip="DISABLED"
                     mcTrigger="manual"
                     mcTooltipDisabled="true">
        Disabled
    </span>`
})
class McTooltipDisabledComponent {
    @ViewChild('disabledAttribute', {static: false}) disabledTrigger: ElementRef;
    @ViewChild('disabledAttribute', { read: McTooltipTrigger, static: false }) disabledDirective: McTooltipTrigger;
}
