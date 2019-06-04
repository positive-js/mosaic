// tslint:disable:no-magic-numbers
// tslint:disable:no-empty
import { CommonModule } from '@angular/common';
import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LEFT_ARROW } from '@ptsecurity/cdk/keycodes';
import { dispatchKeyboardEvent } from '@ptsecurity/cdk/testing';
import { Observable } from 'rxjs';

import { McTab, McTabGroup, McTabHeaderPosition, McTabsModule } from './index';


describe('McTabGroup', () => {
    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [McTabsModule, CommonModule, NoopAnimationsModule],
            declarations: [
                SimpleTabsTestApp,
                SimpleDynamicTabsTestApp,
                BindedTabsTestApp,
                AsyncTabsTestApp,
                DisabledTabsTestApp,
                TabGroupWithSimpleApi,
                TemplateTabs,
                TabGroupWithAriaInputs,
                TabGroupWithIsActiveBinding
            ]
        });

        TestBed.compileComponents();
    }));

    describe('basic behavior', () => {
        let fixture: ComponentFixture<SimpleTabsTestApp>;
        let element: HTMLElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(SimpleTabsTestApp);
            element = fixture.nativeElement;
        });

        it('should default to the first tab', () => {
            checkSelectedIndex(1, fixture);
        });

        it('will properly load content on first change detection pass', () => {
            fixture.detectChanges();
            expect(element.querySelectorAll('.mc-tab-body')[1].querySelectorAll('span').length).toBe(3);
        });

        it('should change selected index on click', () => {
            const component = fixture.debugElement.componentInstance;
            component.selectedIndex = 0;
            checkSelectedIndex(0, fixture);

            // select the second tab
            let tabLabel = fixture.debugElement.queryAll(By.css('.mc-tab-label'))[1];
            tabLabel.nativeElement.click();
            checkSelectedIndex(1, fixture);

            // select the third tab
            tabLabel = fixture.debugElement.queryAll(By.css('.mc-tab-label'))[2];
            tabLabel.nativeElement.click();
            checkSelectedIndex(2, fixture);
        });

        it('should support two-way binding for selectedIndex', fakeAsync(() => {
            const component = fixture.componentInstance;
            component.selectedIndex = 0;

            fixture.detectChanges();

            const tabLabel = fixture.debugElement.queryAll(By.css('.mc-tab-label'))[1];
            tabLabel.nativeElement.click();
            fixture.detectChanges();
            tick();

            expect(component.selectedIndex).toBe(1);
        }));

        // Note: needs to be `async` in order to fail when we expect it to.
        it('should set to correct tab on fast change', async(() => {
            const component = fixture.componentInstance;
            component.selectedIndex = 0;
            fixture.detectChanges();

            setTimeout(() => {
                component.selectedIndex = 1;
                fixture.detectChanges();

                setTimeout(() => {
                    component.selectedIndex = 0;
                    fixture.detectChanges();
                    fixture.whenStable().then(() => {
                        expect(component.selectedIndex).toBe(0);
                    });
                }, 1);
            }, 1);
        }));

        it('should change tabs based on selectedIndex', fakeAsync(() => {
            const component = fixture.componentInstance;
            const tabComponent = fixture.debugElement.query(By.css('mc-tab-group')).componentInstance;

            spyOn(component, 'handleSelection').and.callThrough();

            checkSelectedIndex(1, fixture);

            tabComponent.selectedIndex = 2;

            checkSelectedIndex(2, fixture);
            tick();

            expect(component.handleSelection).toHaveBeenCalledTimes(1);
            expect(component.selectEvent.index).toBe(2);
        }));

        it('should update tab positions when selected index is changed', () => {
            fixture.detectChanges();
            const component: McTabGroup =
                fixture.debugElement.query(By.css('mc-tab-group')).componentInstance;
            const tabs: McTab[] = component.tabs.toArray();

            expect(tabs[0].position).toBeLessThan(0);
            expect(tabs[1].position).toBe(0);
            expect(tabs[2].position).toBeGreaterThan(0);

            // Move to third tab
            component.selectedIndex = 2;
            fixture.detectChanges();
            expect(tabs[0].position).toBeLessThan(0);
            expect(tabs[1].position).toBeLessThan(0);
            expect(tabs[2].position).toBe(0);

            // Move to the first tab
            component.selectedIndex = 0;
            fixture.detectChanges();
            expect(tabs[0].position).toBe(0);
            expect(tabs[1].position).toBeGreaterThan(0);
            expect(tabs[2].position).toBeGreaterThan(0);
        });

        it('should clamp the selected index to the size of the number of tabs', () => {
            fixture.detectChanges();
            const component: McTabGroup =
                fixture.debugElement.query(By.css('mc-tab-group')).componentInstance;

            // Set the index to be negative, expect first tab selected
            fixture.componentInstance.selectedIndex = -1;
            fixture.detectChanges();
            expect(component.selectedIndex).toBe(0);

            // Set the index beyond the size of the tabs, expect last tab selected
            fixture.componentInstance.selectedIndex = 3;
            fixture.detectChanges();
            expect(component.selectedIndex).toBe(2);
        });

        it('should not crash when setting the selected index to NaN', () => {
            const component = fixture.debugElement.componentInstance;

            expect(() => {
                component.selectedIndex = NaN;
                fixture.detectChanges();
            }).not.toThrow();
        });

        it('should set the isActive flag on each of the tabs', fakeAsync(() => {
            fixture.detectChanges();
            tick();

            const tabs = fixture.componentInstance.tabs.toArray();

            expect(tabs[0].isActive).toBe(false);
            expect(tabs[1].isActive).toBe(true);
            expect(tabs[2].isActive).toBe(false);

            fixture.componentInstance.selectedIndex = 2;
            fixture.detectChanges();
            tick();

            expect(tabs[0].isActive).toBe(false);
            expect(tabs[1].isActive).toBe(false);
            expect(tabs[2].isActive).toBe(true);
        }));

        it('should fire animation done event', fakeAsync(() => {
            fixture.detectChanges();

            spyOn(fixture.componentInstance, 'animationDone');
            const tabLabel = fixture.debugElement.queryAll(By.css('.mc-tab-label'))[1];
            tabLabel.nativeElement.click();
            fixture.detectChanges();
            tick();

            expect(fixture.componentInstance.animationDone).toHaveBeenCalled();
        }));

        it('should add the proper `aria-setsize` and `aria-posinset`', () => {
            fixture.detectChanges();

            const labels = Array.from(element.querySelectorAll('.mc-tab-label'));

            expect(labels.map((label) => label.getAttribute('aria-posinset'))).toEqual(['1', '2', '3']);
            expect(labels.every((label) => label.getAttribute('aria-setsize') === '3')).toBe(true);
        });

        it('should emit focusChange event on click', () => {
            spyOn(fixture.componentInstance, 'handleFocus');
            fixture.detectChanges();

            const tabLabels = fixture.debugElement.queryAll(By.css('.mc-tab-label'));

            expect(fixture.componentInstance.handleFocus).toHaveBeenCalledTimes(0);

            tabLabels[1].nativeElement.click();
            fixture.detectChanges();

            expect(fixture.componentInstance.handleFocus).toHaveBeenCalledTimes(1);
            expect(fixture.componentInstance.handleFocus)
                .toHaveBeenCalledWith(jasmine.objectContaining({ index: 1 }));
        });

        it('should emit focusChange on arrow key navigation', () => {
            spyOn(fixture.componentInstance, 'handleFocus');
            fixture.detectChanges();

            const tabLabels = fixture.debugElement.queryAll(By.css('.mc-tab-label'));
            const tabLabelContainer = fixture.debugElement
                .query(By.css('.mc-tab-header__content')).nativeElement as HTMLElement;

            expect(fixture.componentInstance.handleFocus).toHaveBeenCalledTimes(0);

            // In order to verify that the `focusChange` event also fires with the correct
            // index, we focus the second tab before testing the keyboard navigation.
            tabLabels[1].nativeElement.click();
            fixture.detectChanges();

            expect(fixture.componentInstance.handleFocus).toHaveBeenCalledTimes(1);

            dispatchKeyboardEvent(tabLabelContainer, 'keydown', LEFT_ARROW);

            expect(fixture.componentInstance.handleFocus).toHaveBeenCalledTimes(2);
            expect(fixture.componentInstance.handleFocus)
                .toHaveBeenCalledWith(jasmine.objectContaining({ index: 0 }));
        });

    });

    describe('aria labelling', () => {
        let fixture: ComponentFixture<TabGroupWithAriaInputs>;
        let tab: HTMLElement;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(TabGroupWithAriaInputs);
            fixture.detectChanges();
            tick();
            tab = fixture.nativeElement.querySelector('.mc-tab-label');
        }));

        it('should not set aria-label or aria-labelledby attributes if they are not passed in', () => {
            expect(tab.hasAttribute('aria-label')).toBe(false);
            expect(tab.hasAttribute('aria-labelledby')).toBe(false);
        });

        it('should set the aria-label attribute', () => {
            fixture.componentInstance.ariaLabel = 'Fruit';
            fixture.detectChanges();

            expect(tab.getAttribute('aria-label')).toBe('Fruit');
        });

        it('should set the aria-labelledby attribute', () => {
            fixture.componentInstance.ariaLabelledby = 'fruit-label';
            fixture.detectChanges();

            expect(tab.getAttribute('aria-labelledby')).toBe('fruit-label');
        });

        it('should not be able to set both an aria-label and aria-labelledby', () => {
            fixture.componentInstance.ariaLabel = 'Fruit';
            fixture.componentInstance.ariaLabelledby = 'fruit-label';
            fixture.detectChanges();

            expect(tab.getAttribute('aria-label')).toBe('Fruit');
            expect(tab.hasAttribute('aria-labelledby')).toBe(false);
        });
    });

    describe('disable tabs', () => {
        let fixture: ComponentFixture<DisabledTabsTestApp>;
        beforeEach(() => {
            fixture = TestBed.createComponent(DisabledTabsTestApp);
        });

        it('should have one disabled tab', () => {
            fixture.detectChanges();
            const labels = fixture.debugElement.queryAll(By.css('.mc-disabled'));
            expect(labels.length).toBe(1);
            expect(labels[0].nativeElement.getAttribute('aria-disabled')).toBe('true');
        });

        it('should set the disabled flag on tab', () => {
            fixture.detectChanges();

            const tabs = fixture.componentInstance.tabs.toArray();
            let labels = fixture.debugElement.queryAll(By.css('.mc-disabled'));
            expect(tabs[2].disabled).toBe(false);
            expect(labels.length).toBe(1);
            expect(labels[0].nativeElement.getAttribute('aria-disabled')).toBe('true');

            fixture.componentInstance.isDisabled = true;
            fixture.detectChanges();

            expect(tabs[2].disabled).toBe(true);
            labels = fixture.debugElement.queryAll(By.css('.mc-disabled'));
            expect(labels.length).toBe(2);
            expect(labels.every((label) => label.nativeElement.getAttribute('aria-disabled') === 'true'))
                .toBe(true);
        });
    });

    describe('dynamic binding tabs', () => {
        let fixture: ComponentFixture<SimpleDynamicTabsTestApp>;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(SimpleDynamicTabsTestApp);
            fixture.detectChanges();
            tick();
            fixture.detectChanges();
        }));

        it('should be able to add a new tab, select it, and have correct origin position',
            fakeAsync(() => {
                const component: McTabGroup =
                    fixture.debugElement.query(By.css('mc-tab-group')).componentInstance;

                let tabs: McTab[] = component.tabs.toArray();
                expect(tabs[0].origin).toBe(null);
                expect(tabs[1].origin).toBe(0);
                expect(tabs[2].origin).toBe(null);

                // Add a new tab on the right and select it, expect an origin >= than 0 (animate right)
                fixture.componentInstance.tabs.push({ label: 'New tab', content: 'to right of index' });
                fixture.componentInstance.selectedIndex = 4;
                fixture.detectChanges();
                tick();

                tabs = component.tabs.toArray();
                expect(tabs[3].origin).toBeGreaterThanOrEqual(0);

                // Add a new tab in the beginning and select it, expect an origin < than 0 (animate left)
                fixture.componentInstance.selectedIndex = 0;
                fixture.detectChanges();
                tick();

                fixture.componentInstance.tabs.push({ label: 'New tab', content: 'to left of index' });
                fixture.detectChanges();
                tick();

                tabs = component.tabs.toArray();
                expect(tabs[0].origin).toBeLessThan(0);
            }));


        it('should update selected index if the last tab removed while selected', fakeAsync(() => {
            const component: McTabGroup =
                fixture.debugElement.query(By.css('mc-tab-group')).componentInstance;

            const numberOfTabs = component.tabs.length;
            fixture.componentInstance.selectedIndex = numberOfTabs - 1;
            fixture.detectChanges();
            tick();

            // Remove last tab while last tab is selected, expect next tab over to be selected
            fixture.componentInstance.tabs.pop();
            fixture.detectChanges();
            tick();

            expect(component.selectedIndex).toBe(numberOfTabs - 2);
        }));


        it('should maintain the selected tab if a new tab is added', () => {
            fixture.detectChanges();
            const component: McTabGroup =
                fixture.debugElement.query(By.css('mc-tab-group')).componentInstance;

            fixture.componentInstance.selectedIndex = 1;
            fixture.detectChanges();

            // Add a new tab at the beginning.
            fixture.componentInstance.tabs.unshift({ label: 'New tab', content: 'at the start' });
            fixture.detectChanges();

            expect(component.selectedIndex).toBe(2);
            expect(component.tabs.toArray()[2].isActive).toBe(true);
        });


        it('should maintain the selected tab if a tab is removed', () => {
            // Select the second tab.
            fixture.componentInstance.selectedIndex = 1;
            fixture.detectChanges();

            const component: McTabGroup =
                fixture.debugElement.query(By.css('mc-tab-group')).componentInstance;

            // Remove the first tab that is right before the selected one.
            fixture.componentInstance.tabs.splice(0, 1);
            fixture.detectChanges();

            // Since the first tab has been removed and the second one was selected before, the selected
            // tab moved one position to the right. Meaning that the tab is now the first tab.
            expect(component.selectedIndex).toBe(0);
            expect(component.tabs.toArray()[0].isActive).toBe(true);
        });

        it('should be able to select a new tab after creation', fakeAsync(() => {
            fixture.detectChanges();
            const component: McTabGroup =
                fixture.debugElement.query(By.css('mc-tab-group')).componentInstance;

            fixture.componentInstance.tabs.push({ label: 'Last tab', content: 'at the end' });
            fixture.componentInstance.selectedIndex = 3;

            fixture.detectChanges();
            tick();

            expect(component.selectedIndex).toBe(3);
            expect(component.tabs.toArray()[3].isActive).toBe(true);
        }));

        it('should not fire `selectedTabChange` when the amount of tabs changes', fakeAsync(() => {
            fixture.detectChanges();
            fixture.componentInstance.selectedIndex = 1;
            fixture.detectChanges();

            // Add a new tab at the beginning.
            spyOn(fixture.componentInstance, 'handleSelection');
            fixture.componentInstance.tabs.unshift({ label: 'New tab', content: 'at the start' });
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            expect(fixture.componentInstance.handleSelection).not.toHaveBeenCalled();
        }));

    });

    describe('async tabs', () => {
        let fixture: ComponentFixture<AsyncTabsTestApp>;

        it('should show tabs when they are available', fakeAsync(() => {
            fixture = TestBed.createComponent(AsyncTabsTestApp);

            expect(fixture.debugElement.queryAll(By.css('.mc-tab-label')).length).toBe(0);

            fixture.detectChanges();
            tick();
            fixture.detectChanges();
            tick();

            expect(fixture.debugElement.queryAll(By.css('.mc-tab-label')).length).toBe(2);
        }));
    });

    describe('with simple api', () => {
        let fixture: ComponentFixture<TabGroupWithSimpleApi>;
        let tabGroup: McTabGroup;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(TabGroupWithSimpleApi);
            fixture.detectChanges();
            tick();

            tabGroup =
                fixture.debugElement.query(By.directive(McTabGroup)).componentInstance as McTabGroup;
        }));

        it('should support a tab-group with the simple api', fakeAsync(() => {
            expect(getSelectedLabel(fixture).textContent).toMatch('Junk food');
            expect(getSelectedContent(fixture).textContent).toMatch('Pizza, fries');

            tabGroup.selectedIndex = 2;
            fixture.detectChanges();
            tick();

            expect(getSelectedLabel(fixture).textContent).toMatch('Fruit');
            expect(getSelectedContent(fixture).textContent).toMatch('Apples, grapes');

            fixture.componentInstance.otherLabel = 'Chips';
            fixture.componentInstance.otherContent = 'Salt, vinegar';
            fixture.detectChanges();

            expect(getSelectedLabel(fixture).textContent).toMatch('Chips');
            expect(getSelectedContent(fixture).textContent).toMatch('Salt, vinegar');
        }));

        it('should support @ViewChild in the tab content', () => {
            expect(fixture.componentInstance.legumes).toBeTruthy();
        });

        it('should only have the active tab in the DOM', fakeAsync(() => {
            expect(fixture.nativeElement.textContent).toContain('Pizza, fries');
            expect(fixture.nativeElement.textContent).not.toContain('Peanuts');

            tabGroup.selectedIndex = 3;
            fixture.detectChanges();
            tick();

            expect(fixture.nativeElement.textContent).not.toContain('Pizza, fries');
            expect(fixture.nativeElement.textContent).toContain('Peanuts');
        }));

        it('should support setting the header position', () => {
            const tabGroupNode = fixture.debugElement.query(By.css('mc-tab-group')).nativeElement;

            expect(tabGroupNode.classList).not.toContain('mc-tab-group_inverted-header');

            tabGroup.headerPosition = 'below';
            fixture.detectChanges();

            expect(tabGroupNode.classList).toContain('mc-tab-group_inverted-header');
        });
    });

    describe('lazy loaded tabs', () => {
        it('should lazy load the second tab', fakeAsync(() => {
            const fixture = TestBed.createComponent(TemplateTabs);
            fixture.detectChanges();
            tick();

            const secondLabel = fixture.debugElement.queryAll(By.css('.mc-tab-label'))[1];
            secondLabel.nativeElement.click();
            fixture.detectChanges();
            tick();
            fixture.detectChanges();

            const child = fixture.debugElement.query(By.css('.child'));
            expect(child.nativeElement).toBeDefined();
        }));
    });

    describe('special cases', () => {
        it('should not throw an error when binding isActive to the view', fakeAsync(() => {
            const fixture = TestBed.createComponent(TabGroupWithIsActiveBinding);

            expect(() => {
                fixture.detectChanges();
                tick();
                fixture.detectChanges();
            }).not.toThrow();

            expect(fixture.nativeElement.textContent).toContain('pizza is active');
        }));
    });

    /**
     * Checks that the `selectedIndex` has been updated; checks that the label and body have their
     * respective `active` classes
     */
    function checkSelectedIndex(expectedIndex: number, fixture: ComponentFixture<any>) {
        fixture.detectChanges();

        const tabComponent: McTabGroup = fixture.debugElement
            .query(By.css('mc-tab-group')).componentInstance;
        expect(tabComponent.selectedIndex).toBe(expectedIndex);

        const tabLabelElement = fixture.debugElement
            .query(By.css(`.mc-tab-label:nth-of-type(${expectedIndex + 1})`)).nativeElement;
        expect(tabLabelElement.classList.contains('mc-active')).toBe(true);

        const tabContentElement = fixture.debugElement
            .query(By.css(`mc-tab-body:nth-of-type(${expectedIndex + 1})`)).nativeElement;
        expect(tabContentElement.classList.contains('mc-tab-body__active')).toBe(true);
    }

    function getSelectedLabel(fixture: ComponentFixture<any>): HTMLElement {
        return fixture.nativeElement.querySelector('.mc-active');
    }

    function getSelectedContent(fixture: ComponentFixture<any>): HTMLElement {
        return fixture.nativeElement.querySelector('.mc-tab-body__active');
    }
});


