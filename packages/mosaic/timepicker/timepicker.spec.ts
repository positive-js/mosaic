// tslint:disable no-magic-numbers
import { Component, ViewChild } from '@angular/core';
import {
    ComponentFixture,
    fakeAsync,
    TestBed,
    tick
} from '@angular/core/testing';
import { FormsModule, NgModel } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { DOWN_ARROW, ONE, SPACE, TWO, UP_ARROW } from '@ptsecurity/cdk/keycodes';
import { createKeyboardEvent, dispatchFakeEvent, dispatchEvent } from '@ptsecurity/cdk/testing';
import { McMomentDateModule } from '@ptsecurity/mosaic-moment-adapter/adapter';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import * as _moment from 'moment';
// @ts-ignore
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';

import { McTimepicker, McTimepickerModule } from './index';


// tslint:disable-next-line
const moment = _rollupMoment || _moment;

@Component({
    selector: 'test-app',
    template: `
        <mc-form-field>
            <i mcPrefix mc-icon="mc-clock_16"></i>
            <input mcTimepicker
                   [(ngModel)]="timeValue"
                   #ngModel="ngModel"
                   [format]="timeFormat"
                   [min]="minTime"
                   [max]="maxTime"
                   [disabled]="isDisabled">
        </mc-form-field>`
})
class TestApp {
    @ViewChild('ngModel') ngModel: NgModel;
    timeFormat: string;
    minTime: string;
    maxTime: string;
    timeValue: Moment = moment('1970-01-01 12:18:28');
    isDisabled: boolean;
}


