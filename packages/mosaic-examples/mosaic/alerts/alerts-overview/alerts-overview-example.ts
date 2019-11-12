import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';


/**
 * @title Alerts
 */
@Component({
    selector: 'alerts-overview-example',
    templateUrl: 'alerts-overview-example.html',
    styleUrls: ['alerts-overview-example.css'],
    animations: [
        trigger('hideShowAnimator', [
            state('true' , style({ opacity: 1, display: '' })),
            state('false', style({ opacity: 0, display: 'none' })),
            transition('false => true', animate('.5s')),
            transition('true => false', animate('.2s'))
        ])
    ]
})
export class AlertsOverviewExample {
    alertsAmount = 16;
    readonly shownAlerts: number[]  = Array.from(Array(this.alertsAmount).keys());

    isAlertShown(id: number) {
        return this.shownAlerts.indexOf(id) !== -1;
    }

    hideAlert(id: number) {
        const index = this.shownAlerts.findIndex((alertId) => alertId === id);
        this.shownAlerts.splice(index, 1);
    }
}
