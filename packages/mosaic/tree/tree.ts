import {
    ChangeDetectionStrategy,
    Component,
    ViewEncapsulation
} from '@angular/core';

import { McTreeBase } from './tree-base';


@Component({
    selector: 'mc-tree',
    exportAs: 'mcTree',
    template: `<ng-container mcTreeNodeOutlet></ng-container>`,
    styleUrls: ['./tree.scss'],
    host: {
        class: 'mc-tree'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class McTree extends McTreeBase<any> {}
