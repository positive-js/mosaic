import { Component } from '@angular/core';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { McDdComponent, McDlComponent, McDlModule, McDtComponent } from './index';


describe('McDl', () => {
    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [McDlModule],
            declarations: [TestApp]
        });

        TestBed.compileComponents();
    }));

    it('default rendering', () => {
        const fixture = TestBed.createComponent(TestApp);

        const dlDebugElement = fixture.debugElement.query(By.directive(McDlComponent));
        const dtDebugElement = fixture.debugElement.query(By.directive(McDtComponent));
        const ddDebugElement = fixture.debugElement.query(By.directive(McDdComponent));

        expect(dlDebugElement.nativeElement.classList.contains('mc-dl')).toBe(true);
        expect(dtDebugElement.nativeElement.classList.contains('mc-dt')).toBe(true);
        expect(ddDebugElement.nativeElement.classList.contains('mc-dd')).toBe(true);
    });
});

@Component({
    selector: 'test-app',
    template: `
        <mc-dl [minWidth]="600">
            <mc-dt>Тип инцидента</mc-dt>
            <mc-dd>Вредоносное ПО</mc-dd>

            <mc-dt>Идентификатор</mc-dt>
            <mc-dd>INC-2022-125-78253</mc-dd>

            <mc-dt>Статус</mc-dt>
            <mc-dd>Новый</mc-dd>

            <mc-dt>Ответственный</mc-dt>
            <mc-dd>Иванов Иван</mc-dd>

            <mc-dt>Описание</mc-dt>
            <mc-dd>Здесь нужно добавить очень длинное описание, но Я не знаю, что еще можно сюда добавить, поэтому Вы видите этот текст.</mc-dd>
        </mc-dl>
    `
})
class TestApp {}
