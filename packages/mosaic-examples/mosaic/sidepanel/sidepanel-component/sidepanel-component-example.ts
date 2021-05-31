import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MC_SIDEPANEL_DATA, McSidepanelPosition, McSidepanelService } from '@ptsecurity/mosaic/sidepanel';


/**
 * @title Template Modal
 */
@Component({
    selector: 'sidepanel-component-example',
    templateUrl: 'sidepanel-component-example.html',
    styleUrls: ['sidepanel-component-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class SidepanelComponentExample {
    constructor(private sidepanelService: McSidepanelService) {}

    openComponentSidepanel() {
        this.sidepanelService.open(SidepanelExampleCustomComponent, {
            position: McSidepanelPosition.Right,
            data: {
                openComponentSidepanel: () => { this.openComponentSidepanel(); }
            }
        });
    }
}

@Component({
    selector: 'example-sidepanel',
    template: `
    <mc-sidepanel-header [closeable]="true">
        Sidepanel Component Content
    </mc-sidepanel-header>
    <mc-sidepanel-body class="layout-padding">
        <div class="mc-subheading">Sidepanel Component Body</div>

        <div *ngFor="let item of array; index as i">
            {{ i + 1 }}
        </div>
    </mc-sidepanel-body>
    <mc-sidepanel-footer>
        <mc-sidepanel-actions align="right">
            <button mc-button [color]="'primary'" (click)="openComponentSidepanel()">
                <span>Open another sidepanel</span>
            </button>

            <button mc-button [color]="'second'" mc-sidepanel-close>
                <span>Close</span>
            </button>
        </mc-sidepanel-actions>
    </mc-sidepanel-footer>`,
    host: {
        class: 'layout-column flex sidepanel-container'
    }
})
export class SidepanelExampleCustomComponent {
    openComponentSidepanel: () => void;

    array = new Array(60); // tslint:disable-line

    constructor(@Inject(MC_SIDEPANEL_DATA) public data: any) {
        this.openComponentSidepanel = data.openComponentSidepanel;
    }
}
