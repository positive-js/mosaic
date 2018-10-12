import { Component, DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { McSplitterComponent } from './splitter.component';
import { McSplitterModule } from './splitter.module';


describe('McSplitter', () => {
    let fixture: ComponentFixture<McDemoSplitterComponent>;

    describe('basic behaviour', () => {
        beforeEach(async(() => {
            TestBed
                .configureTestingModule({
                    imports: [ McSplitterModule ],
                    declarations: [ McDemoSplitterComponent ],
                    providers: []
                })
                .compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(McDemoSplitterComponent);
            fixture.detectChanges();
        })

        it('should have default direction "horizontal"', () => {
            const splitter = fixture.debugElement.query(By.directive(McSplitterComponent));
            fixture.detectChanges();

            expect(splitter.nativeElement.classList.contains('layout-row')).toBe(true);
        })
    });
});

@Component({
    selector: 'mc-demo-spllitter',
    template: `
        <mc-splitter>
            <mc-splitter-area>first</mc-splitter-area>
            <mc-splitter-area>second</mc-splitter-area>
            <mc-splitter-area>third</mc-splitter-area>
        </mc-splitter>
    `
})
class McDemoSplitterComponent {}

