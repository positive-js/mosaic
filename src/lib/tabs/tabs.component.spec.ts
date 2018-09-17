import { Component, DebugElement } from '@angular/core';
import { fakeAsync, TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
    dispatchFakeEvent
} from '@ptsecurity/cdk/testing';
import { ThemePalette } from '@ptsecurity/mosaic/core';
import { McTabsModule, McTabs, McTab } from '@ptsecurity/mosaic/tabs';


describe('MCTabs', () => {
    let fixture: ComponentFixture<TestApp>;
    let tabsGroup: DebugElement;
    let tabsItems: DebugElement[];

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [McTabsModule],
            declarations: [TestApp]
        });

        TestBed.compileComponents();

        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();

        tabsGroup = fixture.debugElement.query(By.directive(McTabs));
        tabsItems = fixture.debugElement.queryAll(By.directive(McTab));
    }));

    it('should add and remove focus class on focus/blur', () => {
        const tab = tabsItems[0].nativeElement;

        expect(tab.classList).not.toContain('mc-focused');

        dispatchFakeEvent(tab, 'focus');
        fixture.detectChanges();
        expect(tab.className).toContain('mc-focused');

        dispatchFakeEvent(tab, 'blur');
        fixture.detectChanges();
        expect(tab.className).not.toContain('mc-focused');
    });
});


@Component({
    selector: 'test-app',
    template: `
        <mc-tabs-group>
            <mc-tab>1</mc-tab>
            <mc-tab>2</mc-tab>
            <mc-tab>3</mc-tab>
            <mc-tab>4</mc-tab>
        </mc-tabs-group>
    `
})
class TestApp {
}
