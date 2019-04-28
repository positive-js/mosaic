// tslint:disable:no-magic-numbers
// tslint:disable:prefer-array-literal
// tslint:disable:no-empty

import {ComponentFixture, fakeAsync, flush, inject, TestBed, tick} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    NgZone,
    Output,
    Provider,
    QueryList,
    TemplateRef,
    Type,
    ViewChild,
    ViewChildren,
} from '@angular/core';
import {Direction, Directionality} from '@ptsecurity/cdk/bidi';
import {Overlay, OverlayContainer} from '@ptsecurity/cdk/overlay';
import {DOWN_ARROW, ESCAPE, LEFT_ARROW, RIGHT_ARROW, TAB} from '@ptsecurity/cdk/keycodes';
import {
    MC_DROPDOWN_DEFAULT_OPTIONS,
    McDropdown,
    McDropdownItem,
    McDropdownModule,
    McDropdownPanel,
    McDropdownTrigger,
    DropdownPositionX,
    DropdownPositionY,
} from './index';
import {MC_DROPDOWN_SCROLL_STRATEGY, NESTED_PANEL_TOP_PADDING} from './dropdown-trigger';
import {
    createKeyboardEvent,
    createMouseEvent,
    dispatchEvent,
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    dispatchMouseEvent,
    MockNgZone,
    patchElementFocus,
} from '@ptsecurity/cdk/testing';
import {Subject} from 'rxjs';
import {ScrollDispatcher} from '@ptsecurity/cdk/scrolling';
import {FocusMonitor} from '@ptsecurity/cdk/a11y';
import {McDropdownContent} from "@ptsecurity/mosaic/dropdown/dropdown-content";


const PANEL_CLASS = 'mc-dropdown__panel';
const ITEM_DIRECTIVE = 'mc-dropdown-item';

