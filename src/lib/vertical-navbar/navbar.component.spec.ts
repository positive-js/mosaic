import { Component, ViewChild } from '@angular/core';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SPACE } from '@ptsecurity/cdk/keycodes';
import { createKeyboardEvent, createFakeEvent } from '@ptsecurity/cdk/testing';

import { McIconModule } from './../icon/icon.module';
import { McVerticalNavbarModule, McVerticalNavbar } from './index';


const FONT_RENDER_TIMEOUT_MS = 10;

describe('McVerticalNavbar', () => {

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [McVerticalNavbarModule, McIconModule],
            declarations: [TestApp]
        });

        TestBed.compileComponents();
    }));

    it('should be collapsed on init stage', (done) => {
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();

        // Note: setTimeout - please see the issue about font rendering time
        setTimeout(() => {
            fixture.detectChanges();
            const collapsedElements = fixture.debugElement.queryAll(By.css('.mc-navbar-collapsed-title'));

            expect(collapsedElements.length).toBeGreaterThan(0);
            done();
        }, FONT_RENDER_TIMEOUT_MS);
    });

    it('collapsed elements should have title', (done) => {
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();

        // Note: setTimeout - please see the issue about font rendering time
        setTimeout(() => {
            fixture.detectChanges();

            const items = fixture.debugElement.queryAll(By.css('mc-navbar-item'));
            const collapsedElements = items.filter((item) =>
                item.nativeElement.querySelectorAll('.mc-navbar-collapsed-title').length > 0);

            const hasTitle = collapsedElements.reduce((acc, el) => acc && el.nativeElement.hasAttribute('title'), true);

            expect(hasTitle).toBeTruthy();
            done();
        }, FONT_RENDER_TIMEOUT_MS);
    });

    it('collapsed elements should have specific title if defined', (done) => {
        const fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();

        // Note: setTimeout - please see the issue about font rendering time
        setTimeout(() => {
            fixture.detectChanges();

            const items = fixture.debugElement.queryAll(By.css('mc-navbar-item'));
            const collapsedElements = items.filter((item) =>
                item.nativeElement.querySelectorAll('.mc-navbar-collapsed-title').length > 0);

            const elementWithCustomTitle = collapsedElements[collapsedElements.length - 1];

            expect(elementWithCustomTitle.nativeElement.getAttribute('title')).toBe('customTitle');

            done();
        }, FONT_RENDER_TIMEOUT_MS);
    });

    it('items should allow click if not disable', () => {
        const fixture = TestBed.createComponent(TestApp);
        const testComponent = fixture.debugElement.componentInstance;

        testComponent.counter = 0;

        fixture.detectChanges();

        const notDisabledItem = fixture.debugElement.query(By.css('mc-navbar-item:not([disabled])'));

        notDisabledItem.nativeElement.click();

        fixture.detectChanges();

        expect(testComponent.counter).toBe(1);
    });

    it('items should not allow click if disable', () => {
        const fixture = TestBed.createComponent(TestApp);
        const testComponent = fixture.debugElement.componentInstance;

        fixture.detectChanges();

        const notDisabledItem = fixture.debugElement.query(By.css('mc-navbar-item[disabled]'));

        notDisabledItem.nativeElement.click();

        fixture.detectChanges();

        expect(testComponent.counter).toBe(0);
    });

    it('dropdown item by default should render list links', () => {
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();

        const dropdowns = fixture.debugElement.queryAll(By.css('[ng-reflect-dropdown-items]'));

        dropdowns.forEach((dropdown) => {
            const links = dropdown.queryAll(By.css('.mc-navbar-dropdown-link'));
            expect(links.length).toBeGreaterThan(0);
        });
    });

    it('dropdown content should open by click on navbar-item', () => {
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();

        const dropdown = fixture.debugElement.query(By.css('[ng-reflect-dropdown-items]'));
        const dropdownToggler = dropdown.query(By.css('.mc-navbar-item'));
        const dropdownContent = dropdown.query(By.css('.mc-navbar-dropdown')).nativeElement as HTMLElement;

        dropdownToggler.nativeElement.click();

        fixture.detectChanges();

        const isOpened = !dropdownContent.classList.contains('is-collapsed');

        expect(isOpened).toBeTruthy();
    });

    it('dropdown content should open by keydown SPACE on navbar-item', () => {
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();

        const dropdown = fixture.debugElement.query(By.css('[ng-reflect-dropdown-items]'));
        const dropdownToggler = dropdown.query(By.css('.mc-navbar-item')).nativeElement as HTMLElement;
        const dropdownContent = dropdown.query(By.css('.mc-navbar-dropdown')).nativeElement as HTMLElement;

        const keydownEvent = createKeyboardEvent('keydown', SPACE, dropdownToggler);

        dropdownToggler.dispatchEvent(keydownEvent);

        fixture.detectChanges();

        const isOpened = !dropdownContent.classList.contains('is-collapsed');

        expect(isOpened).toBeTruthy();
    });

    it('dropdown content should close by blur event from <mc-navbar-item>', () => {
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();

        const dropdown = fixture.debugElement.query(By.css('[ng-reflect-dropdown-items]'));
        const dropdownToggler = dropdown.query(By.css('.mc-navbar-item'));
        const dropdownContent = dropdown.query(By.css('.mc-navbar-dropdown')).nativeElement as HTMLElement;

        const keydownEvent = createFakeEvent('blur');

        dropdownToggler.nativeElement.click();

        fixture.detectChanges();

        dropdown.nativeElement.dispatchEvent(keydownEvent);

        fixture.detectChanges();

        const isClosed = dropdownContent.classList.contains('is-collapsed');

        expect(isClosed).toBeTruthy();
    });
});

@Component({
    selector: 'test-app',
    templateUrl: './navbar.component.spec.html'
})
class TestApp {
    @ViewChild('navbar')
    navbar: McVerticalNavbar;

    counter: number = 0;
    navbarContainerWidth: number = 915;

    onItemClick() {
        this.counter++;
    }
}