describe('nested McTabGroup with enabled animations', () => {
    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [McTabsModule, BrowserAnimationsModule],
            declarations: [NestedTabs]
        });

        TestBed.compileComponents();
    }));

    it('should not throw when creating a component with nested tab groups', fakeAsync(() => {
        expect(() => {
            const fixture = TestBed.createComponent(NestedTabs);
            fixture.detectChanges();
            tick();
        }).not.toThrow();
    }));
});


@Component({
    template: `
    <mc-tab-group class="tab-group"
        [(selectedIndex)]="selectedIndex"
        [headerPosition]="headerPosition"
        (animationDone)="animationDone()"
        (focusChange)="handleFocus($event)"
        (selectedTabChange)="handleSelection($event)">
      <mc-tab>
        <ng-template mc-tab-label>Tab One</ng-template>
        Tab one content
      </mc-tab>
      <mc-tab>
        <ng-template mc-tab-label>Tab Two</ng-template>
        <span>Tab </span><span>two</span><span>content</span>
      </mc-tab>
      <mc-tab>
        <ng-template mc-tab-label>Tab Three</ng-template>
        Tab three content
      </mc-tab>
    </mc-tab-group>
  `
})
class SimpleTabsTestApp {
    @ViewChildren(McTab) tabs: QueryList<McTab>;
    selectedIndex: number = 1;
    focusEvent: any;
    selectEvent: any;
    headerPosition: McTabHeaderPosition = 'above';

