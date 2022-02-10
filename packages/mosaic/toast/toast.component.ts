import {
    ChangeDetectionStrategy,
    Component,
    TemplateRef,
    ViewEncapsulation
} from '@angular/core';
import { ThemePalette } from '@ptsecurity/mosaic/core';

import { mcToastAnimations } from './toast-animations';
import { ToastService } from './toast.service';
import { McToastData } from './toast.type';


let id = 0;

@Component({
    selector: 'mc-toast',
    templateUrl: './toast.component.html',
    styleUrls: ['./toast.component.scss'],
    host: {
        class: 'mc-toast',
        '[@state]': 'animationState'
    },
    animations: [
        mcToastAnimations.toastState
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class McToastComponent {
    themePalette = ThemePalette;

    animationState = 'void';

    id = id++;

    $implicit;

    get hasDismiss(): boolean {
        return this.data.hasDismiss === undefined ? true : this.data.hasDismiss;
    }

    constructor(
        readonly data: McToastData,
        readonly service: ToastService
    ) {
        this.$implicit = this;

        this.animationState = 'visible';
    }

    close(): void {
        this.service.hide(this.id);
    }

    isTemplateRef(value): boolean {
        return value instanceof TemplateRef;
    }
}
