import { Component, ViewChild } from '@angular/core';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { McIconModule } from './../icon/icon.module';
import { McNavbarModule, McNavbar } from './index';


const FONT_RENDER_TIMEOUT_MS = 10;

describe('McNavbar', () => {

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [McNavbarModule, McIconModule],
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
});

@Component({
    selector: 'test-app',
    templateUrl: './navbar.component.spec.html'
})
class TestApp {
    @ViewChild('navbar', {static: false})
    navbar: McNavbar;

    counter: number = 0;
    navbarContainerWidth: number = 915;

    onItemClick() {
        this.counter++;
    }
}
