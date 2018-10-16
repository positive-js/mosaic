import { Component, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { Direction, McGutterDirective, McSplitterAreaDirective, McSplitterComponent, McSplitterModule } from './index';


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

function checkDirection<T>(fixture: ComponentFixture<T>,
                           direction: Direction,
                           guttersCount: number,
                           gutterSize: number) {

    const splitter = fixture.debugElement.query(By.directive(McSplitterComponent));
    const gutters = fixture.debugElement.queryAll(By.directive(McGutterDirective));

    const mainAxisClass = direction === Direction.Vertical
        ? 'layout-column'
        : 'layout-row';

    const crossAxisClass = direction === Direction.Vertical
        ? 'layout-row'
        : 'layout-column';

    const expectedWidth = (direction === Direction.Vertical)
        ? ''
        : `${gutterSize}px`;

    const expectedHeight = (direction === Direction.Vertical)
        ? `${gutterSize}px`
        : '';

    expect(splitter.nativeElement.classList.contains(mainAxisClass)).toBe(true);
    expect(splitter.nativeElement.classList.contains(crossAxisClass)).toBe(false);
    expect(gutters.length).toBe(guttersCount);
    expect(gutters.every((gutter) => gutter.nativeElement.style.width === expectedWidth)).toBe(true);
    expect(gutters.every((gutter) => gutter.nativeElement.style.height === expectedHeight)).toBe(true);
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
    direction: Direction = Direction.Vertical;
}

describe('McSplitter', () => {
    describe('direction', () => {
        it('should be default', () => {
            const fixture = createTestComponent(McSplitterDefaultDirection);

            fixture.detectChanges();

            const areas = fixture.debugElement.queryAll(By.directive(McSplitterAreaDirective));
            const expectedAreasCount = 3;
            const expectedGuttersCount = expectedAreasCount - 1;
            const expectedGutterSize = 6;

            checkDirection(fixture, Direction.Horizontal, expectedGuttersCount, expectedGutterSize);

            expect(areas.length).toBe(expectedAreasCount);
        });


        it('should be horizontal', () => {
            const fixture = createTestComponent(McSplitterDirection);
            const expectedGuttersCount = 2;
            const expectedGutterSize = 6;

            fixture.componentInstance.direction = Direction.Horizontal;
            fixture.detectChanges();

            checkDirection(fixture, Direction.Horizontal, expectedGuttersCount, expectedGutterSize);
        });

        it('should be vertical', () => {
            const fixture = createTestComponent(McSplitterDirection);
            const expectedGuttersCount = 2;
            const expectedGutterSize = 6;

            fixture.componentInstance.direction = Direction.Vertical;
            fixture.detectChanges();

            checkDirection(fixture, Direction.Vertical, expectedGuttersCount, expectedGutterSize);
        });
    });
});
