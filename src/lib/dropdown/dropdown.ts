import { AnimationEvent } from '@angular/animations';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    EventEmitter,
    Inject,
    InjectionToken,
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
import { FocusKeyManager, FocusOrigin } from '@ptsecurity/cdk/a11y';
import { Direction } from '@ptsecurity/cdk/bidi';
import { coerceBooleanProperty } from '@ptsecurity/cdk/coercion';
import { ESCAPE, LEFT_ARROW, RIGHT_ARROW, DOWN_ARROW, UP_ARROW } from '@ptsecurity/cdk/keycodes';
import { merge, Observable, Subject, Subscription } from 'rxjs';
import { startWith, switchMap, take } from 'rxjs/operators';

import { mcDropdownAnimations } from './dropdown-animations';
import { McDropdownContent } from './dropdown-content';
import { throwMcDropdownInvalidPositionX, throwMcDropdownInvalidPositionY } from './dropdown-errors';
import { McDropdownItem } from './dropdown-item';
import { MC_DROPDOWN_PANEL, McDropdownPanel } from './dropdown-panel';
import { DropdownPositionX, DropdownPositionY } from './dropdown-positions';


/** Default `mat-dropdown` options that can be overridden. */
// tslint:disable-next-line:interface-name
export interface McDropdownDefaultOptions {
    /** The x-axis position of the dropdown. */
    xPosition: DropdownPositionX;

    /** The y-axis position of the dropdown. */
    yPosition: DropdownPositionY;

    /** Whether the dropdown should overlap the dropdown trigger. */
    overlapTrigger: boolean;

    /** Class to be applied to the dropdown's backdrop. */
    backdropClass: string;

    /** Whether the dropdown has a backdrop. */
    hasBackdrop?: boolean;
}

/** Injection token to be used to override the default options for `mat-dropdown`. */
export const MC_DROPDOWN_DEFAULT_OPTIONS =
    new InjectionToken<McDropdownDefaultOptions>('mat-dropdown-default-options', {
        providedIn: 'root',
        factory: MC_DROPDOWN_DEFAULT_OPTIONS_FACTORY
    });

/** @docs-private */
export function MC_DROPDOWN_DEFAULT_OPTIONS_FACTORY(): McDropdownDefaultOptions {
    return {
        overlapTrigger: false,
        xPosition: 'after',
        yPosition: 'below',
        backdropClass: 'cdk-overlay-transparent-backdrop'
    };
}
/**
 * Start elevation for the dropdown panel.
 * @docs-private
 */
const MC_DROPDOWN_BASE_ELEVATION = 4;


