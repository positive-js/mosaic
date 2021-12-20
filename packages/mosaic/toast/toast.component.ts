import { Component, Inject, ChangeDetectionStrategy, OnInit } from '@angular/core';

import { ContainerRef } from './container.ref';
import { ToastData, IToastConfig, TOAST_CONFIG_TOKEN } from './toast.type';


@Component({
    selector: 'mc-toast',
    templateUrl: './toast.component.html',
    styleUrls: ['./toast.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastComponent implements OnInit {
    index: number;
    private intervalId: number;

    constructor(
        readonly data: ToastData,
        readonly containerRef: ContainerRef,
        @Inject(TOAST_CONFIG_TOKEN) readonly toast: IToastConfig
    ) {
    }

    ngOnInit(): void {
        this.intervalId = setTimeout(() => {
            // this.close();
        }, this.toast.duration);
    }

    ngOnDestroy(): void {
        clearTimeout(this.intervalId);
    }

    close(): void {
        this.containerRef.close(this.index);
    }

}
