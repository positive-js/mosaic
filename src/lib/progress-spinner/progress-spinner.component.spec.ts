import { Component } from '@angular/core';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ThemePalette } from '@ptsecurity/mosaic/core';

import { McProgressSpinnerModule } from './index';


// tslint:disable no-magic-numbers
const percentPairs = [
    [40, 0.4],
    [-50, 0],
    [140, 1]
];
// tslint:enable no-magic-numbers

describe('McProgressSpinner', () => {
    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [McProgressSpinnerModule],
            declarations: [TestApp]
        });

        TestBed.compileComponents();
    }));

    it('should apply class based on color attribute', () => {
        const fixture = TestBed.createComponent(TestApp);
        const testComponent = fixture.debugElement.componentInstance;
        const progressSpinnerDebugElement = fixture.debugElement.query(By.css('.first'));

        Object.keys(ThemePalette).forEach((key) => {
            if (ThemePalette[key]) {
                testComponent.color = ThemePalette[key];
                fixture.detectChanges();

                expect(
                    progressSpinnerDebugElement.nativeElement.classList.contains(`mc-${ThemePalette[key]}`)
                ).toBe(true);
            }
        });
    });

    it('should has default primary color', () => {
        const fixture = TestBed.createComponent(TestApp);
        const progressSpinnerDebugElement = fixture.debugElement.query(By.css('.default'));

        expect(progressSpinnerDebugElement.nativeElement.classList.contains(`mc-${ThemePalette.Primary}`)).toBe(true);
    });

    it('should return percentage', () => {
        const fixture = TestBed.createComponent(TestApp);

        const testComponent = fixture.debugElement.componentInstance;
        const progressSpinnerDebugElement = fixture.debugElement.query(By.css('.first'));

        percentPairs.forEach(([percent, expected]) => {
            testComponent.value = percent;
            fixture.detectChanges();
            expect(progressSpinnerDebugElement.componentInstance.percentage).toBe(expected);
        });
    });

    it('should return 0 percentage by default', () => {
        const fixture = TestBed.createComponent(TestApp);
        const progressSpinnerDebugElement = fixture.debugElement.query(By.css('.default'));

        expect(progressSpinnerDebugElement.componentInstance.percentage).toBe(0);
    });

    it('should show determinate circle', () => {
        const fixture = TestBed.createComponent(TestApp);
        const testComponent = fixture.debugElement.componentInstance;
        const progressSpinnerDebugElement = fixture.debugElement.query(By.css('.first'));
        testComponent.mode = 'determinate';
        fixture.detectChanges();

        expect(progressSpinnerDebugElement.query(By.css('.mc-progress-spinner__circle--indeterminate'))).toBeNull();
        expect(progressSpinnerDebugElement.query(By.css('.mc-progress-spinner__circle'))).not.toBeNull();
    });

    it('should show indeterminate circle', () => {
        const fixture = TestBed.createComponent(TestApp);
        const testComponent = fixture.debugElement.componentInstance;
        const progressSpinnerDebugElement = fixture.debugElement.query(By.css('.first'));
        testComponent.mode = 'indeterminate';
        fixture.detectChanges();

        expect(progressSpinnerDebugElement.query(By.css('.mc-progress-spinner__inner--indeterminate'))).not.toBeNull();
    });

    it('should show determinate circle by default', () => {
        const fixture = TestBed.createComponent(TestApp);
        const progressSpinnerDebugElement = fixture.debugElement.query(By.css('.first'));
        fixture.detectChanges();

        expect(progressSpinnerDebugElement.query(By.css('.mc-progress-spinner__circle--indeterminate'))).toBeNull();
        expect(progressSpinnerDebugElement.query(By.css('.mc-progress-spinner__circle'))).not.toBeNull();
    });

    it('should set id attribute', () => {
        const fixture = TestBed.createComponent(TestApp);
        const testComponent = fixture.debugElement.componentInstance;
        const progressSpinnerDebugElement = fixture.debugElement.query(By.css('.first'));
        testComponent.id = 'foo';
        fixture.detectChanges();

        expect(progressSpinnerDebugElement.nativeElement.getAttribute('id')).toBe('foo');
    });

    it('should auto generate id', () => {
        const fixture = TestBed.createComponent(TestApp);
        const progressSpinnerDebugElement = fixture.debugElement.query(By.css('.default'));

        expect(progressSpinnerDebugElement.nativeElement.getAttribute('id')).toBeDefined();
    });
});


@Component({
    selector: 'test-app',
    template: `
        <mc-progress-spinner
             class="first"
             [id]="id"
             [color]="color"
             [value]="value"
             [mode]="mode">
        </mc-progress-spinner>
        <mc-progress-spinner class="default"></mc-progress-spinner>
    `
})
class TestApp {
    color: ThemePalette;
    value: number = 0;
    mode: string;
    id: string;
}
