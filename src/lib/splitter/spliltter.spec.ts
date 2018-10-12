import { Component, DebugElement, Type } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { Direction } from "./splitter.constants";

import { McSplitterComponent } from "./splitter.component";
import { McSplitterModule } from "./splitter.module";


function createTestComponent<T>(component: Type<T>) {
    TestBed
        .resetTestingModule()
        .configureTestingModule({
            imports: [ McSplitterModule ],
            declarations: [ component ],
            providers: []
        })
        .compileComponents();

    return TestBed.createComponent<T>(component);
}


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
class McSplitterDefaultDirection {}

@Component({
    selector: 'mc-demo-spllitter',
    template: `
        <mc-splitter [direction]="direction">
            <mc-splitter-area>first</mc-splitter-area>
            <mc-splitter-area>second</mc-splitter-area>
            <mc-splitter-area>third</mc-splitter-area>
        </mc-splitter>
    `
})
class McSplitterDirection {
    direction: Direction;
}


describe('McSplitter', () => {
    describe('basic behaviour', () => {
        it('should have default direction "horizontal"', () => {
            const fixture = createTestComponent(McSplitterDefaultDirection);
            const splitter: DebugElement = fixture.debugElement.query(By.directive(McSplitterComponent));

            fixture.detectChanges();

            expect(splitter.nativeElement.classList.contains('layout-row')).toBe(true);
        });

        it('should change direction', () => {
            const fixture = createTestComponent(McSplitterDirection);
            const splitter = fixture.debugElement.query(By.directive(McSplitterComponent)).nativeElement;

            fixture.detectChanges();

            expect(splitter.classList.contains('layout-row')).toBe(true);
            expect(splitter.classList.contains('layout-column')).toBe(false);

            fixture.componentInstance.direction = Direction.Vertical;
            fixture.detectChanges();

            expect(splitter.classList.contains('layout-column')).toBe(true);
            expect(splitter.classList.contains('layout-row')).toBe(false);

            fixture.componentInstance.direction = Direction.Horizontal;
            fixture.detectChanges();

            expect(splitter.classList.contains('layout-row')).toBe(true);
            expect(splitter.classList.contains('layout-column')).toBe(false);
        });
    });
});