describe('McDropdown', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let focusMonitor: FocusMonitor;

    function createComponent<T>(component: Type<T>,
                                providers: Provider[] = [],
                                declarations: any[] = []): ComponentFixture<T> {
        TestBed.configureTestingModule({
            imports: [McDropdownModule, NoopAnimationsModule],
            declarations: [component, ...declarations],
            providers
        }).compileComponents();

        inject([OverlayContainer, FocusMonitor], (oc: OverlayContainer, fm: FocusMonitor) => {
            overlayContainer = oc;
            overlayContainerElement = oc.getContainerElement();
            focusMonitor = fm;
        })();

        return TestBed.createComponent<T>(component);
    }

    afterEach(inject([OverlayContainer], (currentOverlayContainer: OverlayContainer) => {
        // Since we're resetting the testing module in some of the tests,
        // we can potentially have multiple overlay containers.
        currentOverlayContainer.ngOnDestroy();
        overlayContainer.ngOnDestroy();
    }));

    it('should open the dropdown as an idempotent operation', () => {
        const fixture = createComponent(SimpleDropdown, [], [FakeIcon]);
        fixture.detectChanges();
        expect(overlayContainerElement.textContent).toBe('');
        expect(() => {
            fixture.componentInstance.trigger.open();
            fixture.componentInstance.trigger.open();
            fixture.detectChanges();

            expect(overlayContainerElement.textContent).toContain('Item');
            expect(overlayContainerElement.textContent).toContain('Disabled');
        }).not.toThrowError();
    });

    it('should close the dropdown when a click occurs outside the dropdown', fakeAsync(() => {
        const fixture = createComponent(SimpleDropdown, [], [FakeIcon]);
        fixture.detectChanges();
        fixture.componentInstance.trigger.open();

        const backdrop = <HTMLElement> overlayContainerElement.querySelector('.cdk-overlay-backdrop');
        backdrop.click();
        fixture.detectChanges();
        tick(500);

        expect(overlayContainerElement.textContent).toBe('');
    }));

    it('should be able to remove the backdrop', fakeAsync(() => {
        const fixture = createComponent(SimpleDropdown, [], [FakeIcon]);
        fixture.detectChanges();

        fixture.componentInstance.dropdown.hasBackdrop = false;
        fixture.componentInstance.trigger.open();
        fixture.detectChanges();
        tick(500);

        expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeFalsy();
    }));

    it('should be able to remove the backdrop on repeat openings', fakeAsync(() => {
        const fixture = createComponent(SimpleDropdown, [], [FakeIcon]);
        fixture.detectChanges();

        fixture.componentInstance.trigger.open();
        fixture.detectChanges();
        tick(500);

        // Start off with a backdrop.
        expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeTruthy();

        fixture.componentInstance.trigger.close();
        fixture.detectChanges();
        tick(500);

        // Change `hasBackdrop` after the first open.
        fixture.componentInstance.dropdown.hasBackdrop = false;
        fixture.detectChanges();

        // Reopen the menu.
        fixture.componentInstance.trigger.open();
        fixture.detectChanges();
        tick(500);

        expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeFalsy();
    }));

    it('should restore focus to the trigger when the dropdown was opened by keyboard', fakeAsync(() => {
        const fixture = createComponent(SimpleDropdown, [], [FakeIcon]);
        fixture.detectChanges();
        const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

        // A click without a mousedown before it is considered a keyboard open.
        triggerEl.click();
        fixture.detectChanges();

        expect(overlayContainerElement.querySelector(`.${PANEL_CLASS}`)).toBeTruthy();

        fixture.componentInstance.trigger.close();
        fixture.detectChanges();
        tick(500);

        expect(document.activeElement).toBe(triggerEl);
    }));

    it('should be able to set a custom class on the backdrop', fakeAsync(() => {
        const fixture = createComponent(SimpleDropdown, [], [FakeIcon]);

        fixture.componentInstance.backdropClass = 'custom-backdrop';
        fixture.detectChanges();
        fixture.componentInstance.trigger.open();
        fixture.detectChanges();
        tick(500);

        const backdrop = <HTMLElement> overlayContainerElement.querySelector('.cdk-overlay-backdrop');

        expect(backdrop.classList).toContain('custom-backdrop');
    }));

    it('should restore focus to the root trigger when the dropdown was opened by mouse', fakeAsync(() => {
        const fixture = createComponent(SimpleDropdown, [], [FakeIcon]);
        fixture.detectChanges();

        const triggerEl = fixture.componentInstance.triggerEl.nativeElement;
        dispatchFakeEvent(triggerEl, 'mousedown');
        triggerEl.click();
        fixture.detectChanges();

        expect(overlayContainerElement.querySelector(`.${PANEL_CLASS}`)).toBeTruthy();

        fixture.componentInstance.trigger.close();
        fixture.detectChanges();
        tick(500);

        expect(document.activeElement).toBe(triggerEl);
    }));

    it('should restore focus to the root trigger when the dropdown was opened by touch', fakeAsync(() => {
        const fixture = createComponent(SimpleDropdown, [], [FakeIcon]);
        fixture.detectChanges();

        const triggerEl = fixture.componentInstance.triggerEl.nativeElement;
        dispatchFakeEvent(triggerEl, 'touchstart');
        triggerEl.click();
        fixture.detectChanges();

        expect(overlayContainerElement.querySelector(`.${PANEL_CLASS}`)).toBeTruthy();

        fixture.componentInstance.trigger.close();
        fixture.detectChanges();
        flush();

        expect(document.activeElement).toBe(triggerEl);
    }));

    it('should scroll the panel to the top on open, when it is scrollable', fakeAsync(() => {
        const fixture = createComponent(SimpleDropdown, [], [FakeIcon]);
        fixture.detectChanges();

        // Add 50 items to make the dropdown scrollable
        fixture.componentInstance.extraItems = new Array(50).fill('Hello there');
        fixture.detectChanges();

        const triggerEl = fixture.componentInstance.triggerEl.nativeElement;
        dispatchFakeEvent(triggerEl, 'mousedown');
        triggerEl.click();
        fixture.detectChanges();

        // Flush due to the additional tick that is necessary for the FocusMonitor.
        flush();

        expect(overlayContainerElement.querySelector(`.${PANEL_CLASS}`)!.scrollTop).toBe(0);
    }));

    it('should set the proper focus origin when restoring focus after opening by keyboard', fakeAsync(() => {
            const fixture = createComponent(SimpleDropdown, [], [FakeIcon]);
            fixture.detectChanges();
            const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

            patchElementFocus(triggerEl);
            focusMonitor.monitor(triggerEl, false);
            triggerEl.click(); // A click without a mousedown before it is considered a keyboard open.
            fixture.detectChanges();
            fixture.componentInstance.trigger.close();
            fixture.detectChanges();
            tick(500);
            fixture.detectChanges();

            expect(triggerEl.classList).toContain('cdk-program-focused');
            focusMonitor.stopMonitoring(triggerEl);
        }));

    it('should set the proper focus origin when restoring focus after opening by mouse', fakeAsync(() => {
            const fixture = createComponent(SimpleDropdown, [], [FakeIcon]);
            fixture.detectChanges();
            const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

            dispatchMouseEvent(triggerEl, 'mousedown');
            triggerEl.click();
            fixture.detectChanges();
            patchElementFocus(triggerEl);
            focusMonitor.monitor(triggerEl, false);
            fixture.componentInstance.trigger.close();
            fixture.detectChanges();
            tick(500);
            fixture.detectChanges();

            expect(triggerEl.classList).toContain('cdk-mouse-focused');
            focusMonitor.stopMonitoring(triggerEl);
        }));

    it('should set proper focus origin when right clicking on trigger, before opening by keyboard', fakeAsync(() => {
            const fixture = createComponent(SimpleDropdown, [], [FakeIcon]);
            fixture.detectChanges();
            const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

            patchElementFocus(triggerEl);
            focusMonitor.monitor(triggerEl, false);

            // Trigger a fake right click.
            dispatchEvent(triggerEl, createMouseEvent('mousedown', 50, 100, 2));

            // A click without a left button mousedown before it is considered a keyboard open.
            triggerEl.click();
            fixture.detectChanges();

            fixture.componentInstance.trigger.close();
            fixture.detectChanges();
            tick(500);
            fixture.detectChanges();

            expect(triggerEl.classList).toContain('cdk-program-focused');
            focusMonitor.stopMonitoring(triggerEl);
        }));

    it('should set the proper focus origin when restoring focus after opening by touch', fakeAsync(() => {
            const fixture = createComponent(SimpleDropdown, [], [FakeIcon]);
            fixture.detectChanges();
            const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

            dispatchMouseEvent(triggerEl, 'touchstart');
            triggerEl.click();
            fixture.detectChanges();
            patchElementFocus(triggerEl);
            focusMonitor.monitor(triggerEl, false);
            fixture.componentInstance.trigger.close();
            fixture.detectChanges();
            tick(500);
            fixture.detectChanges();
            flush();

            expect(triggerEl.classList).toContain('cdk-touch-focused');
            focusMonitor.stopMonitoring(triggerEl);
        }));

    it('should close the dropdown when pressing ESCAPE', fakeAsync(() => {
        const fixture = createComponent(SimpleDropdown, [], [FakeIcon]);
        fixture.detectChanges();
        fixture.componentInstance.trigger.open();

        const panel = overlayContainerElement.querySelector(`.${PANEL_CLASS}`)!;
        const event = createKeyboardEvent('keydown', ESCAPE);

        dispatchEvent(panel, event);
        fixture.detectChanges();
        tick(500);

        expect(overlayContainerElement.textContent).toBe('');
    }));

    it('should open a custom dropdown', () => {
        const fixture = createComponent(CustomDropdown, [], [CustomDropdownPanel]);
        fixture.detectChanges();
        expect(overlayContainerElement.textContent).toBe('');
        expect(() => {
            fixture.componentInstance.trigger.open();
            fixture.componentInstance.trigger.open();

            expect(overlayContainerElement.textContent).toContain('Custom Dropdown header');
            expect(overlayContainerElement.textContent).toContain('Custom Content');
        }).not.toThrowError();
    });

    it('should set the panel direction based on the trigger direction', () => {
        const fixture = createComponent(SimpleDropdown, [{
            provide: Directionality, useFactory: () => ({value: 'rtl'})}
        ], [FakeIcon]);

        fixture.detectChanges();
        fixture.componentInstance.trigger.open();
        fixture.detectChanges();

        const boundingBox =
            overlayContainerElement.querySelector('.cdk-overlay-connected-position-bounding-box')!;
        expect(boundingBox.getAttribute('dir')).toEqual('rtl');
    });

    it('should update the panel direction if the trigger direction changes', () => {
        const dirProvider = {value: 'rtl'};
        const fixture = createComponent(SimpleDropdown, [{
            provide: Directionality, useFactory: () => dirProvider}
        ], [FakeIcon]);

        fixture.detectChanges();
        fixture.componentInstance.trigger.open();
        fixture.detectChanges();

        let boundingBox =
            overlayContainerElement.querySelector('.cdk-overlay-connected-position-bounding-box')!;
        expect(boundingBox.getAttribute('dir')).toEqual('rtl');

        fixture.componentInstance.trigger.close();
        fixture.detectChanges();

        dirProvider.value = 'ltr';
        fixture.componentInstance.trigger.open();
        fixture.detectChanges();

        boundingBox =
            overlayContainerElement.querySelector('.cdk-overlay-connected-position-bounding-box')!;
        expect(boundingBox.getAttribute('dir')).toEqual('ltr');
    });

    it('should transfer any custom classes from the host to the overlay', () => {
        const fixture = createComponent(SimpleDropdown, [], [FakeIcon]);

        fixture.detectChanges();
        fixture.componentInstance.trigger.open();
        fixture.detectChanges();

        const dropdownEl = fixture.debugElement.query(By.css('mc-dropdown')).nativeElement;
        const panel = overlayContainerElement.querySelector(`.${PANEL_CLASS}`)!;

        expect(dropdownEl.classList).not.toContain('custom-one');
        expect(dropdownEl.classList).not.toContain('custom-two');

        expect(panel.classList).toContain('custom-one');
        expect(panel.classList).toContain('custom-two');
    });

    it('should set the "menu" role on the overlay panel', () => {
        const fixture = createComponent(SimpleDropdown, [], [FakeIcon]);
        fixture.detectChanges();
        fixture.componentInstance.trigger.open();
        fixture.detectChanges();

        const menuPanel = overlayContainerElement.querySelector(`.${PANEL_CLASS}`);

        expect(menuPanel).toBeTruthy('Expected to find a menu panel.');

        const role = menuPanel ? menuPanel.getAttribute('role') : '';
        expect(role).toBe('dropdown', 'Expected panel to have the "dropdown" role.');
    });

    it('should set the "menuitem" role on the items by default', () => {
        const fixture = createComponent(SimpleDropdown, [], [FakeIcon]);
        fixture.detectChanges();
        fixture.componentInstance.trigger.open();
        fixture.detectChanges();

        const items = Array.from(overlayContainerElement.querySelectorAll('.mc-dropdown-item'));

        expect(items.length).toBeGreaterThan(0);
        expect(items.every((item) => item.getAttribute('role') === 'menuitem')).toBe(true);
    });

    it('should be able to set an alternate role on the menu items', () => {
        const fixture = createComponent(MenuWithCheckboxItems);
        fixture.detectChanges();
        fixture.componentInstance.trigger.open();
        fixture.detectChanges();

        const items = Array.from(overlayContainerElement.querySelectorAll('.mc-dropdown-item'));

        expect(items.length).toBeGreaterThan(0);
        expect(items.every((item) => item.getAttribute('role') === 'menuitemcheckbox')).toBe(true);
    });

    it('should not throw an error on destroy', () => {
        const fixture = createComponent(SimpleDropdown, [], [FakeIcon]);
        expect(fixture.destroy.bind(fixture)).not.toThrow();
    });

    it('should be able to extract the dropdown item text', () => {
        const fixture = createComponent(SimpleDropdown, [], [FakeIcon]);
        fixture.detectChanges();
        expect(fixture.componentInstance.items.first.getLabel()).toBe('Item');
    });

    it('should filter out non-text nodes when figuring out the label', () => {
        const fixture = createComponent(SimpleDropdown, [], [FakeIcon]);
        fixture.detectChanges();
        expect(fixture.componentInstance.items.last.getLabel()).toBe('Item with an icon');
    });

    it('should set the proper focus origin when opening by mouse', fakeAsync(() => {
        const fixture = createComponent(SimpleDropdown, [], [FakeIcon]);
        fixture.detectChanges();
        spyOn(fixture.componentInstance.items.first, 'focus').and.callThrough();

        const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

        dispatchMouseEvent(triggerEl, 'mousedown');
        triggerEl.click();
        fixture.detectChanges();
        tick(500);

        // tslint:disable-next-line:no-unbound-method
        expect(fixture.componentInstance.items.first.focus).toHaveBeenCalledWith('mouse');
    }));

    it('should set the proper focus origin when opening by touch', fakeAsync(() => {
        const fixture = createComponent(SimpleDropdown, [], [FakeIcon]);
        fixture.detectChanges();
        spyOn(fixture.componentInstance.items.first, 'focus').and.callThrough();

        const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

        dispatchMouseEvent(triggerEl, 'touchstart');
        triggerEl.click();
        fixture.detectChanges();
        flush();

        // tslint:disable-next-line:no-unbound-method
        expect(fixture.componentInstance.items.first.focus).toHaveBeenCalledWith('touch');
    }));

    it('should close the dropdown when using the CloseScrollStrategy', fakeAsync(() => {
        // tslint:disable-next-line
        const scrolledSubject = new Subject();
        const fixture = createComponent(SimpleDropdown,  [
            {provide: ScrollDispatcher, useFactory: () => ({scrolled: () => scrolledSubject})},
            {
                provide: MC_DROPDOWN_SCROLL_STRATEGY,
                deps: [Overlay],
                useFactory: (overlay: Overlay) => () => overlay.scrollStrategies.close()
            }
        ], [FakeIcon]);
        const trigger = fixture.componentInstance.trigger;

        fixture.detectChanges();
        trigger.open();
        fixture.detectChanges();

        expect(trigger.opened).toBe(true);

        scrolledSubject.next();
        tick(500);

        expect(trigger.opened).toBe(false);
    }));

    it('should switch to keyboard focus when using the keyboard after opening using the mouse', fakeAsync(() => {
            const fixture = createComponent(SimpleDropdown, [], [FakeIcon]);

            fixture.detectChanges();
            fixture.componentInstance.triggerEl.nativeElement.click();
            fixture.detectChanges();

            const panel = document.querySelector(`.${PANEL_CLASS}`)! as HTMLElement;
            const items: HTMLElement[] =
                Array.from(panel.querySelectorAll(`.${PANEL_CLASS} [${ITEM_DIRECTIVE}]`));

            items.forEach(patchElementFocus);

            tick(500);
            tick();
            fixture.detectChanges();
            expect(items.some((item) => item.classList.contains('cdk-keyboard-focused'))).toBe(false);

            dispatchKeyboardEvent(panel, 'keydown', DOWN_ARROW);
            fixture.detectChanges();

            // Flush due to the additional tick that is necessary for the FocusMonitor.
            flush();

            // We skip to the third item, because the second one is disabled.
            expect(items[2].classList).toContain('cdk-focused');
            expect(items[2].classList).toContain('cdk-keyboard-focused');
        }));

    it('should toggle the aria-expanded attribute on the trigger', () => {
        const fixture = createComponent(SimpleDropdown, [], [FakeIcon]);
        fixture.detectChanges();
        const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

        expect(triggerEl.hasAttribute('aria-expanded')).toBe(false);

        fixture.componentInstance.trigger.open();
        fixture.detectChanges();

        expect(triggerEl.getAttribute('aria-expanded')).toBe('true');

        fixture.componentInstance.trigger.close();
        fixture.detectChanges();

        expect(triggerEl.hasAttribute('aria-expanded')).toBe(false);
    });

    it('should throw the correct error if the dropdown is not defined after init', () => {
        const fixture = createComponent(SimpleDropdown, [], [FakeIcon]);
        fixture.detectChanges();

        fixture.componentInstance.trigger.dropdown = null!;
        fixture.detectChanges();

        expect(() => {
            fixture.componentInstance.trigger.open();
            fixture.detectChanges();
        }).toThrowError(/must pass in an mc-dropdown instance/);
    });

    it('should be able to swap out a menu after the first time it is opened', fakeAsync(() => {
        const fixture = createComponent(DynamicPanelMenu);
        fixture.detectChanges();
        expect(overlayContainerElement.textContent).toBe('');

        fixture.componentInstance.trigger.open();
        fixture.detectChanges();

        expect(overlayContainerElement.textContent).toContain('One');
        expect(overlayContainerElement.textContent).not.toContain('Two');

        fixture.componentInstance.trigger.close();
        fixture.detectChanges();
        tick(500);
        fixture.detectChanges();

        expect(overlayContainerElement.textContent).toBe('');

        fixture.componentInstance.trigger.dropdown = fixture.componentInstance.secondMenu;
        fixture.componentInstance.trigger.open();
        fixture.detectChanges();

        expect(overlayContainerElement.textContent).not.toContain('One');
        expect(overlayContainerElement.textContent).toContain('Two');

        fixture.componentInstance.trigger.close();
        fixture.detectChanges();
        tick(500);
        fixture.detectChanges();

        expect(overlayContainerElement.textContent).toBe('');
    }));

    describe('lazy rendering', () => {
        it('should be able to render the dropdown content lazily', fakeAsync(() => {
            const fixture = createComponent(SimpleLazyDropdown);

            fixture.detectChanges();
            fixture.componentInstance.triggerEl.nativeElement.click();
            fixture.detectChanges();
            tick(500);

            const panel = overlayContainerElement.querySelector(`.${PANEL_CLASS}`)!;

            expect(panel).toBeTruthy('Expected panel to be defined');
            expect(panel.textContent).toContain('Another item', 'Expected panel to have correct content');
            expect(fixture.componentInstance.trigger.opened).toBe(true, 'Expected dropdown to be open');
        }));

        it('should detach the lazy content when the dropdown is closed', fakeAsync(() => {
            const fixture = createComponent(SimpleLazyDropdown);

            fixture.detectChanges();
            fixture.componentInstance.trigger.open();
            fixture.detectChanges();
            tick(500);

            expect(fixture.componentInstance.items.length).toBeGreaterThan(0);

            fixture.componentInstance.trigger.close();
            fixture.detectChanges();
            tick(500);
            fixture.detectChanges();

            expect(fixture.componentInstance.items.length).toBe(0);
        }));

        it('should wait for the close animation to finish before considering the panel as closed',
            fakeAsync(() => {
                const fixture = createComponent(SimpleLazyDropdown);
                fixture.detectChanges();
                const trigger = fixture.componentInstance.trigger;

                expect(trigger.opened).toBe(false, 'Expected dropdown to start off closed');

                trigger.open();
                fixture.detectChanges();
                tick(500);

                expect(trigger.opened).toBe(true, 'Expected dropdown to be open');

                trigger.close();
                fixture.detectChanges();

                expect(trigger.opened)
                    .toBe(true, 'Expected dropdown to be considered open while the close animation is running');
                tick(500);
                fixture.detectChanges();

                expect(trigger.opened).toBe(false, 'Expected dropdown to be closed');
            }));

        it('should focus the first dropdown item when opening a lazy dropdown via keyboard', fakeAsync(() => {
            let zone: MockNgZone;
            const fixture = createComponent(SimpleLazyDropdown, [{
                provide: NgZone, useFactory: () => zone = new MockNgZone()
            }]);

            fixture.detectChanges();

            // A click without a mousedown before it is considered a keyboard open.
            fixture.componentInstance.triggerEl.nativeElement.click();
            fixture.detectChanges();
            tick(500);
            // tslint:disable-next-line
            zone!.simulateZoneExit();

            // Flush due to the additional tick that is necessary for the FocusMonitor.
            flush();

            const item = document.querySelector(`.${PANEL_CLASS} [${ITEM_DIRECTIVE}]`)!;

            expect(document.activeElement).toBe(item, 'Expected first item to be focused');
        }));

        it('should be able to open the same dropdown with a different context', fakeAsync(() => {
            const fixture = createComponent(LazyDropdownWithContext);

            fixture.detectChanges();
            fixture.componentInstance.triggerOne.open();
            fixture.detectChanges();
            tick(500);

            let item = overlayContainerElement.querySelector(`.${PANEL_CLASS} [${ITEM_DIRECTIVE}]`)!;

            expect(item.textContent!.trim()).toBe('one');

            fixture.componentInstance.triggerOne.close();
            fixture.detectChanges();
            tick(500);

            fixture.componentInstance.triggerTwo.open();
            fixture.detectChanges();
            tick(500);
            item = overlayContainerElement.querySelector(`.${PANEL_CLASS} [${ITEM_DIRECTIVE}]`)!;

            expect(item.textContent!.trim()).toBe('two');
        }));
    });

    describe('positions', () => {
        let fixture: ComponentFixture<PositionedDropdown>;
        let trigger: HTMLElement;

        beforeEach(() => {
            fixture = createComponent(PositionedDropdown);
            fixture.detectChanges();

            trigger = fixture.componentInstance.triggerEl.nativeElement;

            // Push trigger to the bottom edge of viewport,so it has space to open "above"
            trigger.style.position = 'fixed';
            trigger.style.top = '600px';

            // Push trigger to the right, so it has space to open "before"
            trigger.style.left = '100px';
        });

        it('should append mc-dropdown-before if the x position is changed', () => {
            fixture.componentInstance.trigger.open();
            fixture.detectChanges();

            const panel = overlayContainerElement.querySelector(`.${PANEL_CLASS}`) as HTMLElement;

            expect(panel.classList).toContain('mc-dropdown-before');
            expect(panel.classList).not.toContain('mc-dropdown-after');

            fixture.componentInstance.xPosition = 'after';
            fixture.detectChanges();

            expect(panel.classList).toContain('mc-dropdown-after');
            expect(panel.classList).not.toContain('mc-dropdown-before');
        });

        it('should append mc-dropdown-above if the y position is changed', () => {
            fixture.componentInstance.trigger.open();
            fixture.detectChanges();

            const panel = overlayContainerElement.querySelector(`.${PANEL_CLASS}`) as HTMLElement;

            expect(panel.classList).toContain('mc-dropdown-above');
            expect(panel.classList).not.toContain('mc-dropdown-below');

            fixture.componentInstance.yPosition = 'below';
            fixture.detectChanges();

            expect(panel.classList).toContain('mc-dropdown-below');
            expect(panel.classList).not.toContain('mc-dropdown-above');
        });

        it('should default to the "below" and "after" positions', () => {
            overlayContainer.ngOnDestroy();
            fixture.destroy();
            TestBed.resetTestingModule();

            const newFixture = createComponent(SimpleDropdown, [], [FakeIcon]);

            newFixture.detectChanges();
            newFixture.componentInstance.trigger.open();
            newFixture.detectChanges();
            const panel = overlayContainerElement.querySelector(`.${PANEL_CLASS}`) as HTMLElement;

            expect(panel.classList).toContain('mc-dropdown-below');
            expect(panel.classList).toContain('mc-dropdown-after');
        });

        it('should be able to update the position after the first open', () => {
            trigger.style.position = 'fixed';
            trigger.style.top = '200px';

            fixture.componentInstance.yPosition = 'above';
            fixture.detectChanges();

            fixture.componentInstance.trigger.open();
            fixture.detectChanges();

            let panel = overlayContainerElement.querySelector(`.${PANEL_CLASS}`) as HTMLElement;

            expect(Math.floor(panel.getBoundingClientRect().bottom))
                .toBe(Math.floor(trigger.getBoundingClientRect().top), 'Expected menu to open above');

            fixture.componentInstance.trigger.close();
            fixture.detectChanges();

            fixture.componentInstance.yPosition = 'below';
            fixture.detectChanges();

            fixture.componentInstance.trigger.open();
            fixture.detectChanges();
            panel = overlayContainerElement.querySelector(`.${PANEL_CLASS}`) as HTMLElement;

            expect(Math.floor(panel.getBoundingClientRect().top))
                .toBe(Math.floor(trigger.getBoundingClientRect().bottom), 'Expected menu to open below');
        });

    });

    describe('fallback positions', () => {

        it('should fall back to "before" mode if "after" mode would not fit on screen', () => {
            const fixture = createComponent(SimpleDropdown, [], [FakeIcon]);
            fixture.detectChanges();
            const trigger = fixture.componentInstance.triggerEl.nativeElement;

            // Push trigger to the right side of viewport, so it doesn't have space to open
            // in its default "after" position on the right side.
            trigger.style.position = 'fixed';
            trigger.style.right = '0';
            trigger.style.top = '200px';

            fixture.componentInstance.trigger.open();
            fixture.detectChanges();
            const overlayPane = getOverlayPane();
            const triggerRect = trigger.getBoundingClientRect();
            const overlayRect = overlayPane.getBoundingClientRect();

            // In "before" position, the right sides of the overlay and the origin are aligned.
            // To find the overlay left, subtract the menu width from the origin's right side.
            const expectedLeft = triggerRect.right - overlayRect.width;
            expect(Math.floor(overlayRect.left))
                .toBe(Math.floor(expectedLeft),
                    `Expected menu to open in "before" position if "after" position wouldn't fit.`);

            // The y-position of the overlay should be unaffected, as it can already fit vertically
            expect(Math.floor(overlayRect.top))
                .toBe(Math.floor(triggerRect.bottom),
                    `Expected menu top position to be unchanged if it can fit in the viewport.`);
        });

        it('should fall back to "above" mode if "below" mode would not fit on screen', () => {
            const fixture = createComponent(SimpleDropdown, [], [FakeIcon]);
            fixture.detectChanges();
            const trigger = fixture.componentInstance.triggerEl.nativeElement;

            // Push trigger to the bottom part of viewport, so it doesn't have space to open
            // in its default "below" position below the trigger.
            trigger.style.position = 'fixed';
            trigger.style.bottom = '65px';

            fixture.componentInstance.trigger.open();
            fixture.detectChanges();
            const overlayPane = getOverlayPane();
            const triggerRect = trigger.getBoundingClientRect();
            const overlayRect = overlayPane.getBoundingClientRect();

            expect(Math.floor(overlayRect.bottom))
                .toBe(Math.floor(triggerRect.top),
                    `Expected menu to open in "above" position if "below" position wouldn't fit.`);

            // The x-position of the overlay should be unaffected, as it can already fit horizontally
            expect(Math.floor(overlayRect.left))
                .toBe(Math.floor(triggerRect.left),
                    `Expected menu x position to be unchanged if it can fit in the viewport.`);
        });

        it('should re-position menu on both axes if both defaults would not fit', () => {
            const fixture = createComponent(SimpleDropdown, [], [FakeIcon]);
            fixture.detectChanges();
            const trigger = fixture.componentInstance.triggerEl.nativeElement;

            // push trigger to the bottom, right part of viewport, so it doesn't have space to open
            // in its default "after below" position.
            trigger.style.position = 'fixed';
            trigger.style.right = '0';
            trigger.style.bottom = '0';

            fixture.componentInstance.trigger.open();
            fixture.detectChanges();
            const overlayPane = getOverlayPane();
            const triggerRect = trigger.getBoundingClientRect();
            const overlayRect = overlayPane.getBoundingClientRect();

            const expectedLeft = triggerRect.right - overlayRect.width;

            expect(Math.floor(overlayRect.left))
                .toBe(Math.floor(expectedLeft),
                    `Expected menu to open in "before" position if "after" position wouldn't fit.`);

            expect(Math.floor(overlayRect.bottom))
                .toBe(Math.floor(triggerRect.top),
                    `Expected menu to open in "above" position if "below" position wouldn't fit.`);
        });

        it('should re-position a menu with custom position set', () => {
            const fixture = createComponent(PositionedDropdown);
            fixture.detectChanges();
            const trigger = fixture.componentInstance.triggerEl.nativeElement;

            fixture.componentInstance.trigger.open();
            fixture.detectChanges();
            const overlayPane = getOverlayPane();
            const triggerRect = trigger.getBoundingClientRect();
            const overlayRect = overlayPane.getBoundingClientRect();

            // As designated "before" position won't fit on screen, the menu should fall back
            // to "after" mode, where the left sides of the overlay and trigger are aligned.
            expect(Math.floor(overlayRect.left))
                .toBe(Math.floor(triggerRect.left),
                    `Expected menu to open in "after" position if "before" position wouldn't fit.`);

            // As designated "above" position won't fit on screen, the menu should fall back
            // to "below" mode, where the top edges of the overlay and trigger are aligned.
            expect(Math.floor(overlayRect.top))
                .toBe(Math.floor(triggerRect.bottom),
                    `Expected menu to open in "below" position if "above" position wouldn't fit.`);
        });

        function getOverlayPane(): HTMLElement {
            return overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
        }
    });

    describe('overlapping trigger', () => {
        /**
         * This test class is used to create components containing a menu.
         * It provides helpers to reposition the trigger, open the menu,
         * and access the trigger and overlay positions.
         * Additionally it can take any inputs for the menu wrapper component.
         *
         * Basic usage:
         * const subject = new OverlapSubject(MyComponent);
         * subject.open();
         */
        class OverlapSubject<T extends TestableMenu> {
            readonly fixture: ComponentFixture<T>;
            readonly trigger: HTMLElement;

            constructor(ctor: { new(): T; }, inputs: { [key: string]: any } = {}) {
                this.fixture = createComponent(ctor);
                Object.keys(inputs)
                    .forEach((key) => (this.fixture.componentInstance as any)[key] = inputs[key]);
                this.fixture.detectChanges();
                this.trigger = this.fixture.componentInstance.triggerEl.nativeElement;
            }

            open() {
                this.fixture.componentInstance.trigger.open();
                this.fixture.detectChanges();
            }

            get overlayRect() {
                return this.getOverlayPane().getBoundingClientRect();
            }

            get triggerRect() {
                return this.trigger.getBoundingClientRect();
            }

            get menuPanel() {
                return overlayContainerElement.querySelector(`.${PANEL_CLASS}`);
            }

            private getOverlayPane() {
                return overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
            }
        }

        let subject: OverlapSubject<OverlapMenu>;
        describe('explicitly overlapping', () => {
            beforeEach(() => {
                subject = new OverlapSubject(OverlapMenu, {overlapTriggerY: true});
            });

            it('positions the overlay below the trigger', () => {
                subject.open();

                // Since the menu is overlaying the trigger, the overlay top should be the trigger top.
                expect(Math.floor(subject.overlayRect.top))
                    .toBe(Math.floor(subject.triggerRect.top),
                        `Expected menu to open in default "below" position.`);
            });
        });

        describe('not overlapping', () => {
            beforeEach(() => {
                subject = new OverlapSubject(OverlapMenu, {overlapTriggerY: false});
            });

            it('positions the overlay below the trigger', () => {
                subject.open();

                // Since the menu is below the trigger, the overlay top should be the trigger bottom.
                expect(Math.floor(subject.overlayRect.top))
                    .toBe(Math.floor(subject.triggerRect.bottom),
                        `Expected menu to open directly below the trigger.`);
            });

            it('supports above position fall back', () => {
                // Push trigger to the bottom part of viewport, so it doesn't have space to open
                // in its default "below" position below the trigger.
                subject.trigger.style.position = 'fixed';
                subject.trigger.style.bottom = '0';
                subject.open();

                // Since the menu is above the trigger, the overlay bottom should be the trigger top.
                expect(Math.floor(subject.overlayRect.bottom))
                    .toBe(Math.floor(subject.triggerRect.top),
                        `Expected menu to open in "above" position if "below" position wouldn't fit.`);
            });

            it('repositions the origin to be below, so the menu opens from the trigger', () => {
                subject.open();
                subject.fixture.detectChanges();

                expect(subject.menuPanel!.classList).toContain('mc-dropdown-below');
                expect(subject.menuPanel!.classList).not.toContain('mc-dropdown-above');
            });
        });
    });

    describe('close event', () => {
        let fixture: ComponentFixture<SimpleDropdown>;

        beforeEach(() => {
            fixture = createComponent(SimpleDropdown, [], [FakeIcon]);
            fixture.detectChanges();
            fixture.componentInstance.trigger.open();
            fixture.detectChanges();
        });

        it('should emit an event when a dropdown item is clicked', () => {
            const dropdownItem = overlayContainerElement.querySelector(`[${ITEM_DIRECTIVE}]`) as HTMLElement;

            dropdownItem.click();
            fixture.detectChanges();

            expect(fixture.componentInstance.closeCallback).toHaveBeenCalledWith('click');
            expect(fixture.componentInstance.closeCallback).toHaveBeenCalledTimes(1);
        });

        it('should emit a close event when the backdrop is clicked', () => {
            const backdrop = overlayContainerElement
                .querySelector('.cdk-overlay-backdrop') as HTMLElement;

            backdrop.click();
            fixture.detectChanges();

            expect(fixture.componentInstance.closeCallback).toHaveBeenCalledWith(undefined);
            expect(fixture.componentInstance.closeCallback).toHaveBeenCalledTimes(1);
        });

        it('should emit an event when pressing ESCAPE', () => {
            const dropdown = overlayContainerElement.querySelector(`.${PANEL_CLASS}`) as HTMLElement;

            dispatchKeyboardEvent(dropdown, 'keydown', ESCAPE);
            fixture.detectChanges();

            expect(fixture.componentInstance.closeCallback).toHaveBeenCalledWith('keydown');
            expect(fixture.componentInstance.closeCallback).toHaveBeenCalledTimes(1);
        });

        it('should complete the callback when the dropdown is destroyed', () => {
            const emitCallback = jasmine.createSpy('emit callback');
            const completeCallback = jasmine.createSpy('complete callback');

            fixture.componentInstance.dropdown.closed.subscribe(emitCallback, null, completeCallback);
            fixture.destroy();

            expect(emitCallback).toHaveBeenCalledWith(undefined);
            expect(emitCallback).toHaveBeenCalledTimes(1);
            expect(completeCallback).toHaveBeenCalled();
        });
    });

    describe('nested menu', () => {
        let fixture: ComponentFixture<NestedMenu>;
        let instance: NestedMenu;
        let overlay: HTMLElement;
        const compileTestComponent = (direction: Direction = 'ltr') => {
            fixture = createComponent(NestedMenu, [{
                provide: Directionality, useFactory: () => ({value: direction})
            }]);

            fixture.detectChanges();
            instance = fixture.componentInstance;
            overlay = overlayContainerElement;
        };

        it('should set the `triggersSubmenu` flags on the triggers', () => {
            compileTestComponent();
            expect(instance.rootTrigger.triggersSubmenu()).toBe(false);
            expect(instance.levelOneTrigger.triggersSubmenu()).toBe(true);
            expect(instance.levelTwoTrigger.triggersSubmenu()).toBe(true);
        });

        it('should set the `parentMenu` on the sub-menu instances', () => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();

            instance.levelOneTrigger.open();
            fixture.detectChanges();

            instance.levelTwoTrigger.open();
            fixture.detectChanges();

            expect(instance.rootMenu.parent).toBeFalsy();
            expect(instance.levelOneMenu.parent).toBe(instance.rootMenu);
            expect(instance.levelTwoMenu.parent).toBe(instance.levelOneMenu);
        });

        it('should pass the layout direction the nested menus', () => {
            compileTestComponent('rtl');
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();

            instance.levelOneTrigger.open();
            fixture.detectChanges();

            instance.levelTwoTrigger.open();
            fixture.detectChanges();

            expect(instance.rootMenu.direction).toBe('rtl');
            expect(instance.levelOneMenu.direction).toBe('rtl');
            expect(instance.levelTwoMenu.direction).toBe('rtl');
        });

        it('should emit an event when the hover state of the menu items changes', () => {
            compileTestComponent();
            instance.rootTrigger.open();
            fixture.detectChanges();

            const spy = jasmine.createSpy('hover spy');
            const subscription = instance.rootMenu._hovered().subscribe(spy);
            const menuItems = overlay.querySelectorAll('[mc-dropdown-item]');

            dispatchMouseEvent(menuItems[0], 'mouseenter');
            fixture.detectChanges();

            expect(spy).toHaveBeenCalledTimes(1);

            dispatchMouseEvent(menuItems[1], 'mouseenter');
            fixture.detectChanges();

            expect(spy).toHaveBeenCalledTimes(2);

            subscription.unsubscribe();
        });

        it('should toggle a nested menu when its trigger is hovered', fakeAsync(() => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();
            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length).toBe(1, 'Expected one open menu');

            const items = Array.from(overlay.querySelectorAll(`.${PANEL_CLASS} [mc-dropdown-item]`));
            const levelOneTrigger = overlay.querySelector('#level-one-trigger')!;

            dispatchMouseEvent(levelOneTrigger, 'mouseenter');
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(levelOneTrigger.classList)
                .toContain('mc-dropdown__item_highlighted', 'Expected the trigger to be highlighted');
            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length).toBe(2, 'Expected two open menus');

            dispatchMouseEvent(items[items.indexOf(levelOneTrigger) + 1], 'mouseenter');
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length).toBe(1, 'Expected one open menu');
            expect(levelOneTrigger.classList)
                .not.toContain('mc-dropdown-item-highlighted', 'Expected the trigger to not be highlighted');
        }));

        it('should close all the open sub-menus when the hover state is changed at the root',
            fakeAsync(() => {
                compileTestComponent();
                instance.rootTriggerEl.nativeElement.click();
                fixture.detectChanges();

                const items = Array.from(overlay.querySelectorAll(`.${PANEL_CLASS} [mc-dropdown-item]`));
                const levelOneTrigger = overlay.querySelector('#level-one-trigger')!;

                dispatchMouseEvent(levelOneTrigger, 'mouseenter');
                fixture.detectChanges();
                tick();

                const levelTwoTrigger = overlay.querySelector('#level-two-trigger')! as HTMLElement;
                dispatchMouseEvent(levelTwoTrigger, 'mouseenter');
                fixture.detectChanges();
                tick();

                expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length)
                    .toBe(3, 'Expected three open menus');

                dispatchMouseEvent(items[items.indexOf(levelOneTrigger) + 1], 'mouseenter');
                fixture.detectChanges();
                tick(500);

                expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length)
                    .toBe(1, 'Expected one open menu');
            }));

        it('should close submenu when hovering over disabled sibling item', fakeAsync(() => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();
            tick(500);

            const items = fixture.debugElement.queryAll(By.directive(McDropdownItem));

            dispatchFakeEvent(items[0].nativeElement, 'mouseenter');
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length)
                .toBe(2, 'Expected two open menus');

            items[1].componentInstance.disabled = true;
            fixture.detectChanges();

            // Invoke the handler directly since the fake events are flaky on disabled elements.
            items[1].componentInstance._handleMouseEnter();
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length)
                .toBe(1, 'Expected one open menu');
        }));

        it('should not open submenu when hovering over disabled trigger', fakeAsync(() => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length)
                .toBe(1, 'Expected one open menu');

            const item = fixture.debugElement.query(By.directive(McDropdownItem));

            item.componentInstance.disabled = true;
            fixture.detectChanges();

            // Invoke the handler directly since the fake events are flaky on disabled elements.
            item.componentInstance._handleMouseEnter();
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length)
                .toBe(1, 'Expected to remain at one open menu');
        }));


        it('should open a nested menu when its trigger is clicked', () => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();
            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length).toBe(1, 'Expected one open menu');

            const levelOneTrigger = overlay.querySelector('#level-one-trigger')! as HTMLElement;

            levelOneTrigger.click();
            fixture.detectChanges();
            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length).toBe(2, 'Expected two open menus');

            levelOneTrigger.click();
            fixture.detectChanges();
            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length)
                .toBe(2, 'Expected repeat clicks not to close the menu.');
        });

        it('should open and close a nested menu with arrow keys in ltr', fakeAsync(() => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();
            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length).toBe(1, 'Expected one open menu');

            const levelOneTrigger = overlay.querySelector('#level-one-trigger')! as HTMLElement;

            dispatchKeyboardEvent(levelOneTrigger, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();

            const panels = overlay.querySelectorAll(`.${PANEL_CLASS}`);

            expect(panels.length).toBe(2, 'Expected two open menus');
            dispatchKeyboardEvent(panels[1], 'keydown', LEFT_ARROW);
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length).toBe(1);
        }));

        it('should open and close a nested menu with the arrow keys in rtl', fakeAsync(() => {
            compileTestComponent('rtl');
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();
            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length).toBe(1, 'Expected one open menu');

            const levelOneTrigger = overlay.querySelector('#level-one-trigger')! as HTMLElement;

            dispatchKeyboardEvent(levelOneTrigger, 'keydown', LEFT_ARROW);
            fixture.detectChanges();

            const panels = overlay.querySelectorAll(`.${PANEL_CLASS}`);

            expect(panels.length).toBe(2, 'Expected two open menus');
            dispatchKeyboardEvent(panels[1], 'keydown', RIGHT_ARROW);
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length).toBe(1);
        }));

        it('should not do anything with the arrow keys for a top-level menu', () => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();

            const menu = overlay.querySelector(`.${PANEL_CLASS}`)!;

            dispatchKeyboardEvent(menu, 'keydown', RIGHT_ARROW);
            fixture.detectChanges();
            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length)
                .toBe(1, 'Expected one menu to remain open');

            dispatchKeyboardEvent(menu, 'keydown', LEFT_ARROW);
            fixture.detectChanges();
            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length)
                .toBe(1, 'Expected one menu to remain open');
        });

        it('should close all of the menus when the backdrop is clicked', fakeAsync(() => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();

            instance.levelOneTrigger.open();
            fixture.detectChanges();

            instance.levelTwoTrigger.open();
            fixture.detectChanges();

            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length)
                .toBe(3, 'Expected three open menus');
            expect(overlay.querySelectorAll('.cdk-overlay-backdrop').length)
                .toBe(1, 'Expected one backdrop element');
            expect(overlay.querySelectorAll(`.${PANEL_CLASS}, .cdk-overlay-backdrop`)[0].classList)
                .toContain('cdk-overlay-backdrop', 'Expected backdrop to be beneath all of the menus');

            (overlay.querySelector('.cdk-overlay-backdrop')! as HTMLElement).click();
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length).toBe(0, 'Expected no open menus');
        }));

        it('should shift focus between the sub-menus', () => {
            compileTestComponent();
            instance.rootTrigger.open();
            fixture.detectChanges();

            expect(overlay.querySelector(`.${PANEL_CLASS}`)!.contains(document.activeElement))
                .toBe(true, 'Expected focus to be inside the root menu');

            instance.levelOneTrigger.open();
            fixture.detectChanges();

            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`)[1].contains(document.activeElement))
                .toBe(true, 'Expected focus to be inside the first nested menu');

            instance.levelTwoTrigger.open();
            fixture.detectChanges();

            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`)[2].contains(document.activeElement))
                .toBe(true, 'Expected focus to be inside the second nested menu');

            instance.levelTwoTrigger.close();
            fixture.detectChanges();

            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`)[1].contains(document.activeElement))
                .toBe(true, 'Expected focus to be back inside the first nested menu');

            instance.levelOneTrigger.close();
            fixture.detectChanges();

            expect(overlay.querySelector(`.${PANEL_CLASS}`)!.contains(document.activeElement))
                .toBe(true, 'Expected focus to be back inside the root menu');
        });

        it('should position the sub-menu to the right edge of the trigger in ltr', () => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.style.position = 'fixed';
            instance.rootTriggerEl.nativeElement.style.left = '50px';
            instance.rootTriggerEl.nativeElement.style.top = '50px';
            instance.rootTrigger.open();
            fixture.detectChanges();

            instance.levelOneTrigger.open();
            fixture.detectChanges();

            const triggerRect = overlay.querySelector('#level-one-trigger')!.getBoundingClientRect();
            const panelRect = overlay.querySelectorAll('.cdk-overlay-pane')[1].getBoundingClientRect();

            expect(Math.round(triggerRect.right)).toBe(Math.round(panelRect.left));
            expect(Math.round(triggerRect.top)).toBe(Math.round(panelRect.top) + NESTED_PANEL_TOP_PADDING);
        });

        it('should fall back to aligning to the left edge of the trigger in ltr', () => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.style.position = 'fixed';
            instance.rootTriggerEl.nativeElement.style.right = '10px';
            instance.rootTriggerEl.nativeElement.style.top = '50%';
            instance.rootTrigger.open();
            fixture.detectChanges();

            instance.levelOneTrigger.open();
            fixture.detectChanges();

            const triggerRect = overlay.querySelector('#level-one-trigger')!.getBoundingClientRect();
            const panelRect = overlay.querySelectorAll('.cdk-overlay-pane')[1].getBoundingClientRect();

            expect(Math.round(triggerRect.left)).toBe(Math.round(panelRect.right));
            expect(Math.round(triggerRect.top)).toBe(Math.round(panelRect.top) + NESTED_PANEL_TOP_PADDING);
        });

        it('should position the sub-menu to the left edge of the trigger in rtl', () => {
            compileTestComponent('rtl');
            instance.rootTriggerEl.nativeElement.style.position = 'fixed';
            instance.rootTriggerEl.nativeElement.style.left = '50%';
            instance.rootTriggerEl.nativeElement.style.top = '50%';
            instance.rootTrigger.open();
            fixture.detectChanges();

            instance.levelOneTrigger.open();
            fixture.detectChanges();

            const triggerRect = overlay.querySelector('#level-one-trigger')!.getBoundingClientRect();
            const panelRect = overlay.querySelectorAll('.cdk-overlay-pane')[1].getBoundingClientRect();

            expect(Math.round(triggerRect.left)).toBe(Math.round(panelRect.right));
            expect(Math.round(triggerRect.top)).toBe(Math.round(panelRect.top) + NESTED_PANEL_TOP_PADDING);
        });

        it('should fall back to aligning to the right edge of the trigger in rtl', fakeAsync(() => {
            compileTestComponent('rtl');
            instance.rootTriggerEl.nativeElement.style.position = 'fixed';
            instance.rootTriggerEl.nativeElement.style.left = '10px';
            instance.rootTriggerEl.nativeElement.style.top = '50%';
            instance.rootTrigger.open();
            fixture.detectChanges();
            tick(500);

            instance.levelOneTrigger.open();
            fixture.detectChanges();
            tick(500);

            const triggerRect = overlay.querySelector('#level-one-trigger')!.getBoundingClientRect();
            const panelRect = overlay.querySelectorAll('.cdk-overlay-pane')[1].getBoundingClientRect();

            expect(Math.round(triggerRect.right)).toBe(Math.round(panelRect.left));
            expect(Math.round(triggerRect.top)).toBe(Math.round(panelRect.top) + NESTED_PANEL_TOP_PADDING);
        }));

        it('should close all of the menus when an item is clicked', fakeAsync(() => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();

            instance.levelOneTrigger.open();
            fixture.detectChanges();

            instance.levelTwoTrigger.open();
            fixture.detectChanges();

            const menus = overlay.querySelectorAll(`.${PANEL_CLASS}`);

            expect(menus.length).toBe(3, 'Expected three open menus');

            (menus[2].querySelector('.mc-dropdown-item')! as HTMLElement).click();
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length).toBe(0, 'Expected no open menus');
        }));

        it('should close all of the menus when the user tabs away', fakeAsync(() => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();

            instance.levelOneTrigger.open();
            fixture.detectChanges();

            instance.levelTwoTrigger.open();
            fixture.detectChanges();

            const menus = overlay.querySelectorAll(`.${PANEL_CLASS}`);

            expect(menus.length).toBe(3, 'Expected three open menus');

            dispatchKeyboardEvent(menus[menus.length - 1], 'keydown', TAB);
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length).toBe(0, 'Expected no open menus');
        }));

        it('should set a class on the menu items that trigger a sub-menu', () => {
            compileTestComponent();
            instance.rootTrigger.open();
            fixture.detectChanges();

            const menuItems = overlay.querySelectorAll('[mc-dropdown-item]');

            expect(menuItems[0].classList).toContain('mc-dropdown-item-submenu-trigger');
            expect(menuItems[1].classList).not.toContain('mc-dropdown-item-submenu-trigger');
        });

        it('should close all of the menus when the root is closed programmatically', fakeAsync(() => {
            compileTestComponent();
            instance.rootTrigger.open();
            fixture.detectChanges();

            instance.levelOneTrigger.open();
            fixture.detectChanges();

            instance.levelTwoTrigger.open();
            fixture.detectChanges();

            const menus = overlay.querySelectorAll(`.${PANEL_CLASS}`);

            expect(menus.length).toBe(3, 'Expected three open menus');

            instance.rootTrigger.close();
            fixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length).toBe(0, 'Expected no open menus');
        }));

        it('should toggle a nested menu when its trigger is added after init', fakeAsync(() => {
            compileTestComponent();
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();
            tick(500);
            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length).toBe(1, 'Expected one open menu');

            instance.showLazy = true;
            fixture.detectChanges();

            const lazyTrigger = overlay.querySelector('#lazy-trigger')!;

            dispatchMouseEvent(lazyTrigger, 'mouseenter');
            fixture.detectChanges();
            tick(500);
            fixture.detectChanges();

            expect(lazyTrigger.classList)
                .toContain('mc-dropdown__item_highlighted', 'Expected the trigger to be highlighted');
            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length).toBe(2, 'Expected two open menus');
        }));

        it('should prevent the default mousedown action if the menu item opens a sub-menu', () => {
            compileTestComponent();
            instance.rootTrigger.open();
            fixture.detectChanges();

            const event = createMouseEvent('mousedown');

            Object.defineProperty(event, 'buttons', {get: () => 1});
            event.preventDefault = jasmine.createSpy('preventDefault spy');

            dispatchMouseEvent(overlay.querySelector('[mc-dropdown-item]')!, 'mousedown', 0, 0, event);
            expect(event.preventDefault).toHaveBeenCalled();
        });

        it('should handle the items being rendered in a repeater', fakeAsync(() => {
            const repeaterFixture = createComponent(NestedMenuRepeater);
            overlay = overlayContainerElement;

            expect(() => repeaterFixture.detectChanges()).not.toThrow();

            repeaterFixture.componentInstance.rootTriggerEl.nativeElement.click();
            repeaterFixture.detectChanges();
            tick(500);
            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length).toBe(1, 'Expected one open menu');

            dispatchMouseEvent(overlay.querySelector('.level-one-trigger')!, 'mouseenter');
            repeaterFixture.detectChanges();
            tick(500);
            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length).toBe(2, 'Expected two open menus');
        }));

        it('should be able to trigger the same nested menu from different triggers', fakeAsync(() => {
            const repeaterFixture = createComponent(NestedMenuRepeater);
            overlay = overlayContainerElement;

            repeaterFixture.detectChanges();
            repeaterFixture.componentInstance.rootTriggerEl.nativeElement.click();
            repeaterFixture.detectChanges();
            tick(500);
            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length).toBe(1, 'Expected one open menu');

            const triggers = overlay.querySelectorAll('.level-one-trigger');

            dispatchMouseEvent(triggers[0], 'mouseenter');
            repeaterFixture.detectChanges();
            tick(500);
            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length).toBe(2, 'Expected two open menus');

            dispatchMouseEvent(triggers[1], 'mouseenter');
            repeaterFixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length).toBe(2, 'Expected two open menus');
        }));

        it('should close the initial menu if the user moves away while animating', fakeAsync(() => {
            const repeaterFixture = createComponent(NestedMenuRepeater);
            overlay = overlayContainerElement;

            repeaterFixture.detectChanges();
            repeaterFixture.componentInstance.rootTriggerEl.nativeElement.click();
            repeaterFixture.detectChanges();
            tick(500);
            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length).toBe(1, 'Expected one open menu');

            const triggers = overlay.querySelectorAll('.level-one-trigger');

            dispatchMouseEvent(triggers[0], 'mouseenter');
            repeaterFixture.detectChanges();
            tick(100);
            dispatchMouseEvent(triggers[1], 'mouseenter');
            repeaterFixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length).toBe(2, 'Expected two open menus');
        }));

        it('should be able to open a submenu through an item that is not a direct descendant ' +
            'of the panel', fakeAsync(() => {
            const nestedFixture = createComponent(SubmenuDeclaredInsideParentMenu);
            overlay = overlayContainerElement;

            nestedFixture.detectChanges();
            nestedFixture.componentInstance.rootTriggerEl.nativeElement.click();
            nestedFixture.detectChanges();
            tick(500);
            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length)
                .toBe(1, 'Expected one open menu');

            dispatchMouseEvent(overlay.querySelector('.level-one-trigger')!, 'mouseenter');
            nestedFixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length)
                .toBe(2, 'Expected two open menus');
        }));

        it('should not close when hovering over a menu item inside a sub-menu panel that is declared' +
            'inside the root menu', fakeAsync(() => {
            const nestedFixture = createComponent(SubmenuDeclaredInsideParentMenu);
            overlay = overlayContainerElement;

            nestedFixture.detectChanges();
            nestedFixture.componentInstance.rootTriggerEl.nativeElement.click();
            nestedFixture.detectChanges();
            tick(500);
            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length)
                .toBe(1, 'Expected one open menu');

            dispatchMouseEvent(overlay.querySelector('.level-one-trigger')!, 'mouseenter');
            nestedFixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length)
                .toBe(2, 'Expected two open menus');

            dispatchMouseEvent(overlay.querySelector('.level-two-item')!, 'mouseenter');
            nestedFixture.detectChanges();
            tick(500);

            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length)
                .toBe(2, 'Expected two open menus to remain');
        }));

        it('should not re-focus a child menu trigger when hovering another trigger', fakeAsync(() => {
            compileTestComponent();

            dispatchFakeEvent(instance.rootTriggerEl.nativeElement, 'mousedown');
            instance.rootTriggerEl.nativeElement.click();
            fixture.detectChanges();

            const items = Array.from(overlay.querySelectorAll(`.${PANEL_CLASS} [mc-dropdown-item]`));
            const levelOneTrigger = overlay.querySelector('#level-one-trigger')!;

            dispatchMouseEvent(levelOneTrigger, 'mouseenter');
            fixture.detectChanges();
            tick();
            expect(overlay.querySelectorAll(`.${PANEL_CLASS}`).length).toBe(2, 'Expected two open menus');

            dispatchMouseEvent(items[items.indexOf(levelOneTrigger) + 1], 'mouseenter');
            fixture.detectChanges();
            tick(500);

            expect(document.activeElement)
                .not.toBe(levelOneTrigger, 'Expected focus not to be returned to the initial trigger.');
        }));

    });

});

describe('McDropdown default overrides', () => {
    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [McDropdownModule, NoopAnimationsModule],
            declarations: [SimpleDropdown, FakeIcon],
            providers: [{
                provide: MC_DROPDOWN_DEFAULT_OPTIONS,
                useValue: {overlapTriggerY: true, xPosition: 'before', yPosition: 'above'}
            }]
        }).compileComponents();
    }));

    it('should allow for the default dropdown options to be overridden', () => {
        const fixture = TestBed.createComponent(SimpleDropdown);
        fixture.detectChanges();
        const dropdown = fixture.componentInstance.dropdown;

        expect(dropdown.overlapTriggerY).toBe(true);
        expect(dropdown.xPosition).toBe('before');
        expect(dropdown.yPosition).toBe('above');
    });
});

@Component({
    template: `
    <button [mcDropdownTriggerFor]="dropdown" #triggerEl>Toggle dropdown</button>
    <mc-dropdown
      #dropdown="mcDropdown"
      class="custom-one custom-two"
      (closed)="closeCallback($event)"
      [backdropClass]="backdropClass">
      <button mc-dropdown-item> Item </button>
      <button mc-dropdown-item disabled> Disabled </button>
      <button mc-dropdown-item>
        <fake-icon>unicorn</fake-icon>
        Item with an icon
      </button>
      <button *ngFor="let item of extraItems" mc-dropdown-item> {{item}} </button>
    </mc-dropdown>
    `
})
class SimpleDropdown {
    @ViewChild(McDropdownTrigger) trigger: McDropdownTrigger;
    @ViewChild('triggerEl') triggerEl: ElementRef<HTMLElement>;
    @ViewChild(McDropdown) dropdown: McDropdown;
    @ViewChildren(McDropdownItem) items: QueryList<McDropdownItem>;
    extraItems: string[] = [];
    closeCallback = jasmine.createSpy('dropdown closed callback');
    backdropClass: string;
}

@Component({
    template: `
    <button [mcDropdownTriggerFor]="dropdown" #triggerEl>Toggle dropdown</button>
    <mc-dropdown [xPosition]="xPosition" [yPosition]="yPosition" #dropdown="mcDropdown">
      <button mc-dropdown-item> Positioned Content </button>
    </mc-dropdown>
    `
})
class PositionedDropdown {
    @ViewChild(McDropdownTrigger) trigger: McDropdownTrigger;
    @ViewChild('triggerEl') triggerEl: ElementRef<HTMLElement>;
    xPosition: DropdownPositionX = 'before';
    yPosition: DropdownPositionY = 'above';
}

interface TestableMenu {
    trigger: McDropdownTrigger;
    triggerEl: ElementRef<HTMLElement>;
}

@Component({
    template: `
        <button [mcDropdownTriggerFor]="menu" #triggerEl>Toggle menu</button>
        <mc-dropdown [overlapTriggerY]="overlapTriggerY" #menu="mcDropdown">
            <button mc-dropdown-item> Not overlapped Content</button>
        </mc-dropdown>
    `
})
class OverlapMenu implements TestableMenu {
    @Input() overlapTriggerY: boolean;
    @ViewChild(McDropdownTrigger) trigger: McDropdownTrigger;
    @ViewChild('triggerEl') triggerEl: ElementRef<HTMLElement>;
}

@Component({
    selector: 'custom-dropdown',
    template: `
        <ng-template>
      Custom Dropdown header
            <ng-content></ng-content>
        </ng-template>
    `,
    exportAs: 'appCustomDropdown'
})
class CustomDropdownPanel implements McDropdownPanel {
    direction: Direction;
    xPosition: DropdownPositionX = 'after';
    yPosition: DropdownPositionY = 'below';
    overlapTriggerX = false;
    overlapTriggerY = true;
    parent: McDropdownPanel;

    @ViewChild(TemplateRef) templateRef: TemplateRef<any>;
    @Output() close = new EventEmitter<void | 'click' | 'keydown' | 'tab'>();
    backdropClass: string;
    closed: EventEmitter<void | 'click' | 'keydown' | 'tab'>;
    hasBackdrop: boolean;
    lazyContent: McDropdownContent;
    focusFirstItem = () => {};
    resetActiveItem = () => {};
    setPositionClasses = () => {};

    addItem(): void {}

    removeItem(): void {}
}

@Component({
    template: `
    <button [mcDropdownTriggerFor]="dropdown">Toggle dropdown</button>
    <custom-dropdown #dropdown="appCustomDropdown">
      <button mc-dropdown-item> Custom Content </button>
    </custom-dropdown>
  `
})
class CustomDropdown {
    @ViewChild(McDropdownTrigger) trigger: McDropdownTrigger;
}


@Component({
    template: `
        <button
            [mcDropdownTriggerFor]="root"
            #rootTrigger="mcDropdownTrigger"
            #rootTriggerEl>Toggle menu
        </button>

        <button
            [mcDropdownTriggerFor]="levelTwo"
            #alternateTrigger="mcDropdownTrigger">Toggle alternate menu
        </button>

        <mc-dropdown #root="mcDropdown" (closed)="rootCloseCallback($event)">
            <button mc-dropdown-item
                    id="level-one-trigger"
                    [mcDropdownTriggerFor]="levelOne"
                    #levelOneTrigger="mcDropdownTrigger">One
            </button>
            <button mc-dropdown-item>Two</button>
            <button mc-dropdown-item
                    *ngIf="showLazy"
                    id="lazy-trigger"
                    [mcDropdownTriggerFor]="lazy"
                    #lazyTrigger="mcDropdownTrigger">Three
            </button>
        </mc-dropdown>

        <mc-dropdown #levelOne="mcDropdown" (closed)="levelOneCloseCallback($event)">
            <button mc-dropdown-item>Four</button>
            <button mc-dropdown-item
                    id="level-two-trigger"
                    [mcDropdownTriggerFor]="levelTwo"
                    #levelTwoTrigger="mcDropdownTrigger">Five
            </button>
            <button mc-dropdown-item>Six</button>
        </mc-dropdown>

        <mc-dropdown #levelTwo="mcDropdown" (closed)="levelTwoCloseCallback($event)">
            <button mc-dropdown-item>Seven</button>
            <button mc-dropdown-item>Eight</button>
            <button mc-dropdown-item>Nine</button>
        </mc-dropdown>

        <mc-dropdown #lazy="mcDropdown">
            <button mc-dropdown-item>Ten</button>
            <button mc-dropdown-item>Eleven</button>
            <button mc-dropdown-item>Twelve</button>
        </mc-dropdown>
    `
})
class NestedMenu {
    @ViewChild('root') rootMenu: McDropdown;
    @ViewChild('rootTrigger') rootTrigger: McDropdownTrigger;
    @ViewChild('rootTriggerEl') rootTriggerEl: ElementRef<HTMLElement>;
    @ViewChild('alternateTrigger') alternateTrigger: McDropdownTrigger;
    readonly rootCloseCallback = jasmine.createSpy('root menu closed callback');

    @ViewChild('levelOne') levelOneMenu: McDropdown;
    @ViewChild('levelOneTrigger') levelOneTrigger: McDropdownTrigger;
    readonly levelOneCloseCallback = jasmine.createSpy('level one menu closed callback');

    @ViewChild('levelTwo') levelTwoMenu: McDropdown;
    @ViewChild('levelTwoTrigger') levelTwoTrigger: McDropdownTrigger;
    readonly levelTwoCloseCallback = jasmine.createSpy('level one menu closed callback');

    @ViewChild('lazy') lazyMenu: McDropdown;
    @ViewChild('lazyTrigger') lazyTrigger: McDropdownTrigger;
    showLazy = false;
}

@Component({
    template: `
        <button [mcDropdownTriggerFor]="root" #rootTriggerEl>Toggle menu</button>
        <mc-dropdown #root="mcDropdown">
            <button
                mc-dropdown-item
                class="level-one-trigger"
                *ngFor="let item of items"
                [mcDropdownTriggerFor]="levelOne">{{item}}
            </button>
        </mc-dropdown>

        <mc-dropdown #levelOne="mcDropdown">
            <button mc-dropdown-item>Four</button>
            <button mc-dropdown-item>Five</button>
        </mc-dropdown>
    `
})
class NestedMenuRepeater {
    @ViewChild('rootTriggerEl') rootTriggerEl: ElementRef<HTMLElement>;
    @ViewChild('levelOneTrigger') levelOneTrigger: McDropdownTrigger;

    items = ['one', 'two', 'three'];
}


@Component({
    template: `
        <button [mcDropdownTriggerFor]="root" #rootTriggerEl>Toggle menu</button>

        <mc-dropdown #root="mcDropdown">
            <button mc-dropdown-item class="level-one-trigger" [mcDropdownTriggerFor]="levelOne">One</button>

            <mc-dropdown #levelOne="mcDropdown">
                <button mc-dropdown-item class="level-two-item">Two</button>
            </mc-dropdown>
        </mc-dropdown>
    `
})
class SubmenuDeclaredInsideParentMenu {
    @ViewChild('rootTriggerEl') rootTriggerEl: ElementRef;
}


@Component({
    selector: 'fake-icon',
    template: '<ng-content></ng-content>'
})
class FakeIcon {}


@Component({
    template: `
    <button [mcDropdownTriggerFor]="dropdown" #triggerEl>Toggle dropdown</button>
    <mc-dropdown #dropdown="mcDropdown">
      <ng-template mcDropdownContent>
        <button mc-dropdown-item>Item</button>
        <button mc-dropdown-item>Another item</button>
      </ng-template>
    </mc-dropdown>
  `
})
class SimpleLazyDropdown {
    @ViewChild(McDropdownTrigger) trigger: McDropdownTrigger;
    @ViewChild('triggerEl') triggerEl: ElementRef<HTMLElement>;
    @ViewChildren(McDropdownItem) items: QueryList<McDropdownItem>;
}


@Component({
    template: `
        <button
      [mcDropdownTriggerFor]="dropdown"
      [mcDropdownTriggerData]="{label: 'one'}"
      #triggerOne="mcDropdownTrigger">One</button>
    <button
      [mcDropdownTriggerFor]="dropdown"
      [mcDropdownTriggerData]="{label: 'two'}"
      #triggerTwo="mcDropdownTrigger">Two</button>
    <mc-dropdown #dropdown="mcDropdown">
      <ng-template let-label="label" mcDropdownContent>
        <button mc-dropdown-item>{{label}}</button>
      </ng-template>
    </mc-dropdown>
  `
})
class LazyDropdownWithContext {
    @ViewChild('triggerOne') triggerOne: McDropdownTrigger;
    @ViewChild('triggerTwo') triggerTwo: McDropdownTrigger;
}


@Component({
    template: `
        <button [mcDropdownTriggerFor]="one">Toggle menu</button>
        <mc-dropdown #one="mcDropdown">
            <button mc-dropdown-item>One</button>
        </mc-dropdown>

        <mc-dropdown #two="mcDropdown">
            <button mc-dropdown-item>Two</button>
        </mc-dropdown>
    `
})
class DynamicPanelMenu {
    @ViewChild(McDropdownTrigger) trigger: McDropdownTrigger;
    @ViewChild('one') firstMenu: McDropdown;
    @ViewChild('two') secondMenu: McDropdown;
}


@Component({
    template: `
        <button [mcDropdownTriggerFor]="menu">Toggle menu</button>

        <mc-dropdown #menu="mcDropdown">
            <button mc-dropdown-item role="menuitemcheckbox" aria-checked="true">Checked</button>
            <button mc-dropdown-item role="menuitemcheckbox" aria-checked="false">Not checked</button>
        </mc-dropdown>
    `
})
class MenuWithCheckboxItems {
    @ViewChild(McDropdownTrigger) trigger: McDropdownTrigger;
}
