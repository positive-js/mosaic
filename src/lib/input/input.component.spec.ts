import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { FormsModule, NgModel } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { McInput, McInputModule } from './index';


describe('McInput', () => {
    let fixture: ComponentFixture<any>;

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [ McInputModule, FormsModule ],
            declarations: [
                Input
            ]
        });

        TestBed.compileComponents();
    }));

    describe('basic behaviors', () => {
        let inputDebugElement: DebugElement;
        let inputNativeElement: HTMLElement;
        let inputInstance: McInput;
        let testComponent: Input;
        let innerInputElement: HTMLInputElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(Input);
            fixture.detectChanges();

            inputDebugElement = fixture.debugElement.query(By.directive(McInput));
            inputNativeElement = inputDebugElement.nativeElement;
            inputInstance = inputDebugElement.componentInstance;
            testComponent = fixture.debugElement.componentInstance;
            innerInputElement = <HTMLInputElement> inputNativeElement.querySelector('input');
        });

        it('should change state "disable"', () => {
            expect(inputInstance.disabled).toBe(false);
            expect(inputNativeElement.classList).not.toContain('mc-input_disabled');

            testComponent.disabled = true;
            fixture.detectChanges();

            expect(inputInstance.disabled).toBe(true);
            expect(inputNativeElement.classList).toContain('mc-input_disabled');

            testComponent.disabled = false;
            fixture.detectChanges();

            expect(inputInstance.disabled).toBe(false);
            expect(inputNativeElement.classList).not.toContain('mc-input_disabled');
        });

        it('should has placeholder', () => {
            testComponent.placeholder = 'placeholder';
            fixture.detectChanges();

            expect(innerInputElement.getAttribute('placeholder')).toBe('placeholder');
        });

        it('should has cleaner and work', () => {
            let cleaner: any = inputNativeElement.querySelector('.mc-input__cleaner');

            expect(cleaner).toBeNull();

            testComponent.cleaner = true;
            fixture.detectChanges();

            cleaner = inputNativeElement.querySelector('.mc-input__cleaner');
            expect(cleaner).toBeNull();

            const ngModel: any = inputDebugElement.injector.get<NgModel>(NgModel);
            ngModel.valueAccessor.writeValue('test');
            fixture.detectChanges();

            cleaner = <HTMLElement> inputNativeElement.querySelector('.mc-input__cleaner');

            expect(cleaner).not.toBeNull();

            cleaner.click();
            fixture.detectChanges();
            expect(ngModel.valueAccessor.value).toBe('');
        });
    });
});

@Component({
    template: `<mc-input
        [cleaner]="cleaner"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [(ngModel)]="value">
    </mc-input>`
})
class Input {
    value: string = 'test';
    placeholder: string;
    disabled: boolean = false;
    cleaner: boolean = false;
}
