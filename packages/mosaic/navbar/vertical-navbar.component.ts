import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    forwardRef,
    Input,
    QueryList,
    ViewEncapsulation
} from '@angular/core';
import {
    DOWN_ARROW,
    ENTER,
    isVerticalMovement,
    LEFT_ARROW,
    RIGHT_ARROW,
    SPACE,
    TAB,
    UP_ARROW
} from '@ptsecurity/cdk/keycodes';
import { Subject } from 'rxjs';

import {
    McNavbarBento,
    McNavbarItem,
    McNavbarRectangleElement
} from './navbar-item.component';
import { McFocusableComponent } from './navbar.component';
import { toggleVerticalNavbarAnimation } from './vertical-navbar.animation';


@Component({
    selector: 'mc-vertical-navbar',
    exportAs: 'McVerticalNavbar',
    template: `
        <div class="mc-vertical-navbar__container"
             [@toggle]="expanded"
             (@toggle.done)="animationDone.next()"
             [class.mc-collapsed]="!expanded"
             [class.mc-expanded]="expanded">

            <ng-content select="[mc-navbar-container], mc-navbar-container"></ng-content>
            <ng-content select="[mc-navbar-toggle], mc-navbar-toggle"></ng-content>
        </div>
    `,
    styleUrls: [
        './vertical-navbar.scss',
        './navbar-item.scss',
        './navbar-brand.scss',
        './navbar-divider.scss'
    ],
    host: {
        class: 'mc-vertical-navbar',
        '[attr.tabindex]': 'tabIndex',

        '(focus)': 'focus()',
        '(blur)': 'blur()',

        '(keydown)': 'onKeyDown($event)'
    },
    animations: [toggleVerticalNavbarAnimation()],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class McVerticalNavbar extends McFocusableComponent implements AfterContentInit {
    @ContentChildren(forwardRef(() => McNavbarRectangleElement), { descendants: true })
    rectangleElements: QueryList<McNavbarRectangleElement>;

    @ContentChildren(forwardRef(() => McNavbarItem), { descendants: true }) items: QueryList<McNavbarItem>;

    @ContentChild(forwardRef(() => McNavbarBento)) bento: McNavbarBento;

    readonly animationDone = new Subject<void>();

    @Input()
    get expanded() {
        return this._expanded;
    }

    set expanded(value: boolean) {
        this._expanded = coerceBooleanProperty(value);

        this.updateExpandedStateForItems();
    }

    private _expanded: boolean = false;

    constructor(changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);

        this.animationDone
            .subscribe(this.updateTooltipForItems);
    }

    ngAfterContentInit(): void {
        this.setItemsState();
        this.updateExpandedStateForItems();
        this.updateTooltipForItems();

        this.rectangleElements.changes
            .subscribe(this.setItemsState);

        super.ngAfterContentInit();

        this.keyManager.withVerticalOrientation(true);
    }

    toggle(): void {
        this.expanded = !this.expanded;

        this.changeDetectorRef.markForCheck();
    }

    onKeyDown(event: KeyboardEvent) {
        // tslint:disable-next-line: deprecation
        const keyCode = event.keyCode;

        if ([SPACE, ENTER, LEFT_ARROW, RIGHT_ARROW].includes(keyCode) || isVerticalMovement(event)) {
            event.preventDefault();
        }

        if (keyCode === TAB) {
            this.keyManager.tabOut.next();

            return;
        } else if (keyCode === DOWN_ARROW) {
            this.keyManager.setNextItemActive();
        } else if (keyCode === UP_ARROW) {
            this.keyManager.setPreviousItemActive();
        }
    }

    private updateExpandedStateForItems = () => {
        this.rectangleElements?.forEach((item) => {
            item.collapsed = !this.expanded;
            setTimeout(() => item.button?.updateClassModifierForIcons());
        });
    }

    private updateTooltipForItems = () => {
        this.items.forEach((item) => item.updateTooltip());
    }

    private setItemsState = () => {
        Promise.resolve()
            .then(() => this.rectangleElements?.forEach((item) => item.vertical = true));
    }
}
