import { Component, Type, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { dispatchMouseEvent } from '@ptsecurity/cdk/testing';

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

    const expectedDirection = direction === Direction.Vertical
        ? 'column'
        : 'row';

    const expectedWidth = (direction === Direction.Vertical)
        ? ''
        : `${gutterSize}px`;

    const expectedHeight = (direction === Direction.Vertical)
        ? `${gutterSize}px`
        : '100%';

    expect(splitter.nativeElement.style.flexDirection).toBe(expectedDirection);

    expect(gutters.length).toBe(guttersCount);
    expect(gutters.every((gutter) => gutter.nativeElement.style.width === expectedWidth)).toBe(true);
    expect(gutters.every((gutter) => gutter.nativeElement.style.height === expectedHeight)).toBe(true);
}


@Component({
    selector: 'mc-demo-spllitter',
    template: `
        <mc-splitter>
            <div mc-splitter-area>first</div>
            <div mc-splitter-area>second</div>
            <div mc-splitter-area>third</div>
        </mc-splitter>
    `
})
class McSplitterDefaultDirection {}

@Component({
    selector: 'mc-demo-spllitter',
    template: `
        <mc-splitter [direction]="direction">
            <div mc-splitter-area>first</div>
            <div mc-splitter-area>second</div>
            <div mc-splitter-area>third</div>
        </mc-splitter>
    `
})
class McSplitterDirection {
    direction: Direction = Direction.Vertical;
}


@Component({
    selector: 'mc-demo-spllitter',
    template: `
        <mc-splitter (gutterPositionChange)="gutterPositionChange()">
            <div #areaA mc-splitter-area (sizeChange)="areaASizeChange($event)">first</div>
            <div #areaB mc-splitter-area (sizeChange)="areaBSizeChange($event)">second</div>
        </mc-splitter>
    `
})
class McSplitterEvents {
    gutterPositionChange = jasmine.createSpy('gutter position change callback');
    areaASizeChange = jasmine.createSpy('area A size change callback', (size: number) => size);
    areaBSizeChange = jasmine.createSpy('area B size change callback', (size: number) => size);
    @ViewChild('areaA', { static: false, read: McSplitterAreaDirective }) areaA: McSplitterAreaDirective;
    @ViewChild('areaB', { static: false, read: McSplitterAreaDirective }) areaB: McSplitterAreaDirective;
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
    describe('events', () => {
        it('should emit events after releasing gutter', fakeAsync(() => {
            const fixture = createTestComponent(McSplitterEvents);
            fixture.detectChanges();

            tick();

            const gutters = fixture.debugElement.queryAll(By.directive(McGutterDirective));

            dispatchMouseEvent(gutters[0].nativeElement, 'mousedown');
            document.dispatchEvent(new Event('mouseup'));

            fixture.detectChanges();

            expect(fixture.componentInstance.gutterPositionChange).toHaveBeenCalledTimes(1);
            expect(fixture.componentInstance.areaASizeChange).toHaveBeenCalledTimes(1);
            expect(fixture.componentInstance.areaASizeChange).toHaveBeenCalledWith(fixture.componentInstance.areaA.getSize());
            expect(fixture.componentInstance.areaBSizeChange).toHaveBeenCalledTimes(1);
            expect(fixture.componentInstance.areaBSizeChange).toHaveBeenCalledWith(fixture.componentInstance.areaB.getSize());
        }));
    });
});
