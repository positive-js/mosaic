import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';


@Component({
    selector: 'mc-layout',
    preserveWhitespaces: false,
    styleUrls: ['layout.css'],
    templateUrl: './layout.component.html',
    host: {
        '[class.mc-layout]': 'true',
        '[class.mc-layout-has-sidebar]': 'hasSidebar'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McLayoutComponent {
    hasSidebar = false;
}
