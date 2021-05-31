/* tslint:disable:no-magic-numbers */
import { Component, ContentChildren, QueryList } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { McFormElement, McFormsModule } from '@ptsecurity/mosaic/core';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { McInputModule } from '@ptsecurity/mosaic/input';


const classWithMargin = 'mc-form-row_margin';


@Component({
    template: `
        <form class="mc-form-horizontal" novalidate>
            <div class="mc-form__row">
                <label class="mc-form__label">Подпись поля</label>
                <mc-form-field class="mc-form__control">
                    <input name="input" mcInput>

                    <mc-hint>Подсказка под полем</mc-hint>
                </mc-form-field>
            </div>

            <div class="mc-form__row">
                <label class="mc-form__label">Подпись поля</label>
                <mc-form-field class="mc-form__control">
                    <input name="input" mcInput>

                    <mc-hint>Подсказка под полем</mc-hint>
                </mc-form-field>
            </div>

            <div class="mc-form__row">
                <label class="mc-form__label">Подпись поля</label>
                <mc-form-field class="mc-form__control">
                    <input name="input" mcInput>

                    <mc-hint>Подсказка под полем</mc-hint>
                </mc-form-field>
            </div>
        </form>
    `
})
class HorizontalForm {}


@Component({
    template: `
        <form class="mc-form-vertical" novalidate>
            <div class="mc-form__row">
                <label class="mc-form__label">Подпись поля</label>
                <mc-form-field class="mc-form__control">
                    <input name="input" mcInput>

                    <mc-hint>Подсказка под полем</mc-hint>
                </mc-form-field>
            </div>

            <div class="mc-form__row">
                <label class="mc-form__label">Подпись поля</label>
                <mc-form-field class="mc-form__control">
                    <input name="input" mcInput>

                    <mc-hint>Подсказка под полем</mc-hint>
                </mc-form-field>
            </div>

            <div class="mc-form__row">
                <label class="mc-form__label">Подпись поля</label>
                <mc-form-field class="mc-form__control">
                    <input name="input" mcInput>

                    <mc-hint>Подсказка под полем</mc-hint>
                </mc-form-field>
            </div>
        </form>
    `
})
class VerticalForm {}

describe('Forms', () => {
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                McFormsModule,
                McInputModule,
                McFormFieldModule
            ],
            declarations: [HorizontalForm, VerticalForm]
        }).compileComponents();
    }));

    describe('Horizontal', () => {
        it('mc-form__row should contain classes', () => {
            const fixture = TestBed.createComponent(HorizontalForm);
            fixture.detectChanges();

            const elements = fixture.debugElement.queryAll(By.directive(McFormElement));

            const firstRow = elements[0].nativeElement;
            expect(firstRow.classList).toContain(classWithMargin);

            const secondRow = elements[1].nativeElement;
            expect(secondRow.classList).toContain(classWithMargin);

            const lastRow = elements[2].nativeElement;
            expect(lastRow.classList).not.toContain(classWithMargin);
        });
    });

    describe('Vertical', () => {
        it('mc-form__row should contain classes', () => {
            const fixture = TestBed.createComponent(VerticalForm);
            fixture.detectChanges();

            const elements = fixture.debugElement.queryAll(By.directive(McFormElement));

            const firstRow = elements[0].nativeElement;
            expect(firstRow.classList).toContain(classWithMargin);

            const secondRow = elements[1].nativeElement;
            expect(secondRow.classList).toContain(classWithMargin);

            const lastRow = elements[2].nativeElement;
            expect(lastRow.classList).not.toContain(classWithMargin);
        });
    });
});
