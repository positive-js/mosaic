// tslint:disable:no-unbound-method
// tslint:disable:no-empty

import { Component, DebugElement, ViewChild } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Directionality } from '@ptsecurity/cdk/bidi';
import { ENTER, COMMA } from '@ptsecurity/cdk/keycodes';
import { PlatformModule } from '@ptsecurity/cdk/platform';
import { createKeyboardEvent } from '@ptsecurity/cdk/testing';
import { McFormFieldModule } from '@ptsecurity/mosaic/form-field';
import { Subject } from 'rxjs';

import { McTagsModule } from './index';
import { MC_TAGS_DEFAULT_OPTIONS, McTagsDefaultOptions } from './tag-default-options';
import { McTagInput, McTagInputEvent } from './tag-input';
import { McTagList } from './tag-list.component';


describe('McTagInput', () => {
    let fixture: ComponentFixture<any>;
    let testTagInput: TestTagInput;
    let inputDebugElement: DebugElement;
    let inputNativeElement: HTMLElement;
    let tagInputDirective: McTagInput;
    const dir = 'ltr';

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [PlatformModule, McTagsModule, McFormFieldModule, NoopAnimationsModule],
            declarations: [TestTagInput],
            providers: [{
                provide: Directionality, useFactory: () => {
                    return {
                        value: dir.toLowerCase(),
                        // tslint:disable-next-line: no-inferred-empty-object-type
                        change: new Subject()
                    };
                }
            }]
        });

        TestBed.compileComponents();
    }));

    beforeEach(async(() => {
        fixture = TestBed.createComponent(TestTagInput);
        testTagInput = fixture.debugElement.componentInstance;
        fixture.detectChanges();

        inputDebugElement = fixture.debugElement.query(By.directive(McTagInput));
        tagInputDirective = inputDebugElement.injector.get<McTagInput>(McTagInput);
        inputNativeElement = inputDebugElement.nativeElement;
    }));

    describe('basic behavior', () => {
        it('emits the (tagEnd) on enter keyup', () => {
            const ENTER_EVENT = createKeyboardEvent('keydown', ENTER, inputNativeElement);

            spyOn(testTagInput, 'add');

            tagInputDirective.keydown(ENTER_EVENT);
            expect(testTagInput.add).toHaveBeenCalled();
        });

        it('should have a default id', () => {
            expect(inputNativeElement.getAttribute('id')).toBeTruthy();
        });

        it('should allow binding to the `placeholder` input', () => {
            expect(inputNativeElement.hasAttribute('placeholder')).toBe(false);

            testTagInput.placeholder = 'bound placeholder';
            fixture.detectChanges();

            expect(inputNativeElement.getAttribute('placeholder')).toBe('bound placeholder');
        });

        // it('should propagate the dynamic `placeholder` value to the form field', () => {
        //     fixture.componentInstance.placeholder = 'add a tag';
        //     fixture.detectChanges();
        //
        //     const label: HTMLElement = fixture.nativeElement.querySelector('.mat-form-field-label');
        //
        //     expect(label).toBeTruthy();
        //     expect(label.textContent).toContain('add a tag');
        //
        //     fixture.componentInstance.placeholder = 'or don\'t';
        //     fixture.detectChanges();
        //
        //     expect(label.textContent).toContain('or don\'t');
        // });

        // it('should become disabled if the tag list is disabled', () => {
        //     expect(inputNativeElement.hasAttribute('disabled')).toBe(false);
        //     expect(tagInputDirective.disabled).toBe(false);
        //
        //     fixture.componentInstance.tagListInstance.disabled = true;
        //     fixture.detectChanges();
        //
        //     expect(inputNativeElement.getAttribute('disabled')).toBe('true');
        //     expect(tagInputDirective.disabled).toBe(true);
        // });
    });

    describe('[addOnBlur]', () => {
        it('allows (tagEnd) when true', () => {
            spyOn(testTagInput, 'add');

            testTagInput.addOnBlur = true;
            fixture.detectChanges();

            tagInputDirective.blur();
            expect(testTagInput.add).toHaveBeenCalled();
        });

        it('disallows (tagEnd) when false', () => {
            spyOn(testTagInput, 'add');

            testTagInput.addOnBlur = false;
            fixture.detectChanges();

            tagInputDirective.blur();
            expect(testTagInput.add).not.toHaveBeenCalled();
        });
    });

    describe('[separatorKeyCodes]', () => {
        it('does not emit (tagEnd) when a non-separator key is pressed', () => {
            const ENTER_EVENT = createKeyboardEvent('keydown', ENTER, inputNativeElement);
            spyOn(testTagInput, 'add');

            tagInputDirective.separatorKeyCodes = [COMMA];
            fixture.detectChanges();

            tagInputDirective.keydown(ENTER_EVENT);
            expect(testTagInput.add).not.toHaveBeenCalled();
        });

        it('emits (tagEnd) when a custom separator keys is pressed', () => {
            const COMMA_EVENT = createKeyboardEvent('keydown', COMMA, inputNativeElement);
            spyOn(testTagInput, 'add');

            tagInputDirective.separatorKeyCodes = [COMMA];
            fixture.detectChanges();

            tagInputDirective.keydown(COMMA_EVENT);
            expect(testTagInput.add).toHaveBeenCalled();
        });

        it('emits accepts the custom separator keys in a Set', () => {
            const COMMA_EVENT = createKeyboardEvent('keydown', COMMA, inputNativeElement);
            spyOn(testTagInput, 'add');

            tagInputDirective.separatorKeyCodes = new Set([COMMA]);
            fixture.detectChanges();

            tagInputDirective.keydown(COMMA_EVENT);
            expect(testTagInput.add).toHaveBeenCalled();
        });

        it('emits (tagEnd) when the separator keys are configured globally', () => {
            fixture.destroy();

            TestBed
                .resetTestingModule()
                .configureTestingModule({
                    imports: [McTagsModule, McFormFieldModule, PlatformModule, NoopAnimationsModule],
                    declarations: [TestTagInput],
                    providers: [{
                        provide: MC_TAGS_DEFAULT_OPTIONS,
                        // tslint:disable-next-line: no-object-literal-type-assertion
                        useValue: ({ separatorKeyCodes: [COMMA] } as McTagsDefaultOptions)
                    }]
                })
                .compileComponents();

            fixture = TestBed.createComponent(TestTagInput);
            testTagInput = fixture.debugElement.componentInstance;
            fixture.detectChanges();

            inputDebugElement = fixture.debugElement.query(By.directive(McTagInput));
            tagInputDirective = inputDebugElement.injector.get<McTagInput>(McTagInput);
            inputNativeElement = inputDebugElement.nativeElement;

            spyOn(testTagInput, 'add');
            fixture.detectChanges();

            tagInputDirective.keydown(createKeyboardEvent('keydown', COMMA, inputNativeElement));
            expect(testTagInput.add).toHaveBeenCalled();
        });

        it('should not emit the tagEnd event if a separator is pressed with a modifier key', () => {
            const ENTER_EVENT = createKeyboardEvent('keydown', ENTER, inputNativeElement);
            Object.defineProperty(ENTER_EVENT, 'shiftKey', { get: () => true });
            spyOn(testTagInput, 'add');

            tagInputDirective.separatorKeyCodes = [ENTER];
            fixture.detectChanges();

            tagInputDirective.keydown(ENTER_EVENT);
            expect(testTagInput.add).not.toHaveBeenCalled();
        });
    });
});

@Component({
    template: `
        <mc-form-field>
            <mc-tag-list #tagList></mc-tag-list>
            <input [mcTagInputFor]="tagList"
                   [mcTagInputAddOnBlur]="addOnBlur"
                   (mcTagInputTokenEnd)="add($event)"
                   [placeholder]="placeholder"/>
        </mc-form-field>
    `
})
class TestTagInput {
    @ViewChild(McTagList, {static: false}) tagListInstance: McTagList;

    addOnBlur: boolean = false;
    placeholder = '';

    add(_: McTagInputEvent) {}
}
