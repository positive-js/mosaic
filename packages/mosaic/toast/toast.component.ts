import {
    Component,
    Inject,
    ChangeDetectionStrategy,
    OnInit
} from '@angular/core';
import { ThemePalette } from '@ptsecurity/mosaic/core';

import { ToastService } from './toast.service';
import { ToastData, IToastConfig, TOAST_CONFIG_TOKEN } from './toast.type';


let id = 0;

@Component({
    selector: 'mc-toast',
    templateUrl: './toast.component.html',
    styleUrls: ['./toast.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastComponent implements OnInit {
    themePalette = ThemePalette;

    id = id++;

    private intervalId: any;

    constructor(
        readonly data: ToastData,
        readonly service: ToastService,
        @Inject(TOAST_CONFIG_TOKEN) readonly toast: IToastConfig
    ) {}

    ngOnInit(): void {
        this.intervalId = setTimeout(
            () => this.close(),
            this.toast.duration
        );
    }

    ngOnDestroy(): void {
        clearTimeout(this.intervalId);
    }

    close(): void {
        this.service.hide(this.id);
    }
}
