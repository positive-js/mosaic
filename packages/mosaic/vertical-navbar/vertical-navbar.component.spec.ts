// tslint:disable:no-magic-numbers
import { Component, ViewChild, DebugElement } from '@angular/core';
import { fakeAsync, TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { McIconModule } from './../icon/icon.module';
import { McVerticalNavbarModule, McVerticalNavbar } from './index';


describe('McVerticalNavbar', () => {

    let app: ComponentFixture<TestApp>;
    let navbar: DebugElement;

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [McVerticalNavbarModule, McIconModule, NoopAnimationsModule],
            declarations: [TestApp]
        }).compileComponents();

        app = TestBed.createComponent(TestApp);
        app.detectChanges();
        navbar = app.debugElement.query(By.css('nav'));
    }));

    it('should be toggled by click', () => {
        app.detectChanges();

        expect(app.componentInstance.navbar.expanded).toBeFalsy();

        expect(navbar.nativeElement.getBoundingClientRect().width).toBe(64);

        const button = app.debugElement.query(By.css('.mc-vertical-navbar__toggle-button'));
        button.nativeElement.click();

        app.detectChanges();

        expect(app.componentInstance.navbar.expanded).toBeTruthy();
        expect(navbar.nativeElement.getBoundingClientRect().width).toBeGreaterThan(64);

        button.nativeElement.click();

        expect(app.componentInstance.navbar.expanded).toBeFalsy();
    });
});

@Component({
    selector: 'test-app',
    templateUrl: './vertical-navbar.component.spec.html'
})
class TestApp {
    @ViewChild('navbar', {static: false})
    navbar: McVerticalNavbar;

    counter: number = 0;

    onItemClick() {
        this.counter++;
    }
}
