import {Component} from '@angular/core';
import {async, fakeAsync, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import { McButtonModule } from './index';


describe('MatButton', () => {

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [McButtonModule],
            declarations: [TestApp]
        });

        TestBed.compileComponents();
    }));

    it('should handle a click on the button', () => {
        const fixture = TestBed.createComponent(TestApp);
        const testComponent = fixture.debugElement.componentInstance;
        const buttonDebugElement = fixture.debugElement.query(By.css('button'));

        buttonDebugElement.nativeElement.click();
        expect(testComponent.clickCount).toBe(1);
    });

});


@Component({
    selector: 'test-app',
    template: `
    <button mc-button type="button"
            (click)="increment()" 
            [disabled]="isDisabled">
      GoGo
    </button>
  `
})
class TestApp {
    clickCount: number = 0;
    isDisabled: boolean = false;

    increment() {
        this.clickCount++;
    }
}