    handleFocus(event: any) {
        this.focusEvent = event;
    }

    handleSelection(event: any) {
        this.selectEvent = event;
    }

    animationDone() { }
}

@Component({
    template: `
    <mc-tab-group class="tab-group"
        [(selectedIndex)]="selectedIndex"
        (focusChange)="handleFocus($event)"
        (selectedTabChange)="handleSelection($event)">
      <mc-tab *ngFor="let tab of tabs">
        <ng-template mc-tab-label>{{tab.label}}</ng-template>
        {{tab.content}}
      </mc-tab>
    </mc-tab-group>
  `
})
class SimpleDynamicTabsTestApp {
    tabs = [
        { label: 'Label 1', content: 'Content 1' },
        { label: 'Label 2', content: 'Content 2' },
        { label: 'Label 3', content: 'Content 3' }
    ];
    selectedIndex: number = 1;
    focusEvent: any;
    selectEvent: any;

    handleFocus(event: any) {
        this.focusEvent = event;
    }

    handleSelection(event: any) {
        this.selectEvent = event;
    }
}

@Component({
    template: `
    <mc-tab-group class="tab-group" [(selectedIndex)]="selectedIndex">
      <mc-tab *ngFor="let tab of tabs" label="{{tab.label}}">
        {{tab.content}}
      </mc-tab>
    </mc-tab-group>
  `
})
class BindedTabsTestApp {
    tabs = [
        { label: 'one', content: 'one' },
        { label: 'two', content: 'two' }
    ];
    selectedIndex = 0;