@Component({
    // moduleId: module.id,
    selector: 'mc-dropdown',
    templateUrl: 'dropdown.html',
    styleUrls: ['dropdown.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    exportAs: 'mcDropdown',
    animations: [
        mcDropdownAnimations.transformMenu,
        mcDropdownAnimations.fadeInItems
    ],
    providers: [
        {provide: MC_DROPDOWN_PANEL, useExisting: McDropdown}
    ]
})
export class McDropdown implements AfterContentInit, McDropdownPanel<McDropdownItem>, OnInit, OnDestroy {

    /** Position of the dropdown in the X axis. */
    @Input()
    get xPosition(): DropdownPositionX { return this._xPosition; }
    set xPosition(value: DropdownPositionX) {
        if (value !== 'before' && value !== 'after') {
            throwMcDropdownInvalidPositionX();
        }
        this._xPosition = value;
        this.setPositionClasses();
    }

    /** Position of the dropdown in the Y axis. */
    @Input()
    get yPosition(): DropdownPositionY { return this._yPosition; }
    set yPosition(value: DropdownPositionY) {
        if (value !== 'above' && value !== 'below') {
            throwMcDropdownInvalidPositionY();
        }
        this._yPosition = value;
        this.setPositionClasses();
    }

    /** Whether the dropdown should overlap its trigger. */
    @Input()
    get overlapTrigger(): boolean { return this._overlapTrigger; }
    set overlapTrigger(value: boolean) {
        this._overlapTrigger = coerceBooleanProperty(value);
    }

    /** Whether the dropdown has a backdrop. */
    @Input()
    get hasBackdrop(): boolean | undefined { return this._hasBackdrop; }
    set hasBackdrop(value: boolean | undefined) {
        this._hasBackdrop = coerceBooleanProperty(value);
    }

    /**
     * This method takes classes set on the host mat-dropdown element and applies them on the
     * dropdown template that displays in the overlay container.  Otherwise, it's difficult
     * to style the containing dropdown from outside the component.
     * @param classes list of class names
     */
    @Input('class')
    set panelClass(classes: string) {
        if (classes && classes.length) {
            this._classList = classes.split(' ').reduce((obj: any, className: string) => {
                obj[className] = true;

                return obj;
            }, {});

            this._elementRef.nativeElement.className = '';
        }
    }

    /**
     * This method takes classes set on the host mat-dropdown element and applies them on the
     * dropdown template that displays in the overlay container.  Otherwise, it's difficult
     * to style the containing dropdown from outside the component.
     * @deprecated Use `panelClass` instead.
     * @breaking-change 8.0.0
     */
    @Input()
    get classList(): string { return this.panelClass; }
    set classList(classes: string) { this.panelClass = classes; }

    /** Config object to be passed into the dropdown's ngClass */
    _classList: {[key: string]: boolean} = {};

    /** Current state of the panel animation. */
    _panelAnimationState: 'void' | 'enter' = 'void';

    /** Emits whenever an animation on the dropdown completes. */
    _animationDone = new Subject<AnimationEvent>();

    /** Whether the dropdown is animating. */
    _isAnimating: boolean;

    /** Parent dropdown of the current dropdown panel. */
    parentMenu: McDropdownPanel | undefined;

    /** Layout direction of the dropdown. */
    direction: Direction;

    /** Class to be added to the backdrop element. */
    @Input() backdropClass: string = this._defaultOptions.backdropClass;

    /** @docs-private */
    @ViewChild(TemplateRef) templateRef: TemplateRef<any>;

    /**
     * List of the items inside of a dropdown.
     * @deprecated
     * @breaking-change 8.0.0
     */
    @ContentChildren(McDropdownItem) items: QueryList<McDropdownItem>;

    /**
     * Menu content that will be rendered lazily.
     * @docs-private
     */
    @ContentChild(McDropdownContent) lazyContent: McDropdownContent;

    /** Event emitted when the dropdown is closed. */
    @Output() readonly closed: EventEmitter<void | 'click' | 'keydown' | 'tab'> =
        new EventEmitter<void | 'click' | 'keydown' | 'tab'>();

    /**
     * Event emitted when the dropdown is closed.
     * @deprecated Switch to `closed` instead
     * @breaking-change 8.0.0
     */
    @Output() close = this.closed;
    private _keyManager: FocusKeyManager<McDropdownItem>;
    private _xPosition: DropdownPositionX = this._defaultOptions.xPosition;
    private _yPosition: DropdownPositionY = this._defaultOptions.yPosition;
    private _previousElevation: string;

    /** Menu items inside the current dropdown. */
    private _items: McDropdownItem[] = [];

    /** Emits whenever the amount of dropdown items changes. */
    private _itemChanges = new Subject<McDropdownItem[]>();

    /** Subscription to tab events on the dropdown panel */
    private _tabSubscription = Subscription.EMPTY;
    private _overlapTrigger: boolean = this._defaultOptions.overlapTrigger;
    private _hasBackdrop: boolean | undefined = this._defaultOptions.hasBackdrop;

    constructor(
        private _elementRef: ElementRef<HTMLElement>,
        private _ngZone: NgZone,
        @Inject(MC_DROPDOWN_DEFAULT_OPTIONS) private _defaultOptions: McDropdownDefaultOptions) { }

    ngOnInit() {
        this.setPositionClasses();
    }

    ngAfterContentInit() {
        // this._keyManager = new FocusKeyManager<McDropdownItem>(this._items[0]).withWrap().withTypeAhead();
        this._keyManager = new FocusKeyManager<McDropdownItem>(new QueryList<McDropdownItem>())
            .withWrap().withTypeAhead();
        this._tabSubscription = this._keyManager.tabOut.subscribe(() => this.closed.emit('tab'));
    }

    ngOnDestroy() {
        this._tabSubscription.unsubscribe();
        this.closed.complete();
    }

    /** Stream that emits whenever the hovered dropdown item changes. */
    _hovered(): Observable<McDropdownItem> {
        return this._itemChanges.pipe(
            startWith(this._items),
            switchMap((items) => merge(...items.map((item) => item._hovered)))
        );
    }

    /** Handle a keyboard event from the dropdown, delegating to the appropriate action. */
    _handleKeydown(event: KeyboardEvent) {
        // tslint:disable-next-line:deprecation
        const keyCode = event.keyCode;

        switch (keyCode) {
            case ESCAPE:
                this.closed.emit('keydown');
                break;
            case LEFT_ARROW:
                if (this.parentMenu && this.direction === 'ltr') {
                    this.closed.emit('keydown');
                }
                break;
            case RIGHT_ARROW:
                if (this.parentMenu && this.direction === 'rtl') {
                    this.closed.emit('keydown');
                }
                break;
            default:
                if (keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
                    this._keyManager.setFocusOrigin('keyboard');
                }

                this._keyManager.onKeydown(event);
        }
    }

    /**
     * Focus the first item in the dropdown.
     * @param origin Action from which the focus originated. Used to set the correct styling.
     */
    focusFirstItem(origin: FocusOrigin = 'program'): void {
        // When the content is rendered lazily, it takes a bit before the items are inside the DOM.
        if (this.lazyContent) {
            this._ngZone.onStable.asObservable()
                .pipe(take(1))
                .subscribe(() => this._keyManager.setFocusOrigin(origin).setFirstItemActive());
        } else {
            this._keyManager.setFocusOrigin(origin).setFirstItemActive();
        }
    }

    /**
     * Resets the active item in the dropdown. This is used when the dropdown is opened, allowing
     * the user to start from the first option when pressing the down arrow.
     */
    resetActiveItem() {
        this._keyManager.setActiveItem(-1);
    }

    /**
     * Sets the dropdown panel elevation.
     * @param depth Number of parent menus that come before the dropdown.
     */
    setElevation(depth: number): void {
        // The elevation starts at the base and increases by one for each level.
        const newElevation = `mat-elevation-z${MC_DROPDOWN_BASE_ELEVATION + depth}`;
        const customElevation = Object.keys(this._classList).find((c) => c.startsWith('mat-elevation-z'));

        if (!customElevation || customElevation === this._previousElevation) {
            if (this._previousElevation) {
                this._classList[this._previousElevation] = false;
            }

            this._classList[newElevation] = true;
            this._previousElevation = newElevation;
        }
    }

    /**
     * Registers a dropdown item with the dropdown.
     * @docs-private
     */
    addItem(item: McDropdownItem) {
        // We register the items through this method, rather than picking them up through
        // `ContentChildren`, because we need the items to be picked up by their closest
        // `mat-dropdown` ancestor. If we used `@ContentChildren(McDropdownItem, {descendants: true})`,
        // all descendant items will bleed into the top-level dropdown in the case where the consumer
        // has `mat-dropdown` instances nested inside each other.
        if (this._items.indexOf(item) === -1) {
            this._items.push(item);
            this._itemChanges.next(this._items);
        }
    }

    /**
     * Removes an item from the dropdown.
     * @docs-private
     */
    removeItem(item: McDropdownItem) {
        const index = this._items.indexOf(item);

        if (this._items.indexOf(item) > -1) {
            this._items.splice(index, 1);
            this._itemChanges.next(this._items);
        }
    }

    /**
     * Adds classes to the dropdown panel based on its position. Can be used by
     * consumers to add specific styling based on the position.
     * @param posX Position of the dropdown along the x axis.
     * @param posY Position of the dropdown along the y axis.
     * @docs-private
     */
    setPositionClasses(posX: DropdownPositionX = this.xPosition, posY: DropdownPositionY = this.yPosition) {
        const classes = this._classList;
        classes['mat-menu-before'] = posX === 'before';
        classes['mat-menu-after'] = posX === 'after';
        classes['mat-menu-above'] = posY === 'above';
        classes['mat-menu-below'] = posY === 'below';
    }

    /** Starts the enter animation. */
    _startAnimation() {
        // @breaking-change 8.0.0 Combine with _resetAnimation.
        this._panelAnimationState = 'enter';
    }

    /** Resets the panel animation to its initial state. */
    _resetAnimation() {
        // @breaking-change 8.0.0 Combine with _startAnimation.
        this._panelAnimationState = 'void';
    }

    /** Callback that is invoked when the panel animation completes. */
    _onAnimationDone(event: AnimationEvent) {
        this._animationDone.next(event);
        this._isAnimating = false;

        // Scroll the content element to the top once the animation is done. This is necessary, because
        // we move focus to the first item while it's still being animated, which can throw the browser
        // off when it determines the scroll position. Alternatively we can move focus when the
        // animation is done, however moving focus asynchronously will interrupt screen readers
        // which are in the process of reading out the dropdown already. We take the `element` from
        // the `event` since we can't use a `ViewChild` to access the pane.
        if (event.toState === 'enter' && this._keyManager.activeItemIndex === 0) {
            event.element.scrollTop = 0;
        }
    }
}
