import { Component, DebugElement, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { Direction } from './splitter.constants';

import { McSplitterComponent } from './splitter.component';
import { McSplitterModule } from './splitter.module';


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

function checkDirection(splitter: DebugElement, direction: Direction, guttersCount: number, gutterSize: number) {
    const gutters = splitter.nativeElement.querySelectorAll('mc-gutter');

    if (direction === Direction.Vertical) {
        expect(splitter.nativeElement.classList.contains('layout-column')).toBe(true);
        expect(splitter.nativeElement.classList.contains('layout-row')).toBe(false);
    } else {
        expect(splitter.nativeElement.classList.contains('layout-column')).toBe(false);
        expect(splitter.nativeElement.classList.contains('layout-row')).toBe(true);
    }

    expect(gutters.length).toBe(guttersCount);

    gutters.forEach((gutter) => {
        if (direction === Direction.Vertical) {
            expect(gutter.style.width).toBe('');
            expect(gutter.style.height).toBe(`${gutterSize}px`);
        } else {
            expect(gutter.style.width).toBe(`${gutterSize}px`);
            expect(gutter.style.height).toBe('');
        }
    });
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
        it('default', () => {
            const fixture = createTestComponent(McSplitterDefaultDirection);
            const splitter = fixture.debugElement.query(By.directive(McSplitterComponent));

            fixture.detectChanges();

            const areas = splitter.nativeElement.querySelectorAll('mc-splitter-area');
            const expectedAreasCount = 3;
            const expectedGuttersCount = expectedAreasCount - 1;
            const expectedGutterSize = 6;

            checkDirection(splitter, Direction.Horizontal, expectedGuttersCount, expectedGutterSize);

            expect(areas.length).toBe(expectedAreasCount);
        });


        it('horizontal', () => {
            const fixture = createTestComponent(McSplitterDirection);
            const splitter = fixture.debugElement.query(By.directive(McSplitterComponent));
            const expectedGuttersCount = 2;
            const expectedGutterSize = 6;

            fixture.componentInstance.direction = Direction.Horizontal;
            fixture.detectChanges();

            checkDirection(splitter, Direction.Horizontal, expectedGuttersCount, expectedGutterSize);
        });

        it('vertical', () => {
            const fixture = createTestComponent(McSplitterDirection);
            const splitter = fixture.debugElement.query(By.directive(McSplitterComponent));
            const expectedGuttersCount = 2;
            const expectedGutterSize = 6;

            fixture.componentInstance.direction = Direction.Vertical;
            fixture.detectChanges();

            checkDirection(splitter, Direction.Vertical, expectedGuttersCount, expectedGutterSize);
        });
    });
});
