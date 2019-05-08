import { Component, ElementRef, NgModule, NgZone } from '@angular/core';
import { inject, TestBed } from '@angular/core/testing';
import { ComponentPortal, PortalModule } from '@ptsecurity/cdk/portal';
import { CdkScrollable, ScrollDispatchModule } from '@ptsecurity/cdk/scrolling';
import { MockNgZone } from '@ptsecurity/cdk/testing';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import {
    ConnectedOverlayPositionChange,
    FlexibleConnectedPositionStrategy,
    Overlay,
    OverlayConfig,
    OverlayContainer,
    OverlayModule,
    OverlayRef,
    ViewportRuler
} from '../index';


// Default width and height of the overlay and origin panels throughout these tests.
const DEFAULT_HEIGHT = 30;
const DEFAULT_WIDTH = 60;

describe('FlexibleConnectedPositionStrategy', () => {
    let overlay: Overlay;
    let overlayContainer: OverlayContainer;
    let zone: MockNgZone;
    let overlayRef: OverlayRef;
    let viewport: ViewportRuler;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ScrollDispatchModule, OverlayModule, OverlayTestModule],
            providers: [{ provide: NgZone, useFactory: () => zone = new MockNgZone() }]
        });

        inject([Overlay, OverlayContainer, ViewportRuler],
            (o: Overlay, oc: OverlayContainer, v: ViewportRuler) => {
                overlay = o;
                overlayContainer = oc;
                viewport = v;
            })();
    });

    afterEach(() => {
        overlayContainer.ngOnDestroy();

        if (overlayRef) {
            overlayRef.dispose();
        }
    });

    function attachOverlay(config: OverlayConfig) {
        overlayRef = overlay.create(config);
        overlayRef.attach(new ComponentPortal(TestOverlay));
        zone.simulateZoneExit();
    }

    it('should throw when attempting to attach to multiple different overlays', () => {
        const origin = document.createElement('div');
        const positionStrategy = overlay.position()
            .flexibleConnectedTo(origin)
            .withPositions([{
                overlayX: 'start',
                overlayY: 'top',
                originX: 'start',
                originY: 'bottom'
            }]);

        // Needs to be in the DOM for IE not to throw an "Unspecified error".
        document.body.appendChild(origin);
        attachOverlay({ positionStrategy });

        expect(() => attachOverlay({ positionStrategy })).toThrow();

        document.body.removeChild(origin);
    });

    it('should not throw when trying to apply after being disposed', () => {
        const origin = document.createElement('div');
        const positionStrategy = overlay.position()
            .flexibleConnectedTo(origin)
            .withPositions([{
                overlayX: 'start',
                overlayY: 'top',
                originX: 'start',
                originY: 'bottom'
            }]);

        // Needs to be in the DOM for IE not to throw an "Unspecified error".
        document.body.appendChild(origin);
        attachOverlay({ positionStrategy });
        overlayRef.dispose();

        expect(() => positionStrategy.apply()).not.toThrow();

        document.body.removeChild(origin);
    });

    it('should not throw when trying to re-apply the last position after being disposed', () => {
        const origin = document.createElement('div');
        const positionStrategy = overlay.position()
            .flexibleConnectedTo(origin)
            .withPositions([{
                overlayX: 'start',
                overlayY: 'top',
                originX: 'start',
                originY: 'bottom'
            }]);

        // Needs to be in the DOM for IE not to throw an "Unspecified error".
        document.body.appendChild(origin);
        attachOverlay({ positionStrategy });
        overlayRef.dispose();

        expect(() => positionStrategy.reapplyLastPosition()).not.toThrow();

        document.body.removeChild(origin);
    });

    describe('without flexible dimensions and pushing', () => {
        const ORIGIN_HEIGHT = DEFAULT_HEIGHT;
        const ORIGIN_WIDTH = DEFAULT_WIDTH;
        const OVERLAY_HEIGHT = DEFAULT_HEIGHT;
        const OVERLAY_WIDTH = DEFAULT_WIDTH;

        let originElement: HTMLElement;
        let positionStrategy: FlexibleConnectedPositionStrategy;

        beforeEach(() => {
            // The origin and overlay elements need to be in the document body in order to have geometry.
            originElement = createPositionedBlockElement();
            document.body.appendChild(originElement);
            positionStrategy = overlay.position()
                .flexibleConnectedTo(originElement)
                .withFlexibleDimensions(false)
                .withPush(false);
        });

        afterEach(() => {
            document.body.removeChild(originElement);
        });

        describe('when scrolled', () => {
            // Place the original element decently far outside the unscrolled document (1024x768).
            const ORIGIN_LEFT = 2500;
            const ORIGIN_TOP = 2500;

            // Create a very large element that will make the page scrollable.
            let veryLargeElement: HTMLElement = document.createElement('div'); //tslint:disable-line
            veryLargeElement.style.width = '4000px';
            veryLargeElement.style.height = '4000px';

            beforeEach(() => {
                // Scroll the page such that the origin element is roughly in the
                // center of the visible viewport (2500 - 1024/2, 2500 - 768/2).
                document.body.appendChild(veryLargeElement);
                window.scroll(2100, 2100); //tslint:disable-line

                originElement.style.top = `${ORIGIN_TOP}px`;
                originElement.style.left = `${ORIGIN_LEFT}px`;
            });

            afterEach(() => {
                window.scroll(0, 0);
                document.body.removeChild(veryLargeElement);
            });
        });

        describe('when near viewport edge', () => {

            it('should position a panel with the x offset provided', () => {
                const originRect = originElement.getBoundingClientRect();

                positionStrategy.withPositions([{
                    originX: 'start',
                    originY: 'top',
                    overlayX: 'start',
                    overlayY: 'top',
                    offsetX: 10
                }]);

                attachOverlay({ positionStrategy });

                const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
                expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.top));
                expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.left + 10)); //tslint:disable-line
            });

            it('should be able to set the default x offset', () => {
                const originRect = originElement.getBoundingClientRect();

                positionStrategy.withDefaultOffsetX(20).withPositions([{ //tslint:disable-line
                    originX: 'start',
                    originY: 'top',
                    overlayX: 'start',
                    overlayY: 'top'
                }]);

                attachOverlay({ positionStrategy });

                const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
                expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.top));
                expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.left + 20)); //tslint:disable-line
            });

            it('should have the position offset x take precedence over the default offset x', () => {
                const originRect = originElement.getBoundingClientRect();

                positionStrategy.withDefaultOffsetX(20).withPositions([{ //tslint:disable-line
                    originX: 'start',
                    originY: 'top',
                    overlayX: 'start',
                    overlayY: 'top',
                    offsetX: 10
                }]);

                attachOverlay({ positionStrategy });

                const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
                expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.top));
                expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.left + 10)); //tslint:disable-line
            });

            it('should position a panel with the y offset provided', () => {
                const originRect = originElement.getBoundingClientRect();

                positionStrategy.withPositions([{
                    originX: 'start',
                    originY: 'top',
                    overlayX: 'start',
                    overlayY: 'top',
                    offsetY: 50
                }]);

                attachOverlay({ positionStrategy });

                const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
                expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.top + 50)); //tslint:disable-line
                expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.left));
            });

            it('should be able to set the default y offset', () => {
                const originRect = originElement.getBoundingClientRect();

                positionStrategy.withDefaultOffsetY(60).withPositions([{ //tslint:disable-line
                    originX: 'start',
                    originY: 'top',
                    overlayX: 'start',
                    overlayY: 'top'
                }]);

                attachOverlay({ positionStrategy });

                const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
                expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.top + 60)); //tslint:disable-line
                expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.left));
            });

            it('should have the position offset y take precedence over the default offset y', () => {
                const originRect = originElement.getBoundingClientRect();

                positionStrategy.withDefaultOffsetY(60).withPositions([{ //tslint:disable-line
                    originX: 'start',
                    originY: 'top',
                    overlayX: 'start',
                    overlayY: 'top',
                    offsetY: 50
                }]);

                attachOverlay({ positionStrategy });

                const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
                expect(Math.floor(overlayRect.top)).toBe(Math.floor(originRect.top + 50)); //tslint:disable-line
                expect(Math.floor(overlayRect.left)).toBe(Math.floor(originRect.left));
            });

        });

        describe('with transform origin', () => {
            it('should set the proper transform-origin when aligning to start/bottom', () => {
                positionStrategy.withTransformOriginOn('.transform-origin').withPositions([{
                    originX: 'start',
                    originY: 'bottom',
                    overlayX: 'start',
                    overlayY: 'top'
                }]);

                attachOverlay({ positionStrategy });

                const target = overlayRef.overlayElement.querySelector('.transform-origin')! as HTMLElement; //tslint:disable-line

                expect(target.style.transformOrigin).toContain('left top');
            });

            it('should set the proper transform-origin when aligning to end/bottom', () => {
                positionStrategy.withTransformOriginOn('.transform-origin').withPositions([{
                    originX: 'end',
                    originY: 'bottom',
                    overlayX: 'end',
                    overlayY: 'top'
                }]);

                attachOverlay({ positionStrategy });

                const target = overlayRef.overlayElement.querySelector('.transform-origin')! as HTMLElement; //tslint:disable-line

                expect(target.style.transformOrigin).toContain('right top');
            });

            it('should set the proper transform-origin when centering vertically', () => {
                positionStrategy.withTransformOriginOn('.transform-origin').withPositions([{
                    originX: 'start',
                    originY: 'center',
                    overlayX: 'start',
                    overlayY: 'center'
                }]);

                attachOverlay({ positionStrategy });

                const target = overlayRef.overlayElement.querySelector('.transform-origin')! as HTMLElement; //tslint:disable-line

                expect(target.style.transformOrigin).toContain('left center');
            });

            it('should set the proper transform-origin when centering horizontally', () => {
                positionStrategy.withTransformOriginOn('.transform-origin').withPositions([{
                    originX: 'center',
                    originY: 'top',
                    overlayX: 'center',
                    overlayY: 'top'
                }]);

                attachOverlay({ positionStrategy });

                const target = overlayRef.overlayElement.querySelector('.transform-origin')! as HTMLElement; //tslint:disable-line

                expect(target.style.transformOrigin).toContain('center top');
            });

            it('should set the proper transform-origin when aligning to start/top', () => {
                positionStrategy.withTransformOriginOn('.transform-origin').withPositions([{
                    originX: 'start',
                    originY: 'top',
                    overlayX: 'start',
                    overlayY: 'bottom'
                }]);

                attachOverlay({ positionStrategy });

                const target = overlayRef.overlayElement.querySelector('.transform-origin')! as HTMLElement; //tslint:disable-line

                expect(target.style.transformOrigin).toContain('left bottom');
            });

            it('should set the proper transform-origin when aligning to start/bottom in rtl', () => {
                positionStrategy.withTransformOriginOn('.transform-origin').withPositions([{
                    originX: 'start',
                    originY: 'bottom',
                    overlayX: 'start',
                    overlayY: 'top'
                }]);

                attachOverlay({ positionStrategy, direction: 'rtl' });

                const target = overlayRef.overlayElement.querySelector('.transform-origin')! as HTMLElement; //tslint:disable-line

                expect(target.style.transformOrigin).toContain('right top');
            });

            it('should set the proper transform-origin when aligning to end/bottom in rtl', () => {
                positionStrategy.withTransformOriginOn('.transform-origin').withPositions([{
                    originX: 'end',
                    originY: 'bottom',
                    overlayX: 'end',
                    overlayY: 'top'
                }]);

                attachOverlay({ positionStrategy, direction: 'rtl' });

                const target = overlayRef.overlayElement.querySelector('.transform-origin')! as HTMLElement; //tslint:disable-line

                expect(target.style.transformOrigin).toContain('left top');
            });

        });

        it('should emit onPositionChange event when the position changes', () => {
            originElement.style.top = '200px';
            originElement.style.right = '25px';

            positionStrategy.withPositions([
                {
                    originX: 'end',
                    originY: 'center',
                    overlayX: 'start',
                    overlayY: 'center'
                },
                {
                    originX: 'start',
                    originY: 'bottom',
                    overlayX: 'end',
                    overlayY: 'top'
                }
            ]);

            const positionChangeHandler = jasmine.createSpy('positionChangeHandler');
            const subscription = positionStrategy.positionChanges.subscribe(positionChangeHandler);

            attachOverlay({ positionStrategy });

            const latestCall = positionChangeHandler.calls.mostRecent();

            expect(positionChangeHandler).toHaveBeenCalled();
            expect(latestCall.args[0] instanceof ConnectedOverlayPositionChange)
                .toBe(true, `Expected strategy to emit an instance of ConnectedOverlayPositionChange.`);

            // If the strategy is re-applied and the initial position would now fit,
            // the position change event should be emitted again.
            originElement.style.top = '200px';
            originElement.style.left = '200px';

            overlayRef.updatePosition();

            expect(positionChangeHandler).toHaveBeenCalledTimes(2); //tslint:disable-line

            subscription.unsubscribe();
        });

        it('should emit the onPositionChange event even if none of the positions fit', () => {
            originElement.style.bottom = '25px';
            originElement.style.right = '25px';

            positionStrategy.withPositions([
                {
                    originX: 'end',
                    originY: 'bottom',
                    overlayX: 'start',
                    overlayY: 'top'
                },
                {
                    originX: 'start',
                    originY: 'bottom',
                    overlayX: 'end',
                    overlayY: 'top'
                }
            ]);

            const positionChangeHandler = jasmine.createSpy('positionChangeHandler');
            const subscription = positionStrategy.positionChanges.subscribe(positionChangeHandler);

            attachOverlay({ positionStrategy });

            expect(positionChangeHandler).toHaveBeenCalled();

            subscription.unsubscribe();
        });

        it('should re-use the preferred position when re-applying while locked in', () => {
            positionStrategy.withPositions([
                {
                    originX: 'end',
                    originY: 'center',
                    overlayX: 'start',
                    overlayY: 'center'
                },
                {
                    originX: 'start',
                    originY: 'bottom',
                    overlayX: 'end',
                    overlayY: 'top'
                }
            ])
                .withLockedPosition();

            const recalcSpy = spyOn(positionStrategy, 'reapplyLastPosition');

            attachOverlay({ positionStrategy });

            expect(recalcSpy).not.toHaveBeenCalled();

            positionStrategy.apply();

            expect(recalcSpy).toHaveBeenCalled();
        });
    });

    describe('with pushing', () => {
        const OVERLAY_HEIGHT = DEFAULT_HEIGHT;
        const OVERLAY_WIDTH = DEFAULT_WIDTH;

        let originElement: HTMLElement;
        let positionStrategy: FlexibleConnectedPositionStrategy;

        beforeEach(() => {
            originElement = createPositionedBlockElement();
            document.body.appendChild(originElement);
            positionStrategy = overlay.position()
                .flexibleConnectedTo(originElement)
                .withFlexibleDimensions(false)
                .withPush();
        });

        afterEach(() => {
            document.body.removeChild(originElement);
        });

    });

    describe('with flexible dimensions', () => {
        const OVERLAY_HEIGHT = DEFAULT_HEIGHT;
        const OVERLAY_WIDTH = DEFAULT_WIDTH;

        let originElement: HTMLElement;
        let positionStrategy: FlexibleConnectedPositionStrategy;

        beforeEach(() => {
            originElement = createPositionedBlockElement();
            document.body.appendChild(originElement);
            positionStrategy = overlay.position().flexibleConnectedTo(originElement);
        });

        afterEach(() => {
            document.body.removeChild(originElement);
        });

        it('should align the overlay to `flex-start` when the content is flowing to the right', () => {
            positionStrategy
                .withFlexibleDimensions()
                .withPush(false)
                .withPositions([{
                    overlayY: 'top',
                    overlayX: 'start',
                    originY: 'bottom',
                    originX: 'start'
                }]);

            attachOverlay({ positionStrategy });

            expect(overlayRef.hostElement.style.alignItems).toBe('flex-start');
        });

        it('should align the overlay to `flex-end` when the content is flowing to the left', () => {
            positionStrategy
                .withFlexibleDimensions()
                .withPush(false)
                .withPositions([{
                    overlayY: 'top',
                    overlayX: 'end',
                    originY: 'bottom',
                    originX: 'end'
                }]);

            attachOverlay({ positionStrategy });

            expect(overlayRef.hostElement.style.alignItems).toBe('flex-end');
        });

        it('should align the overlay to `center` when the content is centered', () => {
            positionStrategy
                .withFlexibleDimensions()
                .withPush(false)
                .withPositions([{
                    overlayY: 'top',
                    overlayX: 'center',
                    originY: 'bottom',
                    originX: 'center'
                }]);

            attachOverlay({ positionStrategy });

            expect(overlayRef.hostElement.style.alignItems).toBe('center');
        });

        it('should become scrollable when it hits the viewport edge with a flexible width', () => {
            originElement.style.top = '200px';
            originElement.style.right = '-20px';

            positionStrategy
                .withFlexibleDimensions()
                .withPush(false)
                .withPositions([{
                    overlayY: 'top',
                    overlayX: 'start',
                    originY: 'bottom',
                    originX: 'start'
                }]);

            attachOverlay({ positionStrategy });

            const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
            expect(Math.floor(overlayRect.width)).toBe(OVERLAY_WIDTH - 20); //tslint:disable-line
        });

        it('should not collapse the height if the size is less than the minHeight', () => {
            originElement.style.left = '200px';
            originElement.style.bottom = `${OVERLAY_HEIGHT - 10}px`; //tslint:disable-line

            positionStrategy
                .withFlexibleDimensions()
                .withPositions([{
                    overlayY: 'top',
                    overlayX: 'start',
                    originY: 'bottom',
                    originX: 'start'
                }]);

            attachOverlay({
                positionStrategy,
                minHeight: OVERLAY_HEIGHT - 5 //tslint:disable-line
            });

            const overlayRect = overlayRef.overlayElement.getBoundingClientRect();
            expect(Math.floor(overlayRect.height)).toBe(OVERLAY_HEIGHT);
        });

        it('should be able to opt-in to having the overlay grow after it was opened', () => {
            originElement.style.left = '200px';
            originElement.style.bottom = `${OVERLAY_HEIGHT - 10}px`; //tslint:disable-line

            positionStrategy
                .withFlexibleDimensions()
                .withPush(false)
                .withGrowAfterOpen()
                .withPositions([{
                    overlayY: 'top',
                    overlayX: 'start',
                    originY: 'bottom',
                    originX: 'start'
                }]);

            attachOverlay({ positionStrategy });

            let overlayRect = overlayRef.overlayElement.getBoundingClientRect();

            originElement.style.bottom = '200px';
            overlayRef.updatePosition();
            overlayRect = overlayRef.overlayElement.getBoundingClientRect();

            // The overlay should be back to full height.
            expect(Math.floor(overlayRect.height)).toBe(OVERLAY_HEIGHT);
        });

        it('should set the proper styles when the `bottom` value is exactly zero', () => {
            originElement.style.position = 'fixed';
            originElement.style.bottom = '0';
            originElement.style.left = '200px';

            positionStrategy
                .withFlexibleDimensions()
                .withPush(false)
                .withPositions([{
                    overlayY: 'bottom',
                    overlayX: 'start',
                    originY: 'bottom',
                    originX: 'start'
                }]);

            attachOverlay({ positionStrategy });

            const boundingBox = overlayContainer
                .getContainerElement()
                .querySelector('.cdk-overlay-connected-position-bounding-box') as HTMLElement;

            // Ensure that `0px` is set explicitly, rather than the
            // property being left blank due to zero being falsy.
            expect(boundingBox.style.bottom).toBe('0px');
        });

        it('should set the proper styles when the `top` value is exactly zero', () => {
            originElement.style.position = 'fixed';
            originElement.style.top = '0';
            originElement.style.left = '200px';

            positionStrategy
                .withFlexibleDimensions()
                .withPush(false)
                .withPositions([{
                    overlayY: 'top',
                    overlayX: 'start',
                    originY: 'top',
                    originX: 'start'
                }]);

            attachOverlay({ positionStrategy });

            const boundingBox = overlayContainer
                .getContainerElement()
                .querySelector('.cdk-overlay-connected-position-bounding-box') as HTMLElement;

            // Ensure that `0px` is set explicitly, rather than the
            // property being left blank due to zero being falsy.
            expect(boundingBox.style.top).toBe('0px');
        });

        it('should set the proper styles when the `left` value is exactly zero', () => {
            originElement.style.position = 'fixed';
            originElement.style.left = '0';
            originElement.style.top = '200px';

            positionStrategy
                .withFlexibleDimensions()
                .withPush(false)
                .withPositions([{
                    overlayY: 'top',
                    overlayX: 'start',
                    originY: 'top',
                    originX: 'start'
                }]);

            attachOverlay({ positionStrategy });

            const boundingBox = overlayContainer
                .getContainerElement()
                .querySelector('.cdk-overlay-connected-position-bounding-box') as HTMLElement;

            // Ensure that `0px` is set explicitly, rather than the
            // property being left blank due to zero being falsy.
            expect(boundingBox.style.left).toBe('0px');
        });

        it('should set the proper styles when the `right` value is exactly zero', () => {
            originElement.style.position = 'fixed';
            originElement.style.right = '0';
            originElement.style.top = '200px';

            positionStrategy
                .withFlexibleDimensions()
                .withPush(false)
                .withPositions([{
                    overlayY: 'top',
                    overlayX: 'end',
                    originY: 'top',
                    originX: 'end'
                }]);

            attachOverlay({ positionStrategy });

            const boundingBox = overlayContainer
                .getContainerElement()
                .querySelector('.cdk-overlay-connected-position-bounding-box') as HTMLElement;

            // Ensure that `0px` is set explicitly, rather than the
            // property being left blank due to zero being falsy.
            expect(boundingBox.style.right).toBe('0px');
        });

    });

    describe('onPositionChange with scrollable view properties', () => {
        let scrollable: HTMLDivElement;
        let positionChangeHandler: jasmine.Spy;
        let onPositionChangeSubscription: Subscription;

        beforeEach(() => {
            // Set up the origin
            const originElement = createBlockElement();
            originElement.style.margin = '0 1000px 1000px 0';  // Added so that the container scrolls
            // Create a scrollable container and put the origin inside
            scrollable = createOverflowContainerElement();
            document.body.appendChild(scrollable);
            scrollable.appendChild(originElement);

            // Create a strategy with knowledge of the scrollable container
            const strategy = overlay.position()
                .flexibleConnectedTo(originElement)
                .withPush(false)
                .withPositions([{
                    originX: 'start',
                    originY: 'bottom',
                    overlayX: 'start',
                    overlayY: 'top'
                }]);

            strategy.withScrollableContainers([
                new CdkScrollable(new ElementRef(scrollable), null!, null!) //tslint:disable-line
            ]);

            positionChangeHandler = jasmine.createSpy('positionChange handler');
            onPositionChangeSubscription = strategy.positionChanges
                .pipe(map((event) => event.scrollableViewProperties))
                .subscribe(positionChangeHandler);

            attachOverlay({ positionStrategy: strategy });
        });

        afterEach(() => {
            onPositionChangeSubscription.unsubscribe();
            document.body.removeChild(scrollable);
        });

        it('should evaluate the overlay and origin are both out of the view', () => {
            scrollable.scrollTop = 61;  //tslint:disable-line
            overlayRef.updatePosition();

            expect(positionChangeHandler).toHaveBeenCalledWith(jasmine.objectContaining({
                isOriginClipped: true,
                isOriginOutsideView: true,
                isOverlayClipped: true,
                isOverlayOutsideView: true
            }));
        });
    });

    describe('positioning properties', () => {
        let originElement: HTMLElement;
        let positionStrategy: FlexibleConnectedPositionStrategy;

        beforeEach(() => {
            originElement = createPositionedBlockElement();
            document.body.appendChild(originElement);
            positionStrategy = overlay.position().flexibleConnectedTo(originElement);
        });

        afterEach(() => {
            document.body.removeChild(originElement);
        });

        describe('in ltr', () => {
            it('should use `left` when positioning an element at the start', () => {
                positionStrategy.withPositions([{
                    originX: 'start',
                    originY: 'top',
                    overlayX: 'start',
                    overlayY: 'top'
                }]);

                attachOverlay({ positionStrategy });

                expect(overlayRef.hostElement.style.left).toBeTruthy();
                expect(overlayRef.hostElement.style.right).toBeFalsy();
            });
        });

        describe('in rtl', () => {
            it('should use `left` when positioning an element at the end', () => {
                positionStrategy.withPositions([{
                    originX: 'end',
                    originY: 'top',
                    overlayX: 'end',
                    overlayY: 'top'
                }]);

                attachOverlay({ positionStrategy, direction: 'rtl' });

                expect(overlayRef.hostElement.style.left).toBeTruthy();
                expect(overlayRef.hostElement.style.right).toBeFalsy();
            });
        });

        describe('vertical', () => {
            it('should use `top` when positioning at element along the top', () => {
                positionStrategy.withPositions([{
                    originX: 'start',
                    originY: 'top',
                    overlayX: 'start',
                    overlayY: 'top'
                }]);

                attachOverlay({ positionStrategy });

                expect(overlayRef.hostElement.style.top).toBeTruthy();
                expect(overlayRef.hostElement.style.bottom).toBeFalsy();
            });

            it('should use `bottom` when positioning at element along the bottom', () => {
                positionStrategy.withPositions([{
                    originX: 'start',
                    originY: 'bottom',
                    overlayX: 'start',
                    overlayY: 'bottom'
                }]);

                attachOverlay({ positionStrategy });

                expect(overlayRef.hostElement.style.bottom).toBeTruthy();
                expect(overlayRef.hostElement.style.top).toBeFalsy();
            });
        });

    });

    describe('validations', () => {
        let originElement: HTMLElement;
        let positionStrategy: FlexibleConnectedPositionStrategy;

        beforeEach(() => {
            originElement = createPositionedBlockElement();
            document.body.appendChild(originElement);
            positionStrategy = overlay.position().flexibleConnectedTo(originElement);
        });

        afterEach(() => {
            document.body.removeChild(originElement);
            positionStrategy.dispose();
        });

        it('should throw when attaching without any positions', () => {
            expect(() => positionStrategy.withPositions([])).toThrow();
        });

        it('should throw when passing in something that is missing a connection point', () => {
            expect(() => {
                positionStrategy.withPositions([{
                    originY: 'top',
                    overlayX: 'start',
                    overlayY: 'top'
                } as any]);
            }).toThrow();
        });

        it('should throw when passing in something that has an invalid X position', () => {
            expect(() => {
                positionStrategy.withPositions([{
                    originX: 'left',
                    originY: 'top',
                    overlayX: 'left',
                    overlayY: 'top'
                } as any]);
            }).toThrow();
        });

        it('should throw when passing in something that has an invalid Y position', () => {
            expect(() => {
                positionStrategy.withPositions([{
                    originX: 'start',
                    originY: 'middle',
                    overlayX: 'start',
                    overlayY: 'middle'
                } as any]);
            }).toThrow();
        });
    });

});

/** Creates an absolutely positioned, display: block element with a default size. */
function createPositionedBlockElement() {
    const element = createBlockElement();
    element.style.position = 'absolute';

    return element;
}

/** Creates a block element with a default size. */
function createBlockElement() {
    const element = document.createElement('div');
    element.style.width = `${DEFAULT_WIDTH}px`;
    element.style.height = `${DEFAULT_HEIGHT}px`;
    element.style.backgroundColor = 'rebeccapurple';
    element.style.zIndex = '100';

    return element;
}

/** Creates an overflow container with a set height and width with margin. */
function createOverflowContainerElement() {
    const element = document.createElement('div');
    element.style.position = 'relative';
    element.style.overflow = 'auto';
    element.style.height = '300px';
    element.style.width = '300px';
    element.style.margin = '100px';

    return element;
}


@Component({
    template: `
        <div
            class="transform-origin"
            style="width: 60px; height: 30px;"></div>
    `
})
class TestOverlay {
}


@NgModule({
    imports: [OverlayModule, PortalModule],
    exports: [TestOverlay],
    declarations: [TestOverlay],
    entryComponents: [TestOverlay]
})
class OverlayTestModule {
}
