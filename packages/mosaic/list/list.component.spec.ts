import { Component, QueryList, ViewChildren } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { McListItem, McListModule } from './index';


describe('McList', () => {

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [McListModule],
            declarations: [
                ListWithOneAnchorItem,
                ListWithOneItem,
                ListWithTwoLineItem,
                ListWithThreeLineItem,
                ListWithAvatar,
                ListWithItemWithCssClass,
                ListWithDynamicNumberOfLines,
                ListWithMultipleItems,
                ListWithManyLines
            ]
        });

        TestBed.compileComponents();
    }));

    it('should add and remove focus class on focus/blur', () => {
        const fixture = TestBed.createComponent(ListWithOneAnchorItem);
        fixture.detectChanges();
        const listItem = fixture.debugElement.query(By.directive(McListItem));
        const listItemEl = fixture.debugElement.query(By.css('.mc-list-item'));

        expect(listItemEl.nativeElement.classList).not.toContain('mc-list-item-focus');

        listItem.componentInstance.handleFocus();
        fixture.detectChanges();
        expect(listItemEl.nativeElement.classList).toContain('mc-focused');

        listItem.componentInstance.handleBlur();
        fixture.detectChanges();
        expect(listItemEl.nativeElement.classList).not.toContain('mc-list-item-focus');
    });

    it('should not apply any additional class to a list without lines', () => {
        const fixture = TestBed.createComponent(ListWithOneItem);
        const listItem = fixture.debugElement.query(By.css('mc-list-item'));
        fixture.detectChanges();
        expect(listItem.nativeElement.className).toBe('mc-list-item');
    });

    // it('should apply mc-2-line class to lists with two lines', () => {
    //     const fixture = TestBed.createComponent(ListWithTwoLineItem);
    //     fixture.detectChanges();
    //
    //     const listItems = fixture.debugElement.children[0].queryAll(By.css('mc-list-item'));
    //     expect(listItems[0].nativeElement.className).toContain('mc-2-line');
    //     expect(listItems[1].nativeElement.className).toContain('mc-2-line');
    // });

    // it('should apply mc-3-line class to lists with three lines', () => {
    //     const fixture = TestBed.createComponent(ListWithThreeLineItem);
    //     fixture.detectChanges();
    //
    //     const listItems = fixture.debugElement.children[0].queryAll(By.css('mc-list-item'));
    //     expect(listItems[0].nativeElement.className).toContain('mc-3-line');
    //     expect(listItems[1].nativeElement.className).toContain('mc-3-line');
    // });

    // it('should apply mc-multi-line class to lists with more than 3 lines', () => {
    //     const fixture = TestBed.createComponent(ListWithManyLines);
    //     fixture.detectChanges();
    //
    //     const listItems = fixture.debugElement.children[0].queryAll(By.css('mc-list-item'));
    //     expect(listItems[0].nativeElement.className).toContain('mc-multi-line');
    //     expect(listItems[1].nativeElement.className).toContain('mc-multi-line');
    // });

    it('should not clear custom classes provided by user', () => {
        const fixture = TestBed.createComponent(ListWithItemWithCssClass);
        fixture.detectChanges();

        const listItems = fixture.debugElement.children[0].queryAll(By.css('mc-list-item'));
        expect(listItems[0].nativeElement.classList.contains('test-class')).toBe(true);
    });

    // it('should update classes if number of lines change', () => {
    //     const fixture = TestBed.createComponent(ListWithDynamicNumberOfLines);
    //     fixture.debugElement.componentInstance.showThirdLine = false;
    //     fixture.detectChanges();
    //
    //     const listItem = fixture.debugElement.children[0].query(By.css('mc-list-item'));
    //     expect(listItem.nativeElement.classList.length).toBe(2);
    //     expect(listItem.nativeElement.classList).toContain('mc-2-line');
    //     expect(listItem.nativeElement.classList).toContain('mc-list-item');
    //
    //     fixture.debugElement.componentInstance.showThirdLine = true;
    //     fixture.detectChanges();
    //     expect(listItem.nativeElement.className).toContain('mc-3-line');
    // });

    it('should add aria roles properly', () => {
        const fixture = TestBed.createComponent(ListWithMultipleItems);
        fixture.detectChanges();

        const list = fixture.debugElement.children[0];
        const listItem = fixture.debugElement.children[0].query(By.css('mc-list-item'));
        expect(list.nativeElement.getAttribute('role')).toBeNull('Expect mc-list no role');
        expect(listItem.nativeElement.getAttribute('role')).toBeNull('Expect mc-list-item no role');
    });
});


class BaseTestList {
    items: any[] = [
        { name: 'Paprika', description: 'A seasoning' },
        { name: 'Pepper', description: 'Another seasoning' }
    ];

    showThirdLine: boolean = false;
}

@Component({
    template: `
        <mc-list>
            <a mc-list-item>
                Paprika
            </a>
        </mc-list>`
})
class ListWithOneAnchorItem extends BaseTestList {
    // This needs to be declared directly on the class; if declared on the BaseTestList superclass,
    // it doesn't get populated.
    @ViewChildren(McListItem) listItems: QueryList<McListItem>;
}

@Component({
    template: `
        <mc-list>
            <mc-list-item>
                Paprika
            </mc-list-item>
        </mc-list>`
})
class ListWithOneItem extends BaseTestList {}

@Component({
    template: `
        <mc-list>
            <mc-list-item *ngFor="let item of items">
                <img src="">
                <h3 mc-line>{{item.name}}</h3>
                <p mc-line>{{item.description}}</p>
            </mc-list-item>
        </mc-list>`
})
class ListWithTwoLineItem extends BaseTestList {}

@Component({
    template: `
        <mc-list>
            <mc-list-item *ngFor="let item of items">
                <h3 mc-line>{{item.name}}</h3>
                <p mc-line>{{item.description}}</p>
                <p mc-line>Some other text</p>
            </mc-list-item>
        </mc-list>`
})
class ListWithThreeLineItem extends BaseTestList {}

@Component({
    template: `
        <mc-list>
            <mc-list-item *ngFor="let item of items">
                <h3 mc-line>Line 1</h3>
                <p mc-line>Line 2</p>
                <p mc-line>Line 3</p>
                <p mc-line>Line 4</p>
            </mc-list-item>
        </mc-list>`
})
class ListWithManyLines extends BaseTestList {}

@Component({
    template: `
        <mc-list>
            <mc-list-item>
                <img src="" mc-list-avatar>
                Paprika
            </mc-list-item>
            <mc-list-item>
                Pepper
            </mc-list-item>
        </mc-list>`
})
class ListWithAvatar extends BaseTestList {}

@Component({
    template: `
        <mc-list>
            <mc-list-item class="test-class" *ngFor="let item of items">
                <h3 mc-line>{{item.name}}</h3>
                <p mc-line>{{item.description}}</p>
            </mc-list-item>
        </mc-list>`
})
class ListWithItemWithCssClass extends BaseTestList {}

@Component({
    template: `
        <mc-list>
            <mc-list-item *ngFor="let item of items">
                <h3 mc-line>{{item.name}}</h3>
                <p mc-line>{{item.description}}</p>
                <p mc-line *ngIf="showThirdLine">Some other text</p>
            </mc-list-item>
        </mc-list>`
})
class ListWithDynamicNumberOfLines extends BaseTestList {}

@Component({
    template: `
        <mc-list>
            <mc-list-item *ngFor="let item of items">
                {{item.name}}
            </mc-list-item>
        </mc-list>`
})
class ListWithMultipleItems extends BaseTestList {}
