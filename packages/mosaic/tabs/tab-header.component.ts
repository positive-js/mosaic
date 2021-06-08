import { Directionality } from '@angular/cdk/bidi';
import { Platform } from '@angular/cdk/platform';
import { ViewportRuler } from '@angular/cdk/scrolling';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    Inject,
    Input,
    NgZone,
    Optional,
    QueryList,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { ANIMATION_MODULE_TYPE } from '@angular/platform-browser/animations';

import { McInkBar } from './ink-bar.directive';
import { McPaginatedTabHeader } from './paginated-tab-header';
import { McTabLabelWrapper } from './tab-label-wrapper.directive';


/**
 * The directions that scrolling can go in when the header's tabs exceed the header width. 'After'
 * will scroll the header towards the end of the tabs list and 'before' will scroll towards the
 * beginning of the list.
 */
export type ScrollDirection = 'after' | 'before';


/**
 * The header of the tab group which displays a list of all the tabs in the tab group.
 * When the tabs list's width exceeds the width of the header container,
 * then arrows will be displayed to allow the user to scroll
 * left and right across the header.
 * @docs-private
 */
@Component({
    selector: 'mc-tab-header',
    templateUrl: 'tab-header.html',
    styleUrls: ['tab-header.scss'],
    inputs: ['selectedIndex'],
    outputs: ['selectFocusedIndex', 'indexFocused'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
    host: {
        class: 'mc-tab-header',
        '[class.mc-tab-header_vertical]': 'vertical',
        '[class.mc-tab-header__pagination-controls_enabled]': 'showPaginationControls',
        '[class.mc-tab-header_rtl]': 'getLayoutDirection() == \'rtl\''
    }
})
export class McTabHeader extends McPaginatedTabHeader {
    /** The index of the active tab. */
    @Input() vertical: boolean = false;

    @ContentChildren(McTabLabelWrapper, { descendants: false }) items: QueryList<McTabLabelWrapper>;
    @ViewChild(McInkBar, { static: true }) inkBar: McInkBar;
    @ViewChild('tabListContainer', { static: true }) tabListContainer: ElementRef;
    @ViewChild('tabList', { static: true }) tabList: ElementRef;
    @ViewChild('nextPaginator') nextPaginator: ElementRef<HTMLElement>;
    @ViewChild('previousPaginator') previousPaginator: ElementRef<HTMLElement>;

    constructor(
        elementRef: ElementRef,
        changeDetectorRef: ChangeDetectorRef,
        viewportRuler: ViewportRuler,
        ngZone: NgZone,
        platform: Platform,
        @Optional() dir: Directionality,
        @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string
    ) {
        super(elementRef, changeDetectorRef, viewportRuler, ngZone, platform, dir, animationMode);
    }

    itemSelected(event: KeyboardEvent) {
        event.preventDefault();
    }
}