describe('McTimepicker', () => {
    let fixture: ComponentFixture<TestApp>;
    let testComponent: TestApp;
    let inputElementDebug;

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                McTimepickerModule,
                FormsModule,
                McFormFieldModule,
                McTimepickerModule,
                McIconModule,
                McMomentDateModule
            ],
            declarations: [TestApp]
        });
        TestBed.compileComponents();

        fixture = TestBed.createComponent(TestApp);
        testComponent = fixture.debugElement.componentInstance;
        inputElementDebug = fixture.debugElement.query(By.directive(McTimepicker));

        fixture.detectChanges();
    }));

    describe('Core attributes support', () => {
        it('Timepicker disabled state switching on/off', () => {
            testComponent.isDisabled = true;
            fixture.detectChanges();

            expect(inputElementDebug.nativeElement.disabled).toBe(true, 'input not disabled');

            testComponent.isDisabled = false;
            fixture.detectChanges();

            expect(inputElementDebug.nativeElement.disabled).toBe(false, 'input not disabled');
        });

        it('Placeholder set on default timeFormat', () => {
            fixture.detectChanges();
            expect(inputElementDebug.nativeElement.placeholder).toBe('чч:мм');
        });

        it('Correct placeholder set for non-default time format', () => {
            testComponent.timeFormat = 'HH:mm:ss';
            fixture.detectChanges();

            expect(inputElementDebug.nativeElement.placeholder).toBe('чч:мм:сс');
        });
    });

    describe('Timerange validation', () => {
        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(TestApp);
            testComponent = fixture.debugElement.componentInstance;
            inputElementDebug = fixture.debugElement.query(By.directive(McTimepicker));

            testComponent.timeValue = moment('1970-01-01 12:18:28');
            fixture.detectChanges();
        }));

        it('Should accept simple time set', () => {
            expect(inputElementDebug.nativeElement.classList.contains('ng-valid')).toBe(true);
        });

        it('Should invalidate time lower then min-time', fakeAsync(() => {
            testComponent.minTime = moment('1970-01-01 13:59:00');
            fixture.detectChanges();
            tick(1);
            expect(inputElementDebug.nativeElement.classList.contains('ng-invalid')).toBe(true);
        }));

        it('Should invalidate time higher then max-time', () => {
            testComponent.maxTime = moment('1970-01-01 11:00:00');
            fixture.detectChanges();
            expect(inputElementDebug.nativeElement.classList.contains('ng-invalid')).toBe(true);
        });
    });

    describe('Display time corresponding to timeformat', () => {
        it('Using HH:mm:ss', () => {
            testComponent.timeFormat = 'HH:mm:ss';
            fixture.detectChanges();

            expect(inputElementDebug.nativeElement.value).toBe('12:18:28', 'mismatch time format');
        });

        it('Using HH:mm', () => {
            testComponent.timeFormat = 'HH:mm';
            fixture.detectChanges();

            expect(inputElementDebug.nativeElement.value).toBe('12:18', 'mismatch time format');
        });

        it('Using default format', () => {
            fixture.detectChanges();

            expect(inputElementDebug.nativeElement.value).toBe('12:18', 'mismatch default time format');
        });

        it('Using unknown/error/unsupported format', () => {
            testComponent.timeFormat = 'Hourglass';
            fixture.detectChanges();

            expect(inputElementDebug.nativeElement.value).toBe('12:18', 'broken fallback to default time format');
        });

        it('When the format updates', fakeAsync(() => {
            testComponent.timeValue = moment('1970-01-01 00:00:00');
            fixture.detectChanges();
            tick();

            testComponent.timeFormat = 'HH:mm:ss';
            fixture.detectChanges();
            expect(inputElementDebug.nativeElement.value).toBe('00:00:00', 'mismatch time format');

            testComponent.timeFormat = 'HH:mm';
            fixture.detectChanges();
            expect(inputElementDebug.nativeElement.value).toBe('00:00', 'mismatch time format');
        }));
    });

    describe('Convert user input', () => {
        it('Convert input, format HH:mm:ss', fakeAsync(() => {
            testComponent.timeFormat = 'HH:mm:ss';
            fixture.detectChanges();

            expect(testComponent.timeValue.toString()).toContain('12:18:28');

            inputElementDebug.nativeElement.value = '18:08:08';
            dispatchFakeEvent(inputElementDebug.nativeElement, 'keydown');
            tick(1);

            expect(testComponent.timeValue.toString()).toContain('18:08:08');
        }));

        it('Convert input as direct input (onInput), format HH:mm', fakeAsync(() => {
            testComponent.timeFormat = 'HH:mm';
            fixture.detectChanges();

            expect(testComponent.timeValue.toString()).toContain('12:18');

            inputElementDebug.nativeElement.value = '18:09';
            dispatchFakeEvent(inputElementDebug.nativeElement, 'keydown');
            tick(1);

            expect(testComponent.timeValue.toString()).toContain('18:09');
        }));

        it('Should run validation on blur', () => {
            expect(testComponent.ngModel.valid).toBeTrue();
            inputElementDebug.nativeElement.value = '19:08:0888';

            inputElementDebug.triggerEventHandler(
                'blur',
                { target: inputElementDebug.nativeElement }
            );

            expect(testComponent.ngModel.valid).toBeFalse();
        });

        it('Convert user input (add lead zero)', fakeAsync(() => {
            testComponent.timeFormat = 'HH:mm:ss';
            fixture.detectChanges();

            inputElementDebug.nativeElement.value = '1*';
            dispatchFakeEvent(inputElementDebug.nativeElement, 'keydown');
            tick(1);

            expect(inputElementDebug.nativeElement.value).toEqual('01:00:00');

            inputElementDebug.nativeElement.value = '01:1*';
            dispatchFakeEvent(inputElementDebug.nativeElement, 'keydown');
            tick(1);

            expect(inputElementDebug.nativeElement.value).toEqual('01:01:00');

            inputElementDebug.nativeElement.value = '01:01:1*';
            dispatchFakeEvent(inputElementDebug.nativeElement, 'keydown');
            tick(1);

            expect(inputElementDebug.nativeElement.value).toEqual('01:01:01');

            inputElementDebug.nativeElement.value = '01:1*:10';
            dispatchFakeEvent(inputElementDebug.nativeElement, 'keydown');
            tick(1);

            expect(inputElementDebug.nativeElement.value).toEqual('01:01:10');

            inputElementDebug.nativeElement.value = '1*:10:10';
            dispatchFakeEvent(inputElementDebug.nativeElement, 'keydown');
            tick(1);

            expect(inputElementDebug.nativeElement.value).toEqual('01:10:10');
        }));
    });

    describe('Paste value from clipboard', () => {
        it('Paste value from clipboard', () => {
            testComponent.timeFormat = 'HH:mm:ss';
            fixture.detectChanges();

            inputElementDebug.triggerEventHandler(
                'paste',
                {
                    preventDefault: () => null,
                    clipboardData: {
                        getData: () => '19:01:08'
                    }
                });
            fixture.detectChanges();
            expect(testComponent.timeValue.toString()).toContain('19:01:08');
        });

        it('Paste 12h value from clipboard', () => {
            inputElementDebug.triggerEventHandler(
                'paste',
                {
                    preventDefault: () => null,
                    clipboardData: {
                        getData: () => '07:15 pm'
                    }
                });
            fixture.detectChanges();

            expect(testComponent.timeValue.toString()).toContain('19:15:00');
        });

        it('Paste am/pm from clipboard: 1:3 am', () => {
            inputElementDebug.triggerEventHandler(
                'paste',
                {
                    preventDefault: () => null,
                    clipboardData: {
                        getData: () => '1:3 am'
                    }
                });
            fixture.detectChanges();

            expect(testComponent.timeValue.toString()).toContain('01:03:00');
        });

        it('Paste am/pm from clipboard: 01:3 am', () => {
            inputElementDebug.triggerEventHandler(
                'paste',
                {
                    preventDefault: () => null,
                    clipboardData: {
                        getData: () => '01:3 am'
                    }
                });
            fixture.detectChanges();

            expect(testComponent.timeValue.toString()).toContain('01:03:00');
        });

        it('Paste am/pm from clipboard: 1:30 am', () => {
            inputElementDebug.triggerEventHandler(
                'paste',
                {
                    preventDefault: () => null,
                    clipboardData: {
                        getData: () => '1:30 am'
                    }
                });
            fixture.detectChanges();

            expect(testComponent.timeValue.toString()).toContain('01:30:00');
        });

        it('Paste am/pm from clipboard: 01:30 am', () => {
            inputElementDebug.triggerEventHandler(
                'paste',
                {
                    preventDefault: () => null,
                    clipboardData: {
                        getData: () => '01:30 am'
                    }
                });
            fixture.detectChanges();

            expect(testComponent.timeValue.toDate().toString()).toContain('01:30:00');
        });

        it('Paste am/pm from clipboard: 10:3 am', () => {
            inputElementDebug.triggerEventHandler(
                'paste',
                {
                    preventDefault: () => null,
                    clipboardData: {
                        getData: () => '10:3 am'
                    }
                });
            fixture.detectChanges();

            expect(testComponent.timeValue.toString()).toContain('10:03:00');
        });

        it('Paste am/pm from clipboard: 10:30 am', () => {
            inputElementDebug.triggerEventHandler(
                'paste',
                {
                    preventDefault: () => null,
                    clipboardData: {
                        getData: () => '10:30 am'
                    }
                });
            fixture.detectChanges();

            expect(testComponent.timeValue.toString()).toContain('10:30:00');
        });

        it('Paste am/pm from clipboard: 10:30 Pm', () => {
            inputElementDebug.triggerEventHandler(
                'paste',
                {
                    preventDefault: () => null,
                    clipboardData: {
                        getData: () => '10:30 pm'
                    }
                });
            fixture.detectChanges();

            expect(testComponent.timeValue.toString()).toContain('22:30:00');
        });

        it('Paste am/pm from clipboard: 12:3 aM', () => {
            inputElementDebug.triggerEventHandler(
                'paste',
                {
                    preventDefault: () => null,
                    clipboardData: {
                        getData: () => '12:3 aM'
                    }
                });
            fixture.detectChanges();

            expect(testComponent.timeValue.toString()).toContain('00:03:00');
        });

        it('Paste am/pm from clipboard: 11:3 PM', () => {
            inputElementDebug.triggerEventHandler(
                'paste',
                {
                    preventDefault: () => null,
                    clipboardData: {
                        getData: () => '11:3 PM'
                    }
                });
            fixture.detectChanges();

            expect(testComponent.timeValue.toString()).toContain('23:03:00');
        });

        it('Paste am/pm from clipboard: 11:3 a', () => {
            inputElementDebug.triggerEventHandler(
                'paste',
                {
                    preventDefault: () => null,
                    clipboardData: {
                        getData: () => '11:3 a'
                    }
                });
            fixture.detectChanges();

            expect(testComponent.timeValue.toString()).toContain('11:03:00');
        });

        it('Paste am/pm from clipboard: 11:3 p', () => {
            inputElementDebug.triggerEventHandler(
                'paste',
                {
                    preventDefault: () => null,
                    clipboardData: {
                        getData: () => '11:3 p'
                    }
                });
            fixture.detectChanges();

            expect(testComponent.timeValue.toString()).toContain('23:03:00');
        });
    });

    describe('Keyboard value control', () => {
        beforeEach(fakeAsync(() => {
            testComponent.timeValue = moment('1970-01-01 23:00:00');
            testComponent.timeFormat = 'HH:mm:ss';
            fixture.detectChanges();
        }));

        it('Should ignore SPACE keyDown', fakeAsync(() => {
            expect(inputElementDebug.nativeElement.value).toBe('23:00:00');

            const spaceEvent: KeyboardEvent = createKeyboardEvent('keydown', SPACE);
            dispatchEvent(inputElementDebug.nativeElement, spaceEvent);
            tick(1);

            expect(inputElementDebug.nativeElement.value).toBe('23:00:00');
        }));

        it('Input hours above max', fakeAsync(() => {
            expect(inputElementDebug.nativeElement.value).toBe('23:00:00');

            inputElementDebug.nativeElement.value = '24';
            dispatchFakeEvent(inputElementDebug.nativeElement, 'keydown');
            tick(1);

            expect(inputElementDebug.nativeElement.value).toBe('23:00:00');
        }));

        it('Input minutes above max', fakeAsync(() => {
            expect(inputElementDebug.nativeElement.value).toBe('23:00:00');

            inputElementDebug.nativeElement.value = '23:99';
            dispatchFakeEvent(inputElementDebug.nativeElement, 'keydown');
            tick(1);

            expect(inputElementDebug.nativeElement.value).toBe('23:59:00');
        }));

        it('Input seconds above max', fakeAsync(() => {
            expect(inputElementDebug.nativeElement.value).toBe('23:00:00');

            inputElementDebug.nativeElement.value = '23:00:99';
            dispatchFakeEvent(inputElementDebug.nativeElement, 'keydown');
            tick(1);

            expect(inputElementDebug.nativeElement.value).toBe('23:00:59');
        }));

        it('Increase hours by ArrowUp key and cycle from max to min', fakeAsync(() => {
            expect(inputElementDebug.nativeElement.value).toBe('23:00:00');

            inputElementDebug.nativeElement.selectionStart = 1;
            inputElementDebug.triggerEventHandler('keydown', { preventDefault: () => null, keyCode: UP_ARROW });

            tick(1);
            fixture.detectChanges();
            expect(inputElementDebug.nativeElement.value).toBe('00:00:00');
        }));

        it('Decrease minutes by ArrowDown key and cycle from min to max', fakeAsync(() => {
            inputElementDebug.nativeElement.selectionStart = 3;
            inputElementDebug.triggerEventHandler('keydown', { preventDefault: () => null, keyCode: DOWN_ARROW });
            tick(1);
            fixture.detectChanges();

            expect(inputElementDebug.nativeElement.value).toBe('23:59:00', 'Arrow-Down key decrement not working');
        }));

        it('Manual keyboard input digit-by-digit', () => {
            const inputNativeElement = inputElementDebug.nativeElement;
            inputNativeElement.selectionStart = 0;
            inputNativeElement.selectionEnd = 2;

            const key1PressEvent: KeyboardEvent = createKeyboardEvent('keydown', ONE);
            dispatchEvent(inputNativeElement, key1PressEvent);
            inputNativeElement.value = `1${inputNativeElement.value.substring(2)}`;
            inputNativeElement.selectionStart = 1;
            inputNativeElement.selectionEnd = 1;
            dispatchFakeEvent(inputNativeElement, 'input');
            fixture.detectChanges();

            expect(inputNativeElement.value).toBe('1:00:00', 'Failed key-by-key input on 1st key');

            const key2PressEvent: KeyboardEvent = createKeyboardEvent('keydown', TWO);
            dispatchEvent(inputNativeElement, key2PressEvent);
            const inputStringBeforeInsertion = inputNativeElement.value.substring(0, 1);
            const inputStringAfterInsertion = inputNativeElement.value.substring(1);
            inputNativeElement.value = `${inputStringBeforeInsertion}2${inputStringAfterInsertion}`;
            inputNativeElement.selectionStart = 2;
            inputNativeElement.selectionEnd = 2;
            dispatchFakeEvent(inputNativeElement, 'input');
            fixture.detectChanges();

            expect(inputNativeElement.value).toBe('12:00:00', 'Failed key-by-key input on 2nd key');
        });
    });
});