    addNewActiveTab(): void {
        this.tabs.push({
            label: 'new tab',
            content: 'new content'
        });
        this.selectedIndex = this.tabs.length - 1;
    }
}

@Component({
    selector: 'test-app',
    template: `
    <mc-tab-group class="tab-group">
      <mc-tab>
        <ng-template mc-tab-label>Tab One</ng-template>
        Tab one content
      </mc-tab>
      <mc-tab disabled>
        <ng-template mc-tab-label>Tab Two</ng-template>
        Tab two content
      </mc-tab>
      <mc-tab [disabled]="isDisabled">
        <ng-template mc-tab-label>Tab Three</ng-template>
        Tab three content
      </mc-tab>
    </mc-tab-group>
  `
})
class DisabledTabsTestApp {
    @ViewChildren(McTab) tabs: QueryList<McTab>;
    isDisabled = false;
}

@Component({
    template: `
    <mc-tab-group class="tab-group">
      <mc-tab *ngFor="let tab of tabs | async">
        <ng-template mc-tab-label>{{ tab.label }}</ng-template>
        {{ tab.content }}
      </mc-tab>
   </mc-tab-group>
  `
})
class AsyncTabsTestApp implements OnInit {

    tabs: Observable<any>;
    private tabsItems = [
        { label: 'one', content: 'one' },
        { label: 'two', content: 'two' }
    ];

