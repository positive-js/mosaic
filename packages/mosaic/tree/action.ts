import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { McButton } from '@ptsecurity/mosaic/button';


@Component({
    selector: '[mc-tree-node-action]',
    exportAs: 'mcTreeNodeAction',
    template: `
        <div class="mc-button-wrapper">
            <ng-content></ng-content>

            <i class="mc mc-icon mc-ellipsis_16"></i>
        </div>
        <div class="mc-button-overlay"></div>`,
    styleUrls: ['./action.scss'],
    host: {
        class: 'mc-tree-node-action mc-button_transparent',
        // '[class.mc-opened]': 'iconState',

        '[attr.disabled]': 'disabled || null',
        '[attr.tabIndex]': '0',

        // '(click)': 'toggle($event)'
    },
    inputs: ['disabled'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McTreeNodeActionComponent extends McButton {

}
