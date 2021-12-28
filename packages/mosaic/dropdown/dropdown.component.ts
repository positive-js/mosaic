import { AnimationEvent } from '@angular/animations';
import { FocusOrigin } from '@angular/cdk/a11y';
import { Direction } from '@angular/cdk/bidi';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { DOWN_ARROW, UP_ARROW } from '@angular/cdk/keycodes';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    NgZone,
    OnDestroy,
    Output,
    TemplateRef,
    QueryList,
    ViewChild,
    ViewEncapsulation,
    OnInit
} from '@angular/core';
import { FocusKeyManager } from '@ptsecurity/cdk/a11y';
import { ESCAPE, LEFT_ARROW, RIGHT_ARROW } from '@ptsecurity/cdk/keycodes';
import { merge, Observable, Subject, Subscription } from 'rxjs';
import { startWith, switchMap, take } from 'rxjs/operators';

import { mcDropdownAnimations } from './dropdown-animations';
import { McDropdownContent } from './dropdown-content.directive';
import { throwMcDropdownInvalidPositionX, throwMcDropdownInvalidPositionY } from './dropdown-errors';
import { McDropdownItem } from './dropdown-item.component';
import {
    DropdownPositionX,
    DropdownPositionY,
    MC_DROPDOWN_DEFAULT_OPTIONS,
    MC_DROPDOWN_PANEL,
    McDropdownDefaultOptions,
    McDropdownPanel
} from './dropdown.types';


@Component({
    selector: 'mc-dropdown',
    exportAs: 'mcDropdown',
    templateUrl: 'dropdown.html',
    styleUrls: ['dropdown.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    animations: [
        mcDropdownAnimations.transformDropdown,
        mcDropdownAnimations.fadeInItems
    ],
    providers: [
        { provide: MC_DROPDOWN_PANEL, useExisting: McDropdown }
    ]
})
export class McDropdown implements AfterContentInit, McDropdownPanel, OnInit, OnDestroy {

    @Input() navigationWithWrap: boolean = false;

    /** Position of the dropdown in the X axis. */
    @Input()
    get xPosition(): DropdownPositionX {
        return this._xPosition;
    }

    set xPosition(value: DropdownPositionX) {
        if (value !== 'before' && value !== 'after') {
            throwMcDropdownInvalidPositionX();
        }
        this._xPosition = value;
        this.setPositionClasses();
    }

    /** Position of the dropdown in the Y axis. */
    @Input()
    get yPosition(): DropdownPositionY {
        return this._yPosition;
    }

    set yPosition(value: DropdownPositionY) {
        if (value !== 'above' && value !== 'below') {
            throwMcDropdownInvalidPositionY();
        }
        this._yPosition = value;
        this.setPositionClasses();
    }

    /** Whether the dropdown should overlap its trigger vertically. */
    @Input()
    get overlapTriggerY(): boolean {
        return this._overlapTriggerY;
    }

    set overlapTriggerY(value: boolean) {
        this._overlapTriggerY = coerceBooleanProperty(value);
    }

    /** Whether the dropdown should overlap its trigger horizontally. */
    @Input()
    get overlapTriggerX(): boolean {
        return this._overlapTriggerX;
    }

    set overlapTriggerX(value: boolean) {
        this._overlapTriggerX = coerceBooleanProperty(value);
    }

    /** Whether the dropdown has a backdrop. */
    @Input()
    get hasBackdrop(): boolean {
        return this._hasBackdrop;
    }

    set hasBackdrop(value: boolean) {
        this._hasBackdrop = coerceBooleanProperty(value);
    }

    /**
     * This method takes classes set on the host mc-dropdown element and applies them on the
     * dropdown template that displays in the overlay container.  Otherwise, it's difficult
     * to style the containing dropdown from outside the component.
     * @param classes list of class names
     */
    @Input('class')
    set panelClass(classes: string) {
        const previousPanelClass = this.previousPanelClass;

        if (previousPanelClass && previousPanelClass.length) {
            previousPanelClass
                .split(' ')
                .forEach((className: string) => this.classList[className] = false);
        }

        this.previousPanelClass = classes;

        if (classes?.length) {
            classes
                .split(' ')
                .forEach((className: string) => this.classList[className] = true);

            this.elementRef.nativeElement.className = '';
        }
    }

