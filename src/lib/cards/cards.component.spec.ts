import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { McCard, McCardsModule, Status } from './index';


describe('MсCards', () => {
    let fixture: ComponentFixture<TestApp>;
    let cardDebugElement: DebugElement;
    let cardNativeElement: HTMLElement;
    let cardInstance: McCard;
    let testComponent: TestApp;
    let wraperElement: HTMLInputElement;

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [McCardsModule],
            declarations: [TestApp]
        });

        TestBed.compileComponents();

        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();

        cardDebugElement = fixture.debugElement.query(By.directive(McCard));
        cardNativeElement = cardDebugElement.nativeElement;
        cardInstance = cardDebugElement.componentInstance;
        testComponent = fixture.debugElement.componentInstance;
        wraperElement = <HTMLInputElement> cardNativeElement.querySelector('.mc-cards-wrapper');
    }));

    it('should apply class based on status', () => {

        testComponent.status = Status.Info;
        fixture.detectChanges();
        expect(wraperElement.classList.contains('mc-card__info')).toBe(true);

        testComponent.status = Status.Error;
        fixture.detectChanges();
        expect(wraperElement.classList.contains('mc-card__error')).toBe(true);

        testComponent.status = Status.Warning;
        fixture.detectChanges();
        expect(wraperElement.classList.contains('mc-card__warning')).toBe(true);

        testComponent.status = Status.Success;
        fixture.detectChanges();
        expect(wraperElement.classList.contains('mc-card__success')).toBe(true);
    });

    it('should apply class for "white mode"', () => {

        testComponent.mode = 'white';
        fixture.detectChanges();
        expect(wraperElement.classList.contains('mc-card__white')).toBe(true);
    });

    it('should add class on selected', () => {
        testComponent.selected = true;
        fixture.detectChanges();

        expect(wraperElement.classList.contains('mc-card__selected')).toBe(true);
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
