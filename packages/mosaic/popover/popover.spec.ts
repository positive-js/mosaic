import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { fakeAsync, inject, tick, TestBed, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { dispatchMouseEvent, dispatchFakeEvent } from '@ptsecurity/cdk/testing';

import { McPopoverModule } from './popover.module';


// tslint:disable:no-magic-numbers
// tslint:disable:max-line-length
// tslint:disable:no-console

describe('McPopover', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let componentFixture;
    let component;

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports     : [ McPopoverModule, NoopAnimationsModule ],
            declarations: [ McPopoverTestComponent ]
        });
        TestBed.compileComponents();
    }));

    beforeEach(inject([ OverlayContainer ], (oc: OverlayContainer) => {
        overlayContainer = oc;
        overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
        overlayContainer.ngOnDestroy();
        componentFixture.destroy();
    });

    describe('Check test cases', () => {
        beforeEach(() => {
            componentFixture = TestBed.createComponent(McPopoverTestComponent);
            component = componentFixture.componentInstance;
            componentFixture.detectChanges();
        });

        it('mcTrigger = hover', fakeAsync(() => {
            const expectedValue = '_TEST1';
            const triggerElement = component.test1.nativeElement;

            expect(overlayContainerElement.textContent).not.toEqual(expectedValue);

            dispatchMouseEvent(triggerElement, 'mouseenter');
            tick();
            componentFixture.detectChanges();
            expect(overlayContainerElement.textContent).toEqual(expectedValue);

            dispatchMouseEvent(triggerElement, 'mouseleave');
            componentFixture.detectChanges();
            dispatchMouseEvent(overlayContainerElement, 'mouseenter');
            componentFixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(expectedValue);
            // Move out from the tooltip element to hide it
            dispatchMouseEvent(overlayContainerElement, 'mouseleave');
            tick(100); // tslint:disable-line
            componentFixture.detectChanges();
            tick(); // wait for next tick to hide
            expect(overlayContainerElement.textContent).not.toEqual(expectedValue);
        }));

        it('mcTrigger = manual', fakeAsync(() => {
            const expectedValue = '_TEST2';

            expect(overlayContainerElement.textContent).not.toEqual(expectedValue);

            component.popoverVisibility = true;
            tick();
            componentFixture.detectChanges();
            expect(overlayContainerElement.textContent).toEqual(expectedValue);

            component.popoverVisibility = false;
            componentFixture.detectChanges();
            tick(500);  // wait for next tick to hide
            componentFixture.detectChanges();

            expect(overlayContainerElement.textContent).not.toEqual(expectedValue);
        }));

        it('mcTrigger = focus', fakeAsync(() => {
            const featureKey = '_TEST3';
            const triggerElement = component.test3.nativeElement;
            dispatchFakeEvent(triggerElement, 'focus');
            componentFixture.detectChanges();
            expect(overlayContainerElement.textContent).toContain(featureKey);
            dispatchFakeEvent(triggerElement, 'blur');
            tick(100); // tslint:disable-line
            componentFixture.detectChanges();
            tick(); // wait for next tick to hide
            componentFixture.detectChanges();
            tick(); // wait for next tick to hide
            expect(overlayContainerElement.textContent).not.toContain(featureKey);
        }));

        it('Can set mcPopoverHeader', fakeAsync(() => {
            const expectedValue = '_TEST4';
            const triggerElement = component.test4.nativeElement;

            dispatchMouseEvent(triggerElement, 'mouseenter');
            tick();
            componentFixture.detectChanges();

            const header = componentFixture.debugElement.query(By.css('.mc-popover__header'));
            expect(header.nativeElement.textContent).toEqual(expectedValue);

            flush();
        }));

        it('Can set mcPopoverContent', fakeAsync(() => {
            const expectedValue = '_TEST5';
            const triggerElement = component.test5.nativeElement;

            dispatchMouseEvent(triggerElement, 'mouseenter');
            tick();
            componentFixture.detectChanges();

            const content = componentFixture.debugElement.query(By.css('.mc-popover__content'));
            expect(content.nativeElement.textContent).toEqual(expectedValue);

            flush();
        }));

        it('Can set mcPopoverFooter', fakeAsync(() => {
            const expectedValue = '_TEST6';
            const triggerElement = component.test6.nativeElement;

            dispatchMouseEvent(triggerElement, 'mouseenter');
            tick();
            componentFixture.detectChanges();

            const footer = componentFixture.debugElement.query(By.css('.mc-popover__footer'));
            expect(footer.nativeElement.textContent).toEqual(expectedValue);

            flush();
        }));

        it('Can set mcPopoverClass', fakeAsync(() => {
            const expectedValue = '_TEST7';
            const triggerElement = component.test7.nativeElement;

            dispatchMouseEvent(triggerElement, 'click');
            tick();
            componentFixture.detectChanges();

            const popover = componentFixture.debugElement.query(By.css('.mc-popover'));
            expect(popover.nativeElement.classList.contains(expectedValue)).toBeTruthy();

            flush();
        }));
    });
});

@Component({
    selector: 'mc-popover-test-component',
    template: `
        <button #test1 mcPopover mcTrigger="hover" mcPopoverContent="_TEST1">_TEST1asdasd</button>
        <button #test2 mcPopover mcTrigger="manual" [mcVisible]="popoverVisibility" mcPopoverContent="_TEST2">_TEST2</button>
        <button #test3 mcPopover mcTrigger="focus" mcPopoverContent="_TEST3">_TEST3</button>

        <button #test4 mcPopover mcTrigger="hover" mcPopoverHeader="_TEST4">_TEST4</button>
        <button #test5 mcPopover mcTrigger="hover" mcPopoverContent="_TEST5">_TEST5</button>
        <button #test6 mcPopover mcTrigger="hover" mcPopoverFooter="_TEST6">_TEST6</button>

        <button #test7 mcPopover mcPopoverClass="_TEST7" mcPopoverContent="_TEST7">_TEST7</button>
    `
})
class McPopoverTestComponent {
    popoverVisibility: boolean = false;

    @ViewChild('test1', {static: false}) test1: ElementRef;
    @ViewChild('test2', {static: false}) test2: ElementRef;
    @ViewChild('test3', {static: false}) test3: ElementRef;
    @ViewChild('test4', {static: false}) test4: ElementRef;
    @ViewChild('test5', {static: false}) test5: ElementRef;
    @ViewChild('test6', {static: false}) test6: ElementRef;
    @ViewChild('test7', {static: false}) test7: ElementRef;
}

