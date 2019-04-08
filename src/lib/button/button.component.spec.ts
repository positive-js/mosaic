import { Component } from '@angular/core';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ThemePalette } from '@ptsecurity/mosaic/core';
import { McIconModule } from '@ptsecurity/mosaic/icon';

import { McButtonModule } from './index';


describe('McButton', () => {

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [McButtonModule],
            declarations: [TestApp]
        });

        TestBed.compileComponents();
    }));

    it('should apply class based on color attribute', () => {
        const fixture = TestBed.createComponent(TestApp);

        const testComponent = fixture.debugElement.componentInstance;
        const buttonDebugElement = fixture.debugElement.query(By.css('button'));
        const aDebugElement = fixture.debugElement.query(By.css('a'));

        testComponent.buttonColor = 'primary';
        fixture.detectChanges();
        expect(buttonDebugElement.nativeElement.classList.contains('mc-primary')).toBe(true);
        expect(aDebugElement.nativeElement.classList.contains('mc-primary')).toBe(true);

        testComponent.buttonColor = 'accent';
        fixture.detectChanges();
        expect(buttonDebugElement.nativeElement.classList.contains('mc-accent')).toBe(true);
        expect(aDebugElement.nativeElement.classList.contains('mc-accent')).toBe(true);

        testComponent.buttonColor = null;
        fixture.detectChanges();

        expect(buttonDebugElement.nativeElement.classList).not.toContain('mc-accent');
        expect(aDebugElement.nativeElement.classList).not.toContain('mc-accent');
    });

    it('should should not clear previous defined classes', () => {
        const fixture = TestBed.createComponent(TestApp);
        const testComponent = fixture.debugElement.componentInstance;
        const buttonDebugElement = fixture.debugElement.query(By.css('button'));

        buttonDebugElement.nativeElement.classList.add('custom-class');

        testComponent.buttonColor = 'primary';
        fixture.detectChanges();

        expect(buttonDebugElement.nativeElement.classList.contains('mc-primary')).toBe(true);
        expect(buttonDebugElement.nativeElement.classList.contains('custom-class')).toBe(true);

        testComponent.buttonColor = 'accent';
        fixture.detectChanges();

        expect(buttonDebugElement.nativeElement.classList.contains('mc-primary')).toBe(false);
        expect(buttonDebugElement.nativeElement.classList.contains('mc-accent')).toBe(true);
        expect(buttonDebugElement.nativeElement.classList.contains('custom-class')).toBe(true);
    });

    describe('button[mc-button]', () => {
        it('should handle a click on the button', () => {
            const fixture = TestBed.createComponent(TestApp);
            const testComponent = fixture.debugElement.componentInstance;
            const buttonDebugElement = fixture.debugElement.query(By.css('button'));

            buttonDebugElement.nativeElement.click();
            expect(testComponent.clickCount).toBe(1);
        });

        it('should not increment if disabled', () => {
            const fixture = TestBed.createComponent(TestApp);
            const testComponent = fixture.debugElement.componentInstance;
            const buttonDebugElement = fixture.debugElement.query(By.css('button'));

            testComponent.isDisabled = true;
            fixture.detectChanges();

            buttonDebugElement.nativeElement.click();

            expect(testComponent.clickCount).toBe(0);
        });

        it('should disable the native button element', () => {
            const fixture = TestBed.createComponent(TestApp);
            const buttonNativeElement = fixture.nativeElement.querySelector('button');

            expect(buttonNativeElement.disabled).toBeFalsy('Expected button not to be disabled');

            fixture.componentInstance.isDisabled = true;
            fixture.detectChanges();
            expect(buttonNativeElement.disabled).toBeTruthy('Expected button to be disabled');
        });

    });

    describe('a[mc-button]', () => {
        it('should not redirect if disabled', () => {
            const fixture = TestBed.createComponent(TestApp);
            const testComponent = fixture.debugElement.componentInstance;
            const buttonDebugElement = fixture.debugElement.query(By.css('a'));

            testComponent.isDisabled = true;
            fixture.detectChanges();

            buttonDebugElement.nativeElement.click();
        });

        it('should remove tabindex if disabled', () => {
            const fixture = TestBed.createComponent(TestApp);
            const testComponent = fixture.debugElement.componentInstance;
            const buttonDebugElement = fixture.debugElement.query(By.css('a'));

            expect(buttonDebugElement.nativeElement.getAttribute('tabIndex')).toBe(null);

            testComponent.isDisabled = true;
            fixture.detectChanges();
            expect(buttonDebugElement.nativeElement.getAttribute('tabIndex')).toBe('-1');
        });
    });

    it('should handle a click on the button', () => {
        const fixture = TestBed.createComponent(TestApp);
        const testComponent = fixture.debugElement.componentInstance;
        const buttonDebugElement = fixture.debugElement.query(By.css('button'));

        buttonDebugElement.nativeElement.click();

        expect(testComponent.clickCount).toBe(1);
    });
});

