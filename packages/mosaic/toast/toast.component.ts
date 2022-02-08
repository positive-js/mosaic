import {
    ChangeDetectionStrategy,
    Component,
    ViewEncapsulation
} from '@angular/core';
import { ThemePalette } from '@ptsecurity/mosaic/core';

import { ToastService } from './toast.service';
import { ToastData } from './toast.type';


let id = 0;

@Component({
    selector: 'mc-toast',
    templateUrl: './toast.component.html',
    styleUrls: ['./toast.component.scss'],
    host: {
        class: 'mc-toast'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class McToastComponent {
    themePalette = ThemePalette;

    id = id++;

    constructor(
        readonly data: ToastData,
        readonly service: ToastService
    ) {}

    close(): void {
        this.service.hide(this.id);
    }
}
