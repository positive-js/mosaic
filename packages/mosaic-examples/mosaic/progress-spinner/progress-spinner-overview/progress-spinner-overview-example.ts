import { Component } from '@angular/core';


const INTERVAL: number = 300;
const STEP: number = 4;
const MAX_PERCENT: number = 100;

/**
 * @title Basic progress spinner
 */
@Component({
    selector: 'progress-spinner-overview-example',
    templateUrl: 'progress-spinner-overview-example.html',
    styleUrls: ['progress-spinner-overview-example.css']
})
export class ProgressSpinnerOverviewExample {
    percent: number = 0;
    intervalId: number;

    constructor() {
        setInterval(() => this.percent = (this.percent + STEP) % (MAX_PERCENT + STEP), INTERVAL);
    }

    ngOnDestroy() {
        clearInterval(this.intervalId);
    }
}
