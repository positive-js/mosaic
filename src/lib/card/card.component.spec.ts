import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { McCard, McCardModule, Status } from './index';


describe('MсCard', () => {
    let fixture: ComponentFixture<TestApp>;
    let cardDebugElement: DebugElement;
    let cardNativeElement: HTMLElement;
    let testComponent: TestApp;
    let wraperElement: HTMLInputElement;

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
        wraperElement = <HTMLInputElement> cardNativeElement.querySelector('.mc-card-wrapper');
    }));

    it('should apply class based on status', () => {

        testComponent.status = Status.Info;
        fixture.detectChanges();
        expect(wraperElement.classList.contains('mc-card_info')).toBe(true);

        testComponent.status = Status.Error;
        fixture.detectChanges();
        expect(wraperElement.classList.contains('mc-card_error')).toBe(true);

        testComponent.status = Status.Warning;
        fixture.detectChanges();
        expect(wraperElement.classList.contains('mc-card_warning')).toBe(true);

        testComponent.status = Status.Success;
        fixture.detectChanges();
        expect(wraperElement.classList.contains('mc-card_success')).toBe(true);
    });

    it('should apply class for "white mode"', () => {

        testComponent.mode = 'white';
        fixture.detectChanges();
        expect(wraperElement.classList.contains('mc-card_white')).toBe(true);
    });

    it('should add class on selected', () => {
        testComponent.selected = true;
        fixture.detectChanges();

        expect(wraperElement.classList.contains('mc-card_selected')).toBe(true);
    });

    it('should handle a click on the card', () => {
        wraperElement.click();

        expect(testComponent.clickCount).toBe(1);
    });

    it('should not interact if readonly', () => {
        testComponent.readonly = true;
        fixture.detectChanges();

        wraperElement.click();

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
        <mc-card [status]="status"
                 [selected]="selected"
                 [mode]="mode"
                 [readonly]="readonly"
                 (selectedChange)="increment()">
        </mc-card>
    `
})
class TestApp {
    status: Status = Status.Info;
    readonly = false;
    selected = false;
    mode: 'color' | 'white' = 'color';

    clickCount: number = 0;

    increment() {
        this.clickCount++;
    }
}
