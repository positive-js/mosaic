import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation, NgModule, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { McProgressSpinnerModule } from '../../lib/progress-spinner/';


const INTERVAL: number = 300;
const STEP: number = 4;
const MAX_PERCENT: number = 100;

@Component({
    selector: 'app',
    template: require('./template.html'),
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./styles.scss']
})
export class ProgressSpinnerDemoComponent implements OnDestroy {
    mode: string = 'determinate';
    percent: number = 0;
    intervalId: number;

    constructor() {
        setInterval(() => {
            this.percent = (this.percent + STEP) % (MAX_PERCENT + STEP);
        }, INTERVAL);
    }

    ngOnDestroy() {
        clearInterval(this.intervalId);
    }
}


@NgModule({
    declarations: [
        ProgressSpinnerDemoComponent
    ],
    imports: [
        CommonModule,
        BrowserModule,
        McProgressSpinnerModule,
        FormsModule
    ],
    bootstrap: [
        ProgressSpinnerDemoComponent
    ]
})
export class ProgressSpinnerDemoModule {}

platformBrowserDynamic()
    .bootstrapModule(ProgressSpinnerDemoModule);

