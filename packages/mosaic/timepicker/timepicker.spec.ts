// tslint:disable no-magic-numbers
import { Component } from '@angular/core';
import {
    ComponentFixture,
    fakeAsync,
    TestBed
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ONE, TWO } from '@ptsecurity/cdk/keycodes';
import { createKeyboardEvent, dispatchFakeEvent, dispatchEvent } from '@ptsecurity/cdk/testing';
import { McMomentDateModule } from '@ptsecurity/mosaic-moment-adapter/adapter';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McIconModule } from '@ptsecurity/mosaic/icon';
import * as _moment from 'moment';
// @ts-ignore
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupMoment, Moment } from 'moment';

import {
    ARROW_DOWN_KEYCODE,
    ARROW_UP_KEYCODE,
    McTimepicker,
    McTimepickerModule
} from './index';


// tslint:disable-next-line
const moment = _rollupMoment || _moment;

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
    timeValue: Moment;
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
                McIconModule,
                McMomentDateModule],
            declarations: [TestApp]
        });
        TestBed.compileComponents();
    }));

    let fixture: ComponentFixture<TestApp>;
    let testComponent: TestApp;
    let inputElementDebug;

    describe('Core attributes support', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestApp);
            testComponent = fixture.debugElement.componentInstance;
            inputElementDebug = fixture.debugElement.query(By.directive(McTimepicker));

            testComponent.timeValue = moment('1970-01-01 12:18:28');
            fixture.detectChanges();
        });

        it('Timepicker disabled state switching on/off', () => {
            testComponent.isDisabled = true;
            fixture.detectChanges();

            return fixture.whenStable()
                .then(() => {
                    fixture.detectChanges();
                    expect(inputElementDebug.nativeElement.disabled).toBe(true, 'input not disabled');
                    testComponent.isDisabled = false;
                    fixture.detectChanges();

                    return fixture.whenStable();
                })
                .then(() => {
                    fixture.detectChanges();
                    expect(inputElementDebug.nativeElement.disabled).toBe(false, 'input not disabled');
                });
        });

        it('Placeholder set on default timeFormat', () => {
            return fixture.whenStable()
                .then(() => {
                    fixture.detectChanges();
                    expect(inputElementDebug.nativeElement.placeholder).toBe('  :  ');
                });
        });

        it('Correct placeholder set for non-default time format', () => {
            testComponent.timeFormat = 'HH:mm:ss';
            fixture.detectChanges();

            return fixture.whenStable()
                .then(() => {
                    fixture.detectChanges();
                    expect(inputElementDebug.nativeElement.placeholder).toBe('  :  :  ');
                });
        });
    });

    describe('Timerange validation', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestApp);
            testComponent = fixture.debugElement.componentInstance;
            inputElementDebug = fixture.debugElement.query(By.directive(McTimepicker));

            testComponent.timeValue = moment('1970-01-01 12:18:28');
            fixture.detectChanges();
        });

        it('Should accept simple time set', () => {
            return fixture.whenStable()
                .then(() => {
                    fixture.detectChanges();
                    expect(inputElementDebug.nativeElement.classList.contains('ng-valid')).toBe(true);
                });
        });

        it('Should validate if time in min-max range', () => {
            return fixture.whenStable()
                .then(() => {
                    testComponent.minTime = '10:00:00';
                    testComponent.maxTime = '23:00:00';
                    fixture.detectChanges();
                    expect(inputElementDebug.nativeElement.getAttribute('min-time')).toBe('10:00:00');
                    expect(inputElementDebug.nativeElement.getAttribute('max-time')).toBe('23:00:00');
                });
        });

        it('Should invalidate time lower then min-time', () => {
            return fixture.whenStable()
                .then(() => {
                    testComponent.minTime = '13:59:00';
                    fixture.detectChanges();
                    expect(inputElementDebug.nativeElement.classList.contains('ng-invalid')).toBe(true);
                });
        });

        it('Should invalidate time higher then max-time', () => {
            return fixture.whenStable()
                .then(() => {
                    testComponent.maxTime = '11:00:00';
                    fixture.detectChanges();
                    expect(inputElementDebug.nativeElement.classList.contains('ng-invalid')).toBe(true);
                });
        });
    });

    describe('Display time corresponding to timeformat', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestApp);
            testComponent = fixture.debugElement.componentInstance;
            inputElementDebug = fixture.debugElement.query(By.directive(McTimepicker));

            testComponent.timeValue = moment('1970-01-01 12:18:28');
            fixture.detectChanges();
        });

        it('Using HH:mm:ss', () => {
            testComponent.timeFormat = 'HH:mm:ss';
            fixture.detectChanges();

            return fixture.whenStable()
                .then(() => {
                    fixture.detectChanges();
                    expect(inputElementDebug.nativeElement.value).toBe('12:18:28', 'mismatch time format');
                });
        });

        it('Using HH:mm', () => {
            testComponent.timeFormat = 'HH:mm';
            fixture.detectChanges();

            return fixture.whenStable()
                .then(() => {
                    fixture.detectChanges();
                    expect(inputElementDebug.nativeElement.value).toBe('12:18', 'mismatch time format');
                });
        });

        it('Using default format', () => {
            fixture.detectChanges();

            return fixture.whenStable()
                .then(() => {
                    fixture.detectChanges();
                    expect(inputElementDebug.nativeElement.value).toBe('12:18', 'mismatch default time format');
                });
        });

        it('Using unknown/error/unsupported format', () => {
            testComponent.timeFormat = 'Hourglass';
            fixture.detectChanges();

            return fixture.whenStable()
                .then(() => {
                    fixture.detectChanges();
                    expect(inputElementDebug.nativeElement.value).toBe(
                        '12:18',
                        'broken fallback to default time format');
                });
        });
    });

    describe('Convert user input', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestApp);
            testComponent = fixture.debugElement.componentInstance;
            inputElementDebug = fixture.debugElement.query(By.directive(McTimepicker));

            testComponent.timeValue = moment('1970-01-01 12:18:28');
            fixture.detectChanges();
        });

        it('Convert input, format HH:mm:ss', () => {
            return fixture.whenStable()
                .then(() => {
                    testComponent.timeFormat = 'HH:mm:ss';
                    inputElementDebug.nativeElement.value = '18:08:08';
                    fixture.detectChanges();

                    inputElementDebug.triggerEventHandler('input', { target: inputElementDebug.nativeElement });
                    fixture.detectChanges();

                    return fixture.whenStable();
                }).then(() => {
                    fixture.detectChanges();
                    expect(testComponent.timeValue.toDate().toString()).toContain('18:08:08');
                });
        });

        it('Convert input as direct input (onInput), format HH:mm', () => {
            return fixture.whenStable()
                .then(() => {
                    testComponent.timeFormat = 'HH:mm';
                    inputElementDebug.nativeElement.value = '18:09';
                    inputElementDebug.triggerEventHandler(
                        'input',
                        { target: inputElementDebug.nativeElement }
                    );
                    fixture.detectChanges();

                    return fixture.whenStable();
                }).then(() => {
                    fixture.detectChanges();
                    expect(testComponent.timeValue.toString()).toContain('18:09');
                });
        });

        it('Convert input onBlur', () => {
            return fixture.whenStable()
                .then(() => {
                    inputElementDebug.nativeElement.value = '19:08:08';

                    inputElementDebug.triggerEventHandler(
                        'blur',
                        { target: inputElementDebug.nativeElement }
                    );
                    fixture.detectChanges();

                    return fixture.whenStable();
                }).then(() => {
                    fixture.detectChanges();
                    expect(testComponent.timeValue.toString()).toContain('19:08:08');
                });
        });

        it('Paste value from clipboard', () => {
            return fixture.whenStable()
                .then(() => {
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

                    return fixture.whenStable();
                })
                .then(() => {
                    fixture.detectChanges();
                    expect(testComponent.timeValue.toString()).toContain('19:01:08');
                });
        });

        it('Paste 12h value from clipboard', () => {
            return fixture.whenStable()
                .then(() => {
                    inputElementDebug.triggerEventHandler(
                        'paste',
                        {
                            preventDefault: () => null,
                            clipboardData: {
                                getData: () => '07:15 pm'
                            }
                        });
                    fixture.detectChanges();

                    return fixture.whenStable();
                })
                .then(() => {
                    fixture.detectChanges();
                    expect(testComponent.timeValue.toString()).toContain('19:15:00');
                });
        });
        it('Paste am/pm from clipboard: 1:3 am', () => {
            return fixture.whenStable()
                .then(() => {
                    inputElementDebug.triggerEventHandler(
                        'paste',
                        {
                            preventDefault: () => null,
                            clipboardData: {
                                getData: () => '1:3 am'
                            }
                        });
                    fixture.detectChanges();

                    return fixture.whenStable();
                })
                .then(() => {
                    fixture.detectChanges();
                    expect(testComponent.timeValue.toString()).toContain('01:03:00');
                });
        });
        it('Paste am/pm from clipboard: 01:3 am', () => {
            return fixture.whenStable()
                .then(() => {
                    inputElementDebug.triggerEventHandler(
                        'paste',
                        {
                            preventDefault: () => null,
                            clipboardData: {
                                getData: () => '01:3 am'
                            }
                        });
                    fixture.detectChanges();

                    return fixture.whenStable();
                })
                .then(() => {
                    fixture.detectChanges();
                    expect(testComponent.timeValue.toString()).toContain('01:03:00');
                });
        });
        it('Paste am/pm from clipboard: 1:30 am', () => {
            return fixture.whenStable()
                .then(() => {
                    inputElementDebug.triggerEventHandler(
                        'paste',
                        {
                            preventDefault: () => null,
                            clipboardData: {
                                getData: () => '1:30 am'
                            }
                        });
                    fixture.detectChanges();

                    return fixture.whenStable();
                })
                .then(() => {
                    fixture.detectChanges();
                    expect(testComponent.timeValue.toString()).toContain('01:30:00');
                });
        });
        it('Paste am/pm from clipboard: 01:30 am', () => {
            return fixture.whenStable()
                .then(() => {
                    inputElementDebug.triggerEventHandler(
                        'paste',
                        {
                            preventDefault: () => null,
                            clipboardData: {
                                getData: () => '01:30 am'
                            }
                        });
                    fixture.detectChanges();

                    return fixture.whenStable();
                })
                .then(() => {
                    fixture.detectChanges();

                    expect(testComponent.timeValue.toDate().toString()).toContain('01:30:00');
                });
        });
        it('Paste am/pm from clipboard: 10:3 am', () => {
            return fixture.whenStable()
                .then(() => {
                    inputElementDebug.triggerEventHandler(
                        'paste',
                        {
                            preventDefault: () => null,
                            clipboardData: {
                                getData: () => '10:3 am'
                            }
                        });
                    fixture.detectChanges();

                    return fixture.whenStable();
                })
                .then(() => {
                    fixture.detectChanges();
                    expect(testComponent.timeValue.toString()).toContain('10:03:00');
                });
        });
        it('Paste am/pm from clipboard: 10:30 am', () => {
            return fixture.whenStable()
                .then(() => {
                    inputElementDebug.triggerEventHandler(
                        'paste',
                        {
                            preventDefault: () => null,
                            clipboardData: {
                                getData: () => '10:30 am'
                            }
                        });
                    fixture.detectChanges();

                    return fixture.whenStable();
                })
                .then(() => {
                    fixture.detectChanges();
                    expect(testComponent.timeValue.toString()).toContain('10:30:00');
                });
        });
        it('Paste am/pm from clipboard: 10:30 Pm', () => {
            return fixture.whenStable()
                .then(() => {
                    inputElementDebug.triggerEventHandler(
                        'paste',
                        {
                            preventDefault: () => null,
                            clipboardData: {
                                getData: () => '10:30 pm'
                            }
                        });
                    fixture.detectChanges();

                    return fixture.whenStable();
                })
                .then(() => {
                    fixture.detectChanges();
                    expect(testComponent.timeValue.toString()).toContain('22:30:00');
                });
        });
        it('Paste am/pm from clipboard: 12:3 aM', () => {
            return fixture.whenStable()
                .then(() => {
                    inputElementDebug.triggerEventHandler(
                        'paste',
                        {
                            preventDefault: () => null,
                            clipboardData: {
                                getData: () => '12:3 aM'
                            }
                        });
                    fixture.detectChanges();

                    return fixture.whenStable();
                })
                .then(() => {
                    fixture.detectChanges();
                    expect(testComponent.timeValue.toString()).toContain('00:03:00');
                });
        });
        it('Paste am/pm from clipboard: 11:3 PM', () => {
            return fixture.whenStable()
                .then(() => {
                    inputElementDebug.triggerEventHandler(
                        'paste',
                        {
                            preventDefault: () => null,
                            clipboardData: {
                                getData: () => '11:3 PM'
                            }
                        });
                    fixture.detectChanges();

                    return fixture.whenStable();
                })
                .then(() => {
                    fixture.detectChanges();
                    expect(testComponent.timeValue.toString()).toContain('23:03:00');
                });
        });
        it('Paste am/pm from clipboard: 11:3 a', () => {
            return fixture.whenStable()
                .then(() => {
                    inputElementDebug.triggerEventHandler(
                        'paste',
                        {
                            preventDefault: () => null,
                            clipboardData: {
                                getData: () => '11:3 a'
                            }
                        });
                    fixture.detectChanges();

                    return fixture.whenStable();
                })
                .then(() => {
                    fixture.detectChanges();
                    expect(testComponent.timeValue.toString()).toContain('11:03:00');
                });
        });
        it('Paste am/pm from clipboard: 11:3 p', () => {
            return fixture.whenStable()
                .then(() => {
                    inputElementDebug.triggerEventHandler(
                        'paste',
                        {
                            preventDefault: () => null,
                            clipboardData: {
                                getData: () => '11:3 p'
                            }
                        });
                    fixture.detectChanges();

                    return fixture.whenStable();
                })
                .then(() => {
                    fixture.detectChanges();
                    expect(testComponent.timeValue.toString()).toContain('23:03:00');
                });
        });
    });

    describe('Keyboard value control', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(TestApp);
            testComponent = fixture.debugElement.componentInstance;
            inputElementDebug = fixture.debugElement.query(By.directive(McTimepicker));

            testComponent.timeValue = moment('1970-01-01 23:00:08');
            testComponent.timeFormat = 'HH:mm';
            fixture.detectChanges();
        });

        it('Increase hours by ArrowUp key and cycle from max to min', () => {
            return fixture.whenStable()
                .then(() => {
                    inputElementDebug.nativeElement.selectionStart = 1;
                    inputElementDebug.triggerEventHandler(
                        'keydown',
                        {
                            preventDefault: () => null,
                            code: ARROW_UP_KEYCODE
                        }
                    );
                    fixture.detectChanges();
                    expect(inputElementDebug.nativeElement.value).toBe('00:00', 'Arrow-Up key increment not working');
                });

        });

        it('Decrease minutes by ArrowDown key and cycle from min to max', () => {
            return fixture.whenStable()
                .then(() => {
                    inputElementDebug.nativeElement.selectionStart = 3;
                    inputElementDebug.triggerEventHandler(
                        'keydown',
                        {
                            preventDefault: () => null,
                            code: ARROW_DOWN_KEYCODE
                        }
                    );
                    fixture.detectChanges();
                    expect(inputElementDebug.nativeElement.value).toBe('23:59', 'Arrow-Down key decrement not working');
                });
        });

        it('Manual keyboard input digit-by-digit', () => {
            return fixture.whenStable()
                .then(() => {
                    dispatchFakeEvent(inputElementDebug.nativeElement, 'focus');
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

                    expect(inputNativeElement.value).toBe('1:00', 'Keypress works!');

                    const key2PressEvent: KeyboardEvent = createKeyboardEvent('keydown', TWO);
                    dispatchEvent(inputNativeElement, key2PressEvent);
                    inputNativeElement.value =
                        `${inputNativeElement.value.substring(0, 1)}` +
                        `2` +
                        `${inputNativeElement.value.substring(1)}`;
                    inputNativeElement.selectionStart = 2;
                    inputNativeElement.selectionEnd = 2;
                    dispatchFakeEvent(inputNativeElement, 'input');
                    fixture.detectChanges();

                    expect(inputNativeElement.value).toBe('12:00', 'Failed key-by-key input');
                });
        });
    });
});
