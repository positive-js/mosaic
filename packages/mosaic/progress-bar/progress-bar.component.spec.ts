import { Component } from '@angular/core';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ThemePalette } from '@ptsecurity/mosaic/core';

import { McProgressBarModule } from './index';


// tslint:disable no-magic-numbers
const percentPairs = [
    [40, 0.4],
    [-50, 0],
    [140, 1]
];
// tslint:enable no-magic-numbers

describe('McProgressBar', () => {
    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [McProgressBarModule],
            declarations: [TestApp]
        });

        TestBed.compileComponents();
    }));

    it('should apply class based on color attribute', () => {
        const fixture = TestBed.createComponent(TestApp);
        const testComponent = fixture.debugElement.componentInstance;
        const progressBarDebugElement = fixture.debugElement.query(By.css('.first'));

        Object.keys(ThemePalette).forEach((key) => {
            if (ThemePalette[key]) {
                testComponent.color = ThemePalette[key];
                fixture.detectChanges();
                expect(
                    progressBarDebugElement.nativeElement.classList.contains(`mc-${ThemePalette[key]}`)
                ).toBe(true);
            }
        });
    });

    it('should has default primary color', () => {
        const fixture = TestBed.createComponent(TestApp);
        const progressBarDebugElement = fixture.debugElement.query(By.css('.default'));

        expect(progressBarDebugElement.nativeElement.classList.contains(`mc-${ThemePalette.Primary}`)).toBe(true);
    });

    it('should return percentage', () => {
        const fixture = TestBed.createComponent(TestApp);

        const testComponent = fixture.debugElement.componentInstance;
        const progressBarDebugElement = fixture.debugElement.query(By.css('.first'));

        percentPairs.forEach(([percent, expected]) => {
            testComponent.value = percent;
            fixture.detectChanges();
            expect(progressBarDebugElement.componentInstance.percentage).toBe(expected);
        });
    });

    it('should return 0 percentage by default', () => {
        const fixture = TestBed.createComponent(TestApp);
        const progressBarDebugElement = fixture.debugElement.query(By.css('.default'));

        expect(progressBarDebugElement.componentInstance.percentage).toBe(0);
    });

    it('should show determinate line', () => {
        const fixture = TestBed.createComponent(TestApp);
        const testComponent = fixture.debugElement.componentInstance;
        const progressBarDebugElement = fixture.debugElement.query(By.css('.first'));
        testComponent.mode = 'determinate';
        fixture.detectChanges();

        expect(progressBarDebugElement.query(By.css('.mc-progress-bar__line--determinate'))).toBeDefined();
    });

    it('should show indeterminate line', () => {
        const fixture = TestBed.createComponent(TestApp);
        const testComponent = fixture.debugElement.componentInstance;
        const progressBarDebugElement = fixture.debugElement.query(By.css('.first'));
        testComponent.mode = 'indeterminate';
        fixture.detectChanges();

        expect(progressBarDebugElement.query(By.css('.mc-progress-bar__line--indeterminate'))).toBeDefined();
    });

    it('should show determinate line by default', () => {
        const fixture = TestBed.createComponent(TestApp);
        const progressBarDebugElement = fixture.debugElement.query(By.css('.default'));

        expect(progressBarDebugElement.query(By.css('.mc-progress-bar__line--determinate'))).toBeDefined();
    });

    it('should set id attribute', () => {
        const fixture = TestBed.createComponent(TestApp);
        const testComponent = fixture.debugElement.componentInstance;
        const progressBarDebugElement = fixture.debugElement.query(By.css('.first'));
        testComponent.id = 'foo';
        fixture.detectChanges();

        expect(progressBarDebugElement.nativeElement.getAttribute('id')).toBe('foo');
    });

    it('should auto generate id', () => {
        const fixture = TestBed.createComponent(TestApp);
        const progressBarDebugElement = fixture.debugElement.query(By.css('.default'));

        expect(progressBarDebugElement.nativeElement.getAttribute('id')).toBeDefined();
    });
});


@Component({
    selector: 'test-app',
    template: `
        <mc-progress-bar
             class="first"
             [id]="id"
             [color]="color"
             [value]="value"
             [mode]="mode">
        </mc-progress-bar>
        <mc-progress-bar class="default"></mc-progress-bar>
    `
})
class TestApp {
    color: ThemePalette;
    value: number = 0;
    mode: string;
    id: string;
}