    private _xPosition: DropdownPositionX = this.defaultOptions.xPosition;
    private _yPosition: DropdownPositionY = this.defaultOptions.yPosition;
    private _overlapTriggerX: boolean = this.defaultOptions.overlapTriggerX;
    private _overlapTriggerY: boolean = this.defaultOptions.overlapTriggerY;
    private _hasBackdrop: boolean = this.defaultOptions.hasBackdrop;

    triggerWidth: string = '';
    /** Config object to be passed into the dropdown's ngClass */
    classList: { [key: string]: boolean } = {};

    /** Current state of the panel animation. */
    panelAnimationState: 'void' | 'enter' = 'void';

    /** Emits whenever an animation on the dropdown completes. */
    animationDone = new Subject<AnimationEvent>();

    /** Whether the dropdown is animating. */
    isAnimating: boolean;

    /** Parent dropdown of the current dropdown panel. */
    parent: McDropdownPanel | undefined;

    /** Layout direction of the dropdown. */
    direction: Direction;

    /** Class to be added to the backdrop element. */
    @Input() backdropClass: string = this.defaultOptions.backdropClass;

    /** @docs-private */
    @ViewChild(TemplateRef, { static: false }) templateRef: TemplateRef<any>;

    /**
     * List of the items inside of a dropdown.
     */
    @ContentChildren(McDropdownItem, { descendants: true }) items: QueryList<McDropdownItem>;

    /**
     * Dropdown content that will be rendered lazily.
     * @docs-private
     */
    @ContentChild(McDropdownContent, { static: false }) lazyContent: McDropdownContent;

    /** Event emitted when the dropdown is closed. */
    @Output() readonly closed = new EventEmitter<void | 'click' | 'keydown' | 'tab'>();

    private previousPanelClass: string;

    private keyManager: FocusKeyManager<McDropdownItem>;

    /** Only the direct descendant menu items. */
    private directDescendantItems = new QueryList<McDropdownItem>();

    /** Subscription to tab events on the dropdown panel */
    private tabSubscription = Subscription.EMPTY;

    constructor(
        private elementRef: ElementRef<HTMLElement>,
        private ngZone: NgZone,
        @Inject(MC_DROPDOWN_DEFAULT_OPTIONS) private defaultOptions: McDropdownDefaultOptions) { }

    ngOnInit() {
        this.setPositionClasses();
    }

    ngAfterContentInit() {
        this.updateDirectDescendants();

        this.keyManager = new FocusKeyManager<McDropdownItem>(this.directDescendantItems)
            .withTypeAhead();

        if (this.navigationWithWrap) {
            this.keyManager.withWrap();
        }

        this.tabSubscription = this.keyManager.tabOut
            .subscribe(() => this.closed.emit('tab'));

        // If a user manually (programmatically) focuses a menu item, we need to reflect that focus
        // change back to the key manager. Note that we don't need to unsubscribe here because focused
        // is internal and we know that it gets completed on destroy.
        this.directDescendantItems.changes
            .pipe(
                startWith(this.directDescendantItems),
                switchMap((items) => merge(...items.map((item: McDropdownItem) => item.focused)))
            )
            .subscribe((focusedItem) => this.keyManager.updateActiveItem(focusedItem as McDropdownItem));
    }

    ngOnDestroy() {
        this.directDescendantItems.destroy();
        this.tabSubscription.unsubscribe();
        this.closed.complete();
    }

    /** Stream that emits whenever the hovered dropdown item changes. */
    hovered(): Observable<McDropdownItem> {
        const itemChanges = this.directDescendantItems.changes as Observable<QueryList<McDropdownItem>>;

        return itemChanges.pipe(
            startWith(this.directDescendantItems),
            switchMap((items) => merge(...items.map((item: McDropdownItem) => item.hovered)))
        ) as Observable<McDropdownItem>;
    }

