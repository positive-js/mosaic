import { Component, NgModule } from '@angular/core';
import { TestBed, inject } from '@angular/core/testing';
import { ESCAPE } from '@ptsecurity/cdk/keycodes';
import { ComponentPortal } from '@ptsecurity/cdk/portal';
import { dispatchKeyboardEvent } from '@ptsecurity/cdk/testing';

import { OverlayModule, OverlayContainer, Overlay } from '../index';

import { OverlayKeyboardDispatcher } from './overlay-keyboard-dispatcher';


describe('OverlayKeyboardDispatcher', () => {
    let keyboardDispatcher: OverlayKeyboardDispatcher;
    let overlay: Overlay;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [OverlayModule, TestComponentModule]
        });

        inject([OverlayKeyboardDispatcher, Overlay], (kbd: OverlayKeyboardDispatcher, o: Overlay) => {
            keyboardDispatcher = kbd;
            overlay = o;
        })();
    });

    afterEach(inject([OverlayContainer], (overlayContainer: OverlayContainer) => {
        overlayContainer.ngOnDestroy();
    }));

    it('should track overlays in order as they are attached and detached', () => {
        const overlayOne = overlay.create();
        const overlayTwo = overlay.create();
        const EXPECTED_MAGIC_NUMBER = 2;

        // Attach overlays
        keyboardDispatcher.add(overlayOne);
        keyboardDispatcher.add(overlayTwo);

        expect(keyboardDispatcher._attachedOverlays.length)
            .toBe(EXPECTED_MAGIC_NUMBER, 'Expected both overlays to be tracked.');
        expect(keyboardDispatcher._attachedOverlays[0]).toBe(overlayOne, 'Expected one to be first.');
        expect(keyboardDispatcher._attachedOverlays[1]).toBe(overlayTwo, 'Expected two to be last.');

        // Detach first one and re-attach it
        keyboardDispatcher.remove(overlayOne);
        keyboardDispatcher.add(overlayOne);

        expect(keyboardDispatcher._attachedOverlays[0])
            .toBe(overlayTwo, 'Expected two to now be first.');
        expect(keyboardDispatcher._attachedOverlays[1])
            .toBe(overlayOne, 'Expected one to now be last.');
    });

    it('should dispatch body keyboard events to the most recently attached overlay', () => {
        const overlayOne = overlay.create();
        const overlayTwo = overlay.create();
        const overlayOneSpy = jasmine.createSpy('overlayOne keyboard event spy');
        const overlayTwoSpy = jasmine.createSpy('overlayOne keyboard event spy');

        overlayOne.keydownEvents().subscribe(overlayOneSpy);
        overlayTwo.keydownEvents().subscribe(overlayTwoSpy);

        // Attach overlays
        keyboardDispatcher.add(overlayOne);
        keyboardDispatcher.add(overlayTwo);

        dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);

        // Most recent overlay should receive event
        expect(overlayOneSpy).not.toHaveBeenCalled();
        expect(overlayTwoSpy).toHaveBeenCalled();
    });

    it('should dispatch keyboard events when propagation is stopped', () => {
        const overlayRef = overlay.create();
        const spy = jasmine.createSpy('keyboard event spy');
        const button = document.createElement('button');

        document.body.appendChild(button);
        button.addEventListener('keydown', (event) => event.stopPropagation());

        overlayRef.keydownEvents().subscribe(spy);
        keyboardDispatcher.add(overlayRef);
        dispatchKeyboardEvent(button, 'keydown', ESCAPE);

        expect(spy).toHaveBeenCalled();

        button.parentNode!.removeChild(button); //tslint:disable-line
    });

    it('should complete the keydown stream on dispose', () => {
        const overlayRef = overlay.create();
        const completeSpy = jasmine.createSpy('keydown complete spy');

        overlayRef.keydownEvents().subscribe(undefined, undefined, completeSpy);

        overlayRef.dispose();

        expect(completeSpy).toHaveBeenCalled();
    });

    it('should stop emitting events to detached overlays', () => {
        const instance = overlay.create();
        const spy = jasmine.createSpy('keyboard event spy');

        instance.attach(new ComponentPortal(TestComponent));
        instance.keydownEvents().subscribe(spy);

        dispatchKeyboardEvent(document.body, 'keydown', ESCAPE, instance.overlayElement);
        expect(spy).toHaveBeenCalledTimes(1);

        instance.detach();
        dispatchKeyboardEvent(document.body, 'keydown', ESCAPE, instance.overlayElement);

        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should stop emitting events to disposed overlays', () => {
        const instance = overlay.create();
        const spy = jasmine.createSpy('keyboard event spy');

        instance.attach(new ComponentPortal(TestComponent));
        instance.keydownEvents().subscribe(spy);

        dispatchKeyboardEvent(document.body, 'keydown', ESCAPE, instance.overlayElement);
        expect(spy).toHaveBeenCalledTimes(1);

        instance.dispose();
        dispatchKeyboardEvent(document.body, 'keydown', ESCAPE, instance.overlayElement);

        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should dispose of the global keyboard event handler correctly', () => {
        const overlayRef = overlay.create();
        const body = document.body;

        spyOn(body, 'addEventListener');
        spyOn(body, 'removeEventListener');

        keyboardDispatcher.add(overlayRef);
        expect(body.addEventListener).toHaveBeenCalledWith('keydown', jasmine.any(Function), true);

        overlayRef.dispose();
        expect(body.removeEventListener).toHaveBeenCalledWith('keydown', jasmine.any(Function), true);
    });

});


@Component({
    template: 'Hello'
})
class TestComponent {
}


// Create a real (non-test) NgModule as a workaround for
// https://github.com/angular/angular/issues/10760
@NgModule({
    exports: [TestComponent],
    declarations: [TestComponent],
    entryComponents: [TestComponent]
})
class TestComponentModule {
}
