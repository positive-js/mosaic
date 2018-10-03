import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Host,
    HostBinding,
    Input,
    OnInit,
    Optional,
    Output
} from '@angular/core';
import { toBoolean } from '@ptsecurity/mosaic/core';

import { McLayoutComponent } from './layout.component';


@Component({
    selector: 'mc-sidebar',
    preserveWhitespaces: false,
    templateUrl: './sidebar.component.html',
    host: {
        '[class.mc-layout-sidebar]': 'true',
        '[class.mc-layout-sidebar-collapsed]': 'mcCollapsed',
        '[style.flex]': 'mcFlex',
        '[style.max-width.px]': 'mcWidth',
        '[style.min-width.px]': 'mcWidth',
        '[style.width.px]': 'mcWidth'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McSidebarComponent implements OnInit {

    @Input() _mcWidth = 200;
    @Input() mcCollapsedWidth = 80;

    @Input()
    set mcCollapsible(value: boolean) {
        this.collapsible = toBoolean(value);
    }

    get mcCollapsible(): boolean {
        return this.collapsible;
    }

    @Input()
    set mcCollapsed(value: boolean) {
        this.collapsed = toBoolean(value);
    }

    get mcCollapsed(): boolean {
        return this.collapsed;
    }

    @Output() mcCollapsedChange = new EventEmitter();

    private collapsed = false;
    private collapsible = false;

    get mcFlex(): string {
        if (this.mcCollapsed) {
            return `0 0 ${this.mcCollapsedWidth}px`;
        } else {
            return `0 0 ${this.mcWidth}px`;
        }
    }

    get mcWidth(): number {
        if (this.mcCollapsed) {
            return this.mcCollapsedWidth;
        } else {
            return this._mcWidth;
        }
    }

    constructor(
        @Optional() @Host() private mcLayoutComponent: McLayoutComponent) {
    }

    ngOnInit() {
        if (this.mcLayoutComponent) {
            this.mcLayoutComponent.hasSidebar = true;
        }
    }
}
