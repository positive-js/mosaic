import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';

import { SitesMenuModule } from './sites-menu.module';


describe('SitesMenuComponent', () => {

    let component: TestApp;
    let fixture: ComponentFixture<TestApp>;

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [SitesMenuModule],
            declarations: [TestApp]
        });

        TestBed.compileComponents();
    }));

    beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(TestApp);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});


@Component({
    selector: 'test-app',
    template: `

    `
})
class TestApp {

}