    /** Handle a keyboard event from the dropdown, delegating to the appropriate action. */
    handleKeydown(event: KeyboardEvent) {
        // tslint:disable-next-line:deprecation
        const keyCode = event.keyCode;


        switch (keyCode) {
            case ESCAPE:
                this.closed.emit('keydown');
                break;
            case LEFT_ARROW:
                if (this.parent && this.direction === 'ltr') {
                    this.closed.emit('keydown');
                }
                break;
            case RIGHT_ARROW:
                if (this.parent && this.direction === 'rtl') {
                    this.closed.emit('keydown');
                }
                break;
            default:
                if (keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
                    this.keyManager.setFocusOrigin('keyboard');
                }

                this.keyManager.onKeydown(event);

                return;
        }

        // Don't allow the event to propagate if we've already handled it, or it may
        // end up reaching other overlays that were opened earlier.
        event.stopPropagation();
    }

    /**
     * Focus the first item in the dropdown.
     * @param origin Action from which the focus originated. Used to set the correct styling.
     */
    focusFirstItem(origin: FocusOrigin = 'program'): void {
        // When the content is rendered lazily, it takes a bit before the items are inside the DOM.
        if (this.lazyContent) {
            this.ngZone.onStable
                .pipe(take(1))
                .subscribe(() => this.keyManager.setFocusOrigin(origin).setFirstItemActive());
        } else {
            this.keyManager.setFocusOrigin(origin).setFirstItemActive();
        }
    }

    /**
     * Resets the active item in the dropdown. This is used when the dropdown is opened, allowing
     * the user to start from the first option when pressing the down arrow.
     */
    resetActiveItem() {
        this.keyManager.activeItem?.resetStyles();
        this.keyManager.setActiveItem(-1);
    }

    /**
     * Adds classes to the dropdown panel based on its position. Can be used by
     * consumers to add specific styling based on the position.
     * @param posX Position of the dropdown along the x axis.
     * @param posY Position of the dropdown along the y axis.
     * @docs-private
     */
    setPositionClasses(posX: DropdownPositionX = this.xPosition, posY: DropdownPositionY = this.yPosition) {
        const classes = this.classList;
        classes['mc-dropdown-before'] = posX === 'before';
        classes['mc-dropdown-after'] = posX === 'after';
        classes['mc-dropdown-above'] = posY === 'above';
        classes['mc-dropdown-below'] = posY === 'below';
    }

    /** Starts the enter animation. */
    startAnimation() {
        this.panelAnimationState = 'enter';
    }

    /** Resets the panel animation to its initial state. */
    resetAnimation() {
        this.panelAnimationState = 'void';
    }

    /** Callback that is invoked when the panel animation completes. */
    onAnimationDone(event: AnimationEvent) {
        this.animationDone.next(event);
        this.isAnimating = false;
    }

    onAnimationStart(event: AnimationEvent) {
        this.isAnimating = true;

        // Scroll the content element to the top as soon as the animation starts. This is necessary,
        // because we move focus to the first item while it's still being animated, which can throw
        // the browser off when it determines the scroll position. Alternatively we can move focus
        // when the animation is done, however moving focus asynchronously will interrupt screen
        // readers which are in the process of reading out the dropdown already. We take the `element`
        // from the `event` since we can't use a `ViewChild` to access the pane.
        if (event.toState === 'enter' && this.keyManager.activeItemIndex === 0) {
            event.element.scrollTop = 0;
        }
    }

    close() {
        const focusOrigin = this.keyManager.getFocusOrigin() === 'keyboard' ? 'keydown' : 'click';

        this.closed.emit(focusOrigin);
    }

    /**
     * Sets up a stream that will keep track of any newly-added menu items and will update the list
     * of direct descendants. We collect the descendants this way, because `_allItems` can include
     * items that are part of child menus, and using a custom way of registering items is unreliable
     * when it comes to maintaining the item order.
     */
    private updateDirectDescendants() {
        this.items.changes
            .pipe(startWith(this.items))
            .subscribe((items: QueryList<McDropdownItem>) => {
                this.directDescendantItems.reset(items.filter((item) => item.parentDropdownPanel === this));
                this.directDescendantItems.notifyOnChanges();
            });
    }
}
