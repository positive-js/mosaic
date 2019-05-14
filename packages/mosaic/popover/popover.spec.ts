import { Component, ElementRef, ViewChild } from '@angular/core';
import { fakeAsync, inject, tick, TestBed, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayContainer } from '@ptsecurity/cdk/overlay';
import { dispatchMouseEvent } from '@ptsecurity/cdk/testing';

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

        it('mcPopoverTrigger = hover', fakeAsync(() => {
            const expectedValue = '_TEST1';
            const triggerElement = component.test1.nativeElement;

            expect(overlayContainerElement.textContent).not.toEqual(expectedValue);

            dispatchMouseEvent(triggerElement, 'mouseenter');
            tick();
            componentFixture.detectChanges();
            expect(overlayContainerElement.textContent).toEqual(expectedValue);

            dispatchMouseEvent(triggerElement, 'mouseleave');
            tick();
            componentFixture.detectChanges();
            console.log(overlayContainerElement.textContent);
            expect(overlayContainerElement.textContent).not.toEqual(expectedValue);
        }));

        it('mcPopoverTrigger = manual', fakeAsync(() => {
            const expectedValue = '_TEST2';

            expect(overlayContainerElement.textContent).not.toEqual(expectedValue);

            component.popoverVisibility = true;
            tick();
            componentFixture.detectChanges();
            expect(overlayContainerElement.textContent).toEqual(expectedValue);

            component.popoverVisibility = false;
            tick();
            componentFixture.detectChanges();
            tick();
            componentFixture.detectChanges();
            console.log(overlayContainerElement.textContent);
            expect(overlayContainerElement.textContent).not.toEqual(expectedValue);
        }));

        it('mcPopoverTrigger = focus', fakeAsync(() => {
            const expectedValue = '_TEST3';
            const triggerElement = component.test3.nativeElement;

            expect(overlayContainerElement.textContent).not.toEqual(expectedValue);

            dispatchMouseEvent(triggerElement, 'focus');
            tick();
            componentFixture.detectChanges();
            expect(overlayContainerElement.textContent).toEqual(expectedValue);

            dispatchMouseEvent(triggerElement, 'blur');
            tick();
            componentFixture.detectChanges();
            console.log(overlayContainerElement.textContent);
            expect(overlayContainerElement.textContent).not.toEqual(expectedValue);
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

            dispatchMouseEvent(triggerElement, 'mouseenter');
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
        <button #test1 mcPopover mcPopoverTrigger="hover" mcPopoverContent="_TEST1"></button>
        <button #test2 mcPopover mcPopoverTrigger="manual" [mcPopoverVisible]="popoverVisibility" mcPopoverContent="_TEST2"></button>
        <button #test3 mcPopover mcPopoverTrigger="focus" mcPopoverContent="_TEST3"></button>

        <button #test4 mcPopover mcPopoverTrigger="hover" mcPopoverHeader="_TEST4"></button>
        <button #test5 mcPopover mcPopoverTrigger="hover" mcPopoverContent="_TEST5"></button>
        <button #test6 mcPopover mcPopoverTrigger="hover" mcPopoverFooter="_TEST6"></button>

        <button #test7 mcPopover mcPopoverClass="_TEST7" mcPopoverContent="_TEST7"></button>
    `
})
class McPopoverTestComponent {
    popoverVisibility: boolean = false;

    @ViewChild('test1') test1: ElementRef;
    @ViewChild('test2') test2: ElementRef;
    @ViewChild('test3') test3: ElementRef;
    @ViewChild('test4') test4: ElementRef;
    @ViewChild('test5') test5: ElementRef;
    @ViewChild('test6') test6: ElementRef;
    @ViewChild('test7') test7: ElementRef;
}

