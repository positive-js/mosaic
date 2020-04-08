import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { McCard, McCardModule } from './index';


describe('MсCard', () => {
    let fixture: ComponentFixture<TestApp>;
    let cardDebugElement: DebugElement;
    let cardNativeElement: HTMLElement;
    let testComponent: TestApp;

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [McCardModule],
            declarations: [TestApp]
        });

        TestBed.compileComponents();

        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();

        cardDebugElement = fixture.debugElement.query(By.directive(McCard));
        cardNativeElement = cardDebugElement.nativeElement;
        testComponent = fixture.debugElement.componentInstance;
    }));

    it('should add class on selected', () => {
        testComponent.selected = true;
        fixture.detectChanges();

        expect(cardNativeElement.classList.contains('mc-selected')).toBe(true);
    });

    it('should handle a click on the card', () => {
        cardNativeElement.click();

        expect(testComponent.clickCount).toBe(1);
    });

    it('should not interact if readonly', () => {
        testComponent.readonly = true;
        fixture.detectChanges();

        cardNativeElement.click();

        expect(testComponent.clickCount).toBe(0);
    });

    it('should remove tabindex if readonly', () => {
        expect(cardNativeElement.getAttribute('tabIndex')).toBe('0');

        testComponent.readonly = true;
        fixture.detectChanges();
        expect(cardNativeElement.getAttribute('tabIndex')).toBe(null);
    });
});


@Component({
    selector: 'test-app',
    template: `
        <mc-card [selected]="selected"
                 [readonly]="readonly"
                 (selectedChange)="increment()">
        </mc-card>
    `
})
class TestApp {
    readonly = false;
    selected = false;

    clickCount: number = 0;

    increment() {
        this.clickCount++;
    }
}
