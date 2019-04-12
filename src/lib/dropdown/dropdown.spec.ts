// tslint:disable:no-magic-numbers
// tslint:disable:prefer-array-literal
// tslint:disable:no-empty
import {
    Component,
    ElementRef,
    EventEmitter,
    Output,
    NgZone,
    TemplateRef,
    ViewChild,
    ViewChildren,
    QueryList,
    Type,
    Provider
} from '@angular/core';
import { ComponentFixture, fakeAsync, flush, inject, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FocusMonitor } from '@ptsecurity/cdk/a11y';
import { Direction, Directionality } from '@ptsecurity/cdk/bidi';
import { ESCAPE, DOWN_ARROW } from '@ptsecurity/cdk/keycodes';
import { OverlayContainer, Overlay } from '@ptsecurity/cdk/overlay';
import { ScrollDispatcher } from '@ptsecurity/cdk/scrolling';
import {
    dispatchKeyboardEvent,
    dispatchMouseEvent,
    dispatchEvent,
    createKeyboardEvent,
    createMouseEvent,
    dispatchFakeEvent,
    patchElementFocus,
    MockNgZone
} from '@ptsecurity/cdk/testing';
import { Subject } from 'rxjs';

import {
    MC_DROPDOWN_DEFAULT_OPTIONS,
    MC_DROPDOWN_SCROLL_STRATEGY,
    McDropdown,
    McDropdownModule,
    McDropdownPanel,
    McDropdownTrigger,
    DropdownPositionX,
    DropdownPositionY,
    McDropdownItem, McDropdownContent
} from './index';


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

            expect(triggerEl.classList).toContain('cdk-program-focused');
            focusMonitor.stopMonitoring(triggerEl);
        }));

    it('should set proper focus origin when right clicking on trigger, before opening by keyboard', fakeAsync(() => {
            const fixture = createComponent(SimpleDropdown, [], [FakeIcon]);
            fixture.detectChanges();
            const triggerEl = fixture.componentInstance.triggerEl.nativeElement;

            patchElementFocus(triggerEl);
            focusMonitor.monitor(triggerEl, false);

            // Trigger a fake right click.
            dispatchEvent(triggerEl, createMouseEvent('mousedown', 50, 100));

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
        expect(fixture.componentInstance.items.first.focus).toHaveBeenCalledWith('program');
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
