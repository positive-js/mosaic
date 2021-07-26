// tslint:disable:no-magic-numbers
import { Direction, Directionality } from '@angular/cdk/bidi';
import { Component, ViewChild, ViewChildren, QueryList } from '@angular/core';
import {
    waitForAsync,
    ComponentFixture,
    TestBed
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';

import { McTabLink, McTabNav, McTabsModule } from '../index';


describe('McTabNavBar', () => {
    const dir: Direction = 'ltr';
    let dirChange: Subject<Direction>;

    beforeEach(waitForAsync(() => {
        dirChange = new Subject();
        TestBed.configureTestingModule({
            imports: [McTabsModule],
            declarations: [
                SimpleTabNavBarTestApp,
                TabLinkWithNgIf,
                TabLinkWithTabIndexBinding
            ],
            providers: [
                {
                    provide: Directionality,
                    useFactory: () => ({
                        value: dir,
                        change: dirChange.asObservable()
                    })
                }
            ]
        });

        TestBed.compileComponents();
    }));

    describe('basic behavior', () => {
        let fixture: ComponentFixture<SimpleTabNavBarTestApp>;

        beforeEach(() => {
            fixture = TestBed.createComponent(SimpleTabNavBarTestApp);
            fixture.detectChanges();
        });

        it('should change active index on click', () => {
            // select the second link
            let tabLink = fixture.debugElement.queryAll(By.css('a'))[1];
            tabLink.nativeElement.click();
            expect(fixture.componentInstance.activeIndex).toBe(1);

            // select the third link
            tabLink = fixture.debugElement.queryAll(By.css('a'))[2];
            tabLink.nativeElement.click();
            expect(fixture.componentInstance.activeIndex).toBe(2);
        });

        it('should add the active class if active', () => {
            const tabLink1 = fixture.debugElement.queryAll(By.css('a'))[0];
            const tabLink2 = fixture.debugElement.queryAll(By.css('a'))[1];
            const tabLinkElements = fixture.debugElement
                .queryAll(By.css('a'))
                .map((tabLinkDebugEl) => tabLinkDebugEl.nativeElement);

            tabLink1.nativeElement.click();
            fixture.detectChanges();
            expect(
                tabLinkElements[0].classList.contains('mc-active')
            ).toBeTruthy();
            expect(
                tabLinkElements[1].classList.contains('mc-active')
            ).toBeFalsy();

            tabLink2.nativeElement.click();
            fixture.detectChanges();
            expect(
                tabLinkElements[0].classList.contains('mc-active')
            ).toBeFalsy();
            expect(
                tabLinkElements[1].classList.contains('mc-active')
            ).toBeTruthy();
        });

        it('should add the disabled class if disabled', () => {
            const tabLinkElements = fixture.debugElement
                .queryAll(By.css('a'))
                .map((tabLinkDebugEl) => tabLinkDebugEl.nativeElement);

            expect(tabLinkElements.every((tabLinkEl) => !tabLinkEl.hasAttribute('disabled')))
                .toBe(true, 'Expected every tab link to not have the disabled class initially');

            fixture.componentInstance.disabled = true;
            fixture.detectChanges();

            expect(tabLinkElements.every((tabLinkEl) => tabLinkEl.hasAttribute('disabled')))
                .toBe(true, 'Expected every tab link to have the disabled class if set through binding');
        });

        it('should update the tabindex if links are disabled', () => {
            const tabLinkElements = fixture.debugElement
                .queryAll(By.css('a'))
                .map((tabLinkDebugEl) => tabLinkDebugEl.nativeElement);

            expect(
                tabLinkElements.every((tabLink) => tabLink.tabIndex === 0)
            ).toBe(
                true,
                'Expected element to be keyboard focusable by default'
            );

            fixture.componentInstance.disabled = true;
            fixture.detectChanges();

            expect(
                tabLinkElements.every((tabLink) => tabLink.tabIndex === -1)
            ).toBe(
                true,
                'Expected element to no longer be keyboard focusable if disabled.'
            );
        });

        it('should make disabled links unclickable', () => {
            const tabLinkElement = fixture.debugElement.query(By.css('a'))
                .nativeElement;

            expect(getComputedStyle(tabLinkElement).pointerEvents).not.toBe(
                'none'
            );

            fixture.componentInstance.disabled = true;
            fixture.detectChanges();

            expect(getComputedStyle(tabLinkElement).pointerEvents).toBe('none');
        });
    });

    it('should support binding to the tabIndex', () => {
        const fixture = TestBed.createComponent(TabLinkWithTabIndexBinding);
        fixture.detectChanges();

        const tabLink = fixture.debugElement
            .query(By.directive(McTabLink))
            .injector.get<McTabLink>(McTabLink);

        expect(tabLink.tabIndex).toBe(
            0,
            'Expected the tabIndex to be set to 0 by default.'
        );

        fixture.componentInstance.tabIndex = 3;
        fixture.detectChanges();

        expect(tabLink.tabIndex).toBe(
            3,
            'Expected the tabIndex to be have been set to 3.'
        );
    });
});

@Component({
    selector: 'test-app',
    template: `
    <nav mc-tab-nav-bar>
        <a mc-tab-link
            *ngFor="let tab of tabs; let index = index"
            [active]="activeIndex === index"
            [disabled]="disabled"
            (click)="activeIndex = index">
            Tab link {{label}}
        </a>
    </nav>
  `
})
class SimpleTabNavBarTestApp {
    @ViewChild(McTabNav, {static: false}) tabNavBar: McTabNav;
    @ViewChildren(McTabLink) tabLinks: QueryList<McTabLink>;

    label = '';
    disabled = false;
    tabs = [0, 1, 2];

    activeIndex = 0;
}

@Component({
    template: `
        <nav mc-tab-nav-bar>
            <a mc-tab-link *ngIf="!isDestroyed">Link</a>
        </nav>
    `
})
class TabLinkWithNgIf {
    isDestroyed = false;
}

@Component({
    template: `
        <nav mc-tab-nav-bar>
            <a mc-tab-link [tabIndex]="tabIndex">TabIndex Link</a>
        </nav>
    `
})
class TabLinkWithTabIndexBinding {
    tabIndex = 0;
}
