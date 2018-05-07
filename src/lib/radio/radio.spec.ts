import { Component, DebugElement, ViewChild } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { McRadioButton, McRadioChange, McRadioGroup, McRadioModule } from './index';


describe('MсRadio', () => {

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [McRadioModule, FormsModule, ReactiveFormsModule],
            declarations: [
                DisableableRadioButton
            ]
        });

        TestBed.compileComponents();
    }));

    describe('disableable', () => {
        let fixture: ComponentFixture<DisableableRadioButton>;
        let radioInstance: McRadioButton;
        let radioNativeElement: HTMLInputElement;
        let testComponent: DisableableRadioButton;

        beforeEach(() => {
            fixture = TestBed.createComponent(DisableableRadioButton);
            fixture.detectChanges();

            testComponent = fixture.debugElement.componentInstance;

            const radioDebugElement = fixture.debugElement.query(By.directive(McRadioButton));
            radioInstance = radioDebugElement.injector.get<McRadioButton>(McRadioButton);
            radioNativeElement = radioDebugElement.nativeElement.querySelector('input');
        });

        it('should toggle the disabled state', () => {
            expect(radioInstance.disabled).toBeFalsy();
            expect(radioNativeElement.disabled).toBeFalsy();

            testComponent.disabled = true;
            fixture.detectChanges();
            expect(radioInstance.disabled).toBeTruthy();
            expect(radioNativeElement.disabled).toBeTruthy();

            testComponent.disabled = false;
            fixture.detectChanges();
            expect(radioInstance.disabled).toBeFalsy();
            expect(radioNativeElement.disabled).toBeFalsy();
        });
    });
});

@Component({
    template: `<mc-radio-button>One</mc-radio-button>`
})
class DisableableRadioButton {
    @ViewChild(McRadioButton) mcRadioButton;

    set disabled(value: boolean) {
        this.mcRadioButton.disabled = value;
    }
}
