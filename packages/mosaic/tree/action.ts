import { ChangeDetectionStrategy, Component, ContentChild, ViewEncapsulation } from '@angular/core';
import {
    mixinDisabled,
    mixinTabIndex
} from '@ptsecurity/mosaic/core';
import { McIcon } from '@ptsecurity/mosaic/icon';


@Component({
    selector: 'mc-tree-node-action',
    exportAs: 'mcTreeNodeAction',
    template: `
        <ng-container [ngSwitch]="!!customIcon">
            <i class="mc mc-icon mc-ellipsis_16" *ngSwitchCase="false"></i>
            <ng-content select="[mc-icon]" *ngSwitchCase="true"></ng-content>
        </ng-container>
        `,
    styleUrls: ['./action.scss'],
    host: {
        class: 'mc-tree-node-action',
        '[class.mc-opened]': 'false',

        '[attr.disabled]': 'disabled || null',
        '[attr.tabIndex]': '0',

        // '(click)': 'toggle($event)'
    },
    inputs: ['disabled'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McTreeNodeActionComponent extends mixinTabIndex(mixinDisabled(class {})) {
    @ContentChild(McIcon) customIcon: McIcon;
}
