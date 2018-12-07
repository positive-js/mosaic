import { Component, ElementRef, ViewChild } from '@angular/core';
import { fakeAsync, inject, tick, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayContainer } from '@ptsecurity/cdk/overlay';
import { dispatchMouseEvent } from '@ptsecurity/cdk/testing';

import { McTooltip } from './tooltip.component';
import { McToolTipModule } from './tooltip.module';


describe('McTooltip', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let fixture;
    let component;
    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports     : [ McToolTipModule, NoopAnimationsModule ],
            declarations: [ McTooltipTestWrapperComponent, McTooltipTestNewComponent ]
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
            const overlayElement = (component.mostSimpleDirective)._overlayRef.overlayElement;
            tooltipDirective._updatePosition(); // This line is temporarily for coverage
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
            const overlayElement = (component.normalDirective)._overlayRef.overlayElement;
            tooltipDirective._updatePosition(); // This line is temporarily for coverage
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
    describe('should support directive usage', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(McTooltipTestNewComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });
    });
});
@Component({
    selector: 'mc-tooltip-test-new',
    template: `
    <a #titleString
       mcTooltip
       mcTitle="title-string"
       mcTrigger="hover"
       mcPlacement="top">Show</a>
    <a #titleTemplate mcTooltip mcTitle="template">Show</a>
    <ng-template #template>
      title-template
    </ng-template>
  `
})
class McTooltipTestNewComponent {
    @ViewChild('titleString') titleString: ElementRef;
    @ViewChild('titleString', { read: McTooltip }) titleStringMcTooltipDirective: McTooltip;
    @ViewChild('titleTemplate') titleTemplate: ElementRef;
    @ViewChild('titleTemplate', { read: McTooltip }) titleTemplateMcTooltipDirective: McTooltip;
}
@Component({
    selector: 'mc-tooltip-test-wrapper',
    template: `
    <a #mostSimpleTrigger mcTooltip="MOST-SIMPLE">Show</a>

    <span #normalTrigger
          mcTooltip="normalized-text"
          mcTitle="NORMAL"
          mcTrigger="hover"
          mcPlacement="right">
        Show
    </span>

    <span #focusTrigger mcTooltip mcTitle="FOCUS" mcTrigger="focus">Show</span>
    <span #visibleTrigger mcTooltip mcTitle="VISIBLE" mcVisible="visible">Show</span>
  `
})
class McTooltipTestWrapperComponent {
    @ViewChild('normalTrigger') normalTrigger: ElementRef;
    @ViewChild('normalTrigger', { read: McTooltip }) normalDirective: McTooltip;
    @ViewChild('focusTrigger') focusTrigger: ElementRef;
    visible: boolean;
    @ViewChild('visibleTrigger') visibleTrigger: ElementRef;
    @ViewChild('mostSimpleTrigger') mostSimpleTrigger: ElementRef;
    @ViewChild('mostSimpleTrigger', { read: McTooltip }) mostSimpleDirective: McTooltip;
}
