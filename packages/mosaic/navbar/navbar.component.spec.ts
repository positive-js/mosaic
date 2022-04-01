import { Component } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { McIconModule } from './../icon/icon.module';
import { McNavbarModule, McNavbarItem } from './index';


const FONT_RENDER_TIMEOUT_MS = 10;

describe('McNavbar', () => {

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [McNavbarModule, McIconModule],
            declarations: [TestApp]
        });

        TestBed.compileComponents();
    }));

    it('should be collapsed on init stage', fakeAsync(() => {
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();
        tick(FONT_RENDER_TIMEOUT_MS);
        fixture.detectChanges();

        const collapsedElements = fixture.debugElement.queryAll(By.css('.mc-navbar-item_collapsed'));

        expect(collapsedElements.length).toBeGreaterThan(0);
    }));

    it('collapsed elements should have title', fakeAsync(() => {
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();
        tick(FONT_RENDER_TIMEOUT_MS);
        fixture.detectChanges();

        const items = fixture.debugElement.queryAll(By.css('mc-navbar-item'));
        const collapsedElements = items.filter((item) =>
            item.nativeElement.querySelectorAll('.mc-navbar-item_collapsed').length > 0);

        const hasTitle = collapsedElements
            .reduce((acc, el) => acc && el.nativeElement.hasAttribute('title'), true);

        expect(hasTitle).toBeTruthy();
    }));

    it('collapsed elements should have specific title if defined', fakeAsync(() => {
        const fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();
        tick(FONT_RENDER_TIMEOUT_MS);
        fixture.detectChanges();

        const collapsedElements = fixture.debugElement.queryAll(By.css('.mc-navbar-item_collapsed'));
        const elementWithCustomTitle = collapsedElements[collapsedElements.length - 1];

        expect(elementWithCustomTitle.componentInstance.titleText)
            .toBe('Right icon');
    }));

    it('items should allow click if not disable', () => {
        const fixture = TestBed.createComponent(TestApp);
        const testComponent = fixture.debugElement.componentInstance;

        testComponent.counter = 0;

        fixture.detectChanges();

        const notDisabledItem = fixture.debugElement.query(By.css('.mc-navbar-item:not([disabled])'));

        notDisabledItem.nativeElement.click();

        fixture.detectChanges();

        expect(testComponent.counter).toBe(1);
    });

    it('items should not allow click if disable', () => {
        const fixture = TestBed.createComponent(TestApp);
        const testComponent = fixture.debugElement.componentInstance;
        fixture.detectChanges();

        const disabledItem = fixture.debugElement.query(By.css('.mc-navbar-item[disabled]'));

        expect(testComponent.counter).toBe(0);

        disabledItem.nativeElement.click();
        fixture.detectChanges();

        expect(testComponent.counter).toBe(0);
    });
});

@Component({
    selector: 'test-app',
    templateUrl: './navbar.component.spec.html'
})
class TestApp {
    counter: number = 0;
    navbarContainerWidth: number = 915;

    onItemClick(disabledItem?: McNavbarItem) {
        if (disabledItem?.disabled) { return; }

        this.counter++;
    }
}
