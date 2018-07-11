// tslint:disable no-magic-numbers
import { Component } from '@angular/core';
import {
    ComponentFixture,
    fakeAsync,
    TestBed
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';

import {
    McTimepicker,
    McTimepickerModule
} from './index';


@Component({
    selector: 'test-app',
    template: `
        <mc-form-field>
            <i mcPrefix mc-icon="mc-clock_16"></i>
            <input mcTimepicker
                   [(ngModel)]="timeValue"
                   [time-format]="timeFormat"
                   [min-time]="minTime"
                   [max-time]="maxTime"
                   [disabled]="isDisabled">
        </mc-form-field>`
})
class TestApp {
    timeFormat: string;
    minTime: string;
    maxTime: string;
    timeValue: Date;
    isDisabled: boolean;
}


describe('McTimepicker', () => {
    beforeEach(fakeAsync(() => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [
                McTimepickerModule,
                FormsModule,
                McFormFieldModule,
                McTimepickerModule,
                McIconModule],
            declarations: [TestApp]
        });
        TestBed.compileComponents();
    }));

    let fixture: ComponentFixture<TestApp>;
    let testComponent: TestApp;
    let inputElementDebug;

    describe('Timerange validation', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestApp);
            testComponent = fixture.debugElement.componentInstance;
            inputElementDebug = fixture.debugElement.query(By.directive(McTimepicker));

            testComponent.timeValue = new Date('1970-01-01 12:18:28');
            fixture.detectChanges();
        });

        it('Should accept simple time set', () => {
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                expect(inputElementDebug.nativeElement.classList.contains('ng-valid')).toBe(true);
            });
        });

        it('Should validate if time in min-max range', () => {
            fixture.whenStable().then(() => {
                testComponent.minTime = '10:00:00';
                testComponent.maxTime = '23:00:00';
                fixture.detectChanges();
                expect(inputElementDebug.nativeElement.getAttribute('min-time')).toBe('10:00:00');
                expect(inputElementDebug.nativeElement.getAttribute('max-time')).toBe('23:00:00');
            });
        });

        it('Should invalidate time lower then min-time', () => {
            fixture.whenStable().then(() => {
                testComponent.minTime = '13:59:00';
                fixture.detectChanges();
                expect(inputElementDebug.nativeElement.classList.contains('ng-invalid')).toBe(true);
            });
        });

        it('Should invalidate time higher then max-time', () => {
            fixture.whenStable().then(() => {
                testComponent.maxTime = '11:00:00';
                fixture.detectChanges();
                expect(inputElementDebug.nativeElement.classList.contains('ng-invalid')).toBe(true);
            });
        });
    });

    describe('Convert user input', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestApp);
            testComponent = fixture.debugElement.componentInstance;
            inputElementDebug = fixture.debugElement.query(By.directive(McTimepicker));

            testComponent.timeValue = new Date('1970-01-01 12:18:28');
            fixture.detectChanges();
        });

        it('Convert input', () => {
            fixture.whenStable().then(() => {
                testComponent.timeFormat = 'HH:mm:ss';
                inputElementDebug.nativeElement.value = '18:08:08';
                inputElementDebug.triggerEventHandler('input', { target: inputElementDebug.nativeElement });
                fixture.detectChanges();

                return fixture.whenStable();
            }).then(() => {
                fixture.detectChanges();

                console.log(testComponent.timeValue); // tslint:disable-line
                expect(testComponent.timeValue.toString()).toContain('18:08:08');
            });
        });
    });
});