    ngOnInit() {
        // Use ngOnInit because there is some issue with scheduling the async task in the constructor.
        this.tabs = new Observable((observer: any) => {
            setTimeout(() => observer.next(this.tabsItems));
        });
    }
}


@Component({
    template: `
  <mc-tab-group>
    <mc-tab label="Junk food"> Pizza, fries </mc-tab>
    <mc-tab label="Vegetables"> Broccoli, spinach </mc-tab>
    <mc-tab [label]="otherLabel"> {{otherContent}} </mc-tab>
    <mc-tab label="Legumes"> <p #legumes>Peanuts</p> </mc-tab>
  </mc-tab-group>
  `
})
class TabGroupWithSimpleApi {
    otherLabel = 'Fruit';
    otherContent = 'Apples, grapes';
    @ViewChild('legumes', {static: false}) legumes: any;
}


@Component({
    selector: 'nested-tabs',
    template: `
    <mc-tab-group>
      <mc-tab label="One">Tab one content</mc-tab>
      <mc-tab label="Two">
        Tab two content
         <mc-tab-group [dynamicHeight]="true">
          <mc-tab label="Inner tab one">Inner content one</mc-tab>
          <mc-tab label="Inner tab two">Inner content two</mc-tab>
        </mc-tab-group>
      </mc-tab>
    </mc-tab-group>
  `
})
class NestedTabs { }

@Component({
    selector: 'template-tabs',
    template: `
    <mc-tab-group>
      <mc-tab label="One">
        Eager
      </mc-tab>
      <mc-tab label="Two">
        <ng-template mcTabContent>
          <div class="child">Hi</div>
        </ng-template>
      </mc-tab>
    </mc-tab-group>
  `
})
class TemplateTabs { }


@Component({
    template: `
  <mc-tab-group>
    <mc-tab [aria-label]="ariaLabel" [aria-labelledby]="ariaLabelledby"></mc-tab>
  </mc-tab-group>
  `
})
class TabGroupWithAriaInputs {
    ariaLabel: string;
    ariaLabelledby: string;
}


@Component({
    template: `
    <mc-tab-group>
      <mc-tab label="Junk food" #pizza> Pizza, fries </mc-tab>
      <mc-tab label="Vegetables"> Broccoli, spinach </mc-tab>
    </mc-tab-group>

    <div *ngIf="pizza.isActive">pizza is active</div>
  `
})
class TabGroupWithIsActiveBinding {
}
