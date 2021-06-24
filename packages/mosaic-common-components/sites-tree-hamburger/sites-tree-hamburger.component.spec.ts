import { ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import { SitesTreeHamburgerComponent } from './sites-tree-hamburger.component';


describe('SitesTreeHamburgerComponent', () => {
    let component: SitesTreeHamburgerComponent;
    let fixture: ComponentFixture<SitesTreeHamburgerComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [SitesTreeHamburgerComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SitesTreeHamburgerComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