describe('Button with icon', () => {
    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [McButtonModule, McIconModule],
            declarations: [
                McButtonCommentCaseTestApp,
                McButtonTextIconCaseTestApp,
                McButtonTwoIconsCaseTestApp
            ]
        });

        TestBed.compileComponents();
    }));

    it('should not add left and right css classes when sibling is html comments', () => {
        const fixture = TestBed.createComponent(McButtonCommentCaseTestApp);

        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('.mc-icon_left'))).toBeNull();
        expect(fixture.debugElement.query(By.css('.mc-icon_right'))).toBeNull();

        expect(fixture.debugElement.query(By.css('.mc-icon-button_left'))).toBeNull();
        expect(fixture.debugElement.query(By.css('.mc-icon-button_right'))).toBeNull();
    });

    it('should not add left and right css classes when sibling is not html comments but text node', () => {
        const fixture = TestBed.createComponent(McButtonTextIconCaseTestApp);

        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('.mc-icon_left'))).not.toBeNull();
        expect(fixture.debugElement.query(By.css('.mc-icon_right'))).not.toBeNull();

        expect(fixture.debugElement.query(By.css('.mc-icon-button_left'))).not.toBeNull();
        expect(fixture.debugElement.query(By.css('.mc-icon-button_right'))).not.toBeNull();
    });

    it('should not add left and right css classes when there are two icons', () => {
        const fixture = TestBed.createComponent(McButtonTwoIconsCaseTestApp);

        fixture.detectChanges();

        expect(fixture.debugElement.queryAll(By.css('.mc-icon_left')).length).toBe(1);
        expect(fixture.debugElement.queryAll(By.css('.mc-icon_right')).length).toBe(1);

        expect(fixture.debugElement.query(By.css('.mc-icon-button_left'))).toBeNull();
        expect(fixture.debugElement.query(By.css('.mc-icon-button_right'))).toBeNull();
    });
});


@Component({
    selector: 'test-app',
    template: `
        <button mc-button type="button"
                [color]="buttonColor"
                (click)="increment()"
                [disabled]="isDisabled">
        </button>
        <a href="#" mc-button
           [color]="buttonColor"
           (click)="increment()"
           [disabled]="isDisabled">
        </a>
    `
})
class TestApp {
    clickCount: number = 0;
    isDisabled: boolean = false;
    buttonColor: ThemePalette;

    increment() {
        this.clickCount++;
    }
}

@Component({
    selector: 'mc-button-comment-case-test-app',
    template: `
        <button mc-button type="button">
            <!-- comment-before -->
            <i mc-icon="mc-angle-down-L_16"></i>
            <!-- comment-after -->
        </button>
    `
})
class McButtonCommentCaseTestApp {}

@Component({
    selector: 'mc-button-text-icon-case-test-app',
    template: `
        <button mc-button type="button">
            Some text
            <i mc-icon="mc-angle-down-L_16"></i>
            Some text
        </button>
    `
})
class McButtonTextIconCaseTestApp {}

@Component({
    selector: 'mc-button-two-icons-case-test-app',
    template: `
        <button mc-button type="button">
            <i mc-icon="mc-angle-up-L_16"></i>
            <i mc-icon="mc-angle-down-L_16"></i>
        </button>
    `
})
class McButtonTwoIconsCaseTestApp {}
