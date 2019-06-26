import { Component, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { McSidebar, McSidebarModule, SidebarPositions } from './index';


/* tslint:disable:no-magic-numbers */
describe('Sidebar', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                FormsModule,
                ReactiveFormsModule,
                McSidebarModule
            ],
            declarations: [SimpleSidebar]
        });

        TestBed.compileComponents();
    }));

    describe('base', () => {
        let fixture: ComponentFixture<SimpleSidebar>;
        let testComponent: SimpleSidebar;
        let sidebarComponent: McSidebar;

        beforeEach(async(() => {
            fixture = TestBed.createComponent(SimpleSidebar);
            fixture.detectChanges();

            testComponent = fixture.debugElement.componentInstance;
            sidebarComponent = fixture.debugElement.componentInstance.sidebar;
        }));

        it('should render with default parameters', () => {
            expect(sidebarComponent.opened).toBeTruthy();
            expect(sidebarComponent.position).toBe(SidebarPositions.Left);
            expect(sidebarComponent.openedContent).toBeDefined();
            expect(sidebarComponent.closedContent).toBeDefined();
        });

        it('should change state by property', () => {
            expect(sidebarComponent.opened).toBeTruthy();

            testComponent.state = false;
            fixture.detectChanges();

            expect(sidebarComponent.opened).toBeFalsy();

            testComponent.state = true;
            fixture.detectChanges();

            expect(sidebarComponent.opened).toBeTruthy();
        });

        it('should change state by method', () => {
            expect(sidebarComponent.opened).toBeTruthy();

            sidebarComponent.toggle();
            fixture.detectChanges();

            expect(sidebarComponent.opened).toBeFalsy();

            sidebarComponent.toggle();
            fixture.detectChanges();

            expect(sidebarComponent.opened).toBeTruthy();
        });

        it('should change position', () => {
            expect(sidebarComponent.position).toBe(SidebarPositions.Left);

            testComponent.position = SidebarPositions.Right;
            fixture.detectChanges();

            expect(sidebarComponent.position).toBe(SidebarPositions.Right);
        });

        xit('should fire change event', () => {
            const changeSpy = jasmine.createSpy('state change listener');
            sidebarComponent.stateChanged.subscribe(changeSpy);

            expect(sidebarComponent.opened).toBeTruthy();

            // sidebarComponent.stateChanged.emit(true);
            sidebarComponent.toggle();
            fixture.detectChanges();

            expect(sidebarComponent.opened).toBeFalsy();

            expect(changeSpy).toHaveBeenCalled();
        });

        it('should add and remove event listeners from document', () => {
            spyOn(document, 'addEventListener');
            spyOn(document, 'removeEventListener');

            testComponent.showContainer = false;
            fixture.detectChanges();

            // tslint:disable-next-line: no-unbound-method
            expect(document.removeEventListener).toHaveBeenCalledWith('keypress', jasmine.any(Function), true);

            testComponent.showContainer = true;
            fixture.detectChanges();

            // tslint:disable-next-line: no-unbound-method
            expect(document.addEventListener).toHaveBeenCalledWith('keypress', jasmine.any(Function), true);
        });
    });
});


@Component({
    template: `
        <div *ngIf="showContainer">
            <mc-sidebar
                #sidebarRef="mcSidebar"
                [position]="position"
                [opened]="state"
                (stateChanged)="onStateChanged($event)">
                <div mc-sidebar-opened>mc-sidebar-opened</div>
                <div mc-sidebar-closed>mc-sidebar-closed</div>
            </mc-sidebar>
        </div>
  `
})
class SimpleSidebar {
    showContainer: boolean = true;

    position: SidebarPositions = SidebarPositions.Left;

    state: boolean = true;

    @ViewChild(McSidebar, { static: false }) sidebar: McSidebar;

    onStateChanged($event): void {}
}
