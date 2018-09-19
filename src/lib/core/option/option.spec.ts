import { Component } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { McOption, McOptionModule } from './index';


@Component({ template: `<mc-option [disabled]="disabled"></mc-option>`})
class OptionWithDisable {
    disabled: boolean;
}

describe('McOption component', () => {

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [McOptionModule],
            declarations: [OptionWithDisable]
        }).compileComponents();
    }));

    it('should complete the `stateChanges` stream on destroy', () => {
        const fixture = TestBed.createComponent(OptionWithDisable);
        fixture.detectChanges();

        const optionInstance: McOption =
            fixture.debugElement.query(By.directive(McOption)).componentInstance;
        const completeSpy = jasmine.createSpy('complete spy');
        const subscription = optionInstance._stateChanges.subscribe(undefined, undefined, completeSpy);

        fixture.destroy();
        expect(completeSpy).toHaveBeenCalled();
        subscription.unsubscribe();
    });

    it('should not emit to `onSelectionChange` if selecting an already-selected option', () => {
        const fixture = TestBed.createComponent(OptionWithDisable);
        fixture.detectChanges();

        const optionInstance: McOption =
            fixture.debugElement.query(By.directive(McOption)).componentInstance;

        optionInstance.select();
        expect(optionInstance.selected).toBe(true);

        const spy = jasmine.createSpy('selection change spy');
        const subscription = optionInstance.onSelectionChange.subscribe(spy);

        optionInstance.select();
        fixture.detectChanges();

        expect(optionInstance.selected).toBe(true);
        expect(spy).not.toHaveBeenCalled();

        subscription.unsubscribe();
    });

    it('should not emit to `onSelectionChange` if deselecting an unselected option', () => {
        const fixture = TestBed.createComponent(OptionWithDisable);
        fixture.detectChanges();

        const optionInstance: McOption =
            fixture.debugElement.query(By.directive(McOption)).componentInstance;

        optionInstance.deselect();
        expect(optionInstance.selected).toBe(false);

        const spy = jasmine.createSpy('selection change spy');
        const subscription = optionInstance.onSelectionChange.subscribe(spy);

        optionInstance.deselect();
        fixture.detectChanges();

        expect(optionInstance.selected).toBe(false);
        expect(spy).not.toHaveBeenCalled();

        subscription.unsubscribe();
    });
});
