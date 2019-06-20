import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    ViewEncapsulation
} from '@angular/core';


/**
 * Button that will close the current sidepanel.
 */
@Component({
    selector: 'mc-sidebar',
    exportAs: 'mcSidebar',
    templateUrl: 'sidebar.component.html',
    styleUrls: ['./sidebar.css'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'mc-sidebar',
    }
})
export class McSidebar {
    constructor(
        private elementRef: ElementRef<HTMLElement>,
        private changeDetectorRef: ChangeDetectorRef
    ) {}
}
